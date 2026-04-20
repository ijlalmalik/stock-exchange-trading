import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import { TrendingUp, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  component: WelcomeScreen,
});

const TAGLINES = [
  "Trade Smart. Grow Strong.",
  "Your Market. Your Moves.",
  "Precision. Power. Profit.",
];

function WelcomeScreen() {
  const navigate = useNavigate();
  const [booting, setBooting] = useState(true);
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax mouse tracking
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const logoX = useTransform(sx, (v) => v * 18);
  const logoY = useTransform(sy, (v) => v * 18);
  const blob1X = useTransform(sx, (v) => v * -40);
  const blob1Y = useTransform(sy, (v) => v * -40);
  const blob2X = useTransform(sx, (v) => v * 30);
  const blob2Y = useTransform(sy, (v) => v * 30);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const enterDashboard = () => {
    try {
      localStorage.setItem("welcome-seen", "1");
    } catch {}
    navigate({ to: "/" });
  };

  // Faint floating tickers
  const tickers = useMemo(
    () => [
      { sym: "AAPL", val: "+2.41%", top: "12%", left: "8%", delay: 0 },
      { sym: "TSLA", val: "+5.10%", top: "22%", left: "82%", delay: 0.6 },
      { sym: "NVDA", val: "+3.88%", top: "70%", left: "10%", delay: 1.2 },
      { sym: "MSFT", val: "+1.22%", top: "78%", left: "84%", delay: 0.3 },
      { sym: "KSE100", val: "+0.94%", top: "44%", left: "4%", delay: 0.9 },
      { sym: "BTC", val: "+4.07%", top: "55%", left: "90%", delay: 1.5 },
    ],
    [],
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="welcome-root fixed inset-0 z-[100] overflow-hidden bg-[#05070d] text-white"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* Animated gradient blobs */}
      <motion.div
        style={{ x: blob1X, y: blob1Y }}
        className="pointer-events-none absolute -top-40 -left-40 h-[55vmax] w-[55vmax] rounded-full opacity-60 blur-[120px]"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="h-full w-full rounded-full bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-500" />
      </motion.div>
      <motion.div
        style={{ x: blob2X, y: blob2Y }}
        className="pointer-events-none absolute -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full opacity-50 blur-[120px]"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/40 to-emerald-500/30 opacity-40 blur-[140px]"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Subtle stock chart line */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] w-full opacity-[0.18]"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,220 C100,200 180,250 260,180 C340,110 420,160 520,120 C620,80 720,140 820,90 C920,40 1020,80 1200,30 L1200,300 L0,300 Z"
          fill="url(#chartGrad)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />
        <motion.path
          d="M0,220 C100,200 180,250 260,180 C340,110 420,160 520,120 C620,80 720,140 820,90 C920,40 1020,80 1200,30"
          stroke="#34d399"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />
      </svg>

      {/* Floating tickers */}
      {tickers.map((t) => (
        <motion.div
          key={t.sym}
          className="pointer-events-none absolute select-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-mono text-white/40 backdrop-blur-md"
          style={{ top: t.top, left: t.left }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 0.6, 0.3], y: [20, 0, -10] }}
          transition={{ duration: 8, repeat: Infinity, delay: t.delay, ease: "easeInOut" }}
        >
          <span className="mr-2 text-white/60">{t.sym}</span>
          <span className="text-emerald-300/70">{t.val}</span>
        </motion.div>
      ))}

      {/* Boot loader */}
      {booting && (
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center bg-[#05070d]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{ pointerEvents: "none" }}
        >
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-xl">
                <Sparkles className="h-6 w-6 text-emerald-300" />
              </div>
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/50">
              Initializing
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: booting ? 0 : 1, scale: booting ? 0.92 : 1, y: booting ? 30 : 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="welcome-card relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.06] p-8 sm:p-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          {/* Shimmer sweep */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
            <motion.div
              className="absolute -inset-x-1/2 -top-1/2 h-[200%] w-[60%] -rotate-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            />
          </div>

          {/* Inner highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/10 via-transparent to-transparent" />

          <div className="relative flex flex-col items-center text-center">
            {/* Bull logo */}
            <motion.div
              style={{ x: logoX, y: logoY }}
              className="relative mb-6"
            >
              <motion.div
                animate={{ y: [0, -8, 0], scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-br from-emerald-400/30 via-cyan-400/10 to-purple-500/20 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(52,211,153,0.5)]"
              >
                {/* Glow */}
                <div className="absolute inset-0 rounded-3xl bg-emerald-400/20 blur-2xl" />
                <BullIcon className="relative z-10 h-16 w-16 text-white drop-shadow-[0_2px_8px_rgba(52,211,153,0.8)]" />
                {/* Reflection */}
                <div className="pointer-events-none absolute inset-x-3 top-2 h-1/3 rounded-2xl bg-gradient-to-b from-white/40 to-transparent opacity-60" />
              </motion.div>
              {/* Orbit dot */}
              <motion.div
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,1)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "0 64px" }}
              />
            </motion.div>

            {/* Tagline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: booting ? 0 : 1, y: booting ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-3xl sm:text-4xl font-bold tracking-tight text-transparent"
            >
              {tagline}
            </motion.h1>

            {/* Welcome text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: booting ? 0 : 1, y: booting ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-3 max-w-md text-sm sm:text-base text-white/60"
            >
              Welcome to your personal trading dashboard
            </motion.p>

            {/* Mini stat chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: booting ? 0 : 1, y: booting ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
            >
              {[
                { label: "Live PSX", dot: "bg-emerald-400" },
                { label: "Real-time P&L", dot: "bg-cyan-400" },
                { label: "Smart Insights", dot: "bg-purple-400" },
              ].map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-md"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${c.dot} animate-pulse`} />
                  {c.label}
                </span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: booting ? 0 : 1, y: booting ? 20 : 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={enterDashboard}
              className="welcome-cta group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/25 bg-gradient-to-r from-emerald-400/30 via-emerald-300/20 to-cyan-400/30 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(52,211,153,0.6)] transition-shadow hover:shadow-[0_15px_60px_-10px_rgba(52,211,153,0.9)]"
            >
              {/* Shine sweep on hover */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <TrendingUp className="relative h-4 w-4" />
              <span className="relative">Enter Dashboard</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>

            {/* Skip */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: booting ? 0 : 0.5 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              onClick={enterDashboard}
              className="mt-4 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Skip intro
            </motion.button>
          </div>
        </motion.div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: booting ? 0 : 0.4 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-8 text-center text-[11px] uppercase tracking-[0.25em] text-white/40"
        >
          Powered by Live PSX Data
        </motion.div>
      </div>
    </div>
  );
}

function BullIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Horns */}
      <path
        d="M10 18 C 6 10, 14 6, 20 12 C 22 14, 24 16, 26 18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M54 18 C 58 10, 50 6, 44 12 C 42 14, 40 16, 38 18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Head */}
      <path
        d="M18 20 C 18 14, 24 12, 32 12 C 40 12, 46 14, 46 20 L 46 36 C 46 44, 40 50, 32 50 C 24 50, 18 44, 18 36 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Eyes */}
      <circle cx="26" cy="28" r="2" fill="currentColor" />
      <circle cx="38" cy="28" r="2" fill="currentColor" />
      {/* Nose ring */}
      <ellipse cx="32" cy="40" rx="5" ry="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="29" cy="40" r="0.8" fill="currentColor" />
      <circle cx="35" cy="40" r="0.8" fill="currentColor" />
      {/* Up arrow accent */}
      <path
        d="M32 8 L 32 4 M 28 6 L 32 2 L 36 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
