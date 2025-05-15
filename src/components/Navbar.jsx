import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Cards', path: '/cards' },
  { name: 'Transactions', path: '/transactions' },
  { name: 'Investments', path: '/investments' },
  { name: 'Goals', path: '/goals' },
  { name: 'Debts', path: '/debts' },
];

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', dark);
  }, [dark]);

  return [dark, setDark];
}

export default function Navbar() {
  const [dark, setDark] = useDarkMode();
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-white dark:bg-gray-900 shadow sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold text-blue-600 dark:text-blue-300">
          Prepaid Finance
        </div>
        <div className="md:hidden flex items-center">
          <button
            className="text-2xl text-gray-700 dark:text-gray-200 focus:outline-none mr-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? '✖' : '☰'}
          </button>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-800'
                }`
              }
              end={item.path === '/'}
            >
              {item.name}
            </NavLink>
          ))}
          <NavLink
            to="/recurring"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-800'
              }`
            }
          >
            Recurring
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-800'
              }`
            }
          >
            Profile
          </NavLink>
          <button
            className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            onClick={() => setDark((d) => !d)}
            title="Toggle dark mode"
          >
            {dark ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 pb-4">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`
                }
                end={item.path === '/'}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
            <NavLink
              to="/recurring"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-800'
                }`
              }
              onClick={() => setOpen(false)}
            >
              Recurring
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-800'
                }`
              }
              onClick={() => setOpen(false)}
            >
              Profile
            </NavLink>
            <button
              className="w-full mt-2 px-3 py-2 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              onClick={() => {
                setDark((d) => !d);
                setOpen(false);
              }}
              title="Toggle dark mode"
            >
              {dark ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
