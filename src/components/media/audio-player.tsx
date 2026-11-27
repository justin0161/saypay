"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/media";
import { cn } from "../ui/cn";
import { PauseIcon, PlayIcon } from "../ui/icons";

const BARS = [0.45, 0.7, 0.55, 0.9, 0.6, 1, 0.75, 0.5, 0.85, 0.65, 0.95, 0.55, 0.7, 0.4, 0.8, 0.6, 0.9, 0.5, 0.7, 0.45, 0.85, 0.6, 0.75, 0.5];

/**
 * Thumb-friendly voice-note player with a waveform scrubber.
 * `durationHint` covers browsers that report Infinity for MediaRecorder WebM files.
 */
export function AudioPlayer({
  src,
  durationHint,
  tone = "light",
  size = "md",
  label = "Play voice note",
}: {
  src: string | null;
  durationHint?: number | null;
  tone?: "light" | "dark" | "brand";
  size?: "md" | "lg";
  label?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationHint ?? 0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onMeta = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) setDuration(a.duration);
    };
    const onTime = () => setCurrent(a.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setCurrent(0);
    };
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    a.addEventListener("pause", onPause);
    a.addEventListener("play", onPlay);
    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onMeta);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("play", onPlay);
    };
  }, [src]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a || !src) return;
    if (a.paused) {
      // Pause any other player on the page.
      document.querySelectorAll("audio").forEach((el) => el !== a && el.pause());
      await a.play().catch(() => setPlaying(false));
    } else a.pause();
  };

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * duration;
    setCurrent(a.currentTime);
  };

  const progress = duration ? current / duration : 0;
  const dark = tone !== "light";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl p-2.5 pr-4",
        tone === "light" && "bg-canvas ring-1 ring-line ring-inset",
        tone === "dark" && "bg-ink text-white",
        tone === "brand" && "bg-white/10 text-white ring-1 ring-white/15 ring-inset",
      )}
    >
      {src ? <audio ref={audioRef} src={src} preload="metadata" /> : null}
      <button
        type="button"
        onClick={toggle}
        disabled={!src}
        aria-label={playing ? "Pause" : label}
        className={cn(
          "grid shrink-0 place-items-center rounded-full transition active:scale-95 disabled:opacity-40",
          size === "lg" ? "size-14" : "size-11",
          dark ? "bg-hivis text-hivis-ink" : "bg-ink text-white",
        )}
      >
        {playing ? <PauseIcon /> : <PlayIcon className="translate-x-px" />}
      </button>
      <div
        className="flex h-10 flex-1 cursor-pointer touch-none items-center gap-[3px]"
        onPointerDown={seek}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(current)}
        tabIndex={-1}
      >
        {BARS.map((h, i) => {
          const active = i / BARS.length < progress;
          return (
            <span
              key={i}
              className={cn(
                "w-full max-w-1.5 flex-1 rounded-full transition-colors",
                active ? (dark ? "bg-hivis" : "bg-ink") : dark ? "bg-white/25" : "bg-slate-300",
              )}
              style={{ height: `${h * 100}%` }}
            />
          );
        })}
      </div>
      <span className={cn("tabular w-10 text-right text-sm font-semibold", dark ? "text-white/80" : "text-muted")}>
        {formatDuration(playing || current > 0 ? current : duration)}
      </span>
    </div>
  );
}
