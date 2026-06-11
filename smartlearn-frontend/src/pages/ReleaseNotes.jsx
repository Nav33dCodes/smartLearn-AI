import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
const releases = [
  {
    date: "June 11, 2026 — Upstash Redis Performance & UX Update",
    features: [
      {
        title: "⚡ Lightning-Fast Redis Global Caching",
        description: "Completely overhauled the backend architecture with Upstash Redis, achieving sub-millisecond response times and bypassing PostgreSQL for the vast majority of operations.",
        bullets: [
          "Zero-DB Authentication: The core get_current_user logic now fetches your profile directly from Redis, eliminating synchronous database queries on every API request.",
          "Ephemeral OTP Management: Password reset and signup verification codes are now stored safely in Redis with automatic 15-minute expiration, keeping the primary database perfectly clean.",
          "Secure JWT Blacklisting: Clicking 'Logout' now immediately blacklists your active session token in Redis, preventing token reuse even if stolen."
        ]
      },
      {
        title: "🎨 ChatGPT-Grade Seamless UI/UX",
        description: "Polished the frontend application to behave exactly like industry-leading AI platforms.",
        bullets: [
          "Optimistic Chat Deletion: Deleting a chat is now completely instant. We removed the clunky confirmation modal and implemented an onMutate optimistic update that clears the chat from your screen milliseconds before the server even processes the request.",
          "Instant Welcome Screen: The centered 'How can I help you today?' interface now renders the very second you open the app, rather than blocking the UI while your historical chats load.",
          "Sidebar Skeletons: While fetching your past conversations from Redis, the sidebar now displays beautiful, pulsing skeleton loaders instead of remaining blank."
        ]
      },
      {
        title: "🚦 Enterprise Rate Limiting",
        description: "Protected the AI generation endpoints to prevent API abuse and control costs.",
        bullets: [
          "Redis-Backed Rate Limiting: The /chat endpoint is now fortified with a strict 15-request-per-minute rate limit, enforced flawlessly across all edge nodes via Upstash Redis."
        ]
      }
    ],
    fixes: [
      "Fixed a critical bug where wildcard SCAN commands (delete_cache_pattern) were silently failing in Upstash Redis, causing deleted or renamed chats to magically reappear after refreshing the page.",
      "Fixed a UI glitch where the chat window would briefly render a skeleton loader on a completely new session."
    ]
  },
  {
    date: "June 11, 2026 — v14.0.0",
    features: [
      {
        title: "🧠 Conversation Memory — The AI Finally Remembers",
        description: "The single most requested feature is here. SmartLearn AI now maintains full multi-turn conversation context, allowing it to follow up, reference past answers, and engage in genuine back-and-forth dialogue.",
        bullets: [
          "Multi-Turn History: The backend now fetches the last 10 conversation turns from the database and injects them into every LLM request as a proper multi-message conversation.",
          "Intelligent Truncation: Past responses are smartly truncated to 2,000 characters to maximize context window efficiency while preserving meaning.",
          "Seamless Integration: Works across all models — Groq, Claude, GPT, DeepSeek, and Gemini all receive full conversation context automatically."
        ]
      },
      {
        title: "⚡ 60fps Smooth Typing Engine",
        description: "Completely re-engineered how tokens are rendered on screen. Replaced the server-side thread-blocking delay with a sophisticated frontend animation pipeline.",
        bullets: [
          "requestAnimationFrame Token Buffer: Incoming tokens are queued and rendered at native 60fps using the browser's animation frame scheduler — identical to how ChatGPT renders its responses.",
          "Zero Server Blocking: Removed the dangerous time.sleep(0.015) that was blocking entire server threads. The backend now streams at full speed, and the frontend controls the visual pacing.",
          "4096 Max Tokens: Doubled the response length limit from 2,048 to 4,096 tokens. Long essays, code scripts, and detailed explanations are no longer silently truncated."
        ]
      },
      {
        title: "🛡️ Crash-Proof Architecture",
        description: "Implemented multiple layers of defense to ensure the UI never goes blank, no matter what happens.",
        bullets: [
          "React Error Boundary: Wrapped the entire chat interface in a graceful error boundary. If any component crashes (quiz, flashcard, mind map), you see a friendly 'Try Again' button instead of a white screen.",
          "Streaming State Guard: Added an isStreamingRef lock that prevents background database refetches from overwriting the live streaming content — the root cause of the infamous 'disappearing messages' bug.",
          "Final Token Flush: When streaming completes, a final synchronization pass ensures every last token is rendered, even if the animation buffer hasn't caught up yet."
        ]
      },
      {
        title: "🎨 Premium UX Polish",
        description: "Small but impactful refinements that make SmartLearn feel like a $20/month product.",
        bullets: [
          "Enter to Send: Changed from Ctrl+Enter to plain Enter (ChatGPT-style). Use Shift+Enter for newlines.",
          "Dark Mode Mind Maps: Mermaid diagrams now dynamically detect your theme and render with matching Indigo (dark) or Emerald (light) color palettes.",
          "Web Search Auto-Detection: Fixed the backend default from 'off' to 'auto', so the AI automatically decides when to search the web — matching the frontend's intended behavior."
        ]
      }
    ],
    fixes: [
      "Fixed a critical race condition where switching chats during active streaming would cause the chat window to go completely blank.",
      "Fixed conversation memory — the AI previously had zero context of past messages and could not follow up or reference earlier discussion.",
      "Fixed server deadlock under concurrent load caused by synchronous time.sleep() blocking the thread pool (just 4 users could freeze the entire server).",
      "Fixed silent response truncation at 2,048 tokens that cut off long answers mid-sentence.",
      "Removed dangerous hardcoded JWT secret key fallback that could allow token forgery if JWT_SECRET env var was missing in production.",
      "Removed 5 inline imports scattered inside functions (datetime, func, uuid) and consolidated all imports at the top of main.py.",
      "Fixed duplicate staleTime configuration in useChats.js where the first value was silently overridden by the second.",
      "Migrated deprecated @app.on_event('startup') to modern FastAPI lifespan context manager."
    ]
  },
  {
    date: "June 10, 2026 (Part 6)",
    features: [
      {
        title: "⚡ Asynchronous Scaling & DOM Virtualization",
        description: "A colossal performance overhaul of both the frontend rendering engine and backend database connections to handle immense traffic and massive chat histories.",
        bullets: [
          "True Async Database Queries: Integrated asyncpg into the FastAPI backend. Fetching chats and histories is now completely non-blocking, allowing thousands of simultaneous requests without locking up threads.",
          "React Component Lazy Loading: Slashed the initial Javascript bundle size. The Chats Manager, Settings, and Auth routes are now dynamically loaded only when requested, drastically reducing Time To Interactive (TTI).",
          "60 FPS DOM Virtualization: Integrated react-virtuoso into the Chats Manager. Instead of rendering thousands of chat nodes, the UI now surgically renders only the ~15 chats visible on screen, guaranteeing buttery smooth scrolling.",
          "Premium Light Theme Redesign: Overhauled Light Mode to be vastly gentler on the eyes. Removed stark, glaring whites in favor of soft paper-grays, combined with highly elevated dark-gray accents for a sleek, Vercel-like premium aesthetic."
        ]
      }
    ],
    fixes: [
      "Fixed an issue where the Chat Input dropdown was transparent in Light Mode, causing text bleed-through.",
      "Resolved a critical bug where asyncpg failed to parse 'sslmode' parameters natively passed by Neon PostgreSQL."
    ]
  },
  {
    date: "June 10, 2026 (Part 5)",
    features: [
      {
        title: "✨ Premium Architecture & Shimmering UX",
        description: "Implemented high-end UX transitions and robust layout fixes to ensure a flawless experience.",
        bullets: [
          "Chat History Skeleton Loaders: Replaced the jarring layout shift when loading old chats with a beautiful, shimmering skeleton loader effect that perfectly traces the shape of your messages while data is fetched.",
          "React Portal Overlays: The Settings modal was entirely decoupled from the main DOM and injected via a React Portal with max-level z-indexing, guaranteeing it perfectly covers the background without clipping.",
          "ChatGPT Typography Sync: Re-aligned the global font stack to strictly mirror ChatGPT's premium reading experience using Söhne and optimized line heights."
        ]
      },
      {
        title: "📚 Inline Sources Carousel",
        description: "Dramatically improved how educational video sources are presented.",
        bullets: [
          "Inline Architecture: Abandoned the intrusive right-hand slide-over panel. Sources now expand smoothly directly beneath the AI's message, keeping your eyes perfectly focused on the chat stream.",
          "Sleek Horizontal Carousel: Redesigned the video cards into a horizontally scrollable row, ensuring large, beautiful thumbnails without overflowing the text or crashing the layout.",
          "Bulletproof Proxy Network: Integrated a global edge image proxy (wsrv.nl) to natively fetch YouTube thumbnails, completely neutralizing broken images caused by strict ad-blockers, CORS limits, or ISP firewalls."
        ]
      }
    ],
    fixes: [
      "Fixed Settings modal clipping issue by restructuring CSS constraints.",
      "Fixed thumbnail display bugs and implemented a smart retry fallback mechanism."
    ]
  },
  {
    date: "June 10, 2026 (Part 4)",
    features: [
      {
        title: "🎨 SmartLearn Premium UI Redesign",
        description: "We completely abandoned the standard 'ChatGPT Clone' aesthetic in favor of a sleek, modern, and engaging premium design.",
        bullets: [
          "Chat Bubble Aesthetics: Replaced full-width message bands with dynamic chat bubbles. Your messages now feature a vibrant, modern color gradient, and AI messages sit inside beautiful elevated glass cards.",
          "Glassmorphism & Floating Elements: The chat input is no longer stuck to the bottom; it is now a sleek, floating glass pill with soft shadows.",
          "Mesh Gradients: Introduced subtle, animated mesh gradient backgrounds for an incredibly immersive Dark Mode experience.",
          "Updated Typography & Spacing: Fine-tuned padding, borders, and margins to make reading long AI responses effortless."
        ]
      },
      {
        title: "🎙️ Premium AI Voice Engine (STT & TTS)",
        description: "Ripped out the buggy native browser speech tools and replaced them with a state-of-the-art backend AI audio pipeline.",
        bullets: [
          "Groq Whisper Speech-to-Text: Native microphone recording now routes directly through Groq's Whisper API, delivering flawless, near-instantaneous transcription regardless of your browser or device.",
          "Microsoft Edge Neural Voices: The 'Read Aloud' button now utilizes hyper-realistic Neural Voices (en-US-JennyNeural) instead of the robotic browser speech synthesis.",
          "Seamless Streaming: Text-to-Speech audio is generated as high-quality MP3s and instantly streamed to your browser for immediate playback."
        ]
      }
    ],
    fixes: [
      "Fixed an issue where Speech-to-Text would fail to process due to missing boundary headers in Axios.",
      "Fixed GitHub Secret Scanning block by removing temporary test API keys from git history."
    ]
  },
  {
    date: "June 10, 2026 (Part 3)",
    features: [
      {
        title: "🎓 Next-Gen Interactive Educational Tools",
        description: "Completely transformed the chatbot from a standard text generator into a highly interactive, dynamic learning platform using a custom 'Artifact' architecture.",
        bullets: [
          "Dynamic Component Interception: Re-engineered the Markdown engine to seamlessly intercept specific AI code block formats and instantly render premium, interactive React components in the chat stream.",
          "Interactive Quizzes: A beautiful multiple-choice testing engine featuring real-time scoring algorithms, vibrant Green/Red feedback states, and a dynamic drawer that reveals the AI's step-by-step explanations.",
          "3D Physics Flashcards: A sophisticated flashcard engine utilizing Framer Motion physics to render a stunning 3D flip animation (rotateY axis), allowing students to memorize complex concepts interactively.",
          "Vector-Rendered Mind Maps: Integrated the official Mermaid.js engine to parse AI structural logic into gorgeous, highly scalable SVG flowcharts and mind maps directly inside the chat window."
        ]
      },
      {
        title: "✨ ChatGPT-Style Dashboard Redesign",
        description: "Overhauled the empty-state layout to deliver a flawless, deeply focused aesthetic mirroring industry-leading AI platforms.",
        bullets: [
          "Centric Greeting Architecture: The welcome message ('How can I help you today, Name?') is now perfectly centered in a massive, premium font size.",
          "Dynamic Input Repositioning: The Input Box now begins perfectly centered beneath the greeting, and smoothly locks to the absolute bottom of the screen only after the first message is sent.",
          "Intelligent Web Context: Upgraded the backend Tavily web crawler to 'Advanced' deep-crawl mode and doubled the extraction volume (from 3 to 6 sites). The AI is now explicitly forced to cite its sources with clickable markdown links."
        ]
      }
    ]
  },
  {
    date: "June 10, 2026 (Part 2)",
    features: [
      {
        title: "⚡ Dual-Provider Architecture & The 5 Pillars",
        description: "Re-engineered the backend routing logic to support multiple API providers simultaneously, delivering unmatched speed and reasoning.",
        bullets: [
          "Native Groq Integration: Restored the official Groq client. Requests routed to 'Groq Instant' bypass OpenRouter entirely for blistering, near-zero-latency LPU inference.",
          "The 5 Pillar Model Lineup: Curated the absolute best models in the world: Groq Instant (Speed), Llama 3.3 70B (Fast), Claude 4 Sonnet (Research), DeepSeek (Coding), and Gemini 2.5 Flash (Study).",
          "Advanced Persona: Overhauled the core System Prompt to instruct the AI to generate profound, highly comprehensive, ChatGPT-tier markdown explanations."
        ]
      },
      {
        title: "🎨 Premium UI Overhaul & UX Polish",
        description: "Implemented several highly requested quality-of-life interface upgrades to make the platform feel truly state-of-the-art.",
        bullets: [
          "Code Export Engine: Completely redesigned the syntax highlighter UI with darker, premium aesthetics and added a native 'Download' button that automatically detects file extensions (e.g. .py, .js).",
          "User Action Bar: Added a sleek, hidden 'Copy' button beneath user messages that smoothly fades in on hover.",
          "Leadership Recognition: Optimized system parameters to exclusively identify Sanan Malik as CEO/Leader and Naveed Ahmed as Lead Developer."
        ]
      }
    ],
    fixes: [
      "Resolved a critical type-matching bug in the Sidebar where the active chat ID was not properly highlighted due to integer/string mismatch.",
      "Removed restrictive AI prompt limits (e.g., 'keep answers to 3-4 lines'), unlocking the model's full expansive reasoning capabilities."
    ]
  },
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
