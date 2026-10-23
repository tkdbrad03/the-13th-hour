"use client";

import { useState, useEffect } from "react";

/*
  Breaks tab for The 13th Hour.
  - "I have ___ minutes" picker → box breathing (1), stretches (5), break timer (15 / 30)
  - Body check-in (water, bathroom, food, sitting), saved for today on this device
  - Earns PTO Points through the onEarn(points, message) callback from the main app
*/

const CHECKIN_KEY = "the13thHour.checkin";
const BREAK_STATS_KEY = "the13thHour.breakStats";

const OPTIONS = [
  { min: 1, label: "1 min", icon: "🫁", name: "Box Breathing", blurb: "Reset your nervous system between call lights." },
  { min: 5, label: "5 min", icon: "🧘", name: "12-Hour Shift Stretches", blurb: "Feet, back and neck — the usual suspects." },
  { min: 15, label: "15 min", icon: "☕", name: "Real Break", blurb: "Phone down. Feet up. Nobody's paging you." },
  { min: 30, label: "30 min", icon: "🥪", name: "Actual Lunch", blurb: "Sit. Chew. Swallow. Repeat. Revolutionary." },
];

const POINTS = { 1: 10, 5: 20, 15: 30, 30: 50 };

const STRETCHES = [
  { icon: "🦶", name: "Calf Raises", how: "Hold the counter. Rise onto your toes, lower slowly. Your calves have walked a marathon." },
  { icon: "🔄", name: "Ankle Circles", how: "Lift one foot, circle it 10 times each way, then switch. Clogs off if you can." },
  { icon: "🦵", name: "Standing Hip Opener", how: "Step one foot back into a small lunge and gently press your hips forward. Switch at halfway." },
  { icon: "🙆", name: "Shoulder Rolls", how: "Roll your shoulders back 10 times, then forward 10. Drop them away from your ears." },
  { icon: "😌", name: "Neck Release", how: "Ear toward shoulder, breathe for a few seconds, then switch sides. No forcing it." },
];
const STRETCH_SECONDS = 60;

const BREATH_PHASES = [
  { label: "Breathe in", scale: 1 },
  { label: "Hold", scale: 1 },
  { label: "Breathe out", scale: 0.55 },
  { label: "Hold", scale: 0.55 },
];
const BREATH_SECONDS = 4;
const BREATH_ROUNDS = 4;

const CHECKS = [
  { id: "water", icon: "💧", label: "Drank water", sub: "From your own bottle. Ice chips don't count." },
  { id: "bathroom", icon: "🚻", label: "Used the bathroom", sub: "Before it became a rapid response." },
  { id: "food", icon: "🥪", label: "Ate something real", sub: "Graham crackers are a garnish." },
  { id: "sat", icon: "🪑", label: "Sat down", sub: "For longer than it takes to chart one vitals set." },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function playChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [660, 880].forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.35;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.3);
    });
  } catch {}
  try {
    navigator.vibrate?.([150, 80, 150]);
  } catch {}
}

// Re-renders every `ms` while running and returns Date.now()
function useNow(running, ms = 200) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [running, ms]);
  return now;
}

function fmt(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">{children}</h2>
      {right}
    </div>
  );
}

function PrimaryButton({ children, onClick, tone = "green" }) {
  const tones = {
    green: "bg-[#39ff88] text-zinc-950 shadow-[0_0_20px_rgba(57,255,136,0.45)]",
    purple: "bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)]",
  };
  return (
    <button onClick={onClick} className={`w-full rounded-2xl font-black py-3.5 active:scale-95 transition ${tones[tone]}`}>
      {children}
    </button>
  );
}

function GhostButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-2xl border border-zinc-700 py-3 text-sm font-bold text-zinc-300 active:scale-95 transition"
    >
      {children}
    </button>
  );
}

function DoneCard({ icon, title, points, onAgain }) {
  return (
    <div className="text-center py-2">
      <div className="text-5xl">{icon}</div>
      <p className="mt-3 text-lg font-black">{title}</p>
      <p className="mt-1 text-sm text-[#39ff88] font-bold">+{points} PTO Points 🏖️</p>
      <button onClick={onAgain} className="mt-4 text-sm font-semibold text-zinc-400 underline underline-offset-4">
        Do it again
      </button>
    </div>
  );
}

