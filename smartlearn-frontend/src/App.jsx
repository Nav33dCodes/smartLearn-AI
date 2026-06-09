import React, { useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, PanelLeftOpen } from "lucide-react";
import { Toaster, toast } from 'sonner';

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";
import { useChats } from "./hooks/useChats";

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

export default function App() {
  const queryClient = useQueryClient();
  const { data: chatsData = [], isLoading: isChatsLoading } = useChats();
  
  // We use local state for the *active* session to handle streaming updates optimally
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("sl_theme_pro");
    if (savedTheme !== null) setDarkMode(savedTheme === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sl_theme_pro", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Set initial active chat
  useEffect(() => {
    if (!activeChatId && chatsData.length > 0) {
      setActiveChatId(chatsData[0].id);
      setActiveMessages(chatsData[0].messages || []);
    } else if (!activeChatId && !isChatsLoading) {
      createNewChat();
    }
  }, [chatsData, activeChatId, isChatsLoading]);

  // When activeChatId changes (user clicks sidebar), load its messages
  useEffect(() => {
    if (activeChatId) {
      const chat = chatsData.find(c => c.id === activeChatId);
      if (chat) {
        setActiveMessages(chat.messages || []);
      } else if (chatsData.length === 0) {
        setActiveMessages([]);
      }
    }
  }, [activeChatId, chatsData]);

  const createNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const newChat = { id: newId, title: "New chat", messages: [] };
    
    // Optimistically add to cache
    queryClient.setQueryData(['chats'], (old) => [newChat, ...(old || [])]);
    
    setActiveChatId(newId);
    setActiveMessages([]);
    if (isMobile) setSidebarOpen(false);
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [queryClient, isMobile]);

  const sendMessage = async (overrideText = null) => {
    const textToSend = overrideText ?? input;
    if (!textToSend.trim() || loading) return;

    const controller = new AbortController();
    setAbortController(controller);

    const currentChatId = activeChatId;

    // Optimistic UI Update - Only add the user message
    const newHistory = [
      ...activeMessages,
      { role: "user", content: textToSend }
    ];
    setActiveMessages(newHistory);

    if (!overrideText) setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, chat_id: currentChatId }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Streaming finished, update React Query cache so sidebar updates
          queryClient.setQueryData(['chats'], (old) => {
            if (!old) return old;
            return old.map(c => {
              if (c.id === currentChatId) {
                const finalMsgs = [...newHistory, { role: "assistant", content: accumulated }];
                return { ...c, messages: finalMsgs, title: c.title === "New chat" ? textToSend.slice(0, 30) : c.title };
              }
              return c;
            });
          });
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
      <Toaster position="top-center" theme={darkMode ? 'dark' : 'light'} />
      
      <Sidebar 
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        createNewChat={createNewChat}
        isMobile={isMobile}
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
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
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