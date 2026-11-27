import { timeAgo } from "@/lib/format";
import type { SenderRole, ThreadMessage } from "@/lib/types";
import { AudioPlayer } from "../media/audio-player";
import { cn } from "../ui/cn";

/** Chat-style thread. `viewer` decides which side is "mine". */
export function MessageThread({ messages, viewer }: { messages: ThreadMessage[]; viewer: SenderRole }) {
  if (messages.length === 0) {
    return (
      <p className="rounded-2xl bg-canvas p-4 text-center text-sm text-muted">
        No messages yet. {viewer === "client" ? "Ask a question or send a voice note — they'll get it straight away." : "Your client's replies will show up here."}
      </p>
    );
  }
  return (
    <ol className="space-y-3" aria-label="Messages">
      {messages.map((m) => {
        const mine = m.sender_role === viewer;
        return (
          <li key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
            <div
              className={cn(
                "max-w-[88%] space-y-2 rounded-2xl px-3.5 py-2.5 sm:max-w-[75%]",
                mine
                  ? "rounded-br-md bg-ink text-white"
                  : "rounded-bl-md bg-canvas text-ink ring-1 ring-line ring-inset",
              )}
            >
              {m.audio && (
                <div className="min-w-56">
                  <AudioPlayer src={m.audio.url} durationHint={m.audio.duration_seconds} tone={mine ? "brand" : "light"} />
                </div>
              )}
              {m.body && <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{m.body}</p>}
            </div>
            <span className="mt-1 px-1 text-xs text-muted">
              {mine ? "You" : m.sender_name} · <time dateTime={m.created_at}>{timeAgo(m.created_at)}</time>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
