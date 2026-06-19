import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as settlementApi from "../../api/settlementApi";
import * as balanceApi from "../../api/balanceApi";
import { SkeletonCard } from "../../components/Skeleton";
import Avatar from "../../components/Avatar";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useAuth } from "../../hooks/useAuth";
import Pagination from "../../components/Pagination";
import { Trash2 } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 border border-[#E1EEE8] bg-[#F8FCFA] rounded-lg text-sm text-[#154535] placeholder:text-[#4A6B5D]/60 focus:outline-none focus:ring-2 focus:ring-[#154535]";

const fmt = (n) => {
  const val = typeof n === "string" ? parseFloat(n) : n;
  return `$${Math.abs(val).toFixed(2)}`;
};

export default function HouseholdSettlements({ household, householdId }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [settlementError, setSettlementError] = useState("");
  const [settleForm, setSettleForm] = useState({
    from: "",
    to: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: settlementsData, isLoading: settLoading } = useQuery({
    queryKey: ["settlements", householdId, page],
    queryFn: () => settlementApi.listByHousehold(householdId, page, limit).then((r) => r.data),
  });

  const settlements = settlementsData?.data;

  const { data: balanceData } = useQuery({
    queryKey: ["balances", householdId],
    queryFn: () => balanceApi.getBalances(householdId).then((r) => r.data),
  });

  const createSettlementMutation = useMutation({
    mutationFn: (data) => settlementApi.create(householdId, data),
    onSuccess: () => {
      toast("Settlement recorded!", "success");
      queryClient.invalidateQueries({ queryKey: ["settlements", householdId] });
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["balances", householdId] });
      setSettleForm({
        from: "",
        to: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
      setSettlementError("");
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to record settlement", "error");
    },
  });

  const deleteSettlementMutation = useMutation({
    mutationFn: (settlementId) => settlementApi.remove(settlementId),
    onSuccess: () => {
      toast("Settlement deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["settlements", householdId] });
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["balances", householdId] });
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to delete settlement", "error");
    },
  });

  const handleSettleDebt = (debt) => {
    createSettlementMutation.mutate({
      fromUserId: debt.fromId,
      toUserId: debt.toId,
      amount: debt.amount,
      settlementDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleCreateSettlement = (e) => {
    e.preventDefault();
    setSettlementError("");

    const amount = parseFloat(settleForm.amount);
    if (!settleForm.from || !settleForm.to || !amount || !settleForm.date) {
      setSettlementError("Please fill in all fields.");
      return;
    }
    if (settleForm.from === settleForm.to) {
      setSettlementError("Payer and receiver must be different.");
      return;
    }

    createSettlementMutation.mutate({
      fromUserId: parseInt(settleForm.from, 10),
      toUserId: parseInt(settleForm.to, 10),
      amount,
      settlementDate: settleForm.date,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-white/80 shadow-sm p-6">
        <h2 className="text-base font-semibold text-[#154535] mb-4">Settlements</h2>

        {/* Quick settle */}
        {balanceData?.debts?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-[#4A6B5D] uppercase tracking-wide mb-2">
              Quick settle
            </p>
            <div className="flex flex-col gap-2">
              {balanceData.debts.filter((d) => d.fromId === user?.id).map((debt, i) => (
                <button
                  key={i}
                  onClick={() => handleSettleDebt(debt)}
                  disabled={createSettlementMutation.isPending}
                  className="flex items-center justify-between p-3 border border-[#E1EEE8] bg-[#F8FCFA] rounded-lg hover:border-[#154535] hover:bg-white transition-colors text-left shadow-sm"
                >
                  <span className="text-sm text-[#4A6B5D]">
                    <span className="font-medium text-[#154535]">{debt.fromName}</span> owes{" "}
                    <span className="font-medium text-[#154535]">{debt.toName}</span>
                  </span>
                  <span className="text-sm font-semibold text-[#154535]">
                    {fmt(debt.amount)} →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Record payment */}
        <div className="bg-[#F8FCFA] rounded-xl border border-[#E1EEE8] p-4 mb-4">
          <p className="text-xs font-medium text-[#4A6B5D] mb-3">Record payment</p>
          {settlementError && (
            <p className="text-sm text-[#D94A4A] mb-2 bg-red-50/50 rounded-lg px-3 py-1.5 border border-red-100/50">
              {settlementError}
            </p>
          )}
          <form onSubmit={handleCreateSettlement} className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <select
                className={inputCls}
                value={settleForm.from}
                onChange={(e) => setSettleForm((f) => ({ ...f, from: e.target.value }))}
                required
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
                value={settleForm.to}
                onChange={(e) => setSettleForm((f) => ({ ...f, to: e.target.value }))}
                required
              >
                <option value="">Who received?</option>
                {household.members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputCls}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amount"
                value={settleForm.amount}
                onChange={(e) => setSettleForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
              <input
                className={inputCls}
                type="date"
                value={settleForm.date}
                onChange={(e) => setSettleForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={createSettlementMutation.isPending}
              className="self-start bg-[#154535] hover:bg-[#1b5c48] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {createSettlementMutation.isPending ? "Recording..." : "Record payment"}
            </button>
          </form>
        </div>

        {/* Settlement list */}
        {settLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : settlements?.length === 0 ? (
          <div className="text-center py-6 text-[#4A6B5D]">
            <div className="text-2xl mb-2">💸</div>
            <p className="text-sm">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {settlements?.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 border border-[#E1EEE8] bg-[#F8FCFA] rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Avatar name={s.from_user_name} size="sm" className="bg-[#E1EEE8] text-[#154535]" />
                  <div>
                    <p className="text-sm font-medium text-[#154535]">
                      {s.from_user_name} → {s.to_user_name}
                    </p>
                    <p className="text-xs text-[#4A6B5D]">
                      {new Date(s.settlement_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#154535]">
                    ${parseFloat(s.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => setConfirmDelete({ id: s.id })}
                    className="text-[#4A6B5D] hover:text-[#D94A4A] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {settlementsData && (
        <Pagination page={page} totalPages={settlementsData.totalPages} onPageChange={setPage} />
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Settlement"
        message="Are you sure you want to delete this settlement?"
        onConfirm={() => {
          if (confirmDelete) deleteSettlementMutation.mutate(confirmDelete.id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}