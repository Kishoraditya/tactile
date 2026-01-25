'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AVATARS } from '@/lib/brushing-data';
import { tts } from '@/lib/tts-service';
import { Mic } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function DashboardPage() {
    const router = useRouter();
    const { lang, t } = useLanguage();
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const retryCountRef = useRef(0);
    const maxRetries = 5;
    const hasSpokenWelcomeRef = useRef(false);

    useEffect(() => {
        let isMounted = true;

        // Welcome message only once per mount
        if (!hasSpokenWelcomeRef.current) {
            const welcomeText = lang === 'mr'
                ? "आज कोण दात घासणार? तुमचा मित्र निवडा, किंवा त्यांचे नाव सांगा."
                : "Who is brushing today? Tap a buddy or say their name.";
            tts.speak(welcomeText, lang);
            hasSpokenWelcomeRef.current = true;
        }

        let recognition: any = null;

        const startRecognition = () => {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition || !isMounted) return;

            if (retryCountRef.current >= maxRetries) {
                console.warn("Stopping voice recognition due to excessive errors.");
                setVoiceError(t('voiceDisabled'));
                return;
            }

            try {
                recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-US';
                recognition.interimResults = false;

                recognition.onstart = () => {
                    if (isMounted) {
                        setIsListening(true);
                        setVoiceError(null);
                        setTimeout(() => { if (isMounted && isListening) retryCountRef.current = 0; }, 5000);
                    }
                };

                recognition.onerror = (event: any) => {
                    const errorMsg = String(event.error);
                    if (errorMsg.includes('aborted') || errorMsg.includes('no-speech')) {
                        return;
                    }
                    console.error("Voice Error:", event.error);
                    if (isMounted) {
                        if (errorMsg === 'not-allowed' || errorMsg === 'service-not-allowed') {
                            setVoiceError(t('micDenied'));
                            retryCountRef.current = maxRetries;
                            setIsListening(false);
                        } else {
                            retryCountRef.current += 1;
                        }
                    }
                };

                recognition.onend = () => {
                    if (isMounted) {
                        setIsListening(false);
                        setTimeout(() => {
                            if (isMounted && recognition && !recognition.aborted) {
                                if (retryCountRef.current < maxRetries) {
                                    startRecognition();
                                }
                            }
                        }, 1000);
                    }
                };

                recognition.onresult = (event: any) => {
                    if (!isMounted) return;
                    retryCountRef.current = 0;
                    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
                    console.log("Dashboard Cmd:", transcript);

                    // Helper to navigate (cancel audio first)
                    const navigateTo = (path: string) => {
                        tts.cancel();
                        if (recognition) recognition.stop();
                        router.push(path);
                    };

                    // English commands (Luna with phonetic variants)
                    if (transcript.includes('luna') || transcript.includes('loona') || transcript.includes('lona')) {
                        navigateTo('/dashboard/session/1-4');
                    } else if (transcript.includes('captain') || transcript.includes('sparkle')) {
                        navigateTo('/dashboard/session/5-11');
                    } else if (transcript.includes('doctor') || transcript.includes('bright')) {
                        navigateTo('/dashboard/session/12-18');
                    }
                    // Marathi commands (with phonetic variants for 'chanda pari')
                    else if (transcript.includes('चंदा') || transcript.includes('परी') ||
                        transcript.includes('chanda') || transcript.includes('pari') ||
                        transcript.includes('chandapari') || transcript.includes('chanda pari')) {
                        navigateTo('/dashboard/session/1-4');
                    } else if (transcript.includes('कॅप्टन') || transcript.includes('चमक') ||
                        transcript.includes('captain') || transcript.includes('chamak')) {
                        navigateTo('/dashboard/session/5-11');
                    } else if (transcript.includes('डॉक्टर') || transcript.includes('तेजस्वी') ||
                        transcript.includes('doctor') || transcript.includes('tejasvi')) {
                        navigateTo('/dashboard/session/12-18');
                    }
                };

                recognition.start();

            } catch (e) {
                console.error("Recognition start failed:", e);
                retryCountRef.current += 1;
            }
        };

        const timer = setTimeout(startRecognition, 1000);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            tts.cancel();
            if (recognition) {
                recognition.aborted = true;
                recognition.stop();
            }
        };
    }, [router, lang, t]);

    // Track brush sessions in localStorage
    const [brushLogs, setBrushLogs] = useState<{ time: string, avatar: string }[]>([]);

    useEffect(() => {
        const today = new Date().toDateString();
        const stored = localStorage.getItem(`brushLogs_${today}`);
        if (stored) setBrushLogs(JSON.parse(stored));
    }, []);

    const handleStartSession = (avatarId: string, avatarName: string) => {
        // Cancel any playing audio before navigating
        tts.cancel();
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        const today = new Date().toDateString();
        const newLog = { time: new Date().toLocaleTimeString(), avatar: avatarName };
        const updated = [...brushLogs, newLog];
        setBrushLogs(updated);
        localStorage.setItem(`brushLogs_${today}`, JSON.stringify(updated));
        router.push(`/dashboard/session/${avatarId}`);
    };

    // Helper to get localized name
    const getName = (avatar: typeof AVATARS['1-4']) => {
        return lang === 'mr' ? avatar.name_mr : avatar.name;
    };

    const getDesc = (avatar: typeof AVATARS['1-4']) => {
        return lang === 'mr' ? avatar.description_mr : avatar.description;
    };

    return (
        <div className="space-y-8 relative p-4 md:p-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{t('whoBrushing')}</h1>
                    <p className="text-muted-foreground">{t('selectBuddy')}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {isListening && <div className="flex items-center gap-2 text-green-600 animate-pulse font-medium"><Mic className="w-5 h-5" /> {t('listening')}</div>}
                    {voiceError && <div className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-1 rounded border border-red-200">{voiceError}</div>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Object.values(AVATARS).map((avatar) => (
                    <Card
                        key={avatar.id}
                        className="group relative overflow-hidden border-2 hover:border-blue-500 transition-all hover:shadow-xl cursor-pointer"
                        onClick={() => handleStartSession(avatar.id, getName(avatar))}
                    >
                        <div className={`absolute inset-0 opacity-10 pointer-events-none ${avatar.themeColor}`} />
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">{getName(avatar)}</CardTitle>
                            <div className="text-sm font-medium opacity-70">{t('age')}: {avatar.id}</div>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-6 pb-8">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-inner bg-white`}>
                                {avatar.avatarId === 'luna' ? '🧚‍♀️' : avatar.avatarId === 'captain' ? '🦸‍♂️' : '👨‍⚕️'}
                            </div>
                            <p className="text-sm text-gray-600 text-center">{getDesc(avatar)}</p>
                            <Button className={`w-full text-lg h-12 ${avatar.themeColor} hover:brightness-110 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                                {t('startWith')} {getName(avatar).split(' ')[0]}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    📅 {t('todayLog')}
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
                        <p className="text-center text-gray-400 py-4 italic">{t('noSessionsYet')}</p>
                    )}
                </div>
            </div>

            <div className="flex gap-4 justify-center">
                <Link href="/dashboard/settings"><Button variant="outline">⚙️ {t('settings')}</Button></Link>
                <Link href="/profile"><Button variant="outline">👤 {t('profile')}</Button></Link>
            </div>
        </div>
    );
}
