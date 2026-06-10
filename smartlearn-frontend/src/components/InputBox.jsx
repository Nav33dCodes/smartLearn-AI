import React, { useRef, useEffect, useState, useCallback } from "react";
import { Paperclip, ArrowUp, Square, Loader2, FileText, X, Mic, Globe, Check, Plus } from "lucide-react";
import api from '../lib/axios';
import { Button } from "./ui/button";
import { useUploadPdf } from "../hooks/useChats";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function InputBox({ input, setInput, sendMessage, loading, stopGeneration, textareaRef, activeChatId, isEmpty }) {
  const fileInputRef = useRef(null);
  const uploadPdfMutation = useUploadPdf();
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchWeb, setSearchWeb] = useState("auto"); // "auto", "on", "off"
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const plusMenuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          
          const loadingToast = toast.loading("Transcribing audio...");
          
          try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");
            
            const res = await api.post('/api/voice', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (res.data?.text) {
              setInput(prev => (prev + " " + res.data.text).trim());
              toast.success("Transcribed!", { id: loadingToast });
              setTimeout(() => textareaRef.current?.focus(), 50);
            } else {
              toast.error("Could not transcribe audio.", { id: loadingToast });
            }
          } catch (err) {
            console.error("STT Error:", err);
            toast.error("Transcription failed.", { id: loadingToast });
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access error:", err);
        toast.error("Microphone access denied or not available.");
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input, textareaRef]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
    sendMessage(null, searchWeb);
    setAttachedFiles([]);
  };

  const uploadFile = (file) => {
    if (!file || !activeChatId) return;

    const fileId = Date.now().toString();
    setAttachedFiles(prev => [...prev, { id: fileId, file, status: "uploading", name: file.name }]);

    uploadPdfMutation.mutate({ file, chatId: activeChatId }, {
      onSuccess: () => {
        setAttachedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "success" } : f));
        toast.success(`Attached ${file.name}`);
      },
      onError: (err) => {
        setAttachedFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: "error" } : f));
        toast.error(`Upload failed: ${err.response?.data?.detail || err.message}`);
      },
      onSettled: () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const removeFile = (id) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const isValidType = file.type === "application/pdf" || file.name.match(/\.(txt|doc|docx)$/i);
      if (isValidType) uploadFile(file);
      else toast.error("Unsupported file type. Please upload PDF, TXT, or DOCX.");
    }
  }, [activeChatId]);

  return (
    <div className={isEmpty ? "w-full pointer-events-none relative" : "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-6 px-4 pointer-events-none"}>
      <div className="max-w-3xl mx-auto relative flex flex-col gap-2 pointer-events-auto w-full">
        
        {loading && (
          <div className="flex justify-center absolute -top-12 left-0 right-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full shadow-sm bg-background border-border text-xs font-medium gap-1.5 h-8"
              onClick={stopGeneration}
            >
              <Square size={12} className="fill-current" />
              Stop generating
            </Button>
          </div>
        )}

        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-card border shadow-sm rounded-2xl relative flex flex-col transition-all ${
            isDragging 
              ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
              : 'border-border focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent'
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
              <p className="font-medium text-primary">Drop document to attach</p>
            </div>
          )}

          {attachedFiles.length > 0 && (
            <div className="px-4 pt-3 flex flex-wrap gap-2">
              <AnimatePresence>
                {attachedFiles.map(file => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 bg-muted/60 border border-border rounded-lg px-3 py-1.5 max-w-[200px]"
                  >
                    {file.status === "uploading" ? (
                      <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />
                    ) : (
                      <FileText size={14} className={file.status === "error" ? "text-destructive" : "text-primary shrink-0"} />
                    )}
                    <span className="text-xs font-medium truncate flex-1 text-foreground">
                      {file.name}
                    </span>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted p-0.5 rounded transition-colors shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isDragging ? "Drop here..." : isRecording ? "Listening..." : "Message SmartLearn..."}
            className={`w-full max-h-[200px] bg-transparent resize-none border-0 px-4 pb-12 focus:outline-none focus:ring-0 text-[15px] placeholder:text-muted-foreground ${
              attachedFiles.length > 0 ? "pt-2" : "pt-3.5"
            }`}
            rows={1}
          />
          
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
            />
            
            <div className="relative" ref={plusMenuRef}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                title="Attachments and Options"
              >
                <Plus size={20} className={showPlusMenu ? "rotate-45 transition-transform duration-200" : "transition-transform duration-200"} />
              </Button>

              <AnimatePresence>
                {showPlusMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 w-56 bg-card border border-border shadow-xl rounded-2xl overflow-hidden z-50 flex flex-col p-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.click(); setShowPlusMenu(false); }}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted rounded-xl transition-colors text-foreground"
                      disabled={uploadPdfMutation.isPending || !activeChatId}
                    >
                      <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                        <FileText size={16} />
                      </div>
                      <span className="font-medium">Upload Document</span>
                    </button>
                    
                    <div className="h-px bg-border my-1.5 mx-2" />
                    
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      Web Search Mode
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => { setSearchWeb("auto"); setShowPlusMenu(false); }}
                      className={`flex items-center gap-3 px-3 py-2 text-[13px] hover:bg-muted rounded-xl transition-colors ${searchWeb === "auto" ? "text-blue-500 font-medium bg-blue-500/5" : "text-foreground"}`}
                    >
                      <Globe size={16} className={searchWeb === "auto" ? "text-blue-500" : "text-muted-foreground"} /> 
                      <div className="flex flex-col items-start">
                        <span>Auto Search</span>
                      </div>
                      {searchWeb === "auto" && <Check size={14} className="ml-auto" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setSearchWeb("on"); setShowPlusMenu(false); }}
                      className={`flex items-center gap-3 px-3 py-2 text-[13px] hover:bg-muted rounded-xl transition-colors ${searchWeb === "on" ? "text-primary font-medium bg-primary/5" : "text-foreground"}`}
                    >
                      <Globe size={16} className={searchWeb === "on" ? "text-primary" : "text-muted-foreground"} /> 
                      <div className="flex flex-col items-start">
                        <span>Always On</span>
                      </div>
                      {searchWeb === "on" && <Check size={14} className="ml-auto" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setSearchWeb("off"); setShowPlusMenu(false); }}
                      className={`flex items-center gap-3 px-3 py-2 text-[13px] hover:bg-muted rounded-xl transition-colors ${searchWeb === "off" ? "text-muted-foreground font-medium" : "text-foreground"}`}
                    >
                      <X size={16} className="text-muted-foreground" /> 
                      <div className="flex flex-col items-start">
                        <span>Disabled</span>
                      </div>
                      {searchWeb === "off" && <Check size={14} className="ml-auto text-muted-foreground" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-lg transition-colors ${isRecording ? 'text-destructive bg-destructive/10 hover:bg-destructive/20 hover:text-destructive' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={toggleRecording}
                title={isRecording ? "Stop recording" : "Use microphone"}
              >
                {isRecording ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Mic size={18} className="fill-current" />
                  </motion.div>
                ) : (
                  <Mic size={18} />
                )}
              </Button>

              <Button
                onClick={handleSend}
                disabled={(!input.trim() && attachedFiles.length === 0) || loading || attachedFiles.some(f => f.status === "uploading")}
                size="icon"
                className={`h-8 w-8 rounded-lg transition-all ${
                  (input.trim() || attachedFiles.length > 0) && !loading && !attachedFiles.some(f => f.status === "uploading")
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-muted text-muted-foreground opacity-50'
                }`}
              >
                <ArrowUp size={18} />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="text-center text-[11px] text-muted-foreground mt-1.5 px-4 font-medium">
          SmartLearn AI can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  );
}