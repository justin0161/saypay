"use client";

import { useEffect, useRef, useState } from "react";
import { formatDateTime } from "@/lib/format";
import { formatMoney } from "@/lib/quote-math";
import type { QuoteStatus } from "@/lib/types";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { CheckIcon, LockIcon, PauseIcon, PencilIcon, PlayIcon, SendIcon, ShieldIcon, XIcon } from "../ui/icons";
import { DepositPill, StatusPill } from "../ui/pill";

/* ------------------------------------------------------------------------- */
/* Sample data                                                                */
/* ------------------------------------------------------------------------- */

const BUSINESS = { name: "Harper & Sons Plumbing", person: "Dan Harper", trade: "Gas Safe · Plumbing & Heating" };
const CLIENT = "Priya";
const ITEMS = [
  { d: "Remove old radiator & cap pipework", q: 1, p: 9500 },
  { d: "Supply & fit 600×1000 double-panel radiator", q: 1, p: 24500 },
  { d: "Thermostatic valves (pair)", q: 1, p: 4800 },
  { d: "Power-flush & inhibitor, full system", q: 1, p: 32000 },
];
const SUBTOTAL = ITEMS.reduce((s, i) => s + i.q * i.p, 0);
const VAT = Math.round(SUBTOTAL * 0.2);
const TOTAL = SUBTOTAL + VAT;
const DEPOSIT = Math.round(TOTAL * 0.25);

const SCRIPT =
  "Hi Priya, it's Dan from Harper and Sons. Quick run-through of your quote. " +
  "The radiator in the back bedroom has a cracked valve and the system's full of sludge, which is why it's cold at the top. " +
  "I'll swap in a new double panel rad, fit proper thermostatic valves, and power-flush the whole system so every room heats evenly. " +
  "It's about a day's work. If you're happy, hit approve and pay the deposit, and I can book you in for next Tuesday. Cheers!";
const SCRIPT_SECONDS = 34;

type Msg = { id: number; from: "contractor" | "client"; text: string; at: number };
type Sheet = null | "approve" | "changes" | "decline";

const now = () => Date.now();
const seedMessages = (): Msg[] => [
  { id: 1, from: "contractor", text: "Photos from today attached — the valve on the left is the culprit.", at: now() - 1000 * 60 * 42 },
];

/* ------------------------------------------------------------------------- */
/* Voice note: uses the browser's speech synthesis so no audio file ships.    */
/* ------------------------------------------------------------------------- */

function DemoVoiceNote() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const timer = useRef<number | null>(null);
  const started = useRef(0);

  const stop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  };

  useEffect(() => stop, []);

  const play = () => {
    if (playing) return stop();
    setPlaying(true);
    setProgress(0);
    started.current = performance.now();
    const synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;

    if (synth) {
      const u = new SpeechSynthesisUtterance(SCRIPT);
      const voices = synth.getVoices();
      u.voice =
        voices.find((v) => /en-GB/i.test(v.lang) && /male|daniel|arthur|oliver/i.test(v.name)) ??
        voices.find((v) => /en-GB/i.test(v.lang)) ??
        voices.find((v) => /^en/i.test(v.lang)) ??
        null;
      u.rate = 1.02;
      u.onboundary = (e) => setProgress(Math.min(1, e.charIndex / SCRIPT.length));
      u.onend = () => {
        setProgress(1);
        stop();
      };
      u.onerror = () => stop();
      synth.cancel();
      synth.speak(u);
    } else {
      setShowTranscript(true);
    }
    // Time-based fallback so the scrubber moves even without boundary events.
    timer.current = window.setInterval(() => {
      const p = (performance.now() - started.current) / 1000 / SCRIPT_SECONDS;
      setProgress((prev) => Math.max(prev, Math.min(1, p)));
      if (!synth && p >= 1) stop();
    }, 200);
  };

  const bars = [0.45, 0.7, 0.55, 0.9, 0.6, 1, 0.75, 0.5, 0.85, 0.65, 0.95, 0.55, 0.7, 0.4, 0.8, 0.6, 0.9, 0.5, 0.7, 0.45];
  const secs = Math.round(progress * SCRIPT_SECONDS);

  return (
    <div className="rounded-2xl bg-white/[0.06] p-3 text-white ring-1 ring-white/10 ring-inset">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={play}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-hivis text-ink ring-2 ring-ink transition hover:brightness-105 active:scale-95"
          aria-label={playing ? "Pause voice note" : "Play Dan's voice note"}
        >
          {playing ? <PauseIcon /> : <PlayIcon className="translate-x-px" />}
        </button>
        <div className="flex h-10 flex-1 items-center gap-[3px]" aria-hidden>
          {bars.map((h, i) => (
            <span
              key={i}
              className={cn(
                "w-full max-w-1.5 flex-1 origin-center rounded-full transition-colors",
                i / bars.length < progress ? "bg-hivis" : "bg-white/25",
                playing && "animate-bar",
              )}
              style={{ height: `${h * 100}%`, animationDelay: `${(i % 5) * 120}ms` }}
            />
          ))}
        </div>
        <span className="tabular w-10 text-right text-sm font-semibold text-white/80">
          0:{String(playing || progress > 0 ? secs : SCRIPT_SECONDS).padStart(2, "0")}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setShowTranscript((s) => !s)}
        className="mt-2 min-h-11 px-1 text-left text-sm font-semibold text-white/70 underline-offset-4 hover:underline"
      >
        {showTranscript ? "Hide transcript" : "Read transcript"}
      </button>
      {showTranscript && <p className="px-1 pb-1 text-sm leading-relaxed text-white/85">“{SCRIPT}”</p>}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Main demo                                                                  */
