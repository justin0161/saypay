"use client";

import { useRef, useState } from "react";
import { uploadMedia, type RequestUpload, type UploadedFile } from "@/lib/upload-client";
import { Button, type ButtonVariant } from "../ui/button";
import { CameraIcon } from "../ui/icons";

/** Pick (or shoot) photos / short videos and upload each directly to storage. */
export function MediaPicker({
  requestUpload,
  onUploaded,
  label = "Add photos or video",
  variant = "secondary",
  className,
}: {
  requestUpload: RequestUpload;
  onUploaded: (file: UploadedFile, preview: string) => Promise<void> | void;
  label?: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files).slice(0, 10);
    setBusy({ done: 0, total: list.length });
    for (const [i, file] of list.entries()) {
      try {
        const uploaded = await uploadMedia(file, requestUpload);
        await onUploaded(uploaded, URL.createObjectURL(file));
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      }
      setBusy({ done: i + 1, total: list.length });
    }
    setBusy(null);
  };

  return (
    <div className={className}>
      <Button variant={variant} onClick={() => inputRef.current?.click()} disabled={!!busy} className="w-full">
        <CameraIcon />
        {busy ? `Uploading ${busy.done + 1 > busy.total ? busy.total : busy.done + 1} of ${busy.total}…` : label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          void handle(e.target.files);
          e.target.value = "";
        }}
      />
      {error && (
        <p className="mt-2 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
