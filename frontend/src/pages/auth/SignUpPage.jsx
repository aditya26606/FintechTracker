import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please enter all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, mobile, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try using another email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-neonBlue/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-neonIndigo to-neonBlue text-white font-bold">
              💰
            </span>
            <span>Fintech<span className="text-neonBlue">Tracker</span></span>
          </Link>
          <p className="text-sm text-textSecondary mt-2">Create a secure profile to start tracking</p>
        </div>

        
        <div className="glass-card p-8 border border-glassBorder shadow-glass">
          <h2 className="text-xl font-bold mb-6 text-textPrimary text-center">Get Started</h2>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl border border-neonRose/20 bg-neonRose/10 text-xs font-semibold text-neonRose">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-4 py-2 glass-input text-sm"
                  required
                />
              </div>
            </div>

            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full pl-9 pr-4 py-2 glass-input text-sm"
                  required
                />
              </div>
            </div>

            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted">
                  <Phone size={15} />
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-4 py-2 glass-input text-sm"
                />
              </div>
            </div>

            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 chars)"
                  className="w-full pl-9 pr-10 py-2 glass-input text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-textPrimary"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Confirm Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 glass-input text-sm"
                  required
                />
              </div>
            </div>

            
            <button
              type="submit"
              disabled={submitting}
              className="w-full glass-btn-primary py-2.5 mt-2 text-sm"
            >
              {submitting ? 'Creating Profile...' : 'Register Profile'}
              <ArrowRight size={15} />
            </button>
          </form>

          
          <div className="mt-5 text-center text-xs text-textSecondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-neonBlue hover:underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignUpPage;
