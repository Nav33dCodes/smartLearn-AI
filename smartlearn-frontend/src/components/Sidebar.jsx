import React, { useState, useMemo } from "react";
import { Plus, Trash2, MessageSquare, Search, PanelLeftClose } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChats, useDeleteChat } from "../hooks/useChats";
import Logo from "./Logo";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function Sidebar({
  activeChatId, setActiveChatId, sidebarOpen, setSidebarOpen, createNewChat, isMobile
}) {
  const { data: chatsData = [] } = useChats();
  const deleteChatMutation = useDeleteChat();
  const [searchQuery, setSearchQuery] = useState("");

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
                  onClick={() => handleSelectChat(chat.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer mb-1 transition-colors ${
                    chat.id === activeChatId 
                      ? 'bg-accent text-accent-foreground font-medium' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className="shrink-0" />
                    <span className="truncate text-sm">{chat.title}</span>
                  </div>
                  
                  <button
                    onClick={(e) => handleDelete(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1 rounded-md transition-all shrink-0"
                  >
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