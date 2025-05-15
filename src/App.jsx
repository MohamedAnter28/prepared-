import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Cards from './pages/Cards';
import Transactions from './pages/Transactions';
import Investments from './pages/Investments';
import Goals from './pages/Goals';
import Debts from './pages/Debts';
import DebtDetail from './pages/DebtDetail';
import GoalDetail from './pages/GoalDetail';
import { ToastProvider } from './components/Toast';
import Profile from './pages/Profile';
import InvestmentDetail from './pages/InvestmentDetail';
import Recurring from './pages/Recurring';

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/investments/:id" element={<InvestmentDetail />} />
            <Route path="/recurring" element={<Recurring />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/goals/:id" element={<GoalDetail />} />
            <Route path="/debts" element={<Debts />} />
            <Route path="/debts/:id" element={<DebtDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
