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
      {/* Minimalist Dark Flat Design Layout referencing the image aesthetic */}
      <div className="min-h-screen bg-[#121214] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header - Teal Accent */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Welcome back{" "}
                <span className="text-[#2DD4BF]">{user?.name || "User"}</span>
              </h1>
              <p className="text-base text-[#9CA3AF] font-medium mt-1">
                Here is an overview of your shared finances.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-[#2DD4BF] text-[#121214] text-sm font-semibold px-8 py-3.5 rounded-full hover:brightness-110 transition-all shadow-lg shadow-teal-400/25 flex items-center gap-2 self-start md:self-auto"
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
            <div className="text-center py-20 bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl">
              <Home className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
              <p className="text-[#9CA3AF] font-medium">No households yet. Create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Row 1: Total Owed to You - Dark solid card */}
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <CircleDollarSign className="w-5 h-5 text-[#2DD4BF]" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Total Owed to You
                  </span>
                </div>
                <span className="text-4xl font-bold tracking-tight text-white">
                  ${(summary?.totalOwedToMe || 0).toFixed(2)}
                </span>
                <div className="w-full bg-[#2C2C2E] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2DD4BF] h-full rounded-full"
                    style={{ width: `${owedPct}%` }}
                  />
                </div>
              </div>

              {/* Row 1: Total You Owe - Dark solid card */}
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <CreditCard className="w-5 h-5 text-[#FB7185]" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Total You Owe
                  </span>
                </div>
                <span className="text-4xl font-bold tracking-tight text-[#FB7185]">
                  ${(summary?.totalIOwe || 0).toFixed(2)}
                </span>
                <div className="w-full bg-[#2C2C2E] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FB7185] h-full rounded-full"
                    style={{ width: `${owePct}%` }}
                  />
                </div>
              </div>

              {/* Row 1: Household Switcher - Dark solid card */}
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6 flex flex-col gap-4">
                <label className="text-sm font-medium text-white">
                  Current Household
                </label>
                {/* Desktop pills - referencing the selected highlighter */}
                <div className="hidden md:flex flex-wrap gap-2">
                  {households.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedId(h.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        selectedId === h.id
                          ? "bg-[#2DD4BF] border-[#2DD4BF] text-[#121214] shadow-lg shadow-teal-400/25"
                          : "bg-transparent border-[#2C2C2E] text-[#9CA3AF] hover:bg-[#2C2C2E] hover:border-[#4B4B4F]"
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
                  className="md:hidden w-full bg-[#121214] border-[#2C2C2E] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                >
                  {households.map((h) => (
                    <option key={h.id} value={h.id} className="bg-[#121214] text-white">
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Members Count */}
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  Members
                </p>
                <p className="text-4xl font-bold tracking-tight text-white mt-1">
                  {householdDetail?.members?.length || 0}
                </p>
              </div>

              {/* Row 2: Expenses Count */}
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  Expenses
                </p>
                <p className="text-4xl font-bold tracking-tight text-white mt-1">
                  {expenses?.length || 0}
                </p>
              </div>

              {/* Row 2: Total Spent */}
              <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  Total Spent
                </p>
                <p className="text-4xl font-bold tracking-tight text-white mt-1">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>

              {/* Row 3: My Households (full width) - Dark Card */}
              <div className="lg:col-span-3 bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  My Households
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {households?.map((h) => (
                    <div
                      key={h.id}
                      className="bg-[#121214] border border-[#2C2C2E] rounded-xl p-4 flex flex-col gap-2 hover:bg-[#28282B] transition-colors"
                    >
                      {editingId === h.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-4 py-1.5 bg-[#1C1C1E] border-[#2C2C2E] rounded-full text-sm text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(h.id)}
                            disabled={updateMutation.isPending}
                            className="text-xs bg-[#2DD4BF] text-[#121214] px-4 py-1.5 rounded-full hover:brightness-110 shadow-lg shadow-teal-400/25 disabled:opacity-50 transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-xs bg-[#1C1C1E] border border-[#2C2C2E] text-[#9CA3AF] px-4 py-1.5 rounded-full hover:bg-[#2C2C2E] hover:text-white transition-all"
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
                            <div className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center shrink-0">
                              <Home className="w-5 h-5 text-[#2DD4BF]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-white truncate">
                                {h.name}
                              </h3>
                              <p className="text-sm text-[#9CA3AF]">
                                {h.member_count || "—"} Members
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {h.owner_id === user?.id && (
                              <>
                                <button
                                  onClick={() => handleStartEdit(h)}
                                  className="text-[#6B7280] hover:text-[#2DD4BF] p-1 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(h)}
                                  className="text-[#6B7280] hover:text-[#FB7185] p-1 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <ChevronRight className="w-5 h-5 text-[#2DD4BF]" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Quick Actions
                  </h2>
                  {/* Applying the solid colored blocks aesthetic from the reference image */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Expenses`)
                      }
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#2DD4BF] text-[#121214] hover:brightness-110 transition-all shadow-lg shadow-teal-400/20"
                    >
                      <Receipt className="w-6 h-6" />
                      <span className="text-xs font-semibold">Add Expense</span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Settlements`)
                      }
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#818CF8] text-white hover:brightness-110 transition-all shadow-lg shadow-indigo-400/20"
                    >
                      <Banknote className="w-6 h-6" />
                      <span className="text-xs font-semibold">Settle Up</span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Members`)
                      }
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#FB7185] text-[#121214] hover:brightness-110 transition-all shadow-lg shadow-rose-400/20"
                    >
                      <UserPlus className="w-6 h-6" />
                      <span className="text-xs font-semibold">Invite</span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Categories`)
                      }
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#FCD34D] text-[#121214] hover:brightness-110 transition-all shadow-lg shadow-amber-300/20"
                    >
                      <Tag className="w-6 h-6" />
                      <span className="text-xs font-semibold">Categories</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 4: Balances & Recent Expenses (2-col grid inside 3-col parent) */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balances Card - Dark Card */}
                <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Balances
                  </h2>
                  {balances ? (
                    <div className="space-y-3">
                      {balances.debts?.length > 0 && (
                        <div className="bg-[#FB7185]/20 rounded-lg px-3 py-2 mb-3 border border-[#FB7185]/30">
                          <p className="text-xs font-medium text-[#FB7185]">
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
                            className="bg-[#2C2C2E] text-[#2DD4BF]"
                          />
                          <span className="text-sm font-medium text-[#9CA3AF] flex-1">
                            {b.name}
                          </span>
                          <span
                            className={`text-sm font-bold ${b.net_balance > 0 ? "text-[#2DD4BF]" : b.net_balance < 0 ? "text-[#FB7185]" : "text-[#9CA3AF]"}`}
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

                {/* Recent Expenses Card - Dark Card */}
                <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">
                      Recent Expenses
                    </h2>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Expenses`)
                      }
                      className="text-sm text-[#6B7280] hover:text-[#2DD4BF] transition-colors"
                    >
                      View all
                    </button>
                  </div>
                  {!expenses ? (
                    <SkeletonCard />
                  ) : expenses.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF] text-center py-8 flex flex-col items-center gap-2">
                      <Receipt className="w-8 h-8 text-[#4B4B4F] opacity-40" />
                      No expenses yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#2C2C2E]">
                      {expenses.slice(0, 5).map((exp) => (
                        <div
                          key={exp.id}
                          className="py-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              {exp.title}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              {exp.payer_name} ·{" "}
                              {new Date(exp.expense_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-[#2DD4BF]">
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
                {/* Settlements Card - Dark Card */}
                <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">
                      Settlements
                    </h2>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Settlements`)
                      }
                      className="text-sm text-[#6B7280] hover:text-[#2DD4BF] transition-colors"
                    >
                      View all
                    </button>
                  </div>
                  {!settlements ? (
                    <SkeletonCard />
                  ) : settlements.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF] text-center py-8 flex flex-col items-center gap-2">
                      <Banknote className="w-8 h-8 text-[#4B4B4F] opacity-40" />
                      No settlements yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-[#2C2C2E]">
                      {settlements.slice(0, 5).map((s) => (
                        <div
                          key={s.id}
                          className="py-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              {s.from_user_name} paid {s.to_user_name}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              {new Date(s.settlement_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-[#2DD4BF]">
                            ${parseFloat(s.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Members Card - Dark Card */}
                <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">
                      Members
                    </h2>
                    <button
                      onClick={() =>
                        navigate(`/households/${selectedId}?tab=Members`)
                      }
                      className="text-sm text-[#6B7280] hover:text-[#2DD4BF] transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="divide-y divide-[#2C2C2E]">
                    {householdDetail?.members?.map((m) => (
                      <div
                        key={m.id}
                        className="py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={m.name}
                            size="sm"
                            className="bg-[#2C2C2E] text-[#2DD4BF]"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {m.name}
                            </p>
                            <p className="text-xs text-[#6B7280]">{m.email}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-[#2DD4BF]/20 text-[#2DD4BF] px-2 py-0.5 rounded-full font-medium">
                          {m.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 6: Recent Activity (full width) */}
              <div className="lg:col-span-3 bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Recent Activity
                </h2>
                {feedLoading ? (
                  <div className="space-y-3">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : feedError ? (
                  <p className="text-[#FB7185]">Failed to load activity feed.</p>
                ) : feed?.length === 0 ? (
                  <div className="text-center py-12 bg-[#121214] rounded-xl border border-[#2C2C2E]">
                    <Bell className="w-10 h-10 text-[#4B4B4F] opacity-40 mx-auto mb-2" />
                    <p className="text-[#9CA3AF]">No activity yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {feed?.map((item) => (
                      <div
                        key={`${item.type}-${item.item_id}-${item.household_name}`}
                        className="flex items-center justify-between p-4 bg-[#121214] border border-[#2C2C2E] rounded-xl hover:bg-[#28282B] transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#2C2C2E] flex items-center justify-center">
                            {item.type === "expense" ? (
                              <CreditCard className="w-5 h-5 text-[#2DD4BF]" />
                            ) : item.type === "member" ? (
                              <UserPlus className="w-5 h-5 text-[#2DD4BF]" />
                            ) : (
                              <ArrowLeftRight className="w-5 h-5 text-[#2DD4BF]" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {item.type === "expense" && <>{item.label}</>}
                              {item.type === "member" && <>{item.label} joined</>}
                              {item.type === "settlement" && (
                                <>Settlement: {item.label}</>
                              )}
                            </p>
                            <p className="text-sm text-[#6B7280]">
                              {item.type === "expense" && (
                                <>Added by {item.label}</>
                              )}
                              {item.household_name && (
                                <>
                                  {" "}
                                  in{" "}
                                  <span className="font-medium text-[#2DD4BF]">
                                    {item.household_name}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[#2DD4BF]">
                            {item.amount !== null &&
                              `$${parseFloat(item.amount).toFixed(2)}`}
                          </div>
                          <div className="text-sm text-[#6B7280]">
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

      {/* Create Household Modal - Bringing in the Colorful Card Aesthetic */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-[#121214]/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-[#ffffff] border border-[#FB7185]/20 shadow-2xl shadow-teal-400/30 rounded-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-[#121214] mb-4">Create Household</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Household name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 bg-[#121214]/10 border border-[#121214]/20 rounded-xl text-sm text-[#121214] placeholder-[#121214]/60 focus:outline-none focus:ring-2 focus:ring-[#121214] transition-all"
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-4 py-3 bg-[#121214]/10 border border-[#121214]/20 rounded-xl text-sm text-[#121214] placeholder-[#121214]/60 focus:outline-none focus:ring-2 focus:ring-[#121214] transition-all"
              />
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-6 py-2 bg-[#121214]/20 text-[#121214] rounded-xl hover:bg-[#121214]/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-[#121214] text-white px-6 py-2 rounded-xl hover:brightness-125 shadow-lg shadow-black/20 transition-all disabled:opacity-50"
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