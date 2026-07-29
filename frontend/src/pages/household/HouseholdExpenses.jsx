import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expenseApi from "../../api/expenseApi";
import * as categoryApi from "../../api/categoryApi";
import { SkeletonCard } from "../../components/Skeleton";
import Avatar from "../../components/Avatar";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import Pagination from "../../components/Pagination";
import { Trash2 } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 border border-[#2C2C2E] bg-[#121214] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] transition-all";

export default function HouseholdExpenses({ household, householdId }) {
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
  const [detailExpenseId, setDetailExpenseId] = useState(null);
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

  const { data: expenseDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["expense", detailExpenseId],
    queryFn: () => expenseApi.getById(detailExpenseId).then((r) => r.data),
    enabled: !!detailExpenseId,
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
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">
          New Expense
        </h2>

        {expenseError && (
          <p className="text-sm text-[#FB7185] mb-3 bg-[#FB7185]/20 border border-[#FB7185]/30 rounded-lg px-3 py-2">
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">
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
            <p className="text-xs font-medium text-[#6B7280] mb-1">Split type</p>
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
                  className={`flex-1 py-1.5 text-xs font-medium rounded-xl border transition-colors capitalize ${
                    expForm.splitType === type
                      ? "bg-[#2DD4BF] text-[#121214] border-[#2DD4BF] shadow-lg shadow-teal-400/25"
                      : "bg-transparent text-[#9CA3AF] border-[#2C2C2E] hover:bg-[#2C2C2E]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Custom split inputs for exact / percentage */}
          {expForm.splitType !== "equal" && customSplits.length > 0 && (
            <div className="bg-[#121214] rounded-xl border border-[#2C2C2E] p-3">
              <p className="text-xs font-medium text-[#6B7280] mb-2">
                {expForm.splitType === "exact"
                  ? "Amount per member"
                  : "Percentage per member"}
              </p>
              <div className="flex flex-col gap-2">
                {customSplits.map((sp, i) => (
                  <div key={sp.memberId} className="flex items-center gap-2">
                    <Avatar
                      name={sp.name}
                      size="small"
                      className="bg-[#2C2C2E] text-[#2DD4BF]"
                    />
                    <span className="text-sm text-white flex-1">
                      {sp.name}
                    </span>
                    {expForm.splitType === "exact" ? (
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">
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
                          className={`w-full pl-7 pr-3 py-1.5 border border-[#2C2C2E] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] ${
                            i === customSplits.length - 1 ? "bg-[#1C1C1E]" : "bg-transparent"
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
                          className={`w-full pl-3 pr-7 py-1.5 border border-[#2C2C2E] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] ${
                            i === customSplits.length - 1 ? "bg-[#1C1C1E]" : "bg-transparent"
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">
                          %
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Running total */}
              <div
                className={`mt-2 pt-2 border-t border-[#2C2C2E] flex justify-between text-xs font-medium ${
                  splitPreviewValid() ? "text-[#2DD4BF]" : "text-[#FB7185]"
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
              className="flex-1 px-3 py-2 border border-[#2C2C2E] bg-[#121214] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] transition-all"
            />
            <button
              type="button"
              onClick={() => {
                if (newCatName.trim())
                  createCategoryMutation.mutate(newCatName.trim());
              }}
              disabled={createCategoryMutation.isPending}
              className="bg-[#2DD4BF] text-[#121214] px-3 py-2 rounded-lg hover:brightness-110 disabled:opacity-50 text-sm whitespace-nowrap transition-all shadow-lg shadow-teal-400/25"
            >
              Add
            </button>
          </div>

          <button
            type="submit"
            disabled={createExpenseMutation.isPending}
            className="self-start bg-[#2DD4BF] text-[#121214] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-teal-400/25"
          >
            {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </div>

      {/* ── Expenses List ── */}
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl">
        <div className="p-6 border-b border-[#2C2C2E]">
          <h2 className="text-lg font-semibold text-white">Expenses</h2>
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
                    ? "bg-[#2DD4BF] text-[#121214] border-[#2DD4BF] shadow-lg shadow-teal-400/25"
                    : "bg-[#121214] text-[#9CA3AF] border-[#2C2C2E] hover:bg-[#2C2C2E]"
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
            <p className="text-[#9CA3AF] py-8">
              {filterCategory
                ? "No expenses in this category."
                : "No expenses yet. Add one above!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#2C2C2E]">
            {filteredExpenses?.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setDetailExpenseId(exp.id)}
                className="p-4 cursor-pointer hover:bg-[#121214] transition-colors border-b border-[#2C2C2E] last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{exp.title}</h3>
                    <p className="text-sm text-[#9CA3AF]">
                      Paid by {exp.payer_name} ·{" "}
                      {new Date(exp.expense_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-[#6B7280]/70 mt-0.5">
                      {exp.category_name && (
                        <span className="mr-2">{exp.category_name} ·</span>
                      )}
                      Split: {exp.split_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#2DD4BF]">
                      ${parseFloat(exp.amount).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete({ id: exp.id });
                      }}
                      className="text-[#6B7280] hover:text-[#FB7185] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
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

      {detailExpenseId && expenseDetail && (
        <div
          className="fixed inset-0 bg-[#121214]/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setDetailExpenseId(null)}
        >
          <div
            className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-2xl shadow-black/60 rounded-2xl p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">
                {expenseDetail.title}
              </h2>
              <button
                onClick={() => setDetailExpenseId(null)}
                className="text-[#6B7280] hover:text-white text-xl leading-none transition-colors"
              >
                &times;
              </button>
            </div>
            <p className="text-sm text-[#9CA3AF] mb-4">
              {new Date(expenseDetail.expense_date).toLocaleDateString()}
              {expenseDetail.category_name && (
                <> · {expenseDetail.category_name}</>
              )}
              {expenseDetail.split_type && (
                <> · Split: {expenseDetail.split_type}</>
              )}
            </p>
            <div className="text-3xl font-bold text-[#2DD4BF] mb-4">
              ${parseFloat(expenseDetail.amount || 0).toFixed(2)}
            </div>
            {expenseDetail.note && (
              <p className="text-[#9CA3AF] text-sm italic mb-4">
                {expenseDetail.note}
              </p>
            )}
            <p className="text-sm text-[#D1D5DB] mb-4">
              Paid by{" "}
              <span className="font-semibold text-white">{expenseDetail.payer_name}</span>
            </p>
            {(expenseDetail.splits || []).length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-white mb-2 border-t border-[#2C2C2E] pt-4">
                  Splits
                </h3>
                <div className="space-y-2">
                  {(expenseDetail.splits || []).map((split, i) => (
                    <div
                      key={split.id ?? i}
                      className="flex justify-between p-3 bg-[#121214] rounded-xl text-sm border border-[#2C2C2E]"
                    >
                      <span className="font-medium text-white">
                        {split.member_name}
                      </span>
                      <span className="text-[#9CA3AF]">
                        ${parseFloat(split.amount || 0).toFixed(2)}
                        {split.percentage && (
                          <> ({parseFloat(split.percentage).toFixed(1)}%)</>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
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