"use client";

import SectionReveal from "./SectionReveal";
import { AlertTriangle, Clock, Cpu } from "lucide-react";
import type { ReactNode } from "react";

const painPoints: {
  icon: typeof AlertTriangle;
  stat: string;
  title: string;
  description: ReactNode;
  color: string;
}[] = [
  {
    icon: AlertTriangle,
    stat: "Constant Fragmentation",
    title: "Your attention is under siege",
    description: (
      <>
        The average knowledge worker context-switches every 3 minutes. Each
        interruption costs up to 23 minutes of recovery time.
        <a
          href="https://ics.uci.edu/~gmark/chi2008-mark.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-baseline"
        >
          <sup className="ml-0.5 text-[10px] text-violet-400 hover:text-violet-300 transition-colors cursor-pointer">&#91;1&#93;</sup>
        </a>{" "}
        Focus has become the scarcest resource in modern work.
      </>
    ),
    color: "violet",
  },
  {
    icon: Clock,
    stat: "Willpower Dependency",
    title: "Tools optimize tasks, not you",
    description:
      "Calendars, timers, to-do lists — they organize work, but ignore the person doing it. They don't know if you're cognitively ready, drifting, or running on fumes.",
    color: "cyan",
  },
  {
    icon: Cpu,
    stat: "Zero Context Awareness",
    title: "Software doesn't understand state",
    description:
      "Current productivity tools treat you the same at 9 AM and 4 PM. They don't sense your energy, environment, or readiness. They have no idea when you're primed for deep work.",
    color: "fuchsia",
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; shadow: string }> = {
  violet: {
    border: "border-violet-500/20",
    bg: "bg-violet-500/[0.06]",
    text: "text-violet-400",
    shadow: "shadow-violet-500/5",
  },
  cyan: {
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/[0.06]",
    text: "text-cyan-400",
    shadow: "shadow-cyan-500/5",
  },
  fuchsia: {
    border: "border-fuchsia-500/20",
    bg: "bg-fuchsia-500/[0.06]",
    text: "text-fuchsia-400",
    shadow: "shadow-fuchsia-500/5",
  },
};

export default function Problem() {
  return (
    <section className="relative py-28 md:py-36">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-violet-600/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <SectionReveal>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-4">
              The Problem
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-b from-white to-slate-400 text-gradient">
                Focus is failing — and tools aren&apos;t helping
              </span>
            </h2>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed">
              Modern knowledge work is fragmented, noisy, and cognitively
              expensive. You&apos;re left to manage attention with willpower, caffeine,
              and software that has no idea who you are.
            </p>
          </div>
        </SectionReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((point, i) => {
            const c = colorMap[point.color];
            return (
              <SectionReveal key={point.title} delay={i * 0.12}>
                <div
                  className={`group relative rounded-2xl border ${c.border} bg-white/[0.02] p-8 h-full transition-all duration-500 hover:bg-white/[0.04] hover:shadow-xl ${c.shadow}`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${c.bg} mb-5`}
                  >
                    <point.icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <div
                    className={`text-xs font-semibold tracking-wider uppercase ${c.text} mb-2`}
                  >
                    {point.stat}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {point.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
