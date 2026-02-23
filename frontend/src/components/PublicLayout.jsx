import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './PublicLayout.css';

const PublicLayout = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="public-app-container flex flex-col min-h-screen bg-background">
            {/* Public Header - Dynamic Island Style */}
            <header className={`public-nav fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${scrolled ? 'scrolled' : ''}`}>
                <div className={`nav-container mx-auto transition-all duration-500 ease-out ${scrolled ? 'scrolled' : ''}`}>
                    <div className="nav-inner flex items-center justify-between">

                        {/* Logo */}
                        <NavLink to="/" className="flex items-center gap-2.5 group relative z-10">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center logo-icon transition-all duration-300" style={{ background: '#1e5631' }}>
                                <Building2 color="white" size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold tracking-tight logo-text transition-all duration-300">AnchorPlot</span>
                        </NavLink>

                        {/* Nav Links */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium nav-links">
                            <a href="#features" className="nav-link transition-all duration-300">Features</a>
                            <a href="#how-it-works" className="nav-link transition-all duration-300">How it Works</a>
                            <a href="#network" className="nav-link transition-all duration-300">Network</a>
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-3 relative z-10">
                            <ThemeToggle />
                            <NavLink to="/app" className="font-medium text-sm nav-link-login transition-all duration-300 hidden sm:block">
                                Log In
                            </NavLink>
                            <NavLink to="/app"
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold bg-white group transition-all hover:bg-gray-100 shadow-lg shadow-black/30 nav-cta hover:shadow-xl hover:scale-105 active:scale-95"
                                style={{ color: '#0d2b1a' }}>
                                Dashboard Access
                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </NavLink>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-surface border-t border-border-light pb-10 pt-16">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#1e5631' }}>
                                <Building2 color="white" size={14} />
                            </div>
                            <span className="font-bold text-text-primary">AnchorPlot</span>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">The controlled-disclosure marketplace for high-yield development opportunities.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-primary mb-5 text-sm">Platform</h4>
                        <ul className="text-sm text-text-secondary space-y-3 flex flex-col">
                            {['Zoning Intelligence', 'Marketplace', 'JV Deal Room', 'Compliance'].map(l => (
                                <a key={l} href="#" className="hover:text-primary transition-colors">{l}</a>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-primary mb-5 text-sm">Network</h4>
                        <ul className="text-sm text-text-secondary space-y-3 flex flex-col">
                            {['For Owners', 'For Developers', 'For Investors', 'Attorney Directory'].map(l => (
                                <a key={l} href="#" className="hover:text-primary transition-colors">{l}</a>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-primary mb-5 text-sm">Legal</h4>
                        <ul className="text-sm text-text-secondary space-y-3 flex flex-col">
                            {['Terms of Service', 'Privacy Policy', 'Security'].map(l => (
                                <a key={l} href="#" className="hover:text-primary transition-colors">{l}</a>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-border-light text-xs text-text-secondary flex justify-between items-center">
                    <p>© {new Date().getFullYear()} AnchorPlot Inc. All rights reserved.</p>
                    <p>Built for the future of real estate development.</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
