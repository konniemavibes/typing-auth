'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const CLASSES = [
  { id: 'ey-jupiter', name: 'EY Jupiter' },
  { id: 'ey-venus', name: 'EY Venus' },
  { id: 'ey-mercury', name: 'EY Mercury' },
  { id: 'ey-neptune', name: 'EY Neptune' },
];

export default function TeacherDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState('ey-jupiter');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTabActive, setIsTabActive] = useState(true);
  const [lastActivityTime, setLastActivityTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completedTests: 0,
  });

  // Initialize dark mode from localStorage
  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('teacher-darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update dark mode
  useEffect(() => {
    if (mounted) {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('teacher-darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('teacher-darkMode', 'false');
      }
    }
  }, [darkMode, mounted]);

  // Track tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isActive = !document.hidden;
      setIsTabActive(isActive);
      setLastActivityTime(new Date());
      
      console.log(`Teacher tab is now ${isActive ? 'ACTIVE' : 'HIDDEN'}`);
      
      // Log when teacher switches tabs
      if (session?.user?.id) {
        fetch('/api/student/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: session.user.id,
            isActive: isActive,
            timestamp: new Date().toISOString(),
            userRole: 'teacher'
          })
        }).catch(err => console.error('Activity tracking error:', err));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
    }
  }, [selectedClass]);

  const fetchClassStudents = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching class:', selectedClass);
      const response = await fetch(`/api/teacher/class/${selectedClass}`);
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch students';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
          if (errorData.received) {
            errorMessage += ` (received: "${errorData.received}", available: ${JSON.stringify(errorData.available)})`;
          }
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        setError(errorMessage);
        setStudents([]);
        console.error('API Error:', errorMessage);
        return;
      }

      const data = await response.json();
      setStudents(data.students || []);
      setStats({
        totalStudents: data.totalStudents || 0,
        activeStudents: data.activeStudents || 0,
        completedTests: data.completedTests || 0,
      });
    } catch (error) {
      console.error('Error fetching class data:', error);
      setError(error.message || 'An unexpected error occurred');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <AcademicCapIcon className="w-8 h-8 text-emerald-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Teacher Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-slate-400">
                {session?.user?.name || session?.user?.email}
              </span>
              
              {/* Tab Activity Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-700/50">
                {isTabActive ? (
                  <>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Active</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Inactive</span>
                  </>
                )}
              </div>

              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select a Class
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 font-medium ${
                  selectedClass === cls.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 hover:border-emerald-300'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-400 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Teacher Activity Status */}
        <div className={`rounded-lg border p-4 mb-8 ${
          isTabActive
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
            : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isTabActive ? (
                <EyeIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <EyeSlashIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              )}
              <div>
                <p className={`font-medium ${
                  isTabActive
                    ? 'text-emerald-900 dark:text-emerald-300'
                    : 'text-amber-900 dark:text-amber-300'
                }`}>
                  {isTabActive ? '✓ Teacher tab is ACTIVE' : '⚠ Teacher tab is INACTIVE'}
                </p>
                <p className={`text-sm ${
                  isTabActive
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}>
                  Last activity: {lastActivityTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalStudents}
                </p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Active Now
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {stats.activeStudents}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Tests Completed Today
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.completedTests}
                </p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Students in {CLASSES.find((c) => c.id === selectedClass)?.name}
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-slate-400">
                No students in this class yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Tab Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Avg WPM
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Tests
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {student.name || student.username || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-fit ${
                              student.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                                : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/30'
                            }`}
                          >
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                student.isActive ? 'bg-emerald-500' : 'bg-red-500'
                              } ${student.isActive ? 'animate-pulse' : ''}`}
                            ></div>
                            {student.isActive ? (
                              <>
                                <span>✓ On Tab</span>
                              </>
                            ) : (
                              <>
                                <span>✕ Tab Hidden</span>
                              </>
                            )}
                          </span>
                          {student.lastActivity && (
                            <span className="text-xs text-gray-500 dark:text-slate-500">
                              Last: {new Date(student.lastActivity).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {student.avgWpm || 0} WPM
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                        {student.testCount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Dashboard Info:</strong> This dashboard updates in real-time. Students in your class will appear here when they log in.
              You can monitor their activity, typing speed, and test progress.
            </p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3">📊 Tab Status Legend</h4>
            <div className="space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span><strong>✓ On Tab</strong> - Student is actively on the typing page</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                <span><strong>✕ Tab Hidden</strong> - Student switched to another tab or minimized window</span>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-2 ml-5.5">
                ℹ️ The timestamp shows when the last activity was recorded
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
