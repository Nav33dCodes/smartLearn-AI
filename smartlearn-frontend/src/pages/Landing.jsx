import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BrainCircuit, Zap, Shield, FileText, Sparkles, Code2, Database, PlaySquare, Image as ImageIcon, CheckCircle2, Cpu, Network, Globe, Mail, ChevronDown, Lock } from 'lucide-react';
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
  const [activeHeroTab, setActiveHeroTab] = useState(0);

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 100; // Account for the sticky navbar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  const heroTabs = [
    {
      id: 'voice',
      icon: <BrainCircuit size={18} />,
      title: "Advanced Voice Mode",
      description: "Hands-Free Conversations",
      bullets: ["Hyper-realistic Edge TTS Audio generation", "Immersive full-screen sound-reactive orb UI", "Auto-listen flow for continuous conversation"]
    },
    {
      id: 'websearch',
      icon: <Globe size={18} />,
      title: "Real-Time Web Search",
      description: "Perplexity-Style Browsing",
      bullets: ["Instant web scraping via Tavily Search API", "Beautiful horizontal interactive sources carousel", "Fact-check hallucinations with real citations"]
    },
    {
      id: 'vision',
      icon: <ImageIcon size={18} />,
      title: "Native Vision",
      description: "Fully Multimodal AI",
      bullets: ["Upload images instantly via zero-cost Base64 encoding", "Browser-side compression engine for blazing speed", "Powered by Gemini 2.5 Flash's massive context window"]
    },
    {
      id: 'learning',
      icon: <BrainCircuit size={18} />,
      title: "Interactive Learning",
      description: "Next-Gen Educational Tools",
      bullets: ["Interactive Drag-and-Drop Mind Maps", "Textbook-Quality Math & Formula Rendering", "Dynamic Quizzes & Flashcard Generation"]
    },
    {
      id: 'sandpack',
      icon: <Code2 size={18} />,
      title: "Live Code Execution",
      description: "Interactive Sandpack IDE",
      bullets: ["Run React & JavaScript instantly inside the chat", "Hot-reloading browser preview window", "Lazy-loaded for zero-latency performance"]
    },
    {
      id: 'personalize',
      icon: <BrainCircuit size={18} />,
      title: "Personalization Engine",
      description: "Custom AI Archetypes & Tone",
      bullets: ["Define strict custom instructions for the AI", "Choose from premium AI personas like 'Code Ninja'", "Zero-latency backend prompt injection"]
    },
    {
      id: 'models',
      icon: <Network size={18} />,
      title: "Multi-Model Fallback",
      description: "The 4-Engine Architecture",
      bullets: ["Native Gemini 2.5 integration with 2M context", "SmartLearn Auto dynamic routing", "Flawless Fallback Cascade for 100% uptime"]
    },
    {
      id: 'ui',
      icon: <Code2 size={18} />,
      title: "IDE-Grade UI",
      description: "Premium Distraction-Free Design",
      bullets: ["Mac OS-styled IDE Code Blocks with Fira Code", "Glassmorphic floating model selector menus", "Beautifully minimalist, premium aesthetics"]
    }
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState(null);
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
    <div className="dark min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-white/20 overflow-x-hidden pt-20">
      
      {/* Background Gradients (Ultra Subtle OLED Mesh) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#000000]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.04] bg-black/60 backdrop-blur-xl transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size={24} className="text-zinc-100 group-hover:text-white transition-colors" />
            <span className="text-xl font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors">SmartLearn</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-zinc-400 tracking-wide">
            <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-zinc-100 transition-colors cursor-pointer">Features</a>
            <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="hover:text-zinc-100 transition-colors cursor-pointer">Pricing</a>
            <a href="#about" onClick={(e) => handleScroll(e, 'about')} className="hover:text-zinc-100 transition-colors cursor-pointer">About</a>
            <Link to="/releases" className="hover:text-zinc-100 transition-colors">Release Notes</Link>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors tracking-wide">Log in</Link>
            <Link to="/signup" className="text-[13px] font-medium bg-white text-black px-4 py-2 rounded-full hover:scale-105 transition-transform tracking-wide">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-4 text-center max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300 mb-10 backdrop-blur-md shadow-sm"
          >
            <Sparkles size={13} className="text-zinc-400" />
            <span className="font-medium tracking-wide pr-1">SmartLearn Generative UI is now live</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-[84px] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 mb-8 leading-[1.05]"
          >
            Analyze Documents at the <br className="hidden sm:block" /> <span className="text-white">Speed of Thought.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-[21px] text-zinc-400 max-w-2xl mb-12 leading-relaxed tracking-tight"
          >
            Experience the next generation of contextual AI. Upload documents, query insights, and interact with your data using state-of-the-art RAG technology.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2 relative z-20"
          >
            <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-3.5 rounded-full text-[15px] font-semibold hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
              Start Building Free <ArrowRight size={16} />
            </Link>
            <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0a0a0a] border border-white/10 text-zinc-300 px-8 py-3.5 rounded-full text-[15px] font-medium hover:bg-white/5 transition-all backdrop-blur-sm cursor-pointer">
              Explore Features
            </a>
          </motion.div>

          {/* Stunning Browser UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="w-full max-w-5xl mt-20 relative z-20"
          >
            {/* Massive Glowing Behind the Mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none" />
            
            {/* The Window Container */}
            <div 
              className="relative rounded-2xl bg-[#0a0a0a] border border-white/[0.06] shadow-[0_0_80px_rgba(255,255,255,0.03)] overflow-hidden flex flex-col group hover:border-white/10 transition-all duration-700 ease-out"
              style={{ transform: "perspective(2000px) rotateX(4deg)", transformOrigin: "bottom" }}
            >
              
              {/* Window Header (MacOS style) */}
              <div className="h-10 w-full bg-[#111] border-b border-white/[0.04] flex items-center px-4 gap-2 relative z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/50" />
                <div className="mx-auto flex items-center gap-2 px-4 py-1 rounded-md bg-white/[0.03] border border-white/[0.02]">
                  <Lock size={10} className="text-zinc-500" />
                  <span className="text-[10px] font-mono text-zinc-500">app.smartlearn.ai</span>
                </div>
              </div>

              {/* Window Body (Mock Chat Interface) */}
              <div className="h-[450px] sm:h-[550px] w-full bg-[#000] flex relative z-10">
                {/* Sidebar Mock */}
                <div className="hidden sm:flex w-64 border-r border-white/[0.04] bg-[#050505] p-4 flex-col gap-4 shrink-0">
                  <div className="h-8 w-full rounded-md bg-white/[0.03]" />
                  <div className="space-y-3 mt-4">
                     <div className="h-3 w-3/4 rounded bg-white/[0.02]" />
                     <div className="h-3 w-1/2 rounded bg-white/[0.02]" />
                     <div className="h-3 w-5/6 rounded bg-white/[0.02]" />
                  </div>
                  <div className="space-y-3 mt-8">
                     <div className="text-[10px] font-bold text-zinc-700 tracking-wider">RECENT CHATS</div>
                     <div className="h-6 w-full rounded bg-white/[0.02]" />
                     <div className="h-6 w-full rounded bg-white/[0.02]" />
                  </div>
                </div>

                {/* Main Chat Area Mock */}
                <div className="flex-1 flex flex-col p-6 sm:p-10 relative overflow-hidden">
                  <div className="flex-1 flex flex-col gap-6 w-full max-w-3xl mx-auto">
                    {/* User Message */}
                    <div className="self-end max-w-[80%] bg-zinc-900 border border-white/[0.04] p-3.5 rounded-2xl rounded-tr-sm">
                      <p className="text-[13px] text-zinc-200">Analyze this document and build a React chart.</p>
                    </div>

                    {/* AI Message */}
                    <div className="self-start w-full max-w-[85%]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center">
                          <Logo size={16} />
                        </div>
                        <span className="text-[13px] font-bold text-zinc-200 tracking-tight">SmartLearn AI</span>
                      </div>
                      <div className="bg-[#050505] border border-white/[0.04] rounded-2xl p-5 shadow-sm">
                         <div className="h-3 w-full rounded bg-white/[0.03] mb-3" />
                         <div className="h-3 w-4/5 rounded bg-white/[0.03] mb-5" />
                         {/* Mock Code Block */}
                         <div className="w-full h-36 rounded-lg bg-[#000] border border-white/[0.05] p-4 font-mono text-[11px] leading-relaxed text-zinc-500 flex flex-col relative overflow-hidden group-hover:border-white/10 transition-colors">
                           <div className="absolute top-0 right-0 p-2 opacity-50"><Code2 size={12}/></div>
                           <span><span className="text-blue-400">import</span> {'{ LineChart }'} <span className="text-blue-400">from</span> 'recharts';</span>
                           <span className="mt-2"><span className="text-purple-400">export default function</span> Chart() {'{'}</span>
                           <span className="ml-4 text-zinc-400 mt-1">return ( </span>
                           <span className="ml-8 text-green-400">{'<LineChart data={data}>'}</span>
                           <span className="ml-12 text-zinc-500">...</span>
                           <span className="ml-8 text-green-400">{'</LineChart>'}</span>
                           <span className="ml-4 text-zinc-400">)</span>
                           <span>{'}'}</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Box Mock */}
                  <div className="absolute bottom-6 left-6 right-6 flex justify-center">
                    <div className="h-14 w-full max-w-3xl bg-[#0a0a0a] border border-white/[0.08] rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.03)] flex items-center px-4 justify-between group-hover:border-white/[0.15] transition-colors">
                      <span className="text-[13px] text-zinc-500">Ask a question or upload a file...</span>
                      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                         <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fade out bottom of UI */}
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
            </div>
          </motion.div>
          
        </section>



        {/* Tech Stack / Integration Strip */}
        <section className="py-16 border-y border-white/[0.04] bg-[#000000] relative z-10 overflow-hidden">
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
            <div className="absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#000000] to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#000000] to-transparent z-20 pointer-events-none" />
            
            <p className="text-center text-sm font-medium text-zinc-500 uppercase tracking-[0.2em] mb-16 relative z-30">
              Powered by the industry's most advanced infrastructure
            </p>
            
            <div className="flex animate-marquee gap-16 sm:gap-24 px-6 transition-all duration-700 items-center relative z-30">
              {[
                { name: 'Gemini', file: 'gemini' },
                { name: 'Gmail', file: 'gmail' },
                { name: 'Groq', file: 'groq' },
                { name: 'Neon DB', file: 'neon' },
                { name: 'OpenRouter', file: 'openrouter' },
                { name: 'Redis', file: 'redis' },
                { name: 'Tavily', file: 'tavily' },
                { name: 'YouTube', file: 'youtube' },
                // Duplicate the array exactly to create the seamless loop
                { name: 'Gemini', file: 'gemini' },
                { name: 'Gmail', file: 'gmail' },
                { name: 'Groq', file: 'groq' },
                { name: 'Neon DB', file: 'neon' },
                { name: 'OpenRouter', file: 'openrouter' },
                { name: 'Redis', file: 'redis' },
                { name: 'Tavily', file: 'tavily' },
                { name: 'YouTube', file: 'youtube' },
              ].map((tech, i) => (
                <div key={i} className="flex flex-col items-center gap-5 group/icon min-w-[100px] cursor-pointer">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] bg-white/[0.02] flex items-center justify-center border border-white/[0.05] shadow-sm group-hover/icon:shadow-[0_0_30px_rgba(255,255,255,0.06)] group-hover/icon:bg-white/[0.04] group-hover/icon:border-white/[0.1] transition-all duration-500 p-4 sm:p-5 relative">
                    <img 
                      src={`/images/logos/${tech.file}.svg`} 
                      alt={`${tech.name} Logo`} 
                      className="w-full h-full object-contain relative z-10 transition-all duration-500 group-hover/icon:scale-[1.15] filter grayscale opacity-40 group-hover/icon:grayscale-0 group-hover/icon:opacity-100" 
                      onError={(e) => { e.target.style.display='none'; }} 
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium tracking-widest text-zinc-600 group-hover/icon:text-zinc-300 transition-colors duration-500">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Features Section - Bento Grid */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter text-zinc-100 mb-6">Unrivaled capabilities.</h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">Everything you need to analyze, compute, and learn, built into one seamless architecture.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto auto-rows-[280px]">
            {/* Bento 1: Generative UI (Spans 2 columns) */}
            <div className="md:col-span-2 relative bg-[#050505] border border-white/[0.04] rounded-3xl p-8 overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-[80px] -z-10 group-hover:bg-white/[0.04] transition-colors" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-6">
                  <Code2 size={24} className="text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Live Generative UI</h3>
                  <p className="text-zinc-400 font-medium text-sm leading-relaxed max-w-md">Instantly generate, run, and preview React code inside the chat. SmartLearn builds fully interactive dashboards on the fly.</p>
                </div>
                {/* Decorative UI element */}
                <div className="absolute right-[-10%] bottom-[-10%] w-[60%] h-[70%] bg-black border border-white/10 rounded-tl-2xl shadow-2xl p-5 flex flex-col gap-3 opacity-50 group-hover:opacity-100 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-all duration-500">
                  <div className="h-3 w-1/3 bg-white/20 rounded" />
                  <div className="h-24 w-full bg-white/5 rounded mt-2 border border-white/10" />
                </div>
              </div>
            </div>

            {/* Bento 2: Multimodal (Spans 1 column) */}
            <div className="md:col-span-1 relative bg-[#050505] border border-white/[0.04] rounded-3xl p-8 overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.02] to-transparent -z-10" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-6">
                  <ImageIcon size={24} className="text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Native Vision</h3>
                  <p className="text-zinc-400 font-medium text-sm leading-relaxed">Upload images instantly. Our powerful compression engine perfectly analyzes visual data with zero latency.</p>
                </div>
              </div>
            </div>

            {/* Bento 3: Voice Mode (Spans 1 column) */}
            <div className="md:col-span-1 relative bg-[#050505] border border-white/[0.04] rounded-3xl p-8 overflow-hidden group hover:border-white/10 transition-colors">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-6">
                  <BrainCircuit size={24} className="text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Voice Mode</h3>
                  <p className="text-zinc-400 font-medium text-sm leading-relaxed relative z-20">Immersive, hands-free voice conversations with our advanced sound-reactive AI orb.</p>
                </div>
              </div>
              {/* Decorative Orb */}
              <div className="absolute bottom-[-20%] right-[-20%] w-48 h-48 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                <div className="w-24 h-24 rounded-full bg-white/[0.05] blur-md" />
              </div>
            </div>

            {/* Bento 4: Multi-Model Fallback (Spans 2 columns) */}
            <div className="md:col-span-2 relative bg-[#050505] border border-white/[0.04] rounded-3xl p-8 overflow-hidden group hover:border-white/10 transition-colors">
              <div className="relative z-10 h-full flex flex-col justify-between w-full md:w-1/2">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-6">
                  <Network size={24} className="text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Multi-Engine Fallback</h3>
                  <p className="text-zinc-400 font-medium text-sm leading-relaxed">Never see a downtime error again. The router seamlessly cascades queries between Gemini 2.5, Claude, and Groq.</p>
                </div>
              </div>
              {/* Decorative Router Nodes */}
              <div className="absolute right-0 top-0 w-1/2 h-full hidden md:flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="w-full max-w-[200px] flex flex-col gap-3">
                  <div className="h-8 w-full bg-black border border-white/10 rounded-lg flex items-center px-3 gap-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> <span className="text-[10px] text-zinc-400 font-mono">Gemini 2.5 (Active)</span>
                  </div>
                  <div className="h-8 w-full bg-black border border-white/10 rounded-lg flex items-center px-3 gap-2 ml-4">
                    <div className="w-2 h-2 rounded-full bg-zinc-700" /> <span className="text-[10px] text-zinc-600 font-mono">Claude 3.5 (Standby)</span>
                  </div>
                  <div className="h-8 w-full bg-black border border-white/10 rounded-lg flex items-center px-3 gap-2 ml-8">
                    <div className="w-2 h-2 rounded-full bg-zinc-700" /> <span className="text-[10px] text-zinc-600 font-mono">Groq Llama (Standby)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 px-6 bg-[#000000] border-t border-white/[0.02] relative">
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <h2 className="text-xs font-bold text-zinc-500 tracking-[0.3em] uppercase mb-8">The Mission</h2>
            <p className="text-4xl sm:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 leading-[1.1] mb-20">
              We are engineering the cognitive architecture of tomorrow. Built for pioneers who demand uncompromising speed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-24 border-t border-white/[0.04] pt-16">
              <div className="text-center group cursor-default">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-300 group-hover:text-white transition-colors mb-1">Sanan Malik</h3>
                <p className="text-zinc-600 font-medium text-xs tracking-[0.2em]">VISIONARY & CEO</p>
              </div>
              <div className="text-center group cursor-default">
                <h3 className="text-2xl font-bold tracking-tight text-zinc-300 group-hover:text-white transition-colors mb-1">Naveed Ahmed</h3>
                <p className="text-zinc-600 font-medium text-xs tracking-[0.2em]">LEAD ARCHITECT</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-24 relative">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300 mb-8 font-semibold">
                <Sparkles size={13} />
                <span className="tracking-wide">Early Access Phase</span>
             </div>
             <h2 className="text-5xl sm:text-[72px] font-bold tracking-tighter text-zinc-100 mb-8 leading-[1.05]">Built for the future. <br className="hidden sm:block" /> Free for the pioneers.</h2>
             <p className="text-zinc-400 text-lg md:text-[21px] max-w-2xl mx-auto leading-relaxed tracking-tight">
               During our exclusive Public Beta, all users get unprecedented access to SmartLearn's core engine for free. Our ultimate research tier is currently being forged.
             </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            {/* Public Beta Plan */}
            <div className="bg-[#050505] border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col hover:border-white/30 transition-all duration-300 shadow-2xl relative group">
              <h3 className="text-2xl font-bold text-zinc-100 mb-2">Public Beta</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold tracking-tighter text-white">$0</span>
                <span className="text-zinc-500 text-[15px] font-medium ml-2">/ forever</span>
              </div>
              <p className="text-zinc-400 text-[15px] mb-10 leading-relaxed tracking-tight">
                Our way of saying thank you. Secure your pioneer account now and get foundational access forever.
              </p>
              
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  'Unlimited Documents',
                  'Advanced Node Graph',
                  'Gemini 2.5 Access',
                  'Basic Speech-to-Text'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[15px] text-zinc-300 font-medium tracking-wide">
                    <CheckCircle2 size={18} className="text-white" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link to="/signup" className="w-full py-4 px-4 rounded-xl font-semibold text-center bg-white text-black hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                Create Free Account
              </Link>
            </div>

            {/* Research Tier */}
            <div className="bg-gradient-to-br from-[#111111] to-[#000000] border border-white/[0.04] rounded-3xl p-8 sm:p-10 flex flex-col relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none mix-blend-overlay">
                <Lock size={120} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Research Tier</h3>
              <div className="flex items-baseline gap-1 mb-6 relative z-10">
                <span className="text-5xl font-bold tracking-tighter text-white">TBA</span>
              </div>
              <p className="text-zinc-400 text-[15px] mb-10 leading-relaxed tracking-tight relative z-10">
                The ultimate engine for academics and power users. Join the waitlist.
              </p>
              
              <ul className="space-y-4 mb-10 flex-1 relative z-10">
                {[
                  'Intelligent 4-Engine Fallback',
                  'Priority Global Edge Caching',
                  'Unlimited Multi-Modal Audio',
                  'Export to PDF & Markdown'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[15px] text-zinc-500 font-medium tracking-wide">
                    <CheckCircle2 size={18} className="text-zinc-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-4 px-4 rounded-xl font-semibold text-center border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors relative z-10">
                Join the Waitlist
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 relative">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">Frequently Asked Questions</h2>
              <p className="text-zinc-400">Everything you need to know about the product and billing.</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <motion.div 
                    layout
                    key={index} 
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-zinc-900/80 border-primary/40 shadow-[0_0_20px_rgba(255,49,49,0.1)]' : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/30'}`}
                  >
                    <button 
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none rounded-2xl group"
                    >
                      <span className={`font-medium text-lg transition-colors ${isOpen ? 'text-zinc-100' : 'text-zinc-300 group-hover:text-zinc-200'}`}>
                        {faq.question}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors ${isOpen ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-300'}`}
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 pt-1">
                            <p className="text-zinc-400 leading-relaxed text-[15px] border-l-2 border-primary/30 pl-4 ml-1">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center bg-[#050505] border border-white/[0.04] rounded-[3rem] p-12 sm:p-20 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tighter text-zinc-100 mb-6 relative z-10 leading-[1.1]">Ready to unlock your data?</h2>
            <p className="text-[19px] tracking-tight text-zinc-400 mb-10 relative z-10 max-w-2xl mx-auto leading-relaxed">Join developers and researchers using SmartLearn AI to extract maximum value from their documents.</p>
            <div className="relative z-10">
               <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-all shadow-[0_0_30px_-10px_rgba(255,255,255,0.4)]">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-950 pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Logo size={24} />
              <span className="font-bold text-lg text-zinc-100">SmartLearn AI</span>
            </div>
            <p className="text-zinc-400 text-sm max-w-sm leading-relaxed mb-6">
              The ultimate contextual AI platform. Analyze massive documents, videos, and codebases at the speed of thought.
            </p>
          </div>
          
          <div>
            <h4 className="text-zinc-100 font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><a href="#features" className="hover:text-zinc-300 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-zinc-300 transition-colors">Pricing</a></li>
              <li><Link to="/signup" className="hover:text-zinc-300 transition-colors">Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-zinc-300 transition-colors">Log In</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-zinc-100 font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-zinc-500">
              <li><a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-zinc-600 text-sm">© {new Date().getFullYear()} SmartLearn AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
