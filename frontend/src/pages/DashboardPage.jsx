import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import { SkeletonCard } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "../components/ConfirmDialog";
import * as householdApi from "../api/householdApi";
import * as expenseApi from "../api/expenseApi";
import * as settlementApi from "../api/settlementApi";
import * as balanceApi from "../api/balanceApi";
import * as activityApi from "../api/activityApi";
import { useAuth } from "../hooks/useAuth";
import Avatar from "../components/Avatar";
import Pagination from "../components/Pagination";
import {
  Plus,
  CircleDollarSign,
  CreditCard,
  Home,
  ChevronRight,
  UserPlus,
  ArrowLeftRight,
  Pencil,
  Trash2,
  Receipt,
  Handshake,
  Banknote,
  Bell,
  Tag,
} from "lucide-react";

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [feedPage, setFeedPage] = useState(1);
  const feedLimit = 5;

  const { data: households, isLoading } = useQuery({
    queryKey: ["households"],
    queryFn: () => householdApi.list().then((r) => r.data),
  });

  const { data: summary } = useQuery({
    queryKey: ["balanceSummary"],
    queryFn: () => balanceApi.getSummary().then((r) => r.data),
  });

  const {
    data: feedData,
    isLoading: feedLoading,
    isError: feedError,
  } = useQuery({
    queryKey: ["activityFeed", feedPage],
    queryFn: () => activityApi.getFeed(feedPage, feedLimit).then((r) => r.data),
  });

  const feed = feedData?.data;

  useEffect(() => {
    if (households?.length && !selectedId) {
      setSelectedId(households[0].id);
    }
  }, [households, selectedId]);

  const { data: householdDetail } = useQuery({
    queryKey: ["household", selectedId],
    queryFn: () => householdApi.getById(selectedId).then((r) => r.data),
    enabled: !!selectedId,
  });

  const { data: expensesData } = useQuery({
    queryKey: ["expenses", selectedId],
    queryFn: () => expenseApi.listByHousehold(selectedId).then((r) => r.data),
    enabled: !!selectedId,
  });
  const expenses = expensesData?.data;

  const { data: settlementsData } = useQuery({
    queryKey: ["settlements", selectedId],
    queryFn: () =>
      settlementApi.listByHousehold(selectedId).then((r) => r.data),
    enabled: !!selectedId,
  });
  const settlements = settlementsData?.data;

  const { data: balances } = useQuery({
    queryKey: ["balances", selectedId],
    queryFn: () => balanceApi.getBalances(selectedId).then((r) => r.data),
    enabled: !!selectedId,
  });

  const totalSpent =
    expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

  const owedPct =
    summary?.totalOwedToMe > 0
      ? Math.min(
          (summary.totalOwedToMe /
            (summary.totalOwedToMe + summary.totalIOwe)) *
            100,
          90,
        )
      : 0;
  const owePct =
    summary?.totalIOwe > 0
      ? Math.min(
          (summary.totalIOwe / (summary.totalOwedToMe + summary.totalIOwe)) *
            100,
          90,
        )
      : 0;

  const deleteMutation = useMutation({
    mutationFn: (householdId) => householdApi.remove(householdId),
    onSuccess: () => {
      toast("Household deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to delete household", "error");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => householdApi.create(data.name, data.description),
    onSuccess: () => {
      toast("Household created!", "success");
      queryClient.invalidateQueries({ queryKey: ["households"] });
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to create household", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => householdApi.update(id, { name }),
    onSuccess: () => {
      toast("Household renamed!", "success");
      queryClient.invalidateQueries({ queryKey: ["households"] });
      setEditingId(null);
      setEditName("");
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to rename household", "error");
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      createMutation.mutate({ name: newName, description: newDesc });
    }
  };

  const handleStartEdit = (h) => {
    setEditingId(h.id);
    setEditName(h.name);
  };

  const handleSaveEdit = (id) => {
    if (editName.trim()) {
      updateMutation.mutate({ id, name: editName.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  return (
    <AppLayout>
      {/* Mint Green Page Wrapper */}
      <div className="min-h-screen bg-[#E1EEE8] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#154535] tracking-tight">
                Welcome back{" "}
                <span className="text-[#154535]">{user?.name || "User"}</span>
              </h1>
              <p className="text-base text-[#4A6B5D] font-medium mt-1">
                Here is an overview of your shared finances.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-[#154535] text-white text-sm font-semibold px-8 py-3.5 rounded-xl hover:bg-[#1b5c48] transition-colors shadow-sm flex items-center gap-2 self-start md:self-auto"
            >
              <Plus className="w-5 h-5" />
              Create New Household
            </button>
          </header>

          {isLoading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : !households?.length ? (
            <div className="text-center py-20 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm">
              <Home className="w-12 h-12 text-[#154535]/40 mx-auto mb-3" />
              <p className="text-[#4A6B5D] font-medium">No households yet. Create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Row 1: Total Owed to You */}
              <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#4A6B5D]">
                  <CircleDollarSign className="w-5 h-5 text-[#154535]" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Total Owed to You
                  </span>
                </div>
                <span className="text-4xl font-bold tracking-tight text-[#154535]">
                  ${(summary?.totalOwedToMe || 0).toFixed(2)}
                </span>
                <div className="w-full bg-[#E1EEE8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#154535] h-full rounded-full"
                    style={{ width: `${owedPct}%` }}
                  />
                </div>
              </div>

              {/* Row 1: Total You Owe */}
              <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#4A6B5D]">
                  <CreditCard className="w-5 h-5 text-[#154535]" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Total You Owe
                  </span>
                </div>
                <span className="text-4xl font-bold tracking-tight text-[#D94A4A]">
                  ${(summary?.totalIOwe || 0).toFixed(2)}
                </span>
                <div className="w-full bg-[#FDE8E8] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D94A4A] h-full rounded-full"
                    style={{ width: `${owePct}%` }}
                  />
                </div>
              </div>

              {/* Row 1: Household Switcher */}
              <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6 flex flex-col gap-4">
                <label className="text-sm font-medium text-[#154535]">
                  Current Household
                </label>
                {/* Desktop pills */}
                <div className="hidden md:flex flex-wrap gap-2">
                  {households.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedId(h.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                        selectedId === h.id
                          ? "bg-[#154535] border-[#154535] text-white shadow-sm"
                          : "bg-white/40 border-transparent text-[#4A6B5D] hover:bg-[#E1EEE8]/50 hover:border-[#154535]/20"
                      }`}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
                {/* Mobile dropdown */}
                <select
                  value={selectedId || ""}
                  onChange={(e) => setSelectedId(Number(e.target.value))}
                  className="md:hidden w-full bg-white/40 border-[#E1EEE8] rounded-xl px-4 py-2.5 text-sm text-[#154535] focus:outline-none focus:ring-2 focus:ring-[#154535]/50 border"
                >
                  {households.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Members Count */}
              <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#4A6B5D]">
                  Members
                </p>
                <p className="text-4xl font-bold tracking-tight text-[#154535] mt-1">
                  {householdDetail?.members?.length || 0}
                </p>
              </div>

              {/* Row 2: Expenses Count */}
              <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#4A6B5D]">
                  Expenses
                </p>
                <p className="text-4xl font-bold tracking-tight text-[#154535] mt-1">
                  {expenses?.length || 0}
                </p>
              </div>

              {/* Row 2: Total Spent */}
              <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#4A6B5D]">
                  Total Spent
                </p>
                <p className="text-4xl font-bold tracking-tight text-[#154535] mt-1">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>

              {/* Row 3: My Households (full width) */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-white/80 shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-semibold text-[#154535] mb-4">
                  My Households
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {households?.map((h) => (
                    <div
                      key={h.id}
                      className="bg-[#F8FCFA] border border-[#E1EEE8] rounded-xl p-4 flex flex-col gap-2"
                    >
                      {editingId === h.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-4 py-1.5 bg-white border-[#E1EEE8] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#154535]"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(h.id)}
                            disabled={updateMutation.isPending}
                            className="text-xs bg-[#154535] text-white px-4 py-1.5 rounded-full hover:opacity-90 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-xs bg-white border border-[#E1EEE8] text-[#4A6B5D] px-4 py-1.5 rounded-full hover:bg-[#E1EEE8]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div
                            onClick={() => navigate(`/households/${h.id}`)}
                            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#E1EEE8] flex items-center justify-center shrink-0">
                              <Home className="w-5 h-5 text-[#154535]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-[#154535] truncate">
                                {h.name}
                              </h3>
                              <p className="text-sm text-[#4A6B5D]">
                                {h.member_count || "—"} Members
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {h.owner_id === user?.id && (
                              <>
                                <button
                                  onClick={() => handleStartEdit(h)}
                                  className="text-[#4A6B5D] hover:text-[#154535] p-1 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(h)}
                                  className="text-[#4A6B5D] hover:text-[#D94A4A] p-1 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <ChevronRight className="w-5 h-5 text-[#154535]" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-[#154535] mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Expenses`)
                      }
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#E1EEE8]/40 hover:bg-[#154535]/5 border border-transparent hover:border-[#154535]/20 transition-all text-[#4A6B5D] hover:text-[#154535]"
                    >
                      <Receipt className="w-6 h-6 text-[#154535]" />
                      <span className="text-xs font-medium">Add Expense</span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Settlements`)
                      }
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#E1EEE8]/40 hover:bg-[#154535]/5 border border-transparent hover:border-[#154535]/20 transition-all text-[#4A6B5D] hover:text-[#154535]"
                    >
                      <Banknote className="w-6 h-6 text-[#154535]" />
                      <span className="text-xs font-medium">Settle Up</span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Members`)
                      }
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#E1EEE8]/40 hover:bg-[#154535]/5 border border-transparent hover:border-[#154535]/20 transition-all text-[#4A6B5D] hover:text-[#154535]"
                    >
                      <UserPlus className="w-6 h-6 text-[#154535]" />
                      <span className="text-xs font-medium">Invite</span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Categories`)
                      }
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#E1EEE8]/40 hover:bg-[#154535]/5 border border-transparent hover:border-[#154535]/20 transition-all text-[#4A6B5D] hover:text-[#154535]"
                    >
                      <Tag className="w-6 h-6 text-[#154535]" />
                      <span className="text-xs font-medium">Categories</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Balances & Recent Expenses (2-col grid inside 3-col parent) */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balances Card */}
                <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-[#154535] mb-4">
                    Balances
                  </h2>
                  {balances ? (
                    <div className="space-y-3">
                      {balances.debts?.length > 0 && (
                        <div className="bg-red-50/70 rounded-lg px-3 py-2 mb-3 border border-red-100/50">
                          <p className="text-xs font-medium text-[#D94A4A]">
                            {balances.debts.length} debt
                            {balances.debts.length > 1 ? "s" : ""} to settle
                          </p>
                        </div>
                      )}
                      {balances.balances.map((b) => (
                        <div key={b.id} className="flex items-center gap-2 py-2">
                          <Avatar
                            name={b.name}
                            size="sm"
                            className="bg-[#E1EEE8] text-[#154535]"
                          />
                          <span className="text-sm font-medium text-[#4A6B5D] flex-1">
                            {b.name}
                          </span>
                          <span
                            className={`text-sm font-bold ${b.net_balance > 0 ? "text-[#154535]" : b.net_balance < 0 ? "text-[#D94A4A]" : "text-[#4A6B5D]"}`}
                          >
                            {b.net_balance > 0 ? "+" : ""}$
                            {Math.abs(b.net_balance).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <SkeletonCard />
                  )}
                </div>

                {/* Recent Expenses Card */}
                <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#154535]">
                      Recent Expenses
                    </h2>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Expenses`)
                      }
                      className="text-sm text-[#4A6B5D] hover:text-[#154535] transition-colors"
                    >
                      View all
                    </button>
                  </div>
                  {!expenses ? (
                    <SkeletonCard />
                  ) : expenses.length === 0 ? (
                    <p className="text-sm text-[#4A6B5D] text-center py-8 flex flex-col items-center gap-2">
                      <Receipt className="w-8 h-8 text-[#4A6B5D] opacity-40" />
                      No expenses yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#E1EEE8]">
                      {expenses.slice(0, 5).map((exp) => (
                        <div
                          key={exp.id}
                          className="py-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-[#154535]">
                              {exp.title}
                            </p>
                            <p className="text-xs text-[#4A6B5D]">
                              {exp.payer_name} ·{" "}
                              {new Date(exp.expense_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-[#154535]">
                            ${parseFloat(exp.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Settlements & Members (2-col grid) */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Settlements Card */}
                <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#154535]">
                      Settlements
                    </h2>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Settlements`)
                      }
                      className="text-sm text-[#4A6B5D] hover:text-[#154535] transition-colors"
                    >
                      View all
                    </button>
                  </div>
                  {!settlements ? (
                    <SkeletonCard />
                  ) : settlements.length === 0 ? (
                    <p className="text-sm text-[#4A6B5D] text-center py-8 flex flex-col items-center gap-2">
                      <Banknote className="w-8 h-8 text-[#4A6B5D] opacity-40" />
                      No settlements yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#E1EEE8]">
                      {settlements.slice(0, 5).map((s) => (
                        <div
                          key={s.id}
                          className="py-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-[#154535]">
                              {s.from_user_name} paid {s.to_user_name}
                            </p>
                            <p className="text-xs text-[#4A6B5D]">
                              {new Date(s.settlement_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-[#154535]">
                            ${parseFloat(s.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Members Card */}
                <div className="bg-white rounded-2xl border border-white/80 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#154535]">
                      Members
                    </h2>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Members`)
                      }
                      className="text-sm text-[#4A6B5D] hover:text-[#154535] transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="divide-y divide-[#E1EEE8]">
                    {householdDetail?.members?.map((m) => (
                      <div
                        key={m.id}
                        className="py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={m.name}
                            size="sm"
                            className="bg-[#E1EEE8] text-[#154535]"
                          />
                          <div>
                            <p className="text-sm font-medium text-[#154535]">
                              {m.name}
                            </p>
                            <p className="text-xs text-[#4A6B5D]">{m.email}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-[#E1EEE8] text-[#154535] px-2 py-0.5 rounded-full font-medium">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 6: Recent Activity (full width) */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-white/80 shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-semibold text-[#154535] mb-4">
                  Recent Activity
                </h2>
                {feedLoading ? (
                  <div className="space-y-3">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : feedError ? (
                  <p className="text-[#D94A4A]">Failed to load activity feed.</p>
                ) : feed?.length === 0 ? (
                  <div className="text-center py-12 bg-[#F8FCFA] rounded-xl border border-[#E1EEE8]">
                    <Bell className="w-10 h-10 text-[#4A6B5D] opacity-40 mx-auto mb-2" />
                    <p className="text-[#4A6B5D]">No activity yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {feed?.map((item) => (
                      <div
                        key={`${item.type}-${item.item_id}-${item.household_name}`}
                        className="flex items-center justify-between p-4 bg-[#F8FCFA] border border-[#E1EEE8] rounded-xl hover:bg-white hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#E1EEE8] flex items-center justify-center">
                            {item.type === "expense" ? (
                              <CreditCard className="w-5 h-5 text-[#154535]" />
                            ) : item.type === "member" ? (
                              <UserPlus className="w-5 h-5 text-[#154535]" />
                            ) : (
                              <ArrowLeftRight className="w-5 h-5 text-[#154535]" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#154535]">
                              {item.type === "expense" && <>{item.label}</>}
                              {item.type === "member" && <>{item.label} joined</>}
                              {item.type === "settlement" && (
                                <>Settlement: {item.label}</>
                              )}
                            </p>
                            <p className="text-sm text-[#4A6B5D]">
                              {item.type === "expense" && (
                                <>Added by {item.label}</>
                              )}
                              {item.household_name && (
                                <>
                                  {" "}
                                  in{" "}
                                  <span className="font-medium">
                                    {item.household_name}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[#154535]">
                            {item.amount !== null &&
                              `$${parseFloat(item.amount).toFixed(2)}`}
                          </div>
                          <div className="text-sm text-[#4A6B5D]">
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {feedData && (
                  <Pagination
                    page={feedPage}
                    totalPages={feedData.totalPages}
                    onPageChange={setFeedPage}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Household Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md shadow-xl border border-white/80"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-[#154535] mb-4">Create Household</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Household name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 border-[#E1EEE8] bg-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#154535] border"
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-4 py-3 border-[#E1EEE8] bg-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#154535] border"
              />
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-2 bg-[#E1EEE8] text-[#4A6B5D] rounded-xl hover:bg-white border border-[#E1EEE8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-[#154535] text-white px-6 py-2 rounded-xl hover:bg-[#1b5c48] transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
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
        onConfirm={() => {
          if (confirmDelete) deleteMutation.mutate(confirmDelete.id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </AppLayout>
  );
}