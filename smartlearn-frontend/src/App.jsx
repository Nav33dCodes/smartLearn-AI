import React, { useEffect, useState, useCallback, useRef, Suspense, lazy } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, PanelLeftOpen } from "lucide-react";
import { Layers, BrainCircuit, Network, Ghost } from "lucide-react";
import { Toaster, toast } from 'sonner';
import { Routes, Route } from 'react-router-dom';

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import InputBox from "./components/InputBox";
import VoiceMode from "./components/VoiceMode";
import { useChats, useChatHistory, useShareChat } from "./hooks/useChats";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import ModelSelector, { MODELS } from "./components/ModelSelector";
import { MessageSquare, LayoutDashboard, Settings, LogOut, PanelLeftClose, Search, Menu, Send } from "lucide-react";

import { ArtifactProvider, useArtifacts } from "./context/ArtifactContext";
import ArtifactCanvas from "./components/ArtifactCanvas";

// Lazy Loaded Routes & Heavy Components
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const SharedChat = lazy(() => import("./pages/SharedChat"));
const ReleaseNotes = lazy(() => import("./pages/ReleaseNotes"));
const Landing = lazy(() => import("./pages/Landing"));
const ChatsManager = lazy(() => import("./components/ChatsManager"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

function ChatDashboard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeArtifact, isFullScreen } = useArtifacts();
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
  const [isVoiceModeActive, setIsVoiceModeActive] = useState(false);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("sl_theme_pro");
    return savedTheme !== null ? savedTheme === "true" : true;
  });
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem("sl_theme_color") || "#ff3131"; // default Red
  });
  const [selectedModelId, setSelectedModelId] = useState(() => {
    const saved = localStorage.getItem("sl_model");
    if (saved && MODELS.some(m => m.id === saved)) return saved;
    return "gemini:gemini-2.5-flash";
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



  // Dynamic Browser Tab Title
  useEffect(() => {
    if (loading) {
      document.title = "● Generating... | SmartLearn";
    } else {
      const isHidden = document.hidden;
      if (isHidden && activeMessages.length > 0 && activeMessages[activeMessages.length - 1].role === 'model') {
        document.title = "(1) SmartLearn AI";
      } else {
        document.title = "SmartLearn AI";
      }
    }
    
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading) {
        document.title = "SmartLearn AI";
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loading, activeMessages]);

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

  // When activeChatId changes, or when historyData refetches (e.g. tab focus),
  // sync the local messages with the server.
  // CRITICAL: Never overwrite during active streaming
  useEffect(() => {
    if (activeChatId && historyData?.messages) {
      if (!isStreamingRef.current) {
        // Compare lengths or last message to avoid unnecessary state updates if possible, 
        // but simply setting it works and ensures cross-tab synchronization.
        setActiveMessages(historyData.messages);
        loadedChatIdRef.current = activeChatId;
      }
    }
  }, [activeChatId, historyData]);

  const sendMessage = async (overrideText = null, searchWeb = "auto", imageData = null) => {
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
        body: JSON.stringify({ message: textToSend, chat_id: currentChatId, search_web: searchWeb, model: selectedModelId, image_data: imageData, is_private: isPrivateMode }),
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
          // Streaming finished, trigger background refetch to grab the LLM auto-generated title and finalize chat history!
          queryClient.invalidateQueries(['chats', user?.id]);
          queryClient.invalidateQueries(['chat', currentChatId]);
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
            
            if (typeof parsed.token === 'string') {
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
            updated.push({ role: "assistant", content: "⚠️ An error occurred or stream disconnected. Syncing..." });
            return updated;
          }
          if (updated[updated.length - 1].role === "user") {
            updated.push({ role: "assistant", content: "⚠️ An error occurred or stream disconnected. Syncing..." });
          } else {
            updated[updated.length - 1] = { role: "assistant", content: "⚠️ An error occurred or stream disconnected. Syncing..." };
          }
          return updated;
        });
        toast.error("Stream interrupted. Attempting to resync with server...");
        // If stream broke but backend finished, this will pull the complete message.
        queryClient.invalidateQueries(['chat', currentChatId]);
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
    if (loading) stopGeneration();
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

      <div className={`flex-1 flex flex-row h-full relative overflow-hidden transition-colors duration-500 ${isPrivateMode ? "bg-red-50/50 dark:bg-red-950/20" : "bg-background"}`}>
        <main className={`flex flex-col relative h-full overflow-hidden transition-all duration-300 ease-in-out ${activeArtifact && !isMobile ? 'w-1/2 shrink-0' : 'w-full flex-1'}`}>
          <header className={`absolute top-0 left-0 right-0 h-14 px-4 flex items-center justify-between z-40 backdrop-blur-md border-b transition-colors duration-300 ${isPrivateMode ? "bg-red-100/30 dark:bg-red-900/20 border-red-500/20" : "bg-white/70 dark:bg-[#000000]/70 border-black/5 dark:border-white/5"}`}>
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
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setIsPrivateMode(!isPrivateMode)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                isPrivateMode 
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                  : "text-muted-foreground hover:text-foreground border border-border hover:bg-muted"
              }`}
              title="Zero-Retention Private Mode"
            >
              <Ghost size={16} className={isPrivateMode ? "animate-pulse" : ""} />
              <span className="hidden sm:inline">{isPrivateMode ? "Incognito" : "Private Mode"}</span>
            </button>

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
                disabled={shareChatMutation.isPending || isPrivateMode}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isPrivateMode ? "opacity-50 cursor-not-allowed text-muted-foreground border border-border" : "text-muted-foreground hover:text-foreground border border-border hover:bg-muted"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                {shareChatMutation.isPending ? "Sharing..." : (chatsData.find(c => c.id === activeChatId)?.is_shared ? "Copy Link" : "Share")}
              </button>
            )}
          </div>
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
          <div className="flex-1 flex flex-col items-center justify-center px-4 w-full h-full relative z-10">
            <h1 className="text-4xl md:text-[42px] font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500 mb-8 text-center select-none">
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
                selectedModelId={selectedModelId}
                setSelectedModelId={setSelectedModelId}
                setIsVoiceModeActive={setIsVoiceModeActive}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl mt-12 px-4">
                <button 
                  onClick={() => {
                    setInput("Create a flashcard deck for: ");
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="flex flex-col items-start gap-4 p-4 rounded-2xl bg-zinc-50/50 dark:bg-[#111111]/50 hover:bg-white dark:hover:bg-[#1a1a1a] border border-black/5 dark:border-white/5 transition-all duration-300 text-left group shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                    <Layers size={14} className="text-zinc-600 dark:text-zinc-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1 tracking-wide">Generate Flashcards</h3>
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-500 leading-relaxed tracking-wide">Build a deck to memorize complex topics quickly</p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setInput("Give me a quick 3-question interactive quiz on: ");
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="flex flex-col items-start gap-4 p-4 rounded-2xl bg-zinc-50/50 dark:bg-[#111111]/50 hover:bg-white dark:hover:bg-[#1a1a1a] border border-black/5 dark:border-white/5 transition-all duration-300 text-left group shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                    <BrainCircuit size={14} className="text-zinc-600 dark:text-zinc-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1 tracking-wide">Interactive Quiz</h3>
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-500 leading-relaxed tracking-wide">Test your knowledge with multiple-choice questions</p>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    setInput("Draw a detailed mind map explaining: ");
                    setTimeout(() => textareaRef.current?.focus(), 50);
                  }}
                  className="flex flex-col items-start gap-4 p-4 rounded-2xl bg-zinc-50/50 dark:bg-[#111111]/50 hover:bg-white dark:hover:bg-[#1a1a1a] border border-black/5 dark:border-white/5 transition-all duration-300 text-left group shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                    <Network size={14} className="text-zinc-600 dark:text-zinc-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 mb-1 tracking-wide">Create Mind Map</h3>
                    <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-500 leading-relaxed tracking-wide">Visualize relationships and architectural structures</p>
                  </div>
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
              selectedModelId={selectedModelId}
              setSelectedModelId={setSelectedModelId}
              setIsVoiceModeActive={setIsVoiceModeActive}
            />
          </ErrorBoundary>
        )}
        </main>
        
        {/* The Right-Hand Artifact Canvas Panel (Smooth Transition Wrapper) */}
        {!isMobile && (
          <div className={`shrink-0 h-full transition-all duration-300 ease-in-out bg-[#0d0d0d] ${
            !activeArtifact 
              ? 'w-0 border-transparent overflow-hidden' 
              : isFullScreen 
                ? 'absolute inset-0 z-50 w-full' 
                : 'relative w-1/2 border-l border-white/5'
          }`}>
            {activeArtifact && <ArtifactCanvas activeChatId={activeChatId} />}
          </div>
        )}
        {/* Mobile Artifact Overlay (Full screen) */}
        {activeArtifact && isMobile && (
          <div className="absolute inset-0 z-50">
            <ArtifactCanvas activeChatId={activeChatId} />
          </div>
        )}

        {/* Global Voice Mode Overlay */}
        {isVoiceModeActive && (
          <VoiceMode 
            onClose={() => setIsVoiceModeActive(false)}
            sendMessage={sendMessage}
            loading={loading}
            activeMessages={activeMessages}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster 
        position="bottom-right" 
        duration={2500}
        toastOptions={{
          className: '!bg-[#1a1a1a] dark:!bg-[#fcfcfc] !text-white dark:!text-[#111111] !border-0 !shadow-[0_8px_30px_rgba(0,0,0,0.12)] !rounded-full !px-5 !py-3 !font-medium !text-[13px] !tracking-wide',
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
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route path="/app" element={
            <ProtectedRoute>
              <ArtifactProvider>
                <ChatDashboard />
              </ArtifactProvider>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </>
  );
}