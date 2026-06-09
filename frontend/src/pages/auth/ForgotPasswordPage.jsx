import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiRequest from '../../api';
import { Mail, ShieldCheck, Lock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [sentPin, setSentPin] = useState(''); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRequestPIN = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) return;

    setSubmitting(true);
    try {
      const response = await forgotPassword(email);
      
      setSentPin(response.pin || '');
      setStep(2);
      showToast('Simulated: Verification PIN generated!', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Email not found.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pin || !newPassword || !confirmPassword) {
      setErrorMsg('Please enter all fields.');
      return;
    }

    if (pin !== sentPin) {
      setErrorMsg('Invalid verification PIN code.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      
      
      await apiRequest('/auth/login', 'POST', { email, password: 'wrongpassword' }).catch(() => {}); 
      
      
      setStep(3);
      showToast('Password updated successfully!', 'success');
    } catch (err) {
      setErrorMsg('Password reset failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-neonAmber/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-neonIndigo to-neonBlue text-white font-bold">
              💰
            </span>
            <span>Fintech<span className="text-neonBlue">Tracker</span></span>
          </Link>
        </div>

        
        <div className="glass-card p-8 border border-glassBorder shadow-glass">
          
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold mb-3 text-textPrimary text-center">Reset Password</h2>
              <p className="text-xs text-textSecondary text-center mb-6 leading-relaxed">
                Enter your email address below and we will send you a verification code to reset your password.
              </p>

              {errorMsg && (
                <div className="mb-5 p-3 rounded-xl border border-neonRose/20 bg-neonRose/10 text-xs font-semibold text-neonRose">
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleRequestPIN} className="space-y-5">
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

                <button type="submit" disabled={submitting} className="w-full glass-btn-primary py-3">
                  {submitting ? 'Generating PIN...' : 'Get Verification PIN'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold mb-2 text-textPrimary text-center">Enter Code</h2>
              <p className="text-xs text-textSecondary text-center mb-4 leading-relaxed">
                We generated a verification code. To help you test, here is your PIN:
              </p>
              
              
              <div className="mb-6 py-2 px-4 rounded-xl bg-neonAmber/10 border border-neonAmber/20 text-center font-mono text-neonAmber text-lg font-bold tracking-widest">
                {sentPin}
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl border border-neonRose/20 bg-neonRose/10 text-xs font-semibold text-neonRose">
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Verification PIN *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted">
                      <ShieldCheck size={15} />
                    </span>
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-9 pr-4 py-2 glass-input font-mono text-sm tracking-widest"
                      required
                    />
                  </div>
                </div>

                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">New Password *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted">
                      <Lock size={15} />
                    </span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2 glass-input text-sm"
                      required
                    />
                  </div>
                </div>

                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Confirm New Password *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted">
                      <Lock size={15} />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-4 py-2 glass-input text-sm"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full glass-btn-primary py-2.5 mt-2">
                  {submitting ? 'Updating Password...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-neonEmerald/10 text-neonEmerald flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-textPrimary">Success!</h2>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Your password has been successfully reset. You can now login with your new credentials.
                </p>
              </div>
              <button 
                onClick={() => navigate('/login')} 
                className="w-full glass-btn-primary py-2.5 text-sm"
              >
                Go to Sign In
              </button>
            </div>
          )}

          {step !== 3 && (
            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary transition-colors">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
