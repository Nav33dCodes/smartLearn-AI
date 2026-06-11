import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Zap, Shield, FileText, Sparkles, Code2, Database, PlaySquare, Image as ImageIcon, CheckCircle2, Cpu, Network, Globe, Mail } from 'lucide-react';
import Logo from '../components/Logo';
export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-primary/30 overflow-x-hidden">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto backdrop-blur-md border-b border-zinc-800/50 sticky top-0 bg-[#0a0a0a]/80">
        <Link to="/" className="flex items-center gap-3 group">
          <Logo size={28} />
          <span className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">SmartLearn</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-zinc-100 transition-colors">Pricing</a>
          <a href="#about" className="hover:text-zinc-100 transition-colors">About</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Sign In</Link>
          <Link to="/signup" className="text-sm font-medium bg-zinc-100 text-zinc-900 px-4 py-2 rounded-full hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 text-center max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-300 mb-8 backdrop-blur-sm"
          >
            <Sparkles size={14} className="text-primary" />
            <span>SmartLearn v2.0 is now live</span>
            <span className="w-px h-3 bg-zinc-700 mx-1" />
            <span className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors">
              Read more <ArrowRight size={12} />
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-6 leading-[1.1]"
          >
            Analyze Documents at the <br className="hidden sm:block" /> Speed of Thought.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed"
          >
            Experience the next generation of contextual AI. Upload documents, query insights, and interact with your data using state-of-the-art RAG technology.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 px-8 py-3.5 rounded-full text-base font-medium hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02]">
              Start for Free <ArrowRight size={18} />
            </Link>
            <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900/50 border border-zinc-800 text-zinc-300 px-8 py-3.5 rounded-full text-base font-medium hover:bg-zinc-800/50 hover:text-white transition-all backdrop-blur-sm">
              Explore Features
            </a>
          </motion.div>
        </section>



        {/* Tech Stack / Integration Strip */}
        <section className="py-16 border-y border-zinc-800/50 bg-zinc-950/30 backdrop-blur-sm relative z-10 overflow-hidden">
          <style>
            {`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 70s linear infinite;
                display: flex;
                width: max-content;
              }
              .animate-marquee:hover {
                animation-play-state: paused;
              }
            `}
          </style>
          
          <div className="max-w-full overflow-hidden relative">
            {/* Gradient masks for smooth fading on edges */}
            <div className="absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-zinc-950 to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-zinc-950 to-transparent z-20 pointer-events-none" />
            
            <p className="text-center text-sm font-medium text-zinc-500 uppercase tracking-widest mb-10 relative z-30">
              Integrated with the industry's most powerful platforms
            </p>
            
            <div className="flex animate-marquee gap-16 sm:gap-24 px-6 transition-all duration-700 items-center">
              {[
                { name: 'Groq', file: 'groq' },
                { name: 'Claude', file: 'claude' },
                { name: 'DeepSeek', file: 'deepseek' },
                { name: 'Gemini', file: 'gemini' },
                { name: 'Neon DB', file: 'neon' },
                // Duplicate the array exactly to create the seamless loop
                { name: 'Groq', file: 'groq' },
                { name: 'Claude', file: 'claude' },
                { name: 'DeepSeek', file: 'deepseek' },
                { name: 'Gemini', file: 'gemini' },
                { name: 'Neon DB', file: 'neon' },
              ].map((tech, i) => (
                <div key={i} className="flex flex-col items-center gap-4 group/icon min-w-[120px]">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-900/40 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden border border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)] group-hover/icon:-translate-y-1 group-hover/icon:border-zinc-700 group-hover/icon:shadow-[0_8px_30px_rgba(255,255,255,0.08)] transition-all duration-300 p-4 relative">
                    <img src={`/images/logos/${tech.file}.svg`} alt={`${tech.name} Logo`} className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover/icon:scale-110" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    <div className="absolute inset-0 hidden items-center justify-center bg-zinc-800/80 text-zinc-300 text-[10px] font-mono text-center px-1" style={{ display: 'none' }}>
                      Add {tech.file}.svg
                    </div>
                  </div>
                  <span className="text-sm font-semibold tracking-wide text-zinc-400 group-hover/icon:text-zinc-200 transition-colors">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Visual Dashboard Bento Box */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-4">Industry-Leading Interface</h2>
            <p className="text-zinc-400 text-lg">A beautiful, minimalistic workspace designed for maximum focus.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Main Chat Interface (Large, spans 2 columns) */}
            <motion.div variants={itemVariants} className="md:col-span-2 group relative rounded-3xl border border-zinc-800/50 bg-zinc-900/20 overflow-hidden backdrop-blur-sm p-2 hover:border-zinc-700/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-950 aspect-[16/10]">
                <img src="/images/mockup1.png" alt="Dashboard AI Chat" className="w-full h-full object-cover object-left-top opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700" />
              </div>
              <div className="mt-6 px-4 pb-4">
                <h3 className="text-xl font-bold text-zinc-100 mb-2 flex items-center gap-2"><BrainCircuit size={20} className="text-primary" /> Context-Aware Chat</h3>
                <p className="text-zinc-400">Interact with your documents in a sleek, distraction-free environment.</p>
              </div>
            </motion.div>

            <div className="md:col-span-1 flex flex-col gap-6">
              {/* Graph View (Small, top right) */}
              <motion.div variants={itemVariants} className="flex-1 group relative rounded-3xl border border-zinc-800/50 bg-zinc-900/20 overflow-hidden backdrop-blur-sm p-2 hover:border-zinc-700/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-950 aspect-video">
                  <img src="/images/mockup2.png" alt="Knowledge Graph" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700" />
                </div>
                <div className="mt-4 px-3 pb-2">
                  <h3 className="text-lg font-bold text-zinc-100 mb-1 flex items-center gap-2"><Network size={18} className="text-emerald-400" /> Knowledge Graph</h3>
                  <p className="text-sm text-zinc-400">Visualize connections across all data.</p>
                </div>
              </motion.div>

              {/* Video Analysis (Small, bottom right) */}
              <motion.div variants={itemVariants} className="flex-1 group relative rounded-3xl border border-zinc-800/50 bg-zinc-900/20 overflow-hidden backdrop-blur-sm p-2 hover:border-zinc-700/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-950 aspect-video">
                  <img src="/images/mockup3.png" alt="Video Analysis" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700" />
                </div>
                <div className="mt-4 px-3 pb-2">
                  <h3 className="text-lg font-bold text-zinc-100 mb-1 flex items-center gap-2"><PlaySquare size={18} className="text-red-400" /> Video Insights</h3>
                  <p className="text-sm text-zinc-400">Analyze YouTube lectures instantly.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-4">Simple, transparent pricing</h2>
             <p className="text-zinc-400 text-lg">Choose the plan that fits your study needs.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 flex flex-col">
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-zinc-100">$0</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <p className="text-zinc-400 text-sm mb-8 flex-1">Perfect for students starting out with AI document analysis.</p>
              <ul className="space-y-4 mb-8">
                {['5 documents per month', 'Access to base models (Llama 3)', '50 messages per day', 'Basic Web Search', 'Standard support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-zinc-600" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="w-full py-3 px-4 rounded-xl border border-zinc-700 text-center text-sm font-medium hover:bg-zinc-800 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-zinc-900 border-2 border-primary rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(var(--color-primary),0.15)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Unlimited Power
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Professional</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-zinc-100">$15</span>
                <span className="text-zinc-500">/month</span>
              </div>
              <p className="text-zinc-400 text-sm mb-8 flex-1">For researchers and professionals who need unlimited capabilities.</p>
              <ul className="space-y-4 mb-8">
                {['Unlimited documents & storage', 'Access to all premium models (Claude 3.5, GPT-4o, Gemini 1.5, DeepSeek)', 'Unlimited messages', 'Unlimited YouTube Video Analysis', 'Advanced Deep Web Search', 'Priority 24/7 support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-primary" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground text-center text-sm font-medium hover:opacity-90 transition-opacity">
                Start 7-Day Trial
              </Link>
            </div>
          </div>
        </section>



        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center bg-zinc-900/30 border border-zinc-800/50 rounded-[3rem] p-12 sm:p-20 relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 mb-6 relative z-10">Ready to unlock your data?</h2>
            <p className="text-xl text-zinc-400 mb-10 relative z-10 max-w-2xl mx-auto">Join developers and researchers using SmartLearn AI to extract maximum value from their documents.</p>
            <div className="relative z-10">
               <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02]">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-950/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="font-semibold text-zinc-100">SmartLearn AI</span>
            <span className="text-zinc-600 ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-zinc-500">
            <Link to="/login" className="hover:text-zinc-300 transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-zinc-300 transition-colors">Sign Up</Link>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
