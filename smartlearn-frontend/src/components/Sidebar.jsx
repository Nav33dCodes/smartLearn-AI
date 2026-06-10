import React, { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Trash2, MessageSquare, Search, PanelLeftClose, LogOut, Edit2, Pin, PinOff, Archive, MoreHorizontal, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChats, useDeleteChat, useRenameChat, usePinChat, useArchiveChat } from "../hooks/useChats";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import SettingsModal from "./SettingsModal";
import { Link } from "react-router-dom";

export default function Sidebar({
  activeChatId, setActiveChatId, sidebarOpen, setSidebarOpen, createNewChat, isMobile, darkMode, setDarkMode, themeColor, setThemeColor
}) {
  const { data: chatsData = [] } = useChats();
  const deleteChatMutation = useDeleteChat();
  const renameChatMutation = useRenameChat();
  const pinChatMutation = usePinChat();
  const archiveChatMutation = useArchiveChat();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
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
  const unpinnedChats = useMemo(() => filteredChats.filter(c => !c.is_pinned), [filteredChats]);

  const handleSelectChat = (id) => {
    setActiveChatId(id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteChatMutation.mutate(id, {
      onSuccess: () => {
        if (activeChatId === id && chatsData.length > 0) {
          setActiveChatId(chatsData[0].id);
        }
      }
    });
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
        <div className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider px-3 mb-1 mt-4">
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
                className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer mb-[2px] transition-all duration-200 ease-out ${
                  chat.id === activeChatId 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
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
                            onClick={(e) => { handleDelete(e, chat.id); setOpenDropdownId(null); }}
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
        className={`flex flex-col h-full bg-sidebar border-r border-border z-50 ${isMobile ? 'fixed' : 'relative'}`}
      >
        <div className="flex flex-col p-3">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Logo size={22} />
              <span className="font-semibold text-foreground tracking-tight text-lg">SmartLearn</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-lg transition-colors" onClick={() => setSidebarOpen(false)}>
              <PanelLeftClose size={18} />
            </Button>
          </div>

          <Button 
            onClick={createNewChat}
            className="w-full justify-start gap-2 bg-transparent border border-border shadow-sm hover:bg-muted/60 text-foreground transition-all rounded-xl h-10 px-3"
          >
            <Plus size={18} className="text-muted-foreground" />
            <span className="font-semibold text-[15px]">New chat</span>
          </Button>
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input 
              type="text"
              placeholder="Search..."
              className="pl-9 bg-muted/40 border-transparent hover:bg-muted/60 focus:bg-background focus:border-ring focus:ring-1 h-10 text-sm rounded-xl transition-all shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
          {filteredChats.length === 0 && (
            <div className="text-sm text-muted-foreground text-center p-4 mt-2">
              {searchQuery ? "No chats matched." : "No chats yet."}
            </div>
          )}

          {renderChatList(pinnedChats, "Pinned")}
          {renderChatList(unpinnedChats, searchQuery ? `Results (${unpinnedChats.length})` : "Recent")}
        </div>

        <div className="mt-auto flex flex-col">
          <Link to="/releases" className="mx-3 mt-1 mb-2 flex items-center gap-2.5 p-2 rounded-xl text-[14px] font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors border border-transparent">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Sparkles size={16} />
            </div>
            <span>Release Notes</span>
            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground">NEW</span>
          </Link>

          {user && (
            <div className="p-3 border-t border-border/50">
            <div 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-muted/60 transition-colors border border-transparent hover:border-border/50"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden ring-1 ring-primary/20">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    user.name ? user.name.charAt(0).toUpperCase() : "U"
                  )}
                </div>
                <span className="text-[15px] font-medium text-foreground truncate max-w-[110px] tracking-tight">{user.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setShowLogoutModal(true); }} className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8 rounded-lg">
                <LogOut size={16} />
              </Button>
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