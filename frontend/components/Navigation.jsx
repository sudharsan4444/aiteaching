
import React from 'react';

const Navigation = ({ user, onLogout }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <i className="fas fa-graduation-cap text-lg"></i>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">AI Teaching Assistant</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-slate-700">{user.name}</span>
            <span className="text-xs text-indigo-600 font-semibold">{user.role}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
