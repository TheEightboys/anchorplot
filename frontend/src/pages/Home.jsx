import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, Map, BarChart2, Building, ArrowRight, Zap, ChevronRight, Building2, Lock, UserCheck, FileText, Scale, CheckCircle2, ChevronDown, Star } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const FAQS = [
    { q: 'How does controlled disclosure work?', a: 'Owners list properties with normalized attributes only — city, neighborhood band, lot size range, zoning district, and build potential. No exact address, parcel ID, or identity is exposed until a gated stage is completed, including accepted pitch, attorney selection, and platform fee acknowledgment.' },
    { q: 'Who needs attorney involvement?', a: 'If your property is in a jurisdiction requiring attorney involvement (such as NY, NJ, or CT), AnchorPlot blocks progression until a platform-vetted attorney or invited independent counsel with confirmed bar number is selected. The platform never provides legal advice.' },
    { q: 'What is the AnchorPlot Match Score?', a: 'The Match Score is a proprietary algorithm that considers normalized property attributes, developer specialization, investor criteria, and zoning compatibility to generate an explainable score for each listing-pitch pairing.' },
    { q: 'How does the equity ledger work?', a: 'Every project has a live equity ledger tracking ownership percentages for owners, developers, investors, and optional realtor carried equity (capped at 1%). Vesting conditions, distribution records, and payment logs are stored with traceable transaction IDs.' },
    { q: 'Is there support for affordable housing?', a: 'Yes. Owners can opt into affordable or mixed-income units at listing time, selecting AMI targets and affordability terms. The platform matches these to developers with affordable housing experience and tracks public funding program compliance.' },
];

