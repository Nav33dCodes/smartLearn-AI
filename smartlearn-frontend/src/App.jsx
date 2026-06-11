import React, { useEffect, useState, useCallback, useRef, Suspense, lazy } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, PanelLeftOpen } from "lucide-react";
import { Layers, BrainCircuit, Network } from "lucide-react";
import { Toaster, toast } from 'sonner';
import { Routes, Route } from 'react-router-dom';

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";
import { useChats, useChatHistory, useShareChat } from "./hooks/useChats";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ModelSelector from "./components/ModelSelector";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy Loaded Routes & Heavy Components
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const SharedChat = lazy(() => import("./pages/SharedChat"));
const ReleaseNotes = lazy(() => import("./pages/ReleaseNotes"));
const Landing = lazy(() => import("./pages/Landing"));
const ChatsManager = lazy(() => import("./components/ChatsManager"));

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
  const { data: historyData, isFetching: isHistoryLoading } = useChatHistory(activeChatId);
  const [activeMessages, setActiveMessages] = useState([]);
  
  const [currentView, setCurrentView] = useState("chat"); // "chat" | "chats"
  const loadedChatIdRef = useRef(null);
  
  const isNewChat = activeChatId ? !chatsData.some(c => String(c.id) === String(activeChatId)) : true;
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("sl_theme_pro");
    return savedTheme !== null ? savedTheme === "true" : true;
  });
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem("sl_theme_color") || "#10b981"; // default Emerald
  });
  const [selectedModelId, setSelectedModelId] = useState(() => {
    return localStorage.getItem("sl_model") || "groq:llama-3.1-8b-instant";
  });
  const [isMobile, setIsMobile] = useState(false);

  const textareaRef = useRef(null);
  const isStreamingRef = useRef(false);
  const tokenQueueRef = useRef([]);
  const rafIdRef = useRef(null);

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

  useEffect(() => {
    localStorage.setItem("sl_model", selectedModelId);
  }, [selectedModelId]);

  const createNewChat = useCallback(() => {
    const newId = Date.now().toString();
    setActiveChatId(newId);
    loadedChatIdRef.current = newId;
    setActiveMessages([]);
    setCurrentView("chat");
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

  // When activeChatId changes, load its dynamic history ONLY ONCE
  // CRITICAL: Never overwrite during active streaming
  useEffect(() => {
    if (activeChatId && historyData?.messages) {
      if (loadedChatIdRef.current !== activeChatId && !isStreamingRef.current) {
        setActiveMessages(historyData.messages);
        loadedChatIdRef.current = activeChatId;
      }
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
    const userMessage = { role: "user", content: textToSend, timestamp: Date.now() };
    const newHistory = [...activeMessages, userMessage];
    setActiveMessages(newHistory);

    if (activeMessages.length === 0) {
      queryClient.setQueryData(['chats', user?.id], (old) => {
        const newChat = { id: currentChatId, title: textToSend.slice(0, 30), messages: newHistory };
        return [newChat, ...(old || [])];
      });
    }

    if (!overrideText) setInput("");
    setLoading(true);
    setStreamStatus(null);
    isStreamingRef.current = true;
    tokenQueueRef.current = [];

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ message: textToSend, chat_id: currentChatId, search_web: searchWeb, model: selectedModelId }),
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
            
            if (parsed.status) {
              setStreamStatus(parsed.status);
              if (parsed.urls && parsed.urls.length > 0) {
                setActiveMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (lastIdx < 0) {
                    updated.push({ role: "assistant", content: "", sources: parsed.urls, timestamp: Date.now() });
                    return updated;
                  }
                  if (updated[lastIdx].role === "assistant") {
                     updated[lastIdx] = { ...updated[lastIdx], sources: parsed.urls };
                  } else {
                     updated.push({ role: "assistant", content: "", sources: parsed.urls, timestamp: Date.now() });
                  }
                  return updated;
                });
              }
              continue;
            }
            
            if (parsed.token) {
              setStreamStatus(null);
              accumulated += parsed.token;
              // Smooth frontend token reveal via requestAnimationFrame
              tokenQueueRef.current.push(accumulated);
              if (!rafIdRef.current) {
                const processQueue = () => {
                  if (tokenQueueRef.current.length > 0) {
                    const latest = tokenQueueRef.current[tokenQueueRef.current.length - 1];
                    tokenQueueRef.current = [];
                    setActiveMessages(prev => {
                      const updated = [...prev];
                      const now = Date.now();
                      if (updated.length === 0) {
                        updated.push({ role: "assistant", content: latest, timestamp: now });
                        return updated;
                      }
                      const lastIdx = updated.length - 1;
                      if (updated[lastIdx].role === "user") {
                        updated.push({ role: "assistant", content: latest, timestamp: now });
                      } else {
                        const existingMsg = updated[lastIdx];
                        updated[lastIdx] = { ...existingMsg, role: "assistant", content: latest, timestamp: existingMsg.timestamp || now };
                      }
                      return updated;
                    });
                    rafIdRef.current = requestAnimationFrame(processQueue);
                  } else {
                    rafIdRef.current = null;
                  }
                };
                rafIdRef.current = requestAnimationFrame(processQueue);
              }
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setActiveMessages(prev => {
          const updated = [...prev];
          if (updated.length === 0) {
            updated.push({ role: "assistant", content: "⚠️ An error occurred. Please try again." });
            return updated;
          }
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
    isStreamingRef.current = false;
    // Flush remaining tokens
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (accumulated) {
      setActiveMessages(prev => {
        const updated = [...prev];
        if (updated.length === 0) return updated;
        const lastIdx = updated.length - 1;
        if (updated[lastIdx].role === "assistant") {
          updated[lastIdx] = { ...updated[lastIdx], content: accumulated };
        }
        return updated;
      });
    }
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
    <div className="flex h-screen mesh-bg text-foreground overflow-hidden">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeChatId={activeChatId}
        setActiveChatId={(id) => {
          setActiveChatId(id);
          setCurrentView("chat");
        }}
        chatsData={chatsData}
        createNewChat={createNewChat}
        currentView={currentView}
        setCurrentView={setCurrentView}
        isMobile={isMobile}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        themeColor={themeColor}
        setThemeColor={setThemeColor}
        isChatsLoading={isChatsLoading}
      />

      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden transition-all duration-300">
        <header className="absolute top-0 left-0 right-0 h-14 px-4 flex items-center justify-between z-40 glass border-b border-border/50">
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
            <ModelSelector selectedModelId={selectedModelId} onModelSelect={setSelectedModelId} />
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

        {currentView === "chats" ? (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center h-full"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>}>
            <ChatsManager 
               chatsData={chatsData} 
               onOpenChat={(id) => {
                 setActiveChatId(id);
                 setCurrentView("chat");
                 if (isMobile) setSidebarOpen(false);
               }} 
            />
          </Suspense>
        ) : activeMessages.length === 0 && (!isHistoryLoading || isNewChat) ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 w-full h-full relative z-10 pb-20">
            <h1 className="text-4xl md:text-[44px] font-semibold tracking-tight text-foreground mb-8 text-center">
              How can I help you today, {user?.name ? user.name.split(" ")[0] : "there"}?
            </h1>
            
            <div className="w-full max-w-3xl flex flex-col items-center">
              <InputBox 
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                loading={loading}
                stopGeneration={stopGeneration}
                textareaRef={textareaRef}
                activeChatId={activeChatId}
                isEmpty={true}
              />

              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <button 
                  onClick={() => {
                    setInput("Create a flashcard deck for: ");
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted hover:border-primary/50 text-sm font-medium transition-all shadow-sm group"
                >
                  <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Layers size={16} className="text-primary" />
                  </div>
                  <span className="text-foreground/80 group-hover:text-foreground">Flashcards</span>
                </button>
                <button 
                  onClick={() => {
                    setInput("Give me a quick 3-question interactive quiz on: ");
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted hover:border-primary/50 text-sm font-medium transition-all shadow-sm group"
                >
                  <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BrainCircuit size={16} className="text-primary" />
                  </div>
                  <span className="text-foreground/80 group-hover:text-foreground">Interactive Quiz</span>
                </button>
                <button 
                  onClick={() => {
                    setInput("Draw a detailed mind map explaining: ");
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-card hover:bg-muted hover:border-primary/50 text-sm font-medium transition-all shadow-sm group"
                >
                  <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Network size={16} className="text-primary" />
                  </div>
                  <span className="text-foreground/80 group-hover:text-foreground">Mind Map</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ErrorBoundary>
            <ChatWindow 
              messages={activeMessages} 
              loading={loading}
              streamStatus={streamStatus}
              isChatsLoading={isChatsLoading}
              isHistoryLoading={isHistoryLoading && !isNewChat}
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
              isEmpty={false}
            />
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster 
        position="bottom-right" 
        duration={2000}
        toastOptions={{
          className: 'border-l-4 border-l-primary bg-card text-foreground shadow-2xl !rounded-xl',
        }}
      />
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center mesh-bg"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/share/:shareId" element={<SharedChat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/releases" element={<ReleaseNotes />} />
          <Route path="/app" element={
            <ProtectedRoute>
              <ChatDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </>
  );
}