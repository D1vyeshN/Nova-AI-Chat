"use client";

import { useState, useEffect } from "react";
import { Voice } from "@/types";

const STORAGE_KEY = "nova-ai-voice-settings";

const defaultSettings: Voice | undefined = undefined;

export function useLocalStorage() {
  const [selectedVoice, setSelectedVoice] = useState<Voice | undefined>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load voice from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedVoice = JSON.parse(stored);
        setSelectedVoice(parsedVoice);
      }
    } catch (error) {
      console.error("Failed to load voice from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save voice to localStorage whenever it changes
  const updateVoice = (voice: Voice | undefined) => {
    setSelectedVoice(voice);
    try {
      if (voice) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(voice));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save voice to localStorage:", error);
    }
  };

  // Clear voice selection
  const clearVoice = () => {
    setSelectedVoice(defaultSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear voice from localStorage:", error);
    }
  };

  return {
    selectedVoice,
    updateVoice,
    clearVoice,
    isLoaded,
  };
}
