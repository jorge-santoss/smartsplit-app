import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../layouts/AppLayout';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import * as householdApi from '../api/householdApi';
import * as balanceApi from '../api/balanceApi';
import * as activityApi from '../api/activityApi';

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { data: households, isLoading } = useQuery({
    queryKey: ['households'],
    queryFn: () => householdApi.list().then((r) => r.data),
  });

  const { data: summary } = useQuery({
    queryKey: ['balanceSummary'],
    queryFn: () => balanceApi.getSummary().then((r) => r.data),
  });

  const { data: feed } = useQuery({
    queryKey: ['activityFeed'],
    queryFn: () => activityApi.getFeed().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (householdId) => householdApi.remove(householdId),
    onSuccess: () => {
      toast('Household deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['households'] });
    },
    onError: (err) => {
      toast(err.response?.data?.error || 'Failed to delete household', 'error');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => householdApi.create(data.name, data.description),
    onSuccess: () => {
      toast('Household created!', 'success');
      queryClient.invalidateQueries({ queryKey: ['households'] });
      setNewName('');
      setNewDesc('');
    },
    onError: (err) => {
      toast(err.response?.data?.error || 'Failed to create household', 'error');
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      createMutation.mutate({ name: newName, description: newDesc });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">Owed to you</p>
            <p className={`text-2xl font-bold ${summary?.totalOwedToMe > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {summary ? `$${summary.totalOwedToMe.toFixed(2)}` : '—'}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">You owe</p>
            <p className={`text-2xl font-bold ${summary?.totalIOwe > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {summary ? `$${summary.totalIOwe.toFixed(2)}` : '—'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Create Household</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              placeholder="Household name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">My Households</h2>
          {isLoading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : households?.length === 0 ? (
            <p className="text-gray-500">No households yet. Create one above!</p>
          ) : (
            <div className="space-y-3">
              {households?.map((h) => (
                <div
                  key={h.id}
                  onClick={() => navigate(`/households/${h.id}`)}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{h.name}</h3>
                      {h.description && (
                        <p className="text-sm text-gray-500">{h.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${h.name}" and all its data?`)) {
                          deleteMutation.mutate(h.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {!feed ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : feed.length === 0 ? (
            <p className="text-gray-500">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {feed.map((item, idx) => (
                <div key={`${item.type}-${item.item_id}-${idx}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm">
                      {item.type === 'expense' && <span>Added <strong>{item.label}</strong></span>}
                      {item.type === 'member' && <span><strong>{item.label}</strong> joined</span>}
                      {item.type === 'settlement' && <span>Settlement: {item.label}</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.household_name}
                      {item.amount !== null && ` · $${parseFloat(item.amount).toFixed(2)}`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}