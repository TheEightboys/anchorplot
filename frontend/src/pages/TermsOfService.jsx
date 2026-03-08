import React from 'react';

const sectionTitleClass = 'text-lg md:text-xl font-bold text-text-primary';
const paragraphClass = 'text-sm md:text-base text-text-secondary leading-relaxed';
const bulletListClass = 'list-disc pl-5 space-y-1 text-sm md:text-base text-text-secondary';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background pt-28 pb-16">
            <div className="max-w-4xl mx-auto px-6">
                <div className="bg-surface border border-border-light rounded-2xl p-6 md:p-10">
                    <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-3">ANCHORPLOT TERMS OF SERVICE</h1>
                    <p className={paragraphClass}>Effective Date: [Insert Date]</p>
                    <p className={paragraphClass}>Last Updated: [Insert Date]</p>

                    <div className="space-y-4 mt-6">
                        <p className={paragraphClass}>
                            Welcome to AnchorPlot. These Terms of Service (“Terms”) govern your access to and use of the AnchorPlot website, applications and services (collectively, the “Services”).
                        </p>
                        <p className={paragraphClass}>
                            AnchorPlot, Inc. (“AnchorPlot,” “we,” “us,” or “our”) provides software infrastructure designed to help property owners, developers, investors, real estate professionals, attorneys and property managers coordinate redevelopment opportunities and housing projects.
                        </p>
                        <p className={paragraphClass}>
                            By accessing or using the Services, you agree to be bound by these Terms.
                        </p>
                    </div>

                    <div className="space-y-8 mt-10">
                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>1. ELIGIBILITY</h2>
                            <p className={paragraphClass}>You must be at least eighteen (18) years old to use AnchorPlot.</p>
                            <p className={paragraphClass}>By creating an account, you represent that:</p>
                            <ul className={bulletListClass}>
                                <li>you are legally capable of entering into binding agreements</li>
                                <li>the information you provide is accurate and complete</li>
                                <li>you will comply with all applicable laws and regulations</li>
                            </ul>
                            <p className={paragraphClass}>If you are using the platform on behalf of an organization or entity, you represent that you have authority to bind that entity to these Terms.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>2. PLATFORM ROLE AND LIMITATION</h2>
                            <p className={paragraphClass}>AnchorPlot provides software infrastructure and coordination tools for redevelopment projects.</p>
                            <p className={paragraphClass}>AnchorPlot does not act as:</p>
                            <ul className={bulletListClass}>
                                <li>a real estate broker</li>
                                <li>a lender</li>
                                <li>an escrow agent</li>
                                <li>a title company</li>
                                <li>a contractor or construction manager</li>
                                <li>a property manager (unless explicitly agreed in writing)</li>
                                <li>a legal advisor</li>
                                <li>a financial advisor or investment advisor</li>
                            </ul>
                            <p className={paragraphClass}>AnchorPlot does not provide legal, financial, tax, zoning, engineering or investment advice.</p>
                            <p className={paragraphClass}>Users are responsible for consulting qualified professionals for advice relating to redevelopment, financing, regulatory compliance and legal matters.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>3. MARKETPLACE NEUTRALITY</h2>
                            <p className={paragraphClass}>AnchorPlot operates as a neutral technology platform that enables property owners, developers, investors, real estate professionals, attorneys and property managers to identify opportunities and coordinate redevelopment projects.</p>
                            <p className={paragraphClass}>AnchorPlot does not participate in negotiations between users, does not control project decisions and does not act as a principal in any transaction conducted through the platform.</p>
                            <p className={paragraphClass}>AnchorPlot does not:</p>
                            <ul className={bulletListClass}>
                                <li>represent buyers, sellers, owners or investors</li>
                                <li>recommend specific investment opportunities</li>
                                <li>guarantee project outcomes or financial returns</li>
                                <li>participate in ownership of properties unless separately disclosed in writing</li>
                            </ul>
                            <p className={paragraphClass}>All decisions relating to redevelopment projects, financing arrangements, construction activities and agreements between users are made independently by the participating parties.</p>
                            <p className={paragraphClass}>Users acknowledge that AnchorPlot provides infrastructure and coordination tools only and does not assume responsibility for the actions, representations or obligations of any platform participant.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>4. USER ACCOUNTS</h2>
                            <p className={paragraphClass}>To access certain services, you must create an account.</p>
                            <p className={paragraphClass}>Users are responsible for:</p>
                            <ul className={bulletListClass}>
                                <li>maintaining the confidentiality of login credentials</li>
                                <li>ensuring that account information remains accurate</li>
                                <li>all activity conducted through their account</li>
                            </ul>
                            <p className={paragraphClass}>AnchorPlot reserves the right to suspend or terminate accounts that violate these Terms or applicable laws.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>5. CONTROLLED DISCLOSURE PLATFORM</h2>
                            <p className={paragraphClass}>AnchorPlot operates a controlled disclosure system designed to protect users and prevent misuse of property information.</p>
                            <p className={paragraphClass}>Certain identifying information may be masked or withheld until required workflow conditions are satisfied.</p>
                            <p className={paragraphClass}>This may include:</p>
                            <ul className={bulletListClass}>
                                <li>property addresses</li>
                                <li>parcel identifiers</li>
                                <li>owner identity</li>
                                <li>direct contact information</li>
                            </ul>
                            <p className={paragraphClass}>Users agree not to attempt to bypass or defeat these safeguards.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>6. USER CONDUCT</h2>
                            <p className={paragraphClass}>Users agree to use the platform responsibly and lawfully.</p>
                            <p className={paragraphClass}>Users must not:</p>
                            <ul className={bulletListClass}>
                                <li>provide false or misleading information</li>
                                <li>misrepresent property ownership or authority</li>
                                <li>violate housing, real estate or investment laws</li>
                                <li>engage in discriminatory housing practices</li>
                                <li>upload malicious software</li>
                                <li>attempt to gain unauthorized access to the platform</li>
                                <li>interfere with system integrity or security</li>
                                <li>misuse platform data or documents</li>
                            </ul>
                            <p className={paragraphClass}>AnchorPlot may remove content or suspend accounts that violate these standards.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>7. USER CONTENT</h2>
                            <p className={paragraphClass}>Users are responsible for all information and documents they upload to the platform.</p>
                            <p className={paragraphClass}>Users represent that they have the legal right to share such content and that it does not violate any laws or third-party rights.</p>
                            <p className={paragraphClass}>AnchorPlot may remove content that violates these Terms.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>8. NO-CIRCUMVENTION AND PLATFORM PROTECTION</h2>
                            <p className={paragraphClass}>AnchorPlot facilitates introductions and project coordination between users.</p>
                            <p className={paragraphClass}>Users agree that they will not:</p>
                            <ul className={bulletListClass}>
                                <li>attempt to contact other users introduced through AnchorPlot outside the platform for the purpose of avoiding platform fees</li>
                                <li>negotiate or complete transactions outside the platform using information obtained through AnchorPlot</li>
                                <li>attempt to reconstruct masked property data</li>
                                <li>solicit other users to bypass the platform</li>
                            </ul>
                            <p className={paragraphClass}>This restriction applies to any redevelopment opportunity or transaction originating from the platform.</p>
                            <p className={paragraphClass}>The obligation applies for twenty-four (24) months following the last interaction involving the relevant opportunity.</p>
                            <p className={paragraphClass}>AnchorPlot may enforce this provision through account suspension, fee recovery, legal remedies or other actions permitted by law.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>9. USER DUE DILIGENCE AND PROJECT RISK</h2>
                            <p className={paragraphClass}>Real estate redevelopment, financing and construction activities involve substantial risks.</p>
                            <p className={paragraphClass}>Users are solely responsible for conducting their own due diligence, including:</p>
                            <ul className={bulletListClass}>
                                <li>verifying property ownership</li>
                                <li>reviewing zoning and regulatory requirements</li>
                                <li>evaluating financial projections</li>
                                <li>reviewing agreements before signing</li>
                                <li>obtaining professional advice from licensed professionals</li>
                            </ul>
                            <p className={paragraphClass}>AnchorPlot does not guarantee:</p>
                            <ul className={bulletListClass}>
                                <li>the accuracy of user-submitted information</li>
                                <li>the success of any redevelopment project</li>
                                <li>the availability of permits or funding</li>
                                <li>the profitability of any investment</li>
                            </ul>
                            <p className={paragraphClass}>All project participation occurs at the user's own risk.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>10. DATA RIGHTS AND PLATFORM ANALYTICS</h2>
                            <p className={paragraphClass}>Users retain ownership of the information and documents they submit to AnchorPlot.</p>
                            <p className={paragraphClass}>However, by submitting information to the platform, users grant AnchorPlot a worldwide, non-exclusive, royalty-free license to host, process, store, analyze and display such information as necessary to operate the Services.</p>
                            <p className={paragraphClass}>AnchorPlot retains full rights to:</p>
                            <ul className={bulletListClass}>
                                <li>aggregated platform data</li>
                                <li>de-identified data</li>
                                <li>usage analytics</li>
                                <li>redevelopment trends</li>
                                <li>housing production metrics</li>
                                <li>zoning impact analytics</li>
                            </ul>
                            <p className={paragraphClass}>AnchorPlot may use aggregated or de-identified data to improve the platform, produce analytics, support research and provide insights to public sector partners.</p>
                            <p className={paragraphClass}>Such datasets will not identify individual users or confidential transaction details.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>11. PAYMENTS AND FEES</h2>
                            <p className={paragraphClass}>Certain services may require payment of:</p>
                            <ul className={bulletListClass}>
                                <li>onboarding fees</li>
                                <li>subscription fees</li>
                                <li>transaction fees</li>
                                <li>reporting or service fees</li>
                            </ul>
                            <p className={paragraphClass}>Users agree to pay all applicable fees associated with their use of the platform.</p>
                            <p className={paragraphClass}>Failure to pay required fees may result in suspension or termination of access.</p>
                            <p className={paragraphClass}>AnchorPlot may rely on platform activity logs and records to determine whether a transaction originated through the platform.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>12. ELECTRONIC SIGNATURES AND DIGITAL RECORDS</h2>
                            <p className={paragraphClass}>The platform may enable electronic signatures and digital agreement execution.</p>
                            <p className={paragraphClass}>By using these features, you consent to:</p>
                            <ul className={bulletListClass}>
                                <li>electronic signatures</li>
                                <li>digital record keeping</li>
                                <li>electronic delivery of documents and notices</li>
                            </ul>
                            <p className={paragraphClass}>Electronic records maintained by AnchorPlot may be used as evidence of agreements and transactions.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>13. THIRD-PARTY SERVICES</h2>
                            <p className={paragraphClass}>The platform may rely on third-party services including:</p>
                            <ul className={bulletListClass}>
                                <li>payment processors</li>
                                <li>identity verification providers</li>
                                <li>document storage systems</li>
                                <li>mapping and zoning data providers</li>
                            </ul>
                            <p className={paragraphClass}>AnchorPlot is not responsible for the availability or accuracy of third-party services or data.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>14. USER CONDUCT AND INDEMNIFICATION</h2>
                            <p className={paragraphClass}>Users agree to defend, indemnify, and hold harmless AnchorPlot and its affiliates, officers, directors, employees, contractors and partners from any claims, damages, losses, liabilities, costs or expenses arising from:</p>
                            <ul className={bulletListClass}>
                                <li>use of the platform</li>
                                <li>redevelopment or investment activities</li>
                                <li>user-submitted content</li>
                                <li>disputes between users</li>
                                <li>violations of these Terms or applicable laws</li>
                            </ul>
                            <p className={paragraphClass}>AnchorPlot reserves the right to assume the defense of any matter subject to indemnification.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>15. LIMITATION OF LIABILITY</h2>
                            <p className={paragraphClass}>To the maximum extent permitted by law, AnchorPlot shall not be liable for:</p>
                            <ul className={bulletListClass}>
                                <li>indirect damages</li>
                                <li>lost profits</li>
                                <li>investment losses</li>
                                <li>redevelopment project failures</li>
                                <li>construction delays</li>
                                <li>permit denials</li>
                                <li>inaccurate user-provided information</li>
                                <li>disputes between users</li>
                            </ul>
                            <p className={paragraphClass}>AnchorPlot’s total liability shall not exceed the greater of:</p>
                            <ul className={bulletListClass}>
                                <li>one hundred U.S. dollars, or</li>
                                <li>the amount paid by the user to AnchorPlot during the twelve months preceding the claim.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>16. ARBITRATION AND CLASS ACTION WAIVER</h2>
                            <div className="space-y-3">
                                <h3 className="font-semibold text-text-primary">Agreement to Arbitrate</h3>
                                <p className={paragraphClass}>Except for claims that may be brought in small claims court or claims seeking injunctive relief for misuse of intellectual property or circumvention of the platform, any dispute, claim or controversy arising out of or relating to these Terms or the use of the Services shall be resolved through binding arbitration.</p>
                                <p className={paragraphClass}>The arbitration shall be administered by the American Arbitration Association under its applicable commercial arbitration rules.</p>
                                <p className={paragraphClass}>The arbitration will take place in Wilmington, Delaware, unless the parties agree otherwise. The arbitration will be conducted by a single neutral arbitrator. The arbitrator will have authority to grant any remedy available under applicable law.</p>
                                <p className={paragraphClass}>Judgment on the arbitration award may be entered in any court of competent jurisdiction.</p>
                            </div>
                            <div className="space-y-3 mt-4">
                                <h3 className="font-semibold text-text-primary">Class Action Waiver</h3>
                                <p className={paragraphClass}>You agree that disputes will be resolved on an individual basis only.</p>
                                <p className={paragraphClass}>You waive any right to participate in:</p>
                                <ul className={bulletListClass}>
                                    <li>a class action</li>
                                    <li>a collective action</li>
                                    <li>a representative action</li>
                                    <li>a private attorney general action</li>
                                </ul>
                                <p className={paragraphClass}>No arbitration or legal proceeding may be combined with another without the written consent of AnchorPlot.</p>
                            </div>
                            <div className="space-y-3 mt-4">
                                <h3 className="font-semibold text-text-primary">Severability</h3>
                                <p className={paragraphClass}>If a court determines that the class action waiver is unenforceable for a particular claim, that claim must proceed in court, but the remaining provisions of this arbitration section will remain in effect.</p>
                            </div>
                            <div className="space-y-3 mt-4">
                                <h3 className="font-semibold text-text-primary">Small Claims Option</h3>
                                <p className={paragraphClass}>Either party may bring an individual claim in small claims court if the claim qualifies.</p>
                            </div>
                            <div className="space-y-3 mt-4">
                                <h3 className="font-semibold text-text-primary">Opt-Out Option</h3>
                                <p className={paragraphClass}>You may opt out of this arbitration agreement by sending written notice to legal@anchorplot.com within thirty days of creating your account.</p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>17. GOVERNING LAW</h2>
                            <p className={paragraphClass}>These Terms are governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict-of-law principles.</p>
                            <p className={paragraphClass}>Any legal dispute arising out of or relating to these Terms or the use of the Services shall be resolved exclusively in the state or federal courts located in the State of Delaware, and the parties consent to the personal jurisdiction of such courts.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>18. TERMINATION</h2>
                            <p className={paragraphClass}>AnchorPlot may suspend or terminate user accounts for:</p>
                            <ul className={bulletListClass}>
                                <li>violation of these Terms</li>
                                <li>unlawful activity</li>
                                <li>security risks</li>
                                <li>nonpayment of fees</li>
                                <li>misuse of the platform</li>
                            </ul>
                            <p className={paragraphClass}>Users may terminate their accounts at any time.</p>
                            <p className={paragraphClass}>Certain provisions of these Terms survive termination, including data rights, liability limitations and dispute provisions.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>19. CHANGES TO THE TERMS</h2>
                            <p className={paragraphClass}>AnchorPlot may update these Terms from time to time.</p>
                            <p className={paragraphClass}>Updated Terms will be posted on the website with a revised effective date.</p>
                            <p className={paragraphClass}>Continued use of the Services constitutes acceptance of the updated Terms.</p>
                        </section>

                        <section className="space-y-4">
                            <h2 className={sectionTitleClass}>20. CONTACT INFORMATION</h2>
                            <p className={paragraphClass}>For questions regarding these Terms, please contact:</p>
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

export default TermsOfService;
