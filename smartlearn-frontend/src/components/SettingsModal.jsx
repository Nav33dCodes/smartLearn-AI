import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, Settings as SettingsIcon, Sun, Moon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUpdateName, useUpdatePassword } from '../hooks/useUser';
import { toast } from 'sonner';

export default function SettingsModal({ isOpen, onClose, darkMode, setDarkMode }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  // Name State
  const [name, setName] = useState(user?.name || "");
  const updateNameMutation = useUpdateName();

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const updatePasswordMutation = useUpdatePassword();

  if (!isOpen) return null;

  const handleUpdateName = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");
    if (name === user?.name) return;

    updateNameMutation.mutate({ name }, {
      onSuccess: () => {
        toast.success("Name updated successfully!");
      },
      onError: (err) => {
        toast.error(err.response?.data?.detail || "Failed to update name");
      }
    });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    updatePasswordMutation.mutate({ current_password: currentPassword, new_password: newPassword }, {
      onSuccess: () => {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      },
      onError: (err) => {
        toast.error(err.response?.data?.detail || "Failed to update password");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="relative w-full max-w-3xl h-[600px] max-h-[85vh] bg-background border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex overflow-hidden z-10"
      >
        {/* Sidebar */}
        <div className="w-48 sm:w-64 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-2">
          <h2 className="text-xl font-semibold mb-4 px-2 tracking-tight">Settings</h2>
          
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'general' 
                ? 'bg-zinc-200 dark:bg-zinc-800 text-foreground' 
                : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-foreground'
            }`}
          >
            <SettingsIcon size={18} />
            General
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'account' 
                ? 'bg-zinc-200 dark:bg-zinc-800 text-foreground' 
                : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-foreground'
            }`}
          >
            <UserIcon size={18} />
            Account
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative bg-background">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
            <AnimatePresence mode="wait">
              
              {activeTab === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-md"
                >
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">General</h3>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm">Theme</p>
                      <p className="text-xs text-muted-foreground mt-1">Select your preferred appearance.</p>
                    </div>
                    
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <button
                        onClick={() => setDarkMode(false)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          !darkMode ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Sun size={14} /> Light
                      </button>
                      <button
                        onClick={() => setDarkMode(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          darkMode ? 'bg-zinc-800 shadow-sm text-zinc-100' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Moon size={14} /> Dark
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-md"
                >
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">Account Profile</h3>
                  
                  <form onSubmit={handleUpdateName} className="mb-10">
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                      />
                    </div>
                    <button 
                      disabled={updateNameMutation.isPending || name === user?.name}
                      type="submit"
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {updateNameMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                      Update Name
                    </button>
                  </form>

                  <h3 className="text-lg font-medium mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">Security</h3>
                  
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                      />
                    </div>
                    <button 
                      disabled={updatePasswordMutation.isPending}
                      type="submit"
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 mt-2"
                    >
                      {updatePasswordMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                      Update Password
                    </button>
                  </form>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