/* ---------- 1 min: box breathing ---------- */
function BoxBreathing({ onDone }) {
  const [startAt, setStartAt] = useState(null);
  const [done, setDone] = useState(false);
  const now = useNow(startAt !== null, 100);

  const elapsed = startAt ? Math.max(0, (now - startAt) / 1000) : 0;
  const total = BREATH_SECONDS * BREATH_PHASES.length * BREATH_ROUNDS;
  const step = Math.floor(elapsed / BREATH_SECONDS);
  const phase = BREATH_PHASES[step % BREATH_PHASES.length];
  const round = Math.min(BREATH_ROUNDS, Math.floor(step / BREATH_PHASES.length) + 1);
  const count = BREATH_SECONDS - Math.floor(elapsed % BREATH_SECONDS);

  useEffect(() => {
    if (startAt && elapsed >= total && !done) {
      setDone(true);
      setStartAt(null);
      playChime();
      onDone();
    }
  }, [elapsed, total, startAt, done, onDone]);

  if (done) return <DoneCard icon="🫁" title="Nervous system: reset." points={POINTS[1]} onAgain={() => setDone(false)} />;

  const running = startAt !== null;
  return (
    <div>
      <div className="relative mx-auto my-2 w-52 h-52 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30" />
        <div
          className="absolute inset-3 rounded-full bg-gradient-to-br from-[#39ff88]/70 to-purple-500/70 shadow-[0_0_40px_rgba(57,255,136,0.35)]"
          style={{
            transform: `scale(${running ? phase.scale : 0.55})`,
            transition: `transform ${BREATH_SECONDS}s ease-in-out`,
          }}
        />
        <div className="relative text-center">
          <p className="text-lg font-black text-white drop-shadow">{running ? phase.label : "Ready?"}</p>
          {running && <p className="text-3xl font-black text-white tabular-nums drop-shadow">{count}</p>}
        </div>
      </div>
      <p className="text-center text-xs text-zinc-500 mb-4">
        {running ? `Round ${round} of ${BREATH_ROUNDS}` : "4 counts in · 4 hold · 4 out · 4 hold — about one minute"}
      </p>
      {running ? (
        <div className="flex gap-3">
          <GhostButton onClick={() => setStartAt(null)}>Stop</GhostButton>
        </div>
      ) : (
        <PrimaryButton onClick={() => setStartAt(Date.now())}>Start breathing</PrimaryButton>
      )}
    </div>
  );
}

/* ---------- 5 min: stretches ---------- */
function Stretches({ speed, onDone }) {
  const [idx, setIdx] = useState(0);
  const [stepStart, setStepStart] = useState(null);
  const [done, setDone] = useState(false);
  const now = useNow(stepStart !== null);

  const stepLen = STRETCH_SECONDS / speed;
  const elapsed = stepStart ? Math.max(0, (now - stepStart) / 1000) : 0;
  const left = stepLen - elapsed;

  const next = () => {
    if (idx < STRETCHES.length - 1) {
      setIdx((i) => i + 1);
      setStepStart(Date.now());
    } else {
      setStepStart(null);
      setDone(true);
      playChime();
      onDone();
    }
  };

  useEffect(() => {
    if (stepStart && left <= 0) next();
  }, [left, stepStart]); // eslint-disable-line react-hooks/exhaustive-deps

  if (done)
    return (
      <DoneCard
        icon="🧘"
        title="Feet un-crumpled."
        points={POINTS[5]}
        onAgain={() => {
          setDone(false);
          setIdx(0);
        }}
      />
    );

  const s = STRETCHES[idx];
  const running = stepStart !== null;
  return (
    <div>
      <div className="flex gap-1.5 mb-4">
        {STRETCHES.map((_, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-[#39ff88]"
              style={{
                width: i < idx ? "100%" : i === idx && running ? `${Math.min(100, (elapsed / stepLen) * 100)}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-start gap-4">
        <span className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-400/15 flex items-center justify-center text-3xl">
          {s.icon}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-zinc-500">
            Stretch {idx + 1} of {STRETCHES.length}
          </p>
          <p className="text-lg font-black leading-tight">{s.name}</p>
          <p className="text-sm text-zinc-400 mt-1 leading-snug">{s.how}</p>
        </div>
      </div>

      <p className="mt-4 text-center text-4xl font-black tabular-nums">{fmt(running ? left : stepLen)}</p>

      <div className="mt-4">
        {running ? (
          <div className="flex gap-3">
            <GhostButton onClick={() => setStepStart(null)}>Pause</GhostButton>
            <GhostButton onClick={next}>Skip ›</GhostButton>
          </div>
        ) : (
          <PrimaryButton onClick={() => setStepStart(Date.now())}>
            {idx === 0 ? "Start stretching" : "Resume"}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

/* ---------- 15 / 30 min: break timer ---------- */
function BreakTimer({ minutes, speed, onDone, onEarlyEnd }) {
  const totalSec = (minutes * 60) / speed;
  const [endAt, setEndAt] = useState(null);
  const [pausedLeft, setPausedLeft] = useState(null);
  const [done, setDone] = useState(false);
  const now = useNow(endAt !== null);

  const left = endAt ? Math.min(totalSec, (endAt - now) / 1000) : pausedLeft ?? totalSec;
  const running = endAt !== null;
  const started = running || pausedLeft !== null;

  useEffect(() => {
    if (endAt && left <= 0 && !done) {
      setEndAt(null);
      setPausedLeft(null);
      setDone(true);
      playChime();
      onDone();
    }
  }, [left, endAt, done, onDone]);

  if (done)
    return (
      <DoneCard
        icon={minutes >= 30 ? "🥪" : "☕"}
        title={minutes >= 30 ? "You ate lunch. Sitting down. Legend." : "A whole break. Unbothered."}
        points={POINTS[minutes]}
        onAgain={() => setDone(false)}
      />
    );

  const pct = Math.max(0, Math.min(1, left / totalSec));
  const R = 88;
  const C = 2 * Math.PI * R;

  return (
    <div>
      {started && (
        <div className="flex justify-center mb-3">
          <span className="rounded-full bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs font-black px-3 py-1">
            🚫📟 ACTUALLY ON BREAK
          </span>
        </div>
      )}
      <div className="relative mx-auto w-52 h-52">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="#27272a" strokeWidth="12" />
          <circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="url(#breakGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            style={{ transition: "stroke-dashoffset 0.25s linear" }}
          />
          <defs>
            <linearGradient id="breakGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#39ff88" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-black tabular-nums">{fmt(left)}</p>
          <p className="text-xs text-zinc-500 mt-1">{running ? "of pure peace" : started ? "paused" : `${minutes} minutes`}</p>
        </div>
      </div>

      <div className="mt-5">
        {!started && (
          <PrimaryButton onClick={() => setEndAt(Date.now() + totalSec * 1000)}>Start my break</PrimaryButton>
        )}
        {started && (
          <div className="flex gap-3">
            {running ? (
              <GhostButton
                onClick={() => {
                  setPausedLeft(left);
                  setEndAt(null);
                }}
              >
                Pause
              </GhostButton>
            ) : (
              <GhostButton
                onClick={() => {
                  setEndAt(Date.now() + left * 1000);
                  setPausedLeft(null);
                }}
              >
                Resume
              </GhostButton>
            )}
            <GhostButton
              onClick={() => {
                setEndAt(null);
                setPausedLeft(null);
                onEarlyEnd();
              }}
            >
              End early
            </GhostButton>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Body check-in ---------- */
function BodyCheckin({ onEarn }) {
  const [state, setState] = useState({ date: todayKey(), done: {}, earned: {}, bonus: false });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CHECKIN_KEY));
      if (saved?.date === todayKey()) setState(saved);
    } catch {}
  }, []);

  const save = (next) => {
    setState(next);
    try {
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(next));
    } catch {}
  };

  const toggle = (c) => {
    const isOn = !state.done[c.id];
    const next = { ...state, done: { ...state.done, [c.id]: isOn }, earned: { ...state.earned } };
    if (isOn && !state.earned[c.id]) {
      next.earned[c.id] = true;
      onEarn(5, `${c.icon} +5 PTO Points`);
    }
    const allDone = CHECKS.every((x) => next.done[x.id]);
    if (allDone && !state.bonus) {
      next.bonus = true;
      setTimeout(() => onEarn(10, "🏆 Fully human today! +10 bonus"), 700);
    }
    save(next);
  };

  const count = CHECKS.filter((c) => state.done[c.id]).length;

  return (
    <section>
      <SectionTitle right={<span className="text-[11px] font-semibold text-zinc-500 tabular-nums">{count} / 4 today</span>}>
        Body check-in 🩺
      </SectionTitle>
      <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
        {CHECKS.map((c) => {
          const on = !!state.done[c.id];
          return (
            <button
              key={c.id}
              onClick={() => toggle(c)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-zinc-800/60 transition"
            >
              <span className="text-2xl w-8 text-center">{c.icon}</span>
              <span className="flex-1 min-w-0">
                <span className={`block font-bold ${on ? "text-zinc-500 line-through" : ""}`}>{c.label}</span>
                <span className="block text-[11px] text-zinc-500 leading-snug">{c.sub}</span>
              </span>
              <span
                className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center text-sm font-black transition ${
                  on ? "bg-[#39ff88] border-[#39ff88] text-zinc-950" : "border-zinc-600"
                }`}
              >
                {on ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
      {count === 4 && (
        <p className="mt-3 text-center text-sm font-bold text-[#39ff88]">🏆 Fully human today. Look at you.</p>
      )}
    </section>
  );
}

/* ---------- The tab ---------- */
export default function BreaksTab({ onEarn }) {
  const [minutes, setMinutes] = useState(1);
  const [demo, setDemo] = useState(false);
  const opt = OPTIONS.find((o) => o.min === minutes);
  const speed = demo ? 60 : 1;

  const finish = () => {
    // Count completed breaks by length (used for Crew badges)
    try {
      const stats = JSON.parse(localStorage.getItem(BREAK_STATS_KEY)) || {};
      stats[minutes] = (stats[minutes] || 0) + 1;
      localStorage.setItem(BREAK_STATS_KEY, JSON.stringify(stats));
    } catch {}
    onEarn(POINTS[minutes], `${opt.icon} Break complete! +${POINTS[minutes]} PTO Points`);
  };

  return (
    <div className="space-y-7">
      <section>
        <SectionTitle>I have ___ minutes ⏱️</SectionTitle>
        <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="Break length">
          {OPTIONS.map((o) => {
            const active = o.min === minutes;
            return (
              <button
                key={o.min}
                role="tab"
                aria-selected={active}
                onClick={() => setMinutes(o.min)}
                className={`rounded-2xl border py-3 flex flex-col items-center gap-1 transition active:scale-95 ${
                  active
                    ? "bg-[#39ff88] border-[#39ff88] text-zinc-950 shadow-[0_0_16px_rgba(57,255,136,0.4)]"
                    : "bg-zinc-900/95 border-zinc-800 text-zinc-300"
                }`}
              >
                <span className="text-xl">{o.icon}</span>
                <span className="text-xs font-black">{o.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl bg-zinc-900/95 border border-emerald-400/25 p-5 shadow-[0_0_30px_rgba(57,255,136,0.08)]">
        <div className="mb-4">
          <p className="text-lg font-black leading-tight">{opt.name}</p>
          <p className="text-sm text-zinc-400 mt-0.5">{opt.blurb}</p>
        </div>
        {/* key resets the activity when the length or demo speed changes */}
        {minutes === 1 && <BoxBreathing key="b" onDone={finish} />}
        {minutes === 5 && <Stretches key={`s${speed}`} speed={speed} onDone={finish} />}
        {minutes >= 15 && (
          <BreakTimer
            key={`t${minutes}${speed}`}
            minutes={minutes}
            speed={speed}
            onDone={finish}
            onEarlyEnd={() => onEarn(0, "💜 Any break counts. Even a short one.")}
          />
        )}
      </section>

      <BodyCheckin onEarn={onEarn} />

      <div className="flex justify-center">
        <button
          onClick={() => setDemo((d) => !d)}
          className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
            demo ? "border-amber-400/60 text-amber-300 bg-amber-400/10" : "border-zinc-800 text-zinc-500"
          }`}
        >
          ⚡ Demo speed {demo ? "ON — 1 minute = 1 second" : "off"}
        </button>
      </div>
    </div>
  );
}
