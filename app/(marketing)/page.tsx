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
    <div className="relative flex overflow-x-hidden border-y bg-muted/30 py-4">
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
            className="mx-8 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground/70"
          >
            {text} •
          </span>
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
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
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:bg-slate-950 dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#1e1b4b_100%)]" />

      {/* --- HEADER --- */}
      <header className="px-6 md:px-12 h-20 flex items-center justify-between border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <div className="bg-primary p-1 rounded-lg">
            <Code className="w-6 h-6 text-primary-foreground" />
          </div>
          <span>Repo<span className="text-primary">Lens</span></span>
        </div>
        
       

        <div className="flex items-center">
          <Link 
            href="/dashboard" 
            className="bg-foreground text-background px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-opacity shadow-lg"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <main className="flex-1">
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-bounce">
              <Zap className="w-4 h-4" /> <span>Now powered by Gemini 1.5 Pro</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Read code like a <br />
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Senior Engineer.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop getting lost in massive repositories. Analyze any GitHub URL and get an interactive roadmap, dependency graphs, and skill-tailored explanations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
              >
                Analyze Project <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              {/* <Link 
                href="https://github.com"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border bg-background px-10 py-4 text-lg font-bold hover:bg-muted transition-colors"
              >
                <Github className="mr-2 w-5 h-5" /> View on GitHub
              </Link> */}
            </div>
          </motion.div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
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
        <section className="py-0 border-t overflow-hidden">
  <div className="flex flex-col items-center gap-8">
    {/* <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">
      Built for the modern developer
    </div> */}
    
    <MarketingMarquee />
    
   
    <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-12 opacity-30 grayscale contrast-125">
       {/* <div className="font-black text-xl tracking-tighter">TypeScript</div>
       <div className="font-black text-xl tracking-tighter">Next.js</div>
       <div className="font-black text-xl tracking-tighter">React</div>
       <div className="font-black text-xl tracking-tighter">Gemini</div> */}
    </div>
  </div>
</section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold">
            <Code className="w-5 h-5 text-primary" />
            <span>RepoLens</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
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
      className="p-8 rounded-3xl border bg-background hover:shadow-2xl hover:shadow-primary/5 transition-all group"
    >
      <div className="mb-4 p-3 rounded-2xl bg-muted w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
}