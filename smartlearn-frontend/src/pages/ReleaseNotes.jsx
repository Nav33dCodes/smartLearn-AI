import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const releases = [
  {
    date: "June 10, 2026",
    features: [
      {
        title: "Intelligent Video & UI Overhaul",
        description: "Transformed SmartLearn into a comprehensive educational platform with smart video integration and a sleek interface.",
        bullets: [
          "YouTube Data API v3: Added an intelligent LLM-router to detect complex educational queries and fetch relevant YouTube tutorials automatically.",
          "Embedded Player UI: Beautiful, interactive video cards with hover effects, skeletons, and play overlays.",
          "Redesign: Unified the input box into a sleek '+' menu for attachments and web search toggles. User bubbles updated to a refined muted tone."
        ]
      }
    ]
  },
  {
    date: "June 2, 2026",
    features: [
      {
        title: "Dynamic Theming & Aesthetics",
        description: "A complete visual upgrade allowing for unparalleled personalization and sophistication.",
        bullets: [
          "Accent Color Customization: Select your preferred primary color (Emerald, Blue, Violet, Rose, Orange, Zinc) from the new Appearance settings.",
          "Real-time CSS Variables: Instant, zero-flicker global theme application.",
          "Inter Font & Zinc Palette: Global typography overhaul to Inter font."
        ]
      }
    ]
  },
  {
    date: "May 25, 2026",
    features: [
      {
        title: "Search & Speech Enhancements",
        description: "Brought real-time knowledge and native voice dictation to your fingertips.",
        bullets: [
          "Tavily Web Search API: Integrated live web search directly into the LLM context for up-to-date knowledge retrieval.",
          "Web Speech API Migration: Replaced third-party speech providers with native browser speech recognition for faster, free, local audio dictation.",
          "Smooth Auto-Scroll: Implemented fluid scrolling during AI streaming and message generation."
        ]
      }
    ]
  },
  {
    date: "May 10, 2026",
    features: [
      {
        title: "Core Infrastructure & Auth",
        description: "A massive foundational upgrade for scale, speed, and security.",
        bullets: [
          "Neon Serverless Postgres: Migrated backend to a highly scalable Neon Postgres cluster for robust data retention and instant cold starts.",
          "Groq API Inference: Swapped to ultra-low latency Groq endpoint for lightning-fast LLaMA 3.1 token generation.",
          "Advanced JWT Security: Implemented secure token-based authentication with encrypted password hashing.",
          "SMTP Email Verification: Added robust email OTP systems for account recovery and privacy management."
        ]
      }
    ]
  }
];

export default function ReleaseNotes() {
  // Force light mode on this specific page by removing "dark" from document
  useEffect(() => {
    const wasDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "white";
    
    return () => {
      // Revert when unmounting if it was dark
      if (wasDark) {
        document.documentElement.classList.add("dark");
      }
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0d0d0d] font-sans selection:bg-black selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        <h1 className="text-[40px] md:text-[56px] font-bold tracking-tight mb-20 leading-tight">
          Release notes
        </h1>

        <div className="space-y-24">
          {releases.map((release, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col"
            >
              <h2 className="text-[28px] md:text-[32px] font-semibold tracking-tight mb-8">
                {release.date}
              </h2>
              
              <div className="space-y-12">
                {release.features.map((feature, fIdx) => (
                  <div key={fIdx} className="space-y-4">
                    <h3 className="text-[20px] font-semibold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-[16px] leading-relaxed text-[#333333]">
                      {feature.description}
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4 text-[16px] leading-relaxed text-[#333333] marker:text-[#888888]">
                      {feature.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="pl-2">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              {index < releases.length - 1 && (
                <hr className="mt-24 border-[#e5e5e5]" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
