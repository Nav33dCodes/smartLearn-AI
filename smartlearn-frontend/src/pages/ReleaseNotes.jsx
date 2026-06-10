import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const releases = [
  {
    date: "June 10, 2026",
    features: [
      {
        title: "🚀 OpenRouter Multi-Model Mastery (Most Advanced Update Yet)",
        description: "Completely overhauled the core AI engine, granting you access to the world's most powerful frontier models within a single unified interface.",
        bullets: [
          "ChatGPT-Style Model Selector: A gorgeous new dropdown menu allowing instant, mid-conversation switching between leading AI models.",
          "Claude 3.5 Sonnet: Unmatched coding and complex logic capabilities.",
          "GPT-4o & Grok 2: Blisteringly fast reasoning and unfiltered intelligence from OpenAI and xAI.",
          "Smart State Persistence: The platform now securely remembers your preferred model in localStorage across sessions.",
          "Dynamic API Routing: The backend was migrated to OpenRouter's API, natively supporting seamless failovers and multiple architecture providers."
        ]
      },
      {
        title: "Intelligent Video & UI Overhaul",
        description: "Transformed SmartLearn into a comprehensive educational platform with smart video integration and a sleek interface.",
        bullets: [
          "YouTube Data API v3: Added an intelligent LLM-router to detect complex educational queries and fetch relevant YouTube tutorials automatically.",
          "Embedded Player UI: Beautiful, interactive video cards with hover effects, skeletons, and play overlays.",
          "Redesign: Unified the input box into a sleek '+' menu for attachments and web search toggles. User bubbles updated to a refined muted tone."
        ]
      }
    ],
    fixes: [
      "Resolved a critical React runtime crash caused by missing state variables in the Sidebar chat manager.",
      "Fixed a build error caused by deprecated brand icons in the lucide-react library.",
      "Optimized the User Menu to correctly open Release Notes in a new browser tab without interrupting active chat sessions."
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
    ],
    fixes: [
      "Eliminated the 'flash of unstyled content' (FOUC) when loading custom themes from localStorage.",
      "Fixed contrast ratio issues with user chat bubbles in Dark Mode.",
      "Resolved an issue where changing the theme did not immediately update focus rings on input fields."
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
    ],
    fixes: [
      "Fixed persistent timeout errors caused by third-party speech recognition APIs (Deepgram).",
      "Resolved a scrolling bug where the chat window would abruptly jump when generating extremely long LLM responses.",
      "Fixed an edge case where disabling Web Search toggles did not clear the search context correctly."
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
    ],
    fixes: [
      "Fixed fatal SQLite 'database is locked' errors during high-concurrency requests by migrating to Neon DB.",
      "Resolved an issue where expired JWT tokens would silently fail instead of redirecting the user to the login screen.",
      "Fixed SMTP connection drops by properly initializing the TLS context for outbound recovery emails.",
      "Resolved an infinite loading state when the sentence-transformer model initialized on cold starts."
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
    <div className="min-h-screen bg-white text-[#0d0d0d] font-sans selection:bg-black selection:text-white pb-20">
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
                {/* Features Section */}
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

                {/* Bug Fixes Section */}
                {release.fixes && release.fixes.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-[20px] font-semibold tracking-tight">
                      Bug Fixes
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 mt-4 text-[16px] leading-relaxed text-[#333333] marker:text-[#888888]">
                      {release.fixes.map((fix, fixIdx) => (
                        <li key={fixIdx} className="pl-2">{fix}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
