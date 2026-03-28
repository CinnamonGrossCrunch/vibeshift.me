"use client";

import { motion } from "framer-motion";
import {
  Radio,
  Layers,
  BrainCircuit,
  Signal,
  Activity,
} from "lucide-react";

const items = [
  { icon: Radio, label: "Multimodal Sensing" },
  { icon: BrainCircuit, label: "Adaptive Focus Systems" },
  { icon: Layers, label: "Ambient Intelligence" },
  { icon: Signal, label: "Behavioral Signal Modeling" },
  { icon: Activity, label: "Real-Time Cognitive Support" },
];

export default function TrustStrip() {
  return (
    <section className="relative py-8 border-y border-white/[0.04] bg-white/[0.01] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap justify-center gap-x-10 gap-y-4"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center gap-2.5 text-slate-500"
            >
              <item.icon className="w-4 h-4 text-violet-500/60" />
              <span className="text-sm font-medium tracking-wide uppercase whitespace-nowrap">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
