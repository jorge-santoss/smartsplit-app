import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as balanceApi from "../../api/balanceApi";
import * as settlementApi from "../../api/settlementApi";
import Skeleton from "../../components/Skeleton";
import Avatar from "../../components/Avatar";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../hooks/useAuth";

const fmt = (n) => {
  const val = typeof n === 'string' ? parseFloat(n) : n;
  return `$${Math.abs(val).toFixed(2)}`;
};

export default function HouseholdBalances({ householdId }) {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: balanceData, isLoading } = useQuery({
    queryKey: ["balances", householdId],
    queryFn: () => balanceApi.getBalances(householdId).then((r) => r.data),
  });

  const settleMutation = useMutation({
    mutationFn: ({ fromId, toId, amount }) =>
      settlementApi.create(householdId, {
        fromUserId: fromId,
        toUserId: toId,
        amount,
        settlementDate: new Date().toISOString().split("T")[0],
      }),
    onSuccess: () => {
      toast("Settlement recorded!", "success");
      queryClient.invalidateQueries({ queryKey: ["balances", householdId] });
      queryClient.invalidateQueries({ queryKey: ["settlements", householdId] });
    },
    onError: (err) => {
      toast(err.response?.data?.error || "Failed to record settlement", "error");
    },
  });

  const handleSettleDebt = (debt) => {
    settleMutation.mutate({ fromId: debt.fromId, toId: debt.toId, amount: debt.amount });
  };

  return (
    <div className="bg-white rounded-xl border border-white/80 shadow-sm p-6">
      <h2 className="text-base font-semibold text-[#154535] mb-4">Balances</h2>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : balanceData ? (
        <div className="space-y-5">
          {/* Debts */}
          <div>
            <p className="text-xs font-medium text-[#4A6B5D] uppercase tracking-wide mb-2">
              Debts to settle
            </p>
            {balanceData.debts.length === 0 ? (
              <div className="flex items-center gap-2 bg-[#E1EEE8] rounded-lg px-4 py-3 border border-[#E1EEE8]/60">
                <span>🎉</span>
                <span className="text-sm font-medium text-[#154535]">All settled up!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {balanceData.debts.map((debt, i) => {
                  const isMe = debt.fromId === user?.id;
                  const theyOweMe = debt.toId === user?.id;
                  return (
                    <div
                      key={i}
                      className={`flex justify-between items-center rounded-lg px-4 py-3 border ${
                        isMe 
                          ? "bg-red-50/80 border-red-100/50" 
                          : theyOweMe 
                            ? "bg-[#E1EEE8]/70 border-[#E1EEE8]" 
                            : "bg-[#F8FCFA] border-[#E1EEE8]"
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        isMe 
                          ? "text-[#D94A4A]" 
                          : theyOweMe 
                            ? "text-[#154535]" 
                            : "text-[#4A6B5D]"
                      }`}>
                        {isMe
                          ? `You owe ${debt.toName}`
                          : theyOweMe
                            ? `${debt.fromName} owes you`
                            : `${debt.fromName} owes ${debt.toName}`}
                        <span className="ml-2 font-semibold">{fmt(debt.amount)}</span>
                      </span>
                      {isMe ? (
                        <button
                          onClick={() => handleSettleDebt(debt)}
                          disabled={settleMutation.isPending}
                          className="text-xs bg-[#154535] text-white px-3 py-1.5 rounded-lg hover:bg-[#1b5c48] transition-colors disabled:opacity-50 shadow-sm"
                        >
                          Settle →
                        </button>
                      ) : theyOweMe ? (
                        <span className="text-xs text-[#4A6B5D] italic">Awaiting</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Member breakdown */}
          <div>
            <p className="text-xs font-medium text-[#4A6B5D] uppercase tracking-wide mb-2">
              Member breakdown
            </p>
            <div className="flex flex-col gap-2">
              {balanceData.balances.map((b) => {
                const net = parseFloat(b.net_balance);
                const isMe = b.id === user?.id;
                return (
                  <div key={b.id} className="flex items-center gap-3 bg-[#F8FCFA] rounded-lg px-3 py-2 border border-[#E1EEE8]">
                    <Avatar name={b.name} size="sm" className="bg-[#E1EEE8] text-[#154535]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#154535] truncate">
                        {b.name}
                        {isMe && <span className="text-xs text-[#4A6B5D] ml-1">(you)</span>}
                      </p>
                      <p className="text-xs text-[#4A6B5D]">
                        Paid {fmt(b.total_paid)} · owes {fmt(b.total_owed)}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${
                      net > 0.005 
                        ? "text-[#154535]" 
                        : net < -0.005 
                          ? "text-[#D94A4A]" 
                          : "text-[#4A6B5D]"
                    }`}>
                      {Math.abs(net) < 0.005 ? "settled" : `${net > 0 ? "+" : ""}${fmt(net)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[#4A6B5D]">No balance data.</p>
      )}
    </div>
  );
}