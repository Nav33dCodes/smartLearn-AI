import React, { useRef, useEffect, useState, useCallback } from "react";
import { ArrowRight, BrainCircuit, Zap, Shield, FileText, Sparkles, Code2, Database, PlaySquare, Image as ImageIcon, CheckCircle2, Cpu, Network, Globe, Mail, ChevronDown, Lock, BookOpen, HelpCircle, Search, Trash2, Paperclip, ArrowUp, Square, Loader2, X, Mic, Plus, Check, Headphones } from 'lucide-react';
import api from '../lib/axios';
import { Button } from "./ui/button";
import { useUploadPdf } from "../hooks/useChats";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ModelSelector from "./ModelSelector";

export default function InputBox({ input, setInput, sendMessage, loading, stopGeneration, textareaRef, activeChatId, isEmpty, selectedModelId, setSelectedModelId, setIsVoiceModeActive }) {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const uploadPdfMutation = useUploadPdf();
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedImage, setAttachedImage] = useState(null);
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
            
            const res = await api.post('/api/voice', formData);
            
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
    
    const fileListStr = attachedFiles.length > 0 
      ? attachedFiles.map(f => `[FILE:${f.name}]`).join('\n') + '\n\n'
      : "";
      
    const baseInput = input.trim() ? input.trim() : attachedImage ? "Please analyze the attached image." : "Please analyze the attached document(s).";
    const messageToSend = fileListStr + baseInput;
    
    sendMessage(messageToSend, searchWeb, attachedImage);
    setAttachedFiles([]);
    setAttachedImage(null);
    setInput("");
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

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to 70% quality JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve({ dataUrl, name: file.name });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const loadingToast = toast.loading("Compressing image...");
      try {
        const compressed = await compressImage(file);
        setAttachedImage(compressed.dataUrl);
        toast.success("Image attached successfully", { id: loadingToast });
      } catch (err) {
        toast.error("Failed to process image", { id: loadingToast });
      }
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
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
      const isImage = file.type.startsWith("image/");
      
      if (isValidType) {
        uploadFile(file);
      } else if (isImage) {
        handleImageChange({ target: { files: [file] } });
      } else {
        toast.error("Unsupported file type. Please upload PDF, TXT, DOCX, or Images.");
      }
    }
  }, [activeChatId]);

  return (
    <div className={isEmpty ? "w-full pointer-events-none relative" : "absolute bottom-0 left-0 right-0 pt-8 pb-6 px-4 pointer-events-none z-50 bg-gradient-to-t from-background via-background/90 to-transparent"}>
      <div className="max-w-3xl mx-auto relative flex flex-col gap-2 pointer-events-auto w-full">
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-[#fcfcfc] dark:bg-[#1a1a1a] shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-none rounded-[24px] border border-black/5 dark:border-white/10 relative flex flex-col transition-all duration-300 ${
            isDragging 
              ? 'ring-2 ring-indigo-500/50 bg-indigo-500/5 dark:bg-indigo-500/10' 
              : 'focus-within:border-black/10 dark:focus-within:border-white/20 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-[32px]">
              <p className="font-medium text-primary">Drop document or image to attach</p>
            </div>
          )}

          {(attachedFiles.length > 0 || attachedImage) && (
            <div className="px-4 pt-3 flex flex-wrap gap-2">
              <AnimatePresence>
                {attachedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 bg-muted/60 border border-border rounded-lg px-2 py-1 max-w-[200px]"
                  >
                    <img src={attachedImage} alt="Attached" className="h-6 w-6 object-cover rounded shadow-sm" />
                    <span className="text-xs font-medium truncate flex-1 text-foreground">
                      Attached Image
                    </span>
                    <button 
                      onClick={() => setAttachedImage(null)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted p-0.5 rounded transition-colors shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                )}
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
            className={`w-full max-h-[200px] bg-transparent resize-none border-0 px-6 pb-12 focus:outline-none focus:ring-0 text-[15px] placeholder:text-muted-foreground ${
              (attachedFiles.length > 0 || attachedImage) ? "pt-2" : "pt-4"
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
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="flex items-center gap-2">
              <div className="relative" ref={plusMenuRef}>
                <button
                  type="button"
                  className="h-8 w-8 text-zinc-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full transition-colors flex items-center justify-center shrink-0"
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  title="Attachments and Options"
                >
                  <Plus size={18} className={showPlusMenu ? "rotate-45 transition-transform duration-300" : "transition-transform duration-300"} strokeWidth={2.5} />
                </button>

              <AnimatePresence>
                {showPlusMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 w-[180px] bg-[#0a0a0a] border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-[100] flex flex-col p-1.5 backdrop-blur-xl"
                  >
                    <button
                      type="button"
                      onClick={() => { fileInputRef.current?.click(); setShowPlusMenu(false); }}
                      className="flex items-center justify-between px-3 py-2 text-left transition-colors duration-200 group hover:bg-white/5 rounded-lg"
                      disabled={uploadPdfMutation.isPending || !activeChatId}
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-zinc-500 group-hover:text-zinc-300" />
                        <span className="text-[13px] tracking-wide text-zinc-400 group-hover:text-zinc-100">Upload Document</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => { imageInputRef.current?.click(); setShowPlusMenu(false); }}
                      className="flex items-center justify-between px-3 py-2 text-left transition-colors duration-200 group hover:bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <ImageIcon size={14} className="text-zinc-500 group-hover:text-zinc-300" />
                        <span className="text-[13px] tracking-wide text-zinc-400 group-hover:text-zinc-100">Upload Image</span>
                      </div>
                    </button>
                    
                    <div className="h-px bg-white/5 my-1 mx-2" />
                    
                    <button
                      type="button"
                      onClick={() => { setSearchWeb("auto"); setShowPlusMenu(false); }}
                      className="flex items-center justify-between px-3 py-2 text-left transition-colors duration-200 group hover:bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Globe size={14} className={searchWeb === "auto" ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-300"} /> 
                        <span className={`text-[13px] tracking-wide ${searchWeb === "auto" ? "font-medium text-zinc-100" : "text-zinc-400 group-hover:text-zinc-100"}`}>Web Search</span>
                      </div>
                      {searchWeb === "auto" && <Check size={14} className="text-zinc-300 shrink-0" />}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => { setSearchWeb("off"); setShowPlusMenu(false); }}
                      className="flex items-center justify-between px-3 py-2 text-left transition-colors duration-200 group hover:bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <X size={14} className={searchWeb === "off" ? "text-zinc-300" : "text-zinc-500 group-hover:text-zinc-300"} /> 
                        <span className={`text-[13px] tracking-wide ${searchWeb === "off" ? "font-medium text-zinc-100" : "text-zinc-400 group-hover:text-zinc-100"}`}>No Web</span>
                      </div>
                      {searchWeb === "off" && <Check size={14} className="text-zinc-300 shrink-0" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {loading ? (
                <button
                  onClick={stopGeneration}
                  type="button"
                  className="h-8 w-8 rounded-full bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700 hover:bg-red-500/20 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-500 transition-all flex items-center justify-center shrink-0"
                  title="Stop generating"
                >
                  <Square size={12} className="fill-current" />
                </button>
              ) : (input.trim() || attachedFiles.length > 0 || attachedImage) ? (
                <button
                  onClick={handleSend}
                  disabled={attachedFiles.some(f => f.status === "uploading")}
                  className={`h-8 w-8 rounded-full transition-all flex items-center justify-center shrink-0 ${
                    !attachedFiles.some(f => f.status === "uploading")
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:scale-105 shadow-sm' 
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                  title="Send message (Cmd/Ctrl + Enter)"
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={`h-8 w-8 rounded-full transition-colors flex items-center justify-center shrink-0 ${isRecording ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-zinc-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
                    onClick={toggleRecording}
                    title={isRecording ? "Stop recording" : "Use microphone"}
                  >
                    {isRecording ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Mic size={17} className="fill-current" />
                      </motion.div>
                    ) : (
                      <Mic size={17} strokeWidth={2} />
                    )}
                  </button>

                  <button
                    type="button"
                    className="h-8 w-8 rounded-full text-zinc-400 dark:text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center justify-center shrink-0"
                    onClick={() => setIsVoiceModeActive && setIsVoiceModeActive(true)}
                    title="Advanced Voice Mode"
                  >
                    <BrainCircuit size={17} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2 px-2 w-full">
          <div className="text-center text-[11px] text-zinc-500 dark:text-zinc-500 font-medium flex-1 pl-2 tracking-tight">
            SmartLearn AI can make mistakes. Consider verifying important information.
          </div>
          <div className="flex-shrink-0 relative">
            <ModelSelector selectedModelId={selectedModelId} onModelSelect={setSelectedModelId} />
          </div>
        </div>
      </div>
    </div>
  );
}