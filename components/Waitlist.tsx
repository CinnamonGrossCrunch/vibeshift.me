"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionReveal from "./SectionReveal";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="waitlist"
      className="relative py-28 md:py-40 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-violet-600/[0.06] rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-cyan-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <SectionReveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/[0.08] text-violet-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Founding User Program
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-b from-white to-slate-400 text-gradient">
              Shape the future of focus
            </span>
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
            We&apos;re building VibeShift with a small group of ambitious early adopters.
            Join the waitlist to get founding access and help define what
            adaptive cognitive systems become.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.06] transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="group px-6 py-3.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 flex items-center justify-center gap-2 text-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Joining..." : "Join the Waitlist"}
                {!loading && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-10 inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400"
            >
              <Check className="w-5 h-5" />
              <span className="font-medium">
                You&apos;re on the list. We&apos;ll be in touch.
              </span>
            </motion.div>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </SectionReveal>

        <SectionReveal delay={0.25}>
          <p className="mt-6 text-xs text-slate-600">
            No spam. Early access for founding users only. Unsubscribe anytime.
          </p>
        </SectionReveal>

        {/* Trust signals */}
        <SectionReveal delay={0.3}>
          <div className="mt-14 flex flex-wrap justify-center gap-6">
            {[
              "Founding User Access",
              "Shape the Product",
              "Priority Support",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-slate-500"
              >
                <div className="w-1 h-1 rounded-full bg-violet-500" />
                {item}
              </div>
            ))}
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
