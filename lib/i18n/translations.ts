export type Language = 'en' | 'id';

export interface Translations {
    // Navbar
    nav: {
        home: string;
        login: string;
        logout: string;
        admin: string;
        dashboard: string;
    };

    // Hero Section
    hero: {
        subtitle: string;
        button: string;
    };

    // Limit Modal
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

    // Dashboard
    dashboard: {
        title: string;
        createNew: string;
        myCVs: string;
        noCV: string;
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
            login: 'Login',
            logout: 'Logout',
            admin: 'Admin',
            dashboard: 'Dashboard',
        },
        hero: {
            subtitle: "Just like it's name. We help you enhance your CV tailored to your needs. Stand out with a resume that gets you hired.",
            button: 'TRY NOW FREE',
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
            goPro: 'Go Pro - Rp.15.000',
        },
        dashboard: {
            title: 'My CVs',
            createNew: 'Create New CV',
            myCVs: 'My CVs',
            noCV: 'No CVs yet. Create your first one!',
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
            login: 'Masuk',
            logout: 'Keluar',
            admin: 'Admin',
            dashboard: 'Dasbor',
        },
        hero: {
            subtitle: 'Sesuai namanya. Kami membantu Anda menyempurnakan CV yang disesuaikan dengan kebutuhan Anda. Menonjol dengan resume yang membantu Anda diterima.',
            button: 'COBA SEKARANG GRATIS',
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
            goPro: 'Jadi Pro - Rp.15.000',
        },
        dashboard: {
            title: 'C V Saya',
            createNew: 'Buat CV Baru',
            myCVs: 'CV Saya',
            noCV: 'Belum ada CV. Buat yang pertama!',
            edit: 'Edit',
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
