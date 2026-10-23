"use client";

import { useState, useEffect, useRef } from "react";

/*
  Crew tab for The 13th Hour.
  - Area Pulse: how nurses in your city/state are checking in today   (DEMO DATA)
  - High-Fives: send anonymous encouragement, receive some back       (DEMO DATA)
  - Badges: earned from what you actually do in the app (saved on this device)
  - Invite your crew: share link

  Everything marked DEMO DATA is generated locally so the prototype feels alive.
  Replace those parts with real numbers from a backend later.
*/

const HIGH_FIVE_KEY = "the13thHour.highFives";
const POINTS_PER_HIGH_FIVE = 5;
const PAID_HIGH_FIVES_PER_DAY = 3;

const VIBE_META = [
  { id: "smooth", label: "Code Smooth", icon: "🩺", bar: "bg-emerald-400", text: "text-emerald-300" },
  { id: "short", label: "Short Staffed", icon: "🩹", bar: "bg-yellow-400", text: "text-yellow-300" },
  { id: "overtime", label: "Mandatory Overtime", icon: "⏰", bar: "bg-orange-400", text: "text-orange-300" },
  { id: "drowning", label: "Drowning Together", icon: "🌊", bar: "bg-rose-500", text: "text-rose-300" },
];

const CARDS = [
  { id: "amazing", icon: "🌟", text: "You're doing amazing. Seriously.", tint: "from-amber-400/25 to-amber-600/10" },
  { id: "eat", icon: "🥪", text: "Go eat something. That's an order.", tint: "from-emerald-400/25 to-emerald-600/10" },
  { id: "notalone", icon: "🫂", text: "You're not alone on this one.", tint: "from-purple-400/25 to-purple-600/10" },
  { id: "almost", icon: "⏰", text: "Almost shift change. Hang in there.", tint: "from-orange-400/25 to-orange-600/10" },
  { id: "hero", icon: "🦸", text: "Not all heroes wear capes. Some wear clogs.", tint: "from-sky-400/25 to-sky-600/10" },
  { id: "water", icon: "💧", text: "Drink some water, you beautiful disaster.", tint: "from-cyan-400/25 to-cyan-600/10" },
];

const SEED_INBOX = [
  { card: "notalone", mins: 14 },
  { card: "hero", mins: 52 },
  { card: "eat", mins: 135 },
];

// Small deterministic random generator so demo numbers stay stable per place and day
function seeded(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
}

function ago(mins) {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// DEMO DATA: today's check-ins for an area, shaped so the busiest vibe matches the area's chaos %
function buildPulse(seedKey, pct, scale) {
  const rand = seeded(`${seedKey}|${todayKey()}`);
  const c = Math.max(0, Math.min(1, (pct - 55) / 42));
  const weights = [
    (1 - c) * 0.45 + 0.05 + rand() * 0.05,
    0.28 + rand() * 0.08,
    0.12 + c * 0.2 + rand() * 0.05,
    0.04 + c * 0.45 + rand() * 0.05,
  ];
  const sum = weights.reduce((a, b) => a + b, 0);
  const total = Math.round((18 + rand() * 60) * scale);
  const counts = weights.map((w) => Math.round((w / sum) * total));
  return VIBE_META.map((v, i) => ({ ...v, count: counts[i] }));
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">{children}</h2>
      {right}
    </div>
  );
}

function DemoTag() {
  return (
    <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
      Demo data
    </span>
  );
}

