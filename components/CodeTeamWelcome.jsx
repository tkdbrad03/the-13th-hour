"use client";

/*
  Shown once to nurses who open the app from a Code Team invite link (…/?code=13).
  Membership is remembered on their device and unlocks the 🚨 Code Team badge.
*/

export const CODE_TEAM_KEY = "the13thHour.codeTeam";

export function isCodeTeamLink() {
  try {
    return new URLSearchParams(window.location.search).get("code") === "13";
  } catch {
    return false;
  }
}

export default function CodeTeamWelcome({ open, onClose, onFeedback }) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[65] flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="Welcome to the Code Team">
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative w-full max-w-sm rounded-[28px] bg-[#0f141a] border border-[#39ff88]/40 p-6 shadow-[0_0_60px_rgba(57,255,136,0.2)] text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#39ff88]">🚨 Code 13 answered</p>
        <h2 className="mt-2 text-3xl font-black leading-tight">
          Welcome to the <span className="text-purple-400">Code Team.</span>
        </h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          You're one of the first nurses helping build this app. Tap everything, break it, and tell me the truth.
        </p>

        <div className="mt-5 rounded-xl bg-[#fdfbf3] text-zinc-800 text-left p-4 border-t-[10px] border-purple-600 -rotate-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">Permission slip · No. 013</p>
              <p className="mt-1 text-[15px] leading-snug font-semibold">
                You are hereby authorized to <span className="bg-emerald-200 px-1 rounded-sm">roast this app</span> with
                love. Your opinion is <span className="bg-purple-200 px-1 rounded-sm">the whole point</span>.
              </p>
            </div>
            <span className="text-3xl font-serif font-black text-purple-600 leading-none">℞</span>
          </div>
          <div className="mt-3 pt-2 border-t border-dashed border-zinc-300 flex items-end justify-between text-xs">
            <span className="font-mono">Sig: Tap everything. Roast PRN.</span>
            <span className="font-serif italic text-base text-purple-700 whitespace-nowrap">Dr. TMac</span>
          </div>
        </div>

        <ul className="mt-5 space-y-2 text-left text-sm text-zinc-300">
          <li className="flex gap-2"><span>🚨</span><span>You've unlocked the <b className="text-zinc-100">Code Team</b> badge (+13 PTO Points)</span></li>
          <li className="flex gap-2"><span>💬</span><span>Tap <b className="text-zinc-100">Feedback</b> anytime, top of the screen</span></li>
          <li className="flex gap-2"><span>✍️</span><span>Write your own permission slip — the best ones go in the app</span></li>
        </ul>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-[#39ff88] text-zinc-950 font-black py-3.5 active:scale-95 transition shadow-[0_0_20px_rgba(57,255,136,0.45)]"
        >
          Clock in 💉
        </button>
        <button onClick={onFeedback} className="mt-2 w-full py-2 text-xs font-semibold text-zinc-400">
          I already have feedback →
        </button>
      </div>
    </div>
  );
}
