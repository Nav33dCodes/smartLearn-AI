import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Moon, Sun, PanelLeftOpen, LogOut, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";
import Logo from "./components/Logo";

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});

// ── Logout Confirmation Modal ──
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 16px"
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-xl)",
          padding: "28px 28px 24px",
          width: "100%",
          maxWidth: "360px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          position: "relative"
        }}
      >
        {/* Close */}
        <button
          onClick={onCancel}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 28, height: 28, borderRadius: "var(--radius-sm)",
            border: "none", background: "transparent",
            color: "var(--text-muted)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <X size={15} />
        </button>

        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "var(--danger-soft)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16
        }}>
          <LogOut size={20} color="var(--danger)" />
        </div>

        {/* Text */}
        <h3 style={{
          fontSize: "1rem", fontWeight: 600,
          color: "var(--text-primary)", marginBottom: 6,
          letterSpacing: "-0.01em"
        }}>
          Sign out of SmartLearn?
        </h3>
        <p style={{
          fontSize: "0.875rem", color: "var(--text-muted)",
          lineHeight: 1.55, marginBottom: 24
        }}>
          Your chats are saved. You can sign back in anytime to continue where you left off.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "9px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "0.875rem", fontWeight: 500,
              cursor: "pointer", fontFamily: "var(--font-sans)",
              transition: "background 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "9px 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--danger)",
              color: "#fff",
              fontSize: "0.875rem", fontWeight: 500,
              cursor: "pointer", fontFamily: "var(--font-sans)",
              transition: "opacity 0.15s"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Sign out
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const textareaRef = useRef(null);
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId);

  // ── 401 interceptor ──
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // ── Auth guard ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setAuthChecked(true);
    }
  }, []);

  // ── Logout ──
  const handleLogoutRequest = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    setShowLogoutModal(false);
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  // ── ESC to close modal ──
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && showLogoutModal) setShowLogoutModal(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showLogoutModal]);

  // ── Init & Theme ──
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };

    const loadChats = async () => {
      try {
        const savedTheme = localStorage.getItem("sl_theme_pro");
        if (savedTheme !== null) setDarkMode(savedTheme === "true");

        const res = await axios.get(`${API}/chats`, getAuthHeaders());
        const backendChats = res.data.chats;

        if (backendChats && Object.keys(backendChats).length > 0) {
          const formatted = Object.entries(backendChats).map(([chatId, messages]) => ({
            id: chatId,
            title: messages[0]?.content?.slice(0, 30) || "Chat",
            messages
          }));

          if (formatted.length > 0) {
            setChats(formatted);
            setActiveChatId(formatted[0].id);
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

  // ── Chat Management ──
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
    e?.stopPropagation();
    try {
      await axios.delete(`${API}/chat/${id}`, getAuthHeaders());
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
    setChats(prev =>
      prev.map(chat =>
        chat.id === (chatId || activeChatId) ? { ...chat, messages: msgs } : chat
      )
    );
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

  // ── Streaming ──
  const streamText = async (text, controller, chatId) => {
    const id = chatId || activeChatId;
    let current = "";
    const chunkSize = Math.max(1, Math.floor(text.length / 80));
    for (let i = 0; i < text.length; i += chunkSize) {
      if (controller.signal.aborted) break;
      current += text.substring(i, i + chunkSize);
      setChats(prev =>
        prev.map(chat => {
          if (chat.id === id) {
            const msgs = [...chat.messages];
            msgs[msgs.length - 1] = { role: "assistant", content: current };
            return { ...chat, messages: msgs };
          }
          return chat;
        })
      );
      await new Promise(r => setTimeout(r, 8));
    }
    if (!controller.signal.aborted) {
      setChats(prev =>
        prev.map(chat =>
          chat.id === id
            ? { ...chat, messages: [...chat.messages.slice(0, -1), { role: "assistant", content: text }] }
            : chat
        )
      );
    }
  };

  // ── Send Message ──
  const sendMessage = async (overrideText = null, customHistory = null) => {
    const textToSend = overrideText ?? input;
    if (!textToSend.trim() || loading) return;

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);

    const baseHistory = customHistory ?? activeChat?.messages ?? [];
    const currentChatId = activeChatId;

    updateMessages(
      [...baseHistory, { role: "user", content: textToSend }, { role: "assistant", content: "" }],
      currentChatId
    );

    if (!overrideText) {
      setInput("");
      setAttachedFile(null);
    }
    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/chat`,
        { message: textToSend, chat_id: activeChatId || Date.now().toString() },
        { signal: controller.signal, ...getAuthHeaders() }
      );
      await streamText(res.data.response, controller, currentChatId);

      setChats(prev =>
        prev.map(c => {
          if (c.id === currentChatId && c.title === "New chat" && !controller.signal.aborted) {
            return { ...c, title: textToSend.slice(0, 30) + (textToSend.length > 30 ? "…" : "") };
          }
          return c;
        })
      );
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
      await axios.post(`${API}/upload`, formData, getAuthHeaders());
      setChats(prev =>
        prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, { role: "assistant", content: `✅ **${file.name}** uploaded and processed! Ask me anything about it.` }] }
            : chat
        )
      );
    } catch {
      setChats(prev =>
        prev.map(chat =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, { role: "assistant", content: `❌ Failed to upload **${file.name}**. Please check the server.` }] }
            : chat
        )
      );
    } finally {
      setIsUploading(false);
      setAttachedFile(null);
    }
  };

  if (!authChecked) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        /* ── DESIGN TOKENS ── */
        :root {
          --font-sans: 'DM Sans', system-ui, sans-serif;
          --font-mono: 'DM Mono', monospace;

          --bg-main:          #FAFAF8;
          --bg-sidebar:       #F4F3EF;
          --bg-input:         #FFFFFF;
          --bg-user-bubble:   #EEECEA;
          --bg-hover:         #EDECEA;
          --bg-header:        rgba(250,250,248,0.9);
          --bg-code:          #0F0F0E;
          --bg-code-header:   #1A1A18;

          --text-primary:     #18181A;
          --text-secondary:   #4A4A52;
          --text-muted:       #8F8F99;

          --border-color:     #E2E0DA;
          --border-subtle:    #EDECEA;

          --accent:           #2563EB;
          --accent-hover:     #1D4ED8;
          --accent-soft:      #EEF4FF;
          --danger:           #DC2626;
          --danger-soft:      #FEF2F2;
          --success:          #16A34A;

          --shadow-xs:    0 1px 2px rgba(0,0,0,0.04);
          --shadow-sm:    0 2px 8px rgba(0,0,0,0.06);
          --shadow-md:    0 4px 16px rgba(0,0,0,0.08);
          --shadow-input: 0 0 0 1px var(--border-color), 0 4px 20px rgba(0,0,0,0.07);
          --shadow-input-focus: 0 0 0 1px #93C5FD, 0 4px 20px rgba(37,99,235,0.08);

          --radius-sm:   6px;
          --radius-md:   10px;
          --radius-lg:   16px;
          --radius-xl:   22px;
          --radius-full: 9999px;

          /* Legacy compat */
          --accent-color: #2563EB;
          --bg-main-alias: #FAFAF8;
        }

        [data-theme="dark"] {
          --bg-main:          #141414;
          --bg-sidebar:       #0E0E0E;
          --bg-input:         #1E1E1E;
          --bg-user-bubble:   #252525;
          --bg-hover:         #222222;
          --bg-header:        rgba(20,20,20,0.9);
          --bg-code:          #0A0A0A;
          --bg-code-header:   #141414;

          --text-primary:     #F0EFE9;
          --text-secondary:   #B0AFA8;
          --text-muted:       #666660;

          --border-color:     #2A2A28;
          --border-subtle:    #222220;

          --accent:           #3B82F6;
          --accent-hover:     #2563EB;
          --accent-soft:      #1E2A3A;
          --danger:           #F87171;
          --danger-soft:      #2A1515;
          --success:          #4ADE80;

          --shadow-xs:    0 1px 2px rgba(0,0,0,0.2);
          --shadow-sm:    0 2px 8px rgba(0,0,0,0.3);
          --shadow-md:    0 4px 16px rgba(0,0,0,0.4);
          --shadow-input: 0 0 0 1px var(--border-color), 0 4px 20px rgba(0,0,0,0.3);
          --shadow-input-focus: 0 0 0 1px #3B82F6, 0 4px 20px rgba(59,130,246,0.1);

          --accent-color: #3B82F6;
          --bg-main-alias: #141414;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: var(--font-sans);
          background: var(--bg-main);
          color: var(--text-primary);
          height: 100vh;
          overflow: hidden;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .app-container { display: flex; height: 100vh; position: relative; }

        /* ── SIDEBAR ── */
        .sidebar {
          background: var(--bg-sidebar);
          display: flex;
          flex-direction: column;
          z-index: 50;
          border-right: 1px solid var(--border-color);
          overflow: hidden;
          width: 260px;
          flex-shrink: 0;
        }

        .sidebar-top {
          padding: 14px 12px 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .brand-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.2px;
        }

        .sidebar-actions { display: flex; gap: 3px; }

        .search-container { padding: 10px 12px 8px; }

        .search-box {
          display: flex;
          align-items: center;
          gap: 7px;
          background: var(--bg-hover);
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          padding: 7px 10px;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }

        .search-box:focus-within {
          background: var(--bg-input);
          border-color: var(--accent);
          box-shadow: var(--shadow-input-focus);
        }

        .search-box input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 13px;
          outline: none;
        }

        .search-box input::placeholder { color: var(--text-muted); }

        .search-kbd {
          font-size: 10px;
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 1px 5px;
          flex-shrink: 0;
        }

        .section-label {
          padding: 4px 14px 5px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .chat-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0 8px 8px;
        }

        .chat-list::-webkit-scrollbar { width: 3px; }
        .chat-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }

        .chat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 8px;
          border-radius: var(--radius-md);
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          transition: background 0.12s, border-color 0.12s;
          border: 1px solid transparent;
          margin-bottom: 1px;
        }

        .chat-item:hover { background: var(--bg-hover); }

        .chat-item.active {
          background: var(--accent-soft);
          border-color: #C7D9FF;
          color: var(--accent);
        }

        [data-theme="dark"] .chat-item.active { border-color: #1E3A5F; }

        .chat-item-text {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .chat-item-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.12s;
          flex-shrink: 0;
        }

        .chat-item:hover .chat-item-actions { opacity: 1; }

        .btn-delete {
          width: 24px; height: 24px;
          border: none; background: transparent;
          color: var(--text-muted); cursor: pointer;
          border-radius: 5px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.12s, color 0.12s;
        }

        .btn-delete:hover { background: var(--danger-soft); color: var(--danger); }

        .sidebar-empty {
          display: flex; flex-direction: column;
          align-items: center; padding: 32px 16px;
          gap: 8px; color: var(--text-muted); text-align: center;
        }

        .sidebar-empty-icon {
          width: 36px; height: 36px;
          background: var(--bg-hover); border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }

        .sidebar-footer {
          padding: 10px 10px 14px;
          border-top: 1px solid var(--border-color);
          display: flex; flex-direction: column; gap: 8px;
        }

        .btn-new-chat {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; padding: 8px 12px;
          border-radius: var(--radius-md);
          border: 1.5px dashed #93C5FD;
          background: transparent; color: var(--accent);
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: var(--font-sans);
          transition: background 0.15s, border-color 0.15s;
        }

        .btn-new-chat:hover { background: var(--accent-soft); border-color: var(--accent); }

        .btn-logout {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; padding: 8px 12px;
          border-radius: var(--radius-md);
          border: 1px solid color-mix(in srgb, var(--danger) 35%, transparent);
          background: transparent; color: var(--danger);
          font-size: 13px; font-weight: 500; cursor: pointer;
          font-family: var(--font-sans);
          transition: background 0.15s, border-color 0.15s;
        }

        .btn-logout:hover { background: var(--danger-soft); border-color: var(--danger); }

        /* ── MAIN ── */
        .main-content {
          flex: 1; display: flex; flex-direction: column;
          position: relative; background: var(--bg-main); min-width: 0;
        }

        .header {
          height: 56px; padding: 0 16px;
          display: flex; align-items: center; justify-content: space-between;
          position: absolute; top: 0; left: 0; right: 0; z-index: 10;
          background: var(--bg-header);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border-subtle);
        }

        .btn-icon {
          background: transparent; border: none;
          color: var(--text-secondary); padding: 8px;
          border-radius: var(--radius-md); cursor: pointer;
          transition: background 0.15s, color 0.15s;
          display: flex; align-items: center; justify-content: center;
        }

        .btn-icon:hover { background: var(--bg-hover); color: var(--text-primary); }

        /* ── MESSAGES ── */
        .messages-scroll-area {
          flex: 1; overflow-y: auto;
          padding: 56px 0 160px; scroll-behavior: smooth;
        }

        .messages-scroll-area::-webkit-scrollbar { width: 5px; }
        .messages-scroll-area::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 6px; }

        .messages-container {
          max-width: 780px; margin: 0 auto;
          padding: 0 28px; display: flex; flex-direction: column;
        }

        /* ── WELCOME ── */
        .welcome-screen {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 65vh; text-align: center;
        }

        .welcome-logo {
          width: 60px; height: 60px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }

        .welcome-title {
          font-size: 1.875rem; font-weight: 600;
          margin-bottom: 6px; letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .welcome-subtitle {
          color: var(--text-muted); margin-bottom: 36px;
          font-size: 1rem; font-weight: 300;
        }

        .suggestions-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 10px; width: 100%; max-width: 600px;
        }

        @media (max-width: 600px) { .suggestions-grid { grid-template-columns: 1fr; } }

        .suggestion-card {
          padding: 14px 16px;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          font-size: 0.875rem; color: var(--text-secondary);
          text-align: left; cursor: pointer; line-height: 1.5;
          transition: border-color 0.15s, box-shadow 0.15s, color 0.15s;
        }

        .suggestion-card:hover {
          border-color: var(--accent);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        /* ── CHAT MESSAGES ── */
        .message-wrapper { margin-bottom: 28px; display: flex; flex-direction: column; }

        .message-user-container { display: flex; justify-content: flex-end; width: 100%; }

        .message-user-bubble {
          background: var(--bg-user-bubble);
          color: var(--text-primary);
          padding: 12px 20px;
          border-radius: 20px 20px 5px 20px;
          max-width: 68%; font-size: 0.9375rem;
          line-height: 1.65; font-weight: 400; white-space: pre-wrap;
        }

        .message-ai-container { display: flex; gap: 16px; width: 100%; }

        .ai-avatar {
          width: 32px; height: 32px; border-radius: 9px;
          flex-shrink: 0; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          margin-top: 2px;
        }

        .ai-content {
          flex: 1; min-width: 0;
          font-size: 0.9375rem; line-height: 1.8;
          color: var(--text-primary); padding-top: 2px;
        }

        .msg-actions {
          display: flex; gap: 6px; margin-top: 10px;
          opacity: 0; transition: opacity 0.2s;
        }

        .message-wrapper:hover .msg-actions { opacity: 1; }

        .action-btn {
          background: transparent; border: none;
          color: var(--text-muted); cursor: pointer;
          padding: 5px 10px; border-radius: 6px;
          font-size: 0.75rem; font-weight: 500;
          font-family: var(--font-sans);
          display: flex; align-items: center; gap: 5px;
          transition: all 0.15s;
        }

        .action-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

        .typing-indicator {
          display: flex; gap: 4px; padding: 10px 0; align-items: center;
        }

        .typing-indicator span {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--text-muted);
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; color: var(--text-muted); }

        /* ── INPUT DOCK ── */
        .input-dock {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: linear-gradient(180deg, transparent, var(--bg-main) 45%);
          padding: 0 28px 24px;
        }

        .input-container-inner { max-width: 780px; margin: 0 auto; position: relative; }

        .stop-wrapper { display: flex; justify-content: center; margin-bottom: 10px; }

        .btn-stop {
          display: flex; align-items: center; gap: 6px;
          background: var(--bg-input); border: 1px solid var(--border-color);
          padding: 7px 16px; border-radius: var(--radius-full);
          font-size: 0.8rem; font-weight: 500; font-family: var(--font-sans);
          color: var(--text-secondary); cursor: pointer;
          box-shadow: var(--shadow-sm); transition: all 0.15s;
        }

        .btn-stop:hover {
          background: var(--bg-hover); color: var(--text-primary);
          box-shadow: var(--shadow-md);
        }

        .composer {
          background: var(--bg-input); border: 1px solid var(--border-color);
          border-radius: var(--radius-xl); display: flex; flex-direction: column;
          box-shadow: var(--shadow-input); overflow: hidden;
          transition: box-shadow 0.2s, border-color 0.2s;
        }

        .composer:focus-within {
          border-color: #93C5FD;
          box-shadow: var(--shadow-input-focus);
        }

        .composer.has-attachment { border-radius: var(--radius-lg); }

        .attachment-zone { padding: 12px 14px 0; }

        .file-card {
          display: flex; align-items: center; gap: 10px;
          background: var(--bg-hover); border: 1px solid var(--border-color);
          padding: 9px 12px; border-radius: var(--radius-md);
          width: max-content; max-width: 100%;
        }

        .file-icon-wrapper {
          width: 36px; height: 36px; border-radius: var(--radius-sm);
          background: var(--bg-main);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .file-details { display: flex; flex-direction: column; overflow: hidden; }

        .file-name {
          font-size: 0.85rem; font-weight: 600; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;
        }

        .file-meta { font-size: 0.72rem; color: var(--text-muted); margin-top: 1px; }

        .btn-remove-file {
          background: var(--bg-hover); border: none; color: var(--text-muted);
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.15s; margin-left: 6px; flex-shrink: 0;
        }

        .btn-remove-file:hover { background: var(--danger-soft); color: var(--danger); }

        .composer-row {
          padding: 8px 10px; display: flex; align-items: flex-end; gap: 6px;
        }

        .btn-attach {
          background: transparent; border: none; color: var(--text-muted);
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.15s; flex-shrink: 0; margin-bottom: 3px;
        }

        .btn-attach:hover { background: var(--bg-hover); color: var(--text-primary); }

        .composer-textarea {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text-primary); font-family: var(--font-sans);
          font-size: 0.9375rem; padding: 9px 4px;
          resize: none; max-height: 200px; overflow-y: auto; line-height: 1.55;
        }

        .composer-textarea::placeholder { color: var(--text-muted); }
        .composer-textarea::-webkit-scrollbar { width: 0; }

        .btn-send {
          width: 34px; height: 34px; border-radius: 50%; border: none;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 3px; cursor: pointer; flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
        }

        .btn-send:active { transform: scale(0.92); }
        .btn-send.active { background: var(--text-primary); color: var(--bg-main); }
        .btn-send.inactive { background: var(--bg-hover); color: var(--text-muted); cursor: not-allowed; }

        .footer-text {
          text-align: center; font-size: 0.72rem;
          color: var(--text-muted); margin-top: 10px;
        }

        /* ── MARKDOWN ── */
        .md-p { margin-bottom: 1rem; }
        .md-p:last-child { margin-bottom: 0; }
        .md-ul, .md-ol { padding-left: 1.5rem; margin-bottom: 1rem; }
        .md-li { margin-bottom: 0.4rem; }
        .md-h1 { font-size: 1.375rem; font-weight: 600; margin: 1.75rem 0 0.625rem; letter-spacing: -0.02em; }
        .md-h2 { font-size: 1.125rem; font-weight: 600; margin: 1.5rem 0 0.5rem; letter-spacing: -0.01em; }
        .md-h3 { font-size: 1rem; font-weight: 600; margin: 1.25rem 0 0.4rem; }
        .md-bq {
          border-left: 3px solid var(--border-color);
          padding-left: 1rem; margin: 1rem 0;
          color: var(--text-secondary); font-style: italic;
        }
        .md-link { color: var(--accent); text-decoration: none; font-weight: 500; }
        .md-link:hover { text-decoration: underline; }
        .table-wrap {
          overflow-x: auto; margin: 1rem 0;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md); box-shadow: var(--shadow-xs);
        }
        .md-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .md-table th, .md-table td {
          border-bottom: 1px solid var(--border-color); padding: 10px 14px; text-align: left;
        }
        .md-table th { background: var(--bg-hover); font-weight: 600; font-size: 0.8rem; letter-spacing: 0.02em; }
        .inline-code {
          background: var(--bg-hover); border: 1px solid var(--border-color);
          padding: 0.15em 0.45em; border-radius: 5px;
          font-family: var(--font-mono); font-size: 0.83em;
        }
        .code-block-wrapper {
          margin: 1rem 0; border-radius: var(--radius-md);
          overflow: hidden; background: var(--bg-code); box-shadow: var(--shadow-md);
        }
        .code-block-header {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--bg-code-header); padding: 7px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .code-lang {
          font-size: 0.72rem; color: #888; font-family: var(--font-mono);
          text-transform: uppercase; letter-spacing: 0.07em; font-weight: 500;
        }
        .code-copy-btn {
          background: transparent; border: none; color: #888; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          font-size: 0.75rem; font-weight: 500; font-family: var(--font-sans);
          transition: color 0.15s;
        }
        .code-copy-btn:hover { color: #ccc; }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .sidebar { position: fixed; height: 100%; }
          .messages-container { padding: 0 16px; }
          .message-user-bubble { max-width: 88%; }
          .input-dock { padding: 0 16px 16px; }
          .welcome-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="app-container">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          setActiveChatId={setActiveChatId}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          createNewChat={createNewChat}
          deleteChat={deleteChat}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isMobile={isMobile}
          logout={handleLogoutRequest}
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

            {/* Center logo in header when sidebar closed */}
            <AnimatePresence>
              {!sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute", left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex", alignItems: "center", gap: 8
                  }}
                >
                  <Logo size={22} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
                    SmartLearn
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ flex: 1 }} />
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
            activeChat={activeChat}
            loading={loading}
            editMessage={editMessage}
            regenerateLastMessage={regenerateLastMessage}
            setInput={setInput}
            textareaRef={textareaRef}
          />

          <InputBox
            input={input}
            setInput={setInput}
            loading={loading}
            sendMessage={sendMessage}
            stopGeneration={stopGeneration}
            handleUpload={handleUpload}
            attachedFile={attachedFile}
            setAttachedFile={setAttachedFile}
            isUploading={isUploading}
            textareaRef={textareaRef}
          />
        </main>
      </div>

      {/* ── Logout Confirmation Modal ── */}
      <AnimatePresence>
        {showLogoutModal && (
          <LogoutModal
            onConfirm={handleLogoutConfirm}
            onCancel={handleLogoutCancel}
          />
        )}
      </AnimatePresence>
    </>
  );
}