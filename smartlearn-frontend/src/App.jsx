import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Moon, Sun, PanelLeftOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";

// const API = "http://localhost:8000";
 const API = "https://smartlearn-ai-production.up.railway.app";

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const textareaRef = useRef(null);
  const activeChat = chats.find(c => c.id === activeChatId);

  // ── Initialization & Theme ──
  useEffect(() => {
    const saved = localStorage.getItem("sl_chats_pro");
    const savedTheme = localStorage.getItem("sl_theme_pro");
    
    if (savedTheme !== null) setDarkMode(savedTheme === "true");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) setActiveChatId(parsed[0].id);
      else createNewChat(true);
    } else {
      createNewChat(true);
    }

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("sl_chats_pro", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("sl_theme_pro", darkMode);
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ── Chat Management ──
  const createNewChat = useCallback(() => {
    const newChat = { id: Date.now(), title: "New chat", messages: [] };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    if (isMobile) setSidebarOpen(false);
    setInput("");
    setAttachedFile(null); 
    textareaRef.current?.focus();
  }, [isMobile]);

  const deleteChat = useCallback((id, e) => {
    e.stopPropagation();
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const fresh = { id: Date.now(), title: "New chat", messages: [] };
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (id === activeChatId) setActiveChatId(filtered[0].id);
      return filtered;
    });
  }, [activeChatId]);

  const updateMessages = useCallback((msgs, chatId) => {
    setChats(prev => prev.map(chat => chat.id === (chatId || activeChatId) ? { ...chat, messages: msgs } : chat));
  }, [activeChatId]);

  const editMessage = (msgIndex) => {
    if (!activeChat || loading) return;
    const msgToEdit = activeChat.messages[msgIndex];
    if (msgToEdit.role !== "user") return;

    const newHistory = activeChat.messages.slice(0, msgIndex);
    updateMessages(newHistory);
    setInput(msgToEdit.content);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // ── Core Communication ──
  const streamText = async (text, controller, chatId) => {
    const id = chatId || activeChatId;
    let current = "";
    const chunkSize = Math.max(1, Math.floor(text.length / 80)); 
    for (let i = 0; i < text.length; i += chunkSize) {
      if (controller.signal.aborted) break;
      current += text.substring(i, i + chunkSize);
      
      setChats(prev => prev.map(chat => {
        if (chat.id === id) {
          const msgs = [...chat.messages];
          msgs[msgs.length - 1] = { role: "assistant", content: current };
          return { ...chat, messages: msgs };
        }
        return chat;
      }));
      await new Promise(r => setTimeout(r, 8));
    }
    
    if (!controller.signal.aborted) {
      setChats(prev => prev.map(chat => chat.id === id ? { 
        ...chat, 
        messages: [...chat.messages.slice(0, -1), { role: "assistant", content: text }] 
      } : chat));
    }
  };

  const sendMessage = async (overrideText = null, customHistory = null) => {
    const textToSend = overrideText ?? input;
    if (!textToSend.trim() || loading) return;

    const controller = new AbortController();
    setAbortController(controller);

    const baseHistory = customHistory ?? activeChat.messages;
    const validHistory = baseHistory.filter(m => m.content.trim() !== "");
    
    const currentChatId = activeChatId;
    updateMessages([...baseHistory, { role: "user", content: textToSend }, { role: "assistant", content: "" }], currentChatId);

    if (!overrideText) {
      setInput("");
      setAttachedFile(null); 
    }
    setLoading(true);

    try {
      const res = await axios.post(`${API}/chat`, {
        message: textToSend,
        history: validHistory,
      }, { signal: controller.signal });

      await streamText(res.data.response, controller, currentChatId);

      setChats(prev => prev.map(c => {
        if (c.id === currentChatId && c.title === "New chat" && !controller.signal.aborted) {
          return { ...c, title: textToSend.slice(0, 30) + (textToSend.length > 30 ? "..." : "") };
        }
        return c;
      }));
    } catch (err) {
      if (!axios.isCancel(err)) {
        await streamText("⚠️ An error occurred. Please try again.", controller, currentChatId);
      }
    }

    setLoading(false);
    setAbortController(null);
    if (!isMobile) setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const stopGeneration = () => {
    abortController?.abort();
    setLoading(false);
    setAbortController(null);
  };

  const regenerateLastMessage = () => {
    if (!activeChat || activeChat.messages.length < 2) return;
    const lastUserIdx = [...activeChat.messages].map(m => m.role).lastIndexOf("user");
    if (lastUserIdx === -1) return;
    const historyBefore = activeChat.messages.slice(0, lastUserIdx);
    updateMessages(historyBefore);
    sendMessage(activeChat.messages[lastUserIdx].content, historyBefore);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setAttachedFile({ name: file.name, size: file.size });
    const formData = new FormData();
    formData.append("file", file);
    const currentChatId = activeChatId;

    try {
      await axios.post(`${API}/upload`, formData);
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          return { ...chat, messages: [...chat.messages, { role: "assistant", content: `✅ **${file.name}** is uploaded and processed! You can now ask questions about it.` }] };
        }
        return chat;
      }));
    } catch {
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          return { ...chat, messages: [...chat.messages, { role: "assistant", content: `❌ Failed to upload **${file.name}**. Please ensure the backend server is running.` }] };
        }
        return chat;
      }));
    } finally {
      setIsUploading(false);
      setAttachedFile(null); 
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg-main: #ffffff; --bg-sidebar: #f9f9f9; --bg-input: #ffffff;
          --bg-user-bubble: #f3f4f6; --bg-hover: #f3f4f6; --bg-header: rgba(255, 255, 255, 0.85);
          --text-primary: #111827; --text-secondary: #374151; --text-muted: #6b7280;
          --border-color: #e5e7eb; --accent-color: #10a37f;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05); --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-input: 0 0 15px rgba(0,0,0,0.08);
        }

        [data-theme="dark"] {
          --bg-main: #212121; --bg-sidebar: #171717; --bg-input: #2f2f2f;
          --bg-user-bubble: #2f2f2f; --bg-hover: #2a2a2a; --bg-header: rgba(33, 33, 33, 0.85);
          --text-primary: #ececec; --text-secondary: #b4b4b4; --text-muted: #666666;
          --border-color: #333333; --accent-color: #10a37f;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3); --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
          --shadow-input: 0 0 20px rgba(0,0,0,0.3);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background-color: var(--bg-main); color: var(--text-primary); height: 100vh; overflow: hidden; line-height: 1.6; -webkit-font-smoothing: antialiased; }
        .app-container { display: flex; height: 100vh; position: relative; }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; color: var(--text-muted); }

        /* ── SIDEBAR ── */
        .sidebar { background-color: var(--bg-sidebar); display: flex; flex-direction: column; z-index: 50; border-right: 1px solid var(--border-color); overflow: hidden; }
        .sidebar-top { padding: 16px 12px; display: flex; justify-content: space-between; align-items: center; width: 260px; }
        .sidebar-brand { display: flex; align-items: center; gap: 10px; padding-left: 6px; }
        .brand-text { font-size: 1.05rem; font-weight: 600; color: var(--text-primary); letter-spacing: -0.01em; }
        .sidebar-actions { display: flex; align-items: center; gap: 2px; }

        .search-container { padding: 0 12px 12px; width: 260px; }
        .search-box { display: flex; align-items: center; gap: 8px; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; transition: all 0.2s; }
        .search-box:focus-within { border-color: var(--text-muted); box-shadow: var(--shadow-sm); }
        .search-box input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-size: 0.85rem; outline: none; }
        
        .chat-list { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 0 12px 20px; width: 260px; }
        .chat-list::-webkit-scrollbar { width: 0; }
        .chat-list:hover::-webkit-scrollbar { width: 4px; }
        .chat-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
        .chat-list-title { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); padding: 12px 8px 8px; margin-top: 8px; }
        .chat-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; cursor: pointer; color: var(--text-secondary); font-size: 0.875rem; transition: background-color 0.2s; position: relative; }
        .chat-item:hover, .chat-item.active { background-color: var(--bg-hover); color: var(--text-primary); }
        .chat-item-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .btn-delete { opacity: 0; border: none; background: transparent; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s; }
        .chat-item:hover .btn-delete { opacity: 1; }
        .btn-delete:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

        /* ── MAIN AREA ── */
        .main-content { flex: 1; display: flex; flex-direction: column; position: relative; background-color: var(--bg-main); min-width: 0; }
        .header { height: 60px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; position: absolute; top: 0; left: 0; right: 0; z-index: 10; background: var(--bg-header); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.02); }
        .btn-icon { background: transparent; border: none; color: var(--text-secondary); padding: 8px; border-radius: 8px; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-icon:hover { background-color: var(--bg-hover); color: var(--text-primary); }

        .messages-scroll-area { flex: 1; overflow-y: auto; padding: 60px 0 160px 0; scroll-behavior: smooth; }
        .messages-scroll-area::-webkit-scrollbar { width: 6px; }
        .messages-scroll-area::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 6px; }
        .messages-container { max-width: 800px; margin: 0 auto; padding: 0 24px; display: flex; flex-direction: column; }

        .welcome-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 65vh; text-align: center; }
        .welcome-logo { width: 64px; height: 64px; border-radius: 50%; background: var(--bg-input); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); }
        .welcome-title { font-size: 2rem; font-weight: 600; margin-bottom: 4px; letter-spacing: -0.02em; color: var(--text-primary); }
        .welcome-subtitle { color: var(--text-muted); margin-bottom: 32px; font-size: 1.05rem; }
        .suggestions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: 100%; max-width: 640px; }
        @media (max-width: 600px) { .suggestions-grid { grid-template-columns: 1fr; } }
        .suggestion-card { padding: 16px; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 12px; font-size: 0.9rem; color: var(--text-secondary); text-align: left; cursor: pointer; box-shadow: var(--shadow-sm); transition: 0.2s; }
        .suggestion-card:hover { background: var(--bg-hover); color: var(--text-primary); box-shadow: var(--shadow-md); }

        /* ── REFINED CHAT LAYOUT ── */
        .message-wrapper { margin-bottom: 32px; display: flex; flex-direction: column; }
        
        .message-user-container { display: flex; justify-content: flex-end; width: 100%; padding-right: 4px; }
        .message-user-bubble { 
          background-color: var(--bg-user-bubble); 
          color: var(--text-primary); 
          padding: 14px 22px; 
          border-radius: 26px; 
          max-width: 70%; 
          font-size: 1rem; 
          line-height: 1.6; 
          font-weight: 400; 
          white-space: pre-wrap; 
        }
        
        .message-ai-container { display: flex; gap: 20px; width: 100%; }
        .ai-avatar { 
          width: 36px; height: 36px; 
          border-radius: 50%; 
          flex-shrink: 0; 
          border: 1px solid var(--border-color); 
          background: var(--bg-main);
          display: flex; align-items: center; justify-content: center; 
          box-shadow: var(--shadow-sm); 
          margin-top: 2px;
        }
        .ai-content { 
          flex: 1; 
          min-width: 0; 
          font-size: 1rem; 
          line-height: 1.75; 
          color: var(--text-primary); 
          padding-top: 4px; 
        }
        
        .msg-actions { display: flex; gap: 8px; margin-top: 8px; opacity: 0; transition: opacity 0.2s; }
        .message-wrapper:hover .msg-actions { opacity: 1; }
        .action-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 6px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
        .action-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

        .typing-indicator { display: flex; gap: 4px; padding: 12px 0; align-items: center; }
        .typing-indicator span { width: 6px; height: 6px; border-radius: 50%; background-color: var(--text-muted); animation: bounce 1.4s infinite ease-in-out both; }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        /* ── INPUT DOCK ── */
        .input-dock { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(180deg, transparent, var(--bg-main) 40%); padding: 0 24px 24px; }
        .input-container-inner { max-width: 800px; margin: 0 auto; position: relative; }
        
        .stop-wrapper { display: flex; justify-content: center; margin-bottom: 12px; }
        .btn-stop { display: flex; align-items: center; gap: 6px; background: var(--bg-main); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; color: var(--text-secondary); cursor: pointer; box-shadow: var(--shadow-sm); transition: all 0.2s; }
        .btn-stop:hover { background: var(--bg-hover); color: var(--text-primary); box-shadow: var(--shadow-md); }
        
        .composer { background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: 24px; display: flex; flex-direction: column; box-shadow: var(--shadow-input); overflow: hidden; }
        .composer:focus-within { border-color: var(--text-muted); box-shadow: var(--shadow-md); }
        .composer.has-attachment { border-radius: 16px; }

        .attachment-zone { padding: 12px 16px 0 16px; border-bottom: 1px solid transparent; }
        .file-card { display: flex; align-items: center; gap: 12px; background: var(--bg-main); border: 1px solid var(--border-color); padding: 10px 14px; border-radius: 12px; width: max-content; max-width: 100%; box-shadow: var(--shadow-sm); }
        .file-icon-wrapper { width: 40px; height: 40px; border-radius: 8px; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .file-details { display: flex; flex-direction: column; overflow: hidden; }
        .file-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        .file-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
        .btn-remove-file { background: var(--bg-hover); border: none; color: var(--text-muted); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; margin-left: 8px; flex-shrink: 0; }
        .btn-remove-file:hover { background: #fee2e2; color: #ef4444; }

        .composer-row { padding: 8px 12px; display: flex; align-items: flex-end; gap: 8px; }
        .btn-attach { background: transparent; border: none; color: var(--text-secondary); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; flex-shrink: 0; margin-bottom: 4px; }
        .btn-attach:hover { background: var(--bg-hover); color: var(--text-primary); }
        .composer-textarea { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-family: inherit; font-size: 1rem; padding: 10px 4px; resize: none; max-height: 200px; overflow-y: auto; line-height: 1.5; }
        .composer-textarea::placeholder { color: var(--text-muted); }
        .composer-textarea::-webkit-scrollbar { width: 0; }
        
        .btn-send { width: 36px; height: 36px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; cursor: pointer; flex-shrink: 0; }
        .btn-send.active { background-color: var(--text-primary); color: var(--bg-main); }
        .btn-send.inactive { background-color: var(--bg-hover); color: var(--text-muted); cursor: not-allowed; }
        
        .footer-text { text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 12px; }

        /* ── MARKDOWN STYLES ── */
        .md-p { margin-bottom: 1.125rem; }
        .md-p:last-child { margin-bottom: 0; }
        .md-ul, .md-ol { padding-left: 1.5rem; margin-bottom: 1.125rem; }
        .md-li { margin-bottom: 0.5rem; }
        .md-h1, .md-h2, .md-h3 { font-weight: 600; margin-top: 1.75rem; margin-bottom: 0.75rem; color: var(--text-primary); }
        .md-bq { border-left: 4px solid var(--border-color); padding-left: 1rem; margin: 1.125rem 0; color: var(--text-secondary); font-style: italic; }
        .md-link { color: var(--accent-color); text-decoration: none; font-weight: 500; }
        .md-link:hover { text-decoration: underline; }
        .table-wrap { overflow-x: auto; margin: 1.125rem 0; border: 1px solid var(--border-color); border-radius: 8px; box-shadow: var(--shadow-sm); }
        .md-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .md-table th, .md-table td { border-bottom: 1px solid var(--border-color); padding: 12px 16px; text-align: left; }
        .md-table th { background-color: var(--bg-input); font-weight: 600; }
        .inline-code { background-color: var(--bg-input); border: 1px solid var(--border-color); padding: 0.2em 0.4em; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.85em; }
        .code-block-wrapper { margin: 1.125rem 0; border-radius: 8px; overflow: hidden; background: #0d0d0d; box-shadow: var(--shadow-md); }
        .code-block-header { display: flex; align-items: center; justify-content: space-between; background: #212121; padding: 8px 16px; border-bottom: 1px solid #333; }
        .code-lang { font-size: 0.75rem; color: #b4b4b4; font-family: 'Inter', sans-serif; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
        .code-copy-btn { background: transparent; border: none; color: #b4b4b4; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 500; }

        .mobile-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 40; backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); }

        @media (max-width: 768px) {
          .sidebar { position: fixed; height: 100%; }
          .messages-container { padding: 0 16px; }
          .message-user-bubble { max-width: 90%; }
          .input-dock { padding: 0 16px 16px; }
        }
      `}</style>

      <div className="app-container">
        <Sidebar 
          chats={chats} activeChatId={activeChatId} setActiveChatId={setActiveChatId}
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} createNewChat={createNewChat}
          deleteChat={deleteChat} searchQuery={searchQuery} setSearchQuery={setSearchQuery} isMobile={isMobile}
        />

        <main className="main-content">
          <header className="header">
            <AnimatePresence>
              {!sidebarOpen && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                  className="btn-icon" onClick={() => setSidebarOpen(true)}
                >
                  <PanelLeftOpen size={20} />
                </motion.button>
              )}
            </AnimatePresence>
            <div style={{ flex: 1 }} />
            <motion.button whileTap={{ scale: 0.9 }} className="btn-icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </header>

          <ChatWindow 
            activeChat={activeChat} loading={loading} editMessage={editMessage}
            regenerateLastMessage={regenerateLastMessage} setInput={setInput} textareaRef={textareaRef}
          />

          <InputBox 
            input={input} setInput={setInput} loading={loading} sendMessage={sendMessage}
            stopGeneration={stopGeneration} handleUpload={handleUpload} attachedFile={attachedFile}
            setAttachedFile={setAttachedFile} isUploading={isUploading} textareaRef={textareaRef}
          />
        </main>
      </div>
    </>
  );
}