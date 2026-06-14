import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expenseApi from "../../api/expenseApi";
import * as categoryApi from "../../api/categoryApi";
import Skeleton, { SkeletonCard } from "../../components/Skeleton";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function HouseholdExpenses({ household, householdId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [expDate, setExpDate] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [splits, setSplits] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [note, setNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: expenses, isLoading: expLoading } = useQuery({
    queryKey: ["expenses", householdId],
    queryFn: () => expenseApi.listByHousehold(householdId).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories", householdId],
    queryFn: () => categoryApi.listByHousehold(householdId).then((r) => r.data),
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => expenseApi.create(householdId, data),
    onSuccess: () => {
      toast("Expense added!", "success");
      queryClient.invalidateQueries({ queryKey: ["expenses", householdId] });
      queryClient.invalidateQueries({ queryKey: ["balances", householdId] });
      setTitle("");
      setAmount("");
      setPayerId("");
      setExpDate("");
      setSplitType("equal");
      setSplits([]);
      setNote("");
      setCategoryId("");
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

  const handleCreateExpense = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (title.trim() && parsedAmount > 0 && payerId && expDate) {
      const payload = {
        title: title.trim(),
        amount: parsedAmount,
        splitType,
        payerId: parseInt(payerId, 10),
        expenseDate: expDate,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        note,
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          New Expense
        </h2>
        <form onSubmit={handleCreateExpense} className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Who paid?</option>
            {household.members?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Split type
            </label>
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
                        const perMember =
                          type === "percentage"
                            ? 100 / household.members.length
                            : 0;
                        setSplits(
                          household.members.map((m) => ({
                            memberId: m.id,
                            memberName: m.name,
                            amount: type === "exact" ? "" : "0",
                            percentage:
                              type === "percentage"
                                ? perMember.toFixed(1)
                                : "0",
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
                {splitType === "exact"
                  ? "Enter amount for each member"
                  : "Enter percentage for each member"}
              </p>
              {splits.map((split, idx) => (
                <div key={split.memberId} className="flex items-center gap-2">
                  <span className="text-sm w-32 truncate">
                    {split.memberName}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={splitType === "exact" ? "Amount" : "%"}
                    value={
                      splitType === "exact"
                        ? split.amount
                        : split.percentage
                    }
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
            <label className="text-sm text-gray-600 block mb-1">
              Category
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full sm:flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">None</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
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
                  onClick={() => {
                    if (newCatName.trim())
                      createCategoryMutation.mutate(newCatName.trim());
                  }}
                  disabled={createCategoryMutation.isPending}
                  className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
            <p className="text-gray-500 py-8">
              No expenses yet. Add one above!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {expenses?.map((exp) => (
              <div
                key={exp.id}
                onClick={() =>
                  navigate(`/households/${householdId}/expenses/${exp.id}`)
                }
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Paid by {exp.payer_name} ·{" "}
                      {new Date(exp.expense_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {exp.category_name && (
                        <span className="mr-2">{exp.category_name} ·</span>
                      )}
                      Split: {exp.split_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      ${parseFloat(exp.amount).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete({ id: exp.id });
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        onConfirm={() => {
          if (confirmDelete) deleteExpenseMutation.mutate(confirmDelete.id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}