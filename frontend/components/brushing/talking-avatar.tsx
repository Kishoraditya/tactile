'use client';

import { motion, Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TalkingAvatarProps {
    isSpeaking: boolean;
    avatarId: string;
}

export function TalkingAvatar({ isSpeaking, avatarId }: TalkingAvatarProps) {
    const mouthVariants: Variants = {
        idle: { scaleY: 0.1, transition: { duration: 0.5 } },
        speaking: {
            scaleY: [0.1, 0.8, 0.2, 0.6, 0.1],
            transition: {
                repeat: Infinity,
                duration: 0.4,
                ease: "linear"
            }
        }
    };


    const blinkVariants = {
        open: { scaleY: 1 },
        closed: { scaleY: 0.1 }
    };

    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 200);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const colors = {
        luna: { skin: '#FFE5D9', hair: '#FFB7B2', eyes: '#6B705C' },
        captain: { skin: '#F4D35E', hair: '#1D3557', eyes: '#000' },
        dr_bright: { skin: '#E0E1DD', hair: '#778DA9', eyes: '#415A77' }
    };

    const c = colors[avatarId as keyof typeof colors] || colors.luna;

    return (
        <div className="relative w-64 h-64">
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                <circle cx="100" cy="100" r="90" fill={c.hair} />
                <circle cx="100" cy="105" r="75" fill={c.skin} />
                <motion.ellipse
                    cx="70" cy="90" rx="10" ry="12" fill={c.eyes}
                    animate={isBlinking ? "closed" : "open"}
                    variants={blinkVariants}
                />
                <motion.ellipse
                    cx="130" cy="90" rx="10" ry="12" fill={c.eyes}
                    animate={isBlinking ? "closed" : "open"}
                    variants={blinkVariants}
                />
                <motion.path
                    d="M 70 140 Q 100 160 130 140"
                    fill="#333"
                    stroke="none"
                />
                <motion.ellipse
                    cx="100" cy="140" rx="20" ry="10"
                    fill="#660000"
                    animate={isSpeaking ? "speaking" : "idle"}
                    variants={mouthVariants}
                />
                {isSpeaking && <rect x="90" y="132" width="20" height="5" fill="white" rx="2" />}
            </svg>
        </div>
    );
}
