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
  const [openSources, setOpenSources] = useState({});
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      // If we are generating and near the bottom, pin the scroll to the bottom smoothly
      if (loading && isNearBottom) {
        container.scrollTop = scrollHeight;
      } else if (!loading && messages[messages.length - 1]?.role === "user") {
        // Smooth scroll for new user messages
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [messages, loading]);
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
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pt-14 pb-40 px-4 sm:px-6 md:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-12 py-10">
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          
          return (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (
                <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] group">
                  <div className="bg-muted/80 backdrop-blur-sm text-foreground px-6 py-4 rounded-3xl rounded-tr-sm leading-relaxed whitespace-pre-wrap text-base border border-border/50">
                    {msg.content}
                  </div>
                  <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
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
              ) : (
                <div className="flex w-full group">
                  <div className="flex w-full justify-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 mt-1">
                      <Logo size={18} className="text-primary" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-1 pt-1">
                          {msg.sources.map((url, i) => {
                            try {
                              const domain = new URL(url).hostname.replace('www.', '');
                              return (
                                <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 h-7 bg-muted/40 hover:bg-muted border border-border/60 rounded-full text-[11px] font-medium text-foreground/80 transition-colors cursor-pointer hover:border-primary/40 group/link">
                                  <div className="w-4 h-4 rounded-full bg-background flex items-center justify-center shrink-0 shadow-sm border border-border/50 overflow-hidden">
                                    <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} className="w-3 h-3" alt={domain} />
                                  </div>
                                  <span className="truncate max-w-[120px] group-hover/link:text-primary transition-colors">{domain}</span>
                                </a>
                              );
                            } catch (e) { return null; }
                          })}
                        </div>
                      )}

                      <div className="text-foreground leading-relaxed text-base pt-1">
                        <AIMessage content={msg.content} />
                      </div>
                      <div className="flex items-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity gap-1 pl-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            import("sonner").then(m => m.toast.success("Copied to clipboard"));
                          }}
                      className="p-1.5 text-muted-foreground hover:text-primary border border-transparent hover:border-primary rounded-md transition-all duration-300"
                      title="Copy"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                      
                    <button
                      onClick={() => {
                        setOpenSources(prev => ({ ...prev, [index]: !prev[index] }));
                      }}
                      className={`p-1.5 rounded-md transition-all duration-300 flex items-center gap-1.5 border ${openSources[index] ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground hover:text-primary border-transparent hover:border-primary'}`}
                      title="Toggle Sources & Videos"
                    >
                      <BookOpen size={14} />
                      <span className="text-xs font-medium">Sources</span>
                    </button>

                    {isLast && !loading && (
                      <button
                        onClick={regenerateMessage}
                        className="p-1.5 text-muted-foreground hover:text-primary border border-transparent hover:border-primary rounded-md transition-all duration-300"
                        title="Regenerate"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      </button>
                    )}
                  </div>
                  
                  {msg.timestamp && (
                    <div className="text-[11px] text-muted-foreground/50 mt-1 pl-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {formatRelativeTime(msg.timestamp)}
                    </div>
                  )}
                  
                  {/* INLINE SOURCES */}
                  <AnimatePresence>
                    {openSources[index] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <YouTubeRecommendations 
                          userQuery={index > 0 && messages[index - 1]?.role === 'user' ? messages[index - 1].content : "Learn about this topic"}
                          shouldFetch={true}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              <div className="flex items-center gap-2.5 mt-1.5 h-8 px-4 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium text-primary shadow-sm shadow-primary/5">
                {streamStatus === 'evaluating' && (
                  <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}><BrainCircuit size={15} /></motion.div> Thinking...</>
                )}
                {streamStatus === 'searching_web' && (
                  <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}><Globe size={15} /></motion.div> Searching the web...</>
                )}
                {streamStatus === 'search_complete' && (
                  <><Check size={15} /> Reading results...</>
                )}
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
    </div>
  );
}