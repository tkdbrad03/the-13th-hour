"use client";

import { useState, useEffect, useRef } from "react";
import BreaksTab from "./BreaksTab";
import VentTab from "./VentTab";
import CrewTab from "./CrewTab";
import FeedbackSheet from "./FeedbackSheet";
import CodeTeamWelcome, { CODE_TEAM_KEY, isCodeTeamLink } from "./CodeTeamWelcome";

/*
  The 13th Hour — nurse stress-relief app prototype
  Single React component, Tailwind CSS only, no extra dependencies.

  Drop into a Next.js app (e.g. app/page.jsx → `export { default } from "./The13thHour"`)
  or a Vite/CRA project with Tailwind configured.

  To make the Vault download a real file, put your PDF in /public and set GUIDE_URL below,
  e.g. "/remote-nursing-exit-strategy-guide.pdf". While it's null, the button shows a demo toast.
*/
const GUIDE_URL = null;

const VIBES = [
  {
    id: "smooth",
    dot: "🟢",
    icon: "🩺",
    label: "Code Smooth",
    desc: "A surprisingly quiet shift",
    meter: 2,
    karma: 5,
    ring: "ring-emerald-400/60",
    glow: "shadow-[0_0_24px_rgba(52,211,153,0.35)]",
    text: "text-emerald-300",
    tint: "bg-emerald-400/15",
  },
  {
    id: "short",
    dot: "🟡",
    icon: "🩹",
    label: "Short Staffed",
    desc: "Standard floor chaos",
    meter: 4,
    karma: 15,
    ring: "ring-yellow-400/60",
    glow: "shadow-[0_0_24px_rgba(250,204,21,0.35)]",
    text: "text-yellow-300",
    tint: "bg-yellow-400/15",
  },
  {
    id: "overtime",
    dot: "🟠",
    icon: "⏰",
    label: "Mandatory Overtime",
    desc: "Stuck for extra hours",
    meter: 6,
    karma: 25,
    ring: "ring-orange-400/60",
    glow: "shadow-[0_0_24px_rgba(251,146,60,0.35)]",
    text: "text-orange-300",
    tint: "bg-orange-400/15",
  },
  {
    id: "drowning",
    dot: "🔴",
    icon: "🌊",
    label: "Drowning Together",
    desc: "Total unit meltdown",
    meter: 8,
    karma: 40,
    ring: "ring-rose-500/60",
    glow: "shadow-[0_0_24px_rgba(244,63,94,0.4)]",
    text: "text-rose-300",
    tint: "bg-rose-500/15",
  },
];

const START_METER = 88;

// [State name, abbreviation, major cities for autocomplete]. Nurses can also type any city not listed.
const STATES = [
  ["Alabama", "AL", ["Birmingham", "Montgomery", "Huntsville", "Mobile"]],
  ["Alaska", "AK", ["Anchorage", "Fairbanks", "Juneau", "Wasilla"]],
  ["Arizona", "AZ", ["Phoenix", "Tucson", "Mesa", "Scottsdale"]],
  ["Arkansas", "AR", ["Little Rock", "Fayetteville", "Fort Smith", "Jonesboro"]],
  ["California", "CA", ["Los Angeles", "San Diego", "San Francisco", "Sacramento", "San Jose", "Fresno"]],
  ["Colorado", "CO", ["Denver", "Colorado Springs", "Aurora", "Fort Collins"]],
  ["Connecticut", "CT", ["Hartford", "New Haven", "Bridgeport", "Stamford"]],
  ["Delaware", "DE", ["Wilmington", "Dover", "Newark"]],
  ["District of Columbia", "DC", ["Washington"]],
  ["Florida", "FL", ["Miami", "Tampa", "Orlando", "Jacksonville", "Tallahassee", "Fort Lauderdale", "St. Petersburg"]],
  ["Georgia", "GA", ["Atlanta", "Savannah", "Augusta", "Macon"]],
  ["Hawaii", "HI", ["Honolulu", "Hilo", "Kailua"]],
  ["Idaho", "ID", ["Boise", "Idaho Falls", "Pocatello", "Coeur d'Alene"]],
  ["Illinois", "IL", ["Chicago", "Springfield", "Peoria", "Rockford"]],
  ["Indiana", "IN", ["Indianapolis", "Fort Wayne", "Evansville", "South Bend"]],
  ["Iowa", "IA", ["Des Moines", "Cedar Rapids", "Iowa City", "Davenport"]],
  ["Kansas", "KS", ["Wichita", "Kansas City", "Topeka", "Overland Park"]],
  ["Kentucky", "KY", ["Louisville", "Lexington", "Bowling Green", "Owensboro"]],
  ["Louisiana", "LA", ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette"]],
  ["Maine", "ME", ["Portland", "Bangor", "Lewiston", "Augusta"]],
  ["Maryland", "MD", ["Baltimore", "Bethesda", "Annapolis", "Frederick"]],
  ["Massachusetts", "MA", ["Boston", "Worcester", "Springfield", "Cambridge"]],
  ["Michigan", "MI", ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing"]],
  ["Minnesota", "MN", ["Minneapolis", "St. Paul", "Rochester", "Duluth"]],
  ["Mississippi", "MS", ["Jackson", "Gulfport", "Hattiesburg", "Tupelo"]],
  ["Missouri", "MO", ["St. Louis", "Kansas City", "Springfield", "Columbia"]],
  ["Montana", "MT", ["Billings", "Missoula", "Bozeman", "Great Falls"]],
  ["Nebraska", "NE", ["Omaha", "Lincoln", "Grand Island", "Kearney"]],
  ["Nevada", "NV", ["Las Vegas", "Reno", "Henderson", "Carson City"]],
  ["New Hampshire", "NH", ["Manchester", "Nashua", "Concord", "Lebanon"]],
  ["New Jersey", "NJ", ["Newark", "Jersey City", "Hackensack", "New Brunswick"]],
  ["New Mexico", "NM", ["Albuquerque", "Santa Fe", "Las Cruces", "Roswell"]],
  ["New York", "NY", ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"]],
  ["North Carolina", "NC", ["Charlotte", "Raleigh", "Durham", "Greensboro", "Asheville"]],
  ["North Dakota", "ND", ["Fargo", "Bismarck", "Grand Forks", "Minot"]],
  ["Ohio", "OH", ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"]],
  ["Oklahoma", "OK", ["Oklahoma City", "Tulsa", "Norman", "Lawton"]],
  ["Oregon", "OR", ["Portland", "Eugene", "Salem", "Bend"]],
  ["Pennsylvania", "PA", ["Philadelphia", "Pittsburgh", "Allentown", "Harrisburg", "Hershey"]],
  ["Rhode Island", "RI", ["Providence", "Warwick", "Cranston", "Newport"]],
  ["South Carolina", "SC", ["Charleston", "Columbia", "Greenville", "Myrtle Beach"]],
  ["South Dakota", "SD", ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings"]],
  ["Tennessee", "TN", ["Nashville", "Memphis", "Knoxville", "Chattanooga"]],
  ["Texas", "TX", ["Houston", "Dallas", "San Antonio", "Austin", "Fort Worth", "El Paso"]],
  ["Utah", "UT", ["Salt Lake City", "Provo", "Ogden", "St. George"]],
  ["Vermont", "VT", ["Burlington", "Rutland", "Montpelier"]],
  ["Virginia", "VA", ["Richmond", "Virginia Beach", "Norfolk", "Charlottesville", "Roanoke"]],
  ["Washington", "WA", ["Seattle", "Spokane", "Tacoma", "Vancouver"]],
  ["West Virginia", "WV", ["Charleston", "Morgantown", "Huntington", "Wheeling"]],
  ["Wisconsin", "WI", ["Milwaukee", "Madison", "Green Bay", "Eau Claire"]],
  ["Wyoming", "WY", ["Cheyenne", "Casper", "Laramie", "Sheridan"]],
];

const LOCATION_KEY = "the13thHour.location";
const PTO_KEY = "the13thHour.ptoPoints";

// Permission slips. Body segments: plain strings, or { t: "text", h: "g" | "p" } for green/purple highlights.
const SLIPS = [
  {
    title: "Clock Out On Time",
    patient: "One (1) exhausted nurse",
    date: "Today. And every day after.",
    body: [
      "You are hereby authorized to ",
      { t: "leave your charting", h: "g" },
      " and ",
      { t: "go home on time", h: "p" },
      ". The charts will survive. The Pyxis will survive. You deserve to sit down. 🩹",
    ],
    sig: "Take 1 nap PO, PRN",
    refills: "∞",
    dr: "Dr. Clock Out",
  },
  {
    title: "Eat An Actual Lunch",
    patient: "One (1) nurse surviving on graham crackers",
    date: "Before 1500, ideally",
    body: [
      "You are hereby authorized to ",
      { t: "eat lunch sitting down", h: "g" },
      " — with both hands, for the ",
      { t: "full 30 minutes", h: "p" },
      ". Cold coffee and a stolen pudding cup are not a food group. 🥪",
    ],
    sig: "1 meal PO, uninterrupted, q shift",
    refills: "Daily",
    dr: "Dr. Snack Break",
  },
  {
    title: "Bathroom Break Order",
    patient: "One (1) nurse who hasn't peed since 0700",
    date: "STAT",
    body: [
      "You are hereby authorized to ",
      { t: "use the restroom", h: "g" },
      " before your bladder becomes its own ",
      { t: "rapid response", h: "p" },
      ". The call light will still be blinking when you get back. 🚻",
    ],
    sig: "Void PRN, q2h. No holding.",
    refills: "As many as needed",
    dr: "Dr. Bladder Advocate",
  },
  {
    title: "Decline The Extra Shift",
    patient: "One (1) nurse on their day off",
    date: "Effective immediately",
    body: [
      "You are hereby authorized to ",
      { t: "ignore the \"URGENT NEED — BONUS AVAILABLE\" text", h: "g" },
      ". Your day off is not a soft no. ",
      { t: "Silence your phone", h: "p" },
      " and go back to bed. 📵",
    ],
    sig: "Decline 1 extra shift, PRN guilt",
    refills: "∞",
    dr: "Dr. Day Off",
  },
  {
    title: "Sit Down For Five Minutes",
    patient: "One (1) nurse at 14,000 steps",
    date: "Sometime before shift change",
    body: [
      "You are hereby authorized to ",
      { t: "sit in an actual chair", h: "g" },
      " for five whole minutes. Your feet have ",
      { t: "filed a formal grievance", h: "p" },
      " and your compression socks are tired too. 🪑",
    ],
    sig: "Sit x1 chair, q4h",
    refills: "5",
    dr: "Dr. Compression Socks",
  },
  {
    title: "Hydration Order",
    patient: "One (1) nurse, mildly crispy",
    date: "Now, please",
    body: [
      "You are hereby authorized to ",
      { t: "drink from your own water bottle", h: "g" },
      " — the one that has been sitting at the nurses' station ",
      { t: "since 0645", h: "p" },
      ". You'd never let a patient's I&O look like yours. 💧",
    ],
    sig: "32 oz H₂O PO, today",
    refills: "Every shift",
    dr: "Dr. Hydration",
  },
  {
    title: "Ask For Help",
    patient: "One (1) nurse with 6 patients",
    date: "Before you try to boost that patient alone",
    body: [
      "You are hereby authorized to ",
      { t: "ask for help", h: "g" },
      " without starting with \"sorry to bother you.\" Teamwork is not a favor, and ",
      { t: "neither is a second set of hands", h: "p" },
      ". 🤝",
    ],
    sig: "Ask 1 coworker, PRN",
    refills: "Unlimited",
    dr: "Dr. Lift Team",
  },
  {
    title: "Use Your PTO",
    patient: "One (1) nurse hoarding 240 hours",
    date: "This calendar year, ideally",
    body: [
      "You are hereby authorized to ",
      { t: "actually use your PTO", h: "g" },
      ". Saving it for \"someday\" is not a vacation plan. ",
      { t: "The unit will be short-staffed either way", h: "p" },
      " — might as well be on a beach. 🏖️",
    ],
    sig: "1 vacation, minimum 5 days",
    refills: "Annually",
    dr: "Dr. Out of Office",
  },
  {
    title: "Leave It At Work",
    patient: "One (1) nurse replaying the shift at 2am",
    date: "Tonight",
    body: [
      "You are hereby authorized to ",
      { t: "stop replaying today's shift", h: "g" },
      ". You did your best with the staffing you had, and ",
      { t: "that part was never on you", h: "p" },
      ". Go to sleep. 🌙",
    ],
    sig: "8 hrs sleep, HS",
    refills: "Nightly",
    dr: "Dr. Rest Easy",
  },
];

const slipText = (s) => s.body.map((seg) => (typeof seg === "string" ? seg : seg.t)).join("");

// MOCK DATA: gives each city/state a stable, made-up vibe so the demo feels real.
// Replace with real averages from your backend later.
function mockVibePct(key) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 55 + (h % 43); // 55–97%
}

function vibeTier(pct) {
  if (pct >= 90) return { label: "Critical Chaos", emoji: "⚠️", color: "text-rose-300" };
  if (pct >= 80) return { label: "Mandatory Overtime", emoji: "⏰", color: "text-orange-300" };
  if (pct >= 65) return { label: "Short Staffed", emoji: "⏱️", color: "text-yellow-300" };
  return { label: "Code Smooth", emoji: "🩺", color: "text-emerald-300" };
}

function titleCase(s) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^|[\s-])\S/g, (m) => m.toUpperCase());
}

function LocationSetup({ initial, onSave, onCancel }) {
  const [st, setSt] = useState(initial?.state || "");
  const [city, setCity] = useState(initial?.city || "");
  const [focused, setFocused] = useState(false);

  const entry = STATES.find((s) => s[1] === st);
  const q = city.trim().toLowerCase();
  const suggestions = entry
    ? entry[2].filter((c) => c.toLowerCase().includes(q) && c.toLowerCase() !== q).slice(0, 5)
    : [];
  const canSave = st && city.trim().length >= 2;

  const save = () => {
    if (!canSave) return;
    const match = entry[2].find((c) => c.toLowerCase() === q);
    onSave({ city: match || titleCase(city), state: st });
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#0b0f14] flex flex-col px-6 pt-12 pb-8 overflow-y-auto">
      <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-purple-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="relative flex-1">
        {onCancel && (
          <button onClick={onCancel} className="absolute -top-6 right-0 text-sm font-semibold text-zinc-400">
            Cancel
          </button>
        )}
        <div className="text-5xl mb-4">📍</div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400/80">
          {initial ? "Update location" : "Welcome to The 13th Hour"}
        </p>
        <h2 className="text-2xl font-black leading-tight mt-1">Where do you work?</h2>
        <p className="text-sm text-zinc-400 mt-2">
          See how nurses in your city and state are feeling right now.
        </p>
        {!initial && (
          <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs text-amber-100 leading-relaxed">
            <span className="font-black text-amber-300">🧪 Early preview.</span> Some numbers and messages are samples so
            you can see how the app will work. Your feedback shapes what comes next — there's a feedback button inside.
          </div>
        )}

        <label className="block mt-8 text-xs font-bold uppercase tracking-widest text-purple-300">State</label>
        <div className="relative mt-2">
          <select
            value={st}
            onChange={(e) => {
              setSt(e.target.value);
              setCity("");
            }}
            className="w-full appearance-none rounded-2xl bg-zinc-900 border border-zinc-700 focus:border-[#39ff88] focus:outline-none px-4 py-3.5 text-base text-zinc-100"
          >
            <option value="" disabled>
              Select your state
            </option>
            {STATES.map(([name, abbr]) => (
              <option key={abbr} value={abbr}>
                {name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">▾</span>
        </div>

        <label className="block mt-6 text-xs font-bold uppercase tracking-widest text-purple-300">City</label>
        <div className="relative mt-2">
          <input
            type="text"
            value={city}
            disabled={!st}
            onChange={(e) => setCity(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder={st ? "Start typing your city…" : "Pick a state first"}
            autoComplete="off"
            className="w-full rounded-2xl bg-zinc-900 border border-zinc-700 focus:border-[#39ff88] focus:outline-none px-4 py-3.5 text-base text-zinc-100 placeholder:text-zinc-500 disabled:opacity-50"
          />
          {focused && suggestions.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 mt-2 rounded-2xl bg-zinc-900 border border-zinc-700 overflow-hidden shadow-xl">
              {suggestions.map((c) => (
                <li key={c}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setCity(c)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 active:bg-zinc-800"
                  >
                    🏙️ {c}, <span className="text-zinc-400">{st}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {st && <p className="mt-2 text-[11px] text-zinc-500">Don't see your city? Just type it in.</p>}

        <div className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-4 text-xs text-zinc-300 leading-relaxed">
          🔒 <span className="font-bold text-emerald-300">Your privacy:</span> we only use your city and state —
          never your hospital, unit, or exact location. Vibes are always anonymous.
        </div>
      </div>

      <button
        onClick={save}
        disabled={!canSave}
        className="relative mt-8 w-full rounded-2xl bg-[#39ff88] text-zinc-950 font-black py-4 transition active:scale-95 shadow-[0_0_20px_rgba(57,255,136,0.5)] disabled:opacity-30 disabled:shadow-none disabled:active:scale-100"
      >
        {initial ? "Save location" : "Let's go 💉"}
      </button>
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">{children}</h2>
      {right}
    </div>
  );
}

function NurseCap({ className = "", locked = true }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M8 40 C8 22 20 14 32 14 C44 14 56 22 56 40 L50 46 L14 46 Z"
        fill="#f8fafc"
        stroke="#a855f7"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="27" y="22" width="10" height="18" rx="1.5" fill="#22c55e" />
      <rect x="23" y="26" width="18" height="10" rx="1.5" fill="#22c55e" />
      {locked ? (
        <g transform="translate(40 36)">
          <rect x="0" y="8" width="20" height="16" rx="3" fill="#a855f7" />
          <path d="M4 8 V5 a6 6 0 0 1 12 0 V8" fill="none" stroke="#a855f7" strokeWidth="3" />
          <circle cx="10" cy="16" r="2.5" fill="#0b0f14" />
        </g>
      ) : (
        <g transform="translate(40 36)">
          <rect x="0" y="8" width="20" height="16" rx="3" fill="#39ff88" />
          <path d="M4 8 V5 a6 6 0 0 1 12 0" fill="none" stroke="#39ff88" strokeWidth="3" />
          <circle cx="10" cy="16" r="2.5" fill="#0b0f14" />
        </g>
      )}
    </svg>
  );
}

export default function The13thHour() {
  const [meter, setMeter] = useState(START_METER);
  const [karma, setKarma] = useState(0);
  const [lastVibe, setLastVibe] = useState(null);
  const [taps, setTaps] = useState(0);
  const [pulse, setPulse] = useState(null);
  const [karmaBump, setKarmaBump] = useState(null);
  const [toast, setToast] = useState(null);
  const [time, setTime] = useState("");
  const [scope, setScope] = useState("city");
  const [place, setPlace] = useState(null); // { city, state: "FL" }
  const [showSetup, setShowSetup] = useState(false);
  const [tab, setTab] = useState("shift");
  const [vibeCounts, setVibeCounts] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [codeTeam, setCodeTeam] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [ptoLoaded, setPtoLoaded] = useState(false);

  // Load saved PTO Points, and handle Code Team invite links (…/?code=13)
  useEffect(() => {
    let saved = 0;
    try {
      saved = parseInt(localStorage.getItem(PTO_KEY) || "0", 10) || 0;
    } catch {}
    let member = false;
    try {
      member = !!localStorage.getItem(CODE_TEAM_KEY);
    } catch {}
    if (isCodeTeamLink()) {
      try {
        window.history.replaceState(null, "", window.location.pathname);
      } catch {}
      if (!member) {
        try {
          localStorage.setItem(CODE_TEAM_KEY, JSON.stringify({ joinedAt: Date.now() }));
        } catch {}
        member = true;
        setShowWelcome(true);
        saved += 13;
        try {
          localStorage.setItem(PTO_KEY, String(saved));
        } catch {}
      }
    }
    setKarma(saved);
    setPtoLoaded(true);
    setCodeTeam(member);
  }, []);

  // Keep PTO Points between visits
  useEffect(() => {
    if (!ptoLoaded) return;
    try {
      localStorage.setItem(PTO_KEY, String(karma));
    } catch {}
  }, [karma, ptoLoaded]);
  const [slipIdx, setSlipIdx] = useState(0);
  const touchX = useRef(null);
  const slip = SLIPS[slipIdx];
  const goSlip = (dir) => setSlipIdx((i) => (i + dir + SLIPS.length) % SLIPS.length);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LOCATION_KEY));
      if (saved?.city && saved?.state) setPlace(saved);
      else setShowSetup(true);
    } catch {
      setShowSetup(true);
    }
  }, []);

  const savePlace = (p) => {
    setPlace(p);
    setShowSetup(false);
    try {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(p));
    } catch {}
    setToast(`📍 Set to ${p.city}, ${p.state}`);
  };

  const stateName = place ? STATES.find((s) => s[1] === place.state)?.[0] : null;
  const areaName = place ? (scope === "city" ? place.city : stateName) : scope === "city" ? "Local City" : "Statewide";
  const areaPct = place
    ? mockVibePct(scope === "city" ? `${place.city},${place.state}` : place.state)
    : scope === "city"
    ? 91
    : 74;
  const areaTier = vibeTier(areaPct);
  const cityPct = place ? mockVibePct(`${place.city},${place.state}`) : 91;
  const statePct = place ? mockVibePct(place.state) : 74;
  const stateCities = place ? STATES.find((s) => s[1] === place.state)?.[2] || [] : [];

  const unlocked = taps > 0;
  const vibeLabel = lastVibe ? lastVibe.label : "Drowning Together";
  const maxed = meter >= 100;

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "")
      );
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const handleVibe = (vibe) => {
    setMeter((m) => Math.min(100, m + vibe.meter));
    setKarma((k) => k + vibe.karma);
    setLastVibe(vibe);
    setVibeCounts((c) => ({ ...c, [vibe.id]: (c[vibe.id] || 0) + 1 }));
    setTaps((n) => n + 1);
    setPulse(vibe.id);
    setKarmaBump(`+${vibe.karma}`);
    setTimeout(() => setPulse(null), 350);
    setTimeout(() => setKarmaBump(null), 900);
    if (taps === 0) setToast("🔓 The Vault just unlocked!");
  };

  // Shared reward helper (used by Breaks and other tabs)
  const earn = (pts, msg) => {
    if (pts > 0) {
      setKarma((k) => k + pts);
      setKarmaBump(`+${pts}`);
      setTimeout(() => setKarmaBump(null), 900);
    }
    if (msg) setToast(msg);
  };

  const resetShift = () => {
    setMeter(START_METER);
    setLastVibe(null);
    setToast("🕐 Clocked out. Meter reset — PTO Points kept.");
  };

  const handleDownload = () => {
    if (GUIDE_URL) {
      const a = document.createElement("a");
      a.href = GUIDE_URL;
      a.download = "Remote-Nursing-Exit-Strategy-Guide.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setToast("💾 Downloading your exit strategy…");
    } else {
      setToast("💾 Demo mode — PDF download goes here");
    }
  };

  const handleShare = async () => {
    const text = `🩺 OFFICIAL PERMISSION SLIP: ${slip.title}\n\n${slipText(slip)}\n\nSig: ${slip.sig} · Refills: ${slip.refills}\n— ${slip.dr}, The 13th Hour`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "The 13th Hour", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setToast("📋 Permission slip copied!");
    } catch {
      setToast("📤 Shared! (demo)");
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#05070a] flex items-center justify-center sm:py-8">
      {/* Phone frame: fills the screen on phones, framed mockup on desktop */}
      <div className="relative w-full h-[100dvh] sm:w-[400px] sm:h-[820px] sm:rounded-[44px] sm:border-[10px] sm:border-zinc-800 sm:shadow-[0_0_80px_rgba(168,85,247,0.25)] bg-[#0b0f14] overflow-hidden flex flex-col text-zinc-100 font-sans">
        {/* Background glow + a few faint emojis (sit behind the opaque cards) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-purple-600/25 blur-3xl" />
          <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <span className="absolute top-[38%] right-2 text-xl opacity-10 rotate-12">💉</span>
          <span className="absolute top-[64%] left-1 text-lg opacity-10 -rotate-12">🩹</span>
          <span className="absolute top-[86%] right-3 text-lg opacity-10">💊</span>
        </div>

        {/* Mock status bar — desktop mockup only (real phones already have one) */}
        <div className="relative z-10 hidden sm:flex items-center justify-between px-7 pt-3 pb-1 text-xs font-semibold text-zinc-300">
          <span>{time || "3:13"}</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-6 rounded-full bg-black" />
          <span className="tracking-widest">▂▄▆ 🔋</span>
        </div>

        {/* Prototype banner */}
        <button
          onClick={() => setShowFeedback(true)}
          className="relative z-10 flex items-center justify-center gap-2 px-4 pt-[max(0.4rem,env(safe-area-inset-top))] sm:pt-1.5 pb-1.5 bg-amber-400/10 border-b border-amber-400/20 text-[11px] font-semibold text-amber-100"
        >
          <span>{codeTeam ? "🚨 Code Team preview · some numbers are samples" : "🧪 Prototype · some numbers are samples"}</span>
          <span className="font-black text-amber-300 whitespace-nowrap">Feedback ›</span>
        </button>

        {/* App bar */}
        <header className="relative z-10 flex items-center justify-between gap-3 px-5 pt-3 pb-3 border-b border-white/5 bg-[#0b0f14]/80 backdrop-blur">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-400/80">Your shift survival kit</p>
            <h1 className="text-xl font-black tracking-tight leading-tight">
              The <span className="text-[#39ff88] drop-shadow-[0_0_10px_rgba(57,255,136,0.6)]">13th</span>{" "}
              <span className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]">Hour</span> 🩺
            </h1>
          </div>
          <div className="relative shrink-0">
            <div className="flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-400/40 pl-2.5 pr-3 py-1.5">
              <span className="text-base">🏖️</span>
              <div className="leading-none">
                <p className="text-base font-black text-purple-100 tabular-nums">{karma}</p>
                <p className="text-[8px] uppercase tracking-widest text-purple-300 mt-0.5">PTO pts</p>
              </div>
            </div>
            {karmaBump && (
              <span className="absolute -bottom-5 right-2 text-xs font-black text-[#39ff88] animate-bounce">
                {karmaBump}
              </span>
            )}
          </div>
        </header>

        {/* Scrollable content */}
        <main
          key={tab}
          className="relative z-10 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-32 space-y-7"
        >
          {tab === "breaks" && <BreaksTab onEarn={earn} />}
          {tab === "vent" && <VentTab onEarn={earn} onNavigate={setTab} />}
          {tab === "crew" && (
            <CrewTab
              place={place}
              stateName={stateName}
              stateCities={stateCities}
              cityPct={cityPct}
              statePct={statePct}
              myVibe={lastVibe}
              vibeCounts={vibeCounts}
              karma={karma}
              onEarn={earn}
              onEditLocation={() => setShowSetup(true)}
            />
          )}

          {tab === "shift" && (
          <>
          {/* Location */}
          <section className="rounded-3xl bg-zinc-900/95 border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Area vibe</p>
              <button
                onClick={() => setShowSetup(true)}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-200 active:scale-95 transition max-w-[60%]"
              >
                <span className="truncate">📍 {place ? `${place.city}, ${place.state}` : "Set location"}</span>
                <span className="text-purple-300 shrink-0">✏️</span>
              </button>
            </div>

            <div role="tablist" aria-label="Vibe location" className="relative grid grid-cols-2 rounded-full bg-black/40 p-1">
              <div
                aria-hidden="true"
                className={`absolute inset-y-1 rounded-full transition-all duration-300 ease-out ${
                  scope === "city"
                    ? "left-1 right-1/2 bg-[#39ff88] shadow-[0_0_16px_rgba(57,255,136,0.45)]"
                    : "left-1/2 right-1 bg-purple-500 shadow-[0_0_16px_rgba(168,85,247,0.45)]"
                }`}
              />
              {[
                ["city", "🏙️ City"],
                ["state", "🗺️ State"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={scope === id}
                  onClick={() => setScope(id)}
                  className={`relative z-10 py-2.5 text-sm font-black rounded-full transition-colors ${
                    scope === id ? (id === "city" ? "text-zinc-950" : "text-white") : "text-zinc-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
              <p className="text-sm text-zinc-400 truncate">{areaName} Vibe</p>
              <p className={`text-sm font-black whitespace-nowrap ${areaTier.color}`}>
                {areaPct}% {areaTier.label} {areaTier.emoji}
              </p>
            </div>
          </section>

          {/* Chaos meter */}
          <section className="rounded-3xl bg-zinc-900/95 border border-emerald-400/25 p-5 shadow-[0_0_30px_rgba(57,255,136,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">💉 Chaos Meter</h2>
              {maxed && (
                <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  MAXED OUT
                </span>
              )}
            </div>

            {/* Syringe-styled bar */}
            <div className="flex items-center">
              <div className="w-2 h-7 bg-zinc-500 rounded-l-sm" />
              <div className="w-1.5 h-4 bg-zinc-600" />
              <div className="relative flex-1 h-9 rounded-lg bg-zinc-800 border-2 border-zinc-500 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#39ff88] via-purple-500 to-rose-500 transition-all duration-700 ease-out"
                  style={{ width: `${meter}%` }}
                />
                <div className="absolute inset-0 flex justify-between px-1">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className={`w-px bg-white/30 ${i % 5 === 0 ? "h-4" : "h-2"}`} />
                  ))}
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white drop-shadow">
                  {meter}%
                </span>
              </div>
              <div className="w-3 h-3 bg-zinc-500" />
              <div className="w-7 h-0.5 bg-zinc-300" />
            </div>

            <div className="mt-4 text-center">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Current Shift Vibe</p>
              <p className={`mt-1 text-lg font-black leading-tight ${lastVibe ? lastVibe.text : "text-rose-300"}`}>
                {meter}% {vibeLabel}
              </p>
            </div>
            {maxed && (
              <button
                onClick={resetShift}
                className="mt-4 w-full rounded-xl border border-zinc-700 py-2.5 text-xs font-semibold text-zinc-300 active:scale-95 transition"
              >
                🕐 Clock out & reset meter
              </button>
            )}
          </section>

          {/* Vibe buttons */}
          <section>
            <SectionTitle>How's the floor? 🏥</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {VIBES.map((v) => {
                const active = lastVibe?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleVibe(v)}
                    className={`text-left rounded-2xl bg-zinc-900/95 border p-4 flex flex-col gap-3 transition-all duration-150 active:scale-95 ${
                      active ? `border-transparent ring-2 ${v.ring} ${v.glow}` : "border-zinc-800 hover:border-zinc-600"
                    } ${pulse === v.id ? "scale-95" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`w-10 h-10 rounded-xl ${v.tint} flex items-center justify-center text-xl`}>
                        {v.icon}
                      </span>
                      <span className="text-xs">{v.dot}</span>
                    </div>
                    <div>
                      <p className={`font-black leading-tight ${v.text}`}>{v.label}</p>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{v.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* The Vault */}
          <section
            className={`rounded-3xl p-5 border transition-all duration-500 ${
              unlocked
                ? "bg-gradient-to-br from-purple-900/70 to-emerald-900/50 border-[#39ff88]/50 shadow-[0_0_30px_rgba(57,255,136,0.2)]"
                : "bg-zinc-900/95 border-zinc-800"
            }`}
          >
            <div className="flex items-center gap-4">
              <NurseCap locked={!unlocked} className={`w-14 h-14 shrink-0 ${unlocked ? "" : "opacity-70"}`} />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                  {unlocked ? "🔓 Unlocked" : "🔒 Locked"}
                </p>
                <h2 className="text-lg font-black leading-tight">The Vault</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {unlocked ? "You earned it. Seriously." : "Log a shift vibe to unlock your reward."}
                </p>
              </div>
            </div>

            {unlocked ? (
              <button
                onClick={handleDownload}
                className="mt-4 w-full rounded-2xl bg-[#39ff88] text-zinc-950 px-4 py-3.5 active:scale-95 transition shadow-[0_0_20px_rgba(57,255,136,0.5)] flex items-center gap-3 text-left"
              >
                <span className="text-xl">⬇️</span>
                <span className="leading-tight">
                  <span className="block font-black">Remote Nursing Exit Strategy Guide</span>
                  <span className="block text-xs font-semibold opacity-70">PDF download</span>
                </span>
              </button>
            ) : (
              <div className="mt-4 w-full rounded-2xl border-2 border-dashed border-zinc-700 py-3.5 text-center text-sm text-zinc-600 tracking-widest">
                🔒 ● ● ● ● ● ● ● ●
              </div>
            )}
          </section>

          {/* Permission slips */}
          <section>
            <SectionTitle
              right={
                <span className="text-[11px] font-semibold text-zinc-500 tabular-nums">
                  {slipIdx + 1} / {SLIPS.length}
                </span>
              }
            >
              Your prescriptions ℞
            </SectionTitle>

            <div
              onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchX.current == null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 40) goSlip(dx < 0 ? 1 : -1);
                touchX.current = null;
              }}
              className="select-none px-1"
            >
              <div
                key={slipIdx}
                className="rounded-xl bg-[#fdfbf3] text-zinc-800 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-t-[12px] border-purple-600 relative overflow-hidden"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #c7d2fe 28px)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-widest text-zinc-500">
                        Office of the 13th Hour · No. {String(slipIdx + 1).padStart(3, "0")}
                      </p>
                      <p className="font-black text-lg leading-tight mt-0.5">Official Permission Slip</p>
                      <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mt-1">{slip.title}</p>
                    </div>
                    <span className="text-4xl font-serif font-black text-purple-600 leading-none">℞</span>
                  </div>

                  <dl className="mt-4 text-[13px] font-mono space-y-1">
                    <div className="flex gap-2">
                      <dt className="text-zinc-500 shrink-0">Patient:</dt>
                      <dd>{slip.patient}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-zinc-500 shrink-0">Date:</dt>
                      <dd>{slip.date}</dd>
                    </div>
                  </dl>

                  <p className="mt-4 text-[15px] leading-relaxed font-semibold">
                    {slip.body.map((seg, i) =>
                      typeof seg === "string" ? (
                        <span key={i}>{seg}</span>
                      ) : (
                        <span
                          key={i}
                          className={`${seg.h === "g" ? "bg-emerald-200" : "bg-purple-200"} px-1 rounded-sm box-decoration-clone`}
                        >
                          {seg.t}
                        </span>
                      )
                    )}
                  </p>

                  <div className="mt-5 pt-4 border-t border-dashed border-zinc-300 space-y-3">
                    <div className="font-mono text-xs space-y-0.5">
                      <p>
                        <span className="text-zinc-500">Sig:</span> {slip.sig}
                      </p>
                      <p>
                        <span className="text-zinc-500">Refills:</span> {slip.refills}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif italic text-lg text-purple-700 leading-none">{slip.dr}</p>
                      <div className="w-32 ml-auto mt-1 border-t border-zinc-500" />
                      <p className="text-[10px] text-zinc-500 mt-0.5">Prescriber signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slip controls */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => goSlip(-1)}
                aria-label="Previous slip"
                className="w-11 h-11 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 text-lg text-zinc-300 active:scale-90 transition"
              >
                ‹
              </button>
              <div className="flex-1 flex justify-center gap-1.5">
                {SLIPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlipIdx(i)}
                    aria-label={`Slip ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === slipIdx ? "w-5 bg-[#39ff88]" : "w-1.5 bg-zinc-700"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => goSlip(1)}
                aria-label="Next slip"
                className="w-11 h-11 shrink-0 rounded-full bg-zinc-900 border border-zinc-800 text-lg text-zinc-300 active:scale-90 transition"
              >
                ›
              </button>
            </div>

            <div className="mt-3 flex gap-3">
              <button
                onClick={() => {
                  let n = slipIdx;
                  while (n === slipIdx) n = Math.floor(Math.random() * SLIPS.length);
                  setSlipIdx(n);
                }}
                aria-label="Random slip"
                className="w-14 shrink-0 rounded-2xl bg-zinc-900 border border-zinc-800 text-xl active:scale-95 transition"
              >
                🎲
              </button>
              <button
                onClick={handleShare}
                className="flex-1 rounded-2xl bg-purple-600 hover:bg-purple-500 font-black py-3.5 active:scale-95 transition shadow-[0_0_20px_rgba(168,85,247,0.45)]"
              >
                📤 Share This Prescription
              </button>
            </div>
          </section>

          </>
          )}

          <div className="pt-2 text-center space-y-3">
            <button
              onClick={() => setShowFeedback(true)}
              className="rounded-full border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-200 active:scale-95 transition"
            >
              💬 Tell us what you think
            </button>
            <p className="text-[11px] text-zinc-600">Made with 💜 for the ones who stay past the 12th hour.</p>
          </div>
        </main>

        {/* Bottom tab bar (stays pinned) */}
        <nav className="absolute bottom-0 inset-x-0 z-20 bg-[#0b0f14]/95 backdrop-blur border-t border-zinc-800 px-6 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-5 grid grid-cols-4 text-[10px] text-zinc-500">
          {[
            ["shift", "🏥", "Shift", true],
            ["vent", "🩹", "Vent", true],
            ["breaks", "💊", "Breaks", true],
            ["crew", "👩‍⚕️", "Crew", true],
          ].map(([id, icon, label, ready]) => (
            <button
              key={id}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => (ready ? setTab(id) : setToast(`${icon} ${label} — coming soon`))}
              className={`flex flex-col items-center gap-0.5 py-1 transition-colors ${
                tab === id ? "text-[#39ff88]" : ""
              }`}
            >
              <span className="text-xl">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Location setup (first run + edit) */}
        {showSetup && (
          <LocationSetup
            initial={place}
            onSave={savePlace}
            onCancel={place ? () => setShowSetup(false) : null}
          />
        )}

        {/* Feedback form */}
        <FeedbackSheet open={showFeedback} onClose={() => setShowFeedback(false)} onEarn={earn} codeTeam={codeTeam} />

        {/* Code Team welcome (from an invite link) */}
        <CodeTeamWelcome
          open={showWelcome}
          onClose={() => setShowWelcome(false)}
          onFeedback={() => {
            setShowWelcome(false);
            setShowFeedback(true);
          }}
        />

        {/* Toast */}
        {toast && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[70] rounded-full bg-zinc-100 text-zinc-900 text-sm font-bold px-4 py-2 shadow-lg whitespace-nowrap">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
