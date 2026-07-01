import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword } from '../api/userApi';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const toast = useToast();
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPw, setChangingPw] = useState(false);

    const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
    retry: false,
  });

  useEffect(() => {
    if (profileData) {
      setProfile({ name: profileData.name, email: profileData.email });
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: () => updateProfile(profile.name, profile.email),
    onSuccess: () => {
      updateUser({ name: profile.name, email: profile.email });
      toast('Profile updated', 'success');
    },
    onError: (err) => {
      toast(err.response?.data?.error || 'Failed to update profile', 'error');
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      toast('Passwords do not match', 'error');
      return;
    }
    if (password.newPassword.length < 6) {
      toast('New password must be at least 6 characters', 'error');
      return;
    }
    setChangingPw(true);
    try {
      await changePassword(password.currentPassword, password.newPassword);
      toast('Password changed', 'success');
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8 p-4 sm:p-6 lg:p-0">
        <h2 className="text-2xl font-bold text-white">Settings</h2>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FCEA3C] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FCEA3C] transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#FCEA3C] text-[#121212] px-4 py-2 rounded-lg text-sm font-medium hover:brightness-105 disabled:opacity-50 transition-all shadow-lg shadow-yellow-500/20"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Current Password</label>
              <input
                type="password"
                value={password.currentPassword}
                onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FCEA3C] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">New Password</label>
              <input
                type="password"
                value={password.newPassword}
                onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FCEA3C] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Confirm New Password</label>
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FCEA3C] transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={changingPw}
              className="bg-[#FCEA3C] text-[#121212] px-4 py-2 rounded-lg text-sm font-medium hover:brightness-105 disabled:opacity-50 transition-all shadow-lg shadow-yellow-500/20"
            >
              {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}