import React, { useEffect, useRef, useState, useCallback } from "react";
import { Pencil, CheckCircle2, Copy, RotateCw, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AIMessage from "./AIMessage";
import Logo from "./Logo";

const SUGGESTIONS = [
  "Explain quantum entanglement simply",
  "Write a Python binary search",
  "Summarise an uploaded document",
  "Compare React vs Vue in 2025"
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 380, damping: 28 }
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
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Show scroll-to-bottom button when scrolled up
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
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

        {/* Welcome */}
        {isEmpty && (
          <motion.div
            className="welcome-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="welcome-logo">
              <Logo size={44} />
            </motion.div>

            <motion.h1 variants={itemVariants} className="welcome-title">
              SmartLearn
            </motion.h1>

            <motion.p variants={itemVariants} className="welcome-subtitle">
              How can I help you today?
            </motion.p>

            <motion.div variants={itemVariants} className="suggestions-grid">
              {SUGGESTIONS.map((text, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="suggestion-card"
                  onClick={() => {
                    setInput(text);
                    textareaRef.current?.focus();
                  }}
                >
                  {text}
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
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            onClick={() => scrollToBottom(true)}
            style={{
              position: "sticky",
              bottom: 180,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--bg-input)",
              border: "1px solid var(--border-color)",
              borderRadius: 20,
              padding: "7px 16px",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              cursor: "pointer",
              boxShadow: "var(--shadow-md)",
              fontFamily: "'Sora', sans-serif",
              zIndex: 5,
              whiteSpace: "nowrap",
            }}
          >
            <ChevronDown size={14} /> Scroll to bottom
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}