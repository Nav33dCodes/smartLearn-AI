import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Moon, Sun, PanelLeftOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);

    const loadChats = async () => {
      try {
        const savedTheme = localStorage.getItem("sl_theme_pro");
        if (savedTheme !== null) setDarkMode(savedTheme === "true");

        const res = await axios.get(`${API}/chats`);
        const backendChats = res.data.chats;

        if (backendChats && Object.keys(backendChats).length > 0) {
          const formatted = Object.entries(backendChats).map(([chatId, messages]) => ({
            id: chatId,
            title: messages[0]?.content?.slice(0, 30) || "Chat",
            messages
          }));

          const sorted = formatted.sort((a, b) => Number(b.id) - Number(a.id));

          if (sorted.length > 0) {
            setChats(sorted);
            setActiveChatId(sorted[0].id);
          } else {
            createNewChat();
          }
        } else {
          createNewChat();
        }
      } catch (err) {
        console.log("History load failed", err);
        createNewChat();
      }

      handleResize();
      window.addEventListener("resize", handleResize);
    };

    loadChats();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("sl_chats_pro", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("sl_theme_pro", darkMode);
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const createNewChat = useCallback(() => {
    const newChat = { id: Date.now().toString(), title: "New chat", messages: [] };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    if (isMobile) setSidebarOpen(false);
    setInput("");
    setAttachedFile(null);
    textareaRef.current?.focus();
  }, [isMobile]);

  const deleteChat = useCallback(async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/chat/${id}`);
    } catch (err) {
      console.log("Delete failed", err);
      return;
    }

    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const fresh = { id: Date.now().toString(), title: "New chat", messages: [] };
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (id === activeChatId) setActiveChatId(filtered[0].id);
      return filtered;
    });
  }, [activeChatId]);

  const updateMessages = useCallback((msgs, chatId) => {
    setChats(prev => prev.map(chat =>
      chat.id === (chatId || activeChatId) ? { ...chat, messages: msgs } : chat
    ));
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
      setChats(prev => prev.map(chat =>
        chat.id === id ? {
          ...chat,
          messages: [...chat.messages.slice(0, -1), { role: "assistant", content: text }]
        } : chat
      ));
    }
  };

  const sendMessage = async (overrideText = null, customHistory = null) => {
    const textToSend = overrideText ?? input;
    if (!textToSend.trim() || loading) return;

    const controller = new AbortController();
    setAbortController(controller);

    const baseHistory = customHistory ?? activeChat.messages;
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
        chat_id: activeChatId
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
      // ✅ FIXED: send chat_id so PDF is stored under the correct session
      await axios.post(`${API}/upload?chat_id=${currentChatId}`, formData);
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
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg-main: #f7f7f8;
          --bg-sidebar: #ffffff;
          --bg-input: #ffffff;
          --bg-user-bubble: #1a1a1a;
          --bg-hover: #f0f0f1;
          --bg-header: rgba(247,247,248,0.92);
          --bg-glass: rgba(255,255,255,0.7);
          --text-primary: #0d0d0d;
          --text-secondary: #444;
          --text-muted: #999;
          --border-color: #e8e8ea;
          --accent-color: #10a37f;
          --accent-hover: #0d8f6f;
          --user-text: #ffffff;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08);
          --shadow-input: 0 2px 20px rgba(0,0,0,0.07);
          --radius-sm: 8px;
          --radius-md: 14px;
          --radius-lg: 22px;
          --radius-xl: 28px;
        }

        [data-theme="dark"] {
          --bg-main: #1a1a1a;
          --bg-sidebar: #111111;
          --bg-input: #2a2a2a;
          --bg-user-bubble: #2a2a2a;
          --bg-hover: #252525;
          --bg-header: rgba(26,26,26,0.92);
          --bg-glass: rgba(26,26,26,0.8);
          --text-primary: #f0f0f0;
          --text-secondary: #b0b0b0;
          --text-muted: #606060;
          --border-color: #2e2e2e;
          --accent-color: #10a37f;
          --accent-hover: #12b78e;
          --user-text: #f0f0f0;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
          --shadow-input: 0 2px 20px rgba(0,0,0,0.35);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Sora', sans-serif;
          background-color: var(--bg-main);
          color: var(--text-primary);
          height: 100vh;
          overflow: hidden;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .app-container { display: flex; height: 100vh; position: relative; overflow: hidden; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.9s linear infinite; color: var(--text-muted); }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,163,127,0); }
          50% { box-shadow: 0 0 0 4px rgba(16,163,127,0.15); }
        }

        /* ── SIDEBAR ── */
        .sidebar {
          background-color: var(--bg-sidebar);
          display: flex;
          flex-direction: column;
          z-index: 50;
          border-right: 1px solid var(--border-color);
          overflow: hidden;
          transition: box-shadow 0.3s;
        }

        .sidebar-top {
          padding: 18px 14px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 260px;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-left: 4px;
        }

        .brand-text {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .sidebar-actions { display: flex; align-items: center; gap: 4px; }

        .search-container { padding: 12px 12px 8px; width: 260px; }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          transition: all 0.2s;
          position: relative;
        }

        .search-box:focus-within {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(16,163,127,0.1);
        }

        .search-box input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.82rem;
          font-family: 'Sora', sans-serif;
          outline: none;
        }

        .search-box input::placeholder { color: var(--text-muted); }

        .chat-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 4px 10px 24px;
          width: 260px;
        }

        .chat-list::-webkit-scrollbar { width: 3px; }
        .chat-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

        .chat-list-title {
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--text-muted);
          padding: 10px 6px 6px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .chat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 0.83rem;
          transition: background-color 0.15s, color 0.15s;
          position: relative;
          margin-bottom: 2px;
        }

        .chat-item:hover { background-color: var(--bg-hover); color: var(--text-primary); }
        .chat-item.active {
          background-color: var(--bg-hover);
          color: var(--text-primary);
          font-weight: 500;
        }

        .chat-item-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.83rem;
        }

        .btn-delete {
          opacity: 0;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px 5px;
          border-radius: 5px;
          transition: all 0.15s;
          display: flex;
          align-items: center;
        }

        .chat-item:hover .btn-delete { opacity: 1; }
        .btn-delete:hover { color: #ef4444; background: rgba(239,68,68,0.08); }

        /* ── MAIN ── */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          background-color: var(--bg-main);
          min-width: 0;
        }

        .header {
          height: 58px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: absolute;
          top: 0; left: 0; right: 0;
          z-index: 10;
          background: var(--bg-header);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
        }

        .header-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: -0.01em;
          opacity: 0.8;
        }

        .btn-icon {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background-color 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-icon:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        /* ── MESSAGES ── */
        .messages-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 58px 0 168px 0;
          scroll-behavior: smooth;
        }

        .messages-scroll-area::-webkit-scrollbar { width: 5px; }
        .messages-scroll-area::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 6px; }

        .messages-container {
          max-width: 780px;
          margin: 0 auto;
          padding: 20px 28px 0;
          display: flex;
          flex-direction: column;
        }

        /* ── WELCOME ── */
        .welcome-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 62vh;
          text-align: center;
          animation: fadeSlideUp 0.5s ease both;
        }

        .welcome-logo {
          width: 68px;
          height: 68px;
          border-radius: 20px;
          background: var(--bg-input);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }

        .welcome-title {
          font-size: 1.9rem;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .welcome-subtitle {
          color: var(--text-muted);
          margin-bottom: 36px;
          font-size: 1rem;
          font-weight: 400;
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          width: 100%;
          max-width: 620px;
        }

        @media (max-width: 600px) { .suggestions-grid { grid-template-columns: 1fr; } }

        .suggestion-card {
          padding: 14px 16px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          line-height: 1.5;
          font-weight: 400;
        }

        .suggestion-card:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--accent-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        /* ── MESSAGES ── */
        .message-wrapper { margin-bottom: 28px; display: flex; flex-direction: column; }

        .message-user-container {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }

        .message-user-bubble {
          background-color: var(--bg-user-bubble);
          color: var(--user-text);
          padding: 13px 20px;
          border-radius: 20px 20px 5px 20px;
          max-width: 72%;
          font-size: 0.95rem;
          line-height: 1.65;
          font-weight: 400;
          white-space: pre-wrap;
          box-shadow: var(--shadow-sm);
        }

        .message-ai-container {
          display: flex;
          gap: 16px;
          width: 100%;
        }

        .ai-avatar {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          flex-shrink: 0;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          margin-top: 2px;
        }

        .ai-content {
          flex: 1;
          min-width: 0;
          font-size: 0.95rem;
          line-height: 1.8;
          color: var(--text-primary);
          padding-top: 2px;
        }

        .msg-actions {
          display: flex;
          gap: 4px;
          margin-top: 6px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .message-wrapper:hover .msg-actions { opacity: 1; }

        .action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 5px 9px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 500;
          font-family: 'Sora', sans-serif;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: all 0.15s;
          letter-spacing: 0.01em;
        }

        .action-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        /* ── TYPING ── */
        .typing-indicator {
          display: flex;
          gap: 5px;
          padding: 10px 0;
          align-items: center;
        }

        .typing-indicator span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: var(--accent-color);
          opacity: 0.4;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0s; }

        /* ── INPUT DOCK ── */
        .input-dock {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(to bottom, transparent, var(--bg-main) 38%);
          padding: 0 28px 22px;
        }

        .input-container-inner {
          max-width: 780px;
          margin: 0 auto;
          position: relative;
        }

        .stop-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }

        .btn-stop {
          display: flex;
          align-items: center;
          gap: 7px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 500;
          font-family: 'Sora', sans-serif;
          color: var(--text-secondary);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }

        .btn-stop:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          box-shadow: var(--shadow-md);
        }

        .composer {
          background-color: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-input);
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .composer:focus-within {
          border-color: rgba(16,163,127,0.4);
          box-shadow: var(--shadow-md), 0 0 0 3px rgba(16,163,127,0.07);
        }

        .composer.has-attachment { border-radius: var(--radius-lg); }

        .attachment-zone { padding: 12px 14px 0; }

        .file-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          width: max-content;
          max-width: 100%;
          box-shadow: var(--shadow-sm);
        }

        .file-icon-wrapper {
          width: 38px; height: 38px;
          border-radius: var(--radius-sm);
          background: var(--bg-hover);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .file-details { display: flex; flex-direction: column; overflow: hidden; }

        .file-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        .file-meta { font-size: 0.73rem; color: var(--text-muted); margin-top: 2px; }

        .btn-remove-file {
          background: var(--bg-hover);
          border: none;
          color: var(--text-muted);
          width: 22px; height: 22px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          margin-left: 8px;
          flex-shrink: 0;
        }

        .btn-remove-file:hover { background: #fee2e2; color: #ef4444; }

        .composer-row {
          padding: 8px 10px;
          display: flex;
          align-items: flex-end;
          gap: 6px;
        }

        .btn-attach {
          background: transparent;
          border: none;
          color: var(--text-muted);
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
          margin-bottom: 2px;
        }

        .btn-attach:hover { background: var(--bg-hover); color: var(--text-primary); }

        .composer-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          padding: 9px 4px;
          resize: none;
          max-height: 200px;
          overflow-y: auto;
          line-height: 1.55;
        }

        .composer-textarea::placeholder { color: var(--text-muted); }
        .composer-textarea::-webkit-scrollbar { width: 0; }

        .btn-send {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: none;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 2px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .btn-send.active {
          background-color: var(--accent-color);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(16,163,127,0.35);
        }

        .btn-send.active:hover {
          background-color: var(--accent-hover);
          transform: scale(1.05);
        }

        .btn-send.inactive {
          background-color: var(--bg-hover);
          color: var(--text-muted);
          cursor: not-allowed;
        }

        .footer-text {
          text-align: center;
          font-size: 0.71rem;
          color: var(--text-muted);
          margin-top: 10px;
          letter-spacing: 0.01em;
        }

        /* ── MARKDOWN ── */
        .md-p { margin-bottom: 1rem; }
        .md-p:last-child { margin-bottom: 0; }
        .md-ul, .md-ol { padding-left: 1.4rem; margin-bottom: 1rem; }
        .md-li { margin-bottom: 0.4rem; }
        .md-h1 { font-size: 1.35rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.6rem; letter-spacing: -0.02em; }
        .md-h2 { font-size: 1.15rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.6rem; letter-spacing: -0.01em; }
        .md-h3 { font-size: 1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .md-h1, .md-h2, .md-h3 { color: var(--text-primary); }
        .md-bq {
          border-left: 3px solid var(--accent-color);
          padding: 8px 16px;
          margin: 1rem 0;
          color: var(--text-secondary);
          font-style: italic;
          background: rgba(16,163,127,0.04);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        }
        .md-link { color: var(--accent-color); text-decoration: none; font-weight: 500; }
        .md-link:hover { text-decoration: underline; }
        .md-hr { border: none; border-top: 1px solid var(--border-color); margin: 1.5rem 0; }

        .table-wrap {
          overflow-x: auto;
          margin: 1rem 0;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
        }

        .md-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .md-table th, .md-table td { border-bottom: 1px solid var(--border-color); padding: 10px 16px; text-align: left; }
        .md-table th { background-color: var(--bg-hover); font-weight: 600; font-size: 0.8rem; letter-spacing: 0.02em; }
        .md-table tr:last-child td { border-bottom: none; }
        .md-table tr:hover td { background: var(--bg-hover); }

        .inline-code {
          background-color: var(--bg-hover);
          border: 1px solid var(--border-color);
          padding: 0.15em 0.45em;
          border-radius: 5px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82em;
          color: var(--accent-color);
        }

        .code-block-wrapper {
          margin: 1rem 0;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #0d0d0d;
          box-shadow: var(--shadow-md);
          border: 1px solid #222;
        }

        .code-block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #181818;
          padding: 9px 16px;
          border-bottom: 1px solid #2a2a2a;
        }

        .code-lang {
          font-size: 0.7rem;
          color: #888;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          font-weight: 500;
          letter-spacing: 0.08em;
        }

        .code-copy-btn {
          background: transparent;
          border: 1px solid #333;
          color: #888;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          font-weight: 500;
          font-family: 'Sora', sans-serif;
          padding: 4px 10px;
          border-radius: 5px;
          transition: all 0.15s;
        }

        .code-copy-btn:hover { background: #252525; color: #ccc; border-color: #444; }

        /* ── MOBILE ── */
        .mobile-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.55);
          z-index: 40;
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }

        /* Shortcut badge */
        .kbd-badge {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 0.65rem;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        @media (max-width: 768px) {
          .sidebar { position: fixed; height: 100%; }
          .messages-container { padding: 16px 16px 0; }
          .message-user-bubble { max-width: 88%; }
          .input-dock { padding: 0 16px 18px; }
          .header-title { display: none; }
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
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  className="btn-icon"
                  onClick={() => setSidebarOpen(true)}
                >
                  <PanelLeftOpen size={19} />
                </motion.button>
              )}
            </AnimatePresence>

            <div className="header-title">
              {activeChat?.title && activeChat.title !== "New chat" ? activeChat.title : "SmartLearn AI"}
            </div>

            <motion.button
              whileTap={{ scale: 0.88 }}
              className="btn-icon"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
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