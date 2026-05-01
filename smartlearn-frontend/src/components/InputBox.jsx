import React, { useEffect, useRef } from "react";
import { Send, Paperclip, Square, FileText, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InputBox({
  input, setInput, loading, sendMessage, stopGeneration, handleUpload, 
  attachedFile, setAttachedFile, isUploading, textareaRef
}) {
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input, attachedFile, textareaRef]); 

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Prevent sending empty messages or sending while loading/uploading
      if (input.trim() && !loading && !isUploading) {
        sendMessage();
      }
    }
  };

  const handleAttachmentKeyDown = (e) => {
    // Allow keyboard users to trigger the file upload with Enter or Space
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Determine if scrollbar should show (prevents jitter during auto-resize)
  const showScrollbar = textareaRef.current && textareaRef.current.scrollHeight > 200;

  return (
    <div className="input-dock">
      <div className="input-container-inner">
        
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="stop-wrapper"
            >
              <button className="btn-stop" onClick={stopGeneration}>
                <Square size={12} fill="currentColor" /> Stop generating
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.layout className={`composer ${attachedFile || isUploading ? 'has-attachment' : ''}`}>
          
          <AnimatePresence>
            {(attachedFile || isUploading) && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: 10 }} 
                animate={{ opacity: 1, height: "auto", y: 0 }} 
                exit={{ opacity: 0, height: 0, y: 10 }}
                className="attachment-zone"
              >
                <div className="file-card">
                  <div className="file-icon-wrapper">
                    {isUploading ? <Loader2 className="spinner" size={24} /> : <FileText size={24} color="var(--accent-color)" />}
                  </div>
                  <div className="file-details">
                    <span className="file-name">{attachedFile?.name || "Uploading document..."}</span>
                    <span className="file-meta">
                      {isUploading ? "Processing..." : `Document • ${formatFileSize(attachedFile?.size)}`}
                    </span>
                  </div>
                  {!isUploading && (
                    <button className="btn-remove-file" onClick={() => setAttachedFile(null)} aria-label="Remove attachment">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout className="composer-row">
            <label 
              className="btn-attach" 
              tabIndex={0} 
              onKeyDown={handleAttachmentKeyDown}
              aria-label="Attach file"
            >
              <Paperclip size={20} />
              <input 
                ref={fileInputRef}
                type="file" 
                hidden 
                accept=".pdf,.doc,.docx,.txt,application/pdf" 
                onChange={(e) => { handleUpload(e); e.target.value = null; }} 
                disabled={isUploading || loading}
                tabIndex={-1}
              />
            </label>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="composer-textarea"
              placeholder="Message SmartLearn AI..."
              rows={1}
              disabled={loading || isUploading}
              style={{ overflowY: showScrollbar ? 'auto' : 'hidden' }}
            />

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || isUploading}
              className={`btn-send ${input.trim() && !loading && !isUploading ? "active" : "inactive"}`}
              aria-label="Send message"
            >
              <Send size={18} />
            </motion.button>
          </motion.div>
        </motion.layout>
        
        <div className="footer-text">
          SmartLearn AI can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  );
}