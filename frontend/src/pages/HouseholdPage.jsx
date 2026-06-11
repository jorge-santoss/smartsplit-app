import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import * as householdApi from "../api/householdApi";
import * as expenseApi from "../api/expenseApi";
import * as settlementApi from "../api/settlementApi";
import * as balanceApi from "../api/balanceApi";
import * as categoryApi from "../api/categoryApi";
import Skeleton, { SkeletonCard } from "../components/Skeleton";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const TABS = ["Overview", "Expenses", "Balances", "Members", "Settlements"];

export default function HouseholdPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const householdId = parseInt(id, 10);
  const [activeTab, setActiveTab] = useState("Overview");

  const [addEmail, setAddEmail] = useState("");
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPayerId, setExpPayerId] = useState("");
  const [expDate, setExpDate] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [splits, setSplits] = useState([]);
  const [expCategoryId, setExpCategoryId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [expNote, setExpNote] = useState("");
  const [settleFrom, setSettleFrom] = useState("");
  const [settleTo, setSettleTo] = useState("");
  const [settleAmount, setSettleAmount] = useState("");
  const [settleDate, setSettleDate] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: household, isLoading } = useQuery({
    queryKey: ["household", householdId],
    queryFn: () => householdApi.getById(householdId).then((r) => r.data),
  });

  const { data: expenses, isLoading: expLoading } = useQuery({
    queryKey: ["expenses", householdId],
    queryFn: () => expenseApi.listByHousehold(householdId).then((r) => r.data),
  });

  const { data: settlements, isLoading: settLoading } = useQuery({
    queryKey: ["settlements", householdId],
    queryFn: () =>
      settlementApi.listByHousehold(householdId).then((r) => r.data),
  });

  const { data: balances, isLoading: balLoading } = useQuery({
    queryKey: ["balances", householdId],
    queryFn: () => balanceApi.getBalances(householdId).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", householdId],
    queryFn: () => categoryApi.listByHousehold(householdId).then((r) => r.data),
  });

  const addMemberMutation = useMutation({
    mutationFn: (email) => householdApi.addMember(householdId, email),
    onSuccess: () => {
      toast("Member added!", "success");
      queryClient.invalidateQueries({ queryKey: ["household", householdId] });
      setAddEmail("");
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to add member", "error");
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name) => categoryApi.create(householdId, name),
    onSuccess: () => {
      toast("Category added!", "success");
      queryClient.invalidateQueries({ queryKey: ["categories", householdId] });
      setNewCatName("");
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to add category", "error");
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => expenseApi.create(householdId, data),
    onSuccess: () => {
      toast("Expense added!", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses", householdId] });
      queryClient.invalidateQueries({ queryKey: ["balances", householdId] });
      setExpTitle("");
      setExpAmount("");
      setExpPayerId("");
      setExpDate("");
      setSplitType("equal");
      setSplits([]);
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to add expense", "error");
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId) => expenseApi.remove(expenseId),
    onSuccess: () => {
      toast("Expense deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses", householdId] });
      queryClient.invalidateQueries({ queryKey: ["balances", householdId] });
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to delete expense", "error");
    },
  });

  const createSettlementMutation = useMutation({
    mutationFn: (data) => settlementApi.create(householdId, data),
    onSuccess: () => {
      toast("Settlement recorded!", "success");
      queryClient.invalidateQueries({ queryKey: ["settlements", householdId] });
      queryClient.invalidateQueries({ queryKey: ["balances", householdId] });
      setSettleFrom("");
      setSettleTo("");
      setSettleAmount("");
      setSettleDate("");
    },
    onError: (err) => {
      toast(
        err.response?.data?.error || "Failed to record settlement",
        "error",
      );
    },
  });

  const deleteSettlementMutation = useMutation({
    mutationFn: (settlementId) => settlementApi.remove(settlementId),
    onSuccess: () => {
      toast("Settlement deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["settlements", householdId] });
      queryClient.invalidateQueries({ queryKey: ["balances", householdId] });
    },
    onError: (err) => {
      toast(
        err.response?.data?.error || "Failed to delete settlement",
        "error",
      );
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AppLayout>
    );
  }

  if (!household) {
    return (
      <AppLayout>
        <p className="text-gray-500">Household not found</p>
      </AppLayout>
    );
  }

  const handleAddMember = (e) => {
    e.preventDefault();
    if (addEmail.trim()) {
      addMemberMutation.mutate(addEmail.trim());
    }
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    const amount = parseFloat(expAmount);
    if (expTitle.trim() && amount > 0 && expPayerId && expDate) {
      const payload = {
        title: expTitle,
        amount,
        splitType,
        payerId: parseInt(expPayerId, 10),
        expenseDate: expDate,
        categoryId: expCategoryId ? parseInt(expCategoryId, 10) : null,
        note: expNote,
      };
      if (splitType === "exact") {
        payload.splits = splits.map((s) => ({
          memberId: s.memberId,
          amount: parseFloat(s.amount) || 0,
        }));
      } else if (splitType === "percentage") {
        payload.splits = splits.map((s) => ({
          memberId: s.memberId,
          percentage: parseFloat(s.percentage) || 0,
        }));
      }
      createExpenseMutation.mutate(payload);
    }
  };

  const handleCreateSettlement = (e) => {
    e.preventDefault();
    const amount = parseFloat(settleAmount);
    if (settleFrom && settleTo && amount > 0 && settleDate) {
      createSettlementMutation.mutate({
        fromUserId: parseInt(settleFrom, 10),
        toUserId: parseInt(settleTo, 10),
        amount: amount,
        settlementDate: settleDate,
      });
    }
  };

  const totalSpent = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

  return (
    <AppLayout>
      <button
        onClick={() => navigate("/dashboard")}
        className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-1"
      >
        &larr; Dashboard
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{household.name}</h1>
          {household.description && (
            <p className="text-gray-500 mt-1">{household.description}</p>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Members</p>
              <p className="text-2xl font-bold text-gray-900">{household.members?.length || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{expenses?.length || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Balances</h3>
                {balLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : balances ? (
                  <div className="space-y-2">
                    {balances.map((b) => (
                      <div key={b.userId} className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-700">{b.name}</span>
                        <span className={`text-sm font-bold ${
                          b.balance > 0 ? "text-green-600" : b.balance < 0 ? "text-red-600" : "text-gray-400"
                        }`}>
                          {b.balance > 0 ? "+" : ""}${Math.abs(b.balance).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Settlements</h3>
                  <button onClick={() => setActiveTab("Settlements")} className="text-sm text-blue-600 hover:underline">View all</button>
                </div>
                {settLoading ? (
                  <div className="p-5 space-y-3">
                    <SkeletonCard />
                  </div>
                ) : settlements?.length === 0 ? (
                  <div className="p-5 text-center text-sm text-gray-500">No settlements yet.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {settlements?.slice(0, 5).map((s) => (
                      <div key={s.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.from_user_name} paid {s.to_user_name}</p>
                          <p className="text-xs text-gray-500">{new Date(s.settlement_date).toLocaleDateString()}</p>
                        </div>
                        <span className="font-bold text-sm text-green-600">${parseFloat(s.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Members</h3>
                  <button onClick={() => setActiveTab("Members")} className="text-sm text-blue-600 hover:underline">View all</button>
                </div>
                <div className="divide-y divide-gray-100">
                  {household.members?.map((m) => (
                    <div key={m.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                          <p className="text-xs text-gray-500 truncate">{m.email}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0 ml-2">{m.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Expenses</h3>
                  <button onClick={() => setActiveTab("Expenses")} className="text-sm text-blue-600 hover:underline">View all</button>
                </div>
                {expLoading ? (
                  <div className="p-5 space-y-3">
                    <SkeletonCard />
                  </div>
                ) : expenses?.length === 0 ? (
                  <div className="p-5 text-center text-sm text-gray-500">No expenses yet.</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {expenses?.slice(0, 5).map((exp) => (
                      <div key={exp.id} className="p-4 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{exp.title}</p>
                          <p className="text-xs text-gray-500 truncate">{exp.payer_name} · {new Date(exp.expense_date).toLocaleDateString()}</p>
                        </div>
                        <span className="font-bold text-sm shrink-0 ml-2">${parseFloat(exp.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Expenses" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Expense</h2>
            <form onSubmit={handleCreateExpense} className="space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <select
                value={expPayerId}
                onChange={(e) => setExpPayerId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Who paid?</option>
                {household.members?.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>

              <div>
                <label className="text-sm text-gray-600 block mb-1">Split type</label>
                <div className="flex gap-4">
                  {["equal", "exact", "percentage"].map((type) => (
                    <label key={type} className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="splitType"
                        value={type}
                        checked={splitType === type}
                        onChange={() => {
                          setSplitType(type);
                          if (type !== "equal" && household.members) {
                            const perMember = type === "percentage" ? 100 / household.members.length : 0;
                            setSplits(
                              household.members.map((m) => ({
                                memberId: m.id,
                                memberName: m.name,
                                amount: type === "exact" ? "" : "0",
                                percentage: type === "percentage" ? perMember.toFixed(1) : "0",
                              })),
                            );
                          }
                        }}
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {splitType !== "equal" && splits.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {splitType === "exact" ? "Enter amount for each member" : "Enter percentage for each member"}
                  </p>
                  {splits.map((split, idx) => (
                    <div key={split.memberId} className="flex items-center gap-2">
                      <span className="text-sm w-32 truncate">{split.memberName}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={splitType === "exact" ? "Amount" : "%"}
                        value={splitType === "exact" ? split.amount : split.percentage}
                        onChange={(e) => {
                          const updated = [...splits];
                          const key = splitType === "exact" ? "amount" : "percentage";
                          updated[idx] = { ...updated[idx], [key]: e.target.value };
                          setSplits(updated);
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600 block mb-1">Category</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={expCategoryId}
                    onChange={(e) => setExpCategoryId(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">None</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New category"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => { if (newCatName.trim()) createCategoryMutation.mutate(newCatName.trim()); }}
                      disabled={createCategoryMutation.isPending}
                      className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
                <textarea
                  value={expNote}
                  onChange={(e) => setExpNote(e.target.value)}
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={createExpenseMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
            </div>
            {expLoading ? (
              <div className="p-6 space-y-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : expenses?.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 py-8">No expenses yet. Add one above!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {expenses?.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => navigate(`/households/${householdId}/expenses/${exp.id}`)}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                        <p className="text-sm text-gray-500">
                          Paid by {exp.payer_name} · {new Date(exp.expense_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {exp.category_name && <span className="mr-2">{exp.category_name} ·</span>}
                          Split: {exp.split_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">${parseFloat(exp.amount).toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete({ type: "expense", id: exp.id });
                          }}
                          disabled={deleteExpenseMutation.isPending}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Balances" && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Balances</h2>
          {balLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : balances ? (
            <div className="space-y-3">
              {balances.map((b) => (
                <div
                  key={b.userId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{b.name}</span>
                  <span className={`text-lg font-bold ${
                    b.balance > 0 ? "text-green-600" : b.balance < 0 ? "text-red-600" : "text-gray-400"
                  }`}>
                    {b.balance > 0 ? "+" : ""}${Math.abs(b.balance).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No balance data.</p>
          )}
        </div>
      )}

      {activeTab === "Members" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Member</h2>
            <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Email to invite"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={addMemberMutation.isPending}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {addMemberMutation.isPending ? "Adding..." : "Add"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Members ({household.members?.length || 0})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {household.members?.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Settlements" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h2>
            <form onSubmit={handleCreateSettlement} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={settleFrom}
                  onChange={(e) => setSettleFrom(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Who paid?</option>
                  {household.members?.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <select
                  value={settleTo}
                  onChange={(e) => setSettleTo(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Who received?</option>
                  {household.members?.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="date"
                  value={settleDate}
                  onChange={(e) => setSettleDate(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={createSettlementMutation.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {createSettlementMutation.isPending ? "Recording..." : "Record Payment"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Settlements</h2>
            </div>
            {settLoading ? (
              <div className="p-6 space-y-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : settlements?.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 py-8">No settlements yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {settlements?.map((s) => (
                  <div key={s.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {s.from_user_name} paid {s.to_user_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(s.settlement_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-green-600">${parseFloat(s.amount).toFixed(2)}</span>
                      <button
                        onClick={() => setConfirmDelete({ type: "settlement", id: s.id })}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={confirmDelete.type === 'expense' ? "Delete this expense?" : "Delete this settlement?"}
          onConfirm={() => {
            if (confirmDelete.type === 'expense') {
              deleteExpenseMutation.mutate(confirmDelete.id);
            } else {
              deleteSettlementMutation.mutate(confirmDelete.id);
            }
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </AppLayout>
  );
}
