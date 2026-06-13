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
    <div className="dark min-h-screen bg-black text-zinc-100 font-sans selection:bg-red-500/30 overflow-x-hidden pt-20">
      
      {/* Background Gradients (Optimized for performance) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff00000a_1px,transparent_1px),linear-gradient(to_bottom,#ff00000a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-red-500/10 bg-black/60 backdrop-blur-xl transition-all duration-300">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo size={28} />
            <span className="text-xl font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">SmartLearn</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-zinc-100 transition-colors cursor-pointer">Features</a>
            <a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="hover:text-zinc-100 transition-colors cursor-pointer">Pricing</a>
            <a href="#about" onClick={(e) => handleScroll(e, 'about')} className="hover:text-zinc-100 transition-colors cursor-pointer">About</a>
            <Link to="/releases" className="hover:text-zinc-100 transition-colors">Release Notes</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="text-sm font-medium bg-zinc-100 text-zinc-900 px-4 py-2 rounded-full hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-4 text-center max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/30 border border-red-900/50 text-sm text-red-200 mb-8 backdrop-blur-sm"
          >
            <Sparkles size={14} className="text-red-500" />
            <span className="font-semibold tracking-wide pr-2">SmartLearn Generative UI is now live</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 mb-6 leading-[1.1]"
          >
            Analyze Documents at the <br className="hidden sm:block" /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-800">Speed of Thought.</span>
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
            className="flex flex-col sm:flex-row items-center gap-4 mt-6 relative z-20"
          >
            <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-3.5 rounded-full text-base font-bold hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:scale-[1.02]">
              Start for Free <ArrowRight size={18} />
            </Link>
            <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black/50 border border-red-900/30 text-red-100 px-8 py-3.5 rounded-full text-base font-bold hover:bg-red-950/50 hover:border-red-500/50 transition-all backdrop-blur-sm cursor-pointer">
              Explore Features
            </a>
          </motion.div>

          {/* Dynamic "Use-Case" Release Note Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-4xl mt-24 mb-8"
          >
            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 relative z-10">
              {heroTabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveHeroTab(idx)}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-colors ${activeHeroTab === idx ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-300'}`}
                >
                  {activeHeroTab === idx && (
                    <motion.div
                      layoutId="heroTabBubble"
                      className="absolute inset-0 bg-zinc-800 border border-zinc-700 rounded-full -z-10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {tab.icon}
                  {tab.title}
                </button>
              ))}
            </div>

            {/* Tab Content Crossfade */}
            <div className="relative min-h-[220px] bg-zinc-900/40 border border-zinc-800/60 rounded-[2rem] p-8 sm:p-12 text-left backdrop-blur-md overflow-hidden">
              {/* Subtle background glow based on active tab */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeHeroTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full justify-center"
                >
                  <h3 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3 tracking-tight">
                    {heroTabs[activeHeroTab].description}
                  </h3>
                  <div className="space-y-4 mt-6">
                    {heroTabs[activeHeroTab].bullets.map((bullet, i) => (
                      <div key={i} className="flex items-start gap-3 text-zinc-400">
                        <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                        <p className="text-base leading-relaxed">{bullet}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
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
                      className="w-full h-full object-contain relative z-10 transition-all duration-500 group-hover/icon:scale-[1.15] filter grayscale opacity-50 group-hover/icon:grayscale-0 group-hover/icon:opacity-100" 
                      onError={(e) => { e.target.style.display='none'; }} 
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium tracking-widest text-zinc-600 group-hover/icon:text-zinc-300 transition-colors duration-500">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Features Section - Node Visualizer */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={itemVariants}
            className="flex flex-col items-center text-center max-w-5xl mx-auto"
          >
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100 mb-6">Visual Knowledge Architecture</h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mb-12 leading-relaxed font-medium">
              We completely abandoned standard file viewers. Our inference engine automatically extracts and plots your documents into a living, interactive Node Graph. Explore the unseen connections in your data.
            </p>
            
            {/* React Flow CSS Node Diagram */}
            <div className="w-full relative mt-8 max-w-4xl mx-auto h-80 sm:h-[450px] border border-red-900/30 bg-black/60 rounded-3xl overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.05)]">
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff000010_1px,transparent_1px),linear-gradient(to_bottom,#ff000010_1px,transparent_1px)] bg-[size:32px_32px]" />
               
               {/* Animated Connection Line */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                 <path d="M 30% 50% C 50% 50%, 50% 50%, 70% 50%" stroke="rgba(220,38,38,0.6)" strokeWidth="3" fill="none" strokeDasharray="8,8" className="animate-[dash_20s_linear_infinite]" />
                 <style>{`@keyframes dash { to { stroke-dashoffset: -1000; } }`}</style>
               </svg>

               {/* Source Node */}
               <div className="absolute left-[20%] sm:left-[25%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-40 sm:w-56 bg-[#0a0a0a] border-2 border-red-900/60 rounded-2xl p-5 shadow-[0_0_30px_rgba(220,38,38,0.1)] z-10 hover:border-red-500 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-950/50 rounded-lg text-red-500 group-hover:bg-red-900 transition-colors">
                       <Database size={18} />
                    </div>
                    <span className="text-sm font-black text-zinc-200 tracking-wider">KNOWLEDGE</span>
                  </div>
                  <div className="h-2 w-full bg-red-950 rounded-full mb-3" />
                  <div className="h-2 w-2/3 bg-red-950 rounded-full" />
                  {/* Right Handle */}
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-black border-2 border-red-500 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
               </div>

               {/* Target Node */}
               <div className="absolute left-[80%] sm:left-[75%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-40 sm:w-56 bg-[#0a0a0a] border-2 border-red-900/60 rounded-2xl p-5 shadow-[0_0_30px_rgba(220,38,38,0.1)] z-10 hover:border-red-500 transition-colors cursor-pointer group">
                  {/* Left Handle */}
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-black border-2 border-red-500 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-950/50 rounded-lg text-red-500 group-hover:bg-red-900 transition-colors">
                       <BrainCircuit size={18} />
                    </div>
                    <span className="text-sm font-black text-zinc-200 tracking-wider">INFERENCE</span>
                  </div>
                  <div className="h-2 w-full bg-red-950 rounded-full mb-3" />
                  <div className="h-2 w-3/4 bg-red-950 rounded-full" />
               </div>
            </div>
          </motion.div>

        </section>

        {/* Advanced Capabilities List */}
        <section className="py-24 px-6 border-t border-zinc-800/50 bg-zinc-950/30">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-4">Enterprise-Grade Architecture</h2>
              <p className="text-zinc-400 text-lg">Built from the ground up for speed, reliability, and security.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
              {/* Background Node Connection Lines */}
              <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-red-900/20 -z-10 -translate-y-1/2" />
              
              {[
                { title: 'Multimodal Vision', desc: 'Upload images instantly. Our powerful browser-side compression engine perfectly analyzes visual data with zero API token bloat.' },
                { title: 'Live Sandpack IDE', desc: 'Instantly run, edit, and preview React and JavaScript applications right inside the chat window.' },
                { title: 'Personalization Engine', desc: 'Define your exact AI Persona, Tone, and Custom Instructions to tailor the entire learning experience.' },
                { title: 'Textbook Math Rendering', desc: 'Beautifully formats complex physics and calculus equations using native KaTeX integration.' },
                { title: 'Real-time Voice AI', desc: 'Speak naturally to your AI tutor and have your audio instantly transcribed.' },
                { title: 'Multi-Model Fallback', desc: 'Automatically routes queries between Gemini 2.5, Claude, and Groq to guarantee 100% uptime.' },
                { title: 'Global Edge Caching', desc: 'Powered by Upstash Redis, your sessions and frequent queries are cached globally for sub-millisecond retrieval.' },
                { title: 'Format Agnostic', desc: 'Upload PDFs, Word documents, Markdown, or raw text files. Our pipeline processes them flawlessly.' }
              ].map((feat, i) => (
                <div key={i} className="relative flex flex-col bg-[#0a0a0a] border-2 border-red-900/30 rounded-xl p-6 hover:border-red-500 transition-all duration-300 group shadow-lg">
                  {/* Top Handle */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black border-2 border-red-800 rounded-full group-hover:border-red-400 transition-colors" />
                  {/* Bottom Handle */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black border-2 border-red-800 rounded-full group-hover:border-red-400 transition-colors" />
                  
                  <h4 className="text-lg font-black text-zinc-100 mb-3">{feat.title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 px-6 bg-black border-t border-red-900/30 relative">
          <div className="max-w-6xl mx-auto relative z-10">
            {/* The Mission Statement */}
            <div className="text-center mb-24 max-w-4xl mx-auto">
              <h2 className="text-sm font-black text-red-500 tracking-widest uppercase mb-6">The Mission</h2>
              <p className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100 leading-[1.2]">
                We are engineering the cognitive architecture of tomorrow. SmartLearn AI is built for pioneers who demand uncompromising speed and intelligence.
              </p>
            </div>

            {/* Leadership Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Sanan Malik */}
              <div className="bg-[#0a0a0a] border-2 border-red-900/30 rounded-3xl p-8 sm:p-10 flex flex-col justify-between group hover:border-red-500 transition-colors relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-zinc-100 mb-1">Sanan Malik</h3>
                  <p className="text-red-500 font-bold mb-6 text-sm tracking-wide">CEO & VISIONARY</p>
                  <p className="text-zinc-400 text-base leading-relaxed font-medium">
                    Driving the strategic vision to make SmartLearn AI the absolute pinnacle of educational and research technology globally.
                  </p>
                </div>
              </div>

              {/* Naveed Ahmed */}
              <div className="bg-[#0a0a0a] border-2 border-red-900/30 rounded-3xl p-8 sm:p-10 flex flex-col justify-between group hover:border-red-500 transition-colors relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-zinc-100 mb-1">Naveed Ahmed</h3>
                  <p className="text-red-500 font-bold mb-6 text-sm tracking-wide">LEAD ARCHITECT & DEVELOPER</p>
                  <p className="text-zinc-400 text-base leading-relaxed font-medium">
                    Engineering the core infrastructure, RAG pipelines, and hyper-optimized UI/UX to deliver a 60fps, zero-latency experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20 relative">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-sm text-red-500 mb-6 font-bold">
                <Sparkles size={14} />
                <span className="tracking-wide">Early Access Phase</span>
             </div>
             <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-100 mb-6">Built for the future. <br className="hidden sm:block" /> Free for the pioneers.</h2>
             <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
               During our exclusive Public Beta, all users get unprecedented access to SmartLearn's core engine for free. Our ultimate research tier is currently being forged.
             </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            {/* Public Beta Plan */}
            <div className="bg-[#0a0a0a] border-2 border-red-900/50 rounded-3xl p-8 sm:p-10 flex flex-col hover:border-red-500 transition-colors shadow-[0_0_30px_rgba(220,38,38,0.05)]">
              <h3 className="text-xl font-bold text-zinc-300 mb-2">Public Beta</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-zinc-500 text-sm font-bold">/ forever</span>
              </div>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium">
                Our way of saying thank you. Secure your pioneer account now and get foundational access forever.
              </p>
              
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'Unlimited Documents',
                  'Advanced Node Graph',
                  'Gemini 2.5 Access',
                  'Basic Speech-to-Text'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-300 font-medium">
                    <CheckCircle2 size={16} className="text-red-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link to="/signup" className="w-full py-3.5 px-4 rounded-xl font-bold text-center border-2 border-red-900/50 text-red-100 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all">
                Create Free Account
              </Link>
            </div>

            {/* Research Tier */}
            <div className="bg-red-600 rounded-3xl p-8 sm:p-10 flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]">
              <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none mix-blend-overlay">
                <Lock size={120} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">Research Tier</h3>
              <div className="flex items-baseline gap-1 mb-6 relative z-10">
                <span className="text-4xl font-black text-white">TBA</span>
              </div>
              <p className="text-red-200 text-sm mb-8 leading-relaxed font-medium relative z-10">
                The ultimate engine for academics and power users. Join the waitlist.
              </p>
              
              <ul className="space-y-4 mb-8 flex-1 relative z-10">
                {[
                  'Intelligent 4-Engine Fallback',
                  'Priority Global Edge Caching',
                  'Unlimited Multi-Modal Audio',
                  'Export to PDF & Markdown'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-red-50 font-medium">
                    <CheckCircle2 size={16} className="text-red-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-3.5 px-4 rounded-xl font-bold text-center bg-white text-red-600 hover:bg-red-50 transition-colors relative z-10">
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
