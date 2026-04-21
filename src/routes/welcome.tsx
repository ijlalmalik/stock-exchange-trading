import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useRef } from "react";
import { TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import bullImg from "@/assets/bull-hero.png";

export const Route = createFileRoute("/welcome")({
  component: WelcomeRoute,
});

function WelcomeRoute() {
  return <WelcomeScreen />;
}

export { WelcomeScreen };

const TAGLINES = [
  "Trade Smart. Grow Strong.",
  "Your Market. Your Moves.",
  "Precision. Power. Profit.",
];

// Animation phase timeline (ms) — tight so the screen feels instant
const T_BOOT = 350;
const T_RUN = 750;
const T_STOMP = 320;
const T_REVEAL = 500;

function WelcomeScreen({ onDone }: { onDone?: () => void } = {}) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"boot" | "run" | "stomp" | "ui">("boot");
  // Pick tagline AFTER mount to avoid SSR/CSR hydration mismatch from Math.random()
  const [tagline, setTagline] = useState(TAGLINES[0]);
  useEffect(() => {
    setTagline(TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);
  }, []);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax mouse tracking
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const heroX = useTransform(sx, (v) => v * 12);
  const heroY = useTransform(sy, (v) => v * 12);
  const blob1X = useTransform(sx, (v) => v * -40);
  const blob1Y = useTransform(sy, (v) => v * -40);
  const blob2X = useTransform(sx, (v) => v * 30);
  const blob2Y = useTransform(sy, (v) => v * 30);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("run"), T_BOOT);
    const t2 = setTimeout(() => setPhase("stomp"), T_BOOT + T_RUN);
    const t3 = setTimeout(() => setPhase("ui"), T_BOOT + T_RUN + T_STOMP);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
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
    if (onDone) {
      onDone();
    } else {
      navigate({ to: "/" });
    }
  };

  const tickers = useMemo(
    () => [
      { sym: "KSE100", val: "+0.94%", top: "12%", left: "8%", delay: 0 },
      { sym: "OGDC", val: "+2.41%", top: "22%", left: "82%", delay: 0.6 },
      { sym: "LUCK", val: "+5.10%", top: "70%", left: "10%", delay: 1.2 },
      { sym: "ENGRO", val: "+1.22%", top: "78%", left: "84%", delay: 0.3 },
      { sym: "HBL", val: "+0.74%", top: "44%", left: "4%", delay: 0.9 },
      { sym: "PSO", val: "+4.07%", top: "55%", left: "90%", delay: 1.5 },
    ],
    [],
  );

  // Pre-compute dust particles
  const dustParticles = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        angle: (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
        dist: 80 + Math.random() * 220,
        size: 30 + Math.random() * 80,
        delay: Math.random() * 0.15,
        duration: 1.4 + Math.random() * 1.2,
      })),
    [],
  );

  // Pre-compute flying notes
  const notes = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        denom: i % 2 === 0 ? "1000" : "500",
        startX: -40 + Math.random() * 80,
        startY: 40 + Math.random() * 30,
        endX: -300 + Math.random() * 600,
        endY: -200 - Math.random() * 350,
        rotate: -180 + Math.random() * 360,
        delay: Math.random() * 0.4,
        duration: 2.4 + Math.random() * 1.5,
        scale: 0.7 + Math.random() * 0.6,
      })),
    [],
  );

  const showHero = phase === "stomp" || phase === "ui";
  const showUI = phase === "ui";

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
      <AnimatePresence>
        {phase === "boot" && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-[#05070d]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
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
      </AnimatePresence>

      {/* === BULL CINEMATIC LAYER (lowered so bull legs touch the card) === */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[72vh] items-end justify-center pb-2 sm:h-[70vh]">
        <div className="relative h-full w-full max-w-5xl">
          {/* Shockwave on stomp */}
          <AnimatePresence>
            {phase === "stomp" && (
              <motion.div
                key="shock"
                className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-300/70"
                initial={{ width: 20, height: 20, opacity: 0.9 }}
                animate={{ width: 900, height: 900, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {phase === "stomp" && (
              <motion.div
                key="shock2"
                className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/60"
                initial={{ width: 20, height: 20, opacity: 0.8 }}
                animate={{ width: 1200, height: 1200, opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeOut", delay: 0.1 }}
              />
            )}
          </AnimatePresence>

          {/* Dust particles */}
          <AnimatePresence>
            {(phase === "stomp" || phase === "ui") &&
              dustParticles.map((p) => {
                const tx = Math.cos(p.angle) * p.dist;
                const ty = Math.sin(p.angle) * p.dist - 40; // bias upward
                return (
                  <motion.div
                    key={p.id}
                    className="absolute left-1/2 top-[62%] rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      background:
                        "radial-gradient(circle, rgba(220,230,255,0.55), rgba(180,200,230,0.15) 60%, transparent 75%)",
                      filter: "blur(6px)",
                      marginLeft: -p.size / 2,
                      marginTop: -p.size / 2,
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
                    animate={{
                      x: tx,
                      y: ty,
                      opacity: [0, 0.8, 0],
                      scale: [0.3, 1, 1.6],
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      ease: "easeOut",
                    }}
                  />
                );
              })}
          </AnimatePresence>

          {/* Flying rupee notes */}
          <AnimatePresence>
            {(phase === "stomp" || phase === "ui") &&
              notes.map((n) => (
                <motion.div
                  key={n.id}
                  className="absolute left-1/2 top-[62%]"
                  initial={{
                    x: n.startX,
                    y: n.startY,
                    opacity: 0,
                    rotate: 0,
                    scale: 0.4,
                  }}
                  animate={{
                    x: n.endX,
                    y: n.endY,
                    opacity: [0, 1, 1, 0],
                    rotate: n.rotate,
                    scale: n.scale,
                  }}
                  transition={{
                    duration: n.duration,
                    delay: n.delay,
                    ease: "easeOut",
                  }}
                >
                  <RupeeNote denom={n.denom} />
                </motion.div>
              ))}
          </AnimatePresence>

          {/* Bull image — anchored upper area */}
          <motion.img
            src={bullImg}
            alt="Glass bull"
            initial={{ x: "-120vw", y: 0, scale: 1, opacity: 0, filter: "blur(8px)" }}
            animate={
              phase === "boot"
                ? { x: "-120vw", opacity: 0 }
                : phase === "run"
                  ? { x: "-5%", opacity: 1, filter: "blur(2px)", scale: 1.0 }
                  : phase === "stomp"
                    ? { x: "0%", y: [0, -10, 8, 0], scale: [1.0, 1.03, 0.98, 1], opacity: 1, filter: "blur(0px)" }
                    : { x: heroX as unknown as number, y: heroY as unknown as number, scale: 1, opacity: 1, filter: "blur(0px)" }
            }
            transition={
              phase === "run"
                ? { duration: T_RUN / 1000, ease: [0.2, 0.7, 0.3, 1] }
                : phase === "stomp"
                  ? { duration: 0.5, ease: "easeOut" }
                  : { duration: 0.6, ease: "easeOut" }
            }
            className="absolute left-1/2 top-1/2 h-[42vh] max-h-[400px] w-auto -translate-x-1/2 -translate-y-1/2 select-none sm:h-[46vh]"
            style={{
              filter: showHero
                ? "drop-shadow(0 30px 60px rgba(52,211,153,0.45)) drop-shadow(0 0 80px rgba(59,130,246,0.35))"
                : undefined,
            }}
            draggable={false}
          />

          {/* Ground glow under bull */}
          <AnimatePresence>
            {showHero && (
              <motion.div
                className="absolute left-1/2 top-[78%] h-12 w-[60%] -translate-x-1/2 rounded-[50%] bg-emerald-400/30 blur-2xl"
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 0.7, scaleX: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* === MAIN UI — sits in lower section so bull legs visually touch the card === */}
      <div className="relative z-30 flex min-h-screen flex-col items-center justify-end px-6 pb-10 pt-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={showUI ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="welcome-card relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/[0.07] p-7 sm:p-9 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur-[40px] backdrop-saturate-200"
        >
          {/* Shimmer sweep */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
            <motion.div
              className="absolute -inset-x-1/2 -top-1/2 h-[200%] w-[60%] -rotate-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/10 via-transparent to-transparent" />

          <div className="relative flex flex-col items-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={showUI ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-3xl sm:text-4xl font-bold tracking-tight text-transparent"
            >
              {tagline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={showUI ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-3 max-w-md text-sm sm:text-base text-white/60"
            >
              Welcome to your personal trading dashboard
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={showUI ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.5 }}
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

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={showUI ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={enterDashboard}
              className="welcome-cta group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/25 bg-gradient-to-r from-emerald-400/30 via-emerald-300/20 to-cyan-400/30 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(52,211,153,0.6)] transition-shadow hover:shadow-[0_15px_60px_-10px_rgba(52,211,153,0.9)]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <TrendingUp className="relative h-4 w-4" />
              <span className="relative">Enter Dashboard</span>
              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0 }}
              animate={showUI ? { opacity: 0.5 } : { opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              onClick={enterDashboard}
              className="mt-4 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Skip intro
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={showUI ? { opacity: 0.4 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-6 text-center text-[11px] uppercase tracking-[0.25em] text-white/40"
        >
          Powered by Live PSX Data
        </motion.div>
      </div>
    </div>
  );
}

function RupeeNote({ denom }: { denom: string }) {
  const isThousand = denom === "1000";
  return (
    <div
      className="relative h-10 w-20 select-none rounded-md border shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
      style={{
        background: isThousand
          ? "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%)"
          : "linear-gradient(135deg, #166534 0%, #22c55e 50%, #14532d 100%)",
        borderColor: isThousand ? "rgba(147,197,253,0.6)" : "rgba(134,239,172,0.6)",
        boxShadow: isThousand
          ? "0 0 20px rgba(59,130,246,0.5), inset 0 1px 0 rgba(255,255,255,0.3)"
          : "0 0 20px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <div className="text-[7px] font-bold uppercase leading-tight text-white/90">
          State Bank
          <br />
          Pakistan
        </div>
        <div className="font-mono text-base font-extrabold text-white drop-shadow">
          {denom}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-tr from-white/0 via-white/20 to-white/0" />
    </div>
  );
}
