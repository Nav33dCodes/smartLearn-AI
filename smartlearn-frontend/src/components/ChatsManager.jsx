import React, { useState, useMemo } from 'react';
import { Search, Trash2, X, MessageSquare, Check, CheckSquare, Square, Download, Archive, Filter, Edit2 } from 'lucide-react';
import { GroupedVirtuoso } from 'react-virtuoso';
import { useDeleteChat, useArchiveChat, useRenameChat } from '../hooks/useChats';
import { Button } from './ui/button';

export default function ChatsManager({ chatsData, onOpenChat }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc"); // "date-desc" | "date-asc" | "title-asc"
  const [selectedIds, setSelectedIds] = useState(new Set());
  const deleteChatMutation = useDeleteChat();
  const archiveChatMutation = useArchiveChat();
  const renameChatMutation = useRenameChat();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredChats = useMemo(() => {
    let list = chatsData.filter(c => !c.is_archived);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(c => c.title.toLowerCase().includes(q));
    }
    
    // Sort logic
    if (sortBy === "title-asc") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "date-asc") {
      list.sort((a, b) => {
        const timeA = Number(String(a.id).split('_').pop()) || 0;
        const timeB = Number(String(b.id).split('_').pop()) || 0;
        return timeA - timeB;
      });
    } else { // date-desc (default)
      list.sort((a, b) => {
        const timeA = Number(String(a.id).split('_').pop()) || 0;
        const timeB = Number(String(b.id).split('_').pop()) || 0;
        return timeB - timeA;
      });
    }
    
    return list;
  }, [chatsData, searchQuery, sortBy]);

  const groupedChats = useMemo(() => {
    const groups = {
      "Today": [],
      "Yesterday": [],
      "Previous 7 Days": [],
      "Older": []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - (86400000 * 7);

    filteredChats.forEach(chat => {
      const time = Number(String(chat.id).split('_').pop()) || 0;
      if (time >= today) {
        groups["Today"].push(chat);
      } else if (time >= yesterday) {
        groups["Yesterday"].push(chat);
      } else if (time >= sevenDaysAgo) {
        groups["Previous 7 Days"].push(chat);
      } else {
        groups["Older"].push(chat);
      }
    });

    return groups;
  }, [filteredChats]);

  const { groupedKeys, groupCounts, flattenedChats } = useMemo(() => {
    const keys = Object.keys(groupedChats).filter(k => groupedChats[k].length > 0);
    const counts = keys.map(k => groupedChats[k].length);
    const flattened = [];
    keys.forEach(k => flattened.push(...groupedChats[k]));
    return { groupedKeys: keys, groupCounts: counts, flattenedChats: flattened };
  }, [groupedChats]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredChats.length && filteredChats.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredChats.map(c => c.id)));
    }
  };

  const toggleSelect = (e, id) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const idsToDelete = Array.from(selectedIds);
      for (const id of idsToDelete) {
        await deleteChatMutation.mutateAsync(id);
      }
      setSelectedIds(new Set());
    } catch (e) {
      console.error("Bulk delete failed:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;
    setIsArchiving(true);
    try {
      const idsToArchive = Array.from(selectedIds);
      for (const id of idsToArchive) {
        await archiveChatMutation.mutateAsync(id);
      }
      setSelectedIds(new Set());
    } catch (e) {
      console.error("Bulk archive failed:", e);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.size === 0) return;
    setIsExporting(true);
    try {
      const idsToExport = Array.from(selectedIds);
      const chatsToExport = chatsData.filter(c => idsToExport.includes(c.id));
      let mdContent = `# SmartLearn Chat Export\n\n`;
      chatsToExport.forEach(chat => {
        mdContent += `## ${chat.title}\n\n`;
        if (chat.messages) {
          chat.messages.forEach(msg => {
            mdContent += `**${msg.role === 'user' ? 'User' : 'Assistant'}**:\n${msg.content}\n\n`;
          });
        }
        mdContent += `---\n\n`;
      });
      const blob = new Blob([mdContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartlearn-export-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      setSelectedIds(new Set());
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRename = (id) => {
    if (editTitle.trim() && editTitle.trim() !== chatsData.find(c => c.id === id)?.title) {
      renameChatMutation.mutate({ id, title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const formatDate = (id) => {
    const time = Number(String(id).split('_').pop()) || 0;
    if (!time) return "";
    return new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col bg-card/40 backdrop-blur-2xl relative z-10 overflow-hidden shadow-2xl" style={{ paddingTop: '56px', height: '100%' }}>
      {/* Header Area */}
      <div className="flex-none px-6 md:px-12 py-5 border-b border-border/40">
        <div className="max-w-5xl mx-auto flex flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground leading-none">Chats</h1>
          
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                <span className="text-sm font-medium text-muted-foreground mr-1 hidden md:inline-block">
                  {selectedIds.size} selected
                </span>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkExport}
                  disabled={isExporting}
                  className="h-9 gap-2 bg-background/50 hover:bg-background"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export"}</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkArchive}
                  disabled={isArchiving}
                  className="h-9 gap-2 bg-background/50 hover:bg-background"
                >
                  <Archive size={14} />
                  <span className="hidden sm:inline">{isArchiving ? "Archiving..." : "Archive"}</span>
                </Button>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="h-9 px-3 gap-2"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedIds(new Set())}
                  className="h-9 hover:bg-muted/50 ml-1 text-muted-foreground"
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  <input 
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 bg-muted/30 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                  />
                </div>
                
                <div className="relative hidden md:block">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 pl-3 pr-8 bg-muted/30 border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer text-muted-foreground"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="title-asc">Alphabetical</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 px-6 md:px-12 py-6">
        <div className="max-w-5xl mx-auto h-full flex flex-col gap-4">
          
          {/* Global Select All */}
          {filteredChats.length > 0 && (
            <div className="flex items-center gap-3 px-3 flex-none pb-2">
              <button 
                onClick={handleSelectAll}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {selectedIds.size === filteredChats.length ? (
                  <CheckSquare size={18} className="text-primary" />
                ) : (
                  <Square size={18} />
                )}
              </button>
              <span className="text-sm font-medium text-muted-foreground select-none cursor-pointer" onClick={handleSelectAll}>
                Select All
              </span>
            </div>
          )}

          {filteredChats.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              {searchQuery ? "No chats found matching your search." : "You have no chat history."}
            </div>
          )}

          {filteredChats.length > 0 && (
            <GroupedVirtuoso
              style={{ height: '100%', width: '100%' }}
              groupCounts={groupCounts}
              className="scrollbar-thin"
              groupContent={(index) => (
                <div className="bg-card/40 backdrop-blur-xl py-2 z-10 sticky top-0">
                  <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest px-3">
                    {groupedKeys[index]}
                  </h3>
                </div>
              )}
              itemContent={(index) => {
                const chat = flattenedChats[index];
                const isSelected = selectedIds.has(chat.id);
                return (
                  <div className="pb-1">
                    <div 
                      onClick={() => onOpenChat(chat.id)}
                      className={`group flex items-center justify-between px-3 py-3 md:py-4 rounded-xl cursor-pointer transition-colors border border-transparent ${
                        isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <button 
                          onClick={(e) => toggleSelect(e, chat.id)}
                          className={`shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/70'}`}
                        >
                          {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                        
                        <MessageSquare size={18} className="text-muted-foreground/40 hidden md:block shrink-0" />
                        
                        {editingId === chat.id ? (
                          <input 
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleRename(chat.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRename(chat.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-background border border-primary text-foreground text-sm rounded px-2 w-full outline-none shadow-sm h-7"
                          />
                        ) : (
                          <span className="truncate font-medium text-foreground tracking-tight text-[15px]">
                            {chat.title}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0 pl-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(chat.id);
                            setEditTitle(chat.title);
                          }}
                          className="p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted/50 rounded-md transition-all hidden md:block"
                        >
                          <Edit2 size={14} />
                        </button>
                        
                        <span className="text-[13px] text-muted-foreground/60 hidden sm:block whitespace-nowrap">
                          {formatDate(chat.id)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