/* ---------- Area Pulse ---------- */
function AreaPulse({ place, stateName, cityPct, statePct, myVibe, onEditLocation }) {
  const [scope, setScope] = useState("city");

  if (!place) {
    return (
      <section className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5 text-center">
        <p className="text-3xl">📍</p>
        <p className="mt-2 font-black">Where's your crew?</p>
        <p className="text-sm text-zinc-400 mt-1">Set your city to see how nurses near you are doing today.</p>
        <button
          onClick={onEditLocation}
          className="mt-4 w-full rounded-2xl bg-[#39ff88] text-zinc-950 font-black py-3 active:scale-95 transition"
        >
          Set my location
        </button>
      </section>
    );
  }

  const isCity = scope === "city";
  const areaName = isCity ? place.city : stateName;
  const rows = buildPulse(isCity ? `${place.city},${place.state}` : place.state, isCity ? cityPct : statePct, isCity ? 1 : 22);
  if (myVibe) {
    const r = rows.find((x) => x.id === myVibe.id);
    if (r) r.count += 1;
  }
  const total = rows.reduce((a, r) => a + r.count, 0);
  const top = rows.reduce((a, r) => (r.count > a.count ? r : a), rows[0]);
  const pct = (n) => Math.round((n / total) * 100);

  return (
    <section className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex rounded-full bg-black/40 p-0.5 text-xs font-black">
          {[
            ["city", "🏙️ City"],
            ["state", "🗺️ State"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setScope(id)}
              className={`rounded-full px-3 py-1.5 transition ${
                scope === id ? (id === "city" ? "bg-[#39ff88] text-zinc-950" : "bg-purple-500 text-white") : "text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <DemoTag />
      </div>

      <p className="mt-4 text-sm text-zinc-400">
        <span className="font-black text-zinc-100 tabular-nums">{total.toLocaleString()}</span> {areaName} nurses checked
        in today
      </p>
      <p className="mt-1 text-lg font-black leading-tight">
        <span className={top.text}>{pct(top.count)}%</span> are {top.label} {top.icon}
      </p>

      {/* Stacked bar */}
      <div className="mt-4 flex h-3 rounded-full overflow-hidden bg-zinc-800">
        {rows.map((r) => (
          <div
            key={r.id}
            className={`${r.bar} transition-all duration-500`}
            style={{ width: `${(r.count / total) * 100}%` }}
            title={r.label}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2.5">
        {rows.map((r) => {
          const mine = myVibe?.id === r.id;
          return (
            <li key={r.id} className="flex items-center gap-3 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${r.bar}`} />
              <span className="flex-1 min-w-0 truncate text-zinc-300">
                {r.label}
                {mine && <span className="ml-1.5 text-[10px] font-black text-[#39ff88]">← YOU</span>}
              </span>
              <span className="tabular-nums text-zinc-500">{r.count.toLocaleString()}</span>
              <span className={`w-10 text-right font-black tabular-nums ${r.text}`}>{pct(r.count)}%</span>
            </li>
          );
        })}
      </ul>

      {myVibe ? (
        <p className="mt-4 rounded-xl bg-black/30 px-3 py-2 text-xs text-zinc-300">
          🫂 You and <span className="font-black">{(rows.find((r) => r.id === myVibe.id)?.count ?? 1) - 1}</span> other{" "}
          {areaName} nurses are {myVibe.label.toLowerCase()} today.
        </p>
      ) : (
        <p className="mt-4 rounded-xl bg-black/30 px-3 py-2 text-xs text-zinc-400">
          Log your vibe on the Shift tab to be counted.
        </p>
      )}
    </section>
  );
}

