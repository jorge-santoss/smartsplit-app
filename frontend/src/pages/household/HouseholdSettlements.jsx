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
  "w-full px-3 py-2 border border-[#2C2C2E] bg-[#121214] rounded-lg text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] transition-all";

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
      <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Settlements</h2>

        {/* Quick settle */}
        {balanceData?.debts?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">
              Quick settle
            </p>
            <div className="flex flex-col gap-2">
              {balanceData.debts.filter((d) => d.fromId === user?.id).map((debt, i) => (
                <button
                  key={i}
                  onClick={() => handleSettleDebt(debt)}
                  disabled={createSettlementMutation.isPending}
                  className="flex items-center justify-between p-3 border border-[#2C2C2E] bg-[#121214] rounded-lg hover:bg-[#2C2C2E] hover:border-[#2DD4BF] transition-colors text-left shadow-sm"
                >
                  <span className="text-sm text-[#9CA3AF]">
                    <span className="font-medium text-white">{debt.fromName}</span> owes{" "}
                    <span className="font-medium text-white">{debt.toName}</span>
                  </span>
                  <span className="text-sm font-semibold text-[#2DD4BF]">
                    {fmt(debt.amount)} →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Record payment */}
        <div className="bg-[#121214] rounded-xl border border-[#2C2C2E] p-4 mb-4">
          <p className="text-xs font-medium text-[#6B7280] mb-3">Record payment</p>
          {settlementError && (
            <p className="text-sm text-[#FB7185] mb-2 bg-[#FB7185]/10 rounded-lg px-3 py-1.5 border border-[#FB7185]/30">
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
              className="self-start bg-[#2DD4BF] text-[#121214] text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-teal-400/25"
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
          <div className="text-center py-6 text-[#9CA3AF]">
            <div className="text-2xl mb-2">💸</div>
            <p className="text-sm">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {settlements?.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 border border-[#2C2C2E] bg-[#121214] rounded-lg hover:bg-[#2C2C2E] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Avatar name={s.from_user_name} size="sm" className="bg-[#2C2C2E] text-[#2DD4BF]" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {s.from_user_name} → {s.to_user_name}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {new Date(s.settlement_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#2DD4BF]">
                    ${parseFloat(s.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => setConfirmDelete({ id: s.id })}
                    className="text-[#6B7280] hover:text-[#FB7185] transition-colors"
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