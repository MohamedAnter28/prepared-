import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const LS_KEY = 'goals';

const getInitialGoals = () => {
  const stored = localStorage.getItem(LS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
};

export default function Goals() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [goals, setGoals] = useState(getInitialGoals());
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    note: '',
  });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showTransact, setShowTransact] = useState(false);
  const [transactType, setTransactType] = useState('deposit');
  const [transactGoal, setTransactGoal] = useState(null);
  const [transactForm, setTransactForm] = useState({ amount: '', note: '' });
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(goals));
  }, [goals]);

  const openAddModal = () => {
    setForm({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      note: '',
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (goal) => {
    setForm({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      note: goal.note,
    });
    setEditId(goal.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = (e) => {
    e.preventDefault();
    if (editId) {
      setGoals(
        goals.map((goal) =>
          goal.id === editId
            ? {
                ...goal,
                ...form,
                targetAmount: Number(form.targetAmount),
                currentAmount: Number(form.currentAmount),
              }
            : goal
        )
      );
      toast.showToast('Goal updated!', 'success');
    } else {
      setGoals([
        ...goals,
        {
          id: Date.now(),
          ...form,
          targetAmount: Number(form.targetAmount),
          currentAmount: Number(form.currentAmount),
        },
      ]);
      toast.showToast('Goal added!', 'success');
    }
    setForm({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      note: '',
    });
    setEditId(null);
    setShowModal(false);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const handleDelete = () => {
    setGoals(goals.filter((goal) => goal.id !== deleteId));
    setShowDelete(false);
    setDeleteId(null);
    toast.showToast('Goal deleted.', 'info');
  };

  const openTransactModal = (goal, type) => {
    setTransactGoal(goal);
    setTransactType(type);
    setTransactForm({ amount: '', note: '' });
    setShowTransact(true);
  };

  const handleTransactChange = (e) => {
    setTransactForm({ ...transactForm, [e.target.name]: e.target.value });
  };

  const handleTransact = (e) => {
    e.preventDefault();
    const amt = Number(transactForm.amount);
    if (!amt || amt <= 0) {
      toast.showToast('Please enter a valid amount.', 'error');
      return;
    }
    setGoals(
      goals.map((goal) => {
        if (goal.id !== transactGoal.id) return goal;
        if (transactType === 'deposit') {
          return { ...goal, currentAmount: goal.currentAmount + amt };
        } else {
          if (amt > goal.currentAmount) {
            toast.showToast('Cannot withdraw more than saved.', 'error');
            return goal;
          }
          return { ...goal, currentAmount: goal.currentAmount - amt };
        }
      })
    );
    setShowTransact(false);
    toast.showToast(
      transactType === 'deposit'
        ? 'Money added to goal!'
        : 'Money withdrawn from goal!',
      'success'
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Financial Goals</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={openAddModal}
        >
          + Add Goal
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500">
            <div className="text-5xl mb-2">🎯</div>
            <div className="mb-2 font-semibold">No goals yet</div>
            <div className="mb-4">Add your first goal to get started!</div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={openAddModal}
            >
              + Add Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const saved =
              goal.savedAmount !== undefined
                ? goal.savedAmount
                : goal.currentAmount || 0;
            const percent = Math.min(
              100,
              Math.round((saved / goal.targetAmount) * 100)
            );
            const remaining = Math.max(0, goal.targetAmount - saved);
            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-gray-900 shadow rounded-lg p-5 cursor-pointer hover:shadow-lg transition border border-gray-100 dark:border-gray-800"
                onClick={() => navigate(`/goals/${goal.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-lg">{goal.name}</div>
                  <span className="text-xs text-gray-400">
                    {goal.deadline || 'No deadline'}
                  </span>
                </div>
                <div className="mb-1 text-sm text-gray-500 dark:text-gray-300">
                  Target: ${goal.targetAmount.toLocaleString()}
                </div>
                <div className="mb-1 text-sm text-gray-500 dark:text-gray-300">
                  Saved: ${saved.toLocaleString()}
                </div>
                <div className="mb-1 text-sm text-gray-500 dark:text-gray-300">
                  Remaining: ${remaining.toLocaleString()}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 mb-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-700"
                    style={{ width: percent + '%' }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {percent}% achieved
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {goal.note || 'No note'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Deposit/Withdraw Modal */}
      {showTransact && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {transactType === 'deposit' ? 'Deposit to' : 'Withdraw from'}{' '}
              {transactGoal.name}
            </h2>
            <form onSubmit={handleTransact} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Amount</label>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={transactForm.amount}
                  onChange={handleTransactChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Note</label>
                <input
                  name="note"
                  type="text"
                  value={transactForm.note}
                  onChange={handleTransactChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Optional note"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowTransact(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${
                    transactType === 'deposit'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  {transactType === 'deposit' ? 'Deposit' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editId ? 'Edit Goal' : 'Add Goal'}
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
                  placeholder="e.g. Vacation"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Target Amount</label>
                <input
                  name="targetAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.targetAmount}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter target amount"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Current Amount</label>
                <input
                  name="currentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.currentAmount}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter current amount"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Deadline</label>
                <input
                  name="deadline"
                  type="date"
                  value={form.deadline}
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
            <h2 className="text-lg font-bold mb-4">Delete Goal</h2>
            <p>Are you sure you want to delete this goal?</p>
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
