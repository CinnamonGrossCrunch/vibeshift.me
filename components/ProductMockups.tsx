"use client";

import { motion } from "framer-motion";
import SectionReveal from "./SectionReveal";
import {
  Activity,
  Bell,
  BellOff,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  Wifi,
} from "lucide-react";

function FocusDashboard() {
  const segments = 60;
  const filled = 52; // ~87%

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-violet-400 font-semibold uppercase tracking-wider">
            Focus Readiness
          </div>
          <div className="text-xs text-slate-600 mt-0.5">
            Updated 2 min ago
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* Circular gauge */}
      <div className="flex justify-center mb-6">
        <div className="relative w-44 h-44">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="8"
            />
            {/* Progress ring */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(filled / segments) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
            />
            <defs>
              <linearGradient
                id="gaugeGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">87</span>
            <span className="text-xs text-slate-500 -mt-0.5">/ 100</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-5">
        <div className="text-sm font-semibold text-white">
          Ready for Deep Work
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          Optimal window: 9:00 AM – 11:30 AM
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "HRV", value: "68ms", status: "good" },
          { label: "Focus", value: "High", status: "good" },
          { label: "Load", value: "Low", status: "good" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center rounded-lg bg-white/[0.03] border border-white/[0.04] py-2"
          >
            <div className="text-xs text-slate-600">{stat.label}</div>
            <div className="text-sm font-semibold text-white">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CognitiveRhythm() {
  const hours = [
    { time: "6a", value: 30, label: "" },
    { time: "7a", value: 45, label: "" },
    { time: "8a", value: 65, label: "" },
    { time: "9a", value: 88, label: "Peak" },
    { time: "10a", value: 92, label: "" },
    { time: "11a", value: 85, label: "" },
    { time: "12p", value: 55, label: "" },
    { time: "1p", value: 40, label: "Rest" },
    { time: "2p", value: 50, label: "" },
    { time: "3p", value: 72, label: "" },
    { time: "4p", value: 78, label: "Creative" },
    { time: "5p", value: 60, label: "" },
    { time: "6p", value: 35, label: "" },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            Cognitive Rhythm
          </div>
          <div className="text-xs text-slate-600 mt-0.5">Today&apos;s pattern</div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Personal Model
        </span>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-1 h-32 mb-3">
        {hours.map((hour, i) => {
          const isHighlight = hour.value > 80;
          const isLow = hour.value < 45;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {hour.label && (
                <span
                  className={`text-[8px] font-medium mb-0.5 ${
                    isHighlight
                      ? "text-violet-400"
                      : isLow
                        ? "text-slate-600"
                        : "text-cyan-400"
                  }`}
                >
                  {hour.label}
                </span>
              )}
              <div
                className={`w-full rounded-t-sm transition-all ${
                  isHighlight
                    ? "bg-gradient-to-t from-violet-600 to-violet-400"
                    : isLow
                      ? "bg-slate-800"
                      : "bg-gradient-to-t from-cyan-700/60 to-cyan-500/60"
                }`}
                style={{ height: `${hour.value}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] text-slate-700">
        {hours
          .filter((_, i) => i % 2 === 0)
          .map((h) => (
            <span key={h.time}>{h.time}</span>
          ))}
      </div>
    </div>
  );
}

function ActiveSession() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
          Active Session
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">In Flow</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">
            Deep Work Mode
          </div>
          <div className="text-xs text-slate-500">System Design Doc</div>
        </div>
      </div>

      <div className="text-3xl font-mono font-bold text-white mb-4 tabular-nums tracking-wider">
        01:23:45
      </div>

      <div className="flex gap-2 mb-4">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Focus: 94
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
          Streak: 3rd
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Low Drift
        </span>
      </div>

      <div className="h-px bg-white/[0.06] mb-4" />

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Next break suggestion</span>
        <span className="text-slate-400 font-medium">36 min</span>
      </div>
    </div>
  );
}

function EnvironmentControl() {
  const controls = [
    {
      icon: Volume2,
      label: "Ambient Sound",
      value: "Deep Focus",
      active: true,
    },
    { icon: BellOff, label: "Notifications", value: "Silenced", active: true },
    {
      icon: Sun,
      label: "Lighting",
      value: "Focus Mode",
      active: true,
    },
    { icon: Moon, label: "Do Not Disturb", value: "Active", active: true },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="text-xs text-fuchsia-400 font-semibold uppercase tracking-wider">
          Environment
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
          Auto-Managed
        </span>
      </div>

      <div className="space-y-3">
        {controls.map((control) => (
          <div
            key={control.label}
            className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0"
          >
            <div className="flex items-center gap-3">
              <control.icon className="w-4 h-4 text-slate-500" />
              <div>
                <div className="text-xs font-medium text-slate-300">
                  {control.label}
                </div>
                <div className="text-[10px] text-slate-600">
                  {control.value}
                </div>
              </div>
            </div>
            <div
              className={`w-8 h-[18px] rounded-full flex items-center px-0.5 transition-colors ${
                control.active ? "bg-violet-600" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  control.active ? "translate-x-3" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterventionTimeline() {
  const events = [
    {
      time: "9:15 AM",
      label: "Notifications silenced",
      icon: BellOff,
      status: "completed",
    },
    {
      time: "9:30 AM",
      label: "Ambient soundscape activated",
      icon: Volume2,
      status: "completed",
    },
    {
      time: "10:00 AM",
      label: "Focus lighting mode",
      icon: Sun,
      status: "completed",
    },
    {
      time: "10:45 AM",
      label: "Drift detected — gentle nudge",
      icon: Bell,
      status: "active",
    },
    {
      time: "11:30 AM",
      label: "Recovery break suggested",
      icon: Moon,
      status: "upcoming",
    },
    {
      time: "2:00 PM",
      label: "Creative session available",
      icon: Wifi,
      status: "upcoming",
    },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="text-xs text-violet-400 font-semibold uppercase tracking-wider">
          Intervention Timeline
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </div>

      <div className="space-y-0">
        {events.map((event, i) => (
          <div key={i} className="flex gap-3 group">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  event.status === "completed"
                    ? "bg-violet-500"
                    : event.status === "active"
                      ? "bg-cyan-400 animate-pulse"
                      : "bg-slate-700"
                }`}
              />
              {i < events.length - 1 && (
                <div className="w-px flex-1 bg-white/[0.04] my-1" />
              )}
            </div>

            {/* Content */}
            <div className="pb-4">
              <div className="text-[10px] text-slate-600 font-mono">
                {event.time}
              </div>
              <div
                className={`text-xs font-medium mt-0.5 ${
                  event.status === "upcoming"
                    ? "text-slate-600"
                    : "text-slate-300"
                }`}
              >
                {event.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductMockups() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full blur-[180px] pointer-events-none will-change-transform" style={{ background: 'oklch(0.55 0.2 285 / 0.03)' }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <SectionReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-fuchsia-400 mb-4">
              Product Preview
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-b from-white to-slate-400 text-gradient">
                Intelligence you can see and feel
              </span>
            </h2>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed">
              Real-time dashboards, cognitive maps, and adaptive controls — all
              working quietly in the background to protect your focus.
            </p>
          </div>
        </SectionReveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Focus Dashboard - spans 1 col, 2 rows on lg */}
          <SectionReveal delay={0}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="lg:row-span-2"
            >
              <FocusDashboard />
            </motion.div>
          </SectionReveal>

          {/* Cognitive Rhythm */}
          <SectionReveal delay={0.1}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-2"
            >
              <CognitiveRhythm />
            </motion.div>
          </SectionReveal>

          {/* Active Session */}
          <SectionReveal delay={0.15}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <ActiveSession />
            </motion.div>
          </SectionReveal>

          {/* Environment Control */}
          <SectionReveal delay={0.2}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <EnvironmentControl />
            </motion.div>
          </SectionReveal>
        </div>

        {/* Intervention timeline - full width below */}
        <SectionReveal delay={0.25}>
          <div className="mt-5">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <InterventionTimeline />
            </motion.div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
