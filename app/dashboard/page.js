'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import SuccessModal from '../components/SuccessModal';
import NavBar from '../components/Navbar';
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  CameraIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme, mounted } = useTheme();
  const [userData, setUserData] = useState(null);
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    avgWpm: 0,
    avgAccuracy: 0,
    bestWpm: 0,
    latestWpm: 0,
    latestAccuracy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    username: '',
    gender: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      setShowSuccessModal(true);
      // Clear the query parameter after showing the message
      setTimeout(() => {
        router.replace('/dashboard', undefined, { shallow: true });
      }, 3000);
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scoresRes = await fetch(`/api/scores?userId=${session.user.id}`);
        const response = await scoresRes.json();
        const scoresData = response.data || [];
        setScores(scoresData);

        // Calculate stats
        if (scoresData.length > 0) {
          const totalTests = scoresData.length;
          const avgWpm =
            scoresData.reduce((sum, score) => sum + score.wpm, 0) / totalTests;
          const avgAccuracy =
            scoresData.reduce((sum, score) => sum + score.accuracy, 0) /
            totalTests;
          const bestWpm = Math.max(...scoresData.map((s) => s.wpm));

          // Sort scores by date (most recent first)
          const sortedScores = scoresData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          const latestScore = sortedScores[0];

          setStats({
            totalTests,
            avgWpm: Math.round(avgWpm),
            avgAccuracy: Math.round(avgAccuracy * 100) / 100,
            bestWpm,
            latestWpm: latestScore?.wpm || 0,
            latestAccuracy: latestScore ? Math.round(latestScore.accuracy * 100) / 100 : 0,
          });
        }

        // Fetch user data
        const userRes = await fetch('/api/user');
        const userResponse = await userRes.json();
        if (userResponse.data) {
          setUserData(userResponse.data);
          setProfileImage(userResponse.data.image);
          setSettingsForm({
            username: userResponse.data.username || '',
            gender: userResponse.data.gender || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      if (!userData) {
        setUserData(session.user);
      }
      fetchData();
    }
  }, [session]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 2MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: settingsForm.username,
          gender: settingsForm.gender,
          image: profileImage,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setUserData(data.data);
        setTimeout(() => setShowSettings(false), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Login Successful!"
        message="Welcome to your dashboard. You're now logged in and ready to start typing!"
        buttonText="Let's Start"
      />
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
        <NavBar />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 transition-colors duration-300 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white shadow-xl'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${isDark ? 'border-emerald-500' : 'border-emerald-400'}`}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-emerald-600 to-emerald-400' : 'bg-gradient-to-br from-emerald-500 to-emerald-300'}`}>
                      <UserIcon className={`w-12 h-12 ${isDark ? 'text-slate-900' : 'text-white'}`} />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`absolute bottom-0 right-0 p-2 rounded-full transition ${isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Click camera to upload photo</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Username</label>
                <input
                  type="text"
                  value={settingsForm.username}
                  onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border transition ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 focus:border-emerald-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-500'} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Gender</label>
                <select
                  value={settingsForm.gender}
                  onChange={(e) => setSettingsForm({ ...settingsForm, gender: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border transition ${isDark ? 'bg-slate-700 border-slate-600 text-slate-100 focus:border-emerald-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-500'} focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  value={userData?.email || ''}
                  disabled
                  className={`w-full px-4 py-2 rounded-lg border transition cursor-not-allowed ${isDark ? 'bg-slate-800 border-slate-600 text-slate-400' : 'bg-gray-100 border-gray-200 text-gray-500'}`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Email cannot be changed</p>
              </div>

              {/* Theme Toggle in Settings */}
              <div className="flex items-center justify-between py-2">
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Dark Mode</span>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isDark ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {message.text}
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-slate-900' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} disabled:opacity-50`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className={`text-4xl font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
            Welcome back, {userData?.username || userData?.name || userData?.email}! 👋
          </h2>
          <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>Track your typing progress and improve your speed</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {/* Total Tests */}
          <div className={`backdrop-blur-md border rounded-lg p-6 transition hover:border-emerald-500/50 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Tests</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stats.totalTests}</p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-emerald-500 opacity-30" />
            </div>
          </div>

          {/* Average WPM */}
          <div className={`backdrop-blur-md border rounded-lg p-6 transition hover:border-emerald-500/50 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Avg Speed</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stats.avgWpm}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>WPM</p>
              </div>
              <SparklesIcon className="w-12 h-12 text-emerald-500 opacity-30" />
            </div>
          </div>

          {/* Best WPM */}
          <div className={`backdrop-blur-md border rounded-lg p-6 transition hover:border-emerald-500/50 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Best Speed</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stats.bestWpm}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>WPM</p>
              </div>
              <TrophyIcon className="w-12 h-12 text-emerald-500 opacity-30" />
            </div>
          </div>

          {/* Average Accuracy */}
          <div className={`backdrop-blur-md border rounded-lg p-6 transition hover:border-emerald-500/50 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Accuracy</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stats.avgAccuracy}%</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Average</p>
              </div>
              <ClockIcon className="w-12 h-12 text-emerald-500 opacity-30" />
            </div>
          </div>

          {/* Latest WPM */}
          <div className={`backdrop-blur-md border rounded-lg p-6 transition hover:border-emerald-500/50 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Latest Speed</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stats.latestWpm}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>WPM</p>
              </div>
              <BoltIcon className="w-12 h-12 text-emerald-500 opacity-30" />
            </div>
          </div>

          {/* Latest Accuracy */}
          <div className={`backdrop-blur-md border rounded-lg p-6 transition hover:border-emerald-500/50 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Latest Accuracy</p>
                <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{stats.latestAccuracy}%</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Recent</p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-emerald-500 opacity-30" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/">
            <button className={`w-full font-semibold py-3 rounded-lg transition transform hover:scale-105 ${isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-slate-900' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
              Start New Test
            </button>
          </Link>
          <Link href="/Study">
            <button className={`w-full font-semibold py-3 rounded-lg transition transform hover:scale-105 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
              Lessons
            </button>
          </Link>
          <Link href="/pro">
            <button className={`w-full font-semibold py-3 rounded-lg transition transform hover:scale-105 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
              Leaderboard
            </button>
          </Link>
        </div>

        {/* Recent Scores */}
        <div className={`backdrop-blur-md border rounded-lg overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
          <div className={`p-6 border-b ${isDark ? 'border-slate-700/50' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
              <TrophyIcon className="w-6 h-6 text-emerald-500" />
              Recent Scores
            </h3>
          </div>

          {scores.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No tests taken yet</p>
              <Link href="/">
                <button className={`px-6 py-2 rounded-lg transition font-medium ${isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-slate-900' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
                  Take Your First Test
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'bg-slate-700/30 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Date</th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>WPM</th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Raw WPM</th>
                    <th className={`px-6 py-3 text-left text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.slice(0, 10).map((score, index) => (
                    <tr
                      key={index}
                      className={`border-b transition ${isDark ? 'border-slate-700/30 hover:bg-slate-700/20' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {new Date(score.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                        {score.wpm}
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {score.rawWpm}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            score.accuracy >= 95
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : score.accuracy >= 85
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {(score.accuracy * 100).toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Info Card */}
        <div className={`mt-8 backdrop-blur-md border rounded-lg p-6 ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200 shadow-sm'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${isDark ? 'border-emerald-500' : 'border-emerald-400'}`}>
              {profileImage || userData?.image ? (
                <img src={profileImage || userData?.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-slate-900" />
                </div>
              )}
            </div>
            <div>
              <h4 className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{userData?.username || userData?.name || userData?.email}</h4>
              <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>{userData?.email}</p>
              {userData?.gender && (
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Gender: {userData.gender}</p>
              )}
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className={`ml-auto px-4 py-2 rounded-lg transition ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
