import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BrainCircuit, Sparkles, Code2, Image as ImageIcon, CheckCircle2, Network, Globe, ChevronDown, Lock, Zap, FileText } from 'lucide-react';
import Logo from '../components/Logo';

export default function Landing() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  const faqs = [
    {
      question: "Is my data used to train the AI models?",
      answer: "Absolutely not. We operate on a strict Zero-Knowledge architecture. Your documents and chat histories are siloed, encrypted, and never used to train our foundational models or shared with third-party providers for training."
    },
    {
      question: "What types of files can I upload?",
      answer: "You can upload PDFs, DOCX files, TXT files, and even provide YouTube URLs for video analysis. We are continually expanding our parsers to support codebases and spreadsheet formats."
    },
    {
      question: "How does the Founder's Edition differ from the Public Beta?",
      answer: "The Public Beta is our robust, free tier that gives you access to core RAG capabilities. The Founder's Edition (coming soon) is an uncapped, premium tier featuring priority routing to the smartest models (like Claude 3.5 Sonnet and GPT-4o), infinite document storage, and advanced API access."
    },
    {
      question: "Can I delete my data permanently?",
      answer: "Yes. You have full control over your data footprint. You can delete individual chats, purge all your data at once, or entirely delete your account directly from the settings panel. Once deleted, it is permanently scrubbed from our vector databases."
    }
  ];

  return (
    <div className="dark min-h-screen bg-black text-zinc-100 font-sans selection:bg-white/20 overflow-x-hidden pt-20">
      
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center">
        <div className="absolute inset-0 bg-black" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />
        {/* Top ambient glow */}
        <div className="absolute top-[-20%] w-[1000px] h-[500px] bg-white/[0.03] blur-[150px] rounded-full" />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.05] bg-black/50 backdrop-blur-2xl transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center">
               <div className="absolute inset-0 bg-white/20 blur-md rounded-full group-hover:bg-white/40 transition-colors" />
               <Logo size={24} className="text-white relative z-10" />
            </div>
            <span className="text-[20px] font-bold tracking-tight text-white">SmartLearn</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-zinc-400 tracking-wide">
            <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-white transition-colors cursor-pointer">Features</a>
            <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="hover:text-white transition-colors cursor-pointer">Pricing</a>
            <a href="#about" onClick={(e) => handleScroll(e, 'about')} className="hover:text-white transition-colors cursor-pointer">About</a>
            <Link to="/releases" className="hover:text-white transition-colors">Releases</Link>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/login" className="hidden sm:block text-[13px] font-semibold text-zinc-400 hover:text-white transition-colors tracking-wide">Log in</Link>
            <Link to="/signup" className="text-[13px] font-bold bg-white text-black px-5 py-2.5 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all tracking-wide">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-4 text-center max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[13px] text-zinc-300 mb-8 backdrop-blur-md hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <Sparkles size={14} className="text-white" />
            <span className="font-semibold tracking-wide pr-1">Introducing Autonomous Web Browsing</span>
            <ArrowRight size={14} className="text-zinc-500" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-[90px] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 mb-8 leading-[1.05]"
          >
            Intelligence at the <br className="hidden sm:block" /> speed of thought.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-[22px] text-zinc-400 max-w-2xl mb-12 leading-relaxed tracking-tight font-medium"
          >
            The world's most advanced learning architecture. Upload documents, execute live code, and interact with your data using frontier AI models.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2 relative z-20 w-full sm:w-auto"
          >
            <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-[15px] font-bold hover:scale-[1.02] hover:bg-zinc-100 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)]">
              Start Building Free <ArrowRight size={18} />
            </Link>
            <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-white/20 text-white px-8 py-4 rounded-full text-[15px] font-bold hover:bg-white/5 transition-all">
              Explore Features
            </a>
          </motion.div>

          {/* Premium UI Mockup Presentation */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl mt-24 relative z-20"
          >
            {/* The Window Container */}
            <div 
              className="relative rounded-[2rem] bg-[#050505] border border-white/[0.1] shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col group transition-all duration-700 ease-out"
              style={{ transform: "perspective(2000px) rotateX(2deg)", transformOrigin: "bottom" }}
            >
              {/* Window Header */}
              <div className="h-12 w-full bg-black/40 border-b border-white/[0.05] flex items-center px-6 gap-2 backdrop-blur-md relative z-20">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-red-500 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-yellow-500 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-green-500 transition-colors cursor-pointer" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
                  <Lock size={12} className="text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-400 tracking-wide">app.smartlearn.ai</span>
                </div>
              </div>

              {/* Window Body (Mock Interface) */}
              <div className="h-[400px] sm:h-[600px] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 to-black flex relative z-10">
                
                {/* Mock Sidebar */}
                <div className="hidden sm:flex w-72 border-r border-white/[0.05] bg-black/50 p-6 flex-col gap-6 backdrop-blur-sm">
                  <div className="h-10 w-full rounded-xl bg-white/[0.05] flex items-center px-4 gap-3 border border-white/[0.02]">
                    <div className="w-5 h-5 rounded-full bg-white/20" />
                    <div className="h-3 w-20 bg-white/10 rounded" />
                  </div>
                  <div className="space-y-4 mt-4">
                     <div className="text-[11px] font-bold text-zinc-600 tracking-[0.2em] uppercase">Today</div>
                     <div className="h-8 w-full rounded-lg bg-white/[0.03] border border-white/[0.05]" />
                     <div className="h-4 w-3/4 rounded bg-white/[0.02]" />
                     <div className="h-4 w-5/6 rounded bg-white/[0.02]" />
                  </div>
                </div>

                {/* Mock Main Area */}
                <div className="flex-1 flex flex-col p-6 sm:p-12 relative overflow-hidden">
                  {/* Mock Chart Generation UI */}
                  <div className="self-end w-fit max-w-[80%] bg-zinc-900 border border-white/[0.05] p-4 rounded-3xl rounded-tr-sm shadow-xl mb-8">
                    <p className="text-[14px] text-zinc-200 font-medium tracking-tight">Generate a real-time analytics dashboard.</p>
                  </div>

                  <div className="self-start w-full max-w-[90%] flex gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                      <Logo size={20} />
                    </div>
                    <div className="flex-1 bg-black border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
                       <div className="flex items-center gap-2 mb-6">
                         <div className="w-4 h-4 rounded-full border-2 border-t-zinc-400 border-zinc-800 animate-spin" />
                         <span className="text-[13px] font-mono text-zinc-400">Compiling React components...</span>
                       </div>
                       
                       {/* Code & Chart UI representation */}
                       <div className="grid grid-cols-2 gap-4">
                         <div className="col-span-2 sm:col-span-1 h-32 rounded-xl bg-[#050505] border border-white/[0.05] p-4 font-mono text-[10px] text-zinc-500 overflow-hidden relative">
                           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#050505]" />
                           <span className="text-blue-400">export function</span> Analytics() {'{\n'}
                           <span className="ml-4">return (</span><br/>
                           <span className="ml-8 text-green-400">{'<Dashboard>'}</span><br/>
                           <span className="ml-12 text-zinc-400">{'<MetricsGrid />'}</span>
                         </div>
                         <div className="col-span-2 sm:col-span-1 h-32 rounded-xl bg-[#050505] border border-white/[0.05] p-4 flex items-end gap-2 overflow-hidden relative">
                           <div className="absolute inset-0 bg-white/[0.02]" />
                           <div className="w-1/4 h-[40%] bg-white/10 rounded-t-sm" />
                           <div className="w-1/4 h-[70%] bg-white/20 rounded-t-sm" />
                           <div className="w-1/4 h-[50%] bg-white/10 rounded-t-sm" />
                           <div className="w-1/4 h-[90%] bg-white/30 rounded-t-sm" />
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Input Mock */}
                  <div className="absolute bottom-8 left-6 sm:left-12 right-6 sm:right-12">
                    <div className="h-16 w-full max-w-4xl mx-auto bg-black border border-white/[0.1] rounded-full shadow-[0_0_50px_rgba(255,255,255,0.05)] flex items-center px-6 justify-between backdrop-blur-xl">
                      <span className="text-[15px] font-medium text-zinc-500">Ask a question or upload a file...</span>
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center cursor-pointer">
                         <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Tech Stack Marquee */}
        <section className="py-12 border-y border-white/[0.05] bg-[#050505] relative z-10 overflow-hidden">
          <style>
            {`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 50s linear infinite;
                display: flex;
                width: max-content;
              }
            `}
          </style>
          
          <div className="max-w-full overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-32 sm:w-64 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 sm:w-64 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />
            
            <p className="text-center text-[11px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-12 relative z-30">
              Trusted by the frontier of technology
            </p>
            
            <div className="flex animate-marquee gap-16 sm:gap-24 px-6 items-center relative z-30">
              {[
                { name: 'Gemini', file: 'gemini' }, { name: 'Gmail', file: 'gmail' }, { name: 'Groq', file: 'groq' },
                { name: 'Neon DB', file: 'neon' }, { name: 'OpenRouter', file: 'openrouter' }, { name: 'Redis', file: 'redis' },
                { name: 'Tavily', file: 'tavily' }, { name: 'YouTube', file: 'youtube' },
                // Loop
                { name: 'Gemini', file: 'gemini' }, { name: 'Gmail', file: 'gmail' }, { name: 'Groq', file: 'groq' },
                { name: 'Neon DB', file: 'neon' }, { name: 'OpenRouter', file: 'openrouter' }, { name: 'Redis', file: 'redis' },
                { name: 'Tavily', file: 'tavily' }, { name: 'YouTube', file: 'youtube' },
              ].map((tech, i) => (
                <div key={i} className="flex flex-col items-center gap-4 min-w-[120px] group cursor-default">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
                    <img 
                      src={`/images/logos/${tech.file}.svg`} 
                      alt={`${tech.name} Logo`} 
                      className="w-full h-full object-contain" 
                      onError={(e) => { e.target.style.display='none'; }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-[64px] font-extrabold tracking-tighter text-white mb-6 leading-[1.1]">Unrivaled capabilities.</h2>
            <p className="text-lg sm:text-xl text-zinc-400 font-medium max-w-2xl mx-auto">A seamless architecture designed to compute, analyze, and render anything you demand.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto auto-rows-[300px]">
            
            {/* Generative UI */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 relative bg-[#050505] border border-white/[0.08] rounded-3xl p-10 overflow-hidden group hover:border-white/[0.2] transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-black border border-white/[0.1] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Code2 size={24} className="text-white" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Live Generative UI</h3>
                  <p className="text-zinc-400 font-medium text-[15px] leading-relaxed">Instantly generate, run, and preview React code inside the chat. We compile zero-latency interactive dashboards on the fly.</p>
                </div>
              </div>
            </motion.div>

            {/* Native Vision */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-1 relative bg-[#050505] border border-white/[0.08] rounded-3xl p-10 overflow-hidden group hover:border-white/[0.2] transition-colors"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.03] rounded-full blur-[60px] group-hover:bg-white/[0.06] transition-colors" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-black border border-white/[0.1] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <ImageIcon size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Native Vision</h3>
                  <p className="text-zinc-400 font-medium text-[15px] leading-relaxed">Upload images instantly with our zero-latency browser-side compression engine.</p>
                </div>
              </div>
            </motion.div>

            {/* Private Mode */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-1 relative bg-[#050505] border border-white/[0.08] rounded-3xl p-10 overflow-hidden group hover:border-red-500/30 transition-colors"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-black border border-white/[0.1] flex items-center justify-center mb-6 shadow-lg group-hover:border-red-500/50 transition-colors">
                  <Lock size={24} className="text-zinc-400 group-hover:text-red-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-red-100 transition-colors">Zero-Retention</h3>
                  <p className="text-zinc-400 font-medium text-[15px] leading-relaxed group-hover:text-red-200/70 transition-colors">Strict SOC2-compliant hardware-level privacy. Bypasses the database entirely.</p>
                </div>
              </div>
            </motion.div>

            {/* Web Browsing */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 relative bg-[#050505] border border-white/[0.08] rounded-3xl p-10 overflow-hidden group hover:border-blue-500/30 transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 h-full flex flex-col justify-between w-full md:w-[70%]">
                <div className="w-14 h-14 rounded-2xl bg-black border border-white/[0.1] flex items-center justify-center mb-6 shadow-lg group-hover:border-blue-500/50 transition-colors">
                  <Globe size={24} className="text-zinc-300 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Autonomous Browsing</h3>
                  <p className="text-zinc-400 font-medium text-[15px] leading-relaxed">Powered by Playwright, the AI launches a headless browser to navigate URLs, scrape data, and snap live viewport screenshots directly into the chat.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-24">
             <h2 className="text-5xl sm:text-[72px] font-extrabold tracking-tighter text-white mb-8 leading-[1.05]">Uncapped access. <br className="hidden sm:block" /> Free for the pioneers.</h2>
             <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
               During our exclusive Public Beta, all users get unprecedented access to SmartLearn's core engine for free.
             </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Public Beta Plan */}
            <div className="bg-[#050505] border border-white/[0.08] rounded-[2.5rem] p-10 sm:p-14 flex flex-col relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Public Beta</h3>
              <div className="flex items-baseline gap-1 mb-8 relative z-10">
                <span className="text-6xl font-bold tracking-tighter text-white">$0</span>
                <span className="text-zinc-500 text-[16px] font-medium ml-2">/ forever</span>
              </div>
              
              <ul className="space-y-5 mb-12 flex-1 relative z-10">
                {['Unlimited PDF Analysis', 'Generative React UI', 'Gemini 2.5 Flash Access', 'Basic Text-to-Speech'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-[16px] text-zinc-300 font-medium">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link to="/signup" className="w-full py-5 rounded-2xl font-bold text-[16px] text-center bg-white text-black hover:bg-zinc-200 transition-colors relative z-10">
                Start Building
              </Link>
            </div>

            {/* Research Tier */}
            <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-[2.5rem] p-10 sm:p-14 flex flex-col relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/[0.02] rounded-full blur-[80px] pointer-events-none" />
              <h3 className="text-2xl font-bold text-zinc-400 mb-2 relative z-10">Research Tier</h3>
              <div className="flex items-baseline gap-1 mb-8 relative z-10">
                <span className="text-6xl font-bold tracking-tighter text-zinc-600">TBA</span>
              </div>
              
              <ul className="space-y-5 mb-12 flex-1 relative z-10 opacity-60">
                {['4-Engine Model Fallback', 'Priority Edge Caching', 'Unlimited Web Browsing', 'Advanced Data Export'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-[16px] text-zinc-400 font-medium">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-zinc-500" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-5 rounded-2xl font-bold text-[16px] text-center border border-white/10 text-zinc-400 hover:bg-white/5 transition-colors relative z-10">
                Join Waitlist
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto text-center bg-[#050505] border border-white/[0.08] rounded-[3rem] p-16 sm:p-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.05] to-transparent pointer-events-none" />
            <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-white mb-8 relative z-10 leading-[1.05]">Ready to deploy?</h2>
            <p className="text-xl font-medium text-zinc-400 mb-12 relative z-10 max-w-2xl mx-auto leading-relaxed">Join elite developers and researchers using SmartLearn AI to extract maximum value from their data.</p>
            <div className="relative z-10">
               <Link to="/signup" className="inline-flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-full text-[17px] font-bold hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
                Create Free Account <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] bg-black pt-20 pb-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Logo size={24} className="text-white" />
              <span className="font-bold text-xl tracking-tight text-white">SmartLearn</span>
            </div>
            <p className="text-zinc-500 font-medium text-[15px] max-w-sm leading-relaxed">
              The ultimate contextual AI platform. Analyze massive documents, videos, and codebases at the speed of thought.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold tracking-tight mb-6">Product</h4>
            <ul className="space-y-4 text-[15px] font-medium text-zinc-500">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold tracking-tight mb-6">Legal</h4>
            <ul className="space-y-4 text-[15px] font-medium text-zinc-500">
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/[0.05] flex justify-between items-center">
          <span className="text-zinc-600 font-medium text-[14px]">© {new Date().getFullYear()} SmartLearn AI Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
