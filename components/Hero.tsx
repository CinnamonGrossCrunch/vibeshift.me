"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import NeuralCanvas from "./NeuralCanvas";

export default function Hero() {
  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHowItWorks = () => {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] animate-pulse-slow will-change-transform" style={{ background: 'oklch(0.55 0.2 285 / 0.18)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] animate-pulse-slow [animation-delay:2s] will-change-transform" style={{ background: 'oklch(0.65 0.15 195 / 0.1)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[140px] animate-pulse-slow [animation-delay:4s] will-change-transform" style={{ background: 'oklch(0.55 0.18 285 / 0.1)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full blur-[120px] animate-pulse-slow [animation-delay:3s] will-change-transform" style={{ background: 'oklch(0.6 0.2 330 / 0.06)' }} />
      </div>

      {/* Neural canvas */}
      <NeuralCanvas />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-void/40 via-transparent to-void pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/[0.08] text-violet-300 text-sm font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Introducing VibeShift
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]"
        >
          <span className="bg-gradient-to-b from-white via-white to-slate-400 text-gradient">
            The Operating System
          </span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-cyan-400 text-gradient">
            for Deep Work
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-7 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Multimodal intelligence that senses your cognitive state, understands
          your patterns, and actively shapes the conditions for peak
          performance.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={scrollToWaitlist}
            className="group px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Join the Waitlist
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={scrollToHowItWorks}
            className="px-8 py-4 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 hover:border-white/[0.18] active:scale-[0.98]"
          >
            See How It Works
          </button>
        </motion.div>

        {/* Floating preview cards (desktop only) */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
          className="hidden lg:flex mt-20 justify-center gap-6"
        >
          {/* Left card */}
          <div className="glass rounded-2xl p-5 w-56 text-left animate-float">
            <div className="text-xs text-violet-400 font-medium uppercase tracking-wider mb-2">
              Focus Readiness
            </div>
            <div className="text-3xl font-bold text-white">87%</div>
            <div className="text-xs text-slate-500 mt-1">
              Optimal window detected
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
            </div>
          </div>

          {/* Center card */}
          <div className="glass rounded-2xl p-5 w-64 text-left animate-float [animation-delay:1s]">
            <div className="text-xs text-cyan-400 font-medium uppercase tracking-wider mb-2">
              Active Session
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-slate-300">Deep Work Mode</span>
            </div>
            <div className="text-2xl font-mono font-bold text-white mt-2 tabular-nums">
              01:23:45
            </div>
            <div className="mt-3 flex gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Flow State
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Score: 94
              </span>
            </div>
          </div>

          {/* Right card */}
          <div className="glass rounded-2xl p-5 w-56 text-left animate-float [animation-delay:2s]">
            <div className="text-xs text-fuchsia-400 font-medium uppercase tracking-wider mb-2">
              Interventions
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-1 h-1 rounded-full bg-violet-400" />
                Notifications silenced
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-1 h-1 rounded-full bg-cyan-400" />
                Ambient soundscape on
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                Focus lighting active
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <button
          onClick={scrollToHowItWorks}
          className="text-slate-600 hover:text-slate-400 transition-colors"
          aria-label="Scroll down"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </motion.div>
    </section>
  );
}
