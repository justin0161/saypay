"use client";

import { useEffect, useRef, useState } from "react";
import { parseSpokenQuote, type VoiceQuoteDraft } from "@/lib/voice-parse";
import { Button } from "../ui/button";
import { cn } from "../ui/cn";
import { inputClass } from "../ui/field";
import { CheckIcon, MicIcon } from "../ui/icons";

// Minimal typings for the Web Speech API (not in TypeScript's DOM lib).
type SpeechResultEvent = { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Why live voice can't work here, in plain words — or null if it should. */
function unsupportedReason(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  const iPhone = /iPhone|iPad|iPod/.test(ua);
  if (/FBAN|FBAV|Instagram|WhatsApp|Line\/|Snapchat|TikTok|LinkedInApp/i.test(ua)) {
    return "Voice doesn't work inside this app's browser. Open SayPay in Safari or Chrome — or use your keyboard's microphone below.";
  }
  if (iPhone && /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) {
    return "On iPhone, voice works in Safari. Open SayPay in Safari — or use your keyboard's microphone below.";
  }
  if (!getRecognition()) return "This browser can't do live voice. Use the microphone on your keyboard below instead.";
  return null;
}

const ERRORS: Record<string, string> = {
  "no-speech": "I didn't hear anything. Hold the phone a bit closer and try again.",
  "audio-capture": "No microphone was found. Check nothing else is using it, then try again.",
  network: "Voice needs an internet connection. Check your signal and try again.",
  "language-not-supported": "Voice isn't available for English (UK) on this phone. Use your keyboard's microphone below.",
};

const nothingFound = (d: VoiceQuoteDraft) => !d.title && !d.client_name && d.line_items.length === 0 && d.vat.enabled == null && !d.payment.type;

/**
 * Voice fill: tap Speak, talk, tap Done — the quote fills itself in using the
 * free on-device parser. Listening never auto-restarts (phones only allow
 * starting the microphone straight after a tap); tap Speak again to add more.
 * The keyboard's own microphone is always available as a fallback.
 */
export function VoiceFill({ onFill }: { onFill: (draft: VoiceQuoteDraft) => void }) {
  const [reason, setReason] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState(""); // everything heard so far (editable)
  const [live, setLive] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [filled, setFilled] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const [iPhone, setIPhone] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  const baseRef = useRef(""); // text before this listening session
  const sessionRef = useRef(""); // final text from this session
  const errorRef = useRef<string | null>(null);
  const onFillRef = useRef(onFill);
  onFillRef.current = onFill;

  useEffect(() => {
    setReason(unsupportedReason());
    setIPhone(/iPhone|iPad|iPod/.test(navigator.userAgent));
    return () => recRef.current?.abort();
  }, []);

  const apply = (all: string) => {
    const draft = parseSpokenQuote(all);
    if (!all.trim() || nothingFound(draft)) {
      setFilled(false);
      setMessage(all.trim() ? "I couldn't pick out a job or any prices. Try saying each item, then its price." : null);
      return;
    }
    onFillRef.current(draft);
    setMessage(null);
    setFilled(true);
  };

  const start = () => {
    const Ctor = getRecognition();
    if (!Ctor) return;
    setMessage(null);
    setBlocked(false);
    setFilled(false);
    errorRef.current = null;
    baseRef.current = text.trim();
    sessionRef.current = "";
    setLive("");

    const rec = new Ctor();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finals = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r) continue;
        if (r.isFinal) finals += `${r[0].transcript} `;
        else interim += r[0].transcript;
      }
      sessionRef.current = finals.replace(/\s+/g, " ").trim();
      setLive(interim);
      setText(`${baseRef.current} ${sessionRef.current}`.trim());
    };
    rec.onerror = (e) => {
      errorRef.current = e.error;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setBlocked(true);
      else if (e.error !== "aborted") setMessage(ERRORS[e.error] ?? `Voice stopped (${e.error}). Try again, or use your keyboard's microphone.`);
    };
    rec.onend = () => {
      setListening(false);
      setLive("");
      const all = `${baseRef.current} ${sessionRef.current}`.trim();
      setText(all);
      if (errorRef.current === "not-allowed" || errorRef.current === "service-not-allowed") return;
      if (!sessionRef.current && !errorRef.current) setMessage(ERRORS["no-speech"] ?? null);
      if (sessionRef.current) apply(all);
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setMessage("Couldn't start the microphone. Try again, or use your keyboard's microphone.");
    }
  };

  const finish = () => recRef.current?.stop(); // onend fills the quote in

  const canSpeak = !reason;
  const showTextBox = showBox || !canSpeak || filled;

  return (
    <section className={cn("rounded-card p-5 ring-1 ring-inset transition sm:p-6", listening ? "bg-hivis-soft ring-hivis/30" : "bg-surface ring-line")}>
      {canSpeak ? (
        <button
          type="button"
          onClick={listening ? finish : start}
          className={cn(
            "flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl px-5 text-lg font-semibold transition active:scale-[0.99]",
            listening ? "bg-stop text-white" : "bg-hivis text-white hover:bg-[#2549e6]",
          )}
        >
          {listening ? (
            <>
              <span className="relative grid size-7 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
                <span className="size-3 rounded-sm bg-white" />
              </span>
              Done — fill in my quote
            </>
          ) : (
            <>
              <MicIcon width={24} height={24} /> {text ? "Speak again (adds more)" : "Speak your quote"}
            </>
          )}
        </button>
      ) : (
        <p className="rounded-xl bg-hivis-soft p-3 text-sm text-hivis-ink">{reason}</p>
      )}

      {listening && (
        <p className="mt-3 min-h-12 text-[15px] leading-relaxed" aria-live="polite">
          {text || live ? (
            <>
              {text} <span className="text-muted">{live}</span>
            </>
          ) : (
            <span className="text-ink-soft">Listening… say the job, who it&apos;s for, then each item and its price.</span>
          )}
        </p>
      )}

      {blocked && (
        <div className="mt-3 rounded-xl bg-stop-soft p-3 text-sm" role="alert">
          <p className="font-semibold text-stop">The microphone is turned off for SayPay.</p>
          {iPhone ? (
            <p className="mt-1 text-ink-soft">
              Tap <span className="font-semibold text-ink">aA</span> in the address bar → <span className="font-semibold text-ink">Website Settings</span> →
              set Microphone to <span className="font-semibold text-ink">Allow</span>. Also check iPhone Settings → Safari → Microphone. Then tap Speak again.
            </p>
          ) : (
            <p className="mt-1 text-ink-soft">
              Tap the icon left of the web address → <span className="font-semibold text-ink">Permissions</span> → turn Microphone on, then tap Speak
              again.
            </p>
          )}
        </div>
      )}

      {message && !listening && (
        <p className="mt-3 text-sm font-medium text-stop" role="alert">
          {message}
        </p>
      )}
      {filled && !listening && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-go-ink" role="status">
          <CheckIcon width={15} height={15} strokeWidth={3} /> Filled in below — just check it over.
        </p>
      )}

      {!listening &&
        (showTextBox ? (
          <div className="mt-3 space-y-2">
            <textarea
              className={cn(inputClass, "min-h-24")}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setFilled(false);
              }}
              placeholder="Tap here, then the microphone on your keyboard, and say the quote"
              aria-label="What you said"
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => apply(text)} disabled={text.trim().length < 3}>
                Fill in quote
              </Button>
              {text && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setText("");
                    setFilled(false);
                    setMessage(null);
                  }}
                >
                  Start over
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-soft">
            <span>e.g. &ldquo;Boiler swap for Sarah Okafor. Combi boiler, £2,150. Plus VAT. 25% deposit.&rdquo;</span>
            <button type="button" onClick={() => setShowBox(true)} className="font-semibold text-hivis underline-offset-2 hover:underline">
              Type or use keyboard mic instead
            </button>
          </div>
        ))}
    </section>
  );
}
