import React, { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Square, FileText, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InputBox({
  input, setInput, loading, sendMessage, stopGeneration, handleUpload,
  attachedFile, setAttachedFile, isUploading, textareaRef
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input, textareaRef]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !loading && !isUploading) sendMessage();
    }
  };

  const handleAttachmentKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  // Drag-and-drop support
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file], value: null } };
    handleUpload(fakeEvent);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const showScrollbar = textareaRef.current && textareaRef.current.scrollHeight > 200;
  const canSend = input.trim() && !loading && !isUploading;

  return (
    <div className="input-dock">
      <div className="input-container-inner">

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="stop-wrapper"
            >
              <button className="btn-stop" onClick={stopGeneration}>
                <Square size={11} fill="currentColor" /> Stop generating
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`composer ${attachedFile || isUploading ? "has-attachment" : ""}`}
          style={dragOver ? {
            borderColor: "var(--accent-color)",
            boxShadow: "0 0 0 3px rgba(16,163,127,0.12)",
          } : {}}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >

          {/* Attachment zone */}
          <AnimatePresence>
            {(attachedFile || isUploading) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="attachment-zone"
              >
                <div className="file-card">
                  <div className="file-icon-wrapper">
                    {isUploading
                      ? <Loader2 className="spinner" size={22} />
                      : <FileText size={22} color="var(--accent-color)" />
                    }
                  </div>
                  <div className="file-details">
                    <span className="file-name">{attachedFile?.name || "Uploading..."}</span>
                    <span className="file-meta">
                      {isUploading ? "Processing..." : `Document · ${formatFileSize(attachedFile?.size)}`}
                    </span>
                  </div>
                  {!isUploading && (
                    <button
                      className="btn-remove-file"
                      onClick={() => setAttachedFile(null)}
                      aria-label="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag hint overlay */}
          <AnimatePresence>
            {dragOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(16,163,127,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "inherit",
                  pointerEvents: "none",
                  zIndex: 2,
                  fontSize: "0.85rem",
                  color: "var(--accent-color)",
                  fontWeight: 500,
                  gap: 8,
                }}
              >
                <FileText size={18} /> Drop file to upload
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input row */}
          <div className="composer-row">
            <label
              className="btn-attach"
              tabIndex={0}
              onKeyDown={handleAttachmentKeyDown}
              aria-label="Attach file"
              title="Attach a file (PDF, DOC, TXT)"
            >
              <Paperclip size={19} />
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
              placeholder="Message SmartLearn AI…"
              rows={1}
              disabled={loading || isUploading}
              style={{ overflowY: showScrollbar ? "auto" : "hidden" }}
              aria-label="Message input"
            />

            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => sendMessage()}
              disabled={!canSend}
              className={`btn-send ${canSend ? "active" : "inactive"}`}
              aria-label="Send message"
              title="Send (Enter)"
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>

        <div className="footer-text">
          SmartLearn AI can make mistakes. Verify important information.
        </div>
      </div>
    </div>
  );
}