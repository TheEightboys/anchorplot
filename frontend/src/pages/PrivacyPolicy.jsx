import React from 'react';

const sectionTitleClass = 'text-lg md:text-xl font-bold text-text-primary';
const paragraphClass = 'text-sm md:text-base text-text-secondary leading-relaxed';
const bulletListClass = 'list-disc pl-5 space-y-1 text-sm md:text-base text-text-secondary';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background pt-28 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-surface border border-border-light rounded-2xl p-6 md:p-10">
                    <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">ANCHORPLOT PRIVACY POLICY</h1>
                    <p className={paragraphClass}>Effective Date: [Insert Date]</p>
                    <p className={paragraphClass}>Last Updated: [Insert Date]</p>

                    <div className="space-y-4 mt-6">
                        <p className={paragraphClass}>
                            AnchorPlot, Inc. ("AnchorPlot," "we," "our," or "us") operates a housing infrastructure platform
                            that connects property owners, developers, investors, attorneys, real estate professionals and
                            property managers to coordinate redevelopment projects and housing opportunities.
                        </p>
                        <p className={paragraphClass}>
                            This Privacy Policy explains how we collect, use, disclose and protect personal information when
                            you use our website, applications and services.
                        </p>
                        <p className={paragraphClass}>
                            By using AnchorPlot, you agree to the collection and use of information in accordance with this
                            Privacy Policy.
                        </p>
                    </div>

                    <div className="space-y-8 mt-10">
                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>1. INFORMATION WE COLLECT</h2>
                            <p className={paragraphClass}>We may collect the following categories of information.</p>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Account Information</h3>
                                <p className={paragraphClass}>When you create an account we may collect:</p>
                                <ul className={bulletListClass}>
                                    <li>name</li>
                                    <li>email address</li>
                                    <li>phone number</li>
                                    <li>mailing address</li>
                                    <li>company or organization name</li>
                                    <li>user role (owner, developer, investor, attorney, realtor, property manager, etc.)</li>
                                    <li>login credentials and preferences</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Verification and Compliance Information</h3>
                                <p className={paragraphClass}>To support identity verification and regulatory compliance we may collect:</p>
                                <ul className={bulletListClass}>
                                    <li>government identification information</li>
                                    <li>professional license information</li>
                                    <li>business registration information</li>
                                    <li>tax documentation</li>
                                    <li>identity verification data</li>
                                    <li>KYC or compliance screening results</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Property and Project Information</h3>
                                <p className={paragraphClass}>When users create opportunities or participate in projects we may collect:</p>
                                <ul className={bulletListClass}>
                                    <li>property characteristics</li>
                                    <li>zoning and redevelopment preferences</li>
                                    <li>project plans, budgets and timelines</li>
                                    <li>affordable housing selections</li>
                                    <li>funding program information</li>
                                    <li>project documentation and files</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Communications and Project Workspace Data</h3>
                                <p className={paragraphClass}>We may collect communications and documents shared within project workspaces including:</p>
                                <ul className={bulletListClass}>
                                    <li>messages</li>
                                    <li>project proposals and pitches</li>
                                    <li>documents and attachments</li>
                                    <li>deal room communications</li>
                                    <li>electronic signatures and acknowledgments</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Financial and Transaction Information</h3>
                                <p className={paragraphClass}>When payments or subscriptions are processed we may collect:</p>
                                <ul className={bulletListClass}>
                                    <li>billing records</li>
                                    <li>payment transaction information</li>
                                    <li>subscription data</li>
                                    <li>payout records</li>
                                </ul>
                                <p className={paragraphClass}>
                                    Payment processing may be handled by third-party payment providers, and AnchorPlot does
                                    not store full payment card information.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Technical and Usage Information</h3>
                                <p className={paragraphClass}>When users access the platform we may collect certain technical information including:</p>
                                <ul className={bulletListClass}>
                                    <li>IP address</li>
                                    <li>browser type</li>
                                    <li>device identifiers</li>
                                    <li>operating system</li>
                                    <li>session activity and usage logs</li>
                                    <li>referring websites</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Public and Third-Party Data Sources</h3>
                                <p className={paragraphClass}>To support platform features we may incorporate publicly available or licensed data such as:</p>
                                <ul className={bulletListClass}>
                                    <li>zoning maps and GIS datasets</li>
                                    <li>municipal redevelopment records</li>
                                    <li>public property records</li>
                                    <li>legislative or ordinance updates</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className={sectionTitleClass}>2. HOW WE USE INFORMATION</h2>
                            <p className={paragraphClass}>We may use information to:</p>
                            <ul className={bulletListClass}>
                                <li>operate and maintain the AnchorPlot platform</li>
                                <li>create and manage user accounts</li>
                                <li>verify identities and credentials</li>
                                <li>match property owners with developers, investors and other participants</li>
                                <li>generate and manage project workspaces and agreements</li>
                                <li>process subscriptions, payments and payouts</li>
                                <li>deliver zoning alerts and redevelopment insights</li>
                                <li>support affordable housing and funding workflows</li>
                                <li>provide customer support</li>
                                <li>communicate service updates and important notices</li>
                                <li>improve the functionality and security of the platform</li>
                                <li>detect fraud, abuse or unauthorized activity</li>
                                <li>comply with legal and regulatory obligations</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>3. CONTROLLED DISCLOSURE AND DATA SHARING</h2>
                            <p className={paragraphClass}>
                                AnchorPlot is designed to minimize unnecessary exposure of personal information and property
                                data. Unlike traditional real estate marketplaces that publicly publish addresses and owner
                                information, AnchorPlot uses a controlled disclosure model to protect users and reduce the
                                risk of circumvention, harassment or misuse of data.
                            </p>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Property and Identity Protection</h3>
                                <p className={paragraphClass}>
                                    When property owners create opportunities on the platform, AnchorPlot may mask or withhold
                                    identifying details such as:
                                </p>
                                <ul className={bulletListClass}>
                                    <li>exact property address</li>
                                    <li>parcel identifiers</li>
                                    <li>owner name and contact information</li>
                                    <li>direct communication channels</li>
                                </ul>
                                <p className={paragraphClass}>
                                    Developers, investors and other users may initially see only normalized information
                                    necessary to evaluate opportunities, such as general location, zoning category,
                                    approximate lot size, redevelopment potential and project parameters.
                                </p>
                                <p className={paragraphClass}>
                                    Identifying information is disclosed only when specific workflow conditions are satisfied,
                                    which may include identity verification, platform compliance checks, acceptance of
                                    platform terms, attorney participation where required by law, agreement on deal terms or
                                    other required steps in the project workflow.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Transaction and Project Collaboration</h3>
                                <p className={paragraphClass}>
                                    Once a project reaches an approved stage, AnchorPlot may share relevant information between
                                    participating parties, including property owners, developers, investors, attorneys,
                                    realtors, and property managers, in order to facilitate legitimate project coordination.
                                </p>
                                <p className={paragraphClass}>
                                    Information shared in this context is limited to what is reasonably necessary to complete
                                    the project, execute agreements, comply with laws, and manage redevelopment activities.
                                </p>
                                <p className={paragraphClass}>
                                    Participants may receive access to project workspaces, documents, communications, or
                                    compliance records based on their role in the project.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Service Providers</h3>
                                <p className={paragraphClass}>
                                    AnchorPlot may share information with trusted service providers who perform services on our
                                    behalf, such as:
                                </p>
                                <ul className={bulletListClass}>
                                    <li>cloud infrastructure and hosting providers</li>
                                    <li>payment processors</li>
                                    <li>identity verification providers</li>
                                    <li>document storage and electronic signature platforms</li>
                                    <li>communications and messaging providers</li>
                                    <li>analytics and security monitoring services</li>
                                </ul>
                                <p className={paragraphClass}>
                                    These providers may only process personal information to perform services for AnchorPlot
                                    and are contractually restricted from using the information for their own marketing or
                                    unrelated purposes.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Government and Compliance Sharing</h3>
                                <p className={paragraphClass}>
                                    Certain projects may involve public funding programs, affordable housing compliance
                                    requirements, zoning reporting or regulatory oversight. In these cases, AnchorPlot may
                                    provide limited information to relevant government agencies or program administrators when
                                    required to administer those programs or comply with applicable law.
                                </p>
                                <p className={paragraphClass}>
                                    Where possible, AnchorPlot provides aggregated or project-level data rather than unnecessary
                                    personal information.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className={sectionTitleClass}>4. NO SALE OF PERSONAL INFORMATION</h2>
                            <p className={paragraphClass}>AnchorPlot does not sell personal information.</p>
                            <p className={paragraphClass}>
                                We do not sell, rent or trade personal information to third parties for advertising,
                                marketing or data brokerage purposes.
                            </p>
                            <p className={paragraphClass}>
                                AnchorPlot&apos;s business model is based on software services, subscriptions, project
                                coordination tools and transaction infrastructure, not the sale of personal data.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className={sectionTitleClass}>5. PROTECTION AGAINST CIRCUMVENTION</h2>
                            <p className={paragraphClass}>
                                The platform includes safeguards designed to prevent users from bypassing AnchorPlot in order
                                to contact other participants directly or obtain restricted property information outside of
                                approved workflows.
                            </p>
                            <p className={paragraphClass}>These safeguards may include:</p>
                            <ul className={bulletListClass}>
                                <li>masked listings</li>
                                <li>staged release of information</li>
                                <li>internal messaging systems</li>
                                <li>document controls</li>
                                <li>activity logs and audit trails</li>
                            </ul>
                            <p className={paragraphClass}>
                                These controls are intended to protect users, preserve the integrity of the marketplace and
                                maintain fair participation for all parties.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className={sectionTitleClass}>6. AGGREGATED AND DE-IDENTIFIED DATA</h2>
                            <p className={paragraphClass}>
                                AnchorPlot may create aggregated or de-identified datasets derived from platform activity,
                                such as:
                            </p>
                            <ul className={bulletListClass}>
                                <li>redevelopment trends</li>
                                <li>housing production metrics</li>
                                <li>zoning change impacts</li>
                                <li>housing policy insights</li>
                            </ul>
                            <p className={paragraphClass}>
                                These datasets do not identify individual users or specific properties and may be used for
                                research, analytics, reporting or product improvement.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className={sectionTitleClass}>7. DATA SECURITY</h2>
                            <p className={paragraphClass}>
                                AnchorPlot implements administrative, technical and organizational safeguards designed to
                                protect personal information.
                            </p>
                            <p className={paragraphClass}>Security practices may include:</p>
                            <ul className={bulletListClass}>
                                <li>role-based access controls</li>
                                <li>encryption of data in transit</li>
                                <li>secure document storage</li>
                                <li>system monitoring and logging</li>
                                <li>access restrictions for sensitive information</li>
                            </ul>
                            <p className={paragraphClass}>
                                No online platform can guarantee absolute security, but we take reasonable measures to protect
                                user information.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className={sectionTitleClass}>8. DATA RETENTION</h2>
                            <p className={paragraphClass}>We retain personal information only as long as necessary to:</p>
                            <ul className={bulletListClass}>
                                <li>provide our services</li>
                                <li>maintain platform functionality</li>
                                <li>comply with legal obligations</li>
                                <li>resolve disputes</li>
                                <li>enforce platform agreements</li>
                                <li>protect against fraud or abuse</li>
                            </ul>
                            <p className={paragraphClass}>
                                Retention periods may vary depending on the type of data and applicable legal requirements.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className={sectionTitleClass}>9. CHILDREN</h2>
                            <p className={paragraphClass}>
                                AnchorPlot is intended for adults engaged in real estate and redevelopment activities.
                            </p>
                            <p className={paragraphClass}>Users must be at least 18 years old to create an account.</p>
                            <p className={paragraphClass}>
                                AnchorPlot does not knowingly collect personal information from children under 13. If we learn
                                that such information has been collected, we will promptly delete it.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className={sectionTitleClass}>10. YOUR PRIVACY RIGHTS</h2>
                            <p className={paragraphClass}>Depending on your location, you may have the right to:</p>
                            <ul className={bulletListClass}>
                                <li>request access to personal information we hold about you</li>
                                <li>request correction of inaccurate information</li>
                                <li>request deletion of certain information</li>
                                <li>object to or limit certain data processing activities</li>
                            </ul>
                            <p className={paragraphClass}>
                                Requests may be submitted by contacting us at the email address below.
                            </p>
                            <p className={paragraphClass}>
                                We may need to verify your identity before fulfilling certain requests.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className={sectionTitleClass}>11. CHANGES TO THIS PRIVACY POLICY</h2>
                            <p className={paragraphClass}>
                                We may update this Privacy Policy periodically to reflect changes to the platform or legal
                                requirements.
                            </p>
                            <p className={paragraphClass}>
                                Updated versions will be posted on this page with a revised effective date.
                            </p>
                        </section>

                        <section className="space-y-3">
                            <h2 className={sectionTitleClass}>12. CONTACT</h2>
                            <p className={paragraphClass}>
                                If you have questions about this Privacy Policy or our data practices, you may contact us at:
                            </p>
                            <p className={paragraphClass}>
                                <a href="mailto:privacy@anchorplot.com" className="text-primary font-semibold hover:underline">
                                    privacy@anchorplot.com
                                </a>
                            </p>
                            <p className={paragraphClass}>
                                <a href="mailto:legal@anchorplot.com" className="text-primary font-semibold hover:underline">
                                    legal@anchorplot.com
                                </a>
                            </p>
                            <p className={paragraphClass}>AnchorPlot, Inc.</p>
                            <p className={paragraphClass}>Newark, Delaware 19713</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;