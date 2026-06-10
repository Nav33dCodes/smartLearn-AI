import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Rocket, Zap, Palette, Lock, Search, MonitorPlay, Database, Sparkles, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const releases = [
  {
    version: "v2.5.0",
    date: "June 10, 2026",
    title: "Intelligent Video & UI Overhaul",
    icon: <MonitorPlay className="text-red-500" size={24} />,
    description: "Transformed SmartLearn into a comprehensive educational platform with smart video integration and a sleek ChatGPT-style interface.",
    features: [
      { name: "YouTube Data API v3", desc: "Added an intelligent LLM-router (via Groq) to detect complex educational queries and fetch relevant YouTube tutorials automatically." },
      { name: "Embedded Player UI", desc: "Beautiful, interactive video cards with hover effects, skeletons, and play overlays." },
      { name: "ChatGPT-Style Redesign", desc: "Unified the input box into a sleek '+' menu for attachments and web search toggles. User bubbles updated to a refined muted tone." }
    ]
  },
  {
    version: "v2.4.0",
    date: "June 2, 2026",
    title: "Dynamic Theming & Aesthetics",
    icon: <Palette className="text-emerald-500" size={24} />,
    description: "A complete visual upgrade allowing for unparalleled personalization and dark mode sophistication.",
    features: [
      { name: "Accent Color Customization", desc: "Select your preferred primary color (Emerald, Blue, Violet, Rose, Orange, Zinc) from the new Appearance settings." },
      { name: "Real-time CSS Variables", desc: "Instant, zero-flicker global theme application using dynamic DOM injection." },
      { name: "Inter Font & Zinc Palette", desc: "Global typography overhaul to Inter and a highly sophisticated Zinc dark mode." }
    ]
  },
  {
    version: "v2.3.0",
    date: "May 25, 2026",
    title: "Search & Speech Enhancements",
    icon: <Search className="text-blue-500" size={24} />,
    description: "Brought real-time knowledge and native voice dictation to your fingertips.",
    features: [
      { name: "Tavily Web Search API", desc: "Integrated live web search directly into the LLM context for completely up-to-date knowledge retrieval." },
      { name: "Web Speech API Migration", desc: "Replaced third-party speech providers with native browser speech recognition for faster, free, local audio dictation." },
      { name: "Smooth Auto-Scroll", desc: "Implemented fluid scrolling during AI streaming and message generation." }
    ]
  },
  {
    version: "v2.2.0",
    date: "May 10, 2026",
    title: "Core Infrastructure & Auth",
    icon: <Database className="text-indigo-500" size={24} />,
    description: "A massive foundational upgrade for scale, speed, and security.",
    features: [
      { name: "Neon Serverless Postgres", desc: "Migrated backend to a highly scalable Neon Postgres cluster for robust data retention and instant cold starts." },
      { name: "Groq API Inference", desc: "Swapped to ultra-low latency Groq endpoint for lightning-fast LLaMA 3.1 token generation." },
      { name: "Advanced JWT Security", desc: "Implemented secure token-based authentication with encrypted password hashing." },
      { name: "SMTP Email Verification", desc: "Added robust email OTP systems for account recovery and privacy management." }
    ]
  }
];

export default function ReleaseNotes() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 relative"
        >
          <button 
            onClick={() => navigate('/')}
            className="absolute -top-2 left-0 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center pt-8 md:pt-0">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-3">
              <Sparkles className="text-primary" size={36} />
              Release Notes
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the latest updates, API integrations, and premium features we've shipped to make SmartLearn AI the ultimate educational platform.
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative border-l-2 border-muted ml-4 md:ml-8 space-y-16 pb-20">
          {releases.map((release, idx) => (
            <motion.div 
              key={release.version}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative pl-8 md:pl-12"
            >
              {/* Timeline Node */}
              <div className="absolute -left-[21px] md:-left-[21px] top-1 bg-background p-1">
                <div className="w-10 h-10 rounded-full bg-card border-2 border-muted flex items-center justify-center shadow-sm">
                  {release.icon}
                </div>
              </div>

              {/* Content */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                    {release.title}
                    <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {release.version}
                    </span>
                  </h2>
                  <span className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">
                    {release.date}
                  </span>
                </div>
                
                <p className="text-muted-foreground mb-6 text-[15px] leading-relaxed">
                  {release.description}
                </p>

                <div className="space-y-4">
                  {release.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
                      <div>
                        <span className="font-semibold text-foreground mr-2">{feature.name}:</span>
                        <span className="text-muted-foreground text-[15px] leading-relaxed">{feature.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
