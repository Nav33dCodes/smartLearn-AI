import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Brain, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/axios';
import Logo from '../components/Logo';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      if (response.data.requires_verification) {
        setIsVerifying(true);
        toast.success('Verification code sent to your email.');
      } else {
        login(response.data.user, response.data.access_token, response.data.refresh_token);
        toast.success('Account created successfully!');
        navigate('/app');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-account', { email, otp });
      login(response.data.user, response.data.access_token, response.data.refresh_token);
      toast.success('Email verified successfully! Welcome to SmartLearn AI.');
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex bg-[#000000] font-sans text-zinc-100 tracking-tight">
      {/* Left Side: Professional Quote Section */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 overflow-hidden bg-[#050505] border-r border-white/[0.04]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <Logo size={42} />
            <span className="text-3xl font-bold tracking-tighter text-white">SmartLearn</span>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-lg"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-8 tracking-tighter">
            Elevate your document analysis with Enterprise AI.
          </h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Brain className="text-white w-5 h-5" />
              </div>
              <div>
                <h4 className="text-zinc-100 font-semibold text-[15px] tracking-tight mb-0.5">Advanced RAG Architecture</h4>
                <p className="text-zinc-500 text-[14px]">Context-aware semantic document retrieval.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                <Zap className="text-white w-5 h-5" />
              </div>
              <div>
                <h4 className="text-zinc-100 font-semibold text-[15px] tracking-tight mb-0.5">Ultra-Low Latency Inference</h4>
                <p className="text-zinc-500 text-[14px]">Powered by frontier models and LPU engines.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <div>
                <h4 className="text-zinc-100 font-semibold text-[15px] tracking-tight mb-0.5">Zero-Knowledge Security</h4>
                <p className="text-zinc-500 text-[14px]">Military-grade encryption with zero training data retention.</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="relative z-10">
          <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} SmartLearn AI. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side: Clean Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size={36} />
          </div>
          
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tighter">
              {isVerifying ? "Verify your email" : "Create an account"}
            </h1>
            <p className="text-zinc-400 text-[15px] leading-relaxed">
              {isVerifying 
                ? `We sent a verification code to ${email}.`
                : "Join SmartLearn to start analyzing your documents."}
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2 overflow-hidden mb-5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!isVerifying ? (
            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              <div>
                <label className="block text-[13px] font-semibold text-zinc-300 mb-2 tracking-wide uppercase">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-xl px-4 py-3.5 text-[15px] text-zinc-100 focus:border-white/20 focus:ring-0 shadow-[0_0_15px_rgba(255,255,255,0.02)] focus:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-zinc-300 mb-2 tracking-wide uppercase">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-xl px-4 py-3.5 text-[15px] text-zinc-100 focus:border-white/20 focus:ring-0 shadow-[0_0_15px_rgba(255,255,255,0.02)] focus:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-zinc-300 mb-2 tracking-wide uppercase">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-xl px-4 py-3.5 text-[15px] text-zinc-100 focus:border-white/20 focus:ring-0 shadow-[0_0_15px_rgba(255,255,255,0.02)] focus:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all outline-none pr-10"
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
              
              <div>
                <label className="block text-[13px] font-semibold text-zinc-300 mb-2 tracking-wide uppercase">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-xl px-4 py-3.5 text-[15px] text-zinc-100 focus:border-white/20 focus:ring-0 shadow-[0_0_15px_rgba(255,255,255,0.02)] focus:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all outline-none pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full mt-6 py-6 text-base font-semibold rounded-xl bg-white text-black hover:bg-zinc-100 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Create Account'}
              </Button>
            </form>
          ) : (
            <motion.form 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleVerify} 
              className="flex flex-col gap-5"
            >
              <div>
                <label className="block text-[13px] font-semibold text-zinc-300 mb-2 tracking-wide uppercase">Verification Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-xl px-4 py-4 text-center text-3xl tracking-[0.4em] font-mono text-zinc-100 focus:border-white/20 focus:ring-0 shadow-[0_0_15px_rgba(255,255,255,0.02)] focus:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all outline-none"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full mt-6 py-6 text-base font-semibold rounded-xl bg-white text-black hover:bg-zinc-100 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Verify & Continue'}
              </Button>

              <div className="text-center mt-2">
                <button 
                  type="button" 
                  onClick={async () => {
                    try {
                      await api.post('/auth/resend-verification', { email });
                      toast.success("A new verification code has been sent!");
                    } catch (err) {
                      toast.error("Failed to resend code. Please try again.");
                    }
                  }}
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Didn't receive a code? Resend
                </button>
              </div>
            </motion.form>
          )}
          
          {!isVerifying && (
            <div className="mt-8 text-center text-sm text-zinc-400">
              Already have an account? <Link to="/login" className="text-zinc-100 font-medium hover:underline ml-1">Sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
