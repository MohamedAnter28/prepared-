import React, { useState, useEffect } from 'react';

const LS_KEY = 'transactions';
const CARD_KEY = 'cards';

const getInitialTransactions = () => {
  const stored = localStorage.getItem(LS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
};

const getCards = () => {
  const stored = localStorage.getItem(CARD_KEY);
  if (stored) return JSON.parse(stored);
  return [];
};

export default function Transactions() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [transactions, setTransactions] = useState(getInitialTransactions());
  const [form, setForm] = useState({
    cardId: '',
    type: '',
    amount: '',
    date: '',
    note: '',
  });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filterCard, setFilterCard] = useState('');
  const [cards, setCards] = useState(getCards());

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    setCards(getCards());
  }, []);

  const openAddModal = () => {
    setForm({ cardId: '', type: '', amount: '', date: '', note: '' });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (tx) => {
    setForm({
      cardId: tx.cardId,
      type: tx.type,
      amount: tx.amount,
      date: tx.date,
      note: tx.note,
    });
    setEditId(tx.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = (e) => {
    e.preventDefault();
    if (editId) {
      setTransactions(
        transactions.map((tx) =>
          tx.id === editId
            ? {
                ...tx,
                ...form,
                amount: Number(form.amount),
                cardId: Number(form.cardId),
              }
            : tx
        )
      );
    } else {
      setTransactions([
        ...transactions,
        {
          id: Date.now(),
          ...form,
          amount: Number(form.amount),
          cardId: Number(form.cardId),
        },
      ]);
    }
    setForm({ cardId: '', type: '', amount: '', date: '', note: '' });
    setEditId(null);
    setShowModal(false);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const handleDelete = () => {
    setTransactions(transactions.filter((tx) => tx.id !== deleteId));
    setShowDelete(false);
    setDeleteId(null);
  };

  const filteredTxs = filterCard
    ? transactions.filter((tx) => String(tx.cardId) === filterCard)
    : transactions;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={openAddModal}
        >
          + Add Transaction
        </button>
      </div>
      <div className="mb-4 flex items-center space-x-2">
        <label className="font-medium">Filter by Card:</label>
        <select
          className="border rounded px-2 py-1"
          value={filterCard}
          onChange={(e) => setFilterCard(e.target.value)}
        >
          <option value="">All</option>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.nickname || card.number}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left py-2 px-2">Card</th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-left py-2 px-2">Amount</th>
              <th className="text-left py-2 px-2">Date</th>
              <th className="text-left py-2 px-2">Note</th>
              <th className="text-left py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxs.map((tx) => (
              <tr key={tx.id} className="border-t">
                <td className="py-2 px-2">
                  {cards.find((c) => c.id === tx.cardId)?.nickname || 'Unknown'}
                </td>
                <td className="py-2 px-2">{tx.type}</td>
                <td className="py-2 px-2">${tx.amount.toFixed(2)}</td>
                <td className="py-2 px-2">{tx.date}</td>
                <td className="py-2 px-2">{tx.note}</td>
                <td className="py-2 px-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      tx.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {tx.status === 'failed' ? 'Failed' : 'Succeeded'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No add/edit modal: view-only */}

      {/* Delete Confirmation */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Delete Transaction</h2>
            <p>Are you sure you want to delete this transaction?</p>
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
