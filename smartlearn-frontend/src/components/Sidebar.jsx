import React, { useMemo, useState, useEffect, useRef } from "react";
import { Plus, Trash2, MessageSquare, Search, PanelLeftClose } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

export default function Sidebar({
  chats,
  activeChatId,
  setActiveChatId,
  sidebarOpen,
  setSidebarOpen,
  createNewChat,
  deleteChat,
  onRenameChat,
  searchQuery,
  setSearchQuery,
  isMobile,
  logout
}) {
  const searchInputRef = useRef(null);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(localSearch), 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (!sidebarOpen && !isMobile) setSidebarOpen(true);
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && isMobile) setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, isMobile]);

  const filteredChats = useMemo(() => {
    if (!chats) return [];
    const filtered = localSearch.trim()
      ? chats.filter(c => c.title.toLowerCase().includes(localSearch.toLowerCase()))
      : chats;
    return filtered.sort((a, b) => Number(b.id) - Number(a.id));
  }, [chats, localSearch]);

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    if (isMobile) setSidebarOpen(false);
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
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
              zIndex: 40
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="sidebar"
      >
        {/* HEADER */}
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <Logo size={24} />
            <span className="brand-text">SmartLearn</span>
          </div>

          <div className="sidebar-actions">
            <button
              className="btn-icon"
              onClick={createNewChat}
              title="New chat"
              style={{ width: 28, height: 28, padding: 0 }}
            >
              <Plus size={15} />
            </button>
            <button
              className="btn-icon"
              onClick={() => setSidebarOpen(false)}
              title="Close sidebar"
              style={{ width: 28, height: 28, padding: 0 }}
            >
              <PanelLeftClose size={15} />
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="search-container">
          <div className="search-box">
            <Search size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              placeholder="Search chats..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <span className="search-kbd">⌘K</span>
          </div>
        </div>

        {/* SECTION LABEL */}
        <div className="section-label">Recent</div>

        {/* CHAT LIST */}
        <div className="chat-list">
          {filteredChats.length === 0 && (
            <div className="sidebar-empty">
              <div className="sidebar-empty-icon">
                <MessageSquare size={16} color="var(--text-muted)" />
              </div>
              <p style={{ fontSize: 13 }}>
                {localSearch ? "No matching chats" : "No chats yet"}
              </p>
            </div>
          )}

          {filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={`chat-item${chat.id === activeChatId ? " active" : ""}`}
            >
              <MessageSquare
                size={14}
                color={chat.id === activeChatId ? "var(--accent)" : "var(--text-muted)"}
                style={{ flexShrink: 0 }}
              />
              <span className="chat-item-text">{chat.title}</span>

              <div className="chat-item-actions">
                <button
                  className="btn-delete"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id, e);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <button className="btn-new-chat" onClick={createNewChat}>
            <Plus size={14} />
            New chat
          </button>

          <button className="btn-logout" onClick={logout}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </motion.aside>
    </>
  );
}