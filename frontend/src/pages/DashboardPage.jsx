import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../layouts/AppLayout';
import { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import * as householdApi from '../api/householdApi';
import * as expenseApi from '../api/expenseApi';
import * as settlementApi from '../api/settlementApi';
import * as balanceApi from '../api/balanceApi';
import * as activityApi from '../api/activityApi';

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const { data: households, isLoading } = useQuery({
    queryKey: ['households'],
    queryFn: () => householdApi.list().then((r) => r.data),
  });

  const { data: summary } = useQuery({
    queryKey: ['balanceSummary'],
    queryFn: () => balanceApi.getSummary().then((r) => r.data),
  });

  const { data: feed, isLoading: feedLoading, isError: feedError } = useQuery({
    queryKey: ['activityFeed'],
    queryFn: () => activityApi.getFeed().then((r) => r.data),
  });

  useEffect(() => {
    if (households?.length && !selectedId) {
      setSelectedId(households[0].id);
    }
  }, [households, selectedId]);

  const { data: householdDetail } = useQuery({
    queryKey: ['household', selectedId],
    queryFn: () => householdApi.getById(selectedId).then((r) => r.data),
    enabled: !!selectedId,
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses', selectedId],
    queryFn: () => expenseApi.listByHousehold(selectedId).then((r) => r.data),
    enabled: !!selectedId,
  });

  const { data: settlements } = useQuery({
    queryKey: ['settlements', selectedId],
    queryFn: () => settlementApi.listByHousehold(selectedId).then((r) => r.data),
    enabled: !!selectedId,
  });

  const { data: balances } = useQuery({
    queryKey: ['balances', selectedId],
    queryFn: () => balanceApi.getBalances(selectedId).then((r) => r.data),
    enabled: !!selectedId,
  });

  const totalSpent = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

  const owedPct = summary?.totalOwedToMe > 0
    ? Math.min((summary.totalOwedToMe / (summary.totalOwedToMe + summary.totalIOwe)) * 100, 90)
    : 0;
  const owePct = summary?.totalIOwe > 0
    ? Math.min((summary.totalIOwe / (summary.totalOwedToMe + summary.totalIOwe)) * 100, 90)
    : 0;

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
      setShowCreate(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#0b1c30] leading-10 tracking-tight">Welcome back</h1>
            <p className="text-base text-[#434655]">Here is an overview of your shared finances.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#2563eb] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 self-start md:self-auto shadow-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create New Household
          </button>
        </header>

        {isLoading ? (
          <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
        ) : !households?.length ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">No households yet. Create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Row 1: Total Owed to You */}
            <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#434655]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs font-semibold uppercase tracking-wider">Total Owed to You</span>
              </div>
              <span className="text-4xl font-bold tracking-tight text-[#004ac6]">
                ${(summary?.totalOwedToMe || 0).toFixed(2)}
              </span>
              <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
                <div className="bg-[#004ac6] h-full rounded-full" style={{ width: `${owedPct}%` }} />
              </div>
            </div>

            {/* Row 1: Total You Owe */}
            <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#434655]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <span className="text-xs font-semibold uppercase tracking-wider">Total You Owe</span>
              </div>
              <span className="text-4xl font-bold tracking-tight text-[#ba1a1a]">
                ${(summary?.totalIOwe || 0).toFixed(2)}
              </span>
              <div className="w-full bg-[#ffdad6] h-2 rounded-full overflow-hidden">
                <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: `${owePct}%` }} />
              </div>
            </div>

            {/* Row 1: Household Switcher */}
            <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6 flex flex-col gap-4">
              <label className="text-sm font-medium text-[#434655]">Current Household</label>
              <div className="flex flex-wrap gap-2">
                {households.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setSelectedId(h.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedId === h.id
                        ? 'bg-[#004ac6] text-white'
                        : 'bg-white border border-[#c3c6d7] text-[#434655] hover:bg-[#eff4ff]'
                    }`}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Members Count */}
            <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#434655]">Members</p>
              <p className="text-4xl font-bold tracking-tight text-[#0b1c30]">{householdDetail?.members?.length || 0}</p>
            </div>

            {/* Row 2: Expenses Count */}
            <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#434655]">Expenses</p>
              <p className="text-4xl font-bold tracking-tight text-[#0b1c30]">{expenses?.length || 0}</p>
            </div>

            {/* Row 2: Total Spent */}
            <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#434655]">Total Spent</p>
              <p className="text-4xl font-bold tracking-tight text-[#0b1c30]">${totalSpent.toFixed(2)}</p>
            </div>

            {/* Row 3: My Households (full width) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-semibold text-[#0b1c30] mb-4">My Households</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {households?.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => navigate(`/households/${h.id}`)}
                    className="border border-[#c3c6d7] rounded-xl p-4 hover:bg-[#eff4ff] transition-colors cursor-pointer flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#00174b]">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[#0b1c30]">{h.name}</h3>
                          <p className="text-sm text-[#434655]">{h.member_count || '—'} Members</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-[#c3c6d7]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 4: Balances & Recent Expenses (2-col grid inside 3-col parent) */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Balances Card */}
              <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6">
                <h2 className="text-lg font-semibold text-[#0b1c30] mb-4">Balances</h2>
                {balances ? (
                  <div className="space-y-3">
                    {balances.map((b) => (
                      <div key={b.userId} className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-700">{b.name}</span>
                        <span className={`text-sm font-bold ${b.balance > 0 ? 'text-green-600' : b.balance < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {b.balance > 0 ? '+' : ''}${Math.abs(b.balance).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <SkeletonCard />
                )}
              </div>

              {/* Recent Expenses Card */}
              <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#0b1c30]">Recent Expenses</h2>
                  <button onClick={() => navigate(`/households/${selectedId}?tab=Expenses`)} className="text-sm text-blue-600 hover:underline">View all</button>
                </div>
                {!expenses ? (
                  <SkeletonCard />
                ) : expenses.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No expenses yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {expenses.slice(0, 5).map((exp) => (
                      <div key={exp.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{exp.title}</p>
                          <p className="text-xs text-gray-500">{exp.payer_name} · {new Date(exp.expense_date).toLocaleDateString()}</p>
                        </div>
                        <span className="text-sm font-bold">${parseFloat(exp.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 5: Settlements & Members (2-col grid) */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Settlements Card */}
              <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#0b1c30]">Settlements</h2>
                  <button onClick={() => navigate(`/households/${selectedId}?tab=Settlements`)}className="text-sm text-blue-600 hover:underline">View all</button>
                </div>
                {!settlements ? (
                  <SkeletonCard />
                ) : settlements.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No settlements yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {settlements.slice(0, 5).map((s) => (
                      <div key={s.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.from_user_name} paid {s.to_user_name}</p>
                          <p className="text-xs text-gray-500">{new Date(s.settlement_date).toLocaleDateString()}</p>
                        </div>
                        <span className="text-sm font-bold text-green-600">${parseFloat(s.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Members Card */}
              <div className="bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#0b1c30]">Members</h2>
                  <button onClick={() => navigate(`/households/${selectedId}?tab=Members`)} className="text-sm text-blue-600 hover:underline">Manage</button>
                </div>
                <div className="divide-y divide-gray-100">
                  {householdDetail?.members?.map((m) => (
                    <div key={m.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.email}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            

            {/* Row 6: Recent Activity (full width) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-[#c3c6d7] shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-semibold text-[#0b1c30] mb-4">Recent Activity</h2>
              {feedLoading ? (
                <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
              ) : feedError ? (
                <p className="text-red-500">Failed to load activity feed.</p>
              ) : feed?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No activity yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {feed?.map((item) => (
                    <div key={`${item.type}-${item.item_id}`} className="flex items-center justify-between p-4 border border-[#c3c6d7] rounded-xl hover:bg-[#eff4ff] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#e5eeff] flex items-center justify-center text-[#434655]">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {item.type === 'expense' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            ) : item.type === 'member' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            )}
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0b1c30]">
                            {item.type === 'expense' && <>{item.label}</>}
                            {item.type === 'member' && <>{item.label} joined</>}
                            {item.type === 'settlement' && <>Settlement: {item.label}</>}
                          </p>
                          <p className="text-sm text-[#434655]">
                            {item.type === 'expense' && <>Added by {item.label}</>}
                            {item.household_name && <> in <span className="font-medium">{item.household_name}</span></>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {item.amount !== null && `$${parseFloat(item.amount).toFixed(2)}`}
                        </div>
                        <div className="text-sm text-[#434655]">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Household Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Create Household</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="Household name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="text" placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="bg-[#2563eb] text-white px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Household"
        message={`Delete "${confirmDelete?.name}" and all its data?`}
        onConfirm={() => { if (confirmDelete) deleteMutation.mutate(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </AppLayout>
  );
}