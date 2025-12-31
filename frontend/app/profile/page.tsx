'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface BrushStats {
    totalSessions: number;
    streak: number;
    lastBrush: string | null;
    favoriteAvatar: string;
}

export default function ProfilePage() {
    const [stats, setStats] = useState<BrushStats>({
        totalSessions: 0,
        streak: 0,
        lastBrush: null,
        favoriteAvatar: 'None yet'
    });

    useEffect(() => {
        // Calculate stats from localStorage
        let total = 0;
        let avatarCounts: Record<string, number> = {};

        // Check last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const key = `brushLogs_${date.toDateString()}`;
            const logs = localStorage.getItem(key);
            if (logs) {
                const parsed = JSON.parse(logs);
                total += parsed.length;
                parsed.forEach((log: { avatar: string }) => {
                    avatarCounts[log.avatar] = (avatarCounts[log.avatar] || 0) + 1;
                });
            }
        }

        // Calculate streak
        let streak = 0;
        for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const key = `brushLogs_${date.toDateString()}`;
            const logs = localStorage.getItem(key);
            if (logs && JSON.parse(logs).length >= 1) {
                streak++;
            } else if (i > 0) { // Don't break on today if no brush yet
                break;
            }
        }

        // Get last brush time
        const today = new Date().toDateString();
        const todayLogs = localStorage.getItem(`brushLogs_${today}`);
        let lastBrush = null;
        if (todayLogs) {
            const parsed = JSON.parse(todayLogs);
            if (parsed.length > 0) {
                lastBrush = parsed[parsed.length - 1].time;
            }
        }

        // Find favorite avatar
        let favorite = 'None yet';
        let maxCount = 0;
        Object.entries(avatarCounts).forEach(([avatar, count]) => {
            if (count > maxCount) {
                maxCount = count;
                favorite = avatar;
            }
        });

        setStats({ totalSessions: total, streak, lastBrush, favoriteAvatar: favorite });
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">👤 Profile</h1>
                <Link href="/dashboard"><Button variant="ghost">← Back</Button></Link>
            </div>

            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <CardContent className="pt-6 text-center">
                    <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center text-5xl mb-4">
                        😊
                    </div>
                    <h2 className="text-2xl font-bold">Brushing Champion!</h2>
                    <p className="opacity-80">Keep up the great work</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-4xl font-bold text-blue-600">{stats.totalSessions}</p>
                        <p className="text-sm text-gray-500">Total Sessions (30d)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-4xl font-bold text-green-600">{stats.streak}🔥</p>
                        <p className="text-sm text-gray-500">Day Streak</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Last Brush Today</span>
                        <span className="font-medium">{stats.lastBrush || 'Not yet!'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Favorite Buddy</span>
                        <span className="font-medium">{stats.favoriteAvatar}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap">
                        {stats.totalSessions >= 1 && <span className="text-3xl" title="First Brush">🌟</span>}
                        {stats.totalSessions >= 10 && <span className="text-3xl" title="10 Sessions">🏅</span>}
                        {stats.streak >= 3 && <span className="text-3xl" title="3 Day Streak">🔥</span>}
                        {stats.streak >= 7 && <span className="text-3xl" title="Week Streak">💪</span>}
                        {stats.totalSessions === 0 && <p className="text-gray-400 italic">Complete sessions to earn achievements!</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
