import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import * as expenseApi from '../api/expenseApi';
import * as householdApi from '../api/householdApi';
import AppLayout from '../layouts/AppLayout';
import { SkeletonCard } from '../components/Skeleton';

export default function ExpenseDetailPage() {
  const { expenseId, householdId } = useParams();
  const navigate = useNavigate();

  const expenseQuery = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => expenseApi.getById(expenseId).then((r) => r.data),
  });

  const householdQuery = useQuery({
    queryKey: ['household', householdId],
    queryFn: () => householdApi.getById(householdId).then((r) => r.data),
  });

  if (expenseQuery.isLoading || householdQuery.isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AppLayout>
    );
  }

  if (expenseQuery.error) {
    return (
      <AppLayout>
        <p className="text-red-500">Expense not found</p>
      </AppLayout>
    );
  }

  if (householdQuery.error) {
    return (
      <AppLayout>
        <p className="text-red-500">Failed to load household details</p>
      </AppLayout>
    );
  }

  const expense = expenseQuery.data;
  const splits = expense.splits || [];

  return (
    <AppLayout>
      <button
        onClick={() => navigate(`/households/${householdId}`)}
        className="text-blue-600 hover:underline mb-4"
      >
        &larr; Back to Household
      </button>

      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">{expense.title}</h1>
        <p className="text-gray-500 text-sm mb-4">
          {new Date(expense.expense_date).toLocaleDateString()}
          {expense.category_name && <span> &middot; {expense.category_name}</span>}
          &middot; Split: {expense.split_type}
        </p>

        <div className="text-3xl font-bold text-blue-700 mb-6">
          ${parseFloat(expense.amount || 0).toFixed(2)}
        </div>

        {expense.note && (
          <p className="text-gray-600 mb-4 italic">{expense.note}</p>
        )}

        <div className="mb-4">
          <span className="text-sm text-gray-500">Paid by </span>
          <span className="font-semibold">{expense.payer_name}</span>
        </div>

        <h2 className="text-lg font-semibold mb-3 border-t pt-4">Splits</h2>
        <div className="space-y-2">
          {splits.map((split, i) => (
            <div
              key={split.id ?? i}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium">{split.member_name || split.memberName}</span>
              <span className="text-gray-700">
                ${parseFloat(split.amount || 0).toFixed(2)} ({parseFloat(split.percentage || 0).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
