import React, { useMemo } from "react";
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
  searchQuery,
  setSearchQuery,
  isMobile
}) {
  // 1. Performance: Memoize the search filter to prevent unnecessary recalculations on every render
  const filteredChats = useMemo(() => {
    if (!chats) return [];
    return searchQuery.trim()
      ? chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : chats;
  }, [chats, searchQuery]);

  // Helper function to keep JSX clean
  const handleSelectChat = (id) => {
    setActiveChatId(id);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mobile-overlay active" 
            onClick={() => setSidebarOpen(false)}
            // Accessibility: Make overlay keyboard friendly
            role="button"
            tabIndex={0}
            aria-label="Close sidebar overlay"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSidebarOpen(false);
              }
            }}
          />
        )}
      </AnimatePresence>
      
      <motion.aside 
        initial={false}
        animate={{ 
          x: sidebarOpen ? 0 : "-100%",
          marginLeft: sidebarOpen || isMobile ? 0 : -260 
        }}
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
        className="sidebar"
        aria-hidden={!sidebarOpen && isMobile} // Hide from screen readers when closed on mobile
      >
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <Logo size={24} />
            <span className="brand-text">SmartLearn</span>
          </div>
          <div className="sidebar-actions">
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              className="btn-icon" 
              onClick={() => createNewChat()} 
              title="New chat"
              aria-label="Create new chat"
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

        <div className="search-container">
          <div className="search-box">
            <Search size={14} color="var(--text-muted)" aria-hidden="true" />
            <input 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search chat history"
            />
          </div>
        </div>

        <div className="chat-list">
          <div className="chat-list-title">Recent Chats</div>
          
          {/* 2. UX: Handle empty states gracefully */}
          {filteredChats.length === 0 && (
            <div className="empty-chat-message" style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {searchQuery ? "No matching chats found." : "No recent chats."}
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredChats.map(chat => (
              <motion.div 
                key={chat.id} 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              >
                <div 
                  className={`chat-item ${chat.id === activeChatId ? "active" : ""}`}
                  onClick={() => handleSelectChat(chat.id)}
                  // Accessibility: Make individual chat buttons keyboard navigable
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
                  <MessageSquare size={16} aria-hidden="true" />
                  <span className="chat-item-text">{chat.title}</span>
                  
                  <button 
                    className="btn-delete" 
                    onClick={(e) => {
                      // 3. UX: Prevent clicking delete from opening the chat
                      e.stopPropagation(); 
                      deleteChat(chat.id, e);
                    }}
                    aria-label={`Delete chat: ${chat.title}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}