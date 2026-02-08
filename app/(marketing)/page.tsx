"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Code, 
  Zap, 
  GitBranch, 
  Cpu, 
  ShieldCheck,
  Github
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { StackPilotHero } from "@/components/marketing/StackPilotHero";
import { BackgroundGrid } from "@/components/marketing/BackgroundGrid";

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

export function MarketingMarquee() {
  return (
    <div className="relative flex overflow-x-hidden border-y border-white/10 bg-black/50 py-4">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          ease: "linear",
          duration: 30,
          repeat: Infinity,
        }}
      >
       
        {[...marketingPhrases, ...marketingPhrases].map((text, idx) => (
          <span
            key={idx}
            className="mx-8 text-sm font-medium uppercase tracking-[0.2em] text-[#c8b4a0]/50"
          >
            {text} •
          </span>
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-linear-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-linear-to-l from-black to-transparent" />
    </div>
  );
}
export default function MarketingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-[#c8b4a0]/30">
      {/* --- HEADER --- */}
      <header className="px-6 md:px-12 h-20 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50 text-[#f8f7f5]">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <div className="bg-[#c8b4a0] p-1 rounded-lg">
            <Code className="w-6 h-6 text-black" />
          </div>
          <span>Repo<span className="text-[#c8b4a0]">Lens</span></span>
        </div>
        
       

        <div className="flex items-center">
          <Link 
            href="/dashboard" 
            className="bg-[#c8b4a0] text-black px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="flex-1">
        <StackPilotHero 
          taglineTop={
            <>
              <Zap className="w-4 h-4 inline-block mr-2" /> 
              <span>Now powered by Gemini 1.5 Pro</span>
            </>
          }
          title={
            <>
              Read code like a <br />
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Senior Engineer.
              </span>
            </>
          }
          subtitle="Stop getting lost in massive repositories. Analyze any GitHub URL and get an interactive roadmap, dependency graphs, and skill-tailored explanations."
          cta={
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
            >
              Analyze Project <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          }
          taglineBottom="Understand code 10x faster • Scale your engineering team • Navigate complex repositories"
        />

        {/* --- FEATURES GRID --- */}
        <section className="relative py-24 px-6 bg-[#1a1d18]">
          <BackgroundGrid />
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              <FeatureCard 
                icon={<GitBranch className="w-6 h-6 text-blue-500" />}
                title="Dependency Mapping"
                desc="Visualize how files interact with a 3D force-directed graph. Detect bottlenecks instantly."
              />
              <FeatureCard 
                icon={<Cpu className="w-6 h-6 text-purple-500" />}
                title="Context-Aware AI"
                desc="Explanations that understand your whole project structure, not just isolated snippets."
              />
              <FeatureCard 
                icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
                title="Skill Adaptation"
                desc="Toggle between Junior, Mid, and Senior modes to get explanations that match your experience."
              />
            </motion.div>
          </div>
        </section>

        {/* --- SOCIAL PROOF / STATS --- */}
        <section className="relative border-t border-white/10 overflow-hidden bg-black">
          <MarketingMarquee />
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t border-white/10 bg-black text-[#f8f7f5]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold">
            <Code className="w-5 h-5 text-[#c8b4a0]" />
            <span>RepoLens</span>
          </div>
          <div className="flex gap-8 text-sm text-[#c8b4a0]/70">
            <Link href="#" className="hover:text-[#f8f7f5] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#f8f7f5] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#f8f7f5] transition-colors">Twitter</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Explain My Code Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="relative p-8 rounded-3xl border border-white/10 bg-black hover:shadow-2xl hover:shadow-primary/5 transition-all group overflow-hidden"
    >
      <GlowingEffect
        variant="bronze"
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="relative z-10">
        <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 w-fit group-hover:bg-[#c8b4a0] group-hover:text-black transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-[#f8f7f5]">{title}</h3>
        <p className="text-[#c8b4a0]/70 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}