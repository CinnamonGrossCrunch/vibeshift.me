"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 backdrop-blur-2xl bg-void/80 border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            VibeShift
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#vision"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Vision
          </a>
        </div>

        <button
          onClick={scrollToWaitlist}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-white/[0.07] border border-white/[0.1] text-white hover:bg-white/[0.12] hover:border-white/[0.18] transition-all active:scale-[0.97]"
        >
          Get Early Access
        </button>
      </div>
    </motion.nav>
  );
}