/* ---------- High-Fives ---------- */
function HighFives({ place, stateCities, onEarn }) {
  const [picked, setPicked] = useState(CARDS[0].id);
  const [flying, setFlying] = useState(false);
  const [data, setData] = useState({ date: todayKey(), sentToday: 0, sentTotal: 0, inbox: [] });
  const timers = useRef([]);
  const dataRef = useRef(data);
  dataRef.current = data;

  const homeCity = place?.city || "your area";
  const otherCities = (stateCities || []).filter((c) => c !== place?.city);
  const randomCity = () =>
    otherCities.length ? otherCities[Math.floor(Math.random() * otherCities.length)] : homeCity;

  useEffect(() => {
    const saved = readJSON(HIGH_FIVE_KEY);
    if (saved) {
      setData({ ...saved, sentToday: saved.date === todayKey() ? saved.sentToday : 0, date: todayKey() });
    } else {
      // DEMO DATA: a few high-fives waiting for first-time users
      const now = Date.now();
      setData((d) => ({
        ...d,
        inbox: SEED_INBOX.map((s, i) => ({
          id: `seed${i}`,
          card: s.card,
          from: i === 0 ? homeCity : otherCities[i % Math.max(1, otherCities.length)] || homeCity,
          at: now - s.mins * 60000,
          unread: i === 0,
        })),
      }));
    }
    return () => timers.current.forEach(clearTimeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = (next) => {
    dataRef.current = next;
    setData(next);
    try {
      localStorage.setItem(HIGH_FIVE_KEY, JSON.stringify(next));
    } catch {}
  };

  const send = () => {
    if (flying) return;
    setFlying(true);
    timers.current.push(
      setTimeout(() => {
        setFlying(false);
        const d = dataRef.current;
        const next = { ...d, date: todayKey(), sentToday: d.sentToday + 1, sentTotal: d.sentTotal + 1 };
        persist(next);
        if (next.sentToday <= PAID_HIGH_FIVES_PER_DAY) {
          onEarn(POINTS_PER_HIGH_FIVE, `🙌 Sent to a nurse in ${homeCity}! +${POINTS_PER_HIGH_FIVE} PTO Points`);
        } else {
          onEarn(0, `🙌 Sent to a nurse in ${homeCity}!`);
        }
      }, 900)
    );
    // DEMO DATA: someone sends one back a few seconds later
    timers.current.push(
      setTimeout(() => {
        const card = CARDS[Math.floor(Math.random() * CARDS.length)];
        const from = randomCity();
        const d = dataRef.current;
        persist({
          ...d,
          inbox: [{ id: `r${Date.now()}`, card: card.id, from, at: Date.now(), unread: true }, ...d.inbox].slice(0, 20),
        });
        onEarn(0, `${card.icon} A nurse in ${from} sent you a high-five!`);
      }, 4000)
    );
  };

  const markRead = (id) => persist({ ...data, inbox: data.inbox.map((m) => (m.id === id ? { ...m, unread: false } : m)) });

  const card = CARDS.find((c) => c.id === picked);
  const unread = data.inbox.filter((m) => m.unread).length;

  return (
    <>
      <section>
        <SectionTitle right={<DemoTag />}>Send a high-five 🙌</SectionTitle>
        <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-4">
          {/* Preview */}
          <div className="relative h-28">
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.tint} border border-white/10 p-4 flex items-center gap-3 transition-all duration-700 ease-in ${
                flying ? "-translate-y-24 rotate-6 scale-75 opacity-0" : ""
              }`}
            >
              <span className="text-4xl">{card.icon}</span>
              <p className="text-base font-black leading-snug">{card.text}</p>
            </div>
          </div>

          {/* Card picker */}
          <div className="mt-3 grid grid-cols-6 gap-2">
            {CARDS.map((c) => (
              <button
                key={c.id}
                onClick={() => setPicked(c.id)}
                aria-label={c.text}
                className={`aspect-square rounded-xl text-xl flex items-center justify-center border transition active:scale-90 ${
                  picked === c.id ? "border-[#39ff88] bg-[#39ff88]/10" : "border-zinc-800 bg-black/30"
                }`}
              >
                {c.icon}
              </button>
            ))}
          </div>

          <button
            onClick={send}
            disabled={flying}
            className="mt-4 w-full rounded-2xl bg-purple-600 font-black py-3.5 active:scale-95 transition shadow-[0_0_20px_rgba(168,85,247,0.45)] disabled:opacity-60"
          >
            {flying ? "Sending… 🚀" : `🙌 Send to a nurse in ${homeCity}`}
          </button>
          <p className="mt-2 text-center text-[11px] text-zinc-500">
            Anonymous · You've sent {data.sentTotal} · First {PAID_HIGH_FIVES_PER_DAY} a day earn +{POINTS_PER_HIGH_FIVE} PTO
          </p>
        </div>
      </section>

      <section>
        <SectionTitle
          right={
            unread > 0 ? (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">{unread} new</span>
            ) : null
          }
        >
          Your high-fives 💌
        </SectionTitle>
        <div className="rounded-3xl bg-zinc-900/95 border border-zinc-800 divide-y divide-zinc-800 overflow-hidden">
          {data.inbox.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">Nothing yet. Send one — they come back around.</p>
          )}
          {data.inbox.map((m) => {
            const c = CARDS.find((x) => x.id === m.card) || CARDS[0];
            return (
              <button
                key={m.id}
                onClick={() => markRead(m.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition ${m.unread ? "bg-purple-500/10" : ""}`}
              >
                <span className="text-2xl w-8 text-center">{c.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[11px] text-zinc-500">
                    A nurse in {m.from} · {ago(Math.round((Date.now() - m.at) / 60000))}
                  </span>
                  <span className={`block text-sm leading-snug ${m.unread ? "font-black" : "font-semibold text-zinc-300"}`}>
                    {c.text}
                  </span>
                </span>
                {m.unread && <span className="mt-1.5 w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
}

/* ---------- Badges ---------- */
function Badges({ karma, vibeCounts }) {
  const [stats, setStats] = useState({ vent: 0, checkin: {}, breaks: {}, fives: 0 });

  // Re-read device stats whenever points change (points change when anything is completed)
  useEffect(() => {
    const vent = readJSON("the13thHour.ventStats");
    const checkin = readJSON("the13thHour.checkin");
    const breaks = readJSON("the13thHour.breakStats");
    const fives = readJSON(HIGH_FIVE_KEY);
    setStats({
      vent: vent?.total || 0,
      checkin: checkin?.date === todayKey() ? checkin : {},
      breaks: breaks || {},
      fives: fives?.sentTotal || 0,
    });
  }, [karma]);

  const vc = vibeCounts || {};
  const list = [
    { icon: "🩺", name: "First Check-In", how: "Log a shift vibe", got: Object.values(vc).some((n) => n > 0) },
    { icon: "🌊", name: "Meltdown Survivor", how: "Log a Drowning Together shift", got: (vc.drowning || 0) > 0 },
    { icon: "💧", name: "Hydration Hero", how: "Check off water today", got: !!stats.checkin.done?.water },
    { icon: "🏆", name: "Fully Human", how: "All 4 body check-ins in a day", got: !!stats.checkin.bonus },
    { icon: "🥪", name: "Took a Real Lunch", how: "Finish a 30-minute break", got: (stats.breaks[30] || 0) > 0 },
    { icon: "🫁", name: "Deep Breather", how: "Finish box breathing", got: (stats.breaks[1] || 0) > 0 },
    { icon: "🗑️", name: "Shred Master", how: "Shred 3 vents", got: stats.vent >= 3 },
    { icon: "🙌", name: "Crew Cheerleader", how: "Send 3 high-fives", got: stats.fives >= 3 },
    { icon: "🏖️", name: "PTO Hoarder", how: "Earn 100 PTO Points", got: karma >= 100 },
  ];
  const earned = list.filter((b) => b.got).length;

  return (
    <section>
      <SectionTitle
        right={
          <span className="text-[11px] font-semibold text-zinc-500 tabular-nums">
            {earned} / {list.length}
          </span>
        }
      >
        Your badges 🎖️
      </SectionTitle>
      <div className="grid grid-cols-3 gap-2.5">
        {list.map((b) => (
          <div
            key={b.name}
            className={`rounded-2xl border p-3 text-center ${
              b.got ? "border-[#39ff88]/40 bg-[#39ff88]/5" : "border-zinc-800 bg-zinc-900/95"
            }`}
          >
            <div className={`text-2xl ${b.got ? "" : "grayscale opacity-30"}`}>{b.icon}</div>
            <p className={`mt-1.5 text-[11px] font-black leading-tight ${b.got ? "text-zinc-100" : "text-zinc-500"}`}>
              {b.name}
            </p>
            <p className="mt-1 text-[9px] text-zinc-500 leading-tight">{b.got ? "Earned ✓" : b.how}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-zinc-600">No leaderboards. Burnout isn't a competition.</p>
    </section>
  );
}

/* ---------- The tab ---------- */
export default function CrewTab({
  place,
  stateName,
  stateCities,
  cityPct,
  statePct,
  myVibe,
  vibeCounts,
  karma,
  onEarn,
  onEditLocation,
}) {
  const invite = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const text = "I've been using The 13th Hour to survive my shifts 🩺 Log your vibe, shred your rants, take an actual break. Join my crew:";
    try {
      if (navigator.share) {
        await navigator.share({ title: "The 13th Hour", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      onEarn(0, "📋 Invite link copied!");
    } catch {
      onEarn(0, "📤 Invite ready to share (demo)");
    }
  };

  return (
    <div className="space-y-7">
      <section className="px-1">
        <p className="text-2xl font-black leading-tight">
          You're not the only one <span className="text-rose-400">drowning.</span>
        </p>
        <p className="text-sm text-zinc-400 mt-1">See how your area is holding up, and send some love to a nurse who needs it.</p>
      </section>

      <section>
        <SectionTitle>Area pulse 📡</SectionTitle>
        <AreaPulse
          place={place}
          stateName={stateName}
          cityPct={cityPct}
          statePct={statePct}
          myVibe={myVibe}
          onEditLocation={onEditLocation}
        />
      </section>

      <HighFives place={place} stateCities={stateCities} onEarn={onEarn} />

      <Badges karma={karma} vibeCounts={vibeCounts} />

      <section className="rounded-3xl bg-gradient-to-br from-purple-900/60 to-emerald-900/40 border border-purple-400/30 p-5 text-center">
        <p className="text-3xl">👩‍⚕️👨‍⚕️🧑‍⚕️</p>
        <p className="mt-2 font-black">Bring your crew</p>
        <p className="text-sm text-zinc-300 mt-1">The break room's more fun with your people in it.</p>
        <button
          onClick={invite}
          className="mt-4 w-full rounded-2xl bg-[#39ff88] text-zinc-950 font-black py-3.5 active:scale-95 transition shadow-[0_0_20px_rgba(57,255,136,0.45)]"
        >
          📤 Invite coworkers
        </button>
      </section>
    </div>
  );
}
