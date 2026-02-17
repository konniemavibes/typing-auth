'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  PencilSquareIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0,
  });

  // Initialize dark mode from localStorage
  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem('admin-darkMode') === 'true';
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
        localStorage.setItem('admin-darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('admin-darkMode', 'false');
      }
    }
  }, [darkMode, mounted]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.users || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      setEditingUser(null);
      await fetchUsers();
      alert('User role updated successfully');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      await fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
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
              <ShieldCheckIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-slate-400">
                {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers}
                </p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Students
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {stats.students || 0}
                </p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-emerald-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Teachers
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.teachers || 0}
                </p>
              </div>
              <AdjustmentsHorizontalIcon className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">
                  Admins
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.admins || 0}
                </p>
              </div>
              <ShieldCheckIcon className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Users Management
              </h2>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-slate-400">
                No users found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {user.username || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {editingUser?.id === user.id ? (
                          <select
                            value={editingUser.role}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                role: e.target.value,
                              })
                            }
                            className="px-2 py-1 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                                : user.role === 'teacher'
                                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        {editingUser?.id === user.id ? (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateRole(user.id, editingUser.role)
                              }
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="px-3 py-1 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-gray-900 dark:text-white rounded text-xs font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(user)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30 rounded text-xs font-medium transition-colors"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-500/30 rounded text-xs font-medium transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
