export type Language = 'en' | 'id';

export interface Translations {
    // Navbar
    nav: {
        home: string;
        features: string; // Added
        pricing: string; // Added
        faq: string; // Added
        login: string;
        logout: string;
        admin: string;
        dashboard: string;
    };

    // Hero Section
    hero: {
        titlePart1: string; // "Re"
        titlePart2: string; // "Your CV"
        subtitle: string;
        button: string;
    };

    // Features Section
    features: {
        title: string;
        ats: { title: string; desc: string; };
        ai: { title: string; desc: string; };
        preview: { title: string; desc: string; };
        export: { title: string; desc: string; };
    };

    // Pricing Section
    pricing: {
        title: string;
        popular: string;
        bestValue: string;
        perMonth: string;
        free: {
            title: string;
            price: string;
            features: {
                basic: string;
                watermark: string;
                aiLimit: string;
                coverLetter: string;
            };
            button: string;
        };
        pro: {
            title: string;
            price: string;
            features: {
                premium: string;
                noWatermark: string;
                aiLimit: string;
                support: string;
            };
            button: string;
        };
    };

    // FAQ Section
    faq: {
        title: string;
        q1: { q: string; a: string; };
        q2: { q: string; a: string; };
        q3: { q: string; a: string; };
        q4: { q: string; a: string; };
    };

    // Footer
    footer: {
        privacy: string;
        terms: string;
        contact: string;
        madeWith: string;
        by: string;
    };

    limitModal: {
        dailyLimit: string;
        cvLimit: string;
        premiumTemplate: string;
        unlockMore: string;
        limitReached: string;
        usedCredits: string;
        powerUser: string;
        upgradeFor50: string;
        exclusiveTemplate: string;
        upgradeUnlock: string;
        used1CV: string;
        upgradeTo4CVs: string;
        reached4CVs: string;
        deleteToCreate: string;
        maybeLater: string;
        gotIt: string;
        upgradeToPro: string;
        goPro: string;
    };

    // Choose Template
    chooseTemplate: {
        title: string;
        clearData: string;
        locked: string;
    };

    // Clear Data Modal
    clearDataModal: {
        title: string;
        message: string;
        privacyTitle: string;
        privacyMessage: string;
        cancel: string;
        confirm: string;
    };

    // Privacy & Terms Pages
    privacy: {
        title: string;
        backButton: string;
        lastUpdated: string;
    };

    terms: {
        title: string;
        backButton: string;
        lastUpdated: string;
    };

    // Dashboard
    dashboard: {
        title: string;
        subtitle: string;
        createNew: string;
        limitReached: string;
        emptyState: {
            title: string;
            desc: string;
            button: string;
        };
        lastUpdated: string;
        confirmDelete: {
            title: string;
            message: string;
            button: string;
        };
        edit: string;
        delete: string;
        download: string;
    };

    // Toast Messages
    toast: {
        loginSuccess: string;
        logoutSuccess: string;
        error: string;
        saved: string;
        deleted: string;
    };
}

export const translations: Record<Language, Translations> = {
    en: {
        nav: {
            home: 'Home',
            features: 'Features',
            pricing: 'Pricing',
            faq: 'FAQ',
            login: 'Login',
            logout: 'Logout',
            admin: 'Admin',
            dashboard: 'Dashboard',
        },
        hero: {
            titlePart1: 'Re',
            titlePart2: 'Your CV',
            subtitle: "Just like it's name. We help you enhance your CV tailored to your needs. Stand out with a resume that gets you hired.",
            button: 'TRY NOW FREE',
        },
        features: {
            title: 'FEATURES',
            ats: {
                title: 'ATS-Friendly',
                desc: 'Optimized structure and formatting to ensure your CV gets past Applicant Tracking Systems and reaches human eyes.'
            },
            ai: {
                title: 'AI Analysis',
                desc: 'Get instant AI-powered feedback on your CV with actionable suggestions to improve content and structure.'
            },
            preview: {
                title: 'Real-time Preview',
                desc: 'See your changes instantly as you type. No more guessing how your resume will look after export.'
            },
            export: {
                title: 'PDF Export',
                desc: 'Download high-quality, professional PDFs ready for job applications with a single click.'
            }
        },
        pricing: {
            title: 'PRICING',
            popular: 'POPULAR',
            bestValue: 'BEST VALUE',
            perMonth: '/mo',
            free: {
                title: 'Free',
                price: 'Rp.0k',
                features: {
                    basic: 'Basic Templates',
                    watermark: 'PDF Export (Watermarked)',
                    aiLimit: '1 AI Analysis per day',
                    coverLetter: 'Cover Letter Builder'
                },
                button: 'Start for Free'
            },
            pro: {
                title: 'Pro',
                price: 'Rp.15k',
                features: {
                    premium: 'All Premium Templates',
                    noWatermark: 'Unlimited PDF Exports (No Watermark)',
                    aiLimit: '50 AI Analyses per day',
                    support: 'Priority Support'
                },
                button: 'Go Pro'
            }
        },
        faq: {
            title: 'FAQ',
            q1: {
                q: "Is ReCV really free?",
                a: "Yes! You can build your resume and export it for free. Our Pro plan offers advanced features like AI suggestions and premium templates."
            },
            q2: {
                q: "Do I need an account?",
                a: "No. You can build immediately. All CV data is stored in your browser's Local Storage. If you create an account, we only store your basic profile info."
            },
            q3: {
                q: "Is my data safe?",
                a: "Absolutely. We do not sell your data. Your resume information is stored locally on your device unless you create an account."
            },
            q4: {
                q: "How does the AI work?",
                a: "Our AI analyzes your experience and suggests improvements to make your bullet points more impactful and action-oriented."
            }
        },
        footer: {
            privacy: 'Privacy',
            terms: 'Terms',
            contact: 'Contact',
            madeWith: 'Made with',
            by: 'by ZCo Studio.'
        },
        limitModal: {
            dailyLimit: 'Daily AI Limit Reached',
            cvLimit: 'Limit Reached',
            premiumTemplate: 'Premium Template',
            unlockMore: 'Unlock More Space',
            limitReached: 'Limit Reached',
            usedCredits: "You've used your",
            powerUser: 'You are a power user! Your credits will reset tomorrow.',
            upgradeFor50: 'Upgrade to Pro for 50 AI analyses per day and more!',
            exclusiveTemplate: 'This template is exclusive to',
            upgradeUnlock: 'to unlock this premium template, unlimited downloads, and AI features.',
            used1CV: "You've used your",
            upgradeTo4CVs: 'to create up to 4 CVs, access AI features, and remove watermarks.',
            reached4CVs: "You've reached the maximum limit of",
            deleteToCreate: 'Please delete an existing CV to create a new one.',
            maybeLater: 'Maybe Later',
            gotIt: 'Got it',
            upgradeToPro: 'Upgrade to Pro',
            goPro: 'Go Pro',
        },
        chooseTemplate: {
            title: 'Choose Template',
            clearData: 'Clear Data',
            locked: 'LOCKED',
        },
        clearDataModal: {
            title: 'Clear All Data?',
            message: 'Are you sure you want to delete all your CV data? This action cannot be undone.',
            privacyTitle: 'Privacy Notice:',
            privacyMessage: 'We value your privacy. Your data is never sent to a server. It is stored locally in your browser\'s Local Storage. Clearing it will remove it from this device.',
            cancel: 'Cancel',
            confirm: 'Yes, Clear Data',
        },
        privacy: {
            title: 'Privacy Policy',
            backButton: 'Back to Home',
            lastUpdated: 'Last updated',
        },
        terms: {
            title: 'Terms of Service',
            backButton: 'Back to Home',
            lastUpdated: 'Last updated',
        },
        dashboard: {
            title: 'My Dashboard',
            subtitle: 'Manage your resumes',
            createNew: 'Create New CV',
            limitReached: 'Limit Reached',
            emptyState: {
                title: 'No CVs yet',
                desc: 'Create your first professional resume today.',
                button: 'Create CV'
            },
            lastUpdated: 'Last updated:',
            confirmDelete: {
                title: 'Delete CV',
                message: 'Are you sure you want to delete this CV? This action cannot be undone.',
                button: 'Delete'
            },
            edit: 'Edit',
            delete: 'Delete',
            download: 'Download',
        },
        toast: {
            loginSuccess: 'Login successful!',
            logoutSuccess: 'Logged out successfully',
            error: 'An error occurred',
            saved: 'Saved successfully',
            deleted: 'Deleted successfully',
        },
    },
    id: {
        nav: {
            home: 'Beranda',
            features: 'Fitur',
            pricing: 'Harga',
            faq: 'FAQ',
            login: 'Masuk',
            logout: 'Keluar',
            admin: 'Admin',
            dashboard: 'Dasbor',
        },
        hero: {
            titlePart1: 'Re',
            titlePart2: 'CV Anda',
            subtitle: 'Sesuai namanya. Kami membantu Anda menyempurnakan CV yang disesuaikan dengan kebutuhan Anda. Menonjol dengan resume yang membantu Anda diterima.',
            button: 'COBA SEKARANG GRATIS',
        },
        features: {
            title: 'FITUR',
            ats: {
                title: 'Ramah ATS',
                desc: 'Struktur dan format yang dioptimalkan untuk memastikan CV Anda lolos Sistem Pelacakan Pelamar (ATS) dan dibaca oleh manusia.'
            },
            ai: {
                title: 'Analisis AI',
                desc: 'Dapatkan umpan balik instan bertenaga AI pada CV Anda dengan saran yang dapat ditindaklanjuti untuk meningkatkan konten dan struktur.'
            },
            preview: {
                title: 'Pratinjau Langsung',
                desc: 'Lihat perubahan Anda secara instan saat mengetik. Tidak perlu menebak tampilan resume Anda setelah diekspor.'
            },
            export: {
                title: 'Ekspor PDF',
                desc: 'Unduh PDF profesional berkualitas tinggi yang siap untuk lamaran kerja dengan satu klik.'
            }
        },
        pricing: {
            title: 'HARGA',
            popular: 'POPULER',
            bestValue: 'TERHEMAT',
            perMonth: '/bln',
            free: {
                title: 'Gratis',
                price: 'Rp.0rb',
                features: {
                    basic: 'Template Dasar',
                    watermark: 'Ekspor PDF (Watermark)',
                    aiLimit: '1 Analisis AI per hari',
                    coverLetter: 'Pembuat Surat Lamaran'
                },
                button: 'Mulai Gratis'
            },
            pro: {
                title: 'Pro',
                price: 'Rp.15rb',
                features: {
                    premium: 'Semua Template Premium',
                    noWatermark: 'Ekspor PDF Tanpa Batas (Tanpa Watermark)',
                    aiLimit: '50 Analisis AI per hari',
                    support: 'Dukungan Prioritas'
                },
                button: 'Jadi Pro'
            }
        },
        faq: {
            title: 'FAQ',
            q1: {
                q: "Apakah ReCV benar-benar gratis?",
                a: "Ya! Anda dapat membuat resume dan mengekspornya secara gratis. Paket Pro kami menawarkan fitur lanjutan seperti saran AI dan template premium."
            },
            q2: {
                q: "Apakah saya perlu akun?",
                a: "Tidak. Anda bisa langsung membuat. Semua data CV disimpan di browser Anda (Local Storage). Jika Anda membuat akun, kami hanya menyimpan info profil dasar Anda."
            },
            q3: {
                q: "Apakah data saya aman?",
                a: "Tentu saja. Kami tidak menjual data Anda. Info resume Anda disimpan secara lokal di perangkat Anda kecuali Anda membuat akun."
            },
            q4: {
                q: "Bagaimana cara kerja AI?",
                a: "AI kami menganalisis pengalaman Anda dan menyarankan perbaikan untuk membuat poin-poin Anda lebih berdampak dan berorientasi pada tindakan."
            }
        },
        footer: {
            privacy: 'Privasi',
            terms: 'Ketentuan',
            contact: 'Kontak',
            madeWith: 'Dibuat dengan',
            by: 'oleh ZCo Studio.'
        },
        limitModal: {
            dailyLimit: 'Batas AI Harian Tercapai',
            cvLimit: 'Batas Tercapai',
            premiumTemplate: 'Template Premium',
            unlockMore: 'Buka Lebih Banyak Ruang',
            limitReached: 'Batas Tercapai',
            usedCredits: 'Anda telah menggunakan',
            powerUser: 'Anda pengguna super! Kredit Anda akan direset besok.',
            upgradeFor50: 'Upgrade ke Pro untuk 50 analisis AI per hari dan lebih banyak lagi!',
            exclusiveTemplate: 'Template ini eksklusif untuk',
            upgradeUnlock: 'untuk membuka template premium ini, unduhan tanpa batas, dan fitur AI.',
            used1CV: 'Anda telah menggunakan',
            upgradeTo4CVs: 'untuk membuat hingga 4 CV, mengakses fitur AI, dan menghapus watermark.',
            reached4CVs: 'Anda telah mencapai batas maksimum',
            deleteToCreate: 'Silakan hapus CV yang ada untuk membuat yang baru.',
            maybeLater: 'Nanti Saja',
            gotIt: 'Mengerti',
            upgradeToPro: 'Upgrade ke Pro',
            goPro: 'Jadi Pro',
        },
        chooseTemplate: {
            title: 'Pilih Template',
            clearData: 'Hapus Data',
            locked: 'TERKUNCI',
        },
        clearDataModal: {
            title: 'Hapus Semua Data?',
            message: 'Apakah Anda yakin ingin menghapus semua data CV Anda? Tindakan ini tidak dapat dibatalkan.',
            privacyTitle: 'Pemberitahuan Privasi:',
            privacyMessage: 'Kami menghargai privasi Anda. Data Anda tidak pernah dikirim ke server. Data disimpan secara lokal di Local Storage browser Anda. Menghapusnya akan menghapusnya dari perangkat ini.',
            cancel: 'Batal',
            confirm: 'Ya, Hapus Data',
        },
        privacy: {
            title: 'Kebijakan Privasi',
            backButton: 'Kembali ke Beranda',
            lastUpdated: 'Terakhir diperbarui',
        },
        terms: {
            title: 'Ketentuan Layanan',
            backButton: 'Kembali ke Beranda',
            lastUpdated: 'Terakhir diperbarui',
        },
        dashboard: {
            title: 'Dasbor Saya',
            subtitle: 'Kelola resume Anda',
            createNew: 'Buat CV Baru',
            limitReached: 'Batas Tercapai',
            emptyState: {
                title: 'Belum ada CV',
                desc: 'Buat resume profesional pertama Anda hari ini.',
                button: 'Buat CV'
            },
            lastUpdated: 'Terakhir diperbarui:',
            confirmDelete: {
                title: 'Hapus CV',
                message: 'Apakah Anda yakin ingin menghapus CV ini? Tindakan ini tidak dapat dibatalkan.',
                button: 'Hapus'
            },
            edit: 'Ubah',
            delete: 'Hapus',
            download: 'Unduh',
        },
        toast: {
            loginSuccess: 'Login berhasil!',
            logoutSuccess: 'Berhasil keluar',
            error: 'Terjadi kesalahan',
            saved: 'Berhasil disimpan',
            deleted: 'Berhasil dihapus',
        },
    },
};
