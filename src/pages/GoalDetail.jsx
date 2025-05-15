import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const LS_KEY = 'goals';
const HISTORY_KEY = 'goalHistory';
const CARD_KEY = 'cards';

function getGoalById(id) {
  const stored = localStorage.getItem(LS_KEY);
  if (!stored) return null;
  const goals = JSON.parse(stored);
  return goals.find((g) => String(g.id) === String(id));
}

function getHistory(id) {
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  return JSON.parse(stored).filter((h) => String(h.goalId) === String(id));
}

function addHistory(id, type, amount, note, status) {
  const stored = localStorage.getItem(HISTORY_KEY);
  const arr = stored ? JSON.parse(stored) : [];
  arr.unshift({
    id: Date.now(),
    goalId: id,
    type,
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

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [goal, setGoal] = useState(null);
  const [history, setHistory] = useState([]);
  const [showTransact, setShowTransact] = useState(false);
  const [transactType, setTransactType] = useState('deposit');
  const [transactForm, setTransactForm] = useState({ amount: '', note: '' });
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');

  useEffect(() => {
    setGoal(getGoalById(id));
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
    setGoal(getGoalById(id));
    setHistory(getHistory(id));
  };

  const handleTransact = (e) => {
    e.preventDefault();
    const amt = Number(transactForm.amount);
    if (!amt || amt <= 0) {
      toast.showToast('Please enter a valid amount.', 'error');
      addHistory(
        id,
        transactType === 'deposit' ? 'Deposit' : 'Withdraw',
        amt,
        transactForm.note +
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
      addHistory(
        id,
        transactType === 'deposit' ? 'Deposit' : 'Withdraw',
        amt,
        transactForm.note,
        'failed'
      );
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
      addHistory(
        id,
        transactType === 'deposit' ? 'Deposit' : 'Withdraw',
        amt,
        transactForm.note,
        'failed'
      );
      return;
    }
    if (transactType === 'deposit' || transactType === 'withdraw') {
      if (amt > card.balance) {
        toast.showToast('Not enough funds on selected card.', 'error');
        addHistory(
          id,
          transactType === 'deposit' ? 'Deposit' : 'Withdraw',
          amt,
          transactForm.note + ` (from ${card.name})`,
          'failed'
        );
        return;
      }
    }
    let updated = { ...goal };
    if (transactType === 'deposit') {
      card.balance -= amt;
      cardList[cardIdx] = card;
      localStorage.setItem(CARD_KEY, JSON.stringify(cardList));
      updated.savedAmount =
        (updated.savedAmount !== undefined
          ? updated.savedAmount
          : updated.currentAmount || 0) + amt;
      addHistory(
        id,
        'Deposit',
        amt,
        transactForm.note + ` (from ${card.name})`,
        'success'
      );
      addRecentActivity({
        type: 'Goal Deposit',
        amount: amt,
        note: transactForm.note,
        date: new Date().toISOString(),
        name: goal.name,
        card: card.name,
      });
    } else {
      if (amt > saved) {
        toast.showToast('Cannot withdraw more than saved.', 'error');
        addHistory(
          id,
          'Withdraw',
          amt,
          transactForm.note + ` (from ${card.name})`,
          'failed'
        );
        return;
      }
      card.balance -= amt;
      cardList[cardIdx] = card;
      localStorage.setItem(CARD_KEY, JSON.stringify(cardList));
      updated.savedAmount =
        (updated.savedAmount !== undefined
          ? updated.savedAmount
          : updated.currentAmount || 0) - amt;
      addHistory(
        id,
        'Withdraw',
        amt,
        transactForm.note + ` (from ${card.name})`,
        'success'
      );
      addRecentActivity({
        type: 'Goal Withdraw',
        amount: amt,
        note: transactForm.note,
        date: new Date().toISOString(),
        name: goal.name,
        card: card.name,
      });
    }
    // Update goal in localStorage
    const stored = localStorage.getItem(LS_KEY);
    const arr = stored ? JSON.parse(stored) : [];
    const idx = arr.findIndex((g) => String(g.id) === String(id));
    arr[idx] = updated;
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
    setShowTransact(false);
    setTransactForm({ amount: '', note: '' });
    toast.showToast(
      transactType === 'deposit'
        ? 'Money added to goal!'
        : 'Money withdrawn from goal!',
      'success'
    );
    refresh();
  };

  if (!goal) {
    return (
      <div className="text-center py-12 text-gray-400">Goal not found.</div>
    );
  }
  // Use savedAmount if present, else fallback to currentAmount for backward compatibility
  const saved =
    goal.savedAmount !== undefined ? goal.savedAmount : goal.currentAmount || 0;
  const target = goal.targetAmount || 0;
  const remaining = Math.max(0, target - saved);
  const percent =
    target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;

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
          <div className="font-bold text-xl">{goal.name}</div>
          <span className="text-xs text-gray-400">
            Deadline: {goal.deadline || 'N/A'}
          </span>
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Target: ${target.toLocaleString()}
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Saved: ${saved.toLocaleString()}
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Remaining: ${remaining.toLocaleString()}
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Note: {goal.note || 'N/A'}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 mb-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-700"
            style={{ width: percent + '%' }}
          ></div>
        </div>
        <div className="text-xs text-gray-400 mb-2">{percent}% achieved</div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            onClick={() => {
              setShowTransact(true);
              setTransactType('deposit');
            }}
          >
            Deposit
          </button>
          <button
            className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
            onClick={() => {
              setShowTransact(true);
              setTransactType('withdraw');
            }}
          >
            Withdraw
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <div className="font-semibold mb-2">History</div>
        {history.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No transactions yet.
          </div>
        ) : (
          <ul>
            {history.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg ${
                      h.type === 'Deposit'
                        ? 'text-green-500'
                        : 'text-yellow-500'
                    }`}
                  >
                    {h.type === 'Deposit' ? '+' : '-'}
                  </span>
                  <span className="font-semibold">${h.amount.toFixed(2)}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {h.note || h.type}
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

      {/* Deposit/Withdraw Modal */}
      {showTransact && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {transactType === 'deposit' ? 'Deposit to' : 'Withdraw from'}{' '}
              {goal.name}
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
                  onChange={(e) =>
                    setTransactForm({ ...transactForm, amount: e.target.value })
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
                  value={transactForm.note}
                  onChange={(e) =>
                    setTransactForm({ ...transactForm, note: e.target.value })
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
    </div>
  );
}
