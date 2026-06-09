import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Phone, Mail, Lock, ShieldCheck, FileKey, Loader } from 'lucide-react';
import { BACKEND_URL } from '../api';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const toast = useToast();

  
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.showToast('Full name is required.', 'warning');
      return;
    }

    setUpdatingProfile(true);
    try {
      await updateProfile({ name, mobile });
    } catch (err) {
      toast.showToast('Profile details update failed.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.showToast('Please fill all password fields.', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      toast.showToast('New password must be at least 6 characters long.', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.showToast('Passwords do not match.', 'warning');
      return;
    }

    setUpdatingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center space-y-4 lg:col-span-1 h-fit">
        
        
        <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-slate-900 shadow-glow-blue/20 overflow-hidden bg-gradient-to-tr from-neonIndigo to-neonBlue">
          {user?.profilePhoto ? (
            <img 
              src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${BACKEND_URL}${user.profilePhoto}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0.5 rounded-full border border-white/20 flex items-center justify-center shadow-inner text-white text-4xl font-extrabold">
              {getInitials(user?.name)}
            </div>
          )}
        </div>

        <div className="space-y-1 overflow-hidden w-full">
          <h3 className="text-lg font-bold text-textPrimary truncate">{user?.name}</h3>
          <p className="text-xs text-textSecondary truncate">{user?.email}</p>
        </div>

        <div className="w-full pt-4 border-t border-glassBorder/40 text-xs text-textMuted space-y-2">
          <div className="flex justify-between items-center">
            <span>Profile Status:</span>
            <span className="font-bold text-neonBlue flex items-center gap-1">
              <ShieldCheck size={12} /> Active
            </span>
          </div>
        </div>
      </div>

      
      <div className="lg:col-span-2 space-y-6">
        
        
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
            <User className="text-neonBlue" size={16} />
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Modify Account Profile</h4>
          </div>

          <form onSubmit={handleUpdateDetails} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted pointer-events-none">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 glass-input text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted pointer-events-none">
                    <Phone size={15} />
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 glass-input text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Registered Email (Read-Only)</label>
              <div className="relative opacity-60">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted pointer-events-none">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-glassBorder rounded-xl text-sm font-semibold cursor-not-allowed text-textMuted"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={updatingProfile} 
              className="glass-btn-primary py-2 px-5 text-xs ml-auto flex items-center gap-1.5"
            >
              {updatingProfile ? <Loader className="animate-spin" size={12} /> : null}
              <span>Save modifications</span>
            </button>
          </form>
        </div>

        
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-glassBorder pb-3">
            <Lock className="text-neonAmber" size={16} />
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Change Password</h4>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Current Password *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted pointer-events-none">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 glass-input text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">New Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted pointer-events-none">
                    <FileKey size={15} />
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

              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider">Confirm New Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-textMuted pointer-events-none">
                    <FileKey size={15} />
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
            </div>

            <button 
              type="submit" 
              disabled={updatingPassword} 
              className="glass-btn-primary py-2 px-5 text-xs ml-auto flex items-center gap-1.5"
            >
              {updatingPassword ? <Loader className="animate-spin" size={12} /> : null}
              <span>Update Password</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
