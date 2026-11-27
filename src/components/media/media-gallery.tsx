"use client";

import { useState } from "react";
import type { MediaItem } from "@/lib/types";
import { cn } from "../ui/cn";
import { PlayIcon, TrashIcon, XIcon } from "../ui/icons";
import { AudioPlayer } from "./audio-player";

export function MediaGallery({
  items,
  onDelete,
  emptyText,
}: {
  items: MediaItem[];
  onDelete?: (id: string) => Promise<void> | void;
  emptyText?: string;
}) {
  const [open, setOpen] = useState<MediaItem | null>(null);
  const visual = items.filter((i) => i.kind !== "audio");
  const audio = items.filter((i) => i.kind === "audio");

  if (items.length === 0) {
    return emptyText ? <p className="text-sm text-muted">{emptyText}</p> : null;
  }

  return (
    <div className="space-y-3">
      {visual.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {visual.map((item) => (
            <li key={item.id} className="group relative aspect-square overflow-hidden rounded-xl bg-raised">
              <button type="button" onClick={() => setOpen(item)} className="block size-full" aria-label={item.caption ?? `Open ${item.kind}`}>
                {item.kind === "image" && item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- signed URLs, sizes unknown
                  <img src={item.url} alt={item.caption ?? "Site photo"} loading="lazy" className="size-full object-cover" />
                ) : item.url ? (
                  <>
                    <video src={`${item.url}#t=0.1`} preload="metadata" muted playsInline className="size-full object-cover" />
                    <span className="absolute inset-0 grid place-items-center bg-black/20">
                      <span className="grid size-10 place-items-center rounded-full bg-white/90 text-ink">
                        <PlayIcon />
                      </span>
                    </span>
                  </>
                ) : null}
              </button>
              <span
                className={cn(
                  "pointer-events-none absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                  item.uploaded_by === "client" ? "bg-hivis text-on-accent" : "bg-ink/80 text-white",
                )}
              >
                {item.uploaded_by === "client" ? "Client" : "Pro"}
              </span>
              {onDelete && item.uploaded_by === "contractor" && (
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="absolute top-1 right-1 grid size-9 place-items-center rounded-lg bg-white/90 text-stop shadow"
                  aria-label="Remove"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {audio.map((item) => (
        <AudioPlayer key={item.id} src={item.url} durationHint={item.duration_seconds} />
      ))}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setOpen(null)}
        >
          <div className="flex justify-end p-3">
            <button type="button" className="grid size-11 place-items-center rounded-full bg-white/10 text-white" aria-label="Close">
              <XIcon />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center p-3" onClick={(e) => e.stopPropagation()}>
            {open.kind === "image" && open.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={open.url} alt={open.caption ?? ""} className="max-h-full max-w-full rounded-lg object-contain" />
            ) : open.url ? (
              <video src={open.url} controls autoPlay playsInline className="max-h-full max-w-full rounded-lg" />
            ) : null}
          </div>
          {open.caption && <p className="p-4 pb-safe text-center text-white/90">{open.caption}</p>}
        </div>
      )}
    </div>
  );
}
