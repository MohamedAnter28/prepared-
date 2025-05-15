import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const LS_KEY = 'investments';

function getInvestmentById(id) {
  const stored = localStorage.getItem(LS_KEY);
  if (!stored) return null;
  const investments = JSON.parse(stored);
  return investments.find((inv) => String(inv.id) === String(id));
}

export default function InvestmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);

  useEffect(() => {
    setInvestment(getInvestmentById(id));
  }, [id]);

  if (!investment) {
    return (
      <div className="text-center py-12 text-gray-400">
        Investment not found.
      </div>
    );
  }

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
          <div className="font-bold text-xl">{investment.name}</div>
          <span className="text-xs text-gray-400">
            Maturity: {investment.maturityDate || 'N/A'}
          </span>
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Amount: ${investment.amount.toLocaleString()}
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Interest Rate: {investment.interestRate}%
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Monthly Income: $
          {investment.monthlyIncome
            ? investment.monthlyIncome.toLocaleString()
            : '0'}
        </div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-300">
          Note: {investment.note || 'N/A'}
        </div>
      </div>
    </div>
  );
}
