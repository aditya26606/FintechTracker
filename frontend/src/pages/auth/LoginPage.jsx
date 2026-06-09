import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);

      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-neonIndigo/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-neonIndigo to-neonBlue text-white font-bold">
              💰
            </span>
            <span>Fintech<span className="text-neonBlue">Tracker</span></span>
          </Link>
          <p className="text-sm text-textSecondary mt-2">Log in to manage your automated finances</p>
        </div>

        
        <div className="glass-card p-8 border border-glassBorder shadow-glass">
          <h2 className="text-xl font-bold mb-6 text-textPrimary text-center">Welcome Back</h2>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl border border-neonRose/20 bg-neonRose/10 text-xs font-semibold text-neonRose">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 glass-input"
                  required
                />
              </div>
            </div>

            
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-neonBlue hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 glass-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-textMuted hover:text-textPrimary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-neonBlue focus:ring-neonBlue/20 focus:ring-offset-darkBg"
              />
              <label htmlFor="remember_me" className="ml-2 text-xs text-textSecondary select-none">
                Remember my email address
              </label>
            </div>

            
            <button
              type="submit"
              disabled={submitting}
              className="w-full glass-btn-primary py-3"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>

          
          <div className="mt-6 text-center text-xs text-textSecondary">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-neonBlue hover:underline">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
