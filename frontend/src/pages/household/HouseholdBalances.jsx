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
    <div className="bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-white mb-4">Balances</h2>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : balanceData ? (
        <div className="space-y-5">
          {/* Debts */}
          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">
              Debts to settle
            </p>
            {balanceData.debts.length === 0 ? (
              <div className="flex items-center gap-2 bg-[#121214] rounded-lg px-4 py-3 border border-[#2C2C2E]">
                <span>🎉</span>
                <span className="text-sm font-medium text-white">All settled up!</span>
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
                          ? "bg-[#FB7185]/10 border-[#FB7185]/30" 
                          : theyOweMe 
                            ? "bg-[#2DD4BF]/10 border-[#2DD4BF]/30" 
                            : "bg-[#121214] border-[#2C2C2E]"
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        isMe 
                          ? "text-[#FB7185]" 
                          : theyOweMe 
                            ? "text-[#2DD4BF]" 
                            : "text-[#9CA3AF]"
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
                          className="text-xs bg-[#2DD4BF] text-[#121214] px-3 py-1.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-teal-400/25"
                        >
                          Settle →
                        </button>
                      ) : theyOweMe ? (
                        <span className="text-xs text-[#6B7280] italic">Awaiting</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Member breakdown */}
          <div>
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">
              Member breakdown
            </p>
            <div className="flex flex-col gap-2">
              {balanceData.balances.map((b) => {
                const net = parseFloat(b.net_balance);
                const isMe = b.id === user?.id;
                return (
                  <div key={b.id} className="flex items-center gap-3 bg-[#121214] rounded-lg px-3 py-2 border border-[#2C2C2E]">
                    <Avatar name={b.name} size="sm" className="bg-[#2C2C2E] text-[#2DD4BF]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {b.name}
                        {isMe && <span className="text-xs text-[#6B7280] ml-1">(you)</span>}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        Paid {fmt(b.total_paid)} · owes {fmt(b.total_owed)}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${
                      net > 0.005 
                        ? "text-[#2DD4BF]" 
                        : net < -0.005 
                          ? "text-[#FB7185]" 
                          : "text-[#6B7280]"
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
        <p className="text-[#9CA3AF]">No balance data.</p>
      )}
    </div>
  );
}