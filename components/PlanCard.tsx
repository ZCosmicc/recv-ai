import React from 'react';
import { Crown, User, Users } from 'lucide-react';

interface PlanCardProps {
    tier: 'guest' | 'free' | 'pro';
}

export default function PlanCard({ tier }: PlanCardProps) {
    const tierConfig = {
        guest: {
            label: 'GUEST',
            bgColor: 'bg-gray-200',
            textColor: 'text-gray-700',
            icon: <Users className="w-3 h-3 sm:w-4 sm:h-4" />
        },
        free: {
            label: 'FREE',
            bgColor: 'bg-blue-400',
            textColor: 'text-white',
            icon: <User className="w-3 h-3 sm:w-4 sm:h-4" />
        },
        pro: {
            label: 'PRO',
            bgColor: 'bg-yellow-400',
            textColor: 'text-black',
            icon: <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
        }
    };

    const config = tierConfig[tier];

    return (
        <div className={`${config.bgColor} ${config.textColor} px-3 sm:px-4 py-1.5 sm:py-2 border-2 sm:border-4 border-black shadow-neo font-bold text-xs sm:text-sm flex items-center gap-1 sm:gap-2`}>
            {config.icon}
            <span className="whitespace-nowrap">Plan: {config.label}</span>
        </div>
    );
}
