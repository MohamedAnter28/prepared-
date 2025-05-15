import React, { useState, useEffect } from 'react';

const LS_KEY = 'userProfile';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatar: '',
    monthlyIncome: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setProfile({
        name: data.name || '',
        email: data.email || '',
        avatar: data.avatar || '',
        monthlyIncome: data.monthlyIncome || '',
      });
    }
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
        monthlyIncome: Number(profile.monthlyIncome),
      })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6 mb-6 flex items-center gap-4">
        <img
          src={
            profile.avatar ||
            'https://ui-avatars.com/api/?name=' + (profile.name || 'User')
          }
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
        />
        <div>
          <div className="text-xl font-bold mb-1">
            {profile.name || 'Your Name'}
          </div>
          <div className="text-gray-500 dark:text-gray-300 mb-1">
            {profile.email || 'your@email.com'}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
            Monthly Income:{' '}
            <span className="text-blue-600 dark:text-blue-300">
              $
              {profile.monthlyIncome
                ? Number(profile.monthlyIncome).toLocaleString()
                : '0'}
            </span>
          </div>
        </div>
      </div>
      <form
        onSubmit={handleSave}
        className="space-y-4 bg-white dark:bg-gray-900 shadow rounded-lg p-6"
      >
        <h2 className="text-lg font-bold mb-2">Edit Profile</h2>
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            name="name"
            type="text"
            value={profile.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Avatar URL</label>
          <input
            name="avatar"
            type="url"
            value={profile.avatar}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Paste image URL or leave blank for default"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Monthly Income (Salary)
          </label>
          <input
            name="monthlyIncome"
            type="number"
            min="0"
            step="0.01"
            value={profile.monthlyIncome}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your monthly income"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
        {saved && <div className="text-green-600 text-sm mt-2">Saved!</div>}
      </form>
    </div>
  );
}
