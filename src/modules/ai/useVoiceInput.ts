"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

export interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: Error | string) => void;
}

export function useVoiceInput(options?: UseVoiceInputOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isCancelledRef = useRef(false);

  // Timer counter when recording
  useEffect(() => {
    if (isRecording) {
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  const cancelRecording = useCallback(() => {
    isCancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("Error stopping media recorder on cancel:", err);
      }
    }
    cleanupStream();
    audioChunksRef.current = [];
    setIsRecording(false);
    setIsTranscribing(false);
    setDuration(0);
  }, [cleanupStream]);

  const sendAudioForTranscription = useCallback(
    async (audioBlob: Blob): Promise<string | null> => {
      setIsTranscribing(true);
      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");

        const res = await fetch("/api/stt", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const errMsg = data.error || `Server responded with status ${res.status}`;
          throw new Error(errMsg);
        }

        const text = (data.text || "").trim();
        if (text && options?.onTranscript) {
          options.onTranscript(text);
        }
        return text;
      } catch (err: any) {
        const msg = err?.message || "Failed to transcribe audio";
        setError(msg);
        toast.error(`Voice STT Error: ${msg}`);
        if (options?.onError) {
          options.onError(err);
        }
        return null;
      } finally {
        setIsTranscribing(false);
      }
    },
    [options]
  );

  const startRecording = useCallback(async () => {
    setError(null);
    isCancelledRef.current = false;

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      const msg = "Microphone is not supported in this browser.";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        cleanupStream();
        if (isCancelledRef.current) {
          audioChunksRef.current = [];
          return;
        }

        if (audioChunksRef.current.length === 0) {
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        audioChunksRef.current = [];

        await sendAudioForTranscription(audioBlob);
      };

      mediaRecorder.start(250); // Collect chunk every 250ms
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      const msg =
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Microphone access was denied. Please allow microphone permissions."
          : err?.message || "Failed to access microphone.";
      setError(msg);
      toast.error(msg);
      if (options?.onError) {
        options.onError(err);
      }
      cleanupStream();
      setIsRecording(false);
    }
  }, [cleanupStream, options, sendAudioForTranscription]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("Error stopping recorder:", err);
      }
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(async () => {
    if (isTranscribing) return;
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, isTranscribing, startRecording, stopRecording]);

  const formattedDuration = `${String(Math.floor(duration / 60)).padStart(
    2,
    "0"
  )}:${String(duration % 60).padStart(2, "0")}`;

  return {
    isRecording,
    isTranscribing,
    duration,
    formattedDuration,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  };
}
