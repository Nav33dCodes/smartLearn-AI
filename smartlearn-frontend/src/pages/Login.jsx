import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Sparkles, BrainCircuit, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.access_token, response.data.refresh_token);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 font-sans">
      {/* Left Side: Animated Hero (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden border-r border-zinc-800/50">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
              <Logo size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">SmartLearn AI</h1>
          </div>
          
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 mb-6 leading-tight">
            Unlock your learning potential.
          </h2>
          <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
            Upload PDFs, ask complex questions, and get instant, context-aware answers powered by advanced Retrieval-Augmented Generation.
          </p>

          <div className="space-y-6">
            {[
              { icon: Sparkles, title: "Intelligent Summaries", desc: "Instantly digest long documents." },
              { icon: BrainCircuit, title: "Context-Aware Memory", desc: "Remembers your specific documents." },
              { icon: Zap, title: "Lightning Fast", desc: "Powered by Groq's high-speed inference." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm"
              >
                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                  <feature.icon size={24} />
                </div>
                <div>
                  <h3 className="text-zinc-100 font-semibold">{feature.title}</h3>
                  <p className="text-zinc-500 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Subtle mobile glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none lg:hidden" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 rounded-3xl shadow-2xl p-8 relative z-10"
        >
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)] text-primary">
               <Logo size={36} />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-zinc-400 text-sm">Sign in to SmartLearn AI</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-zinc-300">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none pr-10"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full mt-2 h-12 text-base font-semibold rounded-xl">
              {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-zinc-400">
            Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
