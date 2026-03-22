"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useSTT() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopInProgressRef = useRef(false);

  const startRecording = useCallback(async () => {
    try {
      // Clean up any existing recorder first
      if (mediaRecorderRef.current) {
        const existingRecorder = mediaRecorderRef.current;
        if (existingRecorder.state !== 'inactive') {
          existingRecorder.stop();
        }
        // Stop all tracks to ensure clean state
        try {
          const stream = existingRecorder.stream;
          if (stream) {
            stream.getTracks().forEach((t) => t.stop());
          }
        } catch (e) {
          // Ignore stream cleanup errors
        }
        mediaRecorderRef.current = null;
      }
      
      // Reset states
      setIsRecording(false);
      setIsTranscribing(false);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // Handle unexpected recorder stops
      recorder.onstop = () => {
        // Only reset if this is still the active recorder AND we're not in controlled stop
        if (mediaRecorderRef.current === recorder && !stopInProgressRef.current) {
          setIsRecording(false);
          mediaRecorderRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      // Ensure clean state on error
      setIsRecording(false);
      mediaRecorderRef.current = null;
      if (err instanceof Error && err.name === 'NotAllowedError') {
        throw new Error("Microphone access denied");
      }
      throw new Error("Failed to start recording");
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      
      // Check if we have a recorder and it's in a valid state
      if (!recorder) {
        // If no recorder, ensure states are reset and resolve with empty string
        setIsRecording(false);
        setIsTranscribing(false);
        return resolve("");
      }

      // Check actual recorder state
      if (recorder.state === 'inactive') {
        setIsRecording(false);
        return resolve("");
      }

      // Set flag to prevent race condition with unexpected onstop
      stopInProgressRef.current = true;

      // Set up the stop handler before calling stop() to avoid race conditions
      recorder.onstop = async () => {
        try {
          const stream = recorder.stream;
          stream.getTracks().forEach((t) => t.stop());
          
          // Clear the recorder reference
          mediaRecorderRef.current = null;
          setIsRecording(false);
          setIsTranscribing(true);

          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", blob, "audio.webm");

          const res = await fetch("/api/stt", { method: "POST", body: formData });
          const data = await res.json();

          if (!res.ok) throw new Error(data.error || "Transcription failed");
          resolve(data.text || "");
        } catch (err: unknown) {
          reject(err instanceof Error ? err.message : "Transcription error");
        } finally {
          setIsTranscribing(false);
          // Clear chunks for next recording
          chunksRef.current = [];
          // Reset stop flag
          stopInProgressRef.current = false;
        }
      };

      // Stop the recorder
      try {
        recorder.stop();
      } catch (err) {
        // If stop fails, clean up and reject
        setIsRecording(false);
        mediaRecorderRef.current = null;
        stopInProgressRef.current = false;
        reject(err instanceof Error ? err.message : "Failed to stop recording");
      }
    });
  }, []);

  // Safe stop function that doesn't reject when no recording is active
  const stopRecordingIfActive = useCallback((): Promise<string> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      setIsRecording(false);
      setIsTranscribing(false);
      return Promise.resolve("");
    }
    return stopRecording();
  }, [stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    };
  }, []);

  return { isRecording, isTranscribing, startRecording, stopRecording, stopRecordingIfActive };
}
