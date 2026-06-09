import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen flex bg-[#0a0a0a] font-sans text-zinc-100">
      {/* Left Side: Professional Quote Section */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 overflow-hidden bg-zinc-900/30 border-r border-zinc-800/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-zinc-950 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span className="text-xl font-semibold tracking-tight text-zinc-100">SmartLearn</span>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-lg"
        >
          <div className="mb-6 text-zinc-500">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
              <path d="M14.017 21L16.41 14.286C16.63 13.528 16.74 12.793 16.74 12.08C16.74 10.74 16.353 9.71 15.58 8.99C14.806 8.27 13.796 7.91 12.55 7.91C12.023 7.91 11.476 7.99 10.91 8.15L11.55 4.67C12.35 4.456 13.196 4.35 14.09 4.35C16.29 4.35 18.006 4.966 19.24 6.2C20.473 7.433 21.09 9.176 21.09 11.43C21.09 12.63 20.89 13.84 20.49 15.06L17.51 24H14.017ZM3.81699 21L6.20999 14.286C6.42999 13.528 6.53999 12.793 6.53999 12.08C6.53999 10.74 6.15332 9.71 5.37999 8.99C4.60665 8.27 3.59665 7.91 2.34999 7.91C1.82332 7.91 1.27665 7.99 0.709986 8.15L1.34999 4.67C2.14999 4.456 2.99665 4.35 3.88999 4.35C6.08999 4.35 7.80665 4.966 9.03999 6.2C10.2733 7.433 10.89 9.176 10.89 11.43C10.89 12.63 10.69 13.84 10.29 15.06L7.30999 24H3.81699Z" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium text-zinc-100 leading-snug mb-6 font-serif">
            "The beautiful thing about learning is that nobody can take it away from you."
          </h2>
          <p className="text-zinc-400 text-lg">— B.B. King</p>
        </motion.div>
        
        <div className="relative z-10">
          <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} SmartLearn AI. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side: Clean Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size={36} />
          </div>
          
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-zinc-100 mb-2 tracking-tight">Welcome back</h1>
            <p className="text-zinc-400">Please enter your details to sign in.</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all outline-none"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-zinc-300">Password</label>
                <Link to="/forgot-password" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all outline-none pr-10"
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
            
            <Button type="submit" disabled={isLoading} className="w-full mt-4 h-11 text-base font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors">
              {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-zinc-400">
            Don't have an account? <Link to="/signup" className="text-zinc-100 font-medium hover:underline ml-1">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
