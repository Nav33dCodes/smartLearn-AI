import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BugReportModal({ isOpen, onClose }) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_CHARS = 2000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please provide a description of the issue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sl_token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      // We will automatically extract a short subject from the description
      const subject = description.trim().split('\\n')[0].substring(0, 50) + "...";

      const res = await fetch(`${API_URL}/api/bug-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: subject,
          description: description
        })
      });

      if (!res.ok) throw new Error("Failed to send bug report");

      toast.success("Bug report sent. Thank you for your feedback!");
      setDescription('');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while sending the report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#212121] dark:bg-[#1a1a1a] w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-[22px] font-semibold text-white tracking-tight">What happened?</h2>
              <button 
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="relative">
                  <textarea
                    autoFocus
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_CHARS) {
                        setDescription(e.target.value);
                      }
                    }}
                    placeholder="Tell us about the issue you encountered"
                    className="w-full h-56 bg-transparent text-zinc-200 placeholder:text-zinc-500 text-[15px] resize-none outline-none border border-white/10 rounded-xl p-4 focus:border-white/30 transition-colors scrollbar-thin"
                    style={{ lineHeight: "1.5" }}
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-zinc-500">
                    {description.length} / {MAX_CHARS} characters used
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || description.trim().length === 0}
                    className="bg-white text-black font-medium py-2.5 px-6 rounded-full text-[15px] flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "Send"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
