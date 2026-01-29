'use client';

import { Mail, Instagram, Heart } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-extrabold">
                        <span className="text-primary">Re</span>CV
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
                <h1 className="text-5xl font-extrabold text-black mb-6">Privacy Policy</h1>
                <p className="text-gray-600 mb-8">Last updated: January 29, 2026</p>

                <div className="space-y-8 text-gray-800">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                        <p className="leading-relaxed">
                            Welcome to ReCV ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
                            This privacy policy explains how we collect, use, and safeguard your information when you use our CV builder service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Account Information</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Email address (for authentication)</li>
                                    <li>User ID (automatically generated)</li>
                                    <li>Account tier (free or pro)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">CV Data</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Personal information you enter (name, contact details, work experience, education, skills)</li>
                                    <li>Template preferences</li>
                                    <li>CV content and formatting</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Payment Information</h3>
                                <p className="ml-4">
                                    We use Pakasir as our payment processor. We do NOT store your payment card details.
                                    All payment transactions are processed securely through Pakasir.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>To provide and maintain our CV builder service</li>
                            <li>To authenticate your account</li>
                            <li>To process your subscription payments</li>
                            <li>To provide customer support</li>
                            <li>To send important service updates</li>
                            <li>To improve our service based on usage patterns</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Data Storage</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Guest Users</h3>
                                <p className="ml-4">
                                    If you use ReCV without creating an account, all your CV data is stored locally in your browser's storage.
                                    We do NOT have access to this data. If you clear your browser data, your CV will be lost.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Registered Users</h3>
                                <p className="ml-4">
                                    Your CV data is stored securely in our database (Supabase) and is only accessible to you when logged in.
                                    We use industry-standard encryption and security measures to protect your data.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                        <p className="leading-relaxed">
                            We implement appropriate technical and organizational security measures to protect your personal information.
                            However, no method of transmission over the Internet or electronic storage is 100% secure.
                            While we strive to protect your data, we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                        <p className="mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update or correct your information</li>
                            <li><strong>Deletion:</strong> Request deletion of your account and all associated data</li>
                            <li><strong>Export:</strong> Download your CV data at any time</li>
                        </ul>
                        <p className="mt-4">
                            To exercise any of these rights, please contact us at{' '}
                            <a href="mailto:farizfadillah612@gmail.com" className="text-blue-600 hover:underline font-medium">
                                farizfadillah612@gmail.com
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
                        <p className="mb-4">We use the following third-party services:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Supabase:</strong> For database and authentication</li>
                            <li><strong>Pakasir:</strong> For payment processing</li>
                            <li><strong>Vercel:</strong> For hosting</li>
                        </ul>
                        <p className="mt-4">
                            These services have their own privacy policies governing their use of your information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
                        <p className="leading-relaxed">
                            We retain your personal data for as long as your account is active. If you delete your account,
                            we will delete all your personal information and CV data within 30 days, except where we are required
                            to retain it for legal or compliance purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">We Do NOT</h2>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Sell your personal information to third parties</li>
                            <li>Share your CV content with anyone without your permission</li>
                            <li>Use your data for advertising purposes</li>
                            <li>Track you across other websites</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
                        <p className="leading-relaxed">
                            We may update this privacy policy from time to time. We will notify you of any significant changes
                            by posting the new policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                        <p className="leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <div className="mt-4 space-y-2">
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
