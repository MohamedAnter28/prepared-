import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const LS_KEY = 'debts';
const HISTORY_KEY = 'debtHistory';

const getInitialDebts = () => {
  const stored = localStorage.getItem(LS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
};

export default function Debts() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [debts, setDebts] = useState(getInitialDebts());
  const [form, setForm] = useState({
    name: '',
    totalAmount: '',
    paidAmount: '',
    dueDate: '',
    note: '',
    creditor: '',
    creditorCard: '',
  });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(debts));
  }, [debts]);

  const openAddModal = () => {
    setForm({
      name: '',
      totalAmount: '',
      paidAmount: '',
      dueDate: '',
      note: '',
      creditor: '',
      creditorCard: '',
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (debt) => {
    setForm({
      name: debt.name,
      totalAmount: debt.totalAmount,
      paidAmount: debt.paidAmount,
      dueDate: debt.dueDate,
      note: debt.note,
      creditor: debt.creditor || '',
      creditorCard: debt.creditorCard || '',
    });
    setEditId(debt.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = (e) => {
    e.preventDefault();
    if (editId) {
      setDebts(
        debts.map((debt) =>
          debt.id === editId
            ? {
                ...debt,
                ...form,
                totalAmount: Number(form.totalAmount),
                paidAmount: Number(form.paidAmount),
              }
            : debt
        )
      );
      toast.showToast('Debt updated!', 'success');
    } else {
      setDebts([
        ...debts,
        {
          id: Date.now(),
          ...form,
          totalAmount: Number(form.totalAmount),
          paidAmount: Number(form.paidAmount),
        },
      ]);
      toast.showToast('Debt added!', 'success');
    }
    setForm({
      name: '',
      totalAmount: '',
      paidAmount: '',
      dueDate: '',
      note: '',
      creditor: '',
      creditorCard: '',
    });
    setEditId(null);
    setShowModal(false);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const handleDelete = () => {
    setDebts(debts.filter((debt) => debt.id !== deleteId));
    setShowDelete(false);
    setDeleteId(null);
    toast.showToast('Debt deleted.', 'info');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Debts & Installments</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={openAddModal}
        >
          + Add Debt
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {debts.map((debt) => {
          const percent = Math.min(
            100,
            Math.round((debt.paidAmount / debt.totalAmount) * 100)
          );
          return (
            <div
              key={debt.id}
              className="bg-white dark:bg-gray-900 shadow rounded-lg p-5 cursor-pointer hover:shadow-lg transition border border-gray-100 dark:border-gray-800"
              onClick={() => navigate(`/debts/${debt.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-lg">{debt.name}</div>
                <span className="text-xs text-gray-400">
                  Due: {debt.dueDate}
                </span>
              </div>
              <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
                Creditor: {debt.creditor || 'N/A'}
              </div>
              <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
                Card:{' '}
                {debt.creditorCard
                  ? `**** **** **** ${debt.creditorCard.slice(-4)}`
                  : 'N/A'}
              </div>
              <div className="mb-2 font-semibold">
                Paid: ${debt.paidAmount.toLocaleString()} / $
                {debt.totalAmount.toLocaleString()}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-700"
                  style={{ width: percent + '%' }}
                ></div>
              </div>
              <div className="text-xs text-gray-400">{percent}% repaid</div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editId ? 'Edit Debt' : 'Add Debt'}
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
                  placeholder="e.g. Car Loan"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Total Amount</label>
                <input
                  name="totalAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter total amount"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Paid Amount</label>
                <input
                  name="paidAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.paidAmount}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter paid amount"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Due Date</label>
                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Creditor Name</label>
                <input
                  name="creditor"
                  type="text"
                  value={form.creditor}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. John Doe or Bank Name"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Creditor Card Number
                </label>
                <input
                  name="creditorCard"
                  type="text"
                  maxLength={16}
                  minLength={12}
                  pattern="[0-9]{12,16}"
                  value={form.creditorCard}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter card number (optional)"
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
                  onClick={() => {
                    setShowModal(false);
                    setEditId(null);
                  }}
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
            <h2 className="text-lg font-bold mb-4">Delete Debt</h2>
            <p>Are you sure you want to delete this debt?</p>
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
