import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Loader2, Volume2 } from "lucide-react";
import api from "../lib/axios";
import { toast } from "sonner";

export default function VoiceMode({ 
  onClose, 
  sendMessage, 
  loading, 
  activeMessages = [] 
}) {
  const [phase, setPhase] = useState("idle"); // idle, listening, processing, generating, speaking
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlaybackRef = useRef(null);
  const [transcribedText, setTranscribedText] = useState("");
  const prevLoadingRef = useRef(loading);

  // Monitor loading state to detect when generation finishes
  useEffect(() => {
    if (prevLoadingRef.current && !loading && phase === "generating") {
      // Generation just finished!
      handleGenerationComplete();
    }
    prevLoadingRef.current = loading;
  }, [loading, phase]);

  const handleGenerationComplete = async () => {
    setPhase("processing"); // Quick switch to indicate we are fetching audio
    const lastMsg = activeMessages[activeMessages.length - 1];
    
    // If it's the AI's message, strip out the hidden JSON and fetch TTS
    if (lastMsg && lastMsg.role === "assistant") {
      let textToRead = lastMsg.content || "";
      if (textToRead.includes("<!-- SOURCES_JSON: ")) {
        textToRead = textToRead.split("<!-- SOURCES_JSON: ")[0].trimEnd();
      }
      
      // Remove any markdown symbols for cleaner speech
      textToRead = textToRead.replace(/[*#`_\[\]()]/g, '');

      if (!textToRead) {
         setPhase("idle");
         startListening();
         return;
      }

      try {
        const response = await api.post("/api/tts", { text: textToRead }, { responseType: "blob" });
        const audioUrl = URL.createObjectURL(response.data);
        const audio = new Audio(audioUrl);
        audioPlaybackRef.current = audio;
        
        audio.onended = () => {
          setPhase("idle");
          // Auto-listen loop
          setTimeout(() => startListening(), 500);
        };
        
        setPhase("speaking");
        await audio.play();
      } catch (err) {
        console.error("TTS Error:", err);
        toast.error("Failed to generate voice response.");
        setPhase("idle");
        startListening();
      }
    } else {
      setPhase("idle");
      startListening();
    }
  };

  const startListening = async () => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
    }
    setTranscribedText("");
    
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
        
        setPhase("processing");
        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          
          const res = await api.post('/api/voice', formData);
          
          if (res.data?.text && res.data.text.trim()) {
            setTranscribedText(res.data.text);
            setPhase("generating");
            sendMessage(res.data.text);
          } else {
            // Nothing heard, start again
            setPhase("idle");
            setTimeout(() => startListening(), 500);
          }
        } catch (err) {
          console.error("STT Error:", err);
          toast.error("Could not transcribe audio.");
          setPhase("idle");
        }
      };

      mediaRecorder.start();
      setPhase("listening");
      
      // Auto-stop after 10 seconds of listening, or user can tap to stop early
      // For simplicity, we just listen until user taps OR we could implement VAD (Voice Activity Detection).
      // Here, we wait for user tap to stop.
    } catch (err) {
      console.error("Microphone error:", err);
      toast.error("Microphone access denied.");
      setPhase("idle");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && phase === "listening") {
      mediaRecorderRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.pause();
    }
    setPhase("idle");
    startListening();
  };

  // Start listening immediately when component mounts
  useEffect(() => {
    startListening();
    return () => {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      if (audioPlaybackRef.current) audioPlaybackRef.current.pause();
    };
  }, []);

  const handleOrbClick = () => {
    if (phase === "listening") {
      stopListening();
    } else if (phase === "speaking") {
      stopSpeaking();
    } else if (phase === "idle") {
      startListening();
    }
  };

  // Determine orb styling based on phase
  let orbScale = [1, 1, 1];
  let orbColor = "rgba(255, 255, 255, 0.2)"; // Idle
  let orbGlow = "0 0 20px rgba(255,255,255,0.1)";

  if (phase === "listening") {
    orbScale = [1, 1.1, 1];
    orbColor = "rgba(255, 49, 49, 0.8)"; // Primary Red
    orbGlow = "0 0 40px rgba(255, 49, 49, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.8)";
  } else if (phase === "processing" || phase === "generating") {
    orbScale = [1, 1.05, 1];
    orbColor = "rgba(100, 100, 255, 0.8)"; // Blueish thinking
    orbGlow = "0 0 40px rgba(100, 100, 255, 0.6)";
  } else if (phase === "speaking") {
    orbScale = [1, 1.3, 0.9, 1.1, 1];
    orbColor = "rgba(255, 255, 255, 1)"; // Bright white speaking
    orbGlow = "0 0 60px rgba(255, 255, 255, 0.8), inset 0 0 30px rgba(200, 200, 255, 0.5)";
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center gap-12 w-full max-w-md px-6 text-center">
          
          <motion.div
            animate={{ scale: orbScale }}
            transition={{ 
              repeat: Infinity, 
              duration: phase === "speaking" ? 0.8 : 2, 
              ease: "easeInOut" 
            }}
            onClick={handleOrbClick}
            className="w-32 h-32 rounded-full cursor-pointer flex items-center justify-center relative transition-all duration-500"
            style={{
              background: orbColor,
              boxShadow: orbGlow
            }}
          >
            {/* Inner Core */}
            <div className="w-16 h-16 rounded-full bg-white/20 blur-md absolute"></div>
          </motion.div>

          <div className="flex flex-col gap-3 min-h-[100px]">
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              {phase === "listening" && "Listening..."}
              {phase === "processing" && "Transcribing..."}
              {phase === "generating" && "Thinking..."}
              {phase === "speaking" && "Speaking..."}
              {phase === "idle" && "Tap to Speak"}
            </h2>
            
            <p className="text-muted-foreground text-sm font-medium h-12 flex items-center justify-center">
              {phase === "listening" && "Tap the orb when you're done speaking"}
              {phase === "generating" && transcribedText && `"${transcribedText}"`}
              {phase === "speaking" && "Tap the orb to interrupt"}
            </p>
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
