import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen } from "lucide-react";
import AIMessage from "./AIMessage";
import Logo from "./Logo";
import YouTubeRecommendations from "./YouTubeRecommendations";
import { useAuth } from "../context/AuthContext";
export default function ChatWindow({ messages, loading, isChatsLoading, onSuggestionClick, regenerateMessage }) {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [activeSourcesQuery, setActiveSourcesQuery] = useState(null);
  const lastScrollTime = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (loading) {
      // Throttle instant scrolling during generation to at most once every 100ms
      // to prevent synchronous layout thrashing from freezing the browser.
      if (now - lastScrollTime.current > 100) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
        lastScrollTime.current = now;
      }
    } else {
      // Smooth scroll for new user messages
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      lastScrollTime.current = now;
    }
  }, [messages, loading]);
  if (isChatsLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center pt-14 pb-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto pt-14 pb-40 px-4 sm:px-6 md:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 py-6">
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          
          return (
            <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="flex flex-col items-end max-w-[80%] sm:max-w-[70%] group">
                  <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md px-5 py-3 rounded-3xl rounded-tr-sm leading-relaxed whitespace-pre-wrap text-[15px]">
                    {msg.content}
                  </div>
                  <div className="flex items-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
                        import("sonner").then(m => m.toast.success("Copied to clipboard"));
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs font-medium"
                      title="Copy your message"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start w-full group">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                      <Logo size={18} />
                    </div>
                    <span className="text-sm font-semibold text-foreground/80">SmartLearn AI</span>
                  </div>
                  <div className="bg-card/50 backdrop-blur-md border border-border/50 shadow-sm rounded-3xl rounded-tl-sm px-6 py-5 w-full max-w-[95%] sm:max-w-[85%]">
                    <AIMessage content={msg.content} />
                  </div>
                  <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
                        import("sonner").then(m => m.toast.success("Copied to clipboard"));
                      }}
                      className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                      title="Copy"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                      
                      <button
                        onClick={() => {
                          const query = index > 0 && messages[index - 1]?.role === 'user' ? messages[index - 1].content : null;
                          setActiveSourcesQuery(query || "Learn about this topic");
                        }}
                        className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors flex items-center gap-1.5"
                        title="View Sources & Videos"
                      >
                        <BookOpen size={14} />
                        <span className="text-xs font-medium">Sources</span>
                      </button>

                      {isLast && !loading && (
                        <button
                          onClick={regenerateMessage}
                          className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                          title="Regenerate"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex w-full justify-start gap-4">
            <div className="w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center shrink-0 shadow-sm mt-1">
              <Logo size={18} />
            </div>
            <div className="flex items-center gap-1.5 pt-3">
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Sources Slide-Over Panel */}
      <AnimatePresence>
        {activeSourcesQuery && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSourcesQuery(null)}
              className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 text-foreground">
                  <BookOpen size={18} className="text-primary" />
                  <h3 className="font-semibold tracking-tight">Sources & Resources</h3>
                </div>
                <button
                  onClick={() => setActiveSourcesQuery(null)}
                  className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <YouTubeRecommendations 
                  userQuery={activeSourcesQuery}
                  shouldFetch={true}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}