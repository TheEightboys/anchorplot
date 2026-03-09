import React from 'react';

const sectionTitleClass = 'text-lg md:text-xl font-bold text-text-primary uppercase tracking-wide';
const paragraphClass = 'text-sm md:text-base text-text-secondary leading-relaxed';
const bulletListClass = 'list-disc pl-5 space-y-1 text-sm md:text-base text-text-secondary';

const Security = () => {
    return (
        <div className="min-h-screen bg-background pt-28 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-surface border border-border-light rounded-2xl p-6 md:p-10 shadow-sm">
                    <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-6 uppercase tracking-tight">ANCHORPLOT SECURITY</h1>
                    
                    <div className="space-y-4 mb-10">
                        <p className={paragraphClass}>
                            AnchorPlot is designed as secure housing infrastructure that connects property owners, developers, investors, real estate professionals, attorneys and property managers while protecting sensitive property information and project data.
                        </p>
                        <p className={paragraphClass}>
                            Unlike traditional marketplaces that publicly publish addresses and owner details, AnchorPlot uses a controlled disclosure model that prioritizes privacy, transparency and project integrity.
                        </p>
                        <div className="mt-4">
                            <p className="font-semibold text-text-primary text-sm md:text-base mb-2">Our security framework focuses on four core principles:</p>
                            <ul className={bulletListClass}>
                                <li>Protecting property owner privacy</li>
                                <li>Maintaining marketplace integrity</li>
                                <li>Safeguarding financial and project data</li>
                                <li>Enabling trusted collaboration between participants</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>PLATFORM ARCHITECTURE</h2>
                            <p className={paragraphClass}>
                                AnchorPlot is built as a controlled infrastructure platform for redevelopment projects. The system coordinates multiple stakeholders while limiting unnecessary exposure of sensitive information.
                            </p>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-text-primary">Role-based access</h3>
                                    <p className={paragraphClass}>Different user types receive different levels of information access depending on their role in a project.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">Controlled data disclosure</h3>
                                    <p className={paragraphClass}>Sensitive information is revealed only when required workflow conditions are satisfied.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">Project workspaces</h3>
                                    <p className={paragraphClass}>Each redevelopment project operates within a structured digital workspace where documents, communications and milestones are tracked.</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">Audit logging</h3>
                                    <p className={paragraphClass}>Key platform activities may be logged to maintain accountability and provide transaction transparency.</p>
                                </div>
                            </div>
                            <p className={`${paragraphClass} mt-4 italic`}>
                                This architecture allows users to collaborate safely without exposing sensitive information prematurely.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>CONTROLLED DISCLOSURE MODEL</h2>
                            <p className={paragraphClass}>
                                AnchorPlot protects property owners by limiting public exposure of identifying property information.
                            </p>
                            <div className="space-y-2">
                                <p className="font-semibold text-text-primary text-sm md:text-base">Before a project reaches an approved stage, certain details may remain masked, including:</p>
                                <ul className={bulletListClass}>
                                    <li>Exact property address</li>
                                    <li>Parcel identifiers</li>
                                    <li>Owner name and direct contact information</li>
                                    <li>Detailed property documentation</li>
                                </ul>
                            </div>
                            <div className="space-y-2 mt-4">
                                <p className="font-semibold text-text-primary text-sm md:text-base">Developers and investors may initially see normalized information necessary to evaluate opportunities such as:</p>
                                <ul className={bulletListClass}>
                                    <li>Approximate location</li>
                                    <li>Zoning classification</li>
                                    <li>Development potential</li>
                                    <li>General project parameters</li>
                                </ul>
                            </div>
                            <div className="space-y-2 mt-4">
                                <p className="font-semibold text-text-primary text-sm md:text-base">Identifying information is released only after required platform steps are completed. These steps may include:</p>
                                <ul className={bulletListClass}>
                                    <li>Identity verification</li>
                                    <li>Acceptance of platform terms</li>
                                    <li>Attorney participation where required by law</li>
                                    <li>Deal structure review</li>
                                    <li>Project approval within the platform workflow</li>
                                </ul>
                            </div>
                            <p className={`${paragraphClass} mt-4 font-medium`}>
                                This model protects homeowners from unwanted solicitation and prevents misuse of property data.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>ANTI-CIRCUMVENTION PROTECTION</h2>
                            <p className={paragraphClass}>
                                AnchorPlot includes safeguards designed to protect the integrity of the platform and ensure fair participation. The platform prevents users from bypassing AnchorPlot to negotiate or complete transactions outside the platform after being introduced through it.
                            </p>
                            <div className="space-y-2">
                                <p className="font-semibold text-text-primary text-sm md:text-base">Safeguards may include:</p>
                                <ul className={bulletListClass}>
                                    <li>Masked property listings</li>
                                    <li>Staged release of identifying information</li>
                                    <li>Internal messaging systems</li>
                                    <li>Document access controls</li>
                                    <li>Activity monitoring and audit records</li>
                                </ul>
                            </div>
                            <p className={`${paragraphClass} mt-4`}>
                                These protections ensure that redevelopment opportunities occur within a structured environment where all participants are treated fairly.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>IDENTITY AND PROFESSIONAL VERIFICATION</h2>
                            <p className={paragraphClass}>
                                To maintain trust across the platform, AnchorPlot may verify certain user credentials.
                            </p>
                            <div className="space-y-2">
                                <p className="font-semibold text-text-primary text-sm md:text-base">Verification may include:</p>
                                <ul className={bulletListClass}>
                                    <li>Identity confirmation</li>
                                    <li>Professional license verification for attorneys and real estate professionals</li>
                                    <li>Business registration checks</li>
                                    <li>Compliance screening when necessary</li>
                                </ul>
                            </div>
                            <p className={`${paragraphClass} mt-4`}>
                                These checks help ensure that users interacting on the platform represent legitimate participants in redevelopment projects.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>PROJECT WORKFLOW AND TRANSPARENCY</h2>
                            <p className={paragraphClass}>
                                AnchorPlot structures redevelopment projects through defined workflow stages.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-2">
                                    <p className="font-semibold text-text-primary text-sm md:text-base">These stages may include:</p>
                                    <ul className={bulletListClass}>
                                        <li>Opportunity creation</li>
                                        <li>Developer and investor matching</li>
                                        <li>Project negotiation</li>
                                        <li>Legal agreement execution</li>
                                        <li>Redevelopment planning</li>
                                        <li>Construction milestones</li>
                                        <li>Property stabilization and management</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold text-text-primary text-sm md:text-base">Each project workspace may include:</p>
                                    <ul className={bulletListClass}>
                                        <li>Document storage</li>
                                        <li>Project communications</li>
                                        <li>Milestone tracking</li>
                                        <li>Role-based permissions</li>
                                        <li>Financial and reporting records where applicable</li>
                                    </ul>
                                </div>
                            </div>
                            <p className={`${paragraphClass} mt-4`}>
                                This structure helps maintain transparency and accountability throughout the life of a project.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>DATA SECURITY PRACTICES</h2>
                            <p className={paragraphClass}>
                                AnchorPlot uses modern security practices to protect user information and platform data.
                            </p>
                            <div className="space-y-2">
                                <p className="font-semibold text-text-primary text-sm md:text-base">Security practices may include:</p>
                                <ul className={bulletListClass}>
                                    <li>Encryption of data in transit</li>
                                    <li>Secure infrastructure hosting</li>
                                    <li>Role-based access controls</li>
                                    <li>Restricted administrative access</li>
                                    <li>Activity logging and monitoring</li>
                                    <li>System vulnerability management</li>
                                </ul>
                            </div>
                            <p className={`${paragraphClass} mt-4 italic`}>
                                While no internet service can guarantee absolute security, AnchorPlot is designed to reduce risk and protect user data using layered safeguards.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>SERVICE PROVIDERS</h2>
                            <p className={paragraphClass}>
                                AnchorPlot may rely on trusted service providers to operate certain components of the platform.
                            </p>
                            <div className="space-y-2">
                                <p className="font-semibold text-text-primary text-sm md:text-base">These providers may include services related to:</p>
                                <ul className={bulletListClass}>
                                    <li>Cloud hosting</li>
                                    <li>Identity verification</li>
                                    <li>Payment processing</li>
                                    <li>Electronic signatures</li>
                                    <li>Communications infrastructure</li>
                                    <li>Analytics and system monitoring</li>
                                </ul>
                            </div>
                            <p className={`${paragraphClass} mt-4`}>
                                These providers are contractually restricted from using personal information for their own marketing or unrelated purposes.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>PUBLIC SECTOR AND HOUSING PROGRAM COLLABORATION</h2>
                            <div className="space-y-2">
                                <p className="font-semibold text-text-primary text-sm md:text-base">Some redevelopment projects on AnchorPlot may involve:</p>
                                <ul className={bulletListClass}>
                                    <li>Affordable housing programs</li>
                                    <li>Public funding initiatives</li>
                                    <li>Zoning change tracking</li>
                                    <li>Redevelopment reporting</li>
                                </ul>
                            </div>
                            <p className={`${paragraphClass} mt-4`}>
                                Where necessary, limited information may be shared with relevant government agencies or program administrators to support compliance with housing programs or legal requirements.
                            </p>
                            <p className={paragraphClass}>
                                Whenever possible, aggregated or project-level data is used instead of unnecessary personal information.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>AGGREGATED DATA AND PLATFORM INSIGHTS</h2>
                            <p className={paragraphClass}>
                                AnchorPlot may analyze platform activity to understand broader housing and redevelopment trends.
                            </p>
                            <div className="space-y-2">
                                <p className="font-semibold text-text-primary text-sm md:text-base">This may include:</p>
                                <ul className={bulletListClass}>
                                    <li>Redevelopment activity patterns</li>
                                    <li>Housing production metrics</li>
                                    <li>Zoning change impacts</li>
                                    <li>Capital deployment trends</li>
                                </ul>
                            </div>
                            <p className={`${paragraphClass} mt-4`}>
                                These insights help improve the platform and support housing research. Aggregated datasets do not identify individual users or specific properties.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>USER RESPONSIBILITY</h2>
                            <p className={paragraphClass}>
                                Users play an important role in maintaining a secure environment.
                            </p>
                            <div className="space-y-2">
                                <p className="font-semibold text-text-primary text-sm md:text-base">Users should:</p>
                                <ul className={bulletListClass}>
                                    <li>Protect account credentials</li>
                                    <li>Use strong passwords</li>
                                    <li>Verify counterparties during transactions</li>
                                    <li>Review agreements carefully before signing</li>
                                    <li>Report suspicious activity to AnchorPlot</li>
                                </ul>
                            </div>
                            <p className={`${paragraphClass} mt-4 font-medium`}>
                                Users are responsible for protecting confidential information shared within project workspaces.
                            </p>
                        </section>

                        <div className="pt-8 mt-12 border-t border-border-light space-y-8">
                            <section className="space-y-3">
                                <h2 className={sectionTitleClass}>REPORTING SECURITY CONCERNS</h2>
                                <p className={paragraphClass}>
                                    If you believe you have identified a security vulnerability or suspicious activity, please contact:
                                </p>
                                <p className={paragraphClass}>
                                    <a href="mailto:security@anchorplot.com" className="text-primary font-semibold hover:underline">
                                        security@anchorplot.com
                                    </a>
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className={sectionTitleClass}>CONTACT</h2>
                                <p className={paragraphClass}>AnchorPlot, Inc.</p>
                                <p className={paragraphClass}>Newark, Delaware 19713</p>
                                <div className="mt-4 space-y-1">
                                    <p className={paragraphClass}>
                                        <span className="font-semibold text-text-primary">Security inquiries:</span>{' '}
                                        <a href="mailto:security@anchorplot.com" className="text-primary hover:underline">security@anchorplot.com</a>
                                    </p>
                                    <p className={paragraphClass}>
                                        <span className="font-semibold text-text-primary">Legal inquiries:</span>{' '}
                                        <a href="mailto:legal@anchorplot.com" className="text-primary hover:underline">legal@anchorplot.com</a>
                                    </p>
                                    <p className={paragraphClass}>
                                        <span className="font-semibold text-text-primary">Privacy inquiries:</span>{' '}
                                        <a href="mailto:privacy@anchorplot.com" className="text-primary hover:underline">privacy@anchorplot.com</a>
                                    </p>
                                </div>
                            </section>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Security;
