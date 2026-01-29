'use client';

import { Mail, Instagram, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/LogoPrimaryReCV.png" alt="ReCV Logo" width={100} height={34} className="object-contain" />
                    </Link>
                    <Link
                        href="/"
                        className="px-4 py-2 border-2 border-black bg-white hover:bg-gray-50 font-bold shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    >
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <h1 className="text-5xl font-extrabold text-black mb-6">Terms of Service</h1>
                <p className="text-gray-600 mb-8">Last updated: January 29, 2026</p>

                <div className="space-y-8 text-gray-800">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
                        <p className="leading-relaxed">
                            By accessing and using ReCV ("the Service"), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Description of Service</h2>
                        <p className="leading-relaxed mb-4">
                            ReCV is an online CV (Curriculum Vitae) builder that allows users to create, edit, and export professional resumes.
                            We offer both free and premium subscription tiers with different features and limitations.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Free Tier</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>1 saved CV maximum</li>
                                    <li>Basic templates</li>
                                    <li>PDF export with watermark</li>
                                    <li>Limited AI analysis (1 per day)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Pro Tier (Rp.15,000/month)</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Up to 4 saved CVs</li>
                                    <li>All premium templates</li>
                                    <li>Unlimited PDF exports without watermark</li>
                                    <li>50 AI analyses per day</li>
                                    <li>Priority support</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>You may use ReCV as a guest (data stored locally in browser)</li>
                            <li>Creating an account requires a valid email address</li>
                            <li>You are responsible for maintaining the confidentiality of your account</li>
                            <li>You must be at least 13 years old to use this service</li>
                            <li>One account per person</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Acceptable Use</h2>
                        <p className="mb-4 leading-relaxed">You agree NOT to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Use the service for any illegal purposes</li>
                            <li>Attempt to hack, breach, or compromise the security of our systems</li>
                            <li>Upload malicious code or viruses</li>
                            <li>Create false or misleading CVs (we recommend honesty in your CV content)</li>
                            <li>Share your Pro account with others</li>
                            <li>Use automated tools to scrape or abuse the service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Payment and Billing</h2>
                        <div className="space-y-4">
                            <p className="leading-relaxed">
                                Pro subscriptions are billed monthly at Rp.15,000 per month through our payment processor, Pakasir.
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Payments are non-refundable except as required by law</li>
                                <li>Pro access is valid for 30 days from purchase</li>
                                <li>We reserve the right to change pricing with 30 days notice</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Your Content</h3>
                                <p className="leading-relaxed">
                                    You retain all rights to the CV content you create. We do not claim ownership of your resumes,
                                    work experience, or any other information you input into our service.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Our Content</h3>
                                <p className="leading-relaxed">
                                    The ReCV platform, including all templates, design, code, and branding, is owned by ZCo Studio
                                    and protected by copyright. You may not copy, modify, or redistribute our platform without permission.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Service Availability</h2>
                        <p className="leading-relaxed">
                            We strive to provide 99.9% uptime, but we do not guarantee uninterrupted access to the service.
                            We may perform maintenance, updates, or experience technical issues that temporarily affect availability.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
                        <p className="leading-relaxed mb-4">
                            <strong>IMPORTANT:</strong> ReCV is provided "as is" without warranties of any kind. We are not responsible for:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>The accuracy or effectiveness of your CV content</li>
                            <li>Whether your CV leads to job interviews or employment</li>
                            <li>Loss of data due to browser issues (for guest users)</li>
                            <li>Any damages resulting from use of our service</li>
                        </ul>
                        <p className="mt-4 leading-relaxed">
                            Our maximum liability to you is limited to the amount you paid for the service in the past 12 months.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">AI Features Disclaimer</h2>
                        <p className="leading-relaxed">
                            Our AI-powered CV analysis and suggestions are generated by artificial intelligence and should be used as guidance only.
                            We do not guarantee the accuracy, relevance, or effectiveness of AI-generated suggestions.
                            You are solely responsible for the final content of your CV.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Termination</h2>
                        <p className="leading-relaxed mb-4">
                            We reserve the right to suspend or terminate your account if you violate these Terms of Service.
                            Reasons for termination include, but are not limited to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Violation of acceptable use policies</li>
                            <li>Fraudulent payment activity</li>
                            <li>Abusive behavior towards our team or other users</li>
                        </ul>
                        <p className="mt-4 leading-relaxed">
                            You may also delete your account at any time through your account settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
                        <p className="leading-relaxed">
                            We may update these Terms of Service from time to time. Significant changes will be communicated via email
                            or a notice on our website. Continued use of the service after changes constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
                        <p className="leading-relaxed">
                            These Terms of Service are governed by the laws of Indonesia. Any disputes will be resolved in Indonesian courts.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                        <p className="leading-relaxed mb-4">
                            If you have any questions about these Terms of Service, please contact us:
                        </p>
                        <div className="space-y-2">
                            <p className="flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                <a href="mailto:farizfadillah612@gmail.com" className="text-blue-600 hover:underline font-medium">
                                    farizfadillah612@gmail.com
                                </a>
                            </p>
                            <p className="flex items-center gap-2">
                                <Instagram className="w-5 h-5" />
                                <a href="https://instagram.com/zcostudio" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                    @zcostudio
                                </a>
                            </p>
                        </div>
                    </section>

                    <section className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">Agreement</h2>
                        <p className="leading-relaxed">
                            By using ReCV, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service
                            and our Privacy Policy.
                        </p>
                    </section>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t-4 border-black bg-gray-50 py-8 mt-20">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                        © 2026 ReCV. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by ZCo Studio.
                    </p>
                </div>
            </footer>
        </div>
    );
}
