import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User as UserIcon, Sun, Moon, Loader2, Info, Lock, 
  Camera, CheckCircle2, Shield, Trash2, ArrowLeft, Brain 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  useUserProfile, useUpdateName, useUpdatePassword, useUpdateAvatar, 
  useExportData, useDeleteAllChats, useRequestDeleteAccount, 
  useConfirmDeleteAccount, useUpdatePersonalization 
} from '../hooks/useUser';
import { 
  useChats, useUnarchiveChat, useDeleteChat, useRevokeShare, useArchiveAllChats 
} from '../hooks/useChats';
import { toast } from 'sonner';

export default function SettingsModal({ 
  isOpen, onClose, darkMode, setDarkMode, themeColor, setThemeColor, 
  isHistoryHidden, toggleHistoryHidden 
}) {
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

  // Personalization State
  const userProfileQuery = useUserProfile();
  const [nickname, setNickname] = useState("");
  const [occupation, setOccupation] = useState("");
  const [styleTone, setStyleTone] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const updatePersonalizationMutation = useUpdatePersonalization();

  // Sync data from database when it loads
  useEffect(() => {
    if (userProfileQuery.data) {
      setNickname(userProfileQuery.data.nickname || "");
      setOccupation(userProfileQuery.data.occupation || "");
      setStyleTone(userProfileQuery.data.style_tone || "");
      setCustomInstructions(userProfileQuery.data.custom_instructions || "");
    }
  }, [userProfileQuery.data]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  // Data & Privacy State
  const exportMutation = useExportData();
  const deleteAllChatsMutation = useDeleteAllChats();
  const reqDeleteAccountMutation = useRequestDeleteAccount();
  const confirmDeleteAccountMutation = useConfirmDeleteAccount();
  const [deleteChatsConfirm, setDeleteChatsConfirm] = useState(false);
  const [deleteAccountPhase, setDeleteAccountPhase] = useState(0);
  const [deleteOtp, setDeleteOtp] = useState("");

  // Manage Chats State
  const { data: chatsData = [] } = useChats();
  const unarchiveMutation = useUnarchiveChat();
  const deleteChatMutation = useDeleteChat();
  const revokeShareMutation = useRevokeShare();
  const archiveAllMutation = useArchiveAllChats();
  const archivedChats = chatsData.filter(c => c.is_archived);
  const sharedChats = chatsData.filter(c => c.is_shared);

  if (!isOpen) return null;

  // --- Handlers ---
  const handleUpdateName = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");
    if (name === user?.name) return;

    updateNameMutation.mutate({ name }, {
      onSuccess: () => toast.success("Profile saved"),
      onError: (err) => toast.error(err.response?.data?.detail || "Failed to save")
    });
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    if (newPassword.length < 6) return toast.error("Password too short");

    updatePasswordMutation.mutate({ current_password: currentPassword, new_password: newPassword }, {
      onSuccess: () => {
        toast.success("Password updated");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      },
      onError: (err) => toast.error(err.response?.data?.detail || "Failed to update password")
    });
  };

  const handleUpdatePersonalization = (e) => {
    e.preventDefault();
    updatePersonalizationMutation.mutate(
      { nickname, occupation, style_tone: styleTone, custom_instructions: customInstructions },
      {
        onSuccess: () => toast.success("Personalization settings saved"),
        onError: () => toast.error("Failed to save settings")
      }
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256; canvas.height = 256;
        
        // Draw image preserving aspect ratio
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width / scale - img.width) / 2;
        const y = (canvas.height / scale - img.height) / 2;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        updateAvatarMutation.mutate({ avatar: canvas.toDataURL('image/jpeg', 0.8) }, {
          onSuccess: () => toast.success("Avatar updated"),
          onError: () => toast.error("Upload failed")
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleExportData = () => {
    exportMutation.mutate(undefined, {
      onSuccess: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `smartlearn_export.json`;
        a.click(); URL.revokeObjectURL(url);
        toast.success("Export successful");
      }
    });
  };

  const handleRequestAccountDeletion = () => {
    reqDeleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("OTP sent to your email!");
        setDeleteAccountPhase(2);
      },
      onError: (err) => toast.error(err.response?.data?.detail || "Failed to request deletion")
    });
  };

  const handleConfirmAccountDeletion = (e) => {
    e.preventDefault();
    if (!deleteOtp.trim()) return toast.error("Please enter the OTP");
    
    confirmDeleteAccountMutation.mutate({ otp: deleteOtp }, {
      onSuccess: () => {
        toast.success("Account deleted successfully.");
      },
      onError: (err) => toast.error(err.response?.data?.detail || "Invalid OTP")
    });
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        if (id !== 'data') {
          setDeleteChatsConfirm(false);
          setDeleteAccountPhase(0);
          setDeleteOtp("");
        }
      }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        activeTab === id 
          ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground font-medium shadow-sm' 
          : 'text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-foreground'
      }`}
    >
      <Icon size={16} className={activeTab === id ? 'text-primary' : ''} />
      {label}
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl h-[85vh] min-h-[500px] bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex overflow-hidden z-10 font-sans"
      >
        {/* Sidebar */}
        <div className="w-56 bg-zinc-50/50 dark:bg-zinc-900/20 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-1 shrink-0">
          <h2 className="text-xs font-semibold mb-4 px-2 text-muted-foreground uppercase tracking-wider">Settings</h2>
          <TabButton id="profile" label="Profile" icon={UserIcon} />
          <TabButton id="personalization" label="Personalization" icon={Brain} />
          <TabButton id="appearance" label="Appearance" icon={Sun} />
          <TabButton id="account" label="Security" icon={Lock} />
          <TabButton id="data" label="Data & Privacy" icon={Shield} />
          <div className="flex-1" />
          <TabButton id="about" label="About" icon={Info} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative bg-background overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors z-20"
          >
            <X size={18} />
          </button>

          <div className="flex-1 overflow-y-auto p-8 lg:p-10 scrollbar-thin">
            <AnimatePresence mode="wait">
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md">
                  <h3 className="text-xl font-medium mb-1 tracking-tight">Profile</h3>
                  <p className="text-sm text-muted-foreground mb-8">Manage your personal information.</p>
                  
                  <div className="mb-8 flex items-center gap-5">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl font-medium overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          user?.name ? user.name.charAt(0).toUpperCase() : "U"
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="text-white" size={18} />
                      </div>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Avatar</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Click to update (Max 5MB)</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateName} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email address</label>
                      <input type="text" value={user?.email || ""} disabled className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Display Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="pt-2">
                      <button disabled={updateNameMutation.isPending || name === user?.name} type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                        Save changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* PERSONALIZATION TAB */}
              {activeTab === 'personalization' && (
                <motion.div key="personalization" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl">
                  <h3 className="text-xl font-medium mb-1 tracking-tight">Personalization</h3>
                  <p className="text-sm text-muted-foreground mb-8">Adjust how the AI responds and behaves specifically for you.</p>

                  {/* LOADING STATE FOR DATABASE FETCHING */}
                  {userProfileQuery.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 shadow-inner">
                      <Loader2 className="animate-spin text-primary" size={28} />
                      <p className="text-sm text-muted-foreground font-medium">Fetching your preferences...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdatePersonalization} className="space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Nickname</label>
                          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="What to call you" className="w-full px-3 py-2 bg-background border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1.5">Role / Occupation</label>
                          <input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Developer" className="w-full px-3 py-2 bg-background border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5">Response Style</label>
                        <select value={styleTone} onChange={(e) => setStyleTone(e.target.value)} className="w-full px-3 py-2 bg-background border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                          <option value="">Default (Balanced)</option>
                          <option value="Direct & Concise">Direct & Concise</option>
                          <option value="Socratic Tutor">Socratic Tutor</option>
                          <option value="Highly Academic">Highly Academic</option>
                          <option value="Code Ninja">Code Ninja</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5 flex justify-between">
                          <span>Custom Instructions</span>
                          <span className="text-xs text-muted-foreground font-normal">Markdown supported</span>
                        </label>
                        <textarea value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} placeholder="E.g., Always reply in markdown, prioritize Python code..." rows={4} className="w-full px-3 py-2 bg-background border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none font-mono transition-all" />
                      </div>

                      <div className="pt-2">
                        <button type="submit" disabled={updatePersonalizationMutation.isPending} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                          {updatePersonalizationMutation.isPending ? 'Saving...' : 'Save preferences'}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md">
                  <h3 className="text-xl font-medium mb-1 tracking-tight">Appearance</h3>
                  <p className="text-sm text-muted-foreground mb-8">Customize how SmartLearn looks on your device.</p>
                  
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium mb-3">Theme</label>
                      <div className="flex gap-3">
                        <button onClick={() => setDarkMode(false)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-md text-sm transition-all ${!darkMode ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-muted-foreground hover:text-foreground'}`}>
                          <Sun size={16} /> Light
                        </button>
                        <button onClick={() => setDarkMode(true)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-md text-sm transition-all ${darkMode ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-muted-foreground hover:text-foreground'}`}>
                          <Moon size={16} /> Dark
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3">Accent Color</label>
                      <div className="flex gap-4 flex-wrap">
                        {['#ff3131', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f97316', '#52525b'].map(color => (
                          <button
                            key={color}
                            onClick={() => setThemeColor(color)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${themeColor === color ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
                            style={{ backgroundColor: color, '--tw-ring-color': color }}
                          >
                            {themeColor === color && <CheckCircle2 size={14} className="text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ACCOUNT TAB */}
              {activeTab === 'account' && (
                <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md">
                  <h3 className="text-xl font-medium mb-1 tracking-tight">Security</h3>
                  <p className="text-sm text-muted-foreground mb-8">Manage your account security and password.</p>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Current Password</label>
                      <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">New Password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div className="pt-2">
                      <button disabled={updatePasswordMutation.isPending} type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                        Update password
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* DATA & PRIVACY TAB */}
              {activeTab === 'data' && (
                <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl">
                  <h3 className="text-xl font-medium mb-1 tracking-tight">Data & Privacy</h3>
                  <p className="text-sm text-muted-foreground mb-8">Control your data, chats, and account lifecycle.</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                      <div>
                        <div className="text-sm font-medium">Chat history sidebar</div>
                        <div className="text-sm text-muted-foreground">Show past conversations in the sidebar</div>
                      </div>
                      <button onClick={toggleHistoryHidden} className={`w-9 h-5 rounded-full transition-colors relative ${!isHistoryHidden ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                        <span className={`block w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${!isHistoryHidden ? 'left-4.5 translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                      <div>
                        <div className="text-sm font-medium">Archived chats</div>
                        <div className="text-sm text-muted-foreground">Manage your hidden conversations</div>
                      </div>
                      <button onClick={() => setActiveTab('archived_chats')} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium rounded-md transition-colors">
                        Manage
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                      <div>
                        <div className="text-sm font-medium">Shared links</div>
                        <div className="text-sm text-muted-foreground">Manage your publicly shared chat links</div>
                      </div>
                      <button onClick={() => setActiveTab('shared_links')} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium rounded-md transition-colors">
                        Manage
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                      <div>
                        <div className="text-sm font-medium">Export data</div>
                        <div className="text-sm text-muted-foreground">Download your account data and chats</div>
                      </div>
                      <button onClick={handleExportData} disabled={exportMutation.isPending} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium rounded-md transition-colors">
                        Export
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                      <div>
                        <div className="text-sm font-medium">Archive all chats</div>
                        <div className="text-sm text-muted-foreground">Move all active chats to the archive</div>
                      </div>
                      <button onClick={() => archiveAllMutation.mutate()} disabled={archiveAllMutation.isPending} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium rounded-md transition-colors">
                        {archiveAllMutation.isPending ? "Archiving..." : "Archive all"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                      <div>
                        <div className="text-sm font-medium text-red-600 dark:text-red-500">Delete all chats</div>
                        <div className="text-sm text-muted-foreground">Permanently clear your entire history</div>
                      </div>
                      {!deleteChatsConfirm ? (
                        <button onClick={() => setDeleteChatsConfirm(true)} className="px-3 py-1.5 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-medium rounded-md transition-colors">
                          Delete all
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDeleteChatsConfirm(false)} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
                          <button onClick={() => deleteAllChatsMutation.mutate()} className="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium rounded-md">Confirm</button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-sm font-medium text-red-600 dark:text-red-500">Delete account</div>
                        <div className="text-sm text-muted-foreground">Permanently delete your account and data</div>
                      </div>
                      <button onClick={() => setActiveTab('delete_account')} className="px-3 py-1.5 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-medium rounded-md transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ARCHIVED CHATS SUB-VIEW */}
              {activeTab === 'archived_chats' && (
                <motion.div key="archived_chats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setActiveTab('data')} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                      <ArrowLeft size={16} />
                    </button>
                    <h3 className="text-xl font-medium tracking-tight">Archived chats</h3>
                  </div>
                  
                  {archivedChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      <p className="text-sm text-muted-foreground">You have no archived conversations.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto pr-2 scrollbar-thin">
                      {archivedChats.map(chat => (
                        <div key={chat.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-lg group">
                          <span className="text-sm truncate mr-4 font-medium">{chat.title}</span>
                          <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => unarchiveMutation.mutate(chat.id)} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Unarchive</button>
                            <button onClick={() => deleteChatMutation.mutate(chat.id)} className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* SHARED LINKS SUB-VIEW */}
              {activeTab === 'shared_links' && (
                <motion.div key="shared_links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setActiveTab('data')} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                      <ArrowLeft size={16} />
                    </button>
                    <h3 className="text-xl font-medium tracking-tight">Shared links</h3>
                  </div>
                  
                  {sharedChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                      <p className="text-sm text-muted-foreground">You have no shared links.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto pr-2 scrollbar-thin">
                      {sharedChats.map(chat => (
                        <div key={chat.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded-lg group">
                          <span className="text-sm truncate mr-4 font-medium">{chat.title}</span>
                          <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/share/${chat.share_id}`);
                                toast.success("Link copied!");
                              }} 
                              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Copy Link
                            </button>
                            <button onClick={() => revokeShareMutation.mutate(chat.id)} className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* DELETE ACCOUNT SUB-VIEW */}
              {activeTab === 'delete_account' && (
                <motion.div key="delete_account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => { setActiveTab('data'); setDeleteAccountPhase(0); setDeleteOtp(""); }} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                      <ArrowLeft size={16} />
                    </button>
                    <h3 className="text-xl font-medium tracking-tight text-red-600 dark:text-red-500">Delete Account</h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    Permanently delete your account, settings, and all chat history. This action cannot be reversed.
                  </p>

                  {deleteAccountPhase === 0 && (
                    <button 
                      onClick={handleRequestAccountDeletion}
                      disabled={reqDeleteAccountMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full"
                    >
                      {reqDeleteAccountMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                      Request Deletion OTP
                    </button>
                  )}

                  {deleteAccountPhase === 2 && (
                    <form onSubmit={handleConfirmAccountDeletion} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Verification Code</label>
                        <input 
                          type="text" 
                          value={deleteOtp}
                          onChange={e => setDeleteOtp(e.target.value)}
                          placeholder="6-digit OTP sent to your email"
                          required
                          className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={confirmDeleteAccountMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full"
                      >
                        {confirmDeleteAccountMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                        Confirm Deletion
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

              {/* ABOUT TAB */}
              {activeTab === 'about' && (
                <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md">
                  <h3 className="text-xl font-medium mb-6 tracking-tight">About SmartLearn</h3>
                  
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>SmartLearn is a high-performance cognitive engine designed to accelerate productivity and facilitate seamless AI interactions.</p>
                    <p>Version <span className="font-medium text-foreground">13.7.4 (BETA)</span></p>
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-6">
                      <p>For support or inquiries, please contact:</p>
                      <p className="mt-1 font-medium text-foreground select-all">iamnaveed.cs@gmail.com</p>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
