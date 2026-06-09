import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';
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

  const { login } = useAuth();
  const navigate = useNavigate();

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
        navigate('/');
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
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification code.');
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
            "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
          </h2>
          <p className="text-zinc-400 text-lg">— Malcolm X</p>
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
          
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-zinc-100 mb-2 tracking-tight">
              {isVerifying ? "Verify your email" : "Create an account"}
            </h1>
            <p className="text-zinc-400">
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
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
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all outline-none pr-10"
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
              
              <Button type="submit" disabled={isLoading} className="w-full mt-4 h-11 text-base font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors">
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">Verification Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono text-zinc-100 focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 transition-all outline-none"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full mt-4 h-11 text-base font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-300 transition-colors">
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
