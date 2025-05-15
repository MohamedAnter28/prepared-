import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';

const LS_KEY = 'cards';
const TX_KEY = 'transactions';

const getInitialCards = () => {
  const stored = localStorage.getItem(LS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
};

function addDepositTransaction(cardId, amount, note) {
  const stored = localStorage.getItem(TX_KEY);
  const txs = stored ? JSON.parse(stored) : [];
  txs.push({
    id: Date.now(),
    cardId,
    type: 'Deposit',
    amount: Number(amount),
    date: new Date().toISOString().slice(0, 10),
    note: note || 'Manual deposit',
  });
  localStorage.setItem(TX_KEY, JSON.stringify(txs));
}

function detectCardType(number) {
function detectCardType(number) {
  if (/^4[0-9]{12,15}$/.test(number)) return 'Visa';
  if (/^5[1-5][0-9]{14}$|^2(2[2-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[01][0-9]{13}|720[0-9]{12})$/.test(number)) return 'MasterCard';
  if (/^3[47][0-9]{13}$/.test(number)) return 'American Express';
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(number)) return 'Discover';
  if (/^35(2[89]|[3-8][0-9])[0-9]{12}$/.test(number)) return 'JCB';
  if (/^(5018|5020|5038|6304|6759|6761|6763)[0-9]{8,15}$/.test(number)) return 'MEZA';
  return 'Unknown';
}

function getCardLogo(type) {
  if (type === 'Visa')
    return <span className="text-blue-600 font-bold">VISA</span>;
  if (type === 'MasterCard')
    return <span className="text-yellow-500 font-bold">MC</span>;
  if (type === 'American Express')
    return <span className="text-indigo-600 font-bold">AMEX</span>;
  if (type === 'Discover')
    return <span className="text-orange-500 font-bold">DISC</span>;
  if (type === 'JCB')
    return <span className="text-green-500 font-bold">JCB</span>;
  if (type === 'Maestro')
    return <span className="text-red-600 font-bold">MEZA</span>;
  return <span className="text-gray-400 font-bold">?</span>;
}

function getCardMonthlySpending(cardId) {
  const stored = localStorage.getItem(TX_KEY);
  const txs = stored ? JSON.parse(stored) : [];
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  return txs
    .filter(
      (tx) =>
        tx.cardId === cardId &&
        tx.type === 'Withdrawal' &&
        new Date(tx.date).getMonth() === thisMonth &&
        new Date(tx.date).getFullYear() === thisYear
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export default function Cards() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [cards, setCards] = useState(getInitialCards());
  const [form, setForm] = useState({
    type: '',
    number: '',
    nickname: '',
    monthlyBudget: '',
  });
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addMoneyCard, setAddMoneyCard] = useState(null);
  const [addMoneyForm, setAddMoneyForm] = useState({ amount: '', note: '' });
  const [detectedType, setDetectedType] = useState('Unknown');
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    setDetectedType(detectCardType(form.number));
    setForm((f) => ({ ...f, type: detectCardType(form.number) }));
    // eslint-disable-next-line
  }, [form.number]);

  const openAddModal = () => {
    setForm({ type: '', number: '', nickname: '', monthlyBudget: '' });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (card) => {
    setForm({
      type: card.type,
      number: card.number.replace(/\D/g, ''),
      nickname: card.nickname,
      monthlyBudget: card.monthlyBudget || '',
    });
    setEditId(card.id);
    setShowEditConfirm(true);
    setPendingEdit(card.id);
  };

  const confirmEdit = () => {
    setShowModal(true);
    setShowEditConfirm(false);
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowEditConfirm(false);
    setPendingEdit(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEditCard = (e) => {
    e.preventDefault();
    // Validate card number for detected type
    const number = form.number;
    const type = detectCardType(number);
    if (type === 'Unknown') {
      toast.showToast(
        'Please enter a valid Visa or MasterCard number.',
        'error'
      );
      return;
    }
    if (type === 'Visa' && !/^4[0-9]{12,15}$/.test(number)) {
      toast.showToast(
        'Visa card numbers must be 13-16 digits and start with 4.',
        'error'
      );
      return;
    }
    if (
      type === 'MasterCard' &&
      !/^5[1-5][0-9]{14}$|^2(2[2-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[01][0-9]{13}|720[0-9]{12})$/.test(
        number
      )
    ) {
      toast.showToast(
        'MasterCard numbers must be 16 digits and start with 51-55 or 2221-2720.',
        'error'
      );
      return;
    }
    if (
      form.monthlyBudget &&
      (isNaN(form.monthlyBudget) || Number(form.monthlyBudget) < 0)
    ) {
      toast.showToast('Monthly budget must be a positive number.', 'error');
      return;
    }
    if (editId) {
      setCards(
        cards.map((card) =>
          card.id === editId
            ? {
                ...card,
                type,
                number: '**** **** **** ' + number.slice(-4),
                nickname: form.nickname,
                monthlyBudget: form.monthlyBudget
                  ? Number(form.monthlyBudget)
                  : undefined,
              }
            : card
        )
      );
      toast.showToast('Card updated successfully!', 'success');
    } else {
      setCards([
        ...cards,
        {
          id: Date.now(),
          type,
          number: '**** **** **** ' + number.slice(-4),
          nickname: form.nickname,
          monthlyBudget: form.monthlyBudget
            ? Number(form.monthlyBudget)
            : undefined,
        },
      ]);
      toast.showToast('Card added successfully!', 'success');
    }
    setForm({ type: '', number: '', nickname: '', monthlyBudget: '' });
    setEditId(null);
    setShowModal(false);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const handleDelete = () => {
    setCards(cards.filter((card) => card.id !== deleteId));
    setShowDelete(false);
    toast.showToast('Card deleted.', 'info');
    setDeleteId(null);
  };

  const openAddMoneyModal = (card) => {
    setAddMoneyCard(card);
    setAddMoneyForm({ amount: '', note: '' });
    setShowAddMoney(true);
  };

  const handleAddMoneyChange = (e) => {
    setAddMoneyForm({ ...addMoneyForm, [e.target.name]: e.target.value });
  };

  const handleAddMoney = (e) => {
    e.preventDefault();
    if (
      !addMoneyForm.amount ||
      isNaN(addMoneyForm.amount) ||
      Number(addMoneyForm.amount) <= 0
    ) {
      toast.showToast('Please enter a valid amount.', 'error');
      return;
    }
    addDepositTransaction(
      addMoneyCard.id,
      addMoneyForm.amount,
      addMoneyForm.note
    );
    setShowAddMoney(false);
    toast.showToast('Money added to card!', 'success');
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-2xl font-bold">Cards</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={openAddModal}
        >
          + Add Card
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 col-span-full">
            <div className="text-5xl mb-2">💳</div>
            <div className="mb-2 font-semibold">No cards yet</div>
            <div className="mb-4">Add your first card to get started!</div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={openAddModal}
            >
              + Add Card
            </button>
          </div>
        ) : (
          cards.map((card) => {
            const spending = getCardMonthlySpending(card.id);
            const budget = card.monthlyBudget || 0;
            const percent = budget
              ? Math.min(100, Math.round((spending / budget) * 100))
              : 0;
            const over = budget && spending > budget;
            return (
              <div
                key={card.id}
                className={`bg-white dark:bg-gray-900 shadow rounded-lg p-4 flex flex-col gap-2 border ${
                  over ? 'border-red-500' : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getCardLogo(card.type)}
                  <span className="ml-1 font-semibold text-lg">
                    {card.nickname}
                  </span>
                  <span className="ml-auto text-xs text-gray-400">
                    {card.number}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Monthly Budget:</span>
                  <span className="font-semibold">
                    {budget ? `$${budget}` : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Spent this month:
                  </span>
                  <span
                    className={`font-semibold ${over ? 'text-red-500' : ''}`}
                  >{`$${spending}`}</span>
                </div>
                {budget ? (
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded h-2 mt-1">
                    <div
                      className={`h-2 rounded ${
                        over
                          ? 'bg-red-500'
                          : percent > 80
                          ? 'bg-yellow-400'
                          : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (spending / budget) * 100)}%`,
                      }}
                    ></div>
                  </div>
                ) : null}
                {over && (
                  <div className="text-xs text-red-500 font-semibold mt-1">
                    Over budget!
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    className="px-3 py-1 rounded bg-yellow-400 text-white hover:bg-yellow-500"
                    onClick={() => openEditModal(card)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                    onClick={() => openAddMoneyModal(card)}
                  >
                    Add Money
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                    onClick={() => confirmDelete(card.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Add Money to {addMoneyCard.nickname || addMoneyCard.number}
            </h2>
            <form onSubmit={handleAddMoney} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Amount</label>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={addMoneyForm.amount}
                  onChange={handleAddMoneyChange}
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
                  value={addMoneyForm.note}
                  onChange={handleAddMoneyChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Optional note"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowAddMoney(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Add Money
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Confirmation Dialog */}
      {showEditConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Edit Card</h2>
            <p>Are you sure you want to edit this card?</p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={cancelEdit}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-yellow-400 text-white hover:bg-yellow-500"
                onClick={confirmEdit}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editId ? 'Edit Card' : 'Add New Card'}
            </h2>
            <form onSubmit={handleAddOrEditCard} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Card Number</label>
                <div className="flex items-center gap-2">
                  <input
                    name="number"
                    type="text"
                    maxLength={16}
                    minLength={12}
                    pattern="[0-9]{12,16}"
                    value={form.number}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter card number"
                    required
                  />
                  <span>{getCardLogo(detectedType)}</span>
                </div>
                <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  Detected: {detectedType}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Nickname</label>
                <input
                  name="nickname"
                  type="text"
                  value={form.nickname}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Travel Card"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Monthly Budget Limit
                </label>
                <input
                  name="monthlyBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthlyBudget}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. 1000"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Leave blank for no limit
                </div>
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
                  {editId ? 'Update Card' : 'Add Card'}
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
            <h2 className="text-lg font-bold mb-4">Delete Card</h2>
            <p>Are you sure you want to delete this card?</p>
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
