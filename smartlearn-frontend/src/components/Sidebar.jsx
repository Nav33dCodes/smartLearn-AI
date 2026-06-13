import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Plus, Trash2, MessageSquare, Search, PanelLeftClose, LogOut, Edit2, Pin, PinOff, Archive, MoreHorizontal, Sparkles, Settings, ExternalLink, Database, ShieldAlert, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChats, useDeleteChat, useRenameChat, usePinChat, useArchiveChat } from "../hooks/useChats";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import SettingsModal from "./SettingsModal";
import { Link } from "react-router-dom";

function Sidebar({
  activeChatId, setActiveChatId, sidebarOpen, setSidebarOpen, createNewChat, currentView, setCurrentView, isMobile, darkMode, setDarkMode, themeColor, setThemeColor, isChatsLoading
}) {
  const { data: chatsData = [] } = useChats();
  const deleteChatMutation = useDeleteChat();
  const renameChatMutation = useRenameChat();
  const pinChatMutation = usePinChat();
  const archiveChatMutation = useArchiveChat();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  
  const [isHistoryHidden, setIsHistoryHidden] = useState(() => {
    return localStorage.getItem('sl_history_hidden') === 'true';
  });

  const toggleHistoryHidden = () => {
    const newVal = !isHistoryHidden;
    setIsHistoryHidden(newVal);
    localStorage.setItem('sl_history_hidden', String(newVal));
    window.dispatchEvent(new Event('sl_history_toggled'));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startEditing = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleRename = (id) => {
    if (editTitle.trim() && editTitle.trim() !== chatsData.find(c => c.id === id)?.title) {
      renameChatMutation.mutate({ id, title: editTitle.trim() });
    }
    setEditingChatId(null);
  };

  const filteredChats = useMemo(() => {
    let list = chatsData.filter(c => !c.is_archived);
    const q = searchQuery.trim().toLowerCase();
    return q ? list.filter(c => c.title.toLowerCase().includes(q)) : list;
  }, [chatsData, searchQuery]);

  const pinnedChats = useMemo(() => filteredChats.filter(c => c.is_pinned), [filteredChats]);
  // Slice to max 100 chats to prevent DOM crash (Lightweight Virtualization)
  const unpinnedChats = useMemo(() => filteredChats.filter(c => !c.is_pinned).slice(0, 100), [filteredChats]);

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (activeChatId === id && chatsData.length > 0) {
      const nextChat = chatsData.find(c => c.id !== id);
      setActiveChatId(nextChat ? nextChat.id : null);
    }
    deleteChatMutation.mutate(id);
    setOpenDropdownId(null);
  };

  const handlePinToggle = (e, chat) => {
    e.stopPropagation();
    pinChatMutation.mutate({ id: chat.id, is_pinned: !chat.is_pinned });
  };

  const handleArchive = (e, id) => {
    e.stopPropagation();
    archiveChatMutation.mutate(id, {
      onSuccess: () => {
        if (activeChatId === id && chatsData.length > 0) {
          const nextChat = chatsData.find(c => c.id !== id && !c.is_archived);
          setActiveChatId(nextChat ? nextChat.id : null);
        }
      }
    });
  };

  const renderChatList = (chats, title) => {
    if (chats.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-3 mb-1.5 mt-4">
          {title}
        </div>
        <AnimatePresence mode="popLayout">
          {chats.map(chat => (
            <motion.div
              key={chat.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div
                onClick={() => { if (editingChatId !== chat.id) handleSelectChat(chat.id) }}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer mb-0.5 transition-all duration-300 ${
                  String(chat.id) === String(activeChatId) && currentView !== "chats"
                    ? 'bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 font-medium shadow-sm' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  {editingChatId === chat.id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRename(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(chat.id);
                        if (e.key === "Escape") setEditingChatId(null);
                      }}
                      className="bg-background border border-primary text-foreground text-sm rounded px-1 w-full outline-none shadow-sm"
                    />
                  ) : (
                    <span className="truncate text-[15px] font-medium tracking-tight">{chat.title}</span>
                  )}
                </div>
                
                {editingChatId !== chat.id && (
                  <div 
                    className={`flex items-center gap-1 transition-all shrink-0 relative ${openDropdownId === chat.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    ref={openDropdownId === chat.id ? dropdownRef : null}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === chat.id ? null : chat.id); }}
                      className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                      title="Options"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    <AnimatePresence>
                      {openDropdownId === chat.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 top-8 w-36 bg-popover border border-border rounded-md shadow-md z-50 p-1 flex flex-col"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => { handlePinToggle(e, chat); setOpenDropdownId(null); }}
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded-sm transition-colors text-left"
                          >
                            {chat.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
                            {chat.is_pinned ? "Unpin chat" : "Pin chat"}
                          </button>
                          <button
                            onClick={(e) => { startEditing(e, chat); setOpenDropdownId(null); }}
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded-sm transition-colors text-left"
                          >
                            <Edit2 size={14} />
                            Rename
                          </button>
                          <button
                            onClick={(e) => { handleArchive(e, chat.id); setOpenDropdownId(null); }}
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-foreground hover:bg-muted rounded-sm transition-colors text-left"
                          >
                            <Archive size={14} />
                            Archive
                          </button>
                          <div className="h-px bg-border my-1" />
                          <button
                            onClick={(e) => handleDelete(e, chat.id)}
                            className="flex items-center gap-2 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-sm transition-colors text-left"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
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
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`flex flex-col h-full bg-[#fcfcfd] dark:bg-[#000000] border-r border-black/5 dark:border-white/5 shadow-2xl z-50 ${isMobile ? 'fixed' : 'relative'}`}
      >
        <div className="flex flex-col p-4 gap-2">
          <div className="flex items-center justify-between mb-6 px-1">
            <Link to="/app" className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
              <Logo size={28} />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500 tracking-tighter text-xl">SmartLearn</span>
            </Link>
            <button className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center" onClick={() => setSidebarOpen(false)}>
              <PanelLeftClose size={16} />
            </button>
          </div>

          <button 
            onClick={createNewChat}
            className="w-full flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 transition-all duration-300 rounded-full h-11 px-4 font-semibold shadow-md active:scale-[0.98] group"
          >
            <Plus size={18} className="text-zinc-400 dark:text-zinc-500 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[14px]">New Chat</span>
          </button>
          
          <button 
            onClick={() => {
              setCurrentView("chats");
              if (isMobile) setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 hover:bg-black/5 dark:hover:bg-[#111111] transition-all duration-300 rounded-full h-10 px-4 mt-1 border border-transparent ${currentView === "chats" ? "bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-zinc-100 font-semibold shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}
          >
            <Database size={16} className={currentView === "chats" ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-500"} />
            <span className="font-medium text-[14px]">Chats</span>
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
            <Input 
              type="text"
              placeholder="Search..."
              className="pl-9 bg-transparent border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 focus:bg-white dark:focus:bg-[#0a0a0a] focus:border-zinc-300 dark:focus:border-[#444444] h-10 text-sm rounded-full transition-all duration-300 w-full outline-none shadow-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
          {isChatsLoading ? (
            <div className="flex flex-col gap-2 p-2 mt-2">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="w-full h-8 bg-muted/60 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : isHistoryHidden ? (
            <div className="flex flex-col items-center p-4 text-center mt-2 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent">
              <ShieldAlert className="w-6 h-6 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-foreground mb-1">History is off</p>
              <p className="text-xs text-muted-foreground mb-4">Your chats are hidden for privacy.</p>
              <Button variant="outline" size="sm" onClick={toggleHistoryHidden} className="h-8 px-4 text-[11px] uppercase tracking-wider font-bold">
                Enable
              </Button>
            </div>
          ) : (
            <>
              {filteredChats.length === 0 && (
                <div className="text-sm text-muted-foreground text-center p-4 mt-2">
                  {searchQuery ? "No chats matched." : "No chats yet."}
                </div>
              )}

              {renderChatList(pinnedChats, "Pinned")}
              {renderChatList(unpinnedChats, searchQuery ? `Results (${unpinnedChats.length})` : "Recent")}
            </>
          )}
        </div>

        <div className="mt-auto flex flex-col">
          {user && (
            <div className="relative p-2 border-t border-black/5 dark:border-[#222]" ref={userMenuRef}>
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute bottom-full left-2 right-2 mb-2 bg-[#fcfcfd]/90 dark:bg-[#111111]/90 backdrop-blur-2xl border border-black/10 dark:border-[#222] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden z-50 flex flex-col p-1.5"
                  >
                    <button
                      onClick={() => { setIsSettingsOpen(true); setShowUserMenu(false); }}
                      className="flex items-center gap-3 px-2.5 py-2 text-[13px] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors duration-200 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-left group"
                    >
                      <Settings size={15} className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-200" />
                      <span className="font-medium">Settings</span>
                    </button>
                    
                    <button
                      onClick={() => { window.open('/releases', '_blank'); setShowUserMenu(false); }}
                      className="flex items-center justify-between px-2.5 py-2 text-[13px] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors duration-200 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Rocket size={15} className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-200" />
                        <span className="font-medium">Release notes</span>
                      </div>
                      <ExternalLink size={13} className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-200" />
                    </button>

                    <div className="h-[1px] bg-black/5 dark:bg-[#222] my-1 mx-2" />
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowLogoutModal(true); setShowUserMenu(false); }}
                      className="flex items-center gap-3 px-2.5 py-2 text-[13px] hover:bg-red-500/10 text-red-600 dark:text-red-500 rounded-lg transition-colors duration-200 text-left group"
                    >
                      <LogOut size={15} className="text-red-600/70 dark:text-red-500/70 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors duration-200" />
                      <span className="font-medium">Log out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-between p-1.5 pl-2 pr-3 rounded-full cursor-pointer bg-transparent hover:bg-black/5 dark:hover:bg-[#111111] transition-colors border border-transparent group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 font-semibold text-sm shrink-0 overflow-hidden shadow-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      user.name ? user.name.charAt(0).toUpperCase() : "U"
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[140px] tracking-tight">{user.name}</span>
                  </div>
                </div>
                <div className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
        isHistoryHidden={isHistoryHidden}
        toggleHistoryHidden={toggleHistoryHidden}
      />

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-card border border-border shadow-2xl rounded-3xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold text-foreground mb-2">Sign Out</h3>
              <p className="text-muted-foreground text-sm mb-6">Are you sure you want to log out of your account? You will need to sign back in to access your chats.</p>
              <div className="flex items-center gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowLogoutModal(false)}>Cancel</Button>
                <Button variant="destructive" onClick={logout}>Sign Out</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </>
  );
}

export default memo(Sidebar);