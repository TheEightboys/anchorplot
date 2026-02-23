import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart2, TrendingUp, Building2, DollarSign, Users, MapPin,
    ArrowUpRight, ArrowDownRight, ChevronRight, Clock, Eye,
    Briefcase, ShieldCheck, AlertTriangle, CheckCircle2, FileText,
    Activity, Layers, Target, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listProperties, listProjects, listInvestmentsByUser, listZoningAlerts } from '../services/firestoreService';

// Stat card component
function StatCard({ icon: Icon, label, value, change, changeType, color, onClick }) {
    const colorMap = {
        green: { bg: 'bg-success-bg', text: 'text-success', iconBg: 'bg-success/10' },
        blue: { bg: 'bg-info-bg', text: 'text-info', iconBg: 'bg-info/10' },
        orange: { bg: 'bg-warning-bg', text: 'text-warning', iconBg: 'bg-warning/10' },
        purple: { bg: 'bg-purple-bg', text: 'text-purple', iconBg: 'bg-purple/10' },
        red: { bg: 'bg-danger-bg', text: 'text-danger', iconBg: 'bg-danger/10' },
    };
    const c = colorMap[color] || colorMap.green;

    return (
        <div
            className="card p-5 hover:shadow-md transition-all duration-300 cursor-pointer group"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg} transition-transform group-hover:scale-110`}>
                    <Icon size={20} className={c.text} />
                </div>
                {change !== undefined && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${changeType === 'up' ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
                        {changeType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {change}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-text-primary tracking-tight">{value}</p>
            <p className="text-xs text-text-secondary mt-1">{label}</p>
        </div>
    );
}

// Quick action button component
function QuickAction({ icon: Icon, label, description, onClick, color }) {
    const colorMap = {
        green: 'bg-success/10 text-success',
        blue: 'bg-info/10 text-info',
        orange: 'bg-warning/10 text-warning',
        purple: 'bg-purple/10 text-purple',
    };
    return (
        <button
            onClick={onClick}
            className="card p-4 flex items-center gap-3 hover:shadow-md transition-all duration-300 text-left group w-full"
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.green} transition-transform group-hover:scale-110`}>
                <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="text-xs text-text-secondary truncate">{description}</p>
            </div>
            <ChevronRight size={14} className="text-text-tertiary group-hover:text-primary transition-colors" />
        </button>
    );
}

// Activity item component
function ActivityItem({ icon: Icon, title, description, time, color }) {
    const colorMap = {
        green: 'bg-success/10 text-success',
        blue: 'bg-info/10 text-info',
        orange: 'bg-warning/10 text-warning',
        red: 'bg-danger/10 text-danger',
        purple: 'bg-purple/10 text-purple',
    };
    return (
        <div className="flex items-start gap-3 py-3 border-b border-border-light last:border-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[color] || colorMap.green}`}>
                <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{title}</p>
                <p className="text-xs text-text-secondary truncate">{description}</p>
            </div>
            <span className="text-[10px] text-text-tertiary whitespace-nowrap flex items-center gap-1 mt-0.5">
                <Clock size={10} />
                {time}
            </span>
        </div>
    );
}

export default function Dashboard() {
    const { currentUser, userData } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        properties: 0,
        projects: 0,
        investments: 0,
        alerts: 0,
    });
    const [recentProperties, setRecentProperties] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [properties, projects, investments, alerts] = await Promise.allSettled([
                    listProperties(),
                    listProjects(),
                    currentUser?.uid ? listInvestmentsByUser(currentUser.uid) : Promise.resolve([]),
                    currentUser?.uid ? listZoningAlerts({ userId: currentUser.uid }) : Promise.resolve([]),
                ]);

                setStats({
                    properties: properties.status === 'fulfilled' ? properties.value.length : 0,
                    projects: projects.status === 'fulfilled' ? projects.value.length : 0,
                    investments: investments.status === 'fulfilled' ? investments.value.length : 0,
                    alerts: alerts.status === 'fulfilled' ? alerts.value.length : 0,
                });

                if (properties.status === 'fulfilled') {
                    setRecentProperties(properties.value.slice(0, 5));
                }
            } catch (err) {
                console.error('Dashboard data fetch error:', err);
            } finally {
                setLoadingData(false);
            }
        }
        fetchDashboardData();
    }, [currentUser?.uid]);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const userName = userData?.name || currentUser?.displayName || 'Investor';
    const userRole = userData?.role || 'investor';
    const roleLabels = {
        admin: 'Administrator',
        owner: 'Property Owner',
        developer: 'Developer',
        investor: 'Investor',
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full custom-scrollbar">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                        {greeting()}, {userName} 👋
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Welcome back to your AnchorPlot dashboard. Here's your overview.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`badge ${userRole === 'admin' ? 'badge-danger' : userRole === 'owner' ? 'badge-info' : userRole === 'developer' ? 'badge-warning' : 'badge-success'}`}>
                        {roleLabels[userRole] || 'User'}
                    </span>
                    <span className={`badge ${userData?.approvalStatus === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                        {userData?.approvalStatus === 'approved' ? '✓ Verified' : '⏳ Pending'}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Building2}
                    label="Total Properties"
                    value={loadingData ? '—' : stats.properties}
                    change="+12%"
                    changeType="up"
                    color="green"
                    onClick={() => navigate('/app/marketplace')}
                />
                <StatCard
                    icon={Briefcase}
                    label="Active Projects"
                    value={loadingData ? '—' : stats.projects}
                    change="+3"
                    changeType="up"
                    color="blue"
                    onClick={() => navigate('/app/deal-room')}
                />
                <StatCard
                    icon={DollarSign}
                    label="Your Investments"
                    value={loadingData ? '—' : stats.investments}
                    color="purple"
                    onClick={() => navigate('/app/deal-room')}
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Zoning Alerts"
                    value={loadingData ? '—' : stats.alerts}
                    color="orange"
                    onClick={() => navigate('/app/zoning')}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-text-primary">Quick Actions</h2>
                        <Zap size={16} className="text-warning" />
                    </div>
                    <div className="space-y-2">
                        <QuickAction
                            icon={Building2}
                            label="Browse Properties"
                            description="Explore anonymized listings"
                            color="green"
                            onClick={() => navigate('/app/marketplace')}
                        />
                        <QuickAction
                            icon={MapPin}
                            label="Zoning Intelligence"
                            description="Check zoning data & alerts"
                            color="blue"
                            onClick={() => navigate('/app/zoning')}
                        />
                        <QuickAction
                            icon={Briefcase}
                            label="JV Deal Room"
                            description="Manage joint ventures"
                            color="purple"
                            onClick={() => navigate('/app/deal-room')}
                        />
                        <QuickAction
                            icon={ShieldCheck}
                            label="Legal Compliance"
                            description="Review compliance status"
                            color="orange"
                            onClick={() => navigate('/app/compliance')}
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-text-primary">Recent Activity</h2>
                            <Activity size={16} className="text-text-tertiary" />
                        </div>

                        {loadingData ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
                                        <div className="w-8 h-8 rounded-lg bg-surface-element" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-surface-element rounded w-3/4" />
                                            <div className="h-2 bg-surface-element rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentProperties.length > 0 ? (
                            <div>
                                {recentProperties.map((property, idx) => (
                                    <ActivityItem
                                        key={property.id || idx}
                                        icon={Building2}
                                        title={property.title || property.address || `Property #${idx + 1}`}
                                        description={`${property.city || 'Unknown'} · ${property.status || 'pending'} · ${property.views || 0} views`}
                                        time={property.createdAt ? new Date(typeof property.createdAt === 'object' && property.createdAt.seconds ? property.createdAt.seconds * 1000 : property.createdAt).toLocaleDateString() : 'Recently'}
                                        color={property.status === 'approved' ? 'green' : property.status === 'rejected' ? 'red' : 'orange'}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-full bg-surface-element flex items-center justify-center mx-auto mb-3">
                                    <Layers size={20} className="text-text-tertiary" />
                                </div>
                                <p className="text-sm text-text-secondary font-medium">No recent activity</p>
                                <p className="text-xs text-text-tertiary mt-1">
                                    Start by browsing the marketplace or checking zoning data
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Platform Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 group hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => navigate('/app/marketplace')}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Target size={18} className="text-success" />
                        </div>
                        <h3 className="text-sm font-bold text-text-primary">Marketplace</h3>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        Browse anonymized property listings. Connect with owners and submit development pitches.
                    </p>
                </div>

                <div className="card p-5 group hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => navigate('/app/deal-room')}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText size={18} className="text-info" />
                        </div>
                        <h3 className="text-sm font-bold text-text-primary">JV Deal Room</h3>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        Manage joint ventures with real-time equity tracking, milestones, and secure messaging.
                    </p>
                </div>

                <div className="card p-5 group hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => navigate('/app/compliance')}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShieldCheck size={18} className="text-warning" />
                        </div>
                        <h3 className="text-sm font-bold text-text-primary">Legal Compliance</h3>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                        Access attorney vetting, compliance checklists, and regulatory tracking tools.
                    </p>
                </div>
            </div>
        </div>
    );
}
