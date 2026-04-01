'use client';

import { Instagram, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import SlideIn from '@/components/SlideIn';

export default function PrivacyPolicy() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/LogoPrimaryReCV.png" alt="ReCV Logo" width={100} height={34} className="object-contain" />
                    </Link>
                    <Link
                        href="/"
                        className="px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-black bg-white hover:bg-gray-50 font-bold shadow-neo-sm transition-all text-sm sm:text-base"
                    >
                        {t.privacy.backButton}
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <SlideIn delay={0.1} className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl min-h-[calc(100vh-80px)]">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-black mb-4 sm:mb-6">{t.privacy.title}</h1>
                <p className="text-gray-600 mb-8">{t.privacy.lastUpdated}: January 29, 2026</p>

                <div className="space-y-8 text-gray-800">
                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Introduction</h2>
                        <p className="leading-relaxed text-sm sm:text-base">
                            Welcome to ReCV ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
                            This privacy policy explains how we collect, use, and safeguard your information when you use our CV builder service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Information We Collect</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">Account Information</h3>
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
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">How We Use Your Information</h2>
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
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Data Storage</h2>
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
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Data Security</h2>
                        <p className="leading-relaxed">
                            We implement appropriate technical and organizational security measures to protect your personal information.
                            However, no method of transmission over the Internet or electronic storage is 100% secure.
                            While we strive to protect your data, we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Your Rights</h2>
                        <p className="mb-4">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update or correct your information</li>
                            <li><strong>Deletion:</strong> Delete your account and all data directly from your <strong>Dashboard → Danger Zone</strong></li>
                            <li><strong>Export:</strong> Download your CV data at any time</li>
                        </ul>
                        <p className="mt-4">
                            To exercise any of these rights, please refer to the <strong>Contact Us</strong> section below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Third-Party Services</h2>
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
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Data Retention</h2>
                        <p className="leading-relaxed">
                            We retain your personal data for as long as your account is active. If you delete your account,
                            we will delete all your personal information and CV data within 30 days, except where we are required
                            to retain it for legal or compliance purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">We Do NOT</h2>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Sell your personal information to third parties</li>
                            <li>Share your CV content with anyone without your permission</li>
                            <li>Use your data for advertising purposes</li>
                            <li>Track you across other websites</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Changes to This Policy</h2>
                        <p className="leading-relaxed">
                            We may update this privacy policy from time to time. We will notify you of any significant changes
                            by posting the new policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Contact Us</h2>
                        <p className="leading-relaxed mb-4">
                            If you have any questions about this Privacy Policy or wish to exercise your data rights, please use our in-app support system.
                        </p>
                        <div className="mt-4 p-4 border-2 border-black bg-yellow-50">
                            <p className="text-sm font-bold mb-1">💬 In-App Support</p>
                            <p className="text-sm text-gray-700">
                                Click the <strong>Support</strong> button in the bottom-right corner of any page to submit a query — email required.
                            </p>
                        </div>
                        <div className="mt-3 space-y-2">
                            <p className="flex items-center gap-2 text-sm">
                                <Instagram className="w-4 h-4" />
                                <a href="https://instagram.com/zcostudio" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                    @zcostudio
                                </a>
                            </p>
                        </div>
                    </section>
                </div>
            </SlideIn>

            {/* Footer */}
            <footer className="border-t-4 border-black bg-gray-50 py-8 mt-20">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                        © 2026 ReCV. Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by ZCo Studio.
                    </p>
                </div>
            </footer>
        </div>
    );
}
