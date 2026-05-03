import React, { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Trash2, MessageSquare, Search, PanelLeftClose, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

export default function Sidebar({
  chats, activeChatId, setActiveChatId, sidebarOpen, setSidebarOpen,
  createNewChat, deleteChat, searchQuery, setSearchQuery, isMobile
}) {
  const searchInputRef = useRef(null);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(localSearch), 280);
    return () => clearTimeout(t);
  }, [localSearch, setSearchQuery]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (!sidebarOpen && !isMobile) setSidebarOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 80);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sidebarOpen, isMobile, setSidebarOpen]);

  const filteredChats = useMemo(() => {
    if (!chats) return [];
    const q = localSearch.trim().toLowerCase();
    return q
      ? chats.filter(c => c.title.toLowerCase().includes(q))
      : chats;
  }, [chats, localSearch]);

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    if (isMobile) setSidebarOpen(false);
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 320, damping: 26 } },
    exit: { opacity: 0, x: -8, transition: { duration: 0.15 } }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="mobile-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : "-100%",
          width: 260,
          marginLeft: sidebarOpen || isMobile ? 0 : -260
        }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="sidebar"
        aria-hidden={!sidebarOpen && isMobile}
      >
        {/* Top */}
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <Logo size={22} />
            <span className="brand-text">SmartLearn</span>
          </div>

          <div className="sidebar-actions">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="btn-icon"
              onClick={createNewChat}
              title="New chat (Ctrl+N)"
              aria-label="New chat"
            >
              <Plus size={18} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="btn-icon"
              onClick={() => setSidebarOpen(false)}
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <PanelLeftClose size={18} />
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="search-container">
          <div className="search-box">
            <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search chats..."
              aria-label="Search chat history"
            />
            {!isMobile && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                background: "var(--bg-hover)",
                border: "1px solid var(--border-color)",
                borderRadius: 4,
                padding: "2px 5px",
                flexShrink: 0,
              }}>
                <Command size={9} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "monospace" }}>K</span>
              </div>
            )}
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  fontSize: "0.75rem",
                }}
                title="Clear search"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chat list */}
        <div className="chat-list">
          <div className="chat-list-title">
            {localSearch ? `Results (${filteredChats.length})` : "Recent"}
          </div>

          {filteredChats.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: "24px 8px",
                textAlign: "center",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              {localSearch ? "No chats matched." : "No chats yet.\nStart a conversation!"}
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredChats.map(chat => (
              <motion.div
                key={chat.id}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                layout="position"
              >
                <div
                  className={`chat-item ${chat.id === activeChatId ? "active" : ""}`}
                  onClick={() => handleSelectChat(chat.id)}
                  role="button"
                  tabIndex={0}
                  aria-current={chat.id === activeChatId ? "page" : undefined}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectChat(chat.id);
                    }
                  }}
                >
                  <MessageSquare
                    size={14}
                    style={{
                      color: chat.id === activeChatId ? "var(--accent-color)" : "var(--text-muted)",
                      flexShrink: 0,
                      transition: "color 0.15s",
                    }}
                  />

                  <span className="chat-item-text">{chat.title}</span>

                  <button
                    className="btn-delete"
                    onClick={(e) => deleteChat(chat.id, e)}
                    aria-label={`Delete "${chat.title}"`}
                    title="Delete chat"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom info */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-color)",
          fontSize: "0.72rem",
          color: "var(--text-muted)",
          letterSpacing: "0.01em",
        }}>
          {chats.length} conversation{chats.length !== 1 ? "s" : ""}
        </div>
      </motion.aside>
    </>
  );
}