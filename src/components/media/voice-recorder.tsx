"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDuration, VOICE_NOTE_MAX_SECONDS } from "@/lib/media";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { MicIcon, StopIcon, TrashIcon, UploadIcon } from "../ui/icons";
import { AudioPlayer } from "./audio-player";

type State =
  | { phase: "idle" }
  | { phase: "recording"; startedAt: number }
  | { phase: "preview"; blob: Blob; url: string; seconds: number }
  | { phase: "saving"; blob: Blob; url: string; seconds: number };

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

/**
 * Voice-note recorder: MediaRecorder with a live timer, a hard 60s cap, a
 * review step, and an audio-file upload fallback for browsers without
 * MediaRecorder (or users who denied the mic).
 */
export function VoiceRecorder({
  onSave,
  maxSeconds = VOICE_NOTE_MAX_SECONDS,
  saveLabel = "Use this voice note",
  compact = false,
  prompt = "Record a voice note",
}: {
  onSave: (blob: Blob, seconds: number) => Promise<void> | void;
  maxSeconds?: number;
  saveLabel?: string;
  compact?: boolean;
  prompt?: string;
}) {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia);
  }, []);

  const cleanupStream = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => cleanupStream, [cleanupStream]);

  // Revoke preview object URLs when replaced.
  const previewUrl = state.phase === "preview" || state.phase === "saving" ? state.url : null;
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 64_000 } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];
      const startedAt = performance.now();

      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const seconds = Math.min(maxSeconds, (performance.now() - startedAt) / 1000);
        cleanupStream();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
        if (blob.size === 0 || seconds < 0.8) {
          setState({ phase: "idle" });
          setError("That was a bit short — hold on and try again.");
          return;
        }
        setState({ phase: "preview", blob, url: URL.createObjectURL(blob), seconds });
      };

      recorder.start(250);
      setElapsed(0);
      setState({ phase: "recording", startedAt });
      navigator.vibrate?.(15);
      timerRef.current = window.setInterval(() => {
        const s = (performance.now() - startedAt) / 1000;
        setElapsed(s);
        if (s >= maxSeconds) recorder.state === "recording" && recorder.stop();
      }, 100);
    } catch (e) {
      cleanupStream();
      const denied = e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "SecurityError");
      setError(denied ? "Microphone access was blocked. Allow it in your browser, or upload an audio file." : "Couldn't start recording on this device. Try uploading an audio file instead.");
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const url = URL.createObjectURL(file);
    const seconds = await new Promise<number>((resolve) => {
      const a = new Audio();
      a.preload = "metadata";
      a.onloadedmetadata = () => resolve(Number.isFinite(a.duration) ? a.duration : 0);
      a.onerror = () => resolve(0);
      a.src = url;
    });
    if (seconds > maxSeconds + 1) {
      URL.revokeObjectURL(url);
      setError(`Voice notes can be up to ${maxSeconds} seconds.`);
      return;
    }
    setState({ phase: "preview", blob: file, url, seconds });
  };

  const save = async () => {
    if (state.phase !== "preview") return;
    setState({ ...state, phase: "saving" });
    try {
      await onSave(state.blob, Math.round(state.seconds * 100) / 100);
      setState({ phase: "idle" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the voice note");
      setState({ ...state, phase: "preview" });
    }
  };

  const remaining = Math.max(0, maxSeconds - elapsed);
  const pct = Math.min(100, (elapsed / maxSeconds) * 100);

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {state.phase === "idle" && (
        <div className={cn("flex flex-wrap items-center gap-2", !compact && "flex-col sm:flex-row")}>
          {supported && (
            <Button variant="primary" size={compact ? "md" : "lg"} onClick={start} className={cn(!compact && "w-full sm:w-auto")}>
              <MicIcon /> {prompt}
            </Button>
          )}
          <Button variant={supported ? "ghost" : "secondary"} size="md" onClick={() => fileRef.current?.click()}>
            <UploadIcon /> {supported ? "Upload audio" : "Upload an audio file"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="sr-only"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {state.phase === "recording" && (
        <div className="rounded-2xl bg-ink p-4 text-white" aria-live="polite">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={stop}
              aria-label="Stop recording"
              className="grid size-14 shrink-0 animate-pulse-ring place-items-center rounded-full bg-rose-500 text-white active:scale-95"
            >
              <StopIcon />
            </button>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-white/80">
                  <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-rose-500" />
                  Recording
                </span>
                <span className="tabular text-2xl font-semibold">{formatDuration(elapsed)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className={cn("h-full rounded-full transition-[width]", remaining < 10 ? "bg-rose-400" : "bg-hivis")} style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-white/60">{Math.ceil(remaining)}s left · tap ■ when done</p>
            </div>
          </div>
        </div>
      )}

      {(state.phase === "preview" || state.phase === "saving") && (
        <div className="space-y-2.5">
          <AudioPlayer src={state.url} durationHint={state.seconds} />
          <div className="flex gap-2">
            <Button variant="go" onClick={save} disabled={state.phase === "saving"} className="flex-1">
              {state.phase === "saving" ? "Uploading…" : saveLabel}
            </Button>
            <Button variant="secondary" onClick={() => setState({ phase: "idle" })} disabled={state.phase === "saving"} aria-label="Discard and re-record">
              <TrashIcon /> Redo
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
