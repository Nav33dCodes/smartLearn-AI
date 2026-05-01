import { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Plus, Trash2, Bot, User, Sparkles, MessageSquare, FileText, Loader2, Square, RotateCw } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const API = "http://localhost:8000";

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);
  
  const [abortController, setAbortController] = useState(null);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load chats
  useEffect(() => {
    const saved = localStorage.getItem("all_chats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) setActiveChatId(parsed[0].id);
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("all_chats", JSON.stringify(chats));
  }, [chats]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Conversation",
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const deleteChat = (id) => {
    const filtered = chats.filter((c) => c.id !== id);
    setChats(filtered);
    if (filtered.length > 0) setActiveChatId(filtered[0].id);
    else createNewChat();
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, loading]);

  const updateMessages = (msgs) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId ? { ...chat, messages: msgs } : chat
      )
    );
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const streamText = async (text, controller) => {
    let current = "";
    for (let char of text) {
      if (controller.signal.aborted) break;
      
      current += char;
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChatId) {
            const newMsgs = [...chat.messages];
            newMsgs[newMsgs.length - 1] = { role: "assistant", content: current };
            return { ...chat, messages: newMsgs };
          }
          return chat;
        })
      );
      await new Promise((r) => setTimeout(r, 10));
    }
  };

  // 🐛 FIX: Addedd customHistory parameter to handle asynchronous React state during regeneration
  const sendMessage = async (overrideText = null, customHistory = null) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    const controller = new AbortController();
    setAbortController(controller);

    // 🐛 FIX: Use the injected history (if regenerating), otherwise use current state
    const baseHistory = customHistory || activeChat.messages;
    
    // 🐛 FIX: Clean the history to strip out UI-only elements before sending to the backend
    const validHistory = baseHistory
      .filter(m => m.content.trim() !== "")
      .map(m => ({ role: m.role, content: m.content }));

    const userMsg = { role: "user", content: textToSend };
    const newMsgs = [...baseHistory, userMsg, { role: "assistant", content: "" }];

    updateMessages(newMsgs);
    if (!overrideText) {
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      // 🐛 FIX: Send 'history' to the backend so Groq remembers the conversation
      const res = await axios.post(`${API}/chat`, { 
        message: textToSend,
        history: validHistory 
      }, { signal: controller.signal });
      
      await streamText(res.data.response, controller);

      if (activeChat.title === "New Conversation" && !controller.signal.aborted) {
        const title = textToSend.slice(0, 25) + (textToSend.length > 25 ? "..." : "");
        setChats((prev) => prev.map((c) => (c.id === activeChatId ? { ...c, title } : c)));
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled");
      } else {
        await streamText("⚠️ Sorry, I encountered an error. Please try again.", controller);
      }
    }

    setLoading(false);
    setAbortController(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setLoading(false);
      setAbortController(null);
    }
  };

  const regenerateLastMessage = () => {
    if (activeChat.messages.length < 2) return;
    
    const lastUserMsgIndex = activeChat.messages.map(m => m.role).lastIndexOf("user");
    if (lastUserMsgIndex === -1) return;
    
    const lastUserMsg = activeChat.messages[lastUserMsgIndex];
    
    // 🐛 FIX: Capture the exact history right before the regenerated prompt
    const historyBeforeRegenerate = activeChat.messages.slice(0, lastUserMsgIndex);
    
    updateMessages(historyBeforeRegenerate);
    
    // 🐛 FIX: Pass the precise history directly to bypass React's async state delay
    sendMessage(lastUserMsg.content, historyBeforeRegenerate);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);

    updateMessages([...activeChat.messages, { role: "assistant", content: "📄 Processing your document..." }]);

    try {
      await axios.post(`${API}/upload`, formData);
      updateMessages([...activeChat.messages, { role: "assistant", content: "✅ Document uploaded and ready! Ask me anything about it." }]);
    } catch {
      updateMessages([...activeChat.messages, { role: "assistant", content: "❌ Upload Failed. Please check the server." }]);
      setFileName(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20 hidden md:flex">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-200">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            SmartLearn AI
          </h1>
        </div>

        <div className="p-4">
          <button onClick={createNewChat} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95">
            <Plus size={18} />
            <span className="font-medium text-sm">New Conversation</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          <p className="px-2 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">Recent Chats</p>
          {chats.map((chat) => (
            <div key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${chat.id === activeChatId ? "bg-emerald-50 text-emerald-700 font-medium" : "hover:bg-slate-100 text-slate-600"}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className={chat.id === activeChatId ? "text-emerald-500" : "text-slate-400"} />
                <span className="text-sm truncate select-none">{chat.title}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} className={`opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded-md transition-all ${chat.id === activeChatId ? "hover:bg-emerald-100 text-emerald-600" : "text-slate-400 hover:text-red-500"}`}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-slate-50 to-emerald-50/20">
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 pb-40 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {activeChat?.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-80 mt-10">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                <Sparkles className="text-emerald-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-700 mb-2">How can I help you today?</h2>
              <p className="text-slate-500 max-w-md">Upload a document or type a message below to start learning and exploring.</p>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-6">
            {activeChat?.messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const isLastMsg = i === activeChat.messages.length - 1;
              if (!isUser && !msg.content && loading && isLastMsg) return null; 

              return (
                <div key={i} className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} group`}>
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm ${isUser ? "bg-slate-800 text-white" : "bg-white border border-slate-200 text-emerald-500"}`}>
                    {isUser ? <User size={18} /> : <Bot size={20} />}
                  </div>

                  <div className={`px-5 py-3.5 max-w-[85%] rounded-2xl leading-relaxed text-sm sm:text-base shadow-sm overflow-x-auto ${isUser ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-tr-sm shadow-emerald-500/20" : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"}`}>
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <div className="rounded-lg overflow-hidden my-3 border border-slate-200">
                                <div className="bg-slate-800 px-4 py-1 text-xs text-slate-400 flex justify-between items-center">
                                  <span>{match[1]}</span>
                                </div>
                                <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" customStyle={{ margin: 0, padding: '1rem' }} {...props}>
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className="bg-slate-100 text-emerald-600 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    
                    {!isUser && isLastMsg && !loading && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={regenerateLastMessage} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-500 transition-colors">
                          <RotateCw size={12} /> Regenerate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-4 flex-row">
                <div className="w-10 h-10 shrink-0 rounded-full bg-white border border-slate-200 text-emerald-500 flex items-center justify-center shadow-sm">
                  <Bot size={20} />
                </div>
                <div className="px-5 py-4 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-emerald-500" />
                  <span className="text-sm text-slate-500 font-medium">SmartLearn is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} className="h-4" />
          </div>
        </div>

        {/* --- FLOATING INPUT DOCK --- */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-10 pb-6 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            
            {loading && (
              <button 
                onClick={stopGeneration}
                className="mb-4 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-full text-xs font-medium text-slate-600 flex items-center gap-2 hover:bg-slate-50 hover:text-red-500 transition-colors"
              >
                <Square size={12} className="fill-current" /> Stop generating
              </button>
            )}

            <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden focus-within:ring-2 ring-emerald-500/20 transition-all duration-300">
              {fileName && (
                <div className="px-4 py-2 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <FileText size={14} /> Attached: {fileName}
                  <button onClick={() => setFileName(null)} className="ml-auto hover:text-red-500">Remove</button>
                </div>
              )}

              <div className="flex items-end gap-2 p-2">
                <label className="cursor-pointer p-3 mb-1 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors">
                  <Paperclip size={20} />
                  <input type="file" hidden onChange={handleUpload} />
                </label>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-0 py-3.5 px-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 text-base resize-none max-h-[150px] overflow-y-auto"
                  placeholder="Ask anything or explore a topic... (Shift + Enter for new line)"
                  rows={1}
                  disabled={loading}
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className={`p-3 mb-1 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    input.trim() && !loading
                      ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 hover:shadow-lg active:scale-95"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Send size={18} className={input.trim() && !loading ? "translate-x-0.5" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}