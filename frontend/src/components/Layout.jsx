import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Bell, Search, Map, Briefcase, Building2, BarChart2, ShieldCheck, LogOut,
    ChevronRight, Settings, Plus, PieChart, Users, Home, Heart, Scale
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { getNavigationForRole, NAV_SECTIONS, ROLE_LABELS } from '../services/permissions';
import './Layout.css';

// Icon registry for dynamic nav rendering
const ICON_MAP = { BarChart2, Search, Map, Briefcase, ShieldCheck, Plus, PieChart, Users, Home, Heart, Scale, Settings };

const Layout = () => {
    const { currentUser, userData, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try { await logout(); navigate('/'); } catch (e) { console.error(e); }
    };

    const userRole = userData?.role || 'investor';
    const navItems = getNavigationForRole(userRole);

    // Group nav items by section
    const sections = {};
    navItems.forEach(item => {
        const sec = item.section || 'main';
        if (!sections[sec]) sections[sec] = [];
        sections[sec].push(item);
    });

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-20 sidebar">
                {/* Logo row */}
                <div className="h-16 flex items-center px-5 border-b border-border-light">
                    <NavLink to="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary shadow-md shadow-primary/30">
                            <Building2 color="white" size={17} strokeWidth={2.5} />
                        </div>
                        <span className="text-lg font-bold text-text-primary">AnchorPlot</span>
                    </NavLink>
                </div>

                {/* Public site back button */}
                <div className="px-4 pt-4 pb-2">
                    <NavLink to="/"
                        className="text-xs text-text-secondary hover:text-primary font-medium px-3 py-1.5 rounded-lg bg-surface-element hover:bg-surface-hover transition-colors w-fit flex items-center gap-1">
                        ← Public Site
                    </NavLink>
                </div>

                {/* Nav - Dynamic based on role */}
                <nav className="flex-1 py-3 flex flex-col gap-1 px-3 overflow-y-auto">
                    {Object.entries(sections).map(([sectionKey, items]) => (
                        <React.Fragment key={sectionKey}>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-text-secondary px-3 mb-2 mt-3 first:mt-1">
                                {NAV_SECTIONS[sectionKey] || sectionKey}
                            </p>
                            {items.map(({ to, label, icon, end }) => {
                                const Icon = ICON_MAP[icon] || BarChart2;
                                return (
                                    <NavLink key={to} to={to} end={end}
                                        className={({ isActive }) =>
                                            `nav-item flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl font-medium transition-all ${isActive
                                                ? 'bg-primary text-white shadow-md shadow-primary/25'
                                                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                                            }`
                                        }>
                                        {({ isActive }) => (
                                            <>
                                                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                                                <span className="flex-1">{label}</span>
                                                {isActive && <ChevronRight size={14} className="opacity-60" />}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </React.Fragment>
                    ))}

                    {/* Admin link - only shown to admins */}
                    {userData?.role === 'admin' && (
                        <>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-text-secondary px-3 mb-2 mt-4">Admin</p>
                            <NavLink to="/app/admin"
                                className={({ isActive }) =>
                                    `nav-item flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl font-medium transition-all ${isActive
                                        ? 'bg-danger text-white shadow-md shadow-danger/25'
                                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                                    }`
                                }>
                                {({ isActive }) => (
                                    <>
                                        <Settings size={17} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="flex-1">Admin Console</span>
                                        {isActive && <ChevronRight size={14} className="opacity-60" />}
                                    </>
                                )}
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* User profile footer */}
                <div className="p-4 border-t border-border-light">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer group">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || currentUser?.email || 'U')}&background=1e5631&color=fff&rounded=true`}
                            alt="User" className="w-9 h-9 rounded-full ring-2 ring-border-light"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-text-primary">{userData?.name || currentUser?.displayName || 'User'}</p>
                            <p className="text-[10px] text-text-secondary truncate">{ROLE_LABELS[userRole] || userRole}</p>
                        </div>
                        <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-danger transition-all" title="Log out">
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-col flex-1 pl-[260px] h-screen">
                {/* Topbar */}
                <header className="h-16 border-b border-border-light flex items-center justify-between px-6 z-10 sticky top-0 backdrop-blur-md bg-[color-mix(in_srgb,var(--surface)_90%,transparent)]">
                    <div className="relative hidden md:block max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={15} />
                        <input
                            type="text"
                            placeholder="Search properties, zones, documents..."
                            className="w-full bg-surface-element border border-border-light rounded-xl py-2 pl-9 pr-4 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-text-secondary transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                        <ThemeToggle />
                        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all border border-border-light">
                            <Bell size={17} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-surface" />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 bg-background overflow-hidden relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
