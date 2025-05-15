import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function getData(key) {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function getTotalCardBalance(cards) {
  const transactions = getData('transactions');
  return cards.reduce((sum, card) => {
    const cardTxs = transactions.filter((tx) => tx.cardId === card.id);
    let balance = 0;
    cardTxs.forEach((tx) => {
      if (tx.type === 'Deposit') balance += tx.amount;
      else if (tx.type === 'Withdrawal') balance -= tx.amount;
    });
    return sum + balance;
  }, 0);
}

function getMonthlyIncomeExpenses() {
  const transactions = getData('transactions');
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  let income = 0,
    expenses = 0;
  transactions.forEach((tx) => {
    const txDate = new Date(tx.date);
    if (txDate.getMonth() === thisMonth && txDate.getFullYear() === thisYear) {
      if (tx.type === 'Deposit') income += tx.amount;
      else if (tx.type === 'Withdrawal') expenses += tx.amount;
    }
  });
  return { income, expenses };
}

function getInvestmentTotal() {
  const investments = getData('investments');
  return investments.reduce((sum, inv) => sum + inv.amount, 0);
}

function getGoalCompletion(goals) {
  if (!goals.length) return 0;
  const percent =
    goals.reduce(
      (sum, g) => sum + Math.min(1, g.currentAmount / g.targetAmount),
      0
    ) / goals.length;
  return Math.round(percent * 100);
}

function getDebtRepayment(debts) {
  if (!debts.length) return 0;
  const percent =
    debts.reduce(
      (sum, d) => sum + Math.min(1, d.paidAmount / d.totalAmount),
      0
    ) / debts.length;
  return Math.round(percent * 100);
}

function getSpendingCategories() {
  const transactions = getData('transactions');
  const categories = {};
  transactions.forEach((tx) => {
    if (tx.type === 'Withdrawal') {
      const cat = tx.note || 'Other';
      categories[cat] = (categories[cat] || 0) + tx.amount;
    }
  });
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
}

function getRecentTransactions() {
  const transactions = getData('transactions');
  return transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
}

const COLORS = [
  '#6366f1',
  '#f59e42',
  '#10b981',
  '#ef4444',
  '#fbbf24',
  '#3b82f6',
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const [cards, setCards] = useState([]);
  const [goals, setGoals] = useState([]);
  const [debts, setDebts] = useState([]);
  const [incomeExpenses, setIncomeExpenses] = useState({
    income: 0,
    expenses: 0,
  });
  const [investmentTotal, setInvestmentTotal] = useState(0);
  const [goalCompletion, setGoalCompletion] = useState(0);
  const [debtRepayment, setDebtRepayment] = useState(0);
  const [spendingCategories, setSpendingCategories] = useState([]);
  const [recentTxs, setRecentTxs] = useState([]);

  useEffect(() => {
    const cardsData = getData('cards');
    const goalsData = getData('goals');
    const debtsData = getData('debts');
    setCards(cardsData);
    setGoals(goalsData);
    setDebts(debtsData);
    setIncomeExpenses(getMonthlyIncomeExpenses());
    setInvestmentTotal(getInvestmentTotal());
    setGoalCompletion(getGoalCompletion(goalsData));
    setDebtRepayment(getDebtRepayment(debtsData));
    setSpendingCategories(getSpendingCategories());
    setRecentTxs(getRecentTransactions());
  }, []);

  const totalBalance = getTotalCardBalance(cards);
  const chartData = [
    {
      name: 'This Month',
      Income: incomeExpenses.income,
      Expenses: incomeExpenses.expenses,
    },
  ];
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold mb-1">{getGreeting()},</h1>
          <div className="text-gray-500 dark:text-gray-300">{today}</div>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-lg shadow p-4 flex items-center min-w-[180px]">
            <span className="text-3xl mr-3">💳</span>
            <div>
              <div className="text-xs">Total Card Balance</div>
              <div className="text-xl font-bold">
                $
                {totalBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-400 text-white rounded-lg shadow p-4 flex items-center min-w-[180px]">
            <span className="text-3xl mr-3">📈</span>
            <div>
              <div className="text-xs">Investments</div>
              <div className="text-xl font-bold">
                $
                {investmentTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
          <div className="text-gray-500 mb-2">Monthly Income vs. Expenses</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Income" fill="#22c55e" />
              <Bar dataKey="Expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
          <div className="text-gray-500 mb-2">Spending by Category</div>
          {spendingCategories.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No spending data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={spendingCategories}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  label
                >
                  {spendingCategories.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
          <div className="text-gray-500 mb-2">Goal Completion</div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-5 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-5 rounded-full transition-all duration-700"
              style={{ width: goalCompletion + '%' }}
            ></div>
          </div>
          <span className="text-lg font-bold text-green-700 dark:text-green-300">
            {goalCompletion}%
          </span>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
          <div className="text-gray-500 mb-2">Debt Repayment</div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-5 mb-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-5 rounded-full transition-all duration-700"
              style={{ width: debtRepayment + '%' }}
            ></div>
          </div>
          <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
            {debtRepayment}%
          </span>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-8">
        <div className="text-gray-500 mb-2 font-semibold">Recent Activity</div>
        {recentTxs.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No recent transactions.
          </div>
        ) : (
          <ul>
            {recentTxs.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-lg ${
                      tx.type === 'Deposit' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {tx.type === 'Deposit' ? '+' : '-'}
                  </span>
                  <span className="font-semibold">${tx.amount.toFixed(2)}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {tx.note || tx.type}
                  </span>
                </div>
                <div className="text-xs text-gray-400">{tx.date}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
