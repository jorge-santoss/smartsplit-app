import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppLayout from '../layouts/AppLayout';
import * as householdApi from '../api/householdApi';
import * as expenseApi from '../api/expenseApi';
import * as settlementApi from '../api/settlementApi';
import * as balanceApi from '../api/balanceApi';
import * as categoryApi from '../api/categoryApi';
import Skeleton, { SkeletonCard } from '../components/Skeleton';
import { useToast } from '../components/Toast';

export default function HouseholdPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const householdId = parseInt(id, 10);

  const [addEmail, setAddEmail] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expPayerId, setExpPayerId] = useState('');
  const [expDate, setExpDate] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [splits, setSplits] = useState([]);
  const [expCategoryId, setExpCategoryId] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const [settleFrom, setSettleFrom] = useState('');
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

  const { data: balances, isLoading: balLoading } = useQuery({
    queryKey: ['balances', householdId],
    queryFn: () => balanceApi.getBalances(householdId).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', householdId],
    queryFn: () => categoryApi.listByHousehold(householdId).then((r) => r.data),
  });

  const addMemberMutation = useMutation({
    mutationFn: (email) => householdApi.addMember(householdId, email),
    onSuccess: () => {
      toast('Member added!', 'success');
      queryClient.invalidateQueries({ queryKey: ['household', householdId] });
      setAddEmail('');
    },
    onError: (err) => {
      toast(err.response?.data?.error || 'Failed to add member', 'error');
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name) => categoryApi.create(householdId, name),
    onSuccess: () => {
      toast('Category added!', 'success');
      queryClient.invalidateQueries({ queryKey: ['categories', householdId] });
      setNewCatName('');
    },
    onError: (err) => {
      toast(err.response?.data?.error || 'Failed to add category', 'error');
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data) => expenseApi.create(householdId, data),
    onSuccess: () => {
      toast('Expense added!', 'success');
      queryClient.invalidateQueries({ queryKey: ['expenses', householdId] });
      queryClient.invalidateQueries({ queryKey: ['balances', householdId] });
      setExpTitle('');
      setExpAmount('');
      setExpPayerId('');
      setExpDate('');
      setSplitType('equal');
      setSplits([]);
    },
    onError: (err) => {
      toast(err.response?.data?.error || 'Failed to add expense', 'error');
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId) => expenseApi.remove(expenseId),
    onSuccess: () => {
      toast('Expense deleted', 'success');
      queryClient.invalidateQueries({ queryKey: ['expenses', householdId] });
      queryClient.invalidateQueries({ queryKey: ['balances', householdId] });
    },
    onError: (err) => {
      toast(err.response?.data?.error || 'Failed to delete expense', 'error');
    },
  });

  const createSettlementMutation = useMutation({
    mutationFn: (data) => settlementApi.create(householdId, data),
    onSuccess: () => {
      toast('Settlement recorded!', 'success');
      queryClient.invalidateQueries({ queryKey: ['settlements', householdId] });
      queryClient.invalidateQueries({ queryKey: ['balances', householdId] });
      setSettleFrom('');
      setSettleTo('');
      setSettleAmount('');
      setSettleDate('');
    },
    onError: (err) => {
      toast(err.response?.data?.error || 'Failed to record settlement', 'error');
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
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
      const payload = {
        title: expTitle,
        amount,
        splitType,
        payerId: parseInt(expPayerId, 10),
        expenseDate: expDate,
        categoryId: expCategoryId ? parseInt(expCategoryId, 10) : null,
      };
      if (splitType === 'exact') {
        payload.splits = splits.map((s) => ({
          memberId: s.memberId,
          amount: parseFloat(s.amount) || 0,
        }));
      } else if (splitType === 'percentage') {
        payload.splits = splits.map((s) => ({
          memberId: s.memberId,
          percentage: parseFloat(s.percentage) || 0,
        }));
      }
      createExpenseMutation.mutate(payload);
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

              <div>
                <label className="text-sm text-gray-600 block mb-1">Split type</label>
                <div className="flex gap-4">
                  {['equal', 'exact', 'percentage'].map((type) => (
                    <label key={type} className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        name="splitType"
                        value={type}
                        checked={splitType === type}
                        onChange={() => {
                          setSplitType(type);
                          if (type !== 'equal' && household.members) {
                            const perMember = type === 'percentage'
                              ? 100 / household.members.length
                              : 0;
                            setSplits(
                              household.members.map((m) => ({
                                memberId: m.id,
                                memberName: m.name,
                                amount: type === 'exact' ? '' : '0',
                                percentage: type === 'percentage' ? perMember.toFixed(1) : '0',
                              })),
                            );
                          }
                        }}
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {splitType !== 'equal' && splits.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {splitType === 'exact' ? 'Enter amount for each member' : 'Enter percentage for each member'}
                  </p>
                  {splits.map((split, idx) => (
                    <div key={split.memberId} className="flex items-center gap-2">
                      <span className="text-sm w-32 truncate">{split.memberName}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={splitType === 'exact' ? 'Amount' : '%'}
                        value={split[splitType] || ''}
                        onChange={(e) => {
                          const updated = [...splits];
                          updated[idx] = { ...updated[idx], [splitType]: e.target.value };
                          setSplits(updated);
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600 block mb-1">Category</label>
                <div className="flex gap-2">
                  <select
                    value={expCategoryId}
                    onChange={(e) => setExpCategoryId(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">None</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="New category"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCatName.trim()) createCategoryMutation.mutate(newCatName.trim());
                    }}
                    disabled={createCategoryMutation.isPending}
                    className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={createExpenseMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
              </button>
            </form>

            {expLoading ? (
              <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
            ) : expenses?.length === 0 ? (
              <p className="text-gray-500">No expenses yet.</p>
            ) : (
              <div className="space-y-3">
                {expenses?.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => navigate(`/households/${householdId}/expenses/${exp.id}`)}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{exp.title}</h3>
                        <p className="text-sm text-gray-500">
                          Paid by {exp.payer_name} on{' '}
                          {new Date(exp.expense_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          ${parseFloat(exp.amount).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this expense?')) {
                              deleteExpenseMutation.mutate(exp.id);
                            }
                          }}
                          disabled={deleteExpenseMutation.isPending}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {exp.category_name && <span className="mr-2">{exp.category_name} &middot;</span>}
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
              <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
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
          <h2 className="text-lg font-semibold mb-4">Balances</h2>
          {balLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : balances ? (
            <div className="space-y-2">
              {balances.map((b) => (
                <div key={b.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-sm">{b.name}</span>
                  <span
                    className={`text-sm font-bold ${
                      b.balance > 0
                        ? 'text-green-600'
                        : b.balance < 0
                          ? 'text-red-600'
                          : 'text-gray-400'
                    }`}
                  >
                    {b.balance > 0 ? '+' : ''}${Math.abs(b.balance).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
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