import React, { useEffect, useRef, useState, useCallback } from "react";
// Added Sparkles, Code, FileText, and Zap icons for the modern suggestions
import { Pencil, CheckCircle2, Copy, RotateCw, ChevronDown, Sparkles, Code, FileText, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AIMessage from "./AIMessage";
import Logo from "./Logo";

// UPGRADE: Modernized suggestions with icons
const SUGGESTIONS = [
  { text: "Explain quantum entanglement", icon: <Sparkles size={18} /> },
  { text: "Write a Python binary search", icon: <Code size={18} /> },
  { text: "Summarise an uploaded document", icon: <FileText size={18} /> },
  { text: "Compare React vs Vue in 2025", icon: <Zap size={18} /> }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  }
};

export default function ChatWindow({
  activeChat, loading, editMessage, regenerateLastMessage, setInput, textareaRef
}) {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Smart scroll — only auto-scroll if near bottom
  const scrollToBottom = useCallback((force = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    
    if (force || distFromBottom < 120) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: force ? "smooth" : "auto" 
      });
    }
  }, []);

  // Show scroll-to-bottom button when scrolled up
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distFromBottom > 250);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, loading]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const copyMessage = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopiedMsgIdx(idx);
      setTimeout(() => setCopiedMsgIdx(null), 1800);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const messages = activeChat?.messages || [];
  const isEmpty = messages.length === 0;

  return (
    <div className="messages-scroll-area" ref={scrollContainerRef}>
      <div className="messages-container">

        {/* ── REDESIGNED WELCOME SCREEN (ChatGPT / Gemini Style) ── */}
        {isEmpty && (
          <motion.div
            className="welcome-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "8vh", // Pushes it perfectly to the visual center
              padding: "0 20px"
            }}
          >
            <motion.div variants={itemVariants} style={{ marginBottom: "24px" }}>
              {/* Slightly larger logo for the hero section */}
              <Logo size={52} /> 
            </motion.div>

            <motion.h1 
              variants={itemVariants} 
              style={{
                fontSize: "1.75rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "40px",
                letterSpacing: "-0.03em",
                textAlign: "center"
              }}
            >
              How can I help you today?
            </motion.h1>

            <motion.div 
              variants={itemVariants} 
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "12px",
                width: "100%",
                maxWidth: "680px" // Keeps the grid tightly centered
              }}
            >
              {SUGGESTIONS.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, backgroundColor: "var(--bg-hover)", borderColor: "var(--accent-color)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setInput(item.text);
                    textareaRef.current?.focus();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 20px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "16px", // Sleeker, rounder corners
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                    {item.icon}
                  </div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          const isLast = i === messages.length - 1;

          if (!isUser && (!msg.content || msg.content.trim() === "") && loading && isLast) {
            return null;
          }

          return (
            <motion.div
              key={msg.id || i}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="message-wrapper"
            >
              {isUser ? (
                <div className="message-user-container">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div className="message-user-bubble">{msg.content}</div>
                    <div className="msg-actions user-actions">
                      <button className="action-btn" onClick={() => editMessage(i)}>
                        <Pencil size={12} /> Edit
                      </button>
                      <button className="action-btn" onClick={() => copyMessage(msg.content, i)}>
                        {copiedMsgIdx === i ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                        {copiedMsgIdx === i ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="message-ai-container">
                  <div className="ai-avatar">
                    <Logo size={19} />
                  </div>
                  <div className="ai-content">
                    <AIMessage content={msg.content || (loading && isLast ? "..." : "")} />
                    <div className="msg-actions ai-actions">
                      <button className="action-btn" onClick={() => copyMessage(msg.content, i)}>
                        {copiedMsgIdx === i ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                        {copiedMsgIdx === i ? "Copied" : "Copy"}
                      </button>
                      {isLast && !loading && (
                        <button className="action-btn" onClick={regenerateLastMessage}>
                          <RotateCw size={12} /> Regenerate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {loading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === "user" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="message-wrapper"
            >
              <div className="message-ai-container">
                <div className="ai-avatar">
                  <Logo size={19} />
                </div>
                <div className="ai-content">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        <div ref={messagesEndRef} style={{ height: 1 }} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => scrollToBottom(true)}
            title="Scroll to bottom"
            style={{
              position: "absolute",
              bottom: "130px",
              right: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "42px",
              height: "42px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-color)",
              borderRadius: "50%",
              color: "var(--text-secondary)",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              zIndex: 100,
            }}
          >
            <ChevronDown size={22} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}