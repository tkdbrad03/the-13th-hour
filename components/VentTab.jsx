"use client";

import { useState, useEffect, useRef } from "react";

/*
  Vent tab for The 13th Hour — "The Shredder".
  Nurses type what's on their mind, tap Shred It, and watch it get destroyed.
  The text is NEVER saved or sent anywhere. Only a count of shreds per day is kept on this device.
*/

const STATS_KEY = "the13thHour.ventStats";
const POINTS_PER_SHRED = 10;
const PAID_SHREDS_PER_DAY = 3;
const SHRED_MS = 2400;

const PROMPTS = [
  "Worst call light of the shift",
  "Thing I wish I could say to admin",
  "The 0300 moment that broke me",
  "What I'd say if HR wasn't listening",
  "The order that made me scream internally",
  "Why I'm still in my car in the parking lot",
  "The family member who tested me today",
  "Things I'll never say at huddle",
];

const MOODS = [
  { id: "lighter", icon: "😮‍💨", label: "Lighter", reply: "That's the stuff. Go drink some water. 💜" },
  { id: "same", icon: "😐", label: "Same", reply: "Valid. Some shifts need two shreds." },
  { id: "mad", icon: "😤", label: "Still mad", reply: "Fair. Your feelings are clinically appropriate." },
];

// Gentle nudges when something looks like patient info (it still gets shredded either way)
const PHI_PATTERNS = [
  /\b(rm|room|bed)\s*#?\s*\d+/i,
  /\bMRN\b/i,
  /\bDOB\b/i,
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
  /\bpt\.?\s+[A-Z][a-z]+\b/,
];

const STRIPS = 16;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function playShredSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const dur = 1.6;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // gritty, chopped noise
      const chop = Math.sin(i / 90) > 0 ? 1 : 0.35;
      data[i] = (Math.random() * 2 - 1) * chop;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1800;
    band.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime + dur - 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(band).connect(gain).connect(ctx.destination);
    src.start();
  } catch {}
  try {
    navigator.vibrate?.([40, 30, 40, 30, 40, 30, 80]);
  } catch {}
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">{children}</h2>
      {right}
    </div>
  );
}

export default function VentTab({ onEarn, onNavigate }) {
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState(null);
  const [phase, setPhase] = useState("write"); // write | shredding | done
  const [mood, setMood] = useState(null);
  const [stats, setStats] = useState({ date: todayKey(), today: 0, total: 0 });
  const timer = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STATS_KEY));
      if (saved) setStats({ ...saved, today: saved.date === todayKey() ? saved.today : 0, date: todayKey() });
    } catch {}
    return () => clearTimeout(timer.current);
  }, []);

  const phiHint = PHI_PATTERNS.some((re) => re.test(text));
  const canShred = text.trim().length > 0 && phase === "write";

  const shred = () => {
    if (!canShred) return;
    setPhase("shredding");
    playShredSound();
    timer.current = setTimeout(() => {
      setText(""); // gone for good — never stored
      setPhase("done");
      setMood(null);
      const next = { date: todayKey(), today: stats.today + 1, total: stats.total + 1 };
      setStats(next);
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch {}
      if (next.today <= PAID_SHREDS_PER_DAY) {
        onEarn(POINTS_PER_SHRED, `🗑️ Shredded! +${POINTS_PER_SHRED} PTO Points`);
      } else {
        onEarn(0, "🗑️ Shredded. Gone forever.");
      }
    }, SHRED_MS);
  };

  const again = () => {
    setPhase("write");
    setMood(null);
    setPrompt(null);
  };

  const surprise = () => {
    let p = prompt;
    while (p === prompt) p = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(p);
  };

  const shredding = phase === "shredding";

  return (
    <div className="space-y-7">
      <style>{`
        @keyframes vent-feed { 0% { transform: translateY(0); } 15% { transform: translateY(4px); } 100% { transform: translateY(108%); } }
        @keyframes vent-strip {
          0% { transform: translateY(-110%) rotate(0deg); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(150px) rotate(var(--r)); opacity: 0; }
        }
        @keyframes vent-rumble { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-1.5px); } 75% { transform: translateX(1.5px); } }
        @keyframes vent-pop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Intro */}
      <section className="px-1">
        <p className="text-2xl font-black leading-tight">
          Say it. <span className="text-[#39ff88]">Shred it.</span> <span className="text-purple-400">Done.</span>
        </p>
        <p className="text-sm text-zinc-400 mt-1">
          Type whatever you can't say out loud. It gets destroyed — never saved, never sent, never seen. Not even by us.
        </p>
      </section>

      {phase !== "done" && (
        <>
          {/* Prompts */}
          <section>
            <SectionTitle
              right={
                <button onClick={surprise} className="text-[11px] font-semibold text-purple-300 active:scale-95 transition">
                  🎲 Surprise me
                </button>
              }
            >
              Need a starting point?
            </SectionTitle>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 [scrollbar-width:none]">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  disabled={shredding}
                  onClick={() => setPrompt(prompt === p ? null : p)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    prompt === p
                      ? "bg-purple-500 border-purple-500 text-white"
                      : "bg-zinc-900/95 border-zinc-800 text-zinc-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          {/* Paper + shredder */}
          <section>
            {/* Paper — clipped so it disappears into the shredder slot */}
            <div className="relative overflow-hidden rounded-t-xl px-2 pt-1">
              <div
                className="relative rounded-t-xl bg-[#fffbe6] text-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
                style={shredding ? { animation: `vent-feed ${SHRED_MS * 0.6}ms ease-in forwards` } : undefined}
              >
                {/* legal pad lines + margin */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-t-xl"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, transparent 38px, #fca5a5 38px, #fca5a5 39px, transparent 39px), repeating-linear-gradient(transparent, transparent 27px, #bfdbfe 28px)",
                    backgroundPositionY: "0, 52px",
                  }}
                />
                <div className="relative pl-12 pr-4 pt-4 pb-3">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                    {prompt ? "Prompt" : "Confidential · For shredding only"}
                  </p>
                  <p className="text-sm font-black text-purple-700 leading-snug min-h-[20px]">
                    {prompt || "Dear shift, …"}
                  </p>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    readOnly={shredding}
                    rows={6}
                    maxLength={2000}
                    placeholder="Let it out. Nobody's reading this."
                    aria-label="Your vent"
                    className="mt-1 w-full resize-none bg-transparent text-[15px] leading-[28px] font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* The machine */}
            <div
              className="relative z-10 rounded-2xl bg-gradient-to-b from-zinc-700 to-zinc-800 border border-zinc-600 px-4 pt-3 pb-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
              style={shredding ? { animation: "vent-rumble 0.12s linear infinite" } : undefined}
            >
              <div className="h-2 rounded-full bg-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]" />
              <div className="mt-2.5 flex items-center justify-between">
                <p className="text-[9px] font-black tracking-[0.2em] text-zinc-400">SHRED-O-MATIC 3000</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-zinc-500">{shredding ? "SHREDDING" : "READY"}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      shredding ? "bg-rose-500 animate-pulse" : canShred ? "bg-[#39ff88] shadow-[0_0_8px_#39ff88]" : "bg-zinc-600"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Falling strips */}
            <div className="relative h-0 overflow-visible" aria-hidden="true">
              {shredding && (
                <div className="absolute inset-x-6 top-0 h-[150px] overflow-hidden flex justify-between">
                  {Array.from({ length: STRIPS }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[5%] h-24 bg-[#fffbe6]"
                      style={{
                        backgroundImage: "repeating-linear-gradient(transparent, transparent 9px, #bfdbfe 10px)",
                        "--r": `${(i % 2 ? 1 : -1) * (6 + (i * 7) % 18)}deg`,
                        animation: `vent-strip ${900 + (i % 4) * 150}ms ${250 + ((i * 53) % 700)}ms ease-in forwards`,
                        transform: "translateY(-110%)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className={`transition-opacity ${shredding ? "opacity-0" : "opacity-100"}`}>
              {phiHint && (
                <p className="mt-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-200 leading-snug">
                  ⚠️ That looks like a room number, date or ID. It'll still be shredded, but leaving patient details out is a
                  good habit.
                </p>
              )}

              <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-zinc-500">
                <span>🔒 No patient info · HIPAA-friendly venting</span>
                <span className="tabular-nums">{text.length} / 2000</span>
              </div>

              <button
                onClick={shred}
                disabled={!canShred}
                className="mt-4 w-full rounded-2xl bg-rose-500 text-white font-black py-4 text-lg active:scale-95 transition shadow-[0_0_24px_rgba(244,63,94,0.45)] disabled:opacity-30 disabled:shadow-none disabled:active:scale-100"
              >
                🗑️ Shred It
              </button>
            </div>
            {shredding && <div className="h-[150px]" />}
          </section>
        </>
      )}

      {/* After shredding: mood check-out */}
      {phase === "done" && (
        <section
          className="rounded-3xl bg-zinc-900/95 border border-[#39ff88]/40 p-6 text-center shadow-[0_0_30px_rgba(57,255,136,0.12)]"
          style={{ animation: "vent-pop 0.35s ease-out" }}
        >
          <div className="text-5xl">🗑️✨</div>
          <p className="mt-3 text-xl font-black">Gone. Forever.</p>
          <p className="text-sm text-zinc-400 mt-1">Every word was destroyed. Nothing was saved.</p>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">How do you feel now?</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m)}
                className={`rounded-2xl border py-3 flex flex-col items-center gap-1 transition active:scale-95 ${
                  mood?.id === m.id ? "border-purple-400 bg-purple-500/20" : "border-zinc-800 bg-black/30"
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span className="text-xs font-bold text-zinc-300">{m.label}</span>
              </button>
            ))}
          </div>

          {mood && (
            <div className="mt-5" style={{ animation: "vent-pop 0.25s ease-out" }}>
              <p className="text-sm font-semibold text-zinc-200">{mood.reply}</p>
              {mood.id === "mad" && (
                <button
                  onClick={() => onNavigate("breaks")}
                  className="mt-3 w-full rounded-2xl bg-purple-600 font-black py-3 active:scale-95 transition shadow-[0_0_20px_rgba(168,85,247,0.45)]"
                >
                  🫁 Take a 1-minute breather
                </button>
              )}
            </div>
          )}

          <button
            onClick={again}
            className="mt-5 w-full rounded-2xl border border-zinc-700 py-3 text-sm font-bold text-zinc-300 active:scale-95 transition"
          >
            {mood?.id === "same" ? "🗑️ Shred another" : "Write another"}
          </button>
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-zinc-900/95 border border-zinc-800 p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Shredded today</p>
          <p className="text-2xl font-black tabular-nums mt-1">{stats.today}</p>
        </div>
        <div className="rounded-2xl bg-zinc-900/95 border border-zinc-800 p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">All-time shreds</p>
          <p className="text-2xl font-black tabular-nums mt-1">{stats.total}</p>
        </div>
      </section>
      <p className="text-center text-[11px] text-zinc-600 -mt-3">
        First {PAID_SHREDS_PER_DAY} shreds each day earn +{POINTS_PER_SHRED} PTO Points.
      </p>
    </div>
  );
}
