import React, { useState } from 'react';
import { Settings, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';
import { updateExistingUsers, makeUserAdmin } from '../services/updateExistingUsers';
import { seedProductionData } from '../services/seedProductionData';
import { useAuth } from '../contexts/AuthContext';

const SetupAdmin = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateUsers = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await updateExistingUsers();
      if (result.success) {
        setMessage(`✅ Successfully updated ${result.updated} users with approvalStatus field`);
      } else {
        setError(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async () => {
    if (!currentUser) {
      setError('You must be logged in to make yourself admin');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await makeUserAdmin(currentUser.uid);
      if (result.success) {
        setMessage('✅ You are now an admin! Refresh the page to see changes.');
      } else {
        setError(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await seedProductionData();
      if (result.success) {
        setMessage('✅ Database seeded successfully with sample data!');
      } else {
        setError(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">

        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-12 border-2 border-gray-100 dark:border-gray-700 shadow-2xl">

          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings size={40} className="text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-text-primary mb-4 text-center">
            Admin Setup
          </h1>

          <p className="text-text-secondary text-center mb-8">
            One-time setup to configure your AnchorPlot admin account
          </p>

          {/* Current User Info */}
          {currentUser && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-8">
              <p className="text-sm text-text-secondary mb-1">Logged in as:</p>
              <p className="font-bold text-text-primary">{currentUser.email}</p>
              <p className="text-xs text-text-secondary mt-1">UID: {currentUser.uid}</p>
            </div>
          )}

          {/* Messages */}
          {message && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Setup Steps */}
          <div className="space-y-4">

            {/* Step 1: Update Existing Users */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary mb-2">Update Existing Users</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Add approvalStatus field to all existing users in the database
                  </p>
                  <button
                    onClick={handleUpdateUsers}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-primary hover:bg-green-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    Update Users
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Make Yourself Admin */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary mb-2">Make Yourself Admin</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Grant admin role and approval to your current account
                  </p>
                  <button
                    onClick={handleMakeAdmin}
                    disabled={loading || !currentUser}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                    Make Me Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Seed Sample Data (Optional) */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary mb-2">Seed Sample Data (Optional)</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Add sample properties, projects, and users for testing
                  </p>
                  <button
                    onClick={handleSeedData}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                    Seed Database
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Instructions */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-text-primary mb-3">After Setup:</h4>
            <ol className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                <span>Refresh the page to see your admin role take effect</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                <span>Navigate to <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">/app/admin</code> to access the admin console</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                <span>Approve or reject pending users from the admin dashboard</span>
              </li>
            </ol>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="/app"
              className="px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary text-text-primary font-semibold transition-all"
            >
              Go to Dashboard
            </a>
            <a
              href="/app/admin"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-semibold transition-all"
            >
              Go to Admin Panel
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SetupAdmin;
