import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_KEY = 'investments';

const getInitialInvestments = () => {
  const stored = localStorage.getItem(LS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
};

export default function Investments() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [investments, setInvestments] = useState(getInitialInvestments());
  const [form, setForm] = useState({
    name: '',
    amount: '',
    interestRate: '',
    maturityDate: '',
    note: '',
    monthlyIncome: '',
  });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(investments));
  }, [investments]);

  const openAddModal = () => {
    setForm({
      name: '',
      amount: '',
      interestRate: '',
      maturityDate: '',
      note: '',
      monthlyIncome: '',
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (inv) => {
    setForm({
      name: inv.name,
      amount: inv.amount,
      interestRate: inv.interestRate,
      maturityDate: inv.maturityDate,
      note: inv.note,
      monthlyIncome: inv.monthlyIncome || '',
    });
    setEditId(inv.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = (e) => {
    e.preventDefault();
    if (editId) {
      setInvestments(
        investments.map((inv) =>
          inv.id === editId
            ? {
                ...inv,
                ...form,
                amount: Number(form.amount),
                interestRate: Number(form.interestRate),
                monthlyIncome: form.monthlyIncome
                  ? Number(form.monthlyIncome)
                  : 0,
              }
            : inv
        )
      );
    } else {
      setInvestments([
        ...investments,
        {
          id: Date.now(),
          ...form,
          amount: Number(form.amount),
          interestRate: Number(form.interestRate),
          monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : 0,
        },
      ]);
    }
    setForm({
      name: '',
      amount: '',
      interestRate: '',
      maturityDate: '',
      note: '',
      monthlyIncome: '',
    });
    setEditId(null);
    setShowModal(false);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const handleDelete = () => {
    setInvestments(investments.filter((inv) => inv.id !== deleteId));
    setShowDelete(false);
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Investments</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={openAddModal}
        >
          + Add Investment
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {investments.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
            <div className="text-5xl mb-2">💹</div>
            <div className="mb-2 font-semibold">No investments yet</div>
            <div className="mb-4">
              Add your first investment to get started!
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={openAddModal}
            >
              + Add Investment
            </button>
          </div>
        ) : (
          investments.map((inv) => {
            return (
              <div
                key={inv.id}
                className="bg-white dark:bg-gray-900 shadow rounded-lg p-5 border border-gray-100 dark:border-gray-800 cursor-pointer hover:shadow-lg transition"
                onClick={() => navigate(`/investments/${inv.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-lg">{inv.name}</div>
                  <span className="text-xs text-gray-400">
                    {inv.maturityDate || 'No maturity'}
                  </span>
                </div>
                <div className="mb-1 text-sm text-gray-500 dark:text-gray-300">
                  Amount: ${inv.amount.toLocaleString()}
                </div>
                <div className="mb-1 text-sm text-gray-500 dark:text-gray-300">
                  Interest Rate: {inv.interestRate}%
                </div>
                <div className="mb-1 text-sm text-gray-500 dark:text-gray-300">
                  Monthly Income: $
                  {inv.monthlyIncome ? inv.monthlyIncome.toLocaleString() : '0'}
                </div>
                <div className="mb-1 text-sm text-gray-500 dark:text-gray-300">
                  Note: {inv.note || 'No note'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editId ? 'Edit Investment' : 'Add Investment'}
            </h2>
            <form onSubmit={handleAddOrEdit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Certificate A"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Amount</label>
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
              <div>
                <label className="block mb-1 font-medium">
                  Interest Rate (%)
                </label>
                <input
                  name="interestRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.interestRate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter interest rate"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Monthly Income</label>
                <input
                  name="monthlyIncome"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthlyIncome}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter monthly income"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Maturity Date</label>
                <input
                  name="maturityDate"
                  type="date"
                  value={form.maturityDate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Note</label>
                <input
                  name="note"
                  type="text"
                  value={form.note}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Optional note"
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
            <h2 className="text-lg font-bold mb-4">Delete Investment</h2>
            <p>Are you sure you want to delete this investment?</p>
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
