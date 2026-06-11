import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Zap, Shield, FileText, Sparkles, Code2, Database, PlaySquare, Image as ImageIcon, CheckCircle2, Cpu, Network, Globe, Mail, ChevronDown } from 'lucide-react';
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
                { name: 'Claude', file: 'claude' },
                { name: 'DeepSeek', file: 'deepseek' },
                { name: 'Gemini', file: 'gemini' },
                { name: 'Gmail', file: 'gmail' },
                { name: 'Groq', file: 'groq' },
                { name: 'Llama', file: 'llama' },
                { name: 'Neon DB', file: 'neon' },
                { name: 'OpenRouter', file: 'openrouter' },
                { name: 'Redis', file: 'redis' },
                { name: 'Tavily', file: 'tavily' },
                { name: 'YouTube', file: 'youtube' },
                // Duplicate the array exactly to create the seamless loop
                { name: 'Claude', file: 'claude' },
                { name: 'DeepSeek', file: 'deepseek' },
                { name: 'Gemini', file: 'gemini' },
                { name: 'Gmail', file: 'gmail' },
                { name: 'Groq', file: 'groq' },
                { name: 'Llama', file: 'llama' },
                { name: 'Neon DB', file: 'neon' },
                { name: 'OpenRouter', file: 'openrouter' },
                { name: 'Redis', file: 'redis' },
                { name: 'Tavily', file: 'tavily' },
                { name: 'YouTube', file: 'youtube' },
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



        {/* Features Section */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto space-y-32">
          
          {/* Feature 1: Hero Dashboard (Centered) */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={itemVariants}
            className="flex flex-col items-center text-center max-w-5xl mx-auto"
          >
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-6">Industry-Leading Interface</h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mb-12 leading-relaxed">
              Experience a beautiful, minimalistic workspace designed for maximum focus. Our context-aware chat environment ensures you interact with your documents without distractions, allowing for deep, meaningful analysis.
            </p>
            <div className="w-full relative rounded-3xl border border-zinc-800/50 bg-zinc-900/20 overflow-hidden shadow-2xl p-2">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-950 aspect-[16/10]">
                <img src="/images/mockup1.png" alt="Dashboard AI Chat" className="w-full h-full object-cover object-left-top opacity-90 hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Knowledge Graph (Image Left, Text Right) */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={itemVariants}
            className="flex flex-col md:flex-row items-center gap-12 lg:gap-20"
          >
            <div className="w-full md:w-1/2">
              <div className="relative rounded-3xl border border-zinc-800/50 bg-zinc-900/20 p-2 shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-950 aspect-[4/3] sm:aspect-video md:aspect-[4/3]">
                  <img src="/images/mockup2.png" alt="Knowledge Graph" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-100">Dynamic Knowledge Mapping</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Transform static documents into a living, interactive web of insights. Our intelligent extraction engine automatically maps relationships across your entire knowledge base, allowing you to visually explore complex concepts and instantly uncover non-obvious connections.
              </p>
            </div>
          </motion.div>

          {/* Feature 3: Multi-Model Intelligence (Text Left, Image Right) */}
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={itemVariants}
            className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20"
          >
            <div className="w-full md:w-1/2">
              <div className="relative rounded-3xl border border-zinc-800/50 bg-zinc-900/20 p-2 shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-950 aspect-[4/3] sm:aspect-video md:aspect-[4/3]">
                  <img src="/images/mockup3.png" alt="Multi-Model Intelligence" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-100">Multi-Model Intelligence</h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Never lock yourself into a single ecosystem again. SmartLearn allows you to query your documents using the world's most advanced frontier models—from Claude 3.5 to GPT-4o and DeepSeek. Effortlessly switch models based on your specific reasoning, coding, or analysis tasks, just like the best industry tools.
              </p>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Optimistic UI', desc: 'Interfaces update instantly before the server even responds, creating a seamless, zero-latency experience.' },
                { title: 'Global Edge Caching', desc: 'Powered by Upstash Redis, your sessions and frequent queries are cached globally for sub-millisecond retrieval.' },
                { title: 'Format Agnostic', desc: 'Upload PDFs, Word documents, Markdown, or raw text files. Our pipeline processes them flawlessly.' },
                { title: 'Strict Privacy', desc: 'Your documents are fully encrypted at rest and never used to train public foundational AI models.' }
              ].map((feat, i) => (
                <div key={i} className="flex flex-col border-l border-zinc-800 pl-6">
                  <h4 className="text-lg font-bold text-zinc-100 mb-2">{feat.title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20 relative">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
                <Sparkles size={14} />
                <span className="font-medium tracking-wide">Early Access Phase</span>
             </div>
             <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-100 mb-6">Built for the future. <br className="hidden sm:block" /> Free for the pioneers.</h2>
             <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
               During our exclusive Public Beta, all users get unprecedented access to SmartLearn's core engine for free. Our ultimate research tier is currently being forged.
             </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Public Beta Plan */}
            <div className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all rounded-[2rem] p-8 sm:p-10 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Globe size={120} />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-2 relative z-10">Public Beta</h3>
              <div className="flex items-baseline gap-1 mb-6 relative z-10">
                <span className="text-5xl font-extrabold text-zinc-100">$0</span>
                <span className="text-zinc-500 font-medium">/ forever</span>
              </div>
              <p className="text-zinc-400 text-sm mb-8 flex-1 leading-relaxed relative z-10">Our way of saying thank you. Secure your pioneer account now and get foundational access forever.</p>
              <ul className="space-y-4 mb-10 relative z-10">
                {['Unlimited foundational document analysis', 'Access to high-speed Llama 3 models', 'Generous daily message quotas', 'Interactive knowledge mapping', 'Secure global edge caching'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                    <CheckCircle2 size={18} className="text-zinc-500 shrink-0 mt-0.5" /> 
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="relative z-10 w-full py-4 px-6 rounded-2xl bg-zinc-100 text-zinc-900 text-center font-bold hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Claim Free Account
              </Link>
            </div>

            {/* Founder's Edition Plan */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-8 sm:p-10 flex flex-col relative overflow-hidden group">
              {/* Blur Overlay for Hype */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center border-2 border-primary/30 rounded-[2rem] shadow-[0_0_50px_rgba(var(--color-primary),0.1)]">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(var(--color-primary),0.4)] relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  <Cpu size={28} className="text-primary relative z-10" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Founder's Edition</h3>
                <p className="text-zinc-300 text-sm mb-8 max-w-[240px] leading-relaxed">
                  We are forging the ultimate research tier. The most powerful frontier models, uncapped.
                </p>
                <button className="relative overflow-hidden w-full py-4 px-6 rounded-2xl border border-primary/50 bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all group/btn shadow-[0_0_20px_rgba(var(--color-primary),0.15)]">
                  <span className="relative z-10">Join Waitlist</span>
                  <div className="absolute inset-0 h-full w-[20px] bg-white/20 skew-x-[30deg] -translate-x-[150px] group-hover/btn:translate-x-[400px] transition-transform duration-1000" />
                </button>
              </div>

              {/* Underlying Blurred Content (barely visible for effect) */}
              <div className="opacity-20 select-none blur-[3px]">
                <h3 className="text-2xl font-bold text-zinc-100 mb-2">Founder's Edition</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-extrabold text-zinc-100">$??</span>
                </div>
                <p className="text-zinc-400 text-sm mb-8 flex-1">The ultimate research powerhouse.</p>
                <ul className="space-y-4 mb-10">
                  {['Unlimited Claude 3.5 & GPT-4o', 'Infinite document storage', 'Deep YouTube Video Analysis', 'Advanced API Access', 'Priority AGI routing'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <CheckCircle2 size={18} className="text-primary shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="w-full py-4 px-6 rounded-2xl bg-zinc-800 text-center font-bold">
                  Unlocking Soon
                </div>
              </div>
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
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className={`border border-zinc-800 rounded-2xl overflow-hidden transition-colors ${openFaqIndex === index ? 'bg-zinc-900/50 border-primary/30' : 'bg-transparent hover:border-zinc-700'}`}
                >
                  <button 
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-ring rounded-2xl"
                  >
                    <span className={`font-medium text-lg ${openFaqIndex === index ? 'text-zinc-100' : 'text-zinc-300'}`}>
                      {faq.question}
                    </span>
                    <ChevronDown 
                      size={20} 
                      className={`text-zinc-500 shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180 text-primary' : ''}`} 
                    />
                  </button>
                  
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-zinc-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
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
