import React from 'react';
import { Clock, Mail, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-12 border-2 border-gray-100 dark:border-gray-700 shadow-2xl text-center">
          
          {/* Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Clock size={48} className="text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Awaiting Admin Approval
          </h1>

          {/* Description */}
          <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto">
            Thank you for signing up! Your account is currently under review by our admin team.
          </p>

          {/* User Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-3xl p-6 mb-8 max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || currentUser?.email || 'User')}&background=16a34a&color=fff&rounded=true&size=64`}
                alt="User"
                className="w-16 h-16 rounded-full ring-4 ring-white dark:ring-gray-800"
              />
              <div className="text-left flex-1">
                <h3 className="font-bold text-text-primary text-lg">{userData?.name || 'User'}</h3>
                <p className="text-sm text-text-secondary">{currentUser?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="text-left">
                <p className="text-xs text-text-secondary mb-1">Role</p>
                <p className="font-semibold text-text-primary capitalize">{userData?.role || 'Investor'}</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-text-secondary mb-1">Status</p>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  <Clock size={12} />
                  Pending
                </span>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 mb-8 text-left max-w-md mx-auto">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-info" />
              What happens next?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary">
                  Our admin team will review your profile and credentials
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary">
                  You'll receive an email notification once approved
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary">
                  Approval typically takes 24-48 hours
                </span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleRefresh}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-bold transition-all hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <CheckCircle2 size={20} />
              Check Status
            </button>
            <button
              onClick={handleLogout}
              className="px-8 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-danger text-text-primary hover:text-danger font-semibold transition-all flex items-center gap-2"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>

          {/* Contact Support */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-text-secondary mb-3">
              Need immediate assistance?
            </p>
            <a
              href="mailto:support@anchorplot.com"
              className="inline-flex items-center gap-2 text-primary hover:text-green-600 font-semibold transition-colors"
            >
              <Mail size={16} />
              Contact Support
            </a>
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-text-secondary mt-6">
          This is a security measure to ensure platform integrity and user safety.
        </p>

      </div>
    </div>
  );
};

export default PendingApproval;
