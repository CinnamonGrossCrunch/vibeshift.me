"use client";

import { motion } from "framer-motion";
import SectionReveal from "./SectionReveal";
import { Waves, BrainCircuit, Gauge, Sparkles } from "lucide-react";

const pillars = [
  {
    icon: Waves,
    title: "Multimodal Signal Fusion",
    description:
      "Integrates wearable biometrics, behavioral patterns, environmental data, and optional neurotech to build a complete picture of your cognitive state.",
    color: "from-violet-500/20 to-violet-500/0",
    iconColor: "text-violet-400",
  },
  {
    icon: BrainCircuit,
    title: "Cognitive State Modeling",
    description:
      "AI that understands readiness, focus decay, cognitive overload, and drift — in real time. Your personal model learns what works for you.",
    color: "from-cyan-500/20 to-cyan-500/0",
    iconColor: "text-cyan-400",
  },
  {
    icon: Gauge,
    title: "Adaptive Environment Control",
    description:
      "Automatically shapes your digital and physical environment — notifications, soundscapes, lighting, scheduling — to match your current state.",
    color: "from-fuchsia-500/20 to-fuchsia-500/0",
    iconColor: "text-fuchsia-400",
  },
  {
    icon: Sparkles,
    title: "Intelligent Intervention Engine",
    description:
      "The right support at the right time. Subtle nudges, ambient adjustments, and guided transitions that protect your best cognitive windows.",
    color: "from-emerald-500/20 to-emerald-500/0",
    iconColor: "text-emerald-400",
  },
];

export default function Solution() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/[0.04] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <SectionReveal>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-cyan-400 mb-4">
              The Solution
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-b from-white to-slate-400 text-gradient">
                A system that listens, learns, and adapts
              </span>
            </h2>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed">
              VibeShift combines signals across your body, behavior, and
              environment to understand when you&apos;re ready for deep work — and
              actively shapes the conditions to get you there.
            </p>
          </div>
        </SectionReveal>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {pillars.map((pillar, i) => (
            <SectionReveal key={pillar.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 h-full overflow-hidden transition-colors duration-500 hover:bg-white/[0.04]"
              >
                {/* Gradient accent */}
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${pillar.color}`}
                />

                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <pillar.icon className={`w-5 h-5 ${pillar.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>

        {/* Connecting visual */}
        <SectionReveal delay={0.3}>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass text-sm text-slate-400">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span>
                From raw signals to real-time support — continuously learning
              </span>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
