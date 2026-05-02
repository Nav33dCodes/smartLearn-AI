import React, { useMemo, useState, useEffect, useRef } from "react";
import { Plus, Trash2, MessageSquare, Search, PanelLeftClose, Edit2, Command } from "lucide-react";
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
  onRenameChat, // New prop for renaming
  searchQuery,
  setSearchQuery,
  isMobile
}) {
  const searchInputRef = useRef(null);
  
  // 1. Performance: Local state for debounced search to prevent UI stuttering
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // 2. UX: Global Keyboard Shortcuts (Cmd/Ctrl + K to search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!sidebarOpen && !isMobile) setSidebarOpen(true);
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, isMobile, setSidebarOpen]);

  // 3. Organization: Filter and optimally group chats (simulated time grouping)
  const filteredChats = useMemo(() => {
    if (!chats) return [];
    const filtered = localSearch.trim()
      ? chats.filter(c => c.title.toLowerCase().includes(localSearch.toLowerCase()))
      : chats;
      
    // Optional: Sort by newest first assuming chats have a timestamp/id
    return filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [chats, localSearch]);

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    if (isMobile) setSidebarOpen(false);
  };

  // 4. Animation: Stagger variants for smoother list rendering
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20, height: 0 },
    show: { opacity: 1, x: 0, height: "auto", transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.9, height: 0, transition: { duration: 0.2 } }
  };

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="mobile-overlay fixed inset-0 z-40 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
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
          width: 260,
          marginLeft: sidebarOpen || isMobile ? 0 : -260 
        }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="sidebar flex flex-col h-full bg-gray-50 border-r border-gray-200 z-50 absolute md:relative"
        aria-hidden={!sidebarOpen && isMobile}
      >
        <div className="sidebar-top p-4 flex items-center justify-between border-b border-gray-100">
          <motion.div 
            className="sidebar-brand flex items-center gap-2 font-semibold text-gray-800"
            whileHover={{ scale: 1.02 }}
          >
            <Logo size={24} className="text-blue-600" />
            <span className="brand-text tracking-tight">SmartLearn</span>
          </motion.div>
          <div className="sidebar-actions flex gap-1">
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "var(--hover-bg)" }}
              whileTap={{ scale: 0.95 }} 
              className="btn-icon p-2 rounded-md text-gray-500 hover:text-gray-900 transition-colors" 
              onClick={() => createNewChat()} 
              title="New chat"
              aria-label="Create new chat"
            >
              <Plus size={18} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "var(--hover-bg)" }}
              whileTap={{ scale: 0.95 }} 
              className="btn-icon p-2 rounded-md text-gray-500 hover:text-gray-900 transition-colors hidden md:block" 
              onClick={() => setSidebarOpen(false)} 
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <PanelLeftClose size={18} />
            </motion.button>
          </div>
        </div>

        <div className="search-container p-3">
          <div className="search-box relative flex items-center bg-white border border-gray-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <Search size={14} className="absolute left-3 text-gray-400" aria-hidden="true" />
            <input 
              ref={searchInputRef}
              className="w-full py-2 pl-9 pr-10 text-sm bg-transparent outline-none placeholder-gray-400"
              placeholder="Search history..." 
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              aria-label="Search chat history"
            />
            {/* Visual shortcut hint for desktop users */}
            {!isMobile && (
              <div className="absolute right-2 flex items-center gap-0.5 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded pointer-events-none">
                <Command size={10} />
                <span>K</span>
              </div>
            )}
          </div>
        </div>

        <div className="chat-list flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
          <div className="chat-list-title px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent Chats
          </div>
          
          {filteredChats.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="empty-chat-message p-4 text-center text-sm text-gray-500"
            >
              {localSearch ? "No matching chats found." : "No recent chats yet."}
            </motion.div>
          )}

          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
          >
            <AnimatePresence mode="popLayout">
              {filteredChats.map(chat => (
                <motion.div 
                  key={chat.id} 
                  variants={itemVariants}
                  layout="position"
                >
                  <div 
                    className={`chat-item group relative flex items-center gap-3 px-3 py-2.5 my-0.5 rounded-lg cursor-pointer transition-all ${
                      chat.id === activeChatId 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
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
                    <MessageSquare size={16} className={chat.id === activeChatId ? "text-blue-500" : "text-gray-400"} aria-hidden="true" />
                    
                    <span className="chat-item-text flex-1 truncate text-sm font-medium">
                      {chat.title}
                    </span>
                    
                    {/* Action buttons appear on hover or when active */}
                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ${chat.id === activeChatId ? 'opacity-100' : ''}`}>
                      {onRenameChat && (
                        <button 
                          className="btn-action p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-100/50 transition-colors" 
                          onClick={(e) => {
                            e.stopPropagation(); 
                            onRenameChat(chat.id);
                          }}
                          aria-label={`Rename chat: ${chat.title}`}
                        >
                          <Edit2 size={14} aria-hidden="true" />
                        </button>
                      )}
                      
                      <button 
                        className="btn-action p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-100/50 transition-colors" 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          deleteChat(chat.id, e);
                        }}
                        aria-label={`Delete chat: ${chat.title}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}