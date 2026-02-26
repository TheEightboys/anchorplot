import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const friendlyError = (msg) => {
        if (msg.includes('user-not-found') || msg.includes('invalid-credential')) return 'No account found with that email. Please sign up first.';
        if (msg.includes('wrong-password')) return 'Incorrect password. Please try again or reset your password.';
        if (msg.includes('invalid-email')) return 'Please enter a valid email address.';
        if (msg.includes('too-many-requests')) return 'Too many attempts. Please wait a minute and try again.';
        if (msg.includes('network-request-failed')) return 'Network error — please check your connection.';
        return 'Unable to sign in. Please check your credentials and try again.';
    };

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError('Please fill in both email and password.');
            return;
        }
        try {
            setError('');
            setLoading(true);
            await login(email.trim(), password);
            navigate('/app');
        } catch (err) {
            setError(friendlyError(err.message));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex relative overflow-hidden">

            {/* Left branding panel (desktop only) */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0d2b1a] via-[#1e5631] to-[#143d22] flex-col justify-between p-12 relative">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

                <NavLink to="/" className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center rounded-xl border border-white/10">
                        <Building2 size={22} className="text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">AnchorPlot</span>
                </NavLink>

                <div className="relative z-10 max-w-md">
                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                        Controlled disclosure for
                        <span className="text-[#4ec878]"> smarter real estate deals</span>
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed mb-8">
                        The three-sided marketplace where landowners, developers and investors structure joint ventures with full anonymization, attorney-gated compliance and transparent equity ledgers.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'KYC Verified', desc: 'All participants ID verified' },
                            { label: 'Attorney Gated', desc: 'Jurisdiction-compliant' },
                            { label: 'Encrypted', desc: 'End-to-end deal rooms' },
                            { label: 'Audit Trail', desc: 'Immutable action logs' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield size={12} className="text-[#4ec878]" />
                                    <span className="text-xs font-bold text-white">{item.label}</span>
                                </div>
                                <p className="text-[11px] text-white/40">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-white/30 text-xs relative z-10">© 2026 AnchorPlot. All rights reserved.</p>
            </div>

            {/* Right login form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16">
                <div className="w-full max-w-[420px]">

                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-10">
                        <NavLink to="/" className="inline-flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-lg">
                                <Building2 size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-text-primary">AnchorPlot</span>
                        </NavLink>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-extrabold text-text-primary mb-2 tracking-tight">Welcome back</h1>
                        <p className="text-text-secondary text-sm">Enter your credentials to access your dashboard.</p>
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="flex items-start gap-3 bg-danger/8 border border-danger/15 text-danger text-sm p-4 rounded-xl mb-6">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-surface border border-border-light rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-semibold text-text-primary">Password</label>
                                <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-surface border border-border-light rounded-xl py-3 pl-11 pr-11 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="btn btn-primary w-full py-3.5 mt-2 text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                            ) : (
                                <>Sign In <ArrowRight size={15} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-text-secondary">
                        Don't have an account?{' '}
                        <NavLink to="/signup" className="text-primary font-bold hover:underline">Apply for access</NavLink>
                    </div>

                    <div className="mt-6 flex items-center gap-3 text-[11px] text-text-tertiary justify-center">
                        <Shield size={11} />
                        <span>256-bit encryption · SOC 2 compliant · GDPR ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
