import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Zap, Shield, FileText, Sparkles, Code2, Database, PlaySquare, Image as ImageIcon, CheckCircle2, Cpu, Network, Globe, Mail } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

function MockupImage({ src, alt, filename, dimensions }) {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
        <ImageIcon size={40} className="mb-3 opacity-50" />
        <p className="text-base font-medium text-zinc-400">Missing Image</p>
        <p className="text-xs mt-2 max-w-[200px] text-zinc-500">
          Save as <code className="bg-zinc-800 px-1 rounded text-zinc-300">{filename}</code> in <code className="bg-zinc-800 px-1 rounded text-zinc-300">public/images/</code>
        </p>
        {dimensions && (
          <p className="text-xs mt-2 font-mono text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded">
            Recommended size: {dimensions}
          </p>
        )}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover rounded-2xl"
      onError={() => setError(true)}
    />
  );
}

export default function Landing() {
  const { user } = useAuth();
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
          <Link to="/releases" className="hover:text-zinc-100 transition-colors">Release Notes</Link>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/app" className="text-sm font-medium bg-zinc-100 text-zinc-900 px-4 py-2 rounded-full hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Sign In</Link>
              <Link to="/signup" className="text-sm font-medium bg-zinc-100 text-zinc-900 px-4 py-2 rounded-full hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Get Started
              </Link>
            </>
          )}
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
            <Link to="/releases" className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors">
              Read notes <ArrowRight size={12} />
            </Link>
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
            <Link to={user ? "/app" : "/signup"} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 px-8 py-3.5 rounded-full text-base font-medium hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02]">
              {user ? "Go to Dashboard" : "Start for Free"} <ArrowRight size={18} />
            </Link>
            <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900/50 border border-zinc-800 text-zinc-300 px-8 py-3.5 rounded-full text-base font-medium hover:bg-zinc-800/50 hover:text-white transition-all backdrop-blur-sm">
              Explore Features
            </a>
          </motion.div>
        </section>

        {/* Dashboard Preview Image (Mockup) */}
        <section className="px-4 pb-20 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/50 shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <div className="relative aspect-[16/9] w-full bg-zinc-900 group overflow-hidden">
              <MockupImage src="/images/dashboard-mockup.png" alt="Dashboard Preview" filename="dashboard-mockup.png" dimensions="1920x1080 (16:9)" />
              <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-zinc-950/10 transition-colors duration-700 pointer-events-none" />
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
            
            <p className="text-center text-sm font-medium text-zinc-500 uppercase tracking-widest mb-10 relative z-30">
              Integrated with the industry's most powerful platforms
            </p>
            
            <div className="flex animate-marquee gap-16 sm:gap-24 px-6 transition-all duration-700 items-center">
              {[
                { name: 'Groq', file: 'groq' },
                { name: 'Claude', file: 'claude' },
                { name: 'DeepSeek', file: 'deepseek' },
                { name: 'Gemini', file: 'gemini' },
                { name: 'YouTube', file: 'youtube' },
                { name: 'OpenRouter', file: 'openrouter' },
                { name: 'Tavily', file: 'tavily' },
                { name: 'Gmail', file: 'gmail' },
                { name: 'Neon DB', file: 'neon' },
                { name: 'Llama', file: 'llama' },
                // Duplicate the array exactly to create the seamless loop
                { name: 'Groq', file: 'groq' },
                { name: 'Claude', file: 'claude' },
                { name: 'DeepSeek', file: 'deepseek' },
                { name: 'Gemini', file: 'gemini' },
                { name: 'YouTube', file: 'youtube' },
                { name: 'OpenRouter', file: 'openrouter' },
                { name: 'Tavily', file: 'tavily' },
                { name: 'Gmail', file: 'gmail' },
                { name: 'Neon DB', file: 'neon' },
                { name: 'Llama', file: 'llama' },
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

        {/* Deep Dive Features */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-24">
             <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-4">Transform How You Learn</h2>
             <p className="text-zinc-400 text-lg">SmartLearn isn't just a chatbot. It's a complete knowledge extraction engine.</p>
          </div>

          <div className="space-y-32">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <div className="w-full md:w-1/2 space-y-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <BrainCircuit size={24} className="text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-zinc-100">Context-Aware Document Chat</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Upload your textbooks, research papers, or meeting notes. Our RAG pipeline ensures that the AI answers strictly based on your uploaded context, virtually eliminating hallucinations.
                </p>
                <ul className="space-y-3">
                  {['Instant answers from 100+ page PDFs', 'Exact citations to original text', 'Support for PDF, DOCX, TXT'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 size={18} className="text-primary" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:w-1/2">
                <div className="relative aspect-square md:aspect-[4/3] rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2 shadow-2xl">
                  <MockupImage src="/images/feature-chat.png" alt="Context Chat" filename="feature-chat.png" dimensions="800x600 (4:3)" />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24">
              <div className="w-full md:w-1/2 space-y-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                  <PlaySquare size={24} className="text-red-400" />
                </div>
                <h3 className="text-3xl font-bold text-zinc-100">Instant YouTube Analysis</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Don't have time to watch a 2-hour lecture? Just paste the YouTube URL into SmartLearn. We extract the transcript and allow you to chat with the video instantly.
                </p>
                <ul className="space-y-3">
                  {['Automatic transcript extraction', 'Timestamp-aware answers', 'Summarize massive lectures in seconds'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-zinc-300">
                      <CheckCircle2 size={18} className="text-red-400" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:w-1/2">
                <div className="relative aspect-square md:aspect-[4/3] rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2 shadow-2xl">
                   <MockupImage src="/images/feature-youtube.png" alt="YouTube Analysis" filename="feature-youtube.png" />
                </div>
              </div>
            </div>

             {/* Feature 3 */}
             <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <div className="w-full md:w-1/2 space-y-6">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                  <Database size={24} className="text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold text-zinc-100">Cross-Document Synthesis</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Have 5 different documents about the same topic? SmartLearn can synthesize data across your entire library, finding connections that you might have missed.
                </p>
              </div>
              <div className="w-full md:w-1/2">
                <div className="relative aspect-square md:aspect-[4/3] rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2 shadow-2xl">
                   <MockupImage src="/images/feature-docs.png" alt="Multi-Doc Analysis" filename="feature-docs.png" dimensions="800x600 (4:3)" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Small Features Bento */}
        <section className="py-12 px-6 max-w-7xl mx-auto">

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Feature 1: Large */}
            <motion.div variants={itemVariants} className="md:col-span-2 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 backdrop-blur-sm hover:border-zinc-700 transition-colors group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                  <BrainCircuit size={24} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-3">Context-Aware AI</h3>
                <p className="text-zinc-400 text-lg max-w-md">Our advanced Retrieval-Augmented Generation (RAG) pipeline perfectly aligns AI responses with your specific documents.</p>
              </div>
            </motion.div>

            {/* Feature 2: Small */}
            <motion.div variants={itemVariants} className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 backdrop-blur-sm hover:border-zinc-700 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Zap size={24} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Lightning Fast</h3>
              <p className="text-zinc-400">Built on FastAPI and optimized Postgres for sub-second response times.</p>
            </motion.div>

            {/* Feature 3: Small */}
            <motion.div variants={itemVariants} className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 backdrop-blur-sm hover:border-zinc-700 transition-colors group">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20 group-hover:scale-110 transition-transform">
                <Shield size={24} className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">Enterprise Security</h3>
              <p className="text-zinc-400">Your documents are encrypted and never used to train public models.</p>
            </motion.div>


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

        {/* About / Trust Section */}
        <section id="about" className="py-24 px-6 border-y border-zinc-800/50 bg-zinc-950/30">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-video rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2 overflow-hidden shadow-2xl">
                 <MockupImage src="/images/about-team.png" alt="Our Team" filename="about-team.png" dimensions="1920x1080 (16:9)" />
                 <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950/80 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100">About SmartLearn AI</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                We believe that learning shouldn't be gated by the amount of time it takes to read a textbook. SmartLearn AI was built by researchers, for researchers, to drastically cut down the time required to extract meaningful insights from massive amounts of data.
              </p>
              <p className="text-zinc-400 text-lg leading-relaxed">
                By integrating the world's most powerful LLMs (Claude, GPT, Gemini, Llama) with a secure, private document retrieval system, we give you a photographic memory for everything you upload.
              </p>
              <div className="pt-4">
                <a href="https://github.com/Nav33dCodes/smartLearn-AI" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                  View our open-source roots <ArrowRight size={16} />
                </a>
              </div>
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
               <Link to={user ? "/app" : "/signup"} className="inline-flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 px-8 py-4 rounded-full text-lg font-medium hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02]">
                {user ? "Go to Dashboard" : "Create Free Account"}
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
            <Link to="/releases" className="hover:text-zinc-300 transition-colors">Releases</Link>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
