"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useSTT() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      // Clean up any existing recorder
      if (mediaRecorderRef.current) {
        const existingRecorder = mediaRecorderRef.current;
        if (existingRecorder.state !== 'inactive') {
          existingRecorder.stop();
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

      recorder.start();
      setIsRecording(true);
    } catch {
      throw new Error("Microphone access denied");
    }
  }, []);

  const stopRecording = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        // If no recorder, ensure states are reset and reject
        setIsRecording(false);
        setIsTranscribing(false);
        return reject("No active recording");
      }

      // Check actual recorder state instead of React state
      if (recorder.state !== 'recording') {
        return reject("Not recording");
      }

      recorder.onstop = async () => {
        const stream = recorder.stream;
        stream.getTracks().forEach((t) => t.stop());
        
        // Clear the recorder reference
        mediaRecorderRef.current = null;
        setIsRecording(false);
        setIsTranscribing(true);

        try {
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
        }
      };

      recorder.stop();
    });
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    };
  }, []);

  return { isRecording, isTranscribing, startRecording, stopRecording };
}
