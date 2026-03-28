"use client";

import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] bg-void">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold tracking-tight text-white">
                VibeShift
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              The cognitive operating system for deep work. Multimodal
              intelligence that senses, interprets, and orchestrates your ideal
              conditions for peak performance.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                aria-label="Twitter"
              >
                Twitter / X
              </a>
              <a
                href="#"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                aria-label="LinkedIn"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                aria-label="GitHub"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {["How It Works", "Features", "Vision", "Waitlist"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                      className="text-sm text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-slate-600 hover:text-slate-300 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-700">
            &copy; {new Date().getFullYear()} VibeShift. All rights reserved.
          </div>
          <div className="flex gap-6 text-xs text-slate-700">
            <a
              href="#"
              className="hover:text-slate-400 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-slate-400 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>

        {/* Contact email */}
        <div className="mt-8 text-center">
          <a
            href="mailto:hello@vibeshift.me"
            className="text-xs text-slate-700 hover:text-violet-400 transition-colors"
          >
            hello@vibeshift.me
          </a>
        </div>
      </div>
    </footer>
  );
}
