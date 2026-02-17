'use client';

import { ArrowPathIcon, ShareIcon } from '@heroicons/react/24/outline';

const TypingResultsModal = ({ isOpen, stats, session, onRestart, onClose, theme = 'dark' }) => {
  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'} animate-zoom-in`}>
        {/* Header Title and Subtitle */}
        <div className={`p-8 text-center border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
          <h2 className={`text-4xl font-bold mb-3 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Your Results</h2>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            {session ? 'Score saved to leaderboard!' : 'Great job! Sign in to save your score.'}
          </p>
        </div>

        {/* Main Content */}
        <div className={`p-8 space-y-6 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          {/* Sign In Prompt */}
          {!session && (
            <div className={`text-center py-8 px-6 rounded-xl border-2 ${theme === 'dark' ? 'border-yellow-500/40 bg-yellow-900/20' : 'border-yellow-300 bg-yellow-50'}`}>
              <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-yellow-500' : 'text-yellow-600'}`}>👤</div>
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Please Sign In</h3>
              <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Your score will be saved when you sign in to your account.</p>
            </div>
          )}

          {session && (
            <div className={`text-center py-4 px-6 rounded-lg border ${theme === 'dark' ? 'border-emerald-500/30 bg-emerald-900/20' : 'border-emerald-300 bg-emerald-50'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>✓ Logged in as <span className="font-semibold">{session.user.name || session.user.email}</span></p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 mt-8">
            {/* WPM */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-700/40 border border-slate-600' : 'bg-slate-100 border border-slate-300'}`}>
              <p className={`text-5xl font-black mb-2 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {stats.wpm}
              </p>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Words Per Minute</p>
            </div>

            {/* Accuracy */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-700/40 border border-slate-600' : 'bg-slate-100 border border-slate-300'}`}>
              <p className={`text-5xl font-black mb-2 ${stats.accuracy >= 95 ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') : stats.accuracy >= 90 ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') : stats.accuracy >= 85 ? (theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600') : (theme === 'dark' ? 'text-red-400' : 'text-red-600')}`}>
                {stats.accuracy}%
              </p>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Accuracy Rate</p>
            </div>
          </div>
        </div>

        {/* Actions - Only Try Again Button */}
        <div className={`p-6 border-t ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-100 border-slate-200'} flex justify-center`}>
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-zoom-in {
          animation: zoomIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TypingResultsModal;
