import React, { useState, useEffect } from 'react';

const BUDGET_KEY = 'budgets';
const TX_KEY = 'transactions';

function getInitialBudgets() {
  const stored = localStorage.getItem(BUDGET_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

function getTransactions() {
  const stored = localStorage.getItem(TX_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

function getCurrentMonthSpending(category) {
  const txs = getTransactions();
  const now = new Date();
  return txs
    .filter(
      (tx) =>
        tx.category === category &&
        tx.type === 'Withdrawal' &&
        new Date(tx.date).getMonth() === now.getMonth() &&
        new Date(tx.date).getFullYear() === now.getFullYear()
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export default function Budgets() {
  const [budgets, setBudgets] = useState(getInitialBudgets());
  const [form, setForm] = useState({ category: '', amount: '' });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
  }, [budgets]);

  const openAddModal = () => {
    setForm({ category: '', amount: '' });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (b) => {
    setForm({ category: b.category, amount: b.amount });
    setEditId(b.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = (e) => {
    e.preventDefault();
    if (editId) {
      setBudgets(
        budgets.map((b) =>
          b.id === editId
            ? { ...form, id: editId, amount: Number(form.amount) }
            : b
        )
      );
    } else {
      setBudgets([
        ...budgets,
        { ...form, id: Date.now(), amount: Number(form.amount) },
      ]);
    }
    setShowModal(false);
    setEditId(null);
    setForm({ category: '', amount: '' });
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const handleDelete = () => {
    setBudgets(budgets.filter((b) => b.id !== deleteId));
    setShowDelete(false);
    setDeleteId(null);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Budgets</h1>
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        onClick={openAddModal}
      >
        + Add Budget
      </button>
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        {budgets.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No budgets set yet.
          </div>
        ) : (
          <ul className="space-y-4">
            {budgets.map((b) => {
              const spent = getCurrentMonthSpending(b.category);
              const percent =
                b.amount > 0
                  ? Math.min(100, Math.round((spent / b.amount) * 100))
                  : 0;
              const near = percent >= 80 && percent < 100;
              const over = percent >= 100;
              return (
                <li key={b.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-lg">{b.category}</div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-yellow-400 text-white hover:bg-yellow-500"
                        onClick={() => openEditModal(b)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                        onClick={() => confirmDelete(b.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mb-1 text-sm text-gray-500 dark:text-gray-300">
                    Budget: ${b.amount.toLocaleString()} | Spent: $
                    {spent.toLocaleString()}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 mb-1 overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-700 ${
                        over
                          ? 'bg-red-500'
                          : near
                          ? 'bg-yellow-400'
                          : 'bg-green-500'
                      }`}
                      style={{ width: percent + '%' }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {percent}% used
                    {over && (
                      <span className="ml-2 text-red-600 font-bold">
                        Over budget!
                      </span>
                    )}
                    {near && !over && (
                      <span className="ml-2 text-yellow-600 font-bold">
                        Nearing budget
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editId ? 'Edit Budget' : 'Add Budget'}
            </h2>
            <form onSubmit={handleAddOrEdit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Category</label>
                <input
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Groceries"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Monthly Budget Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  {editId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Delete Budget</h2>
            <p>Are you sure you want to delete this budget?</p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
