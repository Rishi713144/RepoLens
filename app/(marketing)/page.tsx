"use client";

import Link from "next/link";
import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ParticleField } from "@/components/three/ParticleField";
import { CodeOrb } from "@/components/three/CodeOrb";
import { motion } from "framer-motion";
import { ArrowRight, GitBranch, Cpu, ShieldCheck, Zap, Code } from "lucide-react";
import * as THREE from "three";

function FloatingIcon({ children, delay, x, y }: { children: React.ReactNode; delay: number; x: number; y: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + delay;
    ref.current.position.y = y + Math.sin(t * 0.5) * 0.3;
    ref.current.rotation.y = t * 0.3;
  });
  return <group ref={ref} position={[x, y, 0]} />;
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#c8b4a0" />
      <pointLight position={[-5, 3, -5]} intensity={0.3} color="#60a5fa" />
      <ParticleField count={1500} spread={40} speed={0.2} color="#c8b4a0" size={0.012} />
      <CodeOrb nodeCount={25} radius={2.8} />
    </>
  );
}

const marketingPhrases = [
  "Understand code 10x faster",
  "Scale your engineering team",
  "Navigate complex repositories",
  "Master any tech stack",
  "Tailored for your skill level",
  "Instant architecture insights",
  "No more documentation gaps",
  "Onboard in minutes, not weeks",
];

const features = [
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: "3D Dependency Mapping",
    desc: "Visualize how files interact with a real-time 3D force-directed graph. Rotate, zoom, and discover bottlenecks instantly.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Context-Aware AI",
    desc: "Explanations that understand your whole project structure, not just isolated snippets. Powered by Gemini 1.5 Pro.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Skill Adaptation",
    desc: "Toggle between Junior, Mid, and Senior modes to get explanations that match your experience level.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-400",
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-black text-[#f8f7f5] selection:bg-[#c8b4a0]/30 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 h-16 flex items-center justify-between glass-panel-light">
        <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
          <div className="bg-[#c8b4a0] p-1.5 rounded-lg">
            <Code className="w-5 h-5 text-black" />
          </div>
          <span>Repo<span className="text-[#c8b4a0]">Lens</span></span>
        </div>
        <Link
          href="/dashboard"
          className="glass-button px-6 py-2 rounded-full text-sm"
        >
          Get Started
        </Link>
      </header>

      {/* Hero with 3D Scene */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
          >
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </Canvas>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-extrabold leading-[0.95] tracking-tight mb-6"
          >
            Read code like a{" "}
            <br />
            <span className="text-gradient">Senior Engineer.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-lg md:text-xl text-[#a3a3a3] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Stop getting lost in massive repositories. Analyze any GitHub URL and get an interactive 3D roadmap, dependency graphs, and skill-tailored explanations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 glass-button px-10 py-4 rounded-full text-lg font-bold"
            >
              Analyze Project <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-black to-transparent" />
      </section>

      {/* Marquee */}
      <section className="relative py-6 border-y border-white/5 overflow-hidden bg-black">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...marketingPhrases, ...marketingPhrases].map((text, idx) => (
            <span
              key={idx}
              className="mx-10 text-xs font-medium uppercase tracking-[0.2em] text-[#c8b4a0]/30"
            >
              {text}
            </span>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to{" "}
              <span className="text-gradient">understand any codebase</span>
            </h2>
            <p className="text-[#a3a3a3] max-w-xl mx-auto">
              From dependency mapping to AI-powered explanations, RepoLens gives you superpowers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="glass-panel rounded-2xl p-8 glow-border group hover:scale-[1.02] transition-transform duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${feature.gradient} ${feature.iconColor} mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#f8f7f5]">{feature.title}</h3>
                <p className="text-[#a3a3a3] leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 6], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.15} />
              <ParticleField count={800} spread={30} speed={0.15} color="#60a5fa" size={0.01} />
            </Suspense>
          </Canvas>
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl p-12 md:p-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-gradient">decode</span> your repo?
            </h2>
            <p className="text-[#a3a3a3] mb-10 max-w-lg mx-auto">
              Paste any GitHub URL and get instant architecture insights, dependency maps, and AI-powered explanations.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 glass-button px-10 py-4 rounded-full text-lg font-bold"
            >
              Launch RepoLens <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold">
            <Code className="w-5 h-5 text-[#c8b4a0]" />
            <span>RepoLens</span>
          </div>
          <div className="flex gap-8 text-sm text-[#a3a3a3]">
            <Link href="#" className="hover:text-[#f8f7f5] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#f8f7f5] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#f8f7f5] transition-colors">GitHub</Link>
          </div>
          <p className="text-sm text-[#555]">
            &copy; {new Date().getFullYear()} RepoLens Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
