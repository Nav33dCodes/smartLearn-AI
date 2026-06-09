import React from "react";
import { motion } from "framer-motion";
import AIMessage from "./AIMessage";
import Logo from "./Logo";

export default function ChatWindow({ messages, loading, isChatsLoading, onSuggestionClick, regenerateMessage }) {
  if (isChatsLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center pt-14 pb-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center pt-14 pb-32 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="mx-auto bg-primary/5 text-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border">
            <Logo size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">How can I help you today?</h1>
          <p className="text-muted-foreground mb-8">Upload a PDF to ask context-aware questions or just start chatting.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {[
              "Explain quantum computing in simple terms",
              "Summarize the uploaded PDF document",
              "Write a python script for data analysis",
              "Help me prepare for a frontend interview"
            ].map((text, i) => (
              <div 
                key={i} 
                onClick={() => onSuggestionClick?.(text)}
                className="bg-card border border-border p-3 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors shadow-sm"
              >
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pt-14 pb-40 px-4 sm:px-6 md:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 py-6">
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          
          return (
            <div key={index} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] sm:max-w-[70%] shadow-sm leading-relaxed whitespace-pre-wrap text-[15px]">
                  {msg.content}
                </div>
              ) : (
                <div className="flex gap-4 max-w-[95%] sm:max-w-[85%] w-full group">
                  <div className="w-8 h-8 rounded-md bg-card border border-border flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Logo size={18} />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <AIMessage content={msg.content} />
                    
                    {/* Action Bar */}
                    <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>
    </div>
  );
}