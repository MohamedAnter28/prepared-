import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const LS_KEY = 'debts';
const HISTORY_KEY = 'debtHistory';
const CARD_KEY = 'cards';

function getDebtById(id) {
  const stored = localStorage.getItem(LS_KEY);
  if (!stored) return null;
  const debts = JSON.parse(stored);
  console.log('[DebtDetail] debts from localStorage:', debts); // DEBUG
  const found = debts.find((d) => String(d.id) === String(id));
  console.log('[DebtDetail] searching for id:', id, 'found:', found); // DEBUG
  return found;
}

function getHistory(id) {
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  return JSON.parse(stored).filter((h) => String(h.debtId) === String(id));
}

function addHistory(id, amount, note, status) {
  const stored = localStorage.getItem(HISTORY_KEY);
  const arr = stored ? JSON.parse(stored) : [];
  arr.unshift({
    id: Date.now(),
    debtId: id,
    amount: Number(amount),
    note,
    date: new Date().toISOString().slice(0, 10),
    status,
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
}

function addRecentActivity(entry) {
  const stored = localStorage.getItem('recentActivity');
  const arr = stored ? JSON.parse(stored) : [];
  arr.unshift(entry);
  // Keep only the latest 20
  localStorage.setItem('recentActivity', JSON.stringify(arr.slice(0, 20)));
}

export default function DebtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [debt, setDebt] = useState(null);
  const [history, setHistory] = useState([]);
  const [showRepay, setShowRepay] = useState(false);
  const [repayForm, setRepayForm] = useState({ amount: '', note: '' });
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');

  useEffect(() => {
    setDebt(getDebtById(id));
    setHistory(getHistory(id));
    // Fetch cards
    const storedCards = localStorage.getItem(CARD_KEY);
    if (storedCards) {
      const parsed = JSON.parse(storedCards);
      setCards(parsed);
      if (parsed.length === 1) setSelectedCardId(String(parsed[0].id));
    }
  }, [id]);

  const refresh = () => {
    setDebt(getDebtById(id));
    setHistory(getHistory(id));
  };

  const handleRepay = (e) => {
    e.preventDefault();
    const amt = Number(repayForm.amount);
    if (!amt || amt <= 0) {
      toast.showToast('Please enter a valid amount.', 'error');
      addHistory(
        id,
        amt,
        repayForm.note +
          (selectedCardId
            ? ` (from ${
                cards.find((c) => String(c.id) === String(selectedCardId))
                  ?.name || ''
              })`
            : ''),
        'failed'
      );
      return;
    }
    if (!selectedCardId) {
      toast.showToast('Please select a card.', 'error');
      addHistory(id, amt, repayForm.note, 'failed');
      return;
    }
    // Find selected card
    const cardArr = localStorage.getItem(CARD_KEY);
    const cardList = cardArr ? JSON.parse(cardArr) : [];
    const cardIdx = cardList.findIndex(
      (c) => String(c.id) === String(selectedCardId)
    );
    const card = cardList[cardIdx];
    if (!card) {
      toast.showToast('Card not found.', 'error');
      addHistory(id, amt, repayForm.note, 'failed');
      return;
    }
    if (amt > card.balance) {
      toast.showToast('Not enough funds on selected card.', 'error');
      addHistory(id, amt, repayForm.note + ` (from ${card.name})`, 'failed');
      return;
    }
    if (amt > remaining) {
      toast.showToast('Cannot repay more than owed.', 'error');
      addHistory(id, amt, repayForm.note + ` (from ${card.name})`, 'failed');
      return;
    }
    card.balance -= amt;
    cardList[cardIdx] = card;
    localStorage.setItem(CARD_KEY, JSON.stringify(cardList));
    let updated = { ...debt };
    updated.paidAmount = (updated.paidAmount || 0) + amt;
    addHistory(id, amt, repayForm.note + ` (from ${card.name})`, 'success');
    addRecentActivity({
      type: 'Debt Repayment',
      amount: amt,
      note: repayForm.note,
      date: new Date().toISOString(),
      name: debt.name,
      card: card.name,
    });
    // Update debt in localStorage
    const stored = localStorage.getItem(LS_KEY);
    const arr = stored ? JSON.parse(stored) : [];
    const idx = arr.findIndex((d) => String(d.id) === String(id));
    arr[idx] = updated;
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
    setShowRepay(false);
    setRepayForm({ amount: '', note: '' });
    toast.showToast('Debt repaid!', 'success');
    refresh();
  };

  if (!debt) {
    return (
      <div className="text-center py-12 text-gray-400">
        Debt not found for id: <span className="font-mono">{id}</span>.<br />
        Please check your debts list or add a new debt.
        <br />
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate('/debts')}
        >
          Go to Debts List
        </button>
      </div>
    );
  }
  const paid = debt.paidAmount || 0;
  const total = debt.totalAmount || 0;
  const remaining = Math.max(0, total - paid);
  const percent = total > 0 ? Math.round((paid / total) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        className="mb-4 text-blue-600 hover:underline"
        onClick={() => navigate(-1)}
      >
        &larr; Back
      </button>
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-xl">{debt.name}</div>
          <span className="text-xs text-gray-400">
            Creditor: {debt.creditor || 'N/A'}
          </span>
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Total Owed: ${total.toLocaleString()}
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Paid: ${paid.toLocaleString()}
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Remaining: ${remaining.toLocaleString()}
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Note: {debt.note || 'N/A'}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 mb-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-700"
            style={{ width: percent + '%' }}
          ></div>
        </div>
        <div className="text-xs text-gray-400 mb-2">{percent}% repaid</div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setShowRepay(true)}
          >
            Repay
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <div className="font-semibold mb-2">Repayment History</div>
        {history.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No repayments yet.
          </div>
        ) : (
          <ul>
            {history.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg text-blue-500">-</span>
                  <span className="font-semibold">${h.amount.toFixed(2)}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {h.note || 'Repayment'}
                  </span>
                  <span
                    className={`ml-2 text-xs font-semibold rounded px-2 py-0.5 ${
                      h.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {h.status === 'success' ? 'Success' : 'Failed'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{h.date}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Repay Modal */}
      {showRepay && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Repay {debt.name}</h2>
            <form onSubmit={handleRepay} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Amount</label>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={repayForm.amount}
                  onChange={(e) =>
                    setRepayForm({ ...repayForm, amount: e.target.value })
                  }
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
                  value={repayForm.note}
                  onChange={(e) =>
                    setRepayForm({ ...repayForm, note: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  placeholder="Optional note"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Pay with Card</label>
                {cards.length === 0 ? (
                  <div className="text-red-500">No cards available.</div>
                ) : cards.length === 1 ? (
                  <div className="font-semibold">
                    {cards[0].name} (Balance: $
                    {(typeof cards[0].balance === 'number'
                      ? cards[0].balance
                      : 0
                    ).toLocaleString()}
                    )
                  </div>
                ) : (
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    required
                  >
                    <option value="">Select card</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name} (Balance: $
                        {(typeof card.balance === 'number'
                          ? card.balance
                          : 0
                        ).toLocaleString()}
                        )
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowRepay(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
                >
                  Repay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
