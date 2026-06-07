import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../layouts/AppLayout';
import * as householdApi from '../api/householdApi';
import * as expenseApi from '../api/expenseApi';
import * as settlementApi from '../api/settlementApi';

export default function HouseholdPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const householdId = parseInt(id, 10);

  const [addEmail, setAddEmail] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPayerId, setExpPayerId] = useState('');
  const [expDate, setExpDate] = useState('');
  const [settleFrom, setSettleFrom] = useState('');
  const [settleTo, setSettleTo] = useState('');
  const [settleAmount, setSettleAmount] = useState('');
  const [settleDate, setSettleDate] = useState('');

  const { data: household, isLoading } = useQuery({
    queryKey: ['household', householdId],
    queryFn: () => householdApi.getById(householdId).then((r) => r.data),
  });

  const { data: expenses, isLoading: expLoading } = useQuery({
    queryKey: ['expenses', householdId],
    queryFn: () => expenseApi.listByHousehold(householdId).then((r) => r.data),
  });

  const { data: settlements, isLoading: settLoading } = useQuery({
    queryKey: ['settlements', householdId],
    queryFn: () => settlementApi.listByHousehold(householdId).then((r) => r.data),
  });

  const addMemberMutation = useMutation({
    mutationFn: (email) => householdApi.addMember(householdId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household', householdId] });
      setAddEmail('');
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => expenseApi.create(householdId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', householdId] });
      setExpTitle('');
      setExpAmount('');
      setExpPayerId('');
      setExpDate('');
    },
  });

  const createSettlementMutation = useMutation({
    mutationFn: (data) => settlementApi.create(householdId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', householdId] });
      setSettleFrom('');
      setSettleTo('');
      setSettleAmount('');
      setSettleDate('');
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <p className="text-gray-500">Loading...</p>
      </AppLayout>
    );
  }

  if (!household) {
    return (
      <AppLayout>
        <p className="text-gray-500">Household not found</p>
      </AppLayout>
    );
  }

  const handleAddMember = (e) => {
    e.preventDefault();
    if (addEmail.trim()) {
      addMemberMutation.mutate(addEmail.trim());
    }
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    const amount = parseFloat(expAmount);
    if (expTitle.trim() && amount > 0 && expPayerId && expDate) {
      createExpenseMutation.mutate({
        title: expTitle,
        amount: amount,
        splitType: 'equal',
        payerId: parseInt(expPayerId, 10),
        expenseDate: expDate,
      });
    }
  };

  const handleCreateSettlement = (e) => {
    e.preventDefault();
    const amount = parseFloat(settleAmount);
    if (settleFrom && settleTo && amount > 0 && settleDate) {
      createSettlementMutation.mutate({
        fromUserId: parseInt(settleFrom, 10),
        toUserId: parseInt(settleTo, 10),
        amount: amount,
        settlementDate: settleDate,
      });
    }
  };

  return (
    <AppLayout>
      <button
        onClick={() => navigate('/dashboard')}
        className="text-blue-600 hover:underline mb-4"
      >
        &larr; Back to Dashboard
      </button>

      <h1 className="text-2xl font-bold mb-2">{household.name}</h1>
      {household.description && (
        <p className="text-gray-500 mb-6">{household.description}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Expenses</h2>
            <form onSubmit={handleCreateExpense} className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-sm text-gray-600">New Expense</h3>
              <input
                type="text"
                placeholder="Title"
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <select
                value={expPayerId}
                onChange={(e) => setExpPayerId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Who paid?</option>
                {household.members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={createExpenseMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
              </button>
            </form>

            {expLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : expenses?.length === 0 ? (
              <p className="text-gray-500">No expenses yet.</p>
            ) : (
              <div className="space-y-3">
                {expenses?.map((exp) => (
                  <div key={exp.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{exp.title}</h3>
                        <p className="text-sm text-gray-500">
                          Paid by {exp.payer_name} on{' '}
                          {new Date(exp.expense_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-lg font-bold">
                        ${parseFloat(exp.amount).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Split: {exp.split_type}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Settlements</h2>
            <form onSubmit={handleCreateSettlement} className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-sm text-gray-600">Record Payment</h3>
              <div className="flex gap-3">
                <select
                  value={settleFrom}
                  onChange={(e) => setSettleFrom(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Who paid?</option>
                  {household.members?.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <select
                  value={settleTo}
                  onChange={(e) => setSettleTo(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Who received?</option>
                  {household.members?.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="date"
                  value={settleDate}
                  onChange={(e) => setSettleDate(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={createSettlementMutation.isPending}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {createSettlementMutation.isPending ? 'Recording...' : 'Record Payment'}
              </button>
            </form>

            {settLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : settlements?.length === 0 ? (
              <p className="text-gray-500">No settlements yet.</p>
            ) : (
              <div className="space-y-3">
                {settlements?.map((s) => (
                  <div key={s.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {s.from_user_name} paid {s.to_user_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(s.settlement_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        ${parseFloat(s.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
          <h2 className="text-lg font-semibold mb-4">Members</h2>
          <form onSubmit={handleAddMember} className="space-y-3 mb-4">
            <input
              type="email"
              placeholder="Email to invite"
              value={addEmail}
              onChange={(e) => setAddEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={addMemberMutation.isPending}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
            </button>
          </form>
          <div className="space-y-2">
            {household.members?.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}