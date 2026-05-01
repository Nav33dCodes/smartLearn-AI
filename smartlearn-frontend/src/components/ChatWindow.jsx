import React, { useEffect, useRef, useState } from "react";
import { Pencil, CheckCircle2, Copy, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import AIMessage from "./AIMessage";
import Logo from "./Logo";

const SUGGESTIONS = [
  "Explain quantum entanglement simply",
  "Write a Python binary search",
  "Summarise an uploaded document",
  "Compare React vs Vue in 2025"
];

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 }
  }
};

export default function ChatWindow({
  activeChat,
  loading,
  editMessage,
  regenerateLastMessage,
  setInput,
  textareaRef
}) {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null);

  // ✅ Smart scroll (only when near bottom)
  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, loading]);

  // ✅ Safe copy
  const copyMessage = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopiedMsgIdx(idx);
      setTimeout(() => setCopiedMsgIdx(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="messages-scroll-area" ref={scrollContainerRef}>
      <div className="messages-container">

        {/* ✅ Welcome Screen */}
        {activeChat?.messages?.length === 0 && (
          <motion.div
            className="welcome-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="welcome-logo">
              <Logo size={46} />
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
                  whileTap={{ scale: 0.98 }}
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

        {/* ✅ Chat Messages */}
        {activeChat?.messages?.map((msg, i) => {
          const isUser = msg.role === "user";
          const isLast = i === activeChat.messages.length - 1;

          // ✅ Prevent empty AI render bug
          if (
            !isUser &&
            (!msg.content || msg.content.trim() === "") &&
            loading &&
            isLast
          ) {
            return null;
          }

          return (
            <motion.div
              key={msg.id || i}
              layout
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.95,
                transformOrigin: isUser ? "bottom right" : "bottom left"
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className="message-wrapper"
            >
              {isUser ? (
                <div className="message-user-container">
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div className="message-user-bubble">{msg.content}</div>

                    <div className="msg-actions user-actions">
                      <button className="action-btn" onClick={() => editMessage(i)}>
                        <Pencil size={13} /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="message-ai-container">
                  <div className="ai-avatar">
                    <Logo size={20} />
                  </div>

                  <div className="ai-content">
                    {/* ✅ Streaming-safe rendering */}
                    <AIMessage
                      content={msg.content || (loading && isLast ? "..." : "")}
                    />

                    <div className="msg-actions ai-actions">
                      <button
                        className="action-btn"
                        onClick={() => copyMessage(msg.content, i)}
                      >
                        {copiedMsgIdx === i ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <Copy size={13} />
                        )}
                        {copiedMsgIdx === i ? "Copied" : "Copy"}
                      </button>

                      {isLast && !loading && (
                        <button
                          className="action-btn"
                          onClick={regenerateLastMessage}
                        >
                          <RotateCw size={13} /> Regenerate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* ✅ Typing Indicator */}
        {loading &&
          activeChat?.messages?.length > 0 &&
          activeChat.messages[activeChat.messages.length - 1].role === "user" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="message-wrapper"
            >
              <div className="message-ai-container">
                <div className="ai-avatar">
                  <Logo size={20} />
                </div>
                <div className="ai-content">
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        {/* ✅ Scroll Anchor */}
        <div ref={messagesEndRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}