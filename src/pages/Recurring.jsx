import React, { useState, useEffect } from 'react';

const TX_KEY = 'transactions';
const CARD_KEY = 'cards';

function getTransactions() {
  const stored = localStorage.getItem(TX_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

function getCards() {
  const stored = localStorage.getItem(CARD_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

// Simple recurring detection: group by (amount, cardId, type), look for 3+ transactions spaced ~monthly/weekly/daily
function detectRecurring(transactions) {
  if (!transactions.length) return [];
  const groups = {};
  transactions.forEach((tx) => {
    const key = `${tx.amount}|${tx.cardId}|${tx.type}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  const recurring = [];
  Object.values(groups).forEach((txs) => {
    if (txs.length < 3) return; // need at least 3 to detect pattern
    // Sort by date
    txs.sort((a, b) => new Date(a.date) - new Date(b.date));
    // Check intervals
    let freq = null;
    let consistent = true;
    for (let i = 1; i < txs.length; i++) {
      const prev = new Date(txs[i - 1].date);
      const curr = new Date(txs[i].date);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24); // days
      if (diff >= 27 && diff <= 31) {
        if (!freq) freq = 'monthly';
        else if (freq !== 'monthly') consistent = false;
      } else if (diff >= 6 && diff <= 8) {
        if (!freq) freq = 'weekly';
        else if (freq !== 'weekly') consistent = false;
      } else if (diff >= 0.9 && diff <= 1.1) {
        if (!freq) freq = 'daily';
        else if (freq !== 'daily') consistent = false;
      } else {
        consistent = false;
      }
    }
    if (freq && consistent) {
      const last = txs[txs.length - 1];
      recurring.push({
        name: last.note || `${last.type} $${last.amount}`,
        amount: last.amount,
        type: last.type,
        cardId: last.cardId,
        frequency: freq,
        lastDate: last.date,
        note: last.note,
      });
    }
  });
  return recurring;
}

export default function Recurring() {
  const [recurring, setRecurring] = useState([]);
  const [cards, setCards] = useState(getCards());

  useEffect(() => {
    const txs = getTransactions();
    setRecurring(detectRecurring(txs));
  }, []);

  useEffect(() => {
    setCards(getCards());
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">
        Detected Recurring Transactions
      </h1>
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        {recurring.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No recurring patterns detected yet.
            <br />
            (Recurring transactions will appear here automatically when detected
            from your transaction history.)
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-left py-2 px-2">Amount</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-left py-2 px-2">Card</th>
                <th className="text-left py-2 px-2">Frequency</th>
                <th className="text-left py-2 px-2">Last Occurrence</th>
                <th className="text-left py-2 px-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {recurring.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 px-2">{r.name}</td>
                  <td className="py-2 px-2">${r.amount.toLocaleString()}</td>
                  <td className="py-2 px-2">{r.type}</td>
                  <td className="py-2 px-2">
                    {cards.find((c) => c.id === r.cardId)?.nickname ||
                      'Unknown'}
                  </td>
                  <td className="py-2 px-2">{r.frequency}</td>
                  <td className="py-2 px-2">{r.lastDate}</td>
                  <td className="py-2 px-2">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
