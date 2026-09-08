"use client";

import React, { useState } from "react";
import { Mic, Loader2, Square, X, Check } from "lucide-react";
import { LiveWaveform } from "@/modules/ai/waveform";
import { useVoiceInput } from "@/modules/ai/useVoiceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface VoiceInputBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Standalone Voice Input Bar with text input, live waveform visualizer, and Groq STT
 */
export function VoiceInputBar({
  value = "",
  onChange,
  onSubmit,
  placeholder = "Type or use voice...",
  className,
  disabled = false,
}: VoiceInputBarProps) {
  const [internalInput, setInternalInput] = useState(value);
  const currentVal = onChange ? value : internalInput;

  const handleTranscript = (text: string) => {
    const updated = currentVal ? `${currentVal} ${text}` : text;
    if (onChange) {
      onChange(updated);
    } else {
      setInternalInput(updated);
    }
  };

  const {
    isRecording,
    isTranscribing,
    formattedDuration,
    toggleRecording,
    cancelRecording,
    stopRecording,
  } = useVoiceInput({
    onTranscript: handleTranscript,
  });

  const isActive = isRecording || isTranscribing;

  return (
    <div className={cn("relative flex items-center gap-2 w-full", className)}>
      {isActive ? (
        <div className="flex items-center gap-3 w-full bg-sidebar border border-indigo-500/30 rounded-xl px-3 py-2 animate-in fade-in duration-200 shadow-inner">
          <div className="flex items-center gap-2">
            {isTranscribing ? (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            ) : (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
            <span className="text-xs font-mono text-neutral-300 min-w-[36px]">
              {isTranscribing ? "Processing..." : formattedDuration}
            </span>
          </div>

          {/* Waveform Visualization */}
          <div className="flex-1 h-8 flex items-center overflow-hidden">
            <LiveWaveform
              active={isRecording}
              processing={isTranscribing}
              mode="static"
              height={28}
              barWidth={3}
              barGap={2}
              barColor={isRecording ? "#818cf8" : "#34d399"}
              className="w-full"
            />
          </div>

          {/* Cancel & Done Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={cancelRecording}
              disabled={isTranscribing}
              className="h-7 w-7 text-neutral-400 hover:text-red-400 hover:bg-neutral-800/60 rounded-lg cursor-pointer"
              title="Cancel recording"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={stopRecording}
              disabled={isTranscribing}
              className="h-7 w-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
              title="Done & Transcribe"
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Input
            type="text"
            value={currentVal}
            onChange={(e) => {
              if (onChange) onChange(e.target.value);
              else setInternalInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSubmit && currentVal.trim()) {
                onSubmit(currentVal);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 h-11 bg-sidebar rounded-xl border border-border"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleRecording}
            disabled={disabled}
            className="h-11 w-11 rounded-xl text-neutral-300 hover:text-white cursor-pointer shrink-0"
            title="Start voice recording"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}

/**
 * Embedded Voice Waveform Bar for overlays (like Kaya bottom bar)
 */
export function EmbeddedVoiceWaveform({
  isRecording,
  isTranscribing,
  formattedDuration,
  onCancel,
  onStop,
}: {
  isRecording: boolean;
  isTranscribing: boolean;
  formattedDuration: string;
  onCancel: () => void;
  onStop: () => void;
}) {
  return (
    <div className="flex items-center gap-3 w-full h-12 bg-neutral-900/95 backdrop-blur-md border border-indigo-500/40 rounded-xl px-3 shadow-lg animate-in fade-in duration-200">
      <div className="flex items-center gap-2 shrink-0">
        {isTranscribing ? (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
        ) : (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
        <span className="text-[11px] font-mono text-neutral-300">
          {isTranscribing ? "Transcribing..." : formattedDuration}
        </span>
      </div>

      <div className="flex-1 h-8 flex items-center overflow-hidden">
        <LiveWaveform
          active={isRecording}
          processing={isTranscribing}
          mode="static"
          height={28}
          barWidth={3}
          barGap={2}
          barColor={isRecording ? "#818cf8" : "#34d399"}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isTranscribing}
          className="h-7 w-7 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg cursor-pointer"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={onStop}
          disabled={isTranscribing}
          className="h-7 w-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer shadow-sm"
          title="Finish & Transcribe"
        >
          <Check className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
