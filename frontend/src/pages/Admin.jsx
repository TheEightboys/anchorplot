import React, { useState, useEffect } from 'react';
import {
  Users, Building, Briefcase, DollarSign, ShieldCheck, AlertTriangle,
  Search, Filter, MoreVertical, ChevronDown, Eye, Settings,
  Download, RefreshCw, Loader2, CheckCircle2, XCircle, Clock, TrendingUp,
  Bell, Activity, FileText, UserCheck, UserX, Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

const Admin = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending');
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // Track which user action is loading
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeListings: 0,
    totalRevenue: '$0'
  });

  useEffect(() => {
    // Redirect non-admins
    if (userData && userData.role !== 'admin') {
      navigate('/app');
    }
  }, [userData, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);

      // Fetch properties
      const propsSnapshot = await getDocs(collection(db, 'properties'));
      const propsData = propsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProperties(propsData);

      // Calculate stats
      const pendingCount = usersData.filter(u => u.approvalStatus === 'pending').length;
      const activeListings = propsData.filter(p => p.status === 'approved').length;

      setStats({
        totalUsers: usersData.length,
        pendingApprovals: pendingCount,
        activeListings,
        totalRevenue: '$24,800'
      });

    } catch (error) {
      console.error('Admin data load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      setActionLoading(userId + '-approve');
      await updateDoc(doc(db, 'users', userId), {
        approvalStatus: 'approved',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Approve error:', error);
      alert('Error approving user: ' + (error.message || 'Please try again.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId) => {
    const reason = prompt('Enter rejection reason (optional):');

    try {
      setActionLoading(userId + '-reject');
      await updateDoc(doc(db, 'users', userId), {
        approvalStatus: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'Not specified',
        updatedAt: new Date().toISOString()
      });

      // Reload data
      await loadData();
    } catch (error) {
      console.error('Reject error:', error);
      alert('Error rejecting user: ' + (error.message || 'Please try again.'));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === 'all' ? true :
        activeTab === 'pending' ? u.approvalStatus === 'pending' :
          activeTab === 'approved' ? u.approvalStatus === 'approved' :
            activeTab === 'rejected' ? u.approvalStatus === 'rejected' :
              true;

    return matchesSearch && matchesTab;
  });

  const ROLE_COLORS = {
    investor: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    developer: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    owner: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    attorney: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    property_manager: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    admin: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
  };

  const STATUS_COLORS = {
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-73px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-73px)] overflow-y-auto bg-gradient-to-br from-gray-50 via-red-50/20 to-orange-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="p-6 lg:p-8 max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-text-primary mb-2">Admin Console</h1>
              <p className="text-text-secondary text-lg">
                Platform-wide controls, user approvals and system monitoring
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-6 py-3 rounded-2xl border-2 border-border-light bg-white hover:bg-gray-50 text-text-primary font-semibold transition-all hover:shadow-lg flex items-center gap-2"
                onClick={loadData}
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-semibold transition-all hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <Download size={18} />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 border-2 border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Users size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-bold text-success flex items-center gap-1">
                <TrendingUp size={12} />
                +12%
              </span>
            </div>
            <h3 className="text-4xl font-bold text-text-primary mb-2">{stats.totalUsers}</h3>
            <p className="text-sm text-text-secondary">Total Users</p>
          </div>

          <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-[32px] p-8 text-white hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Clock size={28} />
                </div>
                {stats.pendingApprovals > 0 && (
                  <span className="px-3 py-1 rounded-full bg-white/30 backdrop-blur-sm text-xs font-bold animate-pulse">
                    Action Required
                  </span>
                )}
              </div>
              <h3 className="text-4xl font-bold mb-2">{stats.pendingApprovals}</h3>
              <p className="text-sm text-white/90">Pending Approvals</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 border-2 border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Building size={28} className="text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-bold text-success flex items-center gap-1">
                <TrendingUp size={12} />
                +5%
              </span>
            </div>
            <h3 className="text-4xl font-bold text-text-primary mb-2">{stats.activeListings}</h3>
            <p className="text-sm text-text-secondary">Active Listings</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 border-2 border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <DollarSign size={28} className="text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-bold text-success flex items-center gap-1">
                <TrendingUp size={12} />
                +18%
              </span>
            </div>
            <h3 className="text-4xl font-bold text-text-primary mb-2">{stats.totalRevenue}</h3>
            <p className="text-sm text-text-secondary">Platform Revenue</p>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] border-2 border-gray-100 dark:border-gray-700 overflow-hidden">

          {/* Tabs and Search */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-text-primary">User Management</h2>

              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all w-full lg:w-80"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'pending', label: 'Pending', count: users.filter(u => u.approvalStatus === 'pending').length, color: 'amber' },
                { id: 'approved', label: 'Approved', count: users.filter(u => u.approvalStatus === 'approved').length, color: 'green' },
                { id: 'rejected', label: 'Rejected', count: users.filter(u => u.approvalStatus === 'rejected').length, color: 'red' },
                { id: 'all', label: 'All Users', count: users.length, color: 'gray' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary to-green-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id
                      ? 'bg-white/30'
                      : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-20 text-center">
                <Users size={64} className="mx-auto text-text-tertiary mb-4 opacity-30" />
                <h3 className="text-xl font-bold text-text-primary mb-2">No users found</h3>
                <p className="text-text-secondary">
                  {searchQuery ? 'Try adjusting your search query' : 'No users match the selected filter'}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="text-left text-xs font-bold text-text-secondary px-6 py-4 uppercase tracking-wider">User</th>
                    <th className="text-left text-xs font-bold text-text-secondary px-6 py-4 uppercase tracking-wider">Role</th>
                    <th className="text-left text-xs font-bold text-text-secondary px-6 py-4 uppercase tracking-wider">Status</th>
                    <th className="text-left text-xs font-bold text-text-secondary px-6 py-4 uppercase tracking-wider">Joined</th>
                    <th className="text-right text-xs font-bold text-text-secondary px-6 py-4 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email || 'U')}&background=16a34a&color=fff&rounded=true&size=48`}
                            alt={user.name}
                            className="w-12 h-12 rounded-xl ring-2 ring-gray-200 dark:ring-gray-700"
                          />
                          <div>
                            <p className="font-bold text-text-primary">{user.name || 'Unknown'}</p>
                            <p className="text-sm text-text-secondary">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                          {user.role?.replace('_', ' ') || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize flex items-center gap-1 w-fit ${STATUS_COLORS[user.approvalStatus] || 'bg-gray-100 text-gray-700'}`}>
                          {user.approvalStatus === 'pending' && <Clock size={12} />}
                          {user.approvalStatus === 'approved' && <CheckCircle2 size={12} />}
                          {user.approvalStatus === 'rejected' && <XCircle size={12} />}
                          {user.approvalStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-text-secondary">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          {user.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                disabled={actionLoading === user.id + '-approve'}
                                className="px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30 font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === user.id + '-approve' ? (
                                  <><Loader2 size={16} className="animate-spin" /> Approving...</>
                                ) : (
                                  <><UserCheck size={16} /> Approve</>
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectUser(user.id)}
                                disabled={actionLoading === user.id + '-reject'}
                                className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading === user.id + '-reject' ? (
                                  <><Loader2 size={16} className="animate-spin" /> Rejecting...</>
                                ) : (
                                  <><UserX size={16} /> Reject</>
                                )}
                              </button>
                            </>
                          )}
                          {user.approvalStatus === 'approved' && (
                            <span className="text-sm text-text-secondary">Approved</span>
                          )}
                          {user.approvalStatus === 'rejected' && (
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 font-semibold text-sm transition-all"
                            >
                              Re-approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
