import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
const releases = [
  {
    date: "June 12, 2026 — UI Mechanics & Premium Aesthetics (Phase 5)",
    features: [
      {
        title: "Premium Data Tables",
        description: "Completely overhauled the Markdown table rendering engine to deliver a highly polished, analytical aesthetic without requiring heavy third-party libraries.",
        bullets: [
          "OLED Glassmorphism: Tables now render inside beautifully rounded, translucent dark glass containers with glowing borders.",
          "Smart Pill Badges: Built an intelligent regex engine that automatically detects common analytical terms (e.g., 'Fast', 'Slow', 'Yes', 'No', 'High', 'Low') inside table cells and upgrades them into colored, glowing pill badges.",
          "Code Block Pre-processor: Engineered a custom data sanitizer that automatically intercepts and strips out AI-hallucinated markdown wrappers, ensuring your tables never render as raw code strings.",
          "Sticky Architecture: Implemented sticky headers and custom horizontal scrollbars to ensure massive datasets remain perfectly readable on both desktop and mobile screens."
        ]
      },
      {
        title: "Smart Auto-Scroll Locking",
        description: "Solved one of the most frustrating UX problems in modern AI chatbots by decoupling the scrollbar from the live generation stream.",
        bullets: [
          "Velocity Detection: If the AI is generating a massive essay and you try to scroll up to read the top, the UI instantly detects your scroll velocity and severs the auto-scroll connection, letting you read in peace without violently jerking you back down.",
          "Instant Re-engagement: Simply scrolling back down to the bottom of the chat instantly re-locks the scrollbar to the live stream.",
          "Active Stream Indicator: Added a glowing, pulsing red indicator to the floating 'Scroll to Bottom' button to let you know the AI is still typing off-screen while you read."
        ]
      },
      {
        title: "Dynamic Input Controls",
        description: "Upgraded the chat input mechanics to feel infinitely smoother and more responsive during generation.",
        bullets: [
          "Morphing Stop Button: The standard 'Send' button now dynamically morphs into a sleek, square 'Stop Generating' button the exact millisecond the AI begins typing, identical to ChatGPT's production UI.",
          "Removed Clutter: Deleted the redundant floating 'Stop generating' text button that previously sat awkwardly above the input box."
        ]
      }
    ]
  },
  {
    date: "June 12, 2026 — Enterprise Fallback Architecture & Stability (Phase 4)",
    features: [
      {
        title: "Bulletproof Backend Routing",
        description: "Completely re-engineered the AI routing system to eliminate rate limit crashes and network timeouts.",
        bullets: [
          "Zero-Downtime Cascade: The 'SmartLearn Auto' route now dynamically bounces between 7 different elite AI models (including Llama 3.3 70B, Gemini 2.5 Flash, and DeepSeek R1). If one provider hits a rate limit or crashes, it instantly jumps to the next without interrupting your chat.",
          "Mid-Stream Crash Protection: Fixed a critical bug where the UI would severely corrupt if a model disconnected mid-sentence. The system now meticulously tracks data packets and aborts gracefully if the network drops.",
          "Timeout Paralysis Fix: Radically reduced the API network timeout from 45 seconds down to 15 seconds, preventing the entire app from freezing if a third-party server goes completely offline."
        ]
      },
      {
        title: "Memory Overflow Sanitization",
        description: "Hardened the context window injection limits to protect smaller fallback models.",
        bullets: [
          "Historical Truncation: Both past AI responses and past user prompts are now strictly bounded to 2000 characters when passed into the AI's multi-turn memory. This ensures massive text dumps in the past won't accidentally crash the AI's limited context window today."
        ]
      },
      {
        title: "Public Launch Readiness",
        description: "Hardened the backend configuration and sanitized all diagnostic output for a professional public release.",
        bullets: [
          "Hot-Reload Environments: Upgraded the Python backend to aggressively override cached memory when the `.env` file changes. Pasting new API keys no longer requires a hard server reboot; they are instantly recognized on hot-reload.",
          "Sanitized Diagnostics: Stripped out all developer-facing stack traces, HTTP codes (e.g., 401, 429), and internal secrets from the chat UI. Errors are now presented as highly polished, consumer-friendly messages identical to ChatGPT and Gemini's production environments.",
          "Strict Route Enforcement: When explicitly selecting a native model (like Groq or Gemini) from the UI, the backend will now strictly obey your choice without falling back to third-party routers, ensuring predictable behavior."
        ]
      }
    ]
  },
  {
    date: "June 12, 2026 — UI Simplification & State Synchronization (Phase 3)",
    features: [
      {
        title: "Cross-Tab State Synchronization",
        description: "Fixed a critical architectural bug where long-running AI streams (like Mind Maps) would infinitely spin if the browser connection dropped or the user switched tabs.",
        bullets: [
          "Auto-Recovery System: The React frontend now silently triggers a background database fetch the moment a stream finishes or disconnects, instantly healing the UI state with the final generated result.",
          "Window Focus Syncing: Switching back to an old tab now instantly forces the chat to sync with the backend, allowing users to start massive generations in one tab and view the results perfectly in another without infinite loading spinners."
        ]
      },
      {
        title: "Flashcard Engine V2 & 3D Aesthetics",
        description: "Completely overhauled the Flashcard rendering engine to be mathematically robust and visually stunning.",
        bullets: [
          "Robust Markdown Parser: Built a custom data sanitizer that automatically strips out LLM-hallucinated markdown blocks (e.g. ```json) before parsing, permanently fixing the infinite loading bug.",
          "OLED & 3D Overhaul: Restyled the flashcards to match the premium OLED Black and Red aesthetic. Engineered a pure CSS 3D perspective transform to make the cards flip exactly like physical glass."
        ]
      },
      {
        title: "Minimalist Interface Streamlining",
        description: "Stripped out bulky UI elements in favor of a hyper-professional, ultra-minimalist aesthetic inspired by Gemini and Apple.",
        bullets: [
          "Sleek Model Selector: Replaced the massive, text-heavy model dropdown with a highly compact, dark glass pill that only shows the essential icon and name.",
          "Professional Status Indicators: Ripped out the bubbly, animated 'Thinking' and 'Searching Web' pills. The AI's status is now displayed as elegant, distraction-free muted text next to the logo.",
          "Compact Attachment Menu: Condensed the '+' attachment menu into a razor-sharp horizontal list, stripping out unnecessary borders and uppercase headers."
        ]
      }
    ]
  },
  {
    date: "June 12, 2026 — Architecture Redesign & UX Overhaul (Phase 2)",
    features: [
      {
        title: "Native Gemini 2.5 Integration",
        description: "Bypassed third-party routers by securely wiring the backend directly into Google's newest v1beta generative AI endpoints.",
        bullets: [
          "Zero-Cost Deep Context: Students can now access Google's massive 2-Million token context window (Gemini 2.5 Pro & Flash) completely for free using native API keys.",
          "Mathematical Fallback Cascade: Architected an elite fallback router that silently catches API rate limits and OpenRouter credit exhaustion, seamlessly cascading your query down to free engines like Groq or Gemini without interrupting your chat."
        ]
      },
      {
        title: "Premium Interface Redesign",
        description: "Completely overhauled the chat interface to deliver an ultra-premium, distraction-free learning environment.",
        bullets: [
          "Minimalist Model Selector: Removed the bulky top-header dropdown. The active model is now elegantly displayed as simple text in the bottom right of the chat box, expanding upwards into a beautiful glassmorphic menu when clicked.",
          "IDE-Grade Code Blocks: Code snippets now render with a Mac OS-style window frame, featuring red/yellow/green window dots, 'backdrop-blur' glassmorphic headers, and always-on line numbers.",
          "Elite Typography: Code blocks now utilize the 'JetBrains Mono' and 'Fira Code' font stacks for perfect legibility and gorgeous programming ligatures."
        ]
      }
    ]
  },
  {
    date: "June 12, 2026 — Advanced Educational Features (Phase 1)",
    features: [
      {
        title: "Interactive Drag-and-Drop Mind Maps",
        description: "The AI can now instantly visualize complex topics by generating highly interactive, drag-and-drop mind maps directly inside the chat.",
        bullets: [
          "React Flow Integration: Leveraged the powerful @xyflow/react engine to render smooth, scalable node graphs.",
          "Automatic Layout Engine: Intercepts raw JSON data from the AI and uses Dagre to mathematically calculate the perfect hierarchical layout before rendering.",
          "Interactive Canvas: Students can pan, zoom, and drag concepts around the screen to better understand relationships."
        ]
      },
      {
        title: "Textbook-Quality Math & Science Rendering",
        description: "Completely overhauled how the platform handles mathematics, physics, and complex formulas.",
        bullets: [
          "KaTeX Integration: Integrated rehype-katex and remark-math into the markdown pipeline.",
          "Seamless Inline Math: Instantly transforms raw LaTeX syntax (like $$E=mc^2$$) into beautiful, textbook-quality equations that look exactly like a printed textbook.",
          "Zero-Jank Rendering: Math rendering happens instantly during the streaming response with zero layout shift."
        ]
      },
      {
        title: "Database Reliability Upgrades",
        description: "Architected a much more resilient database connection pool to eliminate dropped websocket streams.",
        bullets: [
          "TCP Keepalives: Injected strict TCP keepalive packets and idle connection recycling into the SQLAlchemy async engine, permanently fixing the 'unexpected EOF' SSL errors when fetching from Neon PostgreSQL."
        ]
      }
    ]
  },
  {
    date: "June 11, 2026 — Advanced AI Architecture & Premium UI Overhaul",
    features: [
      {
        title: "Enterprise-Grade Fallback Routing",
        description: "Built a mathematically flawless, multi-tier fallback architecture to guarantee 100% chat uptime.",
        bullets: [
          "Native API Prioritization: The system now correctly prioritizes 100% free, direct API endpoints (like Groq) before seamlessly failing over to paid OpenRouter nodes.",
          "Automatic Failover Protocol: If a model crashes or hits rate limits, the Python backend intercepts the HTTP 500 error and transparently redirects the prompt to a secondary tier model (e.g., 70B to 8B) without the user ever noticing.",
          "Dynamic Intelligence Router: Integrated an 'Auto' engine which uses a fast classifier to evaluate prompt complexity before routing, slashing API costs by avoiding heavy models for simple tasks."
        ]
      },
      {
        title: "Gemini Advanced-Style UI Components",
        description: "Completely overhauled key interface components to match the aesthetics of industry giants like Google and Vercel.",
        bullets: [
          "Premium Model Selector: Moved the model selector to the top-left header and redesigned it to match Gemini Advanced. Features include a spacious glassmorphic dropdown, rounded-3xl borders, and dynamic circular glowing icons for active states.",
          "Vercel-Inspired 'About' Section: Transformed the generic About modal into a massive, centered 'Hero' card featuring subtle gradient glows, tracking-widened version badges, and an elegant terminal-style 'Copy Email' container."
        ]
      }
    ]
  },
  {
    date: "June 11, 2026 — Premium Landing Page Redesign",
    features: [
      {
        title: "Premium Minimalist Aesthetic",
        description: "Completely reimagined the landing page to deliver a sleeker, high-end, and uncluttered experience.",
        bullets: [
          "Pricing Architecture: Stripped out the messy blur overlays and ping animations on the Founder's Edition card, replacing them with a crisp, ultra-premium layout featuring razor-thin gradients and clean Waitlist badges.",
          "Leadership Cards: Removed the visually overwhelming background graphics and icons from the team cards, achieving a much cleaner and professional look."
        ]
      },
      {
        title: "60fps Scroll Optimization",
        description: "Drastically improved rendering performance for low-end devices and laptops.",
        bullets: [
          "GPU Offloading: Removed the heavy, GPU-intensive background gradient blurs, resulting in buttery smooth scrolling and zero frame drops."
        ]
      },
      {
        title: "Unified Web Navigation",
        description: "Ensured seamless access to important updates and pages directly from the main website.",
        bullets: [
          "Added the Release Notes link to the main top navigation header for immediate visibility.",
          "Fixed all broken routing links across the Hero section and Footer.",
          "Integrated a seamless 'Back to Home' navigation button directly within the Release Notes page."
        ]
      }
    ]
  },
  {
    date: "June 11, 2026 — Upstash Redis Performance & UX Update",
    features: [
      {
        title: "Lightning-Fast Redis Global Caching",
        description: "Completely overhauled the backend architecture with Upstash Redis, achieving sub-millisecond response times and bypassing PostgreSQL for the vast majority of operations.",
        bullets: [
          "Zero-DB Authentication: The core logic now fetches your profile directly from Redis, eliminating synchronous database queries on every API request.",
          "Ephemeral OTP Management: Password reset and signup verification codes are now stored safely in Redis with automatic 15-minute expiration.",
          "Secure JWT Blacklisting: Clicking 'Logout' now immediately blacklists your active session token in Redis, preventing token reuse even if stolen."
        ]
      },
      {
        title: "Seamless UI/UX Integration",
        description: "Polished the frontend application to behave with industry-leading responsiveness.",
        bullets: [
          "Optimistic Chat Deletion: Deleting a chat is now completely instant. Implemented an optimistic update that clears the chat from your screen milliseconds before the server even processes the request.",
          "Instant Welcome Screen: The centered interface now renders immediately upon opening the app, rather than blocking the UI while historical chats load.",
          "Sidebar Skeletons: While fetching past conversations, the sidebar now displays beautiful, pulsing skeleton loaders."
        ]
      },
      {
        title: "Enterprise Rate Limiting",
        description: "Protected the AI generation endpoints to prevent API abuse and control costs.",
        bullets: [
          "Redis-Backed Rate Limiting: The generation endpoints are now fortified with strict rate limits, enforced flawlessly across all edge nodes via Upstash Redis."
        ]
      }
    ],
    fixes: [
      "Fixed a critical bug where wildcard SCAN commands were silently failing in Upstash Redis, causing deleted or renamed chats to reappear after refreshing the page.",
      "Fixed a UI glitch where the chat window would briefly render a skeleton loader on a completely new session."
    ]
  },
  {
    date: "June 11, 2026 — Core Engine & Conversation Memory",
    features: [
      {
        title: "Conversation Memory Context",
        description: "SmartLearn AI now maintains full multi-turn conversation context, allowing it to follow up, reference past answers, and engage in genuine back-and-forth dialogue.",
        bullets: [
          "Multi-Turn History: The backend now fetches the last 10 conversation turns from the database and injects them into every LLM request.",
          "Intelligent Truncation: Past responses are smartly truncated to 2,000 characters to maximize context window efficiency while preserving meaning.",
          "Seamless Integration: Works across all models automatically."
        ]
      },
      {
        title: "60fps Smooth Typing Engine",
        description: "Completely re-engineered how tokens are rendered on screen. Replaced the server-side thread-blocking delay with a sophisticated frontend animation pipeline.",
        bullets: [
          "Native Render Frame Pipeline: Incoming tokens are queued and rendered at native 60fps using the browser's animation frame scheduler.",
          "Zero Server Blocking: Removed synchronous blocking delays. The backend now streams at full speed, and the frontend controls the visual pacing.",
          "Expanded Token Limits: Doubled the response length limit from 2,048 to 4,096 tokens. Long essays, code scripts, and detailed explanations are no longer silently truncated."
        ]
      },
      {
        title: "Crash-Proof Architecture",
        description: "Implemented multiple layers of defense to ensure the UI maintains stability during adverse events.",
        bullets: [
          "React Error Boundary: Wrapped the entire chat interface in a graceful error boundary. If any component crashes, the UI presents a recovery mechanism.",
          "Streaming State Guard: Added strict state locks that prevent background database refetches from overwriting the live streaming content.",
          "Final Token Flush: When streaming completes, a final synchronization pass ensures every last token is rendered perfectly."
        ]
      },
      {
        title: "Premium UX Polish",
        description: "Small but impactful refinements that elevate the overall user experience.",
        bullets: [
          "Keyboard Navigation: Standardized 'Enter to Send' logic. Use Shift+Enter for newlines.",
          "Dark Mode Flowcharts: Structural diagrams now dynamically detect your theme and render with matching deep color palettes.",
          "Web Search Auto-Detection: Fixed the backend default to 'auto', allowing the AI to automatically decide when to search the web."
        ]
      }
    ],
    fixes: [
      "Fixed a critical race condition where switching chats during active streaming would cause the chat window to crash.",
      "Resolved conversation memory limitations, enabling the AI to retain contextual continuity.",
      "Eliminated server deadlocks under concurrent load by replacing synchronous delays with asynchronous non-blocking event loops.",
      "Fixed silent response truncation issues on outputs exceeding 2,048 tokens.",
      "Removed dangerous hardcoded secret key fallbacks to strictly enforce environment variable security.",
      "Consolidated global imports to improve initialization times.",
      "Fixed duplicate cache configurations where properties were being silently overridden.",
      "Migrated deprecated startup event handlers to modern ASGI lifespan context managers."
    ]
  },
  {
    date: "June 10, 2026 — Asynchronous Scalability & Virtualization",
    features: [
      {
        title: "Asynchronous Scaling & DOM Virtualization",
        description: "A colossal performance overhaul of both the frontend rendering engine and backend database connections to handle immense traffic and massive chat histories.",
        bullets: [
          "True Async Database Queries: Integrated native async drivers into the FastAPI backend. Fetching chats and histories is now completely non-blocking.",
          "React Component Lazy Loading: Slashed the initial Javascript bundle size. Secondary routes are now dynamically loaded only when requested, drastically reducing Time To Interactive (TTI).",
          "60 FPS DOM Virtualization: Integrated a virtualized scrolling engine into the Chats Manager. Instead of rendering thousands of chat nodes, the UI now surgically renders only the elements visible on screen.",
          "Premium Light Theme Redesign: Overhauled Light Mode to be vastly gentler on the eyes, utilizing elevated dark-gray accents for a sleek aesthetic."
        ]
      }
    ],
    fixes: [
      "Fixed an issue where the Chat Input dropdown suffered from transparent text bleed-through in Light Mode.",
      "Resolved a critical bug where the database engine failed to parse native SSL parameters passed by the connection pool."
    ]
  },
  {
    date: "June 10, 2026 — Premium UI Architecture",
    features: [
      {
        title: "Premium Architecture & Shimmering UX",
        description: "Implemented high-end UX transitions and robust layout fixes to ensure a flawless experience.",
        bullets: [
          "Chat History Skeleton Loaders: Replaced layout shifts when loading old chats with a beautiful, shimmering skeleton loader effect that traces the shape of your messages.",
          "React Portal Overlays: Settings modals are decoupled from the main DOM and injected via a React Portal, guaranteeing perfect z-index layering.",
          "Typography Synchronization: Re-aligned the global font stack to strictly mirror premium reading experiences using optimized line heights."
        ]
      },
      {
        title: "Inline Sources Carousel",
        description: "Dramatically improved how educational video sources are presented.",
        bullets: [
          "Inline Architecture: Sources now expand smoothly directly beneath the AI's message, keeping your eyes perfectly focused on the chat stream.",
          "Sleek Horizontal Carousel: Redesigned the video cards into a horizontally scrollable row, ensuring large, beautiful thumbnails.",
          "Bulletproof Proxy Network: Integrated a global edge image proxy to natively fetch media thumbnails securely."
        ]
      }
    ],
    fixes: [
      "Fixed modal clipping issues by restructuring CSS constraints.",
      "Fixed thumbnail display bugs and implemented a smart retry fallback mechanism."
    ]
  },
  {
    date: "June 10, 2026 — AI Voice Engine & Aesthetics",
    features: [
      {
        title: "SmartLearn Premium UI Redesign",
        description: "Re-engineered the aesthetic framework in favor of a sleek, modern, and engaging premium design.",
        bullets: [
          "Dynamic Chat Bubble Aesthetics: Replaced full-width message bands with dynamic chat bubbles featuring refined color gradients and elevated glass cards.",
          "Glassmorphism & Floating Elements: The chat input is a sleek, floating glass pill with soft shadows.",
          "Mesh Gradients: Introduced subtle, animated mesh gradient backgrounds for an incredibly immersive Dark Mode experience.",
          "Updated Typography & Spacing: Fine-tuned padding, borders, and margins to make reading long AI responses effortless."
        ]
      },
      {
        title: "Premium AI Voice Engine (STT & TTS)",
        description: "Replaced native browser speech tools with a state-of-the-art backend AI audio pipeline.",
        bullets: [
          "High-Fidelity Speech-to-Text: Native microphone recording now routes directly through robust AI transcription engines for flawless dictation.",
          "Neural Voice Synthesis: The Text-to-Speech system utilizes hyper-realistic Neural Voices for natural playback.",
          "Seamless Streaming: Audio is generated as high-quality MP3s and instantly streamed to the browser."
        ]
      }
    ],
    fixes: [
      "Fixed an issue where Speech-to-Text would fail to process due to missing boundary headers.",
      "Fortified repository security by removing temporary test API keys from version history."
    ]
  },
  {
    date: "June 10, 2026 — Interactive Educational Engine",
    features: [
      {
        title: "Next-Gen Interactive Educational Tools",
        description: "Completely transformed the chatbot from a standard text generator into a highly interactive, dynamic learning platform using a custom component architecture.",
        bullets: [
          "Dynamic Component Interception: Re-engineered the Markdown engine to seamlessly intercept specific AI code formats and instantly render premium, interactive React components.",
          "Interactive Quizzes: A multiple-choice testing engine featuring real-time scoring algorithms and dynamic step-by-step explanations.",
          "3D Physics Flashcards: A sophisticated flashcard engine utilizing physics-based 3D flip animations, allowing students to memorize complex concepts interactively.",
          "Vector-Rendered Mind Maps: Integrated robust engines to parse AI structural logic into gorgeous, highly scalable SVG flowcharts."
        ]
      },
      {
        title: "Focused Dashboard Experience",
        description: "Overhauled the empty-state layout to deliver a flawless, deeply focused aesthetic.",
        bullets: [
          "Centric Greeting Architecture: The welcome message is perfectly centered in a premium, readable format.",
          "Dynamic Input Repositioning: The Input Box begins centered and smoothly transitions to the absolute bottom of the screen after the first interaction.",
          "Intelligent Web Context: Upgraded the backend crawler to advanced deep-crawl mode, doubling extraction volume and enforcing rigorous source citation."
        ]
      }
    ]
  },
  {
    date: "June 10, 2026 — Multi-Provider Routing Integration",
    features: [
      {
        title: "Dual-Provider Architecture",
        description: "Re-engineered the backend routing logic to support multiple API providers simultaneously, delivering unmatched speed and reasoning.",
        bullets: [
          "Native Low-Latency Integration: Restored dedicated client access for blistering, near-zero-latency LPU inference.",
          "The Five Pillar Model Lineup: Curated the absolute best models covering speed, deep reasoning, coding, and dynamic logic.",
          "Advanced Persona Engineering: Overhauled the core System Prompt to instruct the AI to generate profound, highly comprehensive markdown explanations."
        ]
      },
      {
        title: "Premium Workflow Polish",
        description: "Implemented several highly requested quality-of-life interface upgrades to make the platform feel truly state-of-the-art.",
        bullets: [
          "Code Export Engine: Completely redesigned the syntax highlighter UI with darker, premium aesthetics and added a native Download button that automatically detects file extensions.",
          "User Action Bar: Added a sleek, hidden Copy button beneath user messages that smoothly fades in on hover.",
          "System Recognition: Optimized parameters to exclusively identify foundational team members."
        ]
      }
    ],
    fixes: [
      "Resolved a critical type-matching bug in the Sidebar where active states were not properly highlighted due to data-type mismatches.",
      "Removed restrictive AI prompt limits, unlocking the model's full expansive reasoning capabilities."
    ]
  },
  {
    date: "June 10, 2026 — Unified API Mastery",
    features: [
      {
        title: "OpenRouter Multi-Model Mastery",
        description: "Completely overhauled the core AI engine, granting access to the world's most powerful frontier models within a single unified interface.",
        bullets: [
          "Premium Model Selector: A gorgeous dropdown menu allowing instant, mid-conversation switching between leading AI models.",
          "State Persistence: The platform securely remembers your preferred model across sessions.",
          "Dynamic API Routing: The backend was migrated to a unified API, natively supporting seamless failovers and dynamic architecture providers."
        ]
      },
      {
        title: "Intelligent Video & UI Overhaul",
        description: "Transformed the application into a comprehensive educational platform with smart video integration and a sleek interface.",
        bullets: [
          "Automated Video Retrieval: Added an intelligent router to detect complex educational queries and fetch relevant tutorials automatically.",
          "Embedded Player UI: Beautiful, interactive video cards with hover effects, skeletons, and play overlays.",
          "Unified Control Surface: Redesigned the input box into a sleek menu for attachments and web search toggles."
        ]
      }
    ],
    fixes: [
      "Resolved a critical React runtime crash caused by missing state variables in the Sidebar manager.",
      "Fixed a build error caused by deprecated brand icon dependencies.",
      "Optimized the User Menu to correctly open external links without interrupting active chat sessions."
    ]
  },
  {
    date: "June 2, 2026 — Dynamic Theming",
    features: [
      {
        title: "Dynamic Theming & Aesthetics",
        description: "A complete visual upgrade allowing for unparalleled personalization and sophistication.",
        bullets: [
          "Accent Color Customization: Select your preferred primary color from the new Appearance settings.",
          "Real-time CSS Variables: Instant, zero-flicker global theme application.",
          "Global Typography Upgrade: Full overhaul to utilize optimized, highly legible font stacks."
        ]
      }
    ],
    fixes: [
      "Eliminated the flash of unstyled content (FOUC) when loading custom themes.",
      "Fixed contrast ratio issues with user chat bubbles in Dark Mode.",
      "Resolved an issue where changing the theme did not immediately update focus rings on input fields."
    ]
  },
  {
    date: "May 25, 2026 — Search & Speech Infrastructure",
    features: [
      {
        title: "Search & Speech Enhancements",
        description: "Brought real-time knowledge and native voice dictation to your fingertips.",
        bullets: [
          "Real-Time Web Integration: Integrated live web search directly into the context window for up-to-date knowledge retrieval.",
          "Native Dictation Migration: Replaced third-party speech providers with native browser speech recognition for faster, local audio dictation.",
          "Smooth Auto-Scroll: Implemented fluid scrolling during AI streaming and message generation."
        ]
      }
    ],
    fixes: [
      "Fixed persistent timeout errors caused by third-party speech recognition APIs.",
      "Resolved a scrolling bug where the chat window would abruptly jump when generating extremely long LLM responses.",
      "Fixed an edge case where disabling Web Search toggles did not clear the search context correctly."
    ]
  },
  {
    date: "May 10, 2026 — Core Database Architecture",
    features: [
      {
        title: "Core Infrastructure & Auth",
        description: "A massive foundational upgrade for scale, speed, and security.",
        bullets: [
          "Serverless Database Migration: Migrated backend to a highly scalable serverless cluster for robust data retention and instant cold starts.",
          "Advanced Inference Integration: Swapped to ultra-low latency endpoints for lightning-fast token generation.",
          "Advanced Security Posture: Implemented secure token-based authentication with encrypted password hashing.",
          "SMTP Email Verification: Added robust email verification systems for account recovery and privacy management."
        ]
      }
    ],
    fixes: [
      "Fixed fatal database lock errors during high-concurrency requests.",
      "Resolved an issue where expired tokens would silently fail instead of redirecting the user to the login screen.",
      "Fixed SMTP connection drops by properly initializing the TLS context for outbound recovery emails.",
      "Resolved an infinite loading state when internal embedding models initialized on cold starts."
    ]
  }
];

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ReleaseNotes() {
  return (
    <div className="dark min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-primary/30 overflow-x-hidden pb-20">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
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
                    <p className="text-[16px] leading-relaxed text-zinc-400">
                      {feature.description}
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4 text-[16px] leading-relaxed text-zinc-400 marker:text-zinc-600">
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
                    <ul className="list-disc pl-5 space-y-2 mt-4 text-[16px] leading-relaxed text-zinc-400 marker:text-zinc-600">
                      {release.fixes.map((fix, fixIdx) => (
                        <li key={fixIdx} className="pl-2">{fix}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {index < releases.length - 1 && (
                <hr className="mt-24 border-zinc-800" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
