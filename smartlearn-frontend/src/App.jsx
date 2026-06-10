import React, { useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, PanelLeftOpen } from "lucide-react";
import { Toaster, toast } from 'sonner';
import { Routes, Route } from 'react-router-dom';

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";
import { useChats, useChatHistory, useShareChat } from "./hooks/useChats";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import SharedChat from "./pages/SharedChat";
import ReleaseNotes from "./pages/ReleaseNotes";

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

function ChatDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: chatsData = [], isLoading: isChatsLoading } = useChats();
  const shareChatMutation = useShareChat();
  
  // We use local state for the *active* session to handle streaming updates optimally
  const [activeChatId, setActiveChatId] = useState(null);
  const { data: historyData } = useChatHistory(activeChatId);
  const [activeMessages, setActiveMessages] = useState([]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("sl_theme_pro");
    return savedTheme !== null ? savedTheme === "true" : true;
  });
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem("sl_theme_color") || "#10b981"; // default Emerald
  });
  const [isMobile, setIsMobile] = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("sl_theme_pro", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("sl_theme_color", themeColor);
    document.documentElement.style.setProperty("--primary", themeColor);
    document.documentElement.style.setProperty("--ring", themeColor);
  }, [themeColor]);

  const createNewChat = useCallback(() => {
    const newId = Date.now().toString();
    setActiveChatId(newId);
    setActiveMessages([]);
    if (isMobile) setSidebarOpen(false);
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [isMobile]);

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized && !isChatsLoading) {
      createNewChat();
      setHasInitialized(true);
    }
  }, [isChatsLoading, hasInitialized, createNewChat]);

  // When activeChatId changes, load its dynamic history
  useEffect(() => {
    if (activeChatId) {
      setActiveMessages(historyData?.messages || []);
    }
  }, [activeChatId, historyData]);

  const sendMessage = async (overrideText = null, searchWeb = "auto") => {
    const textToSend = overrideText ?? input;
    if (!textToSend.trim() || loading) return;

    const controller = new AbortController();
    setAbortController(controller);

    const currentChatId = activeChatId;
    const token = localStorage.getItem('access_token');

    // Optimistic UI Update - Only add the user message
    const newHistory = [
      ...activeMessages,
      { role: "user", content: textToSend }
    ];
    setActiveMessages(newHistory);

    if (activeMessages.length === 0) {
      queryClient.setQueryData(['chats', user?.id], (old) => {
        const newChat = { id: currentChatId, title: textToSend.slice(0, 30), messages: newHistory };
        return [newChat, ...(old || [])];
      });
    }

    if (!overrideText) setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ message: textToSend, chat_id: currentChatId, search_web: searchWeb }),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 401) {
            toast.error("Session expired. Please refresh the page.");
            throw new Error("Unauthorized");
        }
        throw new Error(`Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Streaming finished, trigger background refetch to grab the LLM auto-generated title!
          queryClient.invalidateQueries(['chats', user?.id]);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.done) break;
            if (parsed.token) {
              accumulated += parsed.token;
              // Update local state for smooth typing
              setActiveMessages(prev => {
                const updated = [...prev];
                if (updated[updated.length - 1].role === "user") {
                  updated.push({ role: "assistant", content: accumulated });
                } else {
                  updated[updated.length - 1] = { role: "assistant", content: accumulated };
                }
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setActiveMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1].role === "user") {
            updated.push({ role: "assistant", content: "⚠️ An error occurred. Please try again." });
          } else {
            updated[updated.length - 1] = { role: "assistant", content: "⚠️ An error occurred. Please try again." };
          }
          return updated;
        });
        toast.error("Failed to send message");
      }
    }

    setLoading(false);
    setAbortController(null);
    if (!isMobile) setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const regenerateMessage = () => {
    if (activeMessages.length < 2) return;
    
    // Find the last user message
    const lastUserMsgIndex = [...activeMessages].reverse().findIndex(m => m.role === "user");
    if (lastUserMsgIndex === -1) return;
    
    const actualIndex = activeMessages.length - 1 - lastUserMsgIndex;
    const userMsg = activeMessages[actualIndex];
    
    // Slice off everything after the last user message
    const historyBeforeUserMsg = activeMessages.slice(0, actualIndex);
    
    // Set the state back to before the user message, then send it again
    setActiveMessages(historyBeforeUserMsg);
    sendMessage(userMsg.content);
  };

  const stopGeneration = () => {
    abortController?.abort();
    setLoading(false);
    setAbortController(null);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar 
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        createNewChat={createNewChat}
        isMobile={isMobile}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
      />

      <main className="flex-1 flex flex-col relative min-w-0 transition-all duration-300">
        <header className="absolute top-0 left-0 right-0 h-14 px-4 flex items-center justify-between z-10 bg-background/80 backdrop-blur-md border-b">
          <div className="flex items-center gap-2">
            {(!sidebarOpen || isMobile) && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Open Sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
            )}
            <span className="text-sm font-medium text-muted-foreground ml-1">
              {chatsData.find(c => c.id === activeChatId)?.title || "Chat"}
            </span>
          </div>

          {activeChatId && activeMessages.length > 0 && (
            <button
              onClick={() => {
                const chat = chatsData.find(c => c.id === activeChatId);
                if (!chat) return;
                
                if (chat.is_shared && chat.share_id) {
                  const url = `${window.location.origin}/share/${chat.share_id}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Link copied to clipboard!");
                } else {
                  shareChatMutation.mutate(activeChatId, {
                    onSuccess: (data) => {
                      const url = `${window.location.origin}/share/${data.share_id}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Link generated and copied to clipboard!");
                    }
                  });
                }
              }}
              disabled={shareChatMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
              {shareChatMutation.isPending ? "Sharing..." : (chatsData.find(c => c.id === activeChatId)?.is_shared ? "Copy Link" : "Share")}
            </button>
          )}
        </header>

        <ChatWindow 
          messages={activeMessages} 
          loading={loading}
          isChatsLoading={isChatsLoading}
          onSuggestionClick={(text) => {
            setInput(text);
            setTimeout(() => textareaRef.current?.focus(), 50);
          }}
          regenerateMessage={regenerateMessage}
        />

        <InputBox 
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          loading={loading}
          stopGeneration={stopGeneration}
          textareaRef={textareaRef}
          activeChatId={activeChatId}
        />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/share/:shareId" element={<SharedChat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/releases" element={<ReleaseNotes />} />
        <Route path="/" element={
          <ProtectedRoute>
            <ChatDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}