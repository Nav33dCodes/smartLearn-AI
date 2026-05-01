import React from "react";
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
  const filteredChats = searchQuery.trim()
    ? chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

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
      >
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <Logo size={24} />
            <span className="brand-text">SmartLearn</span>
          </div>
          <div className="sidebar-actions">
            <motion.button whileTap={{ scale: 0.9 }} className="btn-icon" onClick={() => createNewChat()} title="New chat">
              <Plus size={18} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} className="btn-icon" onClick={() => setSidebarOpen(false)} title="Close sidebar">
              <PanelLeftClose size={18} />
            </motion.button>
          </div>
        </div>

        <div className="search-container">
          <div className="search-box">
            <Search size={14} color="var(--text-muted)" />
            <input 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="chat-list">
          <div className="chat-list-title">Recent Chats</div>
          <AnimatePresence>
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
                  onClick={() => { setActiveChatId(chat.id); if(isMobile) setSidebarOpen(false); }}
                >
                  <MessageSquare size={16} />
                  <span className="chat-item-text">{chat.title}</span>
                  <button className="btn-delete" onClick={(e) => deleteChat(chat.id, e)}>
                    <Trash2 size={14} />
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