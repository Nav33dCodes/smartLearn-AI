import React, { useRef, useEffect, useState, useCallback } from "react";
import { Paperclip, ArrowUp, Square, Loader2, FileText, X, Mic, Globe } from "lucide-react";
import api from '../lib/axios';
import { Button } from "./ui/button";
import { useUploadPdf } from "../hooks/useChats";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function InputBox({ input, setInput, sendMessage, loading, stopGeneration, textareaRef, activeChatId }) {
  const fileInputRef = useRef(null);
  const uploadPdfMutation = useUploadPdf();
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchWeb, setSearchWeb] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");
        
        try {
          toast.loading("Transcribing...", { id: "transcribe" });
          const res = await api.post('/api/voice/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (res.data.transcript) {
            setInput(prev => (prev + " " + res.data.transcript).trim());
            toast.success("Transcribed!", { id: "transcribe" });
          } else {
            toast.dismiss("transcribe");
          }
        } catch (err) {
          console.error(err);
          toast.error("Transcription failed", { id: "transcribe" });
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      toast.error("Microphone access denied");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      startRecording();
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
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-6 px-4 pointer-events-none">
      <div className="max-w-3xl mx-auto relative flex flex-col gap-2 pointer-events-auto">
        
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
            
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-lg relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPdfMutation.isPending || !activeChatId}
                title="Attach document"
              >
                <Paperclip size={18} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-lg transition-colors ${searchWeb ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setSearchWeb(!searchWeb)}
                title="Toggle Web Search"
              >
                <Globe size={18} />
              </Button>
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