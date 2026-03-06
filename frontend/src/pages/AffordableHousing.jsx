import React, { useState, useEffect } from 'react';
import {
    Heart, DollarSign, Clock, FileText, Check, AlertCircle,
    ChevronRight, Home, TrendingUp, Filter, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';



import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getProjectsForUser } from '../services/dashboardData';



export default function AffordableHousing() {
    const { userData } = useAuth();
    const [tab, setTab] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    const toSafeNumber = (value, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const snap = await getDocs(collection(db, 'fundingPrograms'));
                setPrograms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error("Error fetching programs:", err);
                setPrograms([]);
            }
        };
        fetchPrograms();
    }, []);

    useEffect(() => {
        const fetchAffordableProjects = async () => {
            if (!userData?.uid) {
                setProjects([]);
                setLoading(false);
                return;
            }
            try {
                const scopedProjects = await getProjectsForUser(userData);
                const projectData = scopedProjects
                    .map(data => ({
                        id: data.id,
                        name: data.name || 'Unnamed Project',
                        city: data.city || data.propertyCity || 'Unknown Location',
                        amiLevel: data.amiLevel || data.targetAMI || '60% AMI',
                        units: toSafeNumber(data.totalUnits ?? data.units),
                        affordableUnits: toSafeNumber(data.affordableUnits),
                        term: data.term || (data.affordabilityTerm ? `${data.affordabilityTerm} years` : '30 years'),
                        fundingStatus: data.fundingStatus || (toSafeNumber(data.fundingAmount) > 0 ? 'awarded' : 'applying'),
                        fundingAmount: toSafeNumber(data.fundingAmount),
                        program: data.fundingProgram || 'Undecided',
                        compliancePeriod: data.compliancePeriod || (data.affordabilityTerm ? `${data.affordabilityTerm} years` : '15 years'),
                        isAffordable: Boolean(data.isAffordable || data.affordableHousingOptIn || toSafeNumber(data.affordableUnits) > 0),
                        complianceRequirements: Array.isArray(data.complianceRequirements) ? data.complianceRequirements : [],
                    }))
                    .filter(project => project.isAffordable || project.affordableUnits > 0);

                setProjects(projectData);
            } catch (error) {
                console.error("Error fetching affordable projects:", error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAffordableProjects();
    }, [userData]);

    const activeProjectsCount = projects.length;
    const totalAffordableUnits = projects.reduce((sum, project) => sum + toSafeNumber(project.affordableUnits), 0);
    const fundingSecuredAmount = projects.reduce((sum, project) => sum + toSafeNumber(project.fundingAmount), 0);
    const complianceActiveCount = projects.filter(project => project.fundingStatus === 'awarded').length;

    const defaultComplianceItems = [
        { label: 'Annual Income Verification', due: 'TBD', status: 'upcoming' },
        { label: 'Unit Inspection Report', due: 'TBD', status: 'upcoming' },
        { label: 'Program Compliance Report', due: 'TBD', status: 'upcoming' },
    ];

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 lg:p-8">
                <PageHeader
                    title="Affordable Housing"
                    subtitle="Track affordable housing projects, AMI commitments and public funding programs."
                />

                {loading && (
                    <div className="mb-6 p-4 rounded-xl border border-border-light bg-surface text-sm text-text-secondary">
                        Loading affordable housing data...
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        ['Active Projects', String(activeProjectsCount), Heart, 'success'],
                        ['Affordable Units', String(totalAffordableUnits), Home, 'primary'],
                        ['Funding Secured', `$${fundingSecuredAmount.toLocaleString()}`, DollarSign, 'info'],
                        ['Compliance Active', String(complianceActiveCount), Check, 'warning'],
                    ].map(([label, value, Icon, color]) => (
                        <div key={label} className={`bg-${color}/5 border border-${color}/10 rounded-xl p-4`}>
                            <Icon size={18} className={`text-${color} mb-2`} />
                            <p className="text-xs text-text-tertiary font-bold uppercase">{label}</p>
                            <p className="text-xl font-bold text-text-primary">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border-light mb-6">
                    {[['projects', 'My Projects'], ['programs', 'Funding Programs'], ['compliance', 'Compliance']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all ${tab === key ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
                                }`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Projects Tab */}
                {tab === 'projects' && (
                    <div className="space-y-4">
                        {projects.length === 0 ? (
                            <div className="bg-surface border border-border-light rounded-2xl p-8 text-center text-text-secondary">
                                No affordable housing projects found yet.
                            </div>
                        ) : projects.map(proj => (
                            <div key={proj.id} className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-text-primary">{proj.name}</h3>
                                        <p className="text-xs text-text-secondary">{proj.city} · {proj.units} units ({proj.affordableUnits} affordable)</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${proj.fundingStatus === 'awarded' ? 'bg-success/10 text-success' :
                                        proj.fundingStatus === 'applying' ? 'bg-warning/10 text-warning' :
                                            'bg-surface-element text-text-tertiary'
                                        }`}>{proj.fundingStatus}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {[
                                        ['AMI Level', proj.amiLevel],
                                        ['Term', proj.term],
                                        ['Program', proj.program],
                                        ['Funding', proj.fundingAmount ? `$${proj.fundingAmount.toLocaleString()}` : 'Pending'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="bg-surface-element/50 rounded-lg p-2.5">
                                            <p className="text-[9px] font-bold text-text-tertiary uppercase">{k}</p>
                                            <p className="text-xs font-semibold text-text-primary mt-0.5">{v}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Programs Tab */}
                {tab === 'programs' && (
                    <div className="space-y-4">
                        {programs.length === 0 ? (
                            <div className="bg-surface border border-border-light rounded-2xl p-8 text-center text-text-secondary">
                                No funding programs available right now.
                            </div>
                        ) : programs.map(prog => (
                            <div key={prog.id} className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="text-sm font-bold text-text-primary">{prog.name}</h3>
                                        <p className="text-xs text-text-secondary mt-0.5">{prog.desc}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${prog.status === 'closing_soon' ? 'bg-danger/10 text-danger' :
                                        'bg-success/10 text-success'
                                        }`}>{prog.status === 'closing_soon' ? 'Closing Soon' : 'Open'}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
                                    <span className="flex items-center gap-1"><FileText size={12} /> {prog.type}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> Deadline: {prog.deadline}</span>
                                    <span className="flex items-center gap-1"><DollarSign size={12} /> Max: {prog.maxAward}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Compliance Tab */}
                {tab === 'compliance' && (
                    <div className="space-y-4">
                        <div className="bg-info/5 border border-info/10 rounded-xl p-4 text-xs text-text-secondary mb-2">
                            Track compliance periods, reporting requirements and upcoming deadlines for all affordable housing commitments.
                        </div>
                        {projects.filter(p => p.fundingStatus === 'awarded').length === 0 ? (
                            <div className="bg-surface border border-border-light rounded-2xl p-8 text-center text-text-secondary">
                                No awarded projects with active compliance requirements yet.
                            </div>
                        ) : projects.filter(p => p.fundingStatus === 'awarded').map(proj => (
                            <div key={proj.id} className="bg-surface border border-border-light rounded-2xl p-5 shadow-sm">
                                <h3 className="text-sm font-bold text-text-primary mb-3">{proj.name} — Compliance Tracker</h3>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {[
                                        ['Compliance Period', proj.compliancePeriod],
                                        ['AMI Commitment', proj.amiLevel],
                                        ['Affordable Units', String(proj.affordableUnits)],
                                    ].map(([k, v]) => (
                                        <div key={k} className="bg-surface-element rounded-lg p-3 text-center">
                                            <p className="text-[9px] font-bold text-text-tertiary uppercase">{k}</p>
                                            <p className="text-sm font-bold text-text-primary mt-0.5">{v}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    {(proj.complianceRequirements.length > 0 ? proj.complianceRequirements : defaultComplianceItems).map((r, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border-light">
                                            <span className="text-xs font-medium text-text-primary">{r.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-text-tertiary">Due: {r.due || 'TBD'}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'complete' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'}`}>
                                                    {r.status || 'upcoming'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
