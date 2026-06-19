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
        <h2 className="text-2xl font-bold text-[#154535]">Settings</h2>

        <div className="bg-white rounded-xl border border-white/80 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#154535] mb-4">Profile</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A6B5D]">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[#E1EEE8] bg-[#F8FCFA] px-3 py-2 text-sm text-[#154535] placeholder:text-[#4A6B5D]/60 focus:outline-none focus:ring-2 focus:ring-[#154535]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A6B5D]">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[#E1EEE8] bg-[#F8FCFA] px-3 py-2 text-sm text-[#154535] placeholder:text-[#4A6B5D]/60 focus:outline-none focus:ring-2 focus:ring-[#154535]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#154535] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1b5c48] disabled:opacity-50 transition-colors shadow-sm"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-white/80 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#154535] mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A6B5D]">Current Password</label>
              <input
                type="password"
                value={password.currentPassword}
                onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[#E1EEE8] bg-[#F8FCFA] px-3 py-2 text-sm text-[#154535] placeholder:text-[#4A6B5D]/60 focus:outline-none focus:ring-2 focus:ring-[#154535]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A6B5D]">New Password</label>
              <input
                type="password"
                value={password.newPassword}
                onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[#E1EEE8] bg-[#F8FCFA] px-3 py-2 text-sm text-[#154535] placeholder:text-[#4A6B5D]/60 focus:outline-none focus:ring-2 focus:ring-[#154535]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A6B5D]">Confirm New Password</label>
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[#E1EEE8] bg-[#F8FCFA] px-3 py-2 text-sm text-[#154535] placeholder:text-[#4A6B5D]/60 focus:outline-none focus:ring-2 focus:ring-[#154535]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={changingPw}
              className="bg-[#154535] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1b5c48] disabled:opacity-50 transition-colors shadow-sm"
            >
              {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}