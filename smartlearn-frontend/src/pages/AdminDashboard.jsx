import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Users, MessageSquare, Database, HardDrive, 
  Trash2, RefreshCw, AlertTriangle, ShieldAlert,
  ArrowLeft, Search, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.DEV
  ? "http://localhost:8000"
  : "https://smartlearn-ai-production.up.railway.app";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ stats: null, users: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, system

  useEffect(() => {
    if (!user || user.id !== 1) {
      toast.error("Unauthorized access.");
      navigate("/app");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/admin/dashboard`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch admin data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("DANGER: Are you sure you want to permanently delete this user and all their chats? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete user");
      toast.success(`User ${userId} deleted successfully.`);
      fetchData(); // refresh list
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSystemAction = async (endpoint, successMessage) => {
    if (!confirm("Are you sure you want to run this system action?")) return;
    try {
      const res = await fetch(`${API}/admin/system/${endpoint}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Action failed");
      const json = await res.json();
      toast.success(json.message || successMessage);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background mesh-bg">
        <RefreshCw size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  const filteredUsers = data.users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground mesh-bg font-sans p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <Link to="/app" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-2 text-sm font-medium">
              <ArrowLeft size={16} /> Back to App
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-primary" size={32} />
              Command Center
            </h1>
            <p className="text-muted-foreground mt-1">Advanced system controls and analytics.</p>
          </div>
          
          <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 backdrop-blur-sm shadow-sm">
            {["overview", "users", "system"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users />} title="Total Students" value={data.stats?.total_users || 0} color="text-blue-500" bg="bg-blue-500/10" border="border-blue-500/20" />
                <StatCard icon={<MessageSquare />} title="Total Chats" value={data.stats?.total_chats || 0} color="text-purple-500" bg="bg-purple-500/10" border="border-purple-500/20" />
                <StatCard icon={<Activity />} title="AI Messages" value={data.stats?.total_messages || 0} color="text-emerald-500" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                <StatCard icon={<Database />} title="Vector Chunks" value={data.stats?.rag_vectors || 0} color="text-amber-500" bg="bg-amber-500/10" border="border-amber-500/20" />
              </div>
            )}

            {activeTab === "users" && (
              <div className="bg-card border border-border/50 shadow-xl shadow-black/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                  <h2 className="font-semibold">User Database</h2>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-muted/30 text-muted-foreground">
                      <tr>
                        <th className="px-6 py-4 font-semibold">ID</th>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Email</th>
                        <th className="px-6 py-4 font-semibold">Joined</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 font-mono text-muted-foreground">{u.id}</td>
                          <td className="px-6 py-4 font-medium">{u.name}</td>
                          <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                          <td className="px-6 py-4">{u.created_at}</td>
                          <td className="px-6 py-4 text-right">
                            {u.id !== 1 ? (
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
                              >
                                <Trash2 size={14} /> Ban
                              </button>
                            ) : (
                              <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1.5 bg-primary/10 rounded-md">Admin</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "system" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border/50 shadow-xl rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><RefreshCw size={120} /></div>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><RefreshCw className="text-blue-500" size={24} /> API Cache Flush</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Instantly wipes the backend Python dictionary caches. Forces all users to fetch fresh data from PostgreSQL on their next request. Useful if the UI feels out of sync.
                  </p>
                  <button 
                    onClick={() => handleSystemAction("flush-cache", "Caches Flushed")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    Flush API Memory
                  </button>
                </div>

                <div className="bg-card border border-red-500/30 shadow-xl shadow-red-500/5 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><HardDrive size={120} /></div>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-red-500"><AlertTriangle size={24} /> Purge RAG Storage</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Sweeps the <code className="bg-muted px-1.5 py-0.5 rounded text-red-400">rag_data/</code> directory and permanently deletes all FAISS Vector indices and JSON chunks. Instantly frees up Hard Drive space.
                  </p>
                  <button 
                    onClick={() => handleSystemAction("purge-rag", "RAG Storage Purged")}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    Purge All PDFs
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, bg, border }) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bg} blur-2xl group-hover:scale-150 transition-transform duration-700`} />
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} ${border} border flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-muted-foreground tracking-wide">{title}</span>
      </div>
      <div className="text-4xl font-black tracking-tighter">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
