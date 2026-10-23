"use client";

import { useState } from "react";

/*
  In-app feedback for The 13th Hour prototype.
  No backend needed: "Send feedback" opens the tester's email app with their answers filled in,
  addressed to FEEDBACK_EMAIL. "Copy instead" puts the same text on the clipboard.

  Later, if you set up a Google Form or Tally form, you can swap the email for a form link.
*/

export const FEEDBACK_EMAIL = "support@tmacinspired.com";

const QUICK = [
  { id: "shift", q: "What shift do you usually work?", options: ["☀️ Days", "🌙 Nights", "🔄 Rotating"] },
  {
    id: "specialty",
    q: "Your specialty?",
    options: ["Med-Surg", "ICU", "ED", "L&D", "Peds", "OR", "Travel", "Other"],
  },
  { id: "fav", q: "Which tab would you actually use mid-shift?", options: ["🏥 Shift", "🩹 Vent", "💊 Breaks", "👩‍⚕️ Crew"] },
  { id: "use", q: "Would you use this app on a real shift?", options: ["😍 Definitely", "🙂 Maybe", "😬 Probably not"] },
  { id: "tell", q: "Would you tell a coworker about it?", options: ["🙌 Yes", "🤔 Maybe", "🙅 No"] },
];

const OPEN = [
  { id: "laugh", q: "What made you laugh or feel seen? 😂", ph: "The permission slips, the shredder…" },
  { id: "off", q: "What felt off, confusing, or cringe? 😬", ph: "Be honest — this is how it gets better." },
  { id: "missing", q: "What's missing that you'd want? 💡", ph: "A feature, a joke, a tool…" },
];

function buildText(a) {
  const lines = ["THE 13TH HOUR — PROTOTYPE FEEDBACK", ""];
  QUICK.forEach((x) => lines.push(`${x.q}\n→ ${a[x.id] || "—"}`, ""));
  OPEN.forEach((x) => lines.push(`${x.q}\n→ ${(a[x.id] || "").trim() || "—"}`, ""));
  lines.push(`Device: ${typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 120) : ""}`);
  return lines.join("\n");
}

export default function FeedbackSheet({ open, onClose, onEarn }) {
  const [a, setA] = useState({});
  const [sent, setSent] = useState(false);
  const [rewarded, setRewarded] = useState(false);

  if (!open) return null;

  const set = (id, v) => setA((p) => ({ ...p, [id]: v }));
  const answered = QUICK.filter((x) => a[x.id]).length + OPEN.filter((x) => (a[x.id] || "").trim()).length;
  const canSend = answered >= 2;

  const reward = () => {
    if (!rewarded) {
      setRewarded(true);
      onEarn(25, "💬 Thank you! +25 PTO Points");
    }
  };

  const sendEmail = () => {
    const subject = encodeURIComponent("The 13th Hour — prototype feedback");
    const body = encodeURIComponent(buildText(a));
    window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
    reward();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildText(a));
      onEarn(0, "📋 Feedback copied — paste it in a text or email");
    } catch {
      onEarn(0, "Couldn't copy — try Send instead");
    }
    reward();
  };

  return (
    <div className="absolute inset-0 z-[60] flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Give feedback">
      <button className="absolute inset-0 bg-black/70" aria-label="Close feedback" onClick={onClose} />
      <div className="relative max-h-[92%] flex flex-col rounded-t-[28px] bg-[#0f141a] border-t border-zinc-700 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
        <div className="pt-3 pb-2 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-zinc-700" />
        </div>

        <div className="px-5 pb-3 flex items-start justify-between gap-3 border-b border-zinc-800">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-400/80">Help shape The 13th Hour</p>
            <h2 className="text-xl font-black leading-tight">Give feedback 💬</h2>
            <p className="text-xs text-zinc-400 mt-1">Takes about a minute. Answer as much or as little as you want.</p>
          </div>
          <button onClick={onClose} className="shrink-0 text-sm font-semibold text-zinc-400 pt-1">
            Close
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <div className="text-5xl">💜</div>
            <p className="mt-3 text-xl font-black">Thank you, truly.</p>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Your email app should have opened with your answers. Just hit send there. If it didn't open, copy your answers
              and text or email them instead.
            </p>
            <button
              onClick={copy}
              className="mt-5 w-full rounded-2xl border border-zinc-700 py-3 text-sm font-bold text-zinc-300 active:scale-95 transition"
            >
              📋 Copy my answers
            </button>
            <button
              onClick={() => {
                setSent(false);
                onClose();
              }}
              className="mt-3 w-full rounded-2xl bg-[#39ff88] text-zinc-950 font-black py-3.5 active:scale-95 transition"
            >
              Back to the app
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-6">
              {QUICK.map((x) => (
                <div key={x.id}>
                  <p className="text-sm font-bold mb-2.5">{x.q}</p>
                  <div className="flex flex-wrap gap-2">
                    {x.options.map((o) => {
                      const on = a[x.id] === o;
                      return (
                        <button
                          key={o}
                          onClick={() => set(x.id, on ? undefined : o)}
                          className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition active:scale-95 ${
                            on ? "bg-purple-500 border-purple-500 text-white" : "bg-zinc-900 border-zinc-700 text-zinc-300"
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {OPEN.map((x) => (
                <div key={x.id}>
                  <label htmlFor={`fb-${x.id}`} className="block text-sm font-bold mb-2">
                    {x.q}
                  </label>
                  <textarea
                    id={`fb-${x.id}`}
                    rows={3}
                    maxLength={1000}
                    value={a[x.id] || ""}
                    onChange={(e) => set(x.id, e.target.value)}
                    placeholder={x.ph}
                    className="w-full resize-none rounded-2xl bg-zinc-900 border border-zinc-700 focus:border-[#39ff88] focus:outline-none px-4 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
              ))}

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                🔒 Your answers go by email, so they'll show the address you send from. Please leave out patient details.
              </p>
            </div>

            <div className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-zinc-800 bg-[#0f141a] space-y-2">
              <button
                onClick={sendEmail}
                disabled={!canSend}
                className="w-full rounded-2xl bg-[#39ff88] text-zinc-950 font-black py-3.5 active:scale-95 transition shadow-[0_0_20px_rgba(57,255,136,0.4)] disabled:opacity-30 disabled:shadow-none"
              >
                ✉️ Send feedback
              </button>
              <button
                onClick={copy}
                disabled={!canSend}
                className="w-full py-2 text-xs font-semibold text-zinc-400 disabled:opacity-40"
              >
                No email app? Copy my answers instead
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
