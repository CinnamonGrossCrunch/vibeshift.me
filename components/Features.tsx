"use client";

import { motion } from "framer-motion";
import SectionReveal from "./SectionReveal";
import {
  Zap,
  Eye,
  SlidersHorizontal,
  Sun,
  Activity,
  Battery,
  AudioLines,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Deep Work Activation",
    description:
      "Automatically detect when conditions align for deep work and trigger your optimal focus environment — lights, sound, notifications, all tuned.",
    accent: "violet",
  },
  {
    icon: Eye,
    title: "Drift Detection",
    description:
      "Real-time awareness of focus decay, context switching, and cognitive drift. Catch momentum loss before it compounds.",
    accent: "cyan",
  },
  {
    icon: SlidersHorizontal,
    title: "Adaptive Focus Modes",
    description:
      "Dynamic focus profiles that adjust based on task type, energy level, time of day, and historical performance patterns.",
    accent: "violet",
  },
  {
    icon: Sun,
    title: "Environment Intelligence",
    description:
      "Sense and shape lighting, acoustics, temperature cues, and digital environment for cognitive performance in any space.",
    accent: "fuchsia",
  },
  {
    icon: Activity,
    title: "Wearable Signal Fusion",
    description:
      "Integrate data from HRV monitors, EEG headbands, smart rings, and activity trackers for a complete picture of readiness.",
    accent: "cyan",
  },
  {
    icon: Battery,
    title: "Recovery Guidance",
    description:
      "Know when to push and when to rest. Guided recovery windows based on accumulated cognitive load and personal thresholds.",
    accent: "emerald",
  },
  {
    icon: AudioLines,
    title: "Ambient Interventions",
    description:
      "Subtle, automatic adjustments — generative soundscapes, notification silencing, focus lighting — timed to your state.",
    accent: "fuchsia",
  },
  {
    icon: BarChart3,
    title: "Cognitive Rhythm Mapping",
    description:
      "Discover your personal cognitive architecture. Map daily peaks, valleys, transition windows, and optimal work schedules.",
    accent: "emerald",
  },
];

const accentMap: Record<string, { icon: string; border: string; bg: string }> = {
  violet: {
    icon: "text-violet-400",
    border: "group-hover:border-violet-500/20",
    bg: "bg-violet-500/[0.06]",
  },
  cyan: {
    icon: "text-cyan-400",
    border: "group-hover:border-cyan-500/20",
    bg: "bg-cyan-500/[0.06]",
  },
  fuchsia: {
    icon: "text-fuchsia-400",
    border: "group-hover:border-fuchsia-500/20",
    bg: "bg-fuchsia-500/[0.06]",
  },
  emerald: {
    icon: "text-emerald-400",
    border: "group-hover:border-emerald-500/20",
    bg: "bg-emerald-500/[0.06]",
  },
};

export default function Features() {
  return (
    <section id="features" className="relative py-28 md:py-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/50 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <SectionReveal>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400 mb-4">
              Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-b from-white to-slate-400 text-gradient">
                Engineered for peak cognitive performance
              </span>
            </h2>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed">
              Every feature is designed to sense, protect, and enhance the
              conditions that let you do your best work.
            </p>
          </div>
        </SectionReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const a = accentMap[feature.accent];
            return (
              <SectionReveal key={feature.title} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className={`group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-full transition-all duration-400 hover:bg-white/[0.04] ${a.border}`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${a.bg} mb-4`}
                  >
                    <feature.icon className={`w-5 h-5 ${a.icon}`} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
