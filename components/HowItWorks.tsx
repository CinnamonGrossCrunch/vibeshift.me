"use client";

import { motion } from "framer-motion";
import SectionReveal from "./SectionReveal";
import { Scan, BrainCircuit, Layers, RefreshCw } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Scan,
    title: "Sense",
    description:
      "Capture signals from wearable biometrics, typing and browsing behavior, environmental sensors, and optional neurotech devices. Build a rich, multi-layered input stream.",
    gradient: "from-violet-500 to-violet-600",
    glowColor: "violet",
  },
  {
    number: "02",
    icon: BrainCircuit,
    title: "Interpret",
    description:
      "Transform raw signals into a real-time cognitive profile. Understand readiness, load, drift velocity, recovery state, and the factors that drive your personal patterns.",
    gradient: "from-cyan-500 to-cyan-600",
    glowColor: "cyan",
  },
  {
    number: "03",
    icon: Layers,
    title: "Orchestrate",
    description:
      "Trigger personalized interventions at the right moment. Shape notifications, soundscapes, lighting, scheduling, and workflow to match your current cognitive state.",
    gradient: "from-fuchsia-500 to-fuchsia-600",
    glowColor: "fuchsia",
  },
  {
    number: "04",
    icon: RefreshCw,
    title: "Adapt",
    description:
      "Continuously learn what works for you. Refine your personal model over time. Get better at protecting your best hours and recovering from your worst.",
    gradient: "from-emerald-500 to-emerald-600",
    glowColor: "emerald",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 md:py-36 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none will-change-transform" style={{ background: 'oklch(0.65 0.15 195 / 0.03)' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none will-change-transform" style={{ background: 'oklch(0.55 0.2 285 / 0.03)' }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <SectionReveal>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-b from-white to-slate-400 text-gradient">
                Four stages of cognitive orchestration
              </span>
            </h2>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed">
              A continuous loop that transforms raw data into adaptive,
              personalized support — getting smarter with every session.
            </p>
          </div>
        </SectionReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
          {steps.map((step, i) => (
            <SectionReveal key={step.title} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 h-full transition-all duration-500 hover:bg-white/[0.04] hover:border-white/[0.1]"
              >
                {/* Step number */}
                <div className="text-[80px] font-bold leading-none text-white/[0.03] absolute top-4 right-5 select-none pointer-events-none">
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>

                {/* Connecting line (hidden on mobile, shown between cards on lg) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}
              </motion.div>
            </SectionReveal>
          ))}
        </div>

        {/* Process flow indicator */}
        <SectionReveal delay={0.5}>
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              {steps.map((step, i) => (
                <div key={step.title} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-br ${step.gradient}`}
                  />
                  {i < steps.length - 1 && (
                    <div className="w-8 md:w-12 h-px bg-gradient-to-r from-white/20 to-white/5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