/* ------------------------------------------------------------------------- */

export function LiveDemo() {
  const [view, setView] = useState<"client" | "contractor">("client");
  const [status, setStatus] = useState<QuoteStatus>("viewed");
  const [decidedAt, setDecidedAt] = useState<number | null>(null);
  const [deposit, setDeposit] = useState<"unpaid" | "paid">("unpaid");
  const [messages, setMessages] = useState<Msg[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [note, setNote] = useState("");
  const [name, setName] = useState(CLIENT);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [unseen, setUnseen] = useState(0);
  const nextId = useRef(2);
  const threadEnd = useRef<HTMLDivElement>(null);
  const seenCount = useRef<number | null>(null);

  useEffect(() => {
    // Only scroll when something new appears (not on mount, which runs twice in dev).
    const prev = seenCount.current;
    seenCount.current = messages.length;
    if (prev === null || (messages.length <= prev && !typing)) return;
    // Scroll only the phone's own screen — scrollIntoView would also scroll the landing page.
    const box = threadEnd.current?.closest<HTMLElement>(".overflow-y-auto");
    box?.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const push = (from: Msg["from"], text: string) => {
    setMessages((m) => [...m, { id: nextId.current++, from, text, at: now() }]);
    if (from === "client") setUnseen((n) => n + 1);
  };

  const contractorReplies = (text: string) => {
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      push("contractor", text);
    }, 1600);
  };

  const sendReply = () => {
    const text = draft.trim();
    if (!text) return;
    push("client", text);
    setDraft("");
    contractorReplies(
      /week|date|when|tues|book/i.test(text)
        ? "No problem — I can do Tuesday or Thursday next week, whichever suits."
        : /price|cost|cheaper|discount/i.test(text)
          ? "Happy to talk options — I could skip the power-flush, but honestly it's what fixes the cold spots."
          : "Good question! Short answer: yes. I'll explain on the day too 👍",
    );
  };

  const decide = () => {
    setSheetError(null);
    if (!name.trim()) return setSheetError("Add your name");
    if (sheet === "changes" && note.trim().length < 3) return setSheetError("Tell Dan what you'd like changed");
    if (sheet === "approve") {
      setStatus("approved");
      setDecidedAt(now());
      push("client", `✅ Approved the quote${note.trim() ? ` — ${note.trim()}` : ""}`);
      contractorReplies("Brilliant, thanks Priya! You're booked in for Tuesday 8am.");
    } else if (sheet === "changes") {
      setStatus("changes_requested");
      push("client", `✏️ Requested changes: ${note.trim()}`);
      contractorReplies("Thanks — I'll update the quote and send it back over shortly.");
    } else if (sheet === "decline") {
      setStatus("declined");
      setDecidedAt(now());
      push("client", `Declined the quote${note.trim() ? ` — ${note.trim()}` : ""}`);
    }
    setSheet(null);
    setNote("");
  };

  const reset = () => {
    setStatus("viewed");
    setDecidedAt(null);
    setDeposit("unpaid");
    setMessages(seedMessages());
    setUnseen(0);
    setTyping(false);
    setSheet(null);
    setNote("");
  };

  const locked = status === "approved" || status === "declined";

  return (
    <div className="relative min-w-0">
      {/* View toggle */}
      <div className="mx-auto mb-4 flex w-full max-w-[400px] items-center justify-between gap-3">
        <div className="flex flex-1 rounded-[6px] bg-ink/10 p-1 ring-2 ring-ink ring-inset sm:flex-none" role="tablist" aria-label="Demo view">
          {(
            [
              ["client", "Client view"],
              ["contractor", "Contractor view"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={view === key}
              onClick={() => {
                setView(key);
                if (key === "contractor") setUnseen(0);
              }}
              className={cn(
                "relative min-h-10 flex-1 rounded-[3px] px-4 font-display text-[15px] font-bold tracking-[0.05em] uppercase transition sm:flex-none",
                view === key ? "bg-ink text-hivis" : "text-ink/70 hover:text-ink",
              )}
            >
              {label}
              {key === "contractor" && unseen > 0 && view !== "contractor" && (
                <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-hivis text-[11px] font-semibold text-hivis-ink">
                  {unseen}
                </span>
              )}
            </button>
          ))}
        </div>
        <button type="button" onClick={reset} className="min-h-10 px-3 font-mono text-xs font-medium tracking-[0.1em] text-ink/70 uppercase underline-offset-4 transition hover:text-ink hover:underline">
          Reset
        </button>
      </div>

      {/* Device frame */}
      <div className="mx-auto w-full max-w-[400px] rounded-[2.75rem] bg-ink p-2.5 shadow-device">
        <div className="relative h-[640px] overflow-hidden rounded-[2.2rem] bg-canvas text-ink">
          <div className="flex h-7 items-center justify-center bg-surface text-[10px] font-semibold text-muted">
            {view === "client" ? "🔒 saypay.co/q/x8Kf…  ·  no login needed" : "saypay.co/dashboard"}
          </div>

          {view === "client" ? (
            <div className="h-[calc(100%-1.75rem)] overflow-y-auto pb-28">
              {/* Business header */}
              <div className="bg-ink px-4 pt-4 pb-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-[6px] bg-hivis font-display text-base font-extrabold text-ink">H&S</div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{BUSINESS.name}</p>
                    <p className="truncate text-xs text-white/65">{BUSINESS.trade}</p>
                  </div>
                </div>
                <h3 className="mt-4 font-display text-[26px] leading-[0.95] font-extrabold uppercase">Back bedroom radiator & system flush</h3>
                <p className="mt-1 text-sm text-white/70">For {CLIENT} · 14 Elm Road</p>
                <div className="mt-4">
                  <p className="mb-2 font-mono text-[10px] font-medium tracking-[0.14em] text-hivis uppercase">Voice walkthrough from Dan</p>
                  <DemoVoiceNote />
                </div>
              </div>

              <div className="space-y-3 p-3">
                {locked && (
                  <div
                    className={cn(
                      "flex items-start gap-3 rounded-2xl p-3.5 ring-1 ring-inset",
                      status === "approved" ? "bg-go-soft text-go-ink ring-emerald-200" : "bg-rose-50 text-rose-800 ring-rose-200",
                    )}
                  >
                    {status === "approved" ? <LockIcon className="mt-0.5 shrink-0" /> : <XIcon className="mt-0.5 shrink-0" />}
                    <div className="text-sm">
                      <p className="font-semibold">{status === "approved" ? `Approved by ${name}` : "Quote declined"}</p>
                      {decidedAt && <p className="opacity-80">{formatDateTime(new Date(decidedAt).toISOString())} · terms locked</p>}
                    </div>
                  </div>
                )}
                {status === "changes_requested" && (
                  <div className="rounded-2xl bg-hivis-soft p-3.5 text-sm text-hivis-ink ring-1 ring-amber-200 ring-inset">
                    <p className="font-semibold">Changes requested</p>
                    <p>Dan&apos;s been notified and will send an updated quote.</p>
                  </div>
                )}

                {/* Line items */}
                <div className="rounded-2xl bg-surface p-4 shadow-card">
                  <ul className="divide-y divide-line text-sm">
                    {ITEMS.map((i) => (
                      <li key={i.d} className="flex justify-between gap-3 py-2.5 first:pt-0">
                        <span>{i.d}</span>
                        <span className="tabular font-semibold">{formatMoney(i.p * i.q)}</span>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
                    <div className="flex justify-between text-muted">
                      <dt>VAT 20%</dt>
                      <dd className="tabular">{formatMoney(VAT)}</dd>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <dt>Total</dt>
                      <dd className="tabular">{formatMoney(TOTAL)}</dd>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-hivis-soft px-3 py-2 font-semibold text-hivis-ink">
                      <dt>Deposit to book (25%)</dt>
                      <dd className="tabular">{formatMoney(DEPOSIT)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["from-stone-400 to-stone-600", "Cracked valve"],
                    ["from-[#a58a6a] to-[#6b5640]", "Sludge test"],
                    ["from-slate-400 to-slate-600", "Wall to fit"],
                  ].map(([g, label]) => (
                    <div key={label} className={cn("flex aspect-square items-end rounded-xl bg-gradient-to-br p-2", g)}>
                      <span className="text-[11px] font-medium text-white/95">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Thread */}
                <div className="rounded-2xl bg-surface p-4 shadow-card">
                  <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">Messages</p>
                  <DemoThread messages={messages} viewer="client" typing={typing} />
                  <div ref={threadEnd} />
                  <div className="mt-3 flex gap-2">
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendReply()}
                      placeholder="Try: “Could you do next Tuesday?”"
                      className="min-h-11 flex-1 rounded-xl bg-canvas px-3 text-[16px] ring-1 ring-line ring-inset focus:ring-2 focus:ring-ink focus:outline-none"
                      aria-label="Reply"
                    />
                    <Button onClick={sendReply} className="size-11 !px-0" aria-label="Send">
                      <SendIcon width={18} height={18} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sticky decision bar */}
              <div className="absolute inset-x-0 bottom-0 border-t border-line bg-surface/95 p-3 backdrop-blur">
                {status === "approved" ? (
                  deposit === "paid" ? (
                    <div className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-go-soft font-semibold text-go-ink">
                      <CheckIcon /> Deposit paid — you&apos;re booked in
                    </div>
                  ) : (
                    <Button
                      variant="go"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setDeposit("paid");
                        push("client", "💳 Deposit paid via card.");
                      }}
                    >
                      Pay {formatMoney(DEPOSIT)} deposit <span className="text-xs font-medium opacity-80">(demo)</span>
                    </Button>
                  )
                ) : status === "declined" ? (
                  <p className="py-3 text-center text-sm text-muted">You declined this quote.</p>
                ) : (
                  <div className="space-y-2">
                    <Button variant="go" size="lg" className="w-full" onClick={() => setSheet("approve")}>
                      <CheckIcon /> Approve & pay deposit
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="secondary" className="flex-1 whitespace-nowrap" onClick={() => setSheet("changes")}>
                        <PencilIcon width={16} height={16} /> Request changes
                      </Button>
                      <Button variant="ghost" className="flex-1 text-rose-700" onClick={() => setSheet("decline")}>
                        Decline
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom sheet */}
              {sheet && (
                <div className="absolute inset-0 z-10 flex items-end bg-black/40" onClick={() => setSheet(null)}>
                  <div className="w-full space-y-3 rounded-t-3xl bg-surface p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" />
                    <h4 className="text-lg font-semibold">
                      {sheet === "approve" ? "Approve this quote" : sheet === "changes" ? "Request changes" : "Decline quote"}
                    </h4>
                    {sheet === "approve" && (
                      <p className="flex items-start gap-2 text-sm text-muted">
                        <ShieldIcon className="mt-0.5 shrink-0 text-go" width={18} height={18} />
                        Your approval is time-stamped and the price is locked — no surprises.
                      </p>
                    )}
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="min-h-12 w-full rounded-xl bg-canvas px-3 text-[16px] ring-1 ring-line ring-inset"
                      aria-label="Your name"
                    />
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder={
                        sheet === "changes" ? "What would you like changed? (required)" : "Add a note (optional)"
                      }
                      className="w-full rounded-xl bg-canvas p-3 text-[16px] ring-1 ring-line ring-inset"
                      aria-label="Note"
                    />
                    {sheetError && <p className="text-sm font-medium text-rose-700">{sheetError}</p>}
                    <Button
                      variant={sheet === "decline" ? "danger" : "go"}
                      size="lg"
                      className="w-full"
                      onClick={decide}
                    >
                      {sheet === "approve" ? `Approve ${formatMoney(TOTAL)}` : sheet === "changes" ? "Send to Dan" : "Decline quote"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ContractorDemo status={status} deposit={deposit} messages={messages} typing={typing} decidedAt={decidedAt} clientName={name} />
          )}
        </div>
      </div>
    </div>
  );
}

function DemoThread({ messages, viewer, typing }: { messages: Msg[]; viewer: Msg["from"]; typing: boolean }) {
  return (
    <ol className="space-y-2.5">
      {messages.map((m) => (
        <li key={m.id} className={cn("flex", m.from === viewer ? "justify-end" : "justify-start")}>
          <p
            className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
              m.from === viewer ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-canvas ring-1 ring-line ring-inset",
            )}
          >
            {m.text}
          </p>
        </li>
      ))}
      {typing && (
        <li className="flex justify-start" aria-live="polite">
          <span className="flex gap-1 rounded-2xl rounded-bl-md bg-canvas px-3 py-3 ring-1 ring-line ring-inset">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </span>
        </li>
      )}
    </ol>
  );
}

function ContractorDemo({
  status,
  deposit,
  messages,
  typing,
  decidedAt,
  clientName,
}: {
  status: QuoteStatus;
  deposit: "unpaid" | "paid";
  messages: Msg[];
  typing: boolean;
  decidedAt: number | null;
  clientName: string;
}) {
  const approved = status === "approved";
  const stats = [
    { label: "Open quotes", value: approved || status === "declined" ? 3 : 4 },
    { label: "Awaiting reply", value: messages.at(-1)?.from === "client" ? 2 : 1 },
    { label: "Approved", value: approved ? 8 : 7 },
    { label: "Deposits secured", value: formatMoney(184000 + (deposit === "paid" ? DEPOSIT : 0)) },
  ];
  return (
    <div className="h-[calc(100%-1.75rem)] overflow-y-auto p-3">
      <p className="px-1 pt-1 text-xs font-semibold text-muted">Good afternoon, Dan</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface p-3 shadow-card">
            <p className="tabular text-xl font-semibold">{s.value}</p>
            <p className="text-xs font-medium text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl bg-surface p-4 shadow-card ring-2 ring-hivis">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold">Back bedroom radiator & flush</p>
            <p className="text-sm text-muted">{clientName} · {formatMoney(TOTAL)}</p>
          </div>
          <StatusPill status={status} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {approved && <DepositPill status={deposit} />}
          <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-muted">Voice note played</span>
        </div>
        {decidedAt && (
          <p className="mt-2 text-xs text-muted">
            {approved ? "Approved" : "Declined"} {formatDateTime(new Date(decidedAt).toISOString())}
          </p>
        )}
        <div className="mt-3 border-t border-line pt-3">
          <DemoThread messages={messages} viewer="contractor" typing={false} />
          {typing && <p className="mt-2 text-xs text-muted">You&apos;re replying…</p>}
        </div>
      </div>

      {[
        ["Kitchen tap & isolation valves", "Mr Okafor", "sent"],
        ["Combi boiler service", "S. Walsh", "approved"],
      ].map(([t, c, s]) => (
        <div key={t} className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-surface p-4 shadow-card">
          <div className="min-w-0">
            <p className="truncate font-semibold">{t}</p>
            <p className="text-sm text-muted">{c}</p>
          </div>
          <StatusPill status={s as QuoteStatus} />
        </div>
      ))}
      <p className="mt-4 px-2 text-center text-xs text-muted">Switch back to the client view and approve — watch this update live.</p>
    </div>
  );
}
