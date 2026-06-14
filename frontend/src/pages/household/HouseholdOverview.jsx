import { useQuery } from "@tanstack/react-query";
import * as expenseApi from "../../api/expenseApi";
import * as settlementApi from "../../api/settlementApi";
import * as balanceApi from "../../api/balanceApi";
import Skeleton, { SkeletonCard } from "../../components/Skeleton";

export default function HouseholdOverview({ household, householdId, onTabChange }) {
  const { data: expenses, isLoading: expLoading } = useQuery({
    queryKey: ["expenses", householdId],
    queryFn: () => expenseApi.listByHousehold(householdId).then((r) => r.data),
  });

  const { data: settlements, isLoading: settLoading } = useQuery({
    queryKey: ["settlements", householdId],
    queryFn: () => settlementApi.listByHousehold(householdId).then((r) => r.data),
  });

  const { data: balances, isLoading: balLoading } = useQuery({
    queryKey: ["balances", householdId],
    queryFn: () => balanceApi.getBalances(householdId).then((r) => r.data),
  });

  const totalSpent =
    expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Members</p>
          <p className="text-2xl font-bold text-gray-900">
            {household.members?.length || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Expenses</p>
          <p className="text-2xl font-bold text-gray-900">
            {expenses?.length || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">
            ${totalSpent.toFixed(2)}
          </p>
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
                  <div
                    key={b.userId}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {b.name}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        b.balance > 0
                          ? "text-green-600"
                          : b.balance < 0
                            ? "text-red-600"
                            : "text-gray-400"
                      }`}
                    >
                      {b.balance > 0 ? "+" : ""}$
                      {Math.abs(b.balance).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Settlements</h3>
              <button
                onClick={() => onTabChange("Settlements")}
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>
            {settLoading ? (
              <div className="p-5 space-y-3">
                <SkeletonCard />
              </div>
            ) : settlements?.length === 0 ? (
              <div className="p-5 text-center text-sm text-gray-500">
                No settlements yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {settlements?.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {s.from_user_name} paid {s.to_user_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(s.settlement_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-green-600">
                      ${parseFloat(s.amount).toFixed(2)}
                    </span>
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
              <button
                onClick={() => onTabChange("Members")}
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {household.members?.map((m) => (
                <div
                  key={m.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {m.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {m.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0 ml-2">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Expenses</h3>
              <button
                onClick={() => onTabChange("Expenses")}
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>
            {expLoading ? (
              <div className="p-5 space-y-3">
                <SkeletonCard />
              </div>
            ) : expenses?.length === 0 ? (
              <div className="p-5 text-center text-sm text-gray-500">
                No expenses yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {expenses?.slice(0, 5).map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {exp.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {exp.payer_name} ·{" "}
                        {new Date(exp.expense_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-sm shrink-0 ml-2">
                      ${parseFloat(exp.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}