import React, { useState, useEffect } from 'react';
import {
    CheckCircle2, ShieldCheck, Scale, Search, Star, MapPin,
    AlertTriangle, Loader2, FolderOpen, Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { listAttorneys, updateProject } from '../services/firestoreService';
import { getProjectsForUser } from '../services/dashboardData';
import PageHeader from '../components/PageHeader';

const RESTRICTED_STATES = ['CA', 'NY', 'NJ', 'CT', 'TX'];

const ComplianceGateway = () => {
    const { userData } = useAuth();
    const navigate = useNavigate();
    const [attorneys, setAttorneys] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState(null);
    const [assigningAttorneyId, setAssigningAttorneyId] = useState('');
    const [assignmentError, setAssignmentError] = useState('');

    useEffect(() => {
        const fetchComplianceData = async () => {
            try {
                const [attorneyData, projectData] = await Promise.all([
                    listAttorneys(),
                    getProjectsForUser(userData),
                ]);

                const normalizedAttorneys = (attorneyData || []).map(attorney => ({
                    id: attorney.id,
                    name: attorney.name || 'Unknown Attorney',
                    firm: attorney.firm || 'Independent Practice',
                    specialty: attorney.specialty || (Array.isArray(attorney.specialties) ? attorney.specialties.join(', ') : 'Real Estate'),
                    jurisdiction: Array.isArray(attorney.jurisdiction)
                        ? attorney.jurisdiction
                        : (attorney.barState ? [attorney.barState] : []),
                    rating: Number(attorney.rating) || 0,
                    deals: Number(attorney.deals ?? attorney.completedDeals ?? 0),
                    fee: attorney.fee || (attorney.hourlyRate ? `$${attorney.hourlyRate}/hr` : 'Rate on request'),
                    verified: Boolean(attorney.verified),
                }));

                setAttorneys(normalizedAttorneys);
                setProjects(projectData || []);
            } catch (err) {
                console.error('Compliance data fetch error:', err);
                setAttorneys([]);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        if (userData?.uid) {
            fetchComplianceData();
        }
    }, [userData]);

    const activeDeals = projects.filter(project => !['completed', 'closed', 'cancelled'].includes(String(project.status || '').toLowerCase()));

    const restrictedDeals = activeDeals.filter(project => {
        const state = String(project.propertyState || project.state || '').toUpperCase();
        return RESTRICTED_STATES.includes(state);
    });

    const pendingAttorneyDeals = restrictedDeals.filter(project => !(project.attorneyId || project.attorneyUid || project.attorneyName));
    const attorneySelectionComplete = pendingAttorneyDeals.length === 0;

    const complianceChecks = [
        {
            label: 'Identity Verification (KYC)',
            status: ['verified', 'approved'].includes(String(userData?.kycStatus || '').toLowerCase()) ? 'complete' : 'pending',
            note: userData?.kycStatus ? `Current status: ${userData.kycStatus}` : 'KYC status not recorded yet',
        },
        {
            label: 'Accredited Investor Status',
            status: userData?.role !== 'investor' || Boolean(userData?.accreditedInvestor) ? 'complete' : 'pending',
            note: userData?.role === 'investor'
                ? (userData?.accreditedInvestor ? 'Accredited investor confirmed' : 'Accredited investor confirmation pending')
                : 'Not required for your role',
        },
        {
            label: 'Attorney Selection',
            status: attorneySelectionComplete ? 'complete' : 'pending',
            note: restrictedDeals.length
                ? `${pendingAttorneyDeals.length} restricted-jurisdiction deal(s) still require attorney assignment`
                : 'No restricted-jurisdiction deals currently active',
        },
        {
            label: 'Non-Circumvention Agreement',
            status: userData?.nonCircumventionAccepted ? 'complete' : 'pending',
            note: userData?.nonCircumventionAccepted ? 'Agreement accepted on profile' : 'Agreement acceptance not recorded',
        },
        {
            label: 'Platform Fee Acknowledgment',
            status: userData?.platformFeeAcknowledged || userData?.feeAcknowledged ? 'complete' : 'pending',
            note: userData?.platformFeeAcknowledged || userData?.feeAcknowledged
                ? 'Fee acknowledgment completed'
                : 'Fee acknowledgment pending',
        },
    ];

    const checksPassed = complianceChecks.filter(check => check.status === 'complete').length;
    const jurisdictionsCovered = new Set(attorneys.flatMap(attorney => attorney.jurisdiction || [])).size;

    const handleAttorneySelect = async (attorney) => {
        setAssignmentError('');
        setSelected(attorney.id);

        const targetDeal = pendingAttorneyDeals[0];
        if (!targetDeal?.id) return;

        setAssigningAttorneyId(attorney.id);
        try {
            await updateProject(targetDeal.id, {
                attorneyId: attorney.id,
                attorneyName: attorney.name,
            });

            setProjects(prevProjects => prevProjects.map(project => (
                project.id === targetDeal.id
                    ? { ...project, attorneyId: attorney.id, attorneyName: attorney.name }
                    : project
            )));
        } catch (error) {
            console.error('Failed to assign attorney:', error);
            setAssignmentError('Unable to assign attorney right now. Please try again.');
        } finally {
            setAssigningAttorneyId('');
        }
    };

    const filtered = attorneys.filter(a =>
        a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.jurisdiction?.some(j => j.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="h-[calc(100vh-73px)] overflow-y-auto bg-background p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <PageHeader
                    title="Legal & Compliance"
                    subtitle="Jurisdiction-gated attorney selection. All deals in restricted zones require platform-vetted legal counsel."
                    badge="Attorney Gated"
                    actions={
                        <button className="btn btn-secondary flex items-center gap-2 text-sm" onClick={() => navigate('/app/attorneys')}>
                            <Plus size={14} /> Invite Attorney
                        </button>
                    }
                />

                {/* Status Banner */}
                <div className="mt-6 mb-8 p-4 rounded-2xl border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                        {checksPassed === complianceChecks.length ? (
                            <CheckCircle2 size={20} className="text-success" />
                        ) : (
                            <AlertTriangle size={20} className="text-warning" />
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-sm text-text-primary">
                            {checksPassed === complianceChecks.length ? 'All Compliance Up to Date' : 'Compliance Attention Needed'}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                            {checksPassed === complianceChecks.length
                                ? 'All tracked compliance checks are complete for your active deals.'
                                : `${complianceChecks.length - checksPassed} compliance item(s) still pending review.`}
                        </p>
                    </div>
                    <NavLink to="/app/deal-room" className="ml-auto text-sm font-bold text-primary hover:underline whitespace-nowrap">
                        View Deal Room →
                    </NavLink>
                </div>

                {/* Compliance Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Active Deals', value: String(activeDeals.length), icon: FolderOpen, color: 'text-primary', bg: 'bg-primary/5' },
                        { label: 'Checks Passed', value: String(checksPassed), icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5' },
                        { label: 'Attorneys Available', value: String(attorneys.length), icon: Scale, color: 'text-info', bg: 'bg-info/5' },
                        { label: 'Jurisdictions Covered', value: String(jurisdictionsCovered), icon: MapPin, color: 'text-purple', bg: 'bg-purple/5' },
                    ].map(s => (
                        <div key={s.label} className="bg-surface border border-border-light rounded-2xl p-5 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                                <s.icon size={18} className={s.color} />
                            </div>
                            <div>
                                <p className="text-xl font-extrabold text-text-primary">{s.value}</p>
                                <p className="text-xs text-text-secondary">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Attorney Directory */}
                <div className="bg-surface border border-border-light rounded-2xl overflow-hidden">
                    <div className="border-b border-border-light p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">Vetted Attorney Directory</h2>
                            <p className="text-sm text-text-secondary mt-0.5">All attorneys are verified with bar credentials and transaction history.</p>
                        </div>
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input
                                type="text"
                                placeholder="Search by name, state, specialty..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-background border border-border-light rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all w-64"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={28} />
                        </div>
                    ) : (
                        <div className="divide-y divide-border-light">
                            {filtered.map(attorney => (
                                <div
                                    key={attorney.id}
                                    className={`p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-surface-hover transition-colors cursor-pointer group ${selected === attorney.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                                    onClick={() => setSelected(selected === attorney.id ? null : attorney.id)}
                                >
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg shrink-0">
                                        {attorney.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="font-bold text-text-primary text-sm">{attorney.name}</p>
                                            {attorney.verified && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success">
                                                    <ShieldCheck size={10} /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-text-secondary">{attorney.firm}</p>
                                        <p className="text-xs text-primary/80 mt-1">{attorney.specialty}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {attorney.jurisdiction?.slice(0, 3).map(j => (
                                                <span key={j} className="px-1.5 py-0.5 bg-background border border-border-light rounded text-[10px] text-text-secondary">{j}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex sm:flex-col items-start sm:items-end gap-3 shrink-0">
                                        <div className="flex items-center gap-1">
                                            <Star size={12} className="fill-amber-400 text-amber-400" />
                                            <span className="text-sm font-bold text-text-primary">{attorney.rating}</span>
                                        </div>
                                        <p className="text-xs text-text-secondary">{attorney.deals} deals</p>
                                        <p className="text-xs font-bold text-primary">{attorney.fee}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className={`flex items-center gap-2 shrink-0 transition-all ${selected === attorney.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button
                                            className="btn btn-primary text-xs px-4 py-2"
                                            disabled={assigningAttorneyId === attorney.id}
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAttorneySelect(attorney);
                                            }}
                                        >
                                            {assigningAttorneyId === attorney.id
                                                ? 'Assigning...'
                                                : (selected === attorney.id ? 'Selected' : 'Select')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="text-center py-16 text-text-secondary">
                                    <Scale size={32} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No attorneys match your search.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {assignmentError && (
                    <div className="mt-4 p-3 rounded-xl bg-danger/5 border border-danger/10 text-danger text-xs font-medium">
                        {assignmentError}
                    </div>
                )}

                {/* Compliance Checkpoints */}
                <div className="mt-6 bg-surface border border-border-light rounded-2xl p-6">
                    <h3 className="font-bold text-text-primary mb-4">Compliance Checkpoints</h3>
                    <div className="space-y-3">
                        {complianceChecks.map(cp => (
                            <div key={cp.label} className="flex items-center gap-4 p-3 rounded-xl bg-background border border-border-light">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${cp.status === 'complete' ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-600'}`}>
                                    {cp.status === 'complete' ? <CheckCircle2 size={14} /> : <AlertTriangle size={12} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text-primary">{cp.label}</p>
                                    <p className="text-xs text-text-secondary mt-0.5">{cp.note}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cp.status === 'complete' ? 'bg-success/10 text-success' : 'bg-amber-100 text-amber-600'}`}>
                                    {cp.status === 'complete' ? 'Complete' : 'Pending'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ComplianceGateway;
