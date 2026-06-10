import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, Settings as SettingsIcon, Sun, Moon, Loader2, Info, Lock, Camera, CheckCircle2, Shield, Download, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUpdateName, useUpdatePassword, useUpdateAvatar, useExportData, useDeleteAllChats, useRequestDeleteAccount, useConfirmDeleteAccount } from '../hooks/useUser';
import { useChats, useUnarchiveChat, useDeleteChat, useRevokeShare, useArchiveAllChats } from '../hooks/useChats';
import { toast } from 'sonner';

export default function SettingsModal({ isOpen, onClose, darkMode, setDarkMode, themeColor, setThemeColor }) {
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

  // Data & Privacy State
  const exportMutation = useExportData();
  const deleteAllChatsMutation = useDeleteAllChats();
  const reqDeleteAccountMutation = useRequestDeleteAccount();
  const confirmDeleteAccountMutation = useConfirmDeleteAccount();
  const [deleteChatsConfirm, setDeleteChatsConfirm] = useState(false);
  const [deleteAccountPhase, setDeleteAccountPhase] = useState(0); // 0: Idle, 1: Requesting OTP, 2: Entering OTP
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

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        updateAvatarMutation.mutate({ avatar: dataUrl }, {
          onSuccess: () => toast.success("Avatar updated successfully!"),
          onError: () => toast.error("Failed to upload avatar")
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
        a.href = url;
        a.download = `smartlearn_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Data exported successfully!");
      },
      onError: () => toast.error("Failed to export data")
    });
  };

  const handleDeleteAllChats = () => {
    deleteAllChatsMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("All chats have been permanently deleted.");
        setDeleteChatsConfirm(false);
      },
      onError: () => toast.error("Failed to delete chats")
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
        // Logout happens via mutation
      },
      onError: (err) => toast.error(err.response?.data?.detail || "Invalid OTP")
    });
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        // Reset confirmation states if switching away
        if (id !== 'data') {
          setDeleteChatsConfirm(false);
          setDeleteAccountPhase(0);
          setDeleteOtp("");
        }
      }}
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
        className="relative w-full max-w-4xl h-[650px] max-h-[85vh] bg-background border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex overflow-hidden z-10"
      >
        {/* Sidebar */}
        <div className="w-48 sm:w-64 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-2 shrink-0">
          <h2 className="text-xl font-semibold mb-4 px-2 tracking-tight">Settings</h2>
          
          <TabButton id="profile" label="Profile" icon={UserIcon} />
          <TabButton id="appearance" label="Appearance" icon={Sun} />
          <TabButton id="account" label="Account" icon={Lock} />
          <TabButton id="data" label="Data & Privacy" icon={Shield} />
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
                <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="max-w-md">
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
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
                    </div>
                    <div>
                      <p className="font-medium">Profile Picture</p>
                      <p className="text-sm text-muted-foreground">Click the avatar to upload a custom image.</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateName} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input type="text" value={user?.email || ""} readOnly className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Display Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" />
                    </div>
                    <button disabled={updateNameMutation.isPending || name === user?.name} type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 mt-2">
                      {updateNameMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                      Save Profile
                    </button>
                  </form>
                </motion.div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="max-w-md">
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">Appearance</h3>
                  
                  <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                      <p className="font-medium text-sm">Theme Mode</p>
                      <p className="text-xs text-muted-foreground mt-1">Select your preferred interface theme.</p>
                    </div>
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <button onClick={() => setDarkMode(false)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!darkMode ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        <Sun size={14} /> Light
                      </button>
                      <button onClick={() => setDarkMode(true)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${darkMode ? 'bg-zinc-800 shadow-sm text-zinc-100' : 'text-muted-foreground hover:text-foreground'}`}>
                        <Moon size={14} /> Dark
                      </button>
                    </div>
                  </div>

                  <div className="py-5">
                    <div>
                      <p className="font-medium text-sm">Accent Color</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">Choose a primary color for buttons, icons, and chat bubbles.</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { id: 'emerald', hex: '#10b981', label: 'Emerald' },
                        { id: 'blue', hex: '#3b82f6', label: 'Blue' },
                        { id: 'violet', hex: '#8b5cf6', label: 'Violet' },
                        { id: 'rose', hex: '#f43f5e', label: 'Rose' },
                        { id: 'orange', hex: '#f97316', label: 'Orange' },
                        { id: 'zinc', hex: '#52525b', label: 'Zinc' },
                      ].map(color => (
                        <button
                          key={color.id}
                          onClick={() => setThemeColor(color.hex)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${themeColor === color.hex ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
                          style={{ backgroundColor: color.hex, '--tw-ring-color': color.hex }}
                          title={color.label}
                        >
                          {themeColor === color.hex && <CheckCircle2 size={18} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ACCOUNT TAB */}
              {activeTab === 'account' && (
                <motion.div key="account" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="max-w-md">
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">Security</h3>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" />
                    </div>
                    <button disabled={updatePasswordMutation.isPending} type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 mt-2">
                      {updatePasswordMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                      Update Password
                    </button>
                  </form>
                </motion.div>
              )}

              {/* DATA & PRIVACY TAB */}
              {activeTab === 'data' && (
                <motion.div key="data" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="max-w-2xl">
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">Data & Privacy</h3>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                      <div>
                        <div className="text-sm font-medium">Export Data</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Download your account details and chat history</div>
                      </div>
                      <button onClick={handleExportData} disabled={exportMutation.isPending} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium rounded-md transition-colors flex items-center gap-2">
                        {exportMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : "Export"}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                      <div>
                        <div className="text-sm font-medium">Archived chats</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Manage your hidden conversations</div>
                      </div>
                      <button onClick={() => setActiveTab('archived_chats')} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium rounded-md transition-colors">
                        Manage
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                      <div>
                        <div className="text-sm font-medium">Archive all chats</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Archive all of your current unarchived chats</div>
                      </div>
                      <button onClick={() => archiveAllMutation.mutate()} disabled={archiveAllMutation.isPending} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium rounded-md transition-colors">
                        {archiveAllMutation.isPending ? "Archiving..." : "Archive all"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                      <div>
                        <div className="text-sm font-medium">Shared links</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Manage your publicly shared chat links</div>
                      </div>
                      <button onClick={() => setActiveTab('shared_links')} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium rounded-md transition-colors">
                        Manage
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                      <div>
                        <div className="text-sm font-medium text-red-500">Delete all chats</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Permanently delete your entire chat history</div>
                      </div>
                      {!deleteChatsConfirm ? (
                        <button onClick={() => setDeleteChatsConfirm(true)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors">
                          Delete all
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setDeleteChatsConfirm(false)} className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors">Cancel</button>
                          <button onClick={handleDeleteAllChats} disabled={deleteAllChatsMutation.isPending} className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors flex items-center gap-2">
                            {deleteAllChatsMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                            Confirm
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <div>
                        <div className="text-sm font-medium text-red-500">Delete account</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and data</div>
                      </div>
                      <button onClick={() => setActiveTab('delete_account')} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors">
                        Delete
                      </button>
                    </div>

                    <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Privacy Commitment</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We do not sell your personal data or chat histories to third parties. All PDF extractions and conversational data are securely stored. By exporting your data, you agree to handle your local copy securely.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ARCHIVED CHATS SUB-VIEW */}
              {activeTab === 'archived_chats' && (
                <motion.div key="archived_chats" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="max-w-2xl h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => setActiveTab('data')} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                      <ArrowLeft size={18} />
                    </button>
                    <h3 className="text-lg font-medium">Archived chats</h3>
                  </div>
                  
                  {archivedChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-sm text-muted-foreground">You have no archived conversations.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto pr-2 scrollbar-thin">
                      {archivedChats.map(chat => (
                        <div key={chat.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg group">
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
                <motion.div key="shared_links" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="max-w-2xl h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => setActiveTab('data')} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                      <ArrowLeft size={18} />
                    </button>
                    <h3 className="text-lg font-medium">Shared links</h3>
                  </div>
                  
                  {sharedChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-sm text-muted-foreground">You have no shared links.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto pr-2 scrollbar-thin">
                      {sharedChats.map(chat => (
                        <div key={chat.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg group">
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
                <motion.div key="delete_account" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="max-w-md">
                  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => { setActiveTab('data'); setDeleteAccountPhase(0); setDeleteOtp(""); }} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                      <ArrowLeft size={18} />
                    </button>
                    <h3 className="text-lg font-medium text-red-500">Delete Account</h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    Permanently delete your account, settings, and all chat history. This action cannot be reversed.
                  </p>

                  {deleteAccountPhase === 0 && (
                    <button 
                      onClick={handleRequestAccountDeletion}
                      disabled={reqDeleteAccountMutation.isPending}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 w-full"
                    >
                      {reqDeleteAccountMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                      Request Deletion OTP
                    </button>
                  )}

                  {deleteAccountPhase === 2 && (
                    <form onSubmit={handleConfirmAccountDeletion} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Enter Verification Code</label>
                        <input 
                          type="text" 
                          value={deleteOtp}
                          onChange={e => setDeleteOtp(e.target.value)}
                          placeholder="6-digit OTP sent to your email"
                          required
                          className="w-full bg-background border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={confirmDeleteAccountMutation.isPending}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 w-full"
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
                <motion.div key="about" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="max-w-md">
                  <h3 className="text-lg font-medium mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">About SmartLearn AI</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">SmartLearn AI</p>
                        <p className="text-sm text-muted-foreground">Version 13.7.4 (BETA)</p>
                      </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        SmartLearn AI is an advanced, industry-level cognitive assistant designed for peak productivity, rapid learning, and seamless AI interactions.
                      </p>
                      <p className="text-xs text-muted-foreground mt-4 font-medium">
                        &copy; {new Date().getFullYear()} SmartLearn AI. All rights reserved.
                      </p>
                    </div>
                    <div className="pt-2">
                      <h4 className="text-sm font-semibold mb-2">Need Help?</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Our premium support team is available 24/7 to assist you. You can reach us directly at the email below.
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground select-all">
                          iamnaveed.cs@gmail.com
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText("iamnaveed.cs@gmail.com");
                            toast.success("Email copied to clipboard!");
                          }}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                          Copy
                        </button>
                      </div>
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
