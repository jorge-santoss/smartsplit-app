import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as settlementApi from "../../api/settlementApi";
import Skeleton, { SkeletonCard } from "../../components/Skeleton";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function HouseholdSettlements({ household, householdId }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [settleFrom, setSettleFrom] = useState("");
  const [settleTo, setSettleTo] = useState("");
  const [settleAmount, setSettleAmount] = useState("");
  const [settleDate, setSettleDate] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: settlements, isLoading: settLoading } = useQuery({
    queryKey: ["settlements", householdId],
    queryFn: () =>
      settlementApi.listByHousehold(householdId).then((r) => r.data),
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

  const handleCreateSettlement = (e) => {
    e.preventDefault();
    const amount = parseFloat(settleAmount);
    if (settleFrom && settleTo && amount > 0 && settleDate) {
      createSettlementMutation.mutate({
        fromUserId: parseInt(settleFrom, 10),
        toUserId: parseInt(settleTo, 10),
        amount,
        settlementDate: settleDate,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Record Payment
        </h2>
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
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
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
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
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
            {createSettlementMutation.isPending
              ? "Recording..."
              : "Record Payment"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Settlements
          </h2>
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
              <div
                key={s.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {s.from_user_name} paid {s.to_user_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(s.settlement_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-green-600">
                    ${parseFloat(s.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => setConfirmDelete({ id: s.id })}
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
            ))}
          </div>
        )}
      </div>

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