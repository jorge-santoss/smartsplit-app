import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword } from '../api/userApi';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function SettingsPage() {
  const toast = useToast();
  const { updateUser, deleteAccount: deleteUserAccount } = useAuth();

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPw, setChangingPw] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

        <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280]">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[#2C2C2E] bg-[#121214] px-3 py-2 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280]">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[#2C2C2E] bg-[#121214] px-3 py-2 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#2DD4BF] text-[#121214] px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-teal-400/25"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>

        <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6B7280]">Current Password</label>
              <input
                type="password"
                value={password.currentPassword}
                onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[#2C2C2E] bg-[#121214] px-3 py-2 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280]">New Password</label>
              <input
                type="password"
                value={password.newPassword}
                onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[#2C2C2E] bg-[#121214] px-3 py-2 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280]">Confirm New Password</label>
              <input
                type="password"
                value={password.confirmPassword}
                onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-[#2C2C2E] bg-[#121214] px-3 py-2 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={changingPw}
              className="bg-[#2DD4BF] text-[#121214] px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-teal-400/25"
            >
              {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Delete Account</h3>
          <p className="text-sm text-[#9CA3AF] mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="bg-[#FB7185] text-white px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-rose-400/25"
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? All your data, expenses, and balances will be permanently removed."
        onConfirm={async () => {
          setDeleting(true);
          try {
            await deleteUserAccount();
          } catch (err) {
            toast(err.response?.data?.error || 'Failed to delete account', 'error');
            setDeleting(false);
            setShowDeleteConfirm(false);
          }
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
        }}
      />
    </AppLayout>
  );
}