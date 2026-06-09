import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, Settings as SettingsIcon, Sun, Moon, Loader2, Info, Lock, Camera, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUpdateName, useUpdatePassword, useUpdateAvatar } from '../hooks/useUser';
import { toast } from 'sonner';

export default function SettingsModal({ isOpen, onClose, darkMode, setDarkMode }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Name State
  const [name, setName] = useState(user?.name || "");
  const updateNameMutation = useUpdateName();

  // Avatar State
  const fileInputRef = useRef(null);
  const updateAvatarMutation = useUpdateAvatar();

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image must be smaller than 5MB");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
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

        // Compress to JPEG with 0.8 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        updateAvatarMutation.mutate({ avatar: dataUrl }, {
          onSuccess: () => {
            toast.success("Avatar updated successfully!");
          },
          onError: () => {
            toast.error("Failed to upload avatar");
          }
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        activeTab === id 
          ? 'bg-zinc-200 dark:bg-zinc-800 text-foreground' 
          : 'text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-foreground'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="relative w-full max-w-4xl h-[600px] max-h-[85vh] bg-background border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex overflow-hidden z-10"
      >
        {/* Sidebar */}
        <div className="w-48 sm:w-64 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-2 shrink-0">
          <h2 className="text-xl font-semibold mb-4 px-2 tracking-tight">Settings</h2>
          
          <TabButton id="profile" label="Profile" icon={UserIcon} />
          <TabButton id="appearance" label="Appearance" icon={Sun} />
          <TabButton id="account" label="Account" icon={Lock} />
          <TabButton id="about" label="About" icon={Info} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative bg-background overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
            <AnimatePresence mode="wait">
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-md"
                >
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">Profile</h3>
                  
                  <div className="mb-8 flex items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          user?.name ? user.name.charAt(0).toUpperCase() : "U"
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        {updateAvatarMutation.isPending ? <Loader2 className="animate-spin text-white" size={24} /> : <Camera className="text-white" size={24} />}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                      />
                    </div>
                    <div>
                      <p className="font-medium">Profile Picture</p>
                      <p className="text-sm text-muted-foreground">Click the avatar to upload a custom image.</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateName} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input 
                        type="text" 
                        value={user?.email || ""}
                        readOnly
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed"
                      />
                    </div>
                    <div>
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
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 mt-2"
                    >
                      {updateNameMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                      Save Profile
                    </button>
                  </form>
                </motion.div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-md"
                >
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">Appearance</h3>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm">Theme</p>
                      <p className="text-xs text-muted-foreground mt-1">Select your preferred interface theme.</p>
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

              {/* ACCOUNT TAB */}
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-md"
                >
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

              {/* ABOUT TAB */}
              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="max-w-md"
                >
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">About SmartLearn AI</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">SmartLearn AI</p>
                        <p className="text-sm text-muted-foreground">Version 13.7.4 (BETA)</p>
                      </div>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        SmartLearn AI is an advanced, industry-level cognitive assistant designed for peak productivity, rapid learning, and seamless AI interactions.
                      </p>
                      <p className="text-xs text-muted-foreground pt-2">
                        &copy; {new Date().getFullYear()} SmartLearn AI. All rights reserved.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-sm font-medium mb-3">Need Help?</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Our premium support team is available 24/7 to assist you with any inquiries or technical difficulties.
                      </p>
                      <a 
                        href="mailto:iamnaveed.cs@gmail.com?subject=SmartLearn%20AI%20Support%20Request"
                        className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Contact Support
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
