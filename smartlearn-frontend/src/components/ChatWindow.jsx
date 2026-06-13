import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, BrainCircuit, Globe, Check } from "lucide-react";
import AIMessage from "./AIMessage";
import Logo from "./Logo";
import YouTubeRecommendations from "./YouTubeRecommendations";
import { useAuth } from "../context/AuthContext";

const formatRelativeTime = (ts) => {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `Today ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ` ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
};

export default function ChatWindow({ messages, loading, streamStatus, isChatsLoading, isHistoryLoading, onSuggestionClick, regenerateMessage }) {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [activeSourceIndex, setActiveSourceIndex] = useState(null);
  const scrollContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [, setTick] = useState(0);

  // Force re-render every 60 seconds to update relative timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const [isAutoScrollLocked, setIsAutoScrollLocked] = useState(false);
  const lastScrollTop = useRef(0);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    
    // Detect scroll direction
    const scrollingUp = scrollTop < lastScrollTop.current;
    lastScrollTop.current = scrollTop;

    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const isScrolledUp = distanceToBottom > 200;
    setShowScrollButton(isScrolledUp);

    // SMART LOCKING: If the AI is typing and the user forcefully scrolls up, lock the auto-scroll.
    if (loading && scrollingUp && distanceToBottom > 50) {
      setIsAutoScrollLocked(true);
    }
    
    // If the user manually scrolls back down to the bottom, re-engage auto-scroll
    if (distanceToBottom < 10) {
      setIsAutoScrollLocked(false);
    }
  };

  useEffect(() => {
    // Reset auto-scroll lock when a new generation starts
    if (!loading) {
      setIsAutoScrollLocked(false);
    }
  }, [loading]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const { scrollHeight } = container;
      
      // Only pin to bottom if the scroll lock is NOT engaged
      if (loading && !isAutoScrollLocked) {
        container.scrollTop = scrollHeight;
      } else if (!loading && messages[messages.length - 1]?.role === "user") {
        // Smooth scroll for new user messages
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [messages, loading, isAutoScrollLocked]);
  if ((isChatsLoading || isHistoryLoading) && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto pt-14 pb-40 px-4 sm:px-6 md:px-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-12 py-10 w-full">
          {/* Skeleton User Message */}
          <div className="flex w-full justify-end">
            <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] w-full gap-2">
              <div className="h-16 w-3/4 sm:w-1/2 bg-muted/60 rounded-3xl rounded-tr-sm animate-pulse" />
            </div>
          </div>
          
          {/* Skeleton AI Message */}
          <div className="flex w-full justify-start mt-2">
            <div className="flex w-full justify-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 border border-primary/20 animate-pulse" />
              <div className="flex flex-col gap-3 w-full max-w-[90%] pt-1">
                <div className="h-4 w-full bg-muted/60 rounded animate-pulse" />
                <div className="h-4 w-[90%] bg-muted/60 rounded animate-pulse" />
                <div className="h-4 w-[95%] bg-muted/60 rounded animate-pulse" />
                <div className="h-4 w-[60%] bg-muted/60 rounded animate-pulse" />
                
                {/* Simulated code block skeleton */}
                <div className="h-32 w-full bg-muted/40 rounded-xl mt-2 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return null;
  }

  return (
    <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto pt-14 pb-40 px-4 sm:px-6 md:px-8 relative">
      <div className="max-w-3xl mx-auto flex flex-col gap-12 py-10">
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          
          return (
            <motion.div 
              key={index} 
              initial={isLast ? { opacity: 0, y: 15 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (() => {
                const fileRegex = /\[FILE:(.+?)\]/g;
                const files = [];
                let match;
                while ((match = fileRegex.exec(msg.content)) !== null) {
                  files.push(match[1]);
                }
                const textContent = msg.content.replace(/\[FILE:(.+?)\]/g, '').trim();
                
                return (
                  <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] group">
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2 justify-end w-full">
                        {files.map((filename, i) => (
                          <div key={i} className="flex items-center gap-3 bg-muted/80 backdrop-blur-sm border border-border/50 rounded-2xl p-2 pr-4 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                            </div>
                            <div className="flex flex-col min-w-0 text-left">
                              <span className="text-[13px] font-semibold text-foreground max-w-[160px] truncate">{filename}</span>
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Document</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {textContent && (
                      <div className="bg-muted/80 backdrop-blur-sm text-foreground px-6 py-4 rounded-3xl rounded-tr-sm leading-relaxed whitespace-pre-wrap text-base border border-border/50">
                        {textContent}
                      </div>
                    )}
                    <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(textContent || msg.content);
                          import("sonner").then(m => m.toast.success("Copied to clipboard"));
                        }}
                        className="p-1 text-muted-foreground hover:text-primary border border-transparent hover:border-primary transition-all duration-300 flex items-center gap-1.5 text-xs font-medium rounded-md"
                        title="Copy your message"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        Copy
                      </button>
                    </div>
                  </div>
                );
              })() : (
                <div className="flex w-full group">
                  <div className="flex w-full justify-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 mt-1">
                      <Logo size={18} className="text-primary" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      
                      {(() => {
                        let displayContent = msg.content || "";
                        let msgSources = msg.sources || [];
                        
                        if (displayContent.includes("<!-- SOURCES_JSON: ")) {
                           try {
                              const parts = displayContent.split("<!-- SOURCES_JSON: ");
                              displayContent = parts[0].trimEnd();
                              const jsonStr = parts[1].split(" -->")[0];
                              const parsedSources = JSON.parse(jsonStr);
                              // Merge if necessary, or just override
                              if (parsedSources && parsedSources.length > 0) {
                                msgSources = parsedSources;
                              }
                           } catch (e) {}
                        }

                        return (
                          <>
                            {msgSources && msgSources.length > 0 && (
                              <div className="flex flex-col gap-2 mb-2 pt-1 w-full max-w-full overflow-hidden">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                            <Globe size={12} className="text-primary/70" />
                            <span>Sources</span>
                          </div>
                          <div className="flex overflow-x-auto snap-x gap-2 pb-3 -mx-2 px-2">
                            {msgSources.map((source, i) => {
                              try {
                                const url = typeof source === 'string' ? source : source.url;
                                const title = typeof source === 'string' ? '' : source.title;
                                const domain = new URL(url).hostname.replace('www.', '');
                                return (
                                  <a key={i} href={url} target="_blank" rel="noreferrer" className="flex flex-col gap-1.5 shrink-0 w-[160px] h-[72px] bg-muted/30 border border-border/50 hover:bg-muted/80 hover:border-primary/30 rounded-xl p-2.5 transition-all duration-300 cursor-pointer group/card snap-start shadow-sm">
                                    <div className="flex items-center gap-1.5 w-full">
                                      <div className="w-4 h-4 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm border border-border/50 overflow-hidden">
                                        <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} className="w-3 h-3" alt={domain} />
                                      </div>
                                      <span className="truncate text-[10px] font-semibold text-muted-foreground group-hover/card:text-primary/80 transition-colors flex-1 uppercase tracking-wide">{domain}</span>
                                    </div>
                                    <span className="text-[12px] font-medium text-foreground/90 line-clamp-2 leading-snug group-hover/card:text-foreground transition-colors">{title || domain}</span>
                                  </a>
                                );
                                } catch (e) { return null; }
                              })}
                            </div>
                          </div>
                        )}

                        <div className="text-foreground leading-relaxed text-base pt-1 relative">
                          <AIMessage content={displayContent} isGenerating={isLast && loading} />
                        </div>
                      </>
                    );
                  })()}
                      <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1 pl-1">
                        <button
                          onClick={() => {
                            const textToCopy = (msg.content || "").includes("<!-- SOURCES_JSON: ") 
                              ? (msg.content || "").split("<!-- SOURCES_JSON: ")[0].trimEnd() 
                              : msg.content;
                            navigator.clipboard.writeText(textToCopy);
                            import("sonner").then(m => m.toast.success("Copied to clipboard"));
                          }}
                          className="p-1.5 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-all duration-200"
                          title="Copy"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </button>
                        
                        <button
                          onClick={() => {
                            setActiveSourceIndex(prev => prev === index ? null : index);
                          }}
                          className={`px-2 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 ${activeSourceIndex === index ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5'}`}
                          title="Toggle Context & Sources"
                        >
                          <BookOpen size={14} />
                          <span className="text-[11px] font-medium tracking-wide">Context</span>
                        </button>

                        {isLast && !loading && (
                          <button
                            onClick={regenerateMessage}
                            className="p-1.5 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-all duration-200"
                            title="Regenerate"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                          </button>
                        )}
                        
                        {msg.timestamp && (
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium ml-2 tracking-wide">
                            {formatRelativeTime(msg.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
        </motion.div>
          );
        })}

        {loading && messages[messages.length - 1]?.role === "user" && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex w-full justify-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 mb-3 mt-1">
              <Logo size={18} className="text-primary" />
            </div>
            
            {streamStatus ? (
              <div className="flex items-center mt-2.5 ml-1 text-[13px] font-medium text-muted-foreground tracking-wide">
                {streamStatus === 'evaluating' && "Thinking..."}
                {streamStatus === 'searching_web' && "Searching the web..."}
                {streamStatus === 'search_complete' && "Reading results..."}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pt-2 ml-1">
                <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} className="w-2 h-2 rounded-full bg-primary" />
                <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }} className="w-2 h-2 rounded-full bg-primary" />
                <motion.div animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }} className="w-2 h-2 rounded-full bg-primary" />
              </div>
            )}
          </motion.div>
        )}
        
        
        <div ref={messagesEndRef} />
      </div>

      {/* Right Sidebar Drawer for Context & Sources */}
      <AnimatePresence>
        {activeSourceIndex !== null && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-14 right-0 bottom-0 w-full md:w-[400px] bg-[#050505]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                <h3 className="font-semibold text-zinc-200">Context & Sources</h3>
              </div>
              <button 
                onClick={() => setActiveSourceIndex(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              {/* Web Sources */}
              {messages[activeSourceIndex]?.sources && messages[activeSourceIndex].sources.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Web Sources</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {messages[activeSourceIndex].sources.map((url, i) => {
                      try {
                        const domain = new URL(url).hostname.replace('www.', '');
                        return (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3.5 p-3.5 bg-[#111111]/30 hover:bg-[#111111]/80 border border-white/5 hover:border-[#222] rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-[#222] shadow-[0_2px_10px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                              <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity duration-300" alt={domain} />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                              <span className="text-[13px] font-medium text-zinc-300 truncate group-hover:text-zinc-100 transition-colors tracking-tight">{domain}</span>
                              <span className="text-[11px] text-zinc-600 truncate group-hover:text-zinc-400 transition-colors">{url}</span>
                            </div>
                          </a>
                        );
                      } catch (e) { return null; }
                    })}
                  </div>
                </div>
              )}
              
              {/* YouTube Recommendations */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Related Videos</h4>
                <YouTubeRecommendations 
                  userQuery={activeSourceIndex > 0 && messages[activeSourceIndex - 1]?.role === 'user' ? messages[activeSourceIndex - 1].content : "Learn about this topic"}
                  shouldFetch={true}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-32 right-8 z-50 md:right-12"
          >
            <button
              onClick={() => {
                setIsAutoScrollLocked(false);
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
              }}
              className="p-3 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-[#111111] hover:-translate-y-1 transition-all duration-300 relative flex items-center justify-center group"
              title="Scroll to bottom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-0.5 transition-transform duration-300"><path d="m6 9 6 6 6-6"/></svg>
              {loading && <span className="absolute 0 top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-[#050505] animate-pulse" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}