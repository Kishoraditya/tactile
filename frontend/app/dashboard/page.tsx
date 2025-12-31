'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AVATARS } from '@/lib/brushing-data';
import { tts } from '@/lib/tts-service';
import { Mic } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Welcome message
        tts.speak("Who is brushing today? Tap a buddy or say their name.");
        let recognition: any = null;
        let isMounted = true;

        const startRecognition = () => {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition || !isMounted) return;

            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onstart = () => { if (isMounted) setIsListening(true); };
            recognition.onend = () => {
                if (isMounted) {
                    setIsListening(false);
                    // Restart only if still mounted
                    try { recognition.start(); } catch (e) { }
                }
            };

            recognition.onresult = (event: any) => {
                if (!isMounted) return;
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
                console.log("Dashboard Cmd:", transcript);

                if (transcript.includes('luna')) {
                    router.push('/dashboard/session/1-4');
                } else if (transcript.includes('captain') || transcript.includes('sparkle')) {
                    router.push('/dashboard/session/5-11');
                } else if (transcript.includes('doctor') || transcript.includes('bright')) {
                    router.push('/dashboard/session/12-18');
                }
            };

            try { recognition.start(); } catch (e) { }
        };

        startRecognition();

        return () => {
            isMounted = false;
            tts.cancel();
            if (recognition) recognition.stop();
        };
    }, [router]);

    // Track brush sessions in localStorage
    const [brushLogs, setBrushLogs] = useState<{ time: string, avatar: string }[]>([]);

    useEffect(() => {
        const today = new Date().toDateString();
        const stored = localStorage.getItem(`brushLogs_${today}`);
        if (stored) setBrushLogs(JSON.parse(stored));
    }, []);

    const handleStartSession = (avatarId: string, avatarName: string) => {
        const today = new Date().toDateString();
        const newLog = { time: new Date().toLocaleTimeString(), avatar: avatarName };
        const updated = [...brushLogs, newLog];
        setBrushLogs(updated);
        localStorage.setItem(`brushLogs_${today}`, JSON.stringify(updated));
        router.push(`/dashboard/session/${avatarId}`);
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Who is brushing today?</h1>
                    <p className="text-muted-foreground">Select your buddy to start, or say their name.</p>
                </div>
                {isListening && <div className="flex items-center gap-2 text-red-500 animate-pulse font-medium"><Mic className="w-5 h-5" /> Listening...</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Object.values(AVATARS).map((avatar) => (
                    <Card
                        key={avatar.id}
                        className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all hover:shadow-xl cursor-pointer"
                        onClick={() => handleStartSession(avatar.id, avatar.name)}
                    >
                        <div className={`absolute inset-0 opacity-10 pointer-events-none ${avatar.themeColor}`} />
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">{avatar.name}</CardTitle>
                            <div className="text-sm font-medium opacity-70">Age: {avatar.id}</div>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-6 pb-8">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-inner bg-white`}>
                                {avatar.avatarId === 'luna' ? '🧚‍♀️' : avatar.avatarId === 'captain' ? '🦸‍♂️' : '👨‍⚕️'}
                            </div>
                            <Button className={`w-full text-lg h-12 ${avatar.themeColor} hover:brightness-110 text-white`}>
                                Start with {avatar.name.split(' ')[0]}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    📅 Today's Brushing Log
                </h2>
                <div className="space-y-3">
                    {brushLogs.length > 0 ? brushLogs.map((log, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <span className="text-2xl">🦷</span>
                            <div>
                                <p className="font-medium">{log.avatar}</p>
                                <p className="text-sm text-gray-500">{log.time}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-400 py-4 italic">No brushing sessions yet today. Let's start!</p>
                    )}
                </div>
            </div>

            <div className="flex gap-4 justify-center">
                <Link href="/settings"><Button variant="outline">⚙️ Settings</Button></Link>
                <Link href="/profile"><Button variant="outline">👤 Profile</Button></Link>
            </div>
        </div>
    );
}
