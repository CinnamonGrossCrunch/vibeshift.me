"use client";

import Image from "next/image";
import SectionReveal from "./SectionReveal";

const founders = [
  {
    name: "Neha Dinesh",
    role: "Co-Founder",
    image: "/headshots/Neha Headshot.jpg",
    linkedin: "https://www.linkedin.com/in/menehadinesh/",
    bio: "Mechanical engineer from UC Berkeley who designed actuators for Figure's humanoid robots and production systems for Rivian's R2 EV. After three years engineering suspension dynamics on Berkeley Formula Racing — where milliseconds of response time define performance — Neha became obsessed with the gap between human capability and the systems designed to support it. Her first startup was admitted to SkyDeck Pad-13 and acquired. Now she's applying that same precision to the most complex system of all: human cognition.",
    grayscale: true,
  },
  {
    name: "Matt Gross",
    role: "Co-Founder",
    image: "/headshots/MAtt Head Shot .jpeg",
    linkedin: "https://www.linkedin.com/in/menehadinesh/",
    bio: "Product design engineer who spent a decade building adaptive physical systems — from pneumatic medical devices and GitHub's HQ infrastructure to AI-powered platforms. After years of designing products that respond to real-world constraints in real time, Matt recognized the same adaptive loop was missing from how people work. Currently completing his MBA at UC Berkeley Haas, he's channeling that cross-disciplinary lens into building software that finally treats human performance as a design variable, not a constant.",
    grayscale: false,
  },
];

export default function Founders() {
  return (
    <section id="founders" className="relative pt-8 md:pt-12 pb-28 md:pb-36 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 right-0 w-[500px] h-[400px] rounded-full blur-[160px] will-change-transform"
          style={{ background: "oklch(0.55 0.2 285 / 0.04)" }}
        />
        <div
          className="absolute bottom-1/4 left-0 w-[400px] h-[350px] rounded-full blur-[140px] will-change-transform"
          style={{ background: "oklch(0.65 0.15 195 / 0.03)" }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        <SectionReveal>
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-violet-400 mb-6">
            The Team
          </span>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            <span className="bg-gradient-to-r from-white via-violet-200 to-cyan-200 text-gradient">
              Meet the founders
            </span>
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <p className="text-slate-500 text-lg max-w-2xl mb-16">
            Building the operating system for deep work.
          </p>
        </SectionReveal>

        <div className="grid md:grid-cols-2 gap-8">
          {founders.map((founder, i) => (
            <SectionReveal key={founder.name} delay={0.2 + i * 0.1}>
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-8 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center gap-5 mb-5">
                  <div className="relative w-60 h-60 rounded-full overflow-hidden ring-2 ring-white/[0.08] group-hover:ring-violet-500/30 transition-all duration-300 flex-shrink-0">
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      fill
                      className={`object-cover ${founder.grayscale ? 'grayscale' : ''}`}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-violet-200 transition-colors">
                      {founder.name}
                    </h3>
                    <p className="text-sm text-violet-400/80 font-medium">
                      {founder.role}
                    </p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed text-center">
                  {founder.bio}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600 group-hover:text-violet-400/60 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </div>
              </a>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
