import React, { useState, useMemo } from "react";
import { Plus, Trash2, MessageSquare, Search, PanelLeftClose, LogOut, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChats, useDeleteChat, useRenameChat } from "../hooks/useChats";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function Sidebar({
  activeChatId, setActiveChatId, sidebarOpen, setSidebarOpen, createNewChat, isMobile
}) {
  const { data: chatsData = [] } = useChats();
  const deleteChatMutation = useDeleteChat();
  const renameChatMutation = useRenameChat();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

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
    const q = searchQuery.trim().toLowerCase();
    return q ? chatsData.filter(c => c.title.toLowerCase().includes(q)) : chatsData;
  }, [chatsData, searchQuery]);

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
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-semibold text-foreground tracking-tight">SmartLearn</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={createNewChat}>
              <Plus size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setSidebarOpen(false)}>
              <PanelLeftClose size={18} />
            </Button>
          </div>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search chats..."
              className="pl-8 bg-muted/50 border-none h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2 mt-2">
            {searchQuery ? `Results (${filteredChats.length})` : "Recent"}
          </div>

          {filteredChats.length === 0 && (
            <div className="text-sm text-muted-foreground text-center p-4">
              {searchQuery ? "No chats matched." : "No chats yet."}
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {filteredChats.map(chat => (
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
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer mb-1 transition-colors ${
                    chat.id === activeChatId 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <MessageSquare size={16} className="shrink-0" />
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
                        className="bg-background border border-primary text-foreground text-sm rounded-sm px-1 w-full outline-none"
                      />
                    ) : (
                      <span className="truncate text-sm">{chat.title}</span>
                    )}
                  </div>
                  
                  {editingChatId !== chat.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                      <button
                        onClick={(e) => startEditing(e, chat)}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-1 rounded-md transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, chat.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1 rounded-md transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {user && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-sm font-medium text-foreground truncate max-w-[120px]">{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowLogoutModal(true)} className="text-muted-foreground hover:text-destructive shrink-0">
              <LogOut size={18} />
            </Button>
          </div>
        )}
      </motion.aside>

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