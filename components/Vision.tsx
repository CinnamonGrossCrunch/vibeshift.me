"use client";

import SectionReveal from "./SectionReveal";

export default function Vision() {
  return (
    <section id="vision" className="relative py-28 md:py-40 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-0 w-[600px] h-[400px] rounded-full blur-[160px] will-change-transform" style={{ background: 'oklch(0.55 0.2 285 / 0.04)' }} />
        <div className="absolute bottom-1/3 right-0 w-[500px] h-[400px] rounded-full blur-[140px] will-change-transform" style={{ background: 'oklch(0.65 0.15 195 / 0.03)' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        <SectionReveal>
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-6">
            Our Vision
          </span>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-10">
            <span className="bg-gradient-to-r from-white via-violet-200 to-cyan-200 text-gradient">
              The next great interface is between human and state
            </span>
          </h2>
        </SectionReveal>

        <div className="space-y-6 text-base md:text-lg text-slate-400 leading-relaxed">
          <SectionReveal delay={0.15}>
            <p>
              For decades, productivity software has optimized tasks — calendars,
              to-do lists, project boards. But it has ignored the most important
              variable:{" "}
              <span className="text-slate-200 font-medium">the person</span>.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <p>
              Your cognitive capacity isn&apos;t constant. It shifts with sleep,
              stress, light, nutrition, context, and time of day. The tools you
              use today don&apos;t know this. They treat you like a machine with
              unlimited attention.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.25}>
            <p className="text-slate-200 text-lg md:text-xl font-medium border-l-2 border-violet-500/40 pl-6 my-8">
              We&apos;re building the first system that treats focus as an
              engineered outcome — not a character trait.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.3}>
            <p>
              A system that senses what&apos;s happening across your body, behavior,
              and environment. That builds a living model of your cognitive
              rhythms. That actively orchestrates the conditions for your best
              work — adjusting in real time as you change.
            </p>
          </SectionReveal>

          <SectionReveal delay={0.35}>
            <p>
              This is not another productivity app. This is the beginning of{" "}
              <span className="text-slate-200 font-medium">
                adaptive cognitive infrastructure
              </span>
              .
            </p>
          </SectionReveal>

          <SectionReveal delay={0.4}>
            <p className="text-slate-300">
              The future of performance is not about doing more. It&apos;s about
              knowing{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 text-gradient font-semibold">
                when, how, and what to protect
              </span>
              .
            </p>
          </SectionReveal>
        </div>

        {/* Signature line */}
        <SectionReveal delay={0.45}>
          <div className="mt-16 pt-8 border-t border-white/[0.06]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-sm font-bold text-white">
                V
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  The VibeShift Team
                </div>
                <div className="text-xs text-slate-600">
                  Building the operating system for deep work
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