const Home = () => {
    const container = useRef();
    const [openFaq, setOpenFaq] = useState(null);

    useGSAP(() => {
        // Enhanced hero animation with stagger and bounce
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.hero-pill', { 
            y: 30, 
            opacity: 0, 
            duration: 0.8,
            ease: 'back.out(1.7)',
            clearProps: 'transform,opacity'
        })
        .from('.hero-h1 .line-1', { 
            y: 60, 
            opacity: 0, 
            duration: 0.9,
            ease: 'power4.out',
            clearProps: 'transform,opacity'
        }, '-=0.4')
        .from('.hero-h1 .line-2', { 
            y: 60, 
            opacity: 0, 
            duration: 0.9,
            ease: 'power4.out',
            clearProps: 'transform,opacity'
        }, '-=0.7')
        .from('.hero-sub', { 
            y: 30, 
            opacity: 0, 
            duration: 0.7,
            ease: 'power2.out',
            clearProps: 'transform,opacity'
        }, '-=0.5')
        .from('.hero-actions > *', { 
            y: 30, 
            opacity: 0, 
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.5)',
            clearProps: 'transform,opacity'
        }, '-=0.4')
        .from('.hero-trust', { 
            y: 20, 
            opacity: 0, 
            duration: 0.6,
            clearProps: 'transform,opacity'
        }, '-=0.3')
        .from('.hero-animation-container', { 
            y: 60, 
            opacity: 0, 
            scale: 0.9,
            duration: 1,
            ease: 'back.out(1.7)',
            clearProps: 'transform,opacity'
        }, '-=0.6');

        // Enhanced feature cards with 3D effect
        gsap.from('.feature-card-premium', {
            scrollTrigger: { 
                trigger: '.features-section', 
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 50, 
            opacity: 0,
            rotationX: 15,
            duration: 0.8, 
            stagger: 0.15,
            ease: 'power3.out', 
            clearProps: 'transform,opacity'
        });

        // Timeline steps with cascade effect
        gsap.from('.timeline-step', {
            scrollTrigger: { 
                trigger: '.how-it-works-section', 
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            x: -50,
            y: 30, 
            opacity: 0, 
            duration: 0.7, 
            stagger: 0.2,
            ease: 'power2.out', 
            clearProps: 'transform,opacity'
        });

        // Testimonials with scale effect
        gsap.from('.testimonial-card', {
            scrollTrigger: { 
                trigger: '.testimonials-section', 
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 40, 
            opacity: 0,
            scale: 0.95,
            duration: 0.7, 
            stagger: 0.15,
            ease: 'back.out(1.5)', 
            clearProps: 'transform,opacity'
        });

        // Network nodes with bounce
        gsap.from('.network-node', {
            scrollTrigger: { 
                trigger: '.network-section', 
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            scale: 0.9, 
            opacity: 0, 
            duration: 0.6, 
            stagger: 0.12,
            ease: 'back.out(2)', 
            clearProps: 'transform,opacity'
        });

        // Process steps with slide effect
        gsap.from('.process-step', {
            scrollTrigger: { 
                trigger: '.network-section', 
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            x: 40, 
            opacity: 0, 
            duration: 0.6, 
            stagger: 0.15,
            ease: 'power2.out', 
            clearProps: 'transform,opacity'
        });

        // FAQ items with stagger
        gsap.from('.faq-item', {
            scrollTrigger: { 
                trigger: '.faq-section', 
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 30, 
            opacity: 0, 
            duration: 0.5, 
            stagger: 0.08,
            ease: 'power2.out', 
            clearProps: 'transform,opacity'
        });

        // CTA with scale effect
        gsap.from('.cta-inner', {
            scrollTrigger: { 
                trigger: '.cta-section', 
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 40, 
            opacity: 0,
            scale: 0.95,
            duration: 0.8,
            ease: 'back.out(1.5)', 
            clearProps: 'transform,opacity'
        });
    }, { scope: container });

    return (
        <div className="w-full" ref={container}>

            {/* ===== HERO ===== */}
            <section className="hero-section">
                <div className="hero-noise" />
                <div className="hero-glow-1" />
                <div className="hero-glow-2" />

                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Copy */}
                    <div className="flex flex-col">
                        <div className="hero-pill">
                            <span className="pill-dot" />
                            Next-Gen Real Estate Structuring
                        </div>

                        <h1 className="hero-h1 text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 text-white">
                            <span className="line-1 block">Unlock Development</span>
                            <span className="line-2 block hero-gradient-text">Value at Scale.</span>
                        </h1>

                        <p className="hero-sub text-base sm:text-lg md:text-xl leading-relaxed mb-10 max-w-xl" style={{ color: 'rgba(255,255,255,0.95)' }}>
                            The controlled-disclosure marketplace connecting landowners with developers and investors.
                            Navigate zoning shifts, structure joint ventures, and execute projects seamlessly.
                        </p>

                        <div className="hero-actions flex flex-col sm:flex-row gap-3 items-start">
                            <NavLink to="/app"
                                className="hero-cta-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-base text-[#0d2b1a] bg-white hover:bg-gray-100 transition-all shadow-lg shadow-black/30 group relative overflow-hidden">
                                <span className="relative z-10">Get Started Free</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform relative z-10" />
                            </NavLink>
                            <a href="#how-it-works"
                                className="hero-cta-secondary inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-base border text-white border-white/30 hover:border-white/50 hover:bg-white/10 transition-all relative overflow-hidden group">
                                <span className="relative z-10">How It Works</span>
                            </a>
                        </div>

                        <div className="hero-trust flex items-center gap-3 mt-10" style={{ color: 'rgba(255,255,255,0.85)' }}>
                            <Lock size={13} />
                            <span className="text-sm font-medium">KYC verified · Attorney-gated · Encrypted deal rooms</span>
                        </div>
                    </div>

                    {/* Right Graphic — Animated SVG Illustration */}
                    <div className="hidden lg:flex items-center justify-center">
                        <div className="hero-animation-container w-full max-w-[500px] relative">
                            <svg
                                viewBox="0 0 500 500"
                                className="w-full h-auto"
                                style={{ filter: 'drop-shadow(0 20px 60px rgba(78, 200, 120, 0.4))' }}
                            >
                                {/* Background Circle */}
                                <circle
                                    cx="250"
                                    cy="250"
                                    r="200"
                                    fill="rgba(78, 200, 120, 0.1)"
                                    className="animate-pulse-slow"
                                />
                                
                                {/* Main Building */}
                                <rect
                                    x="160"
                                    y="120"
                                    width="180"
                                    height="260"
                                    rx="12"
                                    fill="#4ec878"
                                    stroke="#1e5631"
                                    strokeWidth="4"
                                    className="building-main"
                                />
                                
                                {/* Windows */}
                                {[0, 1, 2, 3, 4].map((row) =>
                                    [0, 1, 2].map((col) => (
                                        <rect
                                            key={`${row}-${col}`}
                                            x={180 + col * 50}
                                            y={150 + row * 45}
                                            width="30"
                                            height="30"
                                            rx="4"
                                            fill="rgba(255, 255, 255, 0.9)"
                                            className="window"
                                            style={{
                                                animation: `windowGlow 3s ease-in-out infinite`,
                                                animationDelay: `${(row + col) * 0.2}s`
                                            }}
                                        />
                                    ))
                                )}
                                
                                {/* Door */}
                                <rect
                                    x="220"
                                    y="330"
                                    width="60"
                                    height="50"
                                    rx="6"
                                    fill="#1e5631"
                                />
                                
                                {/* Roof */}
                                <path
                                    d="M 150 120 L 250 60 L 350 120 Z"
                                    fill="#2d5a3a"
                                    stroke="#1e5631"
                                    strokeWidth="3"
                                />
                                
                                {/* Side Buildings */}
                                <rect
                                    x="100"
                                    y="200"
                                    width="50"
                                    height="180"
                                    rx="8"
                                    fill="#5db075"
                                    stroke="#1e5631"
                                    strokeWidth="3"
                                    opacity="0.8"
                                />
                                
                                <rect
                                    x="350"
                                    y="180"
                                    width="50"
                                    height="200"
                                    rx="8"
                                    fill="#5db075"
                                    stroke="#1e5631"
                                    strokeWidth="3"
                                    opacity="0.8"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>





            {/* ===== FEATURES ===== */}
            <section id="features" className="features-section">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="max-w-3xl mb-16">
                        <div className="section-label">
                            <span className="w-6 h-px bg-primary block" />
                            Platform Capabilities
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-tight mb-5">
                            Everything You Need,<br />In One Platform.
                        </h2>
                        <p className="text-lg text-text-secondary leading-relaxed">
                            From zoning intelligence to JV execution, AnchorPlot handles the entire development lifecycle with enterprise-grade security.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="feature-card-premium accent-blue flex flex-col h-full">
                            <div className="feature-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
                                <Map size={26} />
                            </div>
                            <p className="text-xs font-bold tracking-widest uppercase text-text-secondary mb-3">Zoning Intelligence</p>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Real-Time Zoning Alerts</h3>
                            <p className="text-text-secondary leading-relaxed flex-1">
                                Automated GIS layer ingestion and legislative feed parsing. Instant impact reports on density, height, and FAR intersected with your parcel portfolio.
                            </p>
                            <NavLink to="/app/zoning" className="inline-flex items-center gap-1 mt-6 font-bold text-sm" style={{ color: '#2563eb' }}>
                                View Dashboard <ChevronRight size={14} />
                            </NavLink>
                        </div>

                        <div className="feature-card-premium accent-green flex flex-col h-full">
                            <div className="feature-icon-wrap" style={{ background: '#f0fdf4', color: '#15803d' }}>
                                <BarChart2 size={26} />
                            </div>
                            <p className="text-xs font-bold tracking-widest uppercase text-text-secondary mb-3">Marketplace</p>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Anonymized Deal Discovery</h3>
                            <p className="text-text-secondary leading-relaxed flex-1">
                                Owners list without exposing exact addresses. Filter by normalized attributes, AnchorPlot Match scores, and development potential.
                            </p>
                            <NavLink to="/app/marketplace" className="inline-flex items-center gap-1 mt-6 font-bold text-sm" style={{ color: '#15803d' }}>
                                Explore Deals <ChevronRight size={14} />
                            </NavLink>
                        </div>

                        <div className="feature-card-premium accent-purple flex flex-col h-full">
                            <div className="feature-icon-wrap" style={{ background: '#fdf4ff', color: '#7e22ce' }}>
                                <Building size={26} />
                            </div>
                            <p className="text-xs font-bold tracking-widest uppercase text-text-secondary mb-3">JV Deal Room</p>
                            <h3 className="text-xl font-bold text-text-primary mb-3">Encrypted Deal Workspace</h3>
                            <p className="text-text-secondary leading-relaxed flex-1">
                                Milestone tracking, automated JV agreements, e-signatures, live equity ledgers, and attorney-gated messaging in secure workspaces.
                            </p>
                            <NavLink to="/app/deal-room" className="inline-flex items-center gap-1 mt-6 font-bold text-sm" style={{ color: '#7e22ce' }}>
                                Enter Deal Room <ChevronRight size={14} />
                            </NavLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section id="how-it-works" className="how-it-works-section">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="section-label justify-center">
                            <span className="w-6 h-px bg-primary block" />
                            How AnchorPlot Works
                            <span className="w-6 h-px bg-primary block" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                            From Listing to Completion
                        </h2>
                    </div>

                    <div className="flex flex-col gap-10">
                        {[
                            { n: '1', icon: UserCheck, title: 'Owner Creates Anonymized Listing', desc: 'Property attributes are normalized — city, zoning district, lot size range, build potential. No exact address or owner identity is exposed.' },
                            { n: '2', icon: BarChart2, title: 'Developers Submit Structured Pitches', desc: 'Developers browse anonymized listings, assess match scores, and submit structured development proposals with pro-formas.' },
                            { n: '3', icon: Scale, title: 'Attorney Selection & Compliance Gate', desc: 'In restricted jurisdictions, AnchorPlot requires vetted attorney selection before deal progression. All consents and disclosures are logged.' },
                            { n: '4', icon: FileText, title: 'JV Agreement & Milestone Tracking', desc: 'A project workspace is created with automated term sheets, e-signatures, equity ledgers, budget tracking, and progress payments.' },
                            { n: '5', icon: CheckCircle2, title: 'Completion & Property Management', desc: 'Post-completion, projects transition to a property management phase with rent roll, compliance reporting, and investor portfolio views.' },
                        ].map((step, i, arr) => (
                            <div key={step.n} className="timeline-step">
                                <div className="relative">
                                    <div className="timeline-dot">{step.n}</div>
                                    {i < arr.length - 1 && <div className="timeline-connector" />}
                                </div>
                                <div className="pt-2 pb-4">
                                    <h3 className="text-lg font-bold text-text-primary mb-2">{step.title}</h3>
                                    <p className="text-text-secondary leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== NETWORK / ECOSYSTEM ===== */}
            <section id="network" className="network-section">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                        {/* Left - Nodes */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="network-node col-span-2 flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#f0fdf4' }}>
                                    <ShieldCheck size={28} style={{ color: '#16a34a' }} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-primary text-lg">Legal Gateway</h4>
                                    <p className="text-sm text-text-secondary mt-1">Jurisdiction-gated access requiring verified attorney oversight for every transaction.</p>
                                </div>
                            </div>
                            <div className="network-node">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#eff6ff' }}>
                                    <Building2 size={20} style={{ color: '#2563eb' }} />
                                </div>
                                <h4 className="font-bold text-text-primary mb-1">Landowners</h4>
                                <p className="text-sm text-text-secondary">Unlock passive value without public listing or immediate sale.</p>
                            </div>
                            <div className="network-node">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: '#fdf4ff' }}>
                                    <Zap size={20} style={{ color: '#7e22ce' }} />
                                </div>
                                <h4 className="font-bold text-text-primary mb-1">Developers</h4>
                                <p className="text-sm text-text-secondary">Source off-market deals pre-screened for structured pitches.</p>
                            </div>
                        </div>

                        {/* Right - Process */}
                        <div>
                            <div className="section-label">
                                <span className="w-6 h-px bg-primary block" />
                                Trusted Ecosystem
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight mb-10">
                                Built for the Entire<br />Deal Lifecycle.
                            </h2>

                            <div className="flex flex-col gap-8">
                                {[
                                    { n: '01', title: 'Vetted Professionals Only', body: 'KYC Level 2 for investors. Required attorney selection in restricted jurisdictions. Verified developer credentials.' },
                                    { n: '02', title: 'Controlled Disclosure', body: 'Parcels and identities remain masked until multi-stage gated NDA, protecting both parties from circumvention.' },
                                    { n: '03', title: 'Affordable Housing Built In', body: 'Opt-in frameworks for mixed-income developments, AMI targeting, density bonuses, and public funding compliance tracking.' },
                                ].map(step => (
                                    <div key={step.n} className="process-step">
                                        <div className="step-num shrink-0">{step.n}</div>
                                        <div>
                                            <h4 className="font-bold text-text-primary text-base mb-1">{step.title}</h4>
                                            <p className="text-sm text-text-secondary leading-relaxed">{step.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="testimonials-section">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="section-label justify-center">
                            <span className="w-6 h-px bg-primary block" />
                            What Professionals Say
                            <span className="w-6 h-px bg-primary block" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                            Trusted by Industry Leaders
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Sarah Chen', title: 'Real Estate Attorney, Chen & Associates', quote: 'AnchorPlot\'s attorney gating is exactly what the industry needed. For the first time, I can ensure my clients are protected at every stage of a joint venture without manual oversight.', stars: 5 },
                            { name: 'Marcus Rivera', title: 'Development Director, Eastgate Partners', quote: 'The anonymized marketplace changed how we source deals. We submit structured pitches to verified opportunities we would never find through traditional channels.', stars: 5 },
                            { name: 'Jennifer Walsh', title: 'Portfolio Manager, Canyon Capital', quote: 'The equity ledger and milestone tracking give us real-time visibility into projects. Distribution records with traceable transaction IDs — that\'s institutional-grade infrastructure.', stars: 5 },
                        ].map(t => (
                            <div key={t.name} className="testimonial-card flex flex-col">
                                <div className="flex items-center gap-0.5 mb-4">
                                    {Array.from({ length: t.stars }).map((_, i) => (
                                        <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-text-secondary leading-relaxed flex-1 mb-6">"{t.quote}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-border-light">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                                        {t.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-primary">{t.name}</p>
                                        <p className="text-xs text-text-secondary">{t.title}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FAQ ===== */}
            <section className="faq-section">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="section-label justify-center">
                            <span className="w-6 h-px bg-primary block" />
                            Frequently Asked Questions
                            <span className="w-6 h-px bg-primary block" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                            Have Questions?
                        </h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        {FAQS.map((faq, i) => (
                            <div
                                key={i}
                                className="faq-item"
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <h3 className="font-bold text-text-primary text-sm">{faq.q}</h3>
                                    <ChevronDown
                                        size={16}
                                        className={`text-text-secondary shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                {openFaq === i && (
                                    <p className="text-sm text-text-secondary leading-relaxed mt-3 pt-3 border-t border-border-light">
                                        {faq.a}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="cta-section">
                <div className="max-w-3xl mx-auto px-6 text-center cta-inner">
                    <div className="section-label justify-center mb-6">
                        <span className="w-6 h-px bg-primary block" />
                        Get Started Today
                        <span className="w-6 h-px bg-primary block" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-5">
                        Ready to Structure<br />Your Next Deal?
                    </h2>
                    <p className="text-lg text-text-secondary mb-10 leading-relaxed">
                        Join a vetted network of landowners, developers, and investors. Access the full AnchorPlot platform today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <NavLink to="/app" className="btn btn-primary text-base px-8 py-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            Enter the Dashboard
                        </NavLink>
                        <NavLink to="/signup" className="btn btn-secondary text-base px-8 py-4">
                            Create Free Account
                        </NavLink>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
