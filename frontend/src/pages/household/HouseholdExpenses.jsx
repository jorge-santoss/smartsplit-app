import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expenseApi from "../../api/expenseApi";
import * as categoryApi from "../../api/categoryApi";
import { SkeletonCard } from "../../components/Skeleton";
import Avatar from "../../components/Avatar";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import Pagination from "../../components/Pagination";

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function HouseholdExpenses({ household, householdId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [expForm, setExpForm] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    payerId: "",
    categoryId: "",
    splitType: "equal",
  });
  const [customSplits, setCustomSplits] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [expenseError, setExpenseError] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: expensesData, isLoading: expLoading } = useQuery({
    queryKey: ["expenses", householdId, page],
    queryFn: () =>
      expenseApi.listByHousehold(householdId, page, limit).then((r) => r.data),
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
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["balances", householdId] });
      setExpForm({
        title: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        payerId: "",
        categoryId: "",
        splitType: "equal",
      });
      setCustomSplits([]);
      setExpenseError("");
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
      setPage(1);
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

  const splitPreviewValid = () => {
    if (expForm.splitType === "exact") {
      const total = customSplits.reduce(
        (s, sp) => s + parseFloat(sp.amount || 0),
        0,
      );
      return Math.abs(total - parseFloat(expForm.amount || 0)) < 0.01;
    }
    const total = customSplits.reduce(
      (s, sp) => s + parseFloat(sp.percentage || 0),
      0,
    );
    return Math.abs(total - 100) < 0.1;
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    setExpenseError("");

    const parsedAmount = parseFloat(expForm.amount);
    if (
      !expForm.title.trim() ||
      !parsedAmount ||
      !expForm.payerId ||
      !expForm.date
    ) {
      setExpenseError("Please fill in title, amount, payer and date.");
      return;
    }

    if (expForm.splitType !== "equal" && !splitPreviewValid()) {
      setExpenseError(
        expForm.splitType === "exact"
          ? `Split amounts total $${customSplits.reduce((s, sp) => s + parseFloat(sp.amount || 0), 0).toFixed(2)}, expected $${parsedAmount.toFixed(2)}`
          : `Split percentages total ${customSplits.reduce((s, sp) => s + parseFloat(sp.percentage || 0), 0).toFixed(1)}%, expected 100%`,
      );
      return;
    }

    const payload = {
      title: expForm.title.trim(),
      amount: parsedAmount,
      splitType: expForm.splitType,
      payerId: parseInt(expForm.payerId, 10),
      expenseDate: expForm.date,
      categoryId: expForm.categoryId ? parseInt(expForm.categoryId, 10) : null,
    };

    if (expForm.splitType === "exact") {
      payload.splits = customSplits.map((s) => ({
        memberId: s.memberId,
        amount: parseFloat(s.amount) || 0,
      }));
    } else if (expForm.splitType === "percentage") {
      payload.splits = customSplits.map((s) => ({
        memberId: s.memberId,
        percentage: parseFloat(s.percentage) || 0,
      }));
    }

    createExpenseMutation.mutate(payload);
  };

  const filteredExpenses = filterCategory
    ? expensesData?.data?.filter(
        (e) => String(e.category_id) === filterCategory,
      )
    : expensesData?.data;

  return (
    <div className="space-y-6">
      {/* ── New Expense Form ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          New Expense
        </h2>

        {expenseError && (
          <p className="text-sm text-red-500 mb-3 bg-red-50 rounded-lg px-3 py-2">
            {expenseError}
          </p>
        )}

        <form onSubmit={handleCreateExpense} className="flex flex-col gap-3">
          <input
            className={inputCls}
            type="text"
            placeholder="Title"
            value={expForm.title}
            onChange={(e) =>
              setExpForm((f) => ({ ...f, title: e.target.value }))
            }
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                className={`${inputCls} pl-7`}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={expForm.amount}
                onChange={(e) =>
                  setExpForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
            <input
              className={inputCls}
              type="date"
              value={expForm.date}
              onChange={(e) =>
                setExpForm((f) => ({ ...f, date: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              className={inputCls}
              value={expForm.payerId}
              onChange={(e) =>
                setExpForm((f) => ({ ...f, payerId: e.target.value }))
              }
            >
              <option value="">Who paid?</option>
              {household.members?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              className={inputCls}
              value={expForm.categoryId}
              onChange={(e) =>
                setExpForm((f) => ({ ...f, categoryId: e.target.value }))
              }
            >
              <option value="">No category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Split type pills */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Split type</p>
            <div className="flex gap-2">
              {["equal", "exact", "percentage"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setExpForm((f) => ({ ...f, splitType: type }));
                    if (type !== "equal" && household.members) {
                      const perMember =
                        type === "percentage"
                          ? 100 / household.members.length
                          : 0;
                      setCustomSplits(
                        household.members.map((m) => ({
                          memberId: m.id,
                          name: m.name,
                          amount: "",
                          percentage:
                            type === "percentage" ? perMember.toFixed(1) : "0",
                        })),
                      );
                    } else {
                      setCustomSplits([]);
                    }
                  }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
                    expForm.splitType === type
                      ? "bg-teal-500 text-white border-teal-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Custom split inputs for exact / percentage */}
          {expForm.splitType !== "equal" && customSplits.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">
                {expForm.splitType === "exact"
                  ? "Amount per member"
                  : "Percentage per member"}
              </p>
              <div className="flex flex-col gap-2">
                {customSplits.map((sp, i) => (
                  <div key={sp.memberId} className="flex items-center gap-2">
                    <Avatar
                      name={sp.name}
                      size="sm"
                      className="bg-teal-100 text-teal-700"
                    />
                    <span className="text-sm text-gray-700 flex-1">
                      {sp.name}
                    </span>
                    {expForm.splitType === "exact" ? (
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={sp.amount}
                          onChange={(e) =>
                            setCustomSplits((prev) => {
                              const updated = prev.map((s, j) =>
                                j === i ? { ...s, amount: e.target.value } : s,
                              );
                              // Auto-fill last member's amount when all others are filled
                              const isLast = i === prev.length - 1;
                              if (!isLast && updated.length > 1) {
                                const total = parseFloat(expForm.amount) || 0;
                                const allButLast = updated.slice(0, -1);
                                const allFilled = allButLast.every(
                                  (sp) => parseFloat(sp.amount || 0) > 0,
                                );
                                if (allFilled) {
                                  const sum = allButLast.reduce(
                                    (s, sp) => s + parseFloat(sp.amount || 0),
                                    0,
                                  );
                                  if (sum > 0 && sum < total) {
                                    updated[updated.length - 1] = {
                                      ...updated[updated.length - 1],
                                      amount: (total - sum).toFixed(2),
                                    };
                                  }
                                }
                              }
                              return updated;
                            })
                          }
                          className={`w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            i === customSplits.length - 1 ? "bg-teal-50" : ""
                          }`}
                        />
                      </div>
                    ) : (
                      <div className="relative w-28">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="0"
                          value={sp.percentage}
                          onChange={(e) =>
                            setCustomSplits((prev) => {
                              const updated = prev.map((s, j) =>
                                j === i
                                  ? { ...s, percentage: e.target.value }
                                  : s,
                              );
                              const isLast = i === prev.length - 1;
                              if (!isLast && updated.length > 1) {
                                const allButLast = updated.slice(0, -1);
                                const allFilled = allButLast.every(
                                  (sp) => parseFloat(sp.percentage || 0) > 0,
                                );
                                if (allFilled) {
                                  const sum = allButLast.reduce(
                                    (s, sp) =>
                                      s + parseFloat(sp.percentage || 0),
                                    0,
                                  );
                                  if (sum > 0 && sum < 100) {
                                    updated[updated.length - 1] = {
                                      ...updated[updated.length - 1],
                                      percentage: (100 - sum).toFixed(1),
                                    };
                                  }
                                }
                              }
                              return updated;
                            })
                          }
                          className={`w-full pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            i === customSplits.length - 1 ? "bg-teal-50" : ""
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          %
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Running total */}
              <div
                className={`mt-2 pt-2 border-t flex justify-between text-xs font-medium ${
                  splitPreviewValid() ? "text-green-600" : "text-red-500"
                }`}
              >
                {expForm.splitType === "exact" ? (
                  <>
                    <span>Total</span>
                    <span>
                      $
                      {customSplits
                        .reduce((s, sp) => s + parseFloat(sp.amount || 0), 0)
                        .toFixed(2)}{" "}
                      / ${parseFloat(expForm.amount || 0).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <>
                    <span>Total</span>
                    <span>
                      {customSplits
                        .reduce(
                          (s, sp) => s + parseFloat(sp.percentage || 0),
                          0,
                        )
                        .toFixed(1)}
                      % / 100%
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* New category inline */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New category"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => {
                if (newCatName.trim())
                  createCategoryMutation.mutate(newCatName.trim());
              }}
              disabled={createCategoryMutation.isPending}
              className="bg-teal-500 text-white px-3 py-2 rounded-lg hover:bg-teal-600 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              Add
            </button>
          </div>

          <button
            type="submit"
            disabled={createExpenseMutation.isPending}
            className="self-start bg-teal-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
          >
            {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </div>

      {/* ── Expenses List ── */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
        </div>

        {/* Category filter chips */}
        {categories?.length > 0 && (
          <div className="px-6 pt-4 pb-2 flex gap-2 flex-wrap">
            {[{ id: "", name: "All" }, ...categories].map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setFilterCategory(String(c.id));
                  setPage(1);
                }}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  filterCategory === String(c.id)
                    ? "bg-teal-500 text-white border-teal-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {expLoading ? (
          <div className="p-6 space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredExpenses?.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 py-8">
              {filterCategory
                ? "No expenses in this category."
                : "No expenses yet. Add one above!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredExpenses?.map((exp) => (
              <div
                key={exp.id}
                onClick={() =>
                  navigate(`/households/${householdId}/expenses/${exp.id}`)
                }
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.title}</h3>
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

      {/* Pagination */}
      {expensesData && (
        <Pagination
          page={page}
          totalPages={expensesData.totalPages}
          onPageChange={setPage}
        />
      )}
      
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
