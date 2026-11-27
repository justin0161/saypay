"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { uploadMedia, type RequestUpload, type UploadedFile } from "@/lib/upload-client";
import type { ActionResult } from "@/lib/types";
import { MediaPicker } from "../media/media-picker";
import { VoiceRecorder } from "../media/voice-recorder";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { inputClass } from "../ui/field";
import { ChatIcon, MicIcon, SendIcon } from "../ui/icons";

export type ConfirmUpload = (input: {
  path: string;
  kind: UploadedFile["kind"];
  caption: string | null;
  duration_seconds: number | null;
  as_message: boolean;
  sender_name: string | null;
}) => Promise<ActionResult>;

/**
 * Message composer: text, voice note, or photos/video. The name field is shown
 * for clients (no account) and remembered on this device.
 */
export function Composer({
  sendText,
  requestUpload,
  confirmUpload,
  askName,
  defaultName = "",
  allowMedia = true,
  placeholder = "Write a message…",
}: {
  sendText: (body: string, name: string) => Promise<ActionResult>;
  requestUpload: RequestUpload;
  confirmUpload: ConfirmUpload;
  askName: boolean;
  defaultName?: string;
  allowMedia?: boolean;
  placeholder?: string;
}) {
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [body, setBody] = useState("");
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!askName) return;
    try {
      const saved = localStorage.getItem("saypay:name");
      if (saved) setName(saved);
    } catch {
      /* storage unavailable */
    }
  }, [askName]);

  const rememberName = (n: string) => {
    try {
      localStorage.setItem("saypay:name", n);
    } catch {
      /* ignore */
    }
  };

  const needName = askName && !name.trim();

  const submit = () => {
    if (!body.trim()) return;
    if (needName) return setError("Add your name so they know who's replying");
    setError(null);
    startTransition(async () => {
      const res = await sendText(body.trim(), name.trim());
      if (!res.ok) return setError(res.error);
      if (askName) rememberName(name.trim());
      setBody("");
      textRef.current?.focus();
    });
  };

  const saveVoice = async (blob: Blob, seconds: number) => {
    if (needName) throw new Error("Add your name first");
    const up = await uploadMedia(blob, requestUpload);
    const res = await confirmUpload({
      path: up.path,
      kind: "audio",
      caption: null,
      duration_seconds: seconds,
      as_message: true,
      sender_name: askName ? name.trim() : null,
    });
    if (!res.ok) throw new Error(res.error);
    if (askName) rememberName(name.trim());
    setMode("text");
  };

  return (
    <div className="space-y-3">
      {askName && (
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          maxLength={80}
          aria-label="Your name"
        />
      )}

      <div className="flex rounded-xl bg-canvas p-1 ring-1 ring-line ring-inset" role="tablist">
        {(
          [
            ["text", "Type", ChatIcon],
            ["voice", "Voice note", MicIcon],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={mode === key}
            onClick={() => setMode(key)}
            className={cn(
              "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition",
              mode === key ? "bg-surface text-ink shadow-sm" : "text-muted",
            )}
          >
            <Icon width={18} height={18} /> {label}
          </button>
        ))}
      </div>

      {mode === "text" ? (
        <div className="flex items-end gap-2">
          <textarea
            ref={textRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
            rows={2}
            maxLength={4000}
            placeholder={placeholder}
            className={cn(inputClass, "min-h-12 flex-1 resize-none")}
            aria-label="Message"
          />
          <Button onClick={submit} disabled={pending || !body.trim()} className="size-12 shrink-0 !px-0" aria-label="Send message">
            <SendIcon />
          </Button>
        </div>
      ) : (
        <VoiceRecorder onSave={saveVoice} saveLabel="Send voice note" prompt="Tap to record" compact />
      )}

      {allowMedia && (
        <MediaPicker
          requestUpload={requestUpload}
          label="Send photos or a short video"
          onUploaded={async (file) => {
            const res = await confirmUpload({
              path: file.path,
              kind: file.kind,
              caption: null,
              duration_seconds: null,
              as_message: false,
              sender_name: askName ? name.trim() || null : null,
            });
            if (!res.ok) throw new Error(res.error);
          }}
        />
      )}

      {error && (
        <p className="text-sm font-medium text-stop" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
