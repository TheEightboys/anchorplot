import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FileText, Milestone, PieChart, MessageSquare, Shield,
    Check, Clock, AlertCircle, DollarSign, Users, Building2, Briefcase,
    ChevronRight, Plus, Send, Download, Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProject, updateProject, addMilestone, sendMessage, subscribeToMessages, updateEquityLedger } from '../services/firestoreService';
import { createEsignEnvelope } from '../services/functionsService';

const TABS = [
    { key: 'overview', label: 'Overview', icon: Building2 },
    { key: 'milestones', label: 'Milestones', icon: Milestone },
    { key: 'equity', label: 'Equity Ledger', icon: PieChart },
    { key: 'agreements', label: 'Agreements', icon: FileText },
    { key: 'documents', label: 'Documents', icon: FileText },
    { key: 'messages', label: 'Messages', icon: MessageSquare },
    { key: 'compliance', label: 'Compliance', icon: Shield },
];

const MILESTONE_PHASES = [
    { key: 'planning', label: 'Planning', color: '#3b82f6' },
    { key: 'permitting', label: 'Permitting', color: '#f59e0b' },
    { key: 'funding_close', label: 'Funding Close', color: '#8b5cf6' },
    { key: 'construction', label: 'Construction', color: '#22c55e' },
    { key: 'completion', label: 'Completion', color: '#06b6d4' },
];

export default function ProjectWorkspace() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { userData } = useAuth();
    const [project, setProject] = useState(null);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
    const [newMilestoneBudget, setNewMilestoneBudget] = useState('');
    const [newMilestonePaymentTrigger, setNewMilestonePaymentTrigger] = useState('');
    const [savingMilestone, setSavingMilestone] = useState(false);
    const [agreementBusy, setAgreementBusy] = useState(false);
    const [envelopeBusyId, setEnvelopeBusyId] = useState('');
    const [logAmount, setLogAmount] = useState('');
    const [logMemo, setLogMemo] = useState('');
    const [logBusy, setLogBusy] = useState(false);
    const [workspaceMessage, setWorkspaceMessage] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const p = await getProject(projectId);
                setProject(p || {
                    id: projectId, name: 'Project', status: 'active', phase: 'planning',
                    milestones: [], equityLedger: [], totalBudget: 0, deployedBudget: 0,
                });
            } catch (e) { console.error(e); }
            setLoading(false);
        }
        load();
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        const unsub = subscribeToMessages(projectId, (msgs) => setMessages(msgs));
        return unsub;
    }, [projectId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        await sendMessage({
            projectId,
            senderId: userData?.uid,
            senderName: userData?.name || 'User',
            text: newMessage,
        });
        setNewMessage('');
    };

    const handleAddMilestoneWithTrigger = async () => {
        if (!newMilestoneTitle.trim()) return;

        const milestonePayload = {
            title: newMilestoneTitle.trim(),
            status: 'upcoming',
            budget: Number(newMilestoneBudget) || 0,
            paymentTrigger: newMilestonePaymentTrigger || 'manual_approval',
            phase: project?.phase || 'planning',
            dueDate: new Date().toISOString(),
        };

        setSavingMilestone(true);
        setWorkspaceMessage('');
        try {
            await addMilestone(projectId, milestonePayload);
            setProject(prev => ({
                ...prev,
                milestones: [...(prev?.milestones || []), milestonePayload],
            }));
            setNewMilestoneTitle('');
            setNewMilestoneBudget('');
            setNewMilestonePaymentTrigger('');
            setWorkspaceMessage('Milestone added with payment trigger.');
        } catch (error) {
            console.error('Failed to add milestone:', error);
            setWorkspaceMessage('Unable to add milestone right now.');
        } finally {
            setSavingMilestone(false);
        }
    };

    const handleGenerateAgreementSet = async () => {
        if (!project?.id) return;

        const existingAgreementDocs = (project?.documents || []).filter(documentEntry => documentEntry.type === 'agreement').length;
        const nextVersion = existingAgreementDocs + 1;
        const now = new Date().toISOString();

        const generatedDocs = [
            {
                id: `term_sheet_v${nextVersion}_${Date.now()}`,
                type: 'agreement',
                agreementType: 'JV Term Sheet',
                name: `JV Term Sheet v${nextVersion}`,
                version: `v${nextVersion}`,
                status: 'generated',
                uploadedAt: now,
                watermarked: true,
            },
            {
                id: `jv_agreement_v${nextVersion}_${Date.now()}`,
                type: 'agreement',
                agreementType: 'JV Agreement',
                name: `JV Agreement v${nextVersion}`,
                version: `v${nextVersion}`,
                status: 'generated',
                uploadedAt: now,
                watermarked: true,
            },
        ];

        setAgreementBusy(true);
        setWorkspaceMessage('');
        try {
            const nextDocuments = [...(project?.documents || []), ...generatedDocs];
            await updateProject(projectId, { documents: nextDocuments });
            setProject(prev => ({ ...prev, documents: nextDocuments }));
            setWorkspaceMessage(`Generated JV term sheet and agreement ${`v${nextVersion}`}.`);
        } catch (error) {
            console.error('Failed to generate agreement docs:', error);
            setWorkspaceMessage('Unable to generate agreement documents right now.');
        } finally {
            setAgreementBusy(false);
        }
    };

    const handleSignAgreement = async (documentEntry) => {
        if (!project?.id || !documentEntry?.id || !userData?.uid) return;

        const signature = {
            documentId: documentEntry.id,
            documentName: documentEntry.name,
            signerId: userData.uid,
            signerName: userData.name || userData.email || 'User',
            signerRole: userData.role || 'participant',
        };

        setAgreementBusy(true);
        setWorkspaceMessage('');
        try {
            const existingSignatures = Array.isArray(project?.documentSignatures) ? project.documentSignatures : [];
            const duplicate = existingSignatures.find(existing => existing.documentId === signature.documentId && existing.signerId === signature.signerId);

            if (duplicate) {
                setWorkspaceMessage('You already signed this document version.');
                return;
            }

            const nextSignatures = [...existingSignatures, { ...signature, signedAt: new Date().toISOString() }];
            await updateProject(projectId, { documentSignatures: nextSignatures });
            setProject(prev => ({ ...prev, documentSignatures: nextSignatures }));
            setWorkspaceMessage(`Signature captured for ${documentEntry.name}.`);
        } catch (error) {
            console.error('Failed to record signature:', error);
            setWorkspaceMessage('Unable to record signature right now.');
        } finally {
            setAgreementBusy(false);
        }
    };

    const handleLogFinancialEntry = async (entryType) => {
        if (!project?.id || !logAmount) return;

        const amount = Number(logAmount);
        if (!Number.isFinite(amount) || amount <= 0) return;

        const baseEntry = {
            txId: `${entryType === 'distribution' ? 'dist' : 'pay'}_${Date.now()}`,
            amount,
            memo: logMemo || (entryType === 'distribution' ? 'Investor distribution' : 'Milestone progress payment'),
            createdBy: userData?.uid || 'system',
            createdByName: userData?.name || 'User',
            createdAt: new Date().toISOString(),
        };

        setLogBusy(true);
        setWorkspaceMessage('');
        try {
            if (entryType === 'distribution') {
                const nextDistributionLogs = [...(project?.distributionLogs || []), baseEntry];
                await updateProject(projectId, { distributionLogs: nextDistributionLogs });
                setProject(prev => ({ ...prev, distributionLogs: nextDistributionLogs }));
                setWorkspaceMessage('Distribution log entry recorded.');
            } else {
                const nextPaymentLogs = [...(project?.paymentLogs || []), baseEntry];
                await updateProject(projectId, { paymentLogs: nextPaymentLogs });
                setProject(prev => ({ ...prev, paymentLogs: nextPaymentLogs }));
                setWorkspaceMessage('Payment log entry recorded.');
            }
            setLogAmount('');
            setLogMemo('');
        } catch (error) {
            console.error('Failed to log financial entry:', error);
            setWorkspaceMessage('Unable to log financial entry right now.');
        } finally {
            setLogBusy(false);
        }
    };

    const handleSendAgreementForEsign = async (documentEntry) => {
        if (!project?.id || !documentEntry?.id) return;

        const signers = [
            project.ownerEmail ? { signerId: project.ownerId || 'owner', signerName: project.ownerName || 'Owner', email: project.ownerEmail, signerRole: 'owner' } : null,
            project.developerEmail ? { signerId: project.developerId || 'developer', signerName: project.developerName || 'Developer', email: project.developerEmail, signerRole: 'developer' } : null,
            project.attorneyEmail ? { signerId: project.attorneyId || 'attorney', signerName: project.attorneyName || 'Attorney', email: project.attorneyEmail, signerRole: 'attorney' } : null,
        ].filter(Boolean);

        const normalizedSigners = signers.length > 0
            ? signers
            : [{
                signerId: userData?.uid || 'current_user',
                signerName: userData?.name || 'Current User',
                email: userData?.email || '',
                signerRole: userData?.role || 'participant',
            }];

        setEnvelopeBusyId(documentEntry.id);
        setWorkspaceMessage('');
        try {
            const envelope = await createEsignEnvelope({
                projectId,
                documentId: documentEntry.id,
                title: documentEntry.name,
                signers: normalizedSigners,
            });

            setWorkspaceMessage(`E-sign envelope sent (${envelope.providerEnvelopeId || envelope.envelopeId}).`);
        } catch (error) {
            console.error('Failed to send envelope for e-sign:', error);
            setWorkspaceMessage('Unable to send e-sign envelope right now.');
        } finally {
            setEnvelopeBusyId('');
        }
    };

    const formatCurrency = (n) => n ? `$${Number(n).toLocaleString()}` : '$0';

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const normalizeMilestoneStatus = (status) => {
        const normalized = String(status || '').toLowerCase();
        if (['completed', 'complete', 'done'].includes(normalized)) return 'completed';
        if (['in-progress', 'in_progress', 'active', 'ongoing'].includes(normalized)) return 'in-progress';
        return 'pending';
    };

    const equityData = Array.isArray(project?.equityLedger) ? project.equityLedger : [];
    const milestones = Array.isArray(project?.milestones)
        ? project.milestones.map((milestone, index) => ({
            ...milestone,
            label: milestone.label || milestone.title || `Milestone ${index + 1}`,
            status: normalizeMilestoneStatus(milestone.status),
        }))
        : [];

    const projectDocuments = Array.isArray(project?.documents) ? project.documents : [];
    const agreementDocuments = projectDocuments.filter(documentEntry => documentEntry.type === 'agreement');
    const projectSignatures = Array.isArray(project?.documentSignatures) ? project.documentSignatures : [];
    const paymentLogs = Array.isArray(project?.paymentLogs) ? project.paymentLogs : [];
    const distributionLogs = Array.isArray(project?.distributionLogs) ? project.distributionLogs : [];
    const complianceCheckpoints = Array.isArray(project?.complianceCheckpoints)
        ? project.complianceCheckpoints
        : [];

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 lg:p-8">

                {/* Back */}
                <button onClick={() => navigate('/app/deal-room')}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary font-medium mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Deal Room
                </button>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-text-primary">{project?.name || 'Project Workspace'}</h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${project?.status === 'active' ? 'bg-success/10 text-success' :
                                    project?.status === 'completed' ? 'bg-info/10 text-info' :
                                        'bg-warning/10 text-warning'
                                }`}>{project?.status || 'active'}</span>
                            <span className="text-text-tertiary text-xs">Phase: <strong className="text-text-secondary capitalize">{project?.phase || 'planning'}</strong></span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-text-tertiary uppercase">Total Budget</p>
                        <p className="text-xl font-bold text-text-primary">{formatCurrency(project?.totalBudget)}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border-light mb-6 overflow-x-auto">
                    {TABS.map(t => {
                        const Icon = t.icon;
                        return (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
                                    }`}>
                                <Icon size={15} /> {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="bg-surface border border-border-light rounded-2xl p-6 shadow-sm">
                    {workspaceMessage && (
                        <div className="mb-4 rounded-xl border border-info/20 bg-info/5 px-4 py-2.5 text-xs text-info">
                            {workspaceMessage}
                        </div>
                    )}

                    {/* Overview */}
                    {tab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    ['Total Budget', formatCurrency(project?.totalBudget), DollarSign, 'primary'],
                                    ['Deployed', formatCurrency(project?.deployedBudget), Check, 'success'],
                                    ['Milestones', `${milestones.filter(m => m.status === 'completed').length}/${milestones.length}`, Milestone, 'info'],
                                    ['Team', String((project?.investors?.length || 0) + 2), Users, 'warning'],
                                ].map(([label, value, Icon, color]) => (
                                    <div key={label} className={`bg-${color}/5 border border-${color}/10 rounded-xl p-4`}>
                                        <Icon size={18} className={`text-${color} mb-2`} />
                                        <p className="text-xs text-text-tertiary font-bold uppercase">{label}</p>
                                        <p className="text-xl font-bold text-text-primary">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Quick milestone view */}
                            <div>
                                <h3 className="text-sm font-bold text-text-primary mb-3">Phase Progress</h3>
                                {milestones.length === 0 ? (
                                    <div className="bg-surface-element rounded-lg px-4 py-3 text-xs text-text-secondary">
                                        No milestone progress recorded yet.
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {milestones.map((milestone, index) => (
                                            <React.Fragment key={`${milestone.label}-${index}`}>
                                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${milestone.status === 'completed' ? 'bg-success/10 text-success' :
                                                        milestone.status === 'in-progress' ? 'bg-primary/10 text-primary ring-1 ring-primary/20' :
                                                            'bg-surface-element text-text-tertiary'
                                                    }`}>
                                                    {milestone.status === 'completed' ? <Check size={12} /> : milestone.status === 'in-progress' ? <Clock size={12} /> : null}
                                                    {milestone.label}
                                                </div>
                                                {index < milestones.length - 1 && <ChevronRight size={14} className="text-text-tertiary" />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Milestones */}
                    {tab === 'milestones' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-text-primary">Project Milestones</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-surface-element/40 rounded-xl p-3 border border-border-light">
                                <input
                                    value={newMilestoneTitle}
                                    onChange={event => setNewMilestoneTitle(event.target.value)}
                                    placeholder="Milestone title"
                                    className="md:col-span-2 bg-surface border border-border-light rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    value={newMilestoneBudget}
                                    onChange={event => setNewMilestoneBudget(event.target.value)}
                                    placeholder="Budget"
                                    className="bg-surface border border-border-light rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                />
                                <input
                                    value={newMilestonePaymentTrigger}
                                    onChange={event => setNewMilestonePaymentTrigger(event.target.value)}
                                    placeholder="Payment trigger"
                                    className="bg-surface border border-border-light rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                />
                                <button
                                    onClick={handleAddMilestoneWithTrigger}
                                    disabled={savingMilestone || !newMilestoneTitle.trim()}
                                    className="md:col-span-4 btn btn-secondary text-xs py-2 disabled:opacity-50"
                                >
                                    {savingMilestone ? 'Saving milestone...' : 'Add Milestone + Payment Trigger'}
                                </button>
                            </div>

                            {milestones.length === 0 ? (
                                <div className="text-sm text-text-secondary bg-surface-element rounded-lg p-4">
                                    No milestones have been added to this project.
                                </div>
                            ) : milestones.map((ms, i) => (
                                <div key={i} className={`border rounded-xl p-4 transition-all ${ms.status === 'completed' ? 'border-success/20 bg-success/3' :
                                        ms.status === 'in-progress' ? 'border-primary/20 bg-primary/3' :
                                            'border-border-light'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ms.status === 'completed' ? 'bg-success text-white' :
                                                    ms.status === 'in-progress' ? 'bg-primary text-white' :
                                                        'bg-surface-element text-text-tertiary'
                                                }`}>
                                                {ms.status === 'completed' ? <Check size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-primary">{ms.label}</p>
                                                <p className="text-xs text-text-secondary capitalize">{ms.status}</p>
                                            </div>
                                        </div>
                                        {ms.budget > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-text-tertiary">Budget</p>
                                                <p className="text-sm font-bold text-text-primary">{formatCurrency(ms.budget)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Equity Ledger */}
                    {tab === 'equity' && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-text-primary">Equity Distribution</h3>
                            {equityData.length === 0 ? (
                                <div className="text-sm text-text-secondary bg-surface-element rounded-lg p-4">
                                    Equity ledger entries are not available for this project yet.
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 h-8 rounded-full overflow-hidden">
                                        {equityData.map((e, index) => (
                                            <div key={`${e.party || 'Party'}-${index}`} style={{ width: `${e.pct || 0}%`, backgroundColor: e.color || '#94a3b8' }}
                                                className="h-full flex items-center justify-center text-white text-[10px] font-bold min-w-[30px]">
                                                {e.pct || 0}%
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {equityData.map((e, index) => (
                                            <div key={`${e.party || 'Party'}-${index}`} className="bg-surface-element rounded-xl p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color || '#94a3b8' }} />
                                                    <p className="text-xs font-bold text-text-secondary">{e.party || `Party ${index + 1}`}</p>
                                                </div>
                                                <p className="text-2xl font-bold text-text-primary">{e.pct || 0}%</p>
                                                <p className={`text-[10px] font-bold mt-1 ${e.vested ? 'text-success' : 'text-warning'}`}>
                                                    {e.vested ? '✓ Fully Vested' : '○ Vesting'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-info/5 border border-info/10 rounded-xl p-4 text-xs text-text-secondary">
                                        <strong>Realtor equity</strong> is carried equity with vesting conditions tied to project completion. Distribution records and payment logs are stored with traceable transaction IDs.
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border border-border-light rounded-xl p-4">
                                            <p className="text-xs font-bold text-text-tertiary uppercase mb-3">Distribution Logs</p>
                                            {distributionLogs.length === 0 ? (
                                                <p className="text-xs text-text-secondary">No distributions logged yet.</p>
                                            ) : distributionLogs.map(entry => (
                                                <div key={entry.txId} className="flex items-center justify-between text-xs py-1.5 border-b border-border-light last:border-0">
                                                    <span className="text-text-secondary">{entry.txId}</span>
                                                    <span className="font-bold text-success">{formatCurrency(entry.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border border-border-light rounded-xl p-4">
                                            <p className="text-xs font-bold text-text-tertiary uppercase mb-3">Payment Logs</p>
                                            {paymentLogs.length === 0 ? (
                                                <p className="text-xs text-text-secondary">No payments logged yet.</p>
                                            ) : paymentLogs.map(entry => (
                                                <div key={entry.txId} className="flex items-center justify-between text-xs py-1.5 border-b border-border-light last:border-0">
                                                    <span className="text-text-secondary">{entry.txId}</span>
                                                    <span className="font-bold text-primary">{formatCurrency(entry.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-surface-element/40 rounded-xl p-3 border border-border-light">
                                        <input
                                            type="number"
                                            min="0"
                                            value={logAmount}
                                            onChange={event => setLogAmount(event.target.value)}
                                            placeholder="Amount"
                                            className="bg-surface border border-border-light rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                        />
                                        <input
                                            value={logMemo}
                                            onChange={event => setLogMemo(event.target.value)}
                                            placeholder="Memo"
                                            className="md:col-span-2 bg-surface border border-border-light rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleLogFinancialEntry('payment')}
                                                disabled={logBusy || !logAmount}
                                                className="btn btn-secondary text-xs px-3 py-2 flex-1 disabled:opacity-50"
                                            >
                                                Log Payment
                                            </button>
                                            <button
                                                onClick={() => handleLogFinancialEntry('distribution')}
                                                disabled={logBusy || !logAmount}
                                                className="btn btn-primary text-xs px-3 py-2 flex-1 disabled:opacity-50"
                                            >
                                                Log Distribution
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Agreements */}
                    {tab === 'agreements' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-text-primary">Agreement Automation & E-Sign</h3>
                                <button
                                    onClick={handleGenerateAgreementSet}
                                    disabled={agreementBusy}
                                    className="btn btn-primary text-xs px-4 py-2"
                                >
                                    {agreementBusy ? 'Generating...' : 'Generate JV Agreement Set'}
                                </button>
                            </div>

                            <div className="bg-warning/5 border border-warning/10 rounded-xl p-3 text-[11px] text-warning">
                                Generated documents are watermarked and versioned. Signatures are recorded as immutable checkpoints.
                            </div>

                            {agreementDocuments.length === 0 ? (
                                <div className="text-sm text-text-secondary bg-surface-element rounded-lg p-4">
                                    No agreement versions generated yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {agreementDocuments.map(documentEntry => {
                                        const documentSignatures = projectSignatures.filter(signature => signature.documentId === documentEntry.id);
                                        const signedByCurrentUser = documentSignatures.some(signature => signature.signerId === userData?.uid);

                                        return (
                                            <div key={documentEntry.id} className="border border-border-light rounded-xl p-4 bg-surface-element/30">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-bold text-text-primary">{documentEntry.name}</p>
                                                        <p className="text-xs text-text-secondary">
                                                            {documentEntry.version || 'v1'} · {documentEntry.agreementType || 'Agreement'} · {documentEntry.watermarked ? 'Watermarked' : 'Not watermarked'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSignAgreement(documentEntry)}
                                                        disabled={agreementBusy || signedByCurrentUser}
                                                        className="btn btn-secondary text-xs px-3 py-2 disabled:opacity-50"
                                                    >
                                                        {signedByCurrentUser ? 'Signed' : 'E-Sign'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendAgreementForEsign(documentEntry)}
                                                        disabled={Boolean(envelopeBusyId)}
                                                        className="btn btn-primary text-xs px-3 py-2 disabled:opacity-50"
                                                    >
                                                        {envelopeBusyId === documentEntry.id ? 'Sending...' : 'Send Envelope'}
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-text-tertiary mt-2">
                                                    Signatures: {documentSignatures.length} {documentSignatures.length === 1 ? 'participant' : 'participants'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Documents */}
                    {tab === 'documents' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-text-primary">Project Documents</h3>
                                <button className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5"><Upload size={13} /> Upload</button>
                            </div>
                            {projectDocuments.length === 0 ? (
                                <div className="text-sm text-text-secondary bg-surface-element rounded-lg p-4">
                                    No project documents uploaded yet.
                                </div>
                            ) : projectDocuments.map((documentItem, index) => (
                                <div key={`${documentItem.name || 'Document'}-${index}`} className="flex items-center justify-between p-4 border border-border-light rounded-xl hover:bg-surface-hover transition-all">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-primary" />
                                        <div>
                                            <p className="text-sm font-bold text-text-primary">{documentItem.name || `Document ${index + 1}`}</p>
                                            <p className="text-[10px] text-text-tertiary">
                                                {documentItem.version || 'v1.0'} · {documentItem.uploadedAt || 'Uploaded recently'} · {documentItem.watermarked ? 'Watermarked' : 'Standard'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${documentItem.status === 'signed' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'}`}>
                                            {documentItem.status || 'uploaded'}
                                        </span>
                                        <button className="p-1.5 rounded-lg hover:bg-surface-element"><Download size={14} className="text-text-secondary" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Messages */}
                    {tab === 'messages' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-text-primary">Project Messages</h3>
                            <div className="bg-warning/5 border border-warning/10 rounded-xl p-3 text-[11px] text-warning font-medium">
                                ⚠ All communication must occur within AnchorPlot. Sharing external contact information is prohibited.
                            </div>
                            <div className="h-64 overflow-y-auto border border-border-light rounded-xl p-4 space-y-3 bg-surface-element/30">
                                {messages.length === 0 && (
                                    <p className="text-center text-text-tertiary text-sm py-8">No messages yet. Start the conversation.</p>
                                )}
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.senderId === userData?.uid ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-xl p-3 ${msg.senderId === userData?.uid ? 'bg-primary text-white' : 'bg-surface border border-border-light'
                                            }`}>
                                            <p className={`text-[10px] font-bold mb-1 ${msg.senderId === userData?.uid ? 'text-white/70' : 'text-text-tertiary'}`}>{msg.senderName}</p>
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-surface border border-border-light rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                <button onClick={handleSendMessage}
                                    className="btn btn-primary px-4 py-2.5 flex items-center gap-1.5 text-sm"><Send size={14} /> Send</button>
                            </div>
                        </div>
                    )}

                    {/* Compliance */}
                    {tab === 'compliance' && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-text-primary">Compliance Checkpoints</h3>
                            {complianceCheckpoints.length === 0 ? (
                                <div className="text-sm text-text-secondary bg-surface-element rounded-lg p-4">
                                    No compliance checkpoints defined for this project yet.
                                </div>
                            ) : complianceCheckpoints.map((cp, i) => (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${cp.status === 'complete' ? 'border-success/15 bg-success/3' : 'border-border-light'
                                    }`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${cp.status === 'complete' ? 'bg-success text-white' : 'bg-surface-element text-text-tertiary'
                                        }`}>
                                        {cp.status === 'complete' ? <Check size={13} /> : <Clock size={13} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-text-primary">{cp.label}</p>
                                        {cp.date && <p className="text-[10px] text-text-tertiary">{cp.date}</p>}
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cp.status === 'complete' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                        }`}>{cp.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
