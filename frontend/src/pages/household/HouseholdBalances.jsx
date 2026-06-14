import { useQuery } from "@tanstack/react-query";
import * as balanceApi from "../../api/balanceApi";
import Skeleton from "../../components/Skeleton";

export default function HouseholdBalances({ householdId }) {
  const { data: balances, isLoading: balLoading } = useQuery({
    queryKey: ["balances", householdId],
    queryFn: () => balanceApi.getBalances(householdId).then((r) => r.data),
  });

  return (
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
              <span
                className={`text-lg font-bold ${
                  b.balance > 0
                    ? "text-green-600"
                    : b.balance < 0
                      ? "text-red-600"
                      : "text-gray-400"
                }`}
              >
                {b.balance > 0 ? "+" : ""}${Math.abs(b.balance).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No balance data.</p>
      )}
    </div>
  );
}