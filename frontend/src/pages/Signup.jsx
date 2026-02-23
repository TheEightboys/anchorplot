import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, AlertCircle, Briefcase, Home, TrendingUp, CheckCircle2, Scale, Users, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_SIGNUP_FIELDS } from '../services/permissions';

const ROLES = [
    { key: 'owner', label: 'Landowner', icon: Home, desc: 'List and protect your property', color: 'success' },
    { key: 'developer', label: 'Developer', icon: Briefcase, desc: 'Access anonymized opportunities', color: 'info' },
    { key: 'investor', label: 'Investor', icon: TrendingUp, desc: 'Fund vetted projects', color: 'primary' },
    { key: 'realtor', label: 'Realtor', icon: Key, desc: 'Refer and earn equity', color: 'warning' },
    { key: 'attorney', label: 'Attorney', icon: Scale, desc: 'Compliance & legal services', color: 'danger' },
    { key: 'property_manager', label: 'Prop Manager', icon: Users, desc: 'Manage stabilized assets', color: 'info' },
];

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('investor');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [extraFields, setExtraFields] = useState({});

    const { signup } = useAuth();
    const navigate = useNavigate();

    const friendlyError = (msg) => {
        if (msg.includes('configuration-not-found')) return 'Firebase project configuration error. Please ensure Firebase Authentication is properly set up in the Firebase Console.';
        if (msg.includes('operation-not-allowed')) return 'Email/password sign-up is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method → Email/Password.';
        if (msg.includes('email-already-in-use')) return 'An account with this email already exists. Try logging in instead.';
        if (msg.includes('weak-password')) return 'Password must be at least 6 characters long.';
        if (msg.includes('invalid-email')) return 'Please enter a valid email address.';
        if (msg.includes('network-request-failed')) return 'Network error — please check your connection.';
        if (msg.includes('auth/')) return `Authentication error: ${msg.split('auth/')[1]?.split(')')[0] || 'Unknown error'}. Please check Firebase Console settings.`;
        return 'Unable to create account. Please check Firebase Console configuration or contact support.';
    };

    const handleExtraFieldChange = (key, value) => {
        setExtraFields(prev => ({ ...prev, [key]: value }));
    };

    const currentRoleFields = ROLE_SIGNUP_FIELDS[role] || [];

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) { setError('Please enter your full name.'); return; }
        if (!email.trim()) { setError('Please enter your email address.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (!agreed) { setError('Please accept the Terms of Service to continue.'); return; }

        // Validate required extra fields
        for (const field of currentRoleFields) {
            if (field.required && !extraFields[field.key]?.toString().trim()) {
                setError(`Please fill in ${field.label}.`);
                return;
            }
        }

        try {
            setError('');
            setLoading(true);
            await signup(email.trim(), password, role, name.trim(), extraFields);
            navigate('/app');
        } catch (err) {
            setError(friendlyError(err.message));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex relative overflow-hidden">

            {/* Left branding panel */}
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
                        Join a vetted network of
                        <span className="text-[#4ec878]"> real estate professionals</span>
                    </h2>
                    <p className="text-white/60 text-sm leading-relaxed mb-10">
                        AnchorPlot is a three-sided marketplace. Whether you own land, develop projects, fund deals, or provide legal and management services — we match you with vetted counterparts through controlled disclosure.
                    </p>

                    <div className="space-y-4">
                        {[
                            'Anonymized listings — no address until deal stage',
                            'Attorney-gated compliance checkpoints',
                            'Transparent equity ledger and milestone tracking',
                            'Affordable housing and public funding support',
                            'Realtor referral equity and property management',
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <CheckCircle2 size={14} className="text-[#4ec878] mt-0.5 shrink-0" />
                                <span className="text-white/60 text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-white/30 text-xs relative z-10">© 2026 AnchorPlot. All rights reserved.</p>
            </div>

            {/* Right signup form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 overflow-y-auto">
                <div className="w-full max-w-[480px]">

                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <NavLink to="/" className="inline-flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-lg">
                                <Building2 size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-text-primary">AnchorPlot</span>
                        </NavLink>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-extrabold text-text-primary mb-2 tracking-tight">Apply for Access</h1>
                        <p className="text-text-secondary text-sm">Join the vetted marketplace for development deals.</p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 bg-danger/8 border border-danger/15 text-danger text-sm p-4 rounded-xl mb-5">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2">I am a...</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ROLES.map(r => {
                                    const Icon = r.icon;
                                    const isSelected = role === r.key;
                                    return (
                                        <button
                                            key={r.key}
                                            type="button"
                                            onClick={() => { setRole(r.key); setExtraFields({}); }}
                                            className={`flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-xl border text-center transition-all ${isSelected
                                                ? `border-${r.color} bg-${r.color}/5 shadow-sm`
                                                : 'border-border-light bg-surface hover:bg-surface-hover'
                                                }`}
                                        >
                                            <Icon size={16} className={isSelected ? `text-${r.color}` : 'text-text-tertiary'} />
                                            <span className={`text-[11px] font-bold leading-tight ${isSelected ? `text-${r.color}` : 'text-text-secondary'}`}>{r.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-text-tertiary mt-1.5 pl-1">
                                {ROLES.find(r => r.key === role)?.desc}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Full name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                                <input type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-surface border border-border-light rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="John Doe" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Work email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                                <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-surface border border-border-light rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="name@company.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                                <input type={showPassword ? 'text' : 'password'} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-surface border border-border-light rounded-xl py-3 pl-11 pr-11 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Min 6 characters" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {password.length > 0 && password.length < 6 && (
                                <p className="text-xs text-warning mt-1.5">Password needs at least 6 characters</p>
                            )}
                        </div>

                        {/* Role-specific extra fields */}
                        {currentRoleFields.length > 0 && (
                            <div className="space-y-3 p-4 rounded-xl border border-border-light bg-surface-element/50">
                                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                    {ROLES.find(r => r.key === role)?.label} Details
                                </p>
                                {currentRoleFields.map(field => (
                                    <div key={field.key}>
                                        {field.type === 'checkbox' ? (
                                            <label className="flex items-center gap-2.5 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!extraFields[field.key]}
                                                    onChange={(e) => handleExtraFieldChange(field.key, e.target.checked)}
                                                    className="w-4 h-4 rounded border-border-medium text-primary focus:ring-primary/20"
                                                />
                                                <span className="text-sm text-text-primary font-medium">{field.label}</span>
                                            </label>
                                        ) : (
                                            <>
                                                <label className="block text-xs font-semibold text-text-secondary mb-1">
                                                    {field.label} {field.required && <span className="text-danger">*</span>}
                                                </label>
                                                <input
                                                    type={field.type}
                                                    required={field.required}
                                                    value={extraFields[field.key] || ''}
                                                    onChange={(e) => handleExtraFieldChange(field.key, e.target.value)}
                                                    className="w-full bg-surface border border-border-light rounded-lg py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    placeholder={field.placeholder}
                                                />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Terms checkbox */}
                        <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-border-medium text-primary focus:ring-primary/20" />
                            <span className="text-xs text-text-secondary leading-relaxed">
                                I agree to the <a href="#" className="text-primary font-semibold hover:underline">Terms of Service</a> and{' '}
                                <a href="#" className="text-primary font-semibold hover:underline">Privacy Policy</a>, and acknowledge the KYC verification requirements.
                            </span>
                        </label>

                        <button disabled={loading} type="submit"
                            className="btn btn-primary w-full py-3.5 mt-1 text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {loading ? (
                                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                            ) : (
                                <>Submit Application <ArrowRight size={15} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-text-secondary">
                        Already have an account?{' '}<NavLink to="/login" className="text-primary font-bold hover:underline">Sign In</NavLink>
                    </div>

                    <div className="mt-4 flex items-center gap-3 text-[11px] text-text-tertiary justify-center">
                        <Shield size={11} />
                        <span>256-bit encryption · SOC 2 compliant · GDPR ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
