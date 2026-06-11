import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../lib/axios';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('If the email exists, an OTP has been sent.');
      setStep(2);
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
      toast.success('Password reset successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 rounded-3xl shadow-2xl p-8 relative z-10">
        <Link to="/login" className="absolute top-6 left-6 text-zinc-400 hover:text-zinc-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        
        <div className="text-center mb-8 mt-4">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">Reset Password</h1>
          <p className="text-zinc-400 text-sm">
            {step === 1 ? "Enter your email to receive a code" : "Enter the OTP and your new password"}
          </p>
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-5">
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
            
            <Button type="submit" disabled={isLoading} className="w-full mt-3 h-12 text-base font-semibold rounded-xl">
              {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Send OTP Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndReset} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">6-Digit OTP Code</label>
              <input 
                type="text" 
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-center tracking-[0.5em] font-mono text-xl text-zinc-100"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
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
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none pr-10"
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
            
            <Button type="submit" disabled={isLoading} className="w-full mt-3 h-12 text-base font-semibold rounded-xl">
              {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
