'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, SkipForward, Mic, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { AVATARS, AgeGroup, getTimeGreeting, getRoutines } from '@/lib/brushing-data';
import { tts } from '@/lib/tts-service';
import { Avatar3D } from './avatar-3d';
import { music } from '@/lib/music-service';
import { useLanguage } from '@/lib/i18n';


export function BrushingSession({ ageGroup, onComplete }: { ageGroup: AgeGroup; onComplete: () => void }) {
    const { lang, t } = useLanguage();
    const router = useRouter();

    // Derived local state based on language
    const avatar = AVATARS[ageGroup];
    const steps = getRoutines(ageGroup, lang);

    // Helpers for localized text
    const getAvatarName = () => lang === 'mr' ? avatar.name_mr : avatar.name;
    const getWelcomeMsg = () => lang === 'mr' ? avatar.welcomeMessage_mr : avatar.welcomeMessage;
    const getCompletionMsg = () => lang === 'mr' ? avatar.completionMessage_mr : avatar.completionMessage;

    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);


    // Use refs to track mutable state that callbacks need
    const isPlayingRef = useRef(isPlaying);
    const currentStepIndexRef = useRef(currentStepIndex);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isSpeakingRef = useRef(false);
    const hasAnnouncedRef = useRef(false);
    const isMountedRef = useRef(true);

    // Sync refs with state
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { currentStepIndexRef.current = currentStepIndex; }, [currentStepIndex]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (timerRef.current) clearInterval(timerRef.current);
            tts.cancel();
            music.stop();
        };
    }, []);

    // Announce greeting on mount (using pre-recorded audio)
    useEffect(() => {
        if (!hasAnnouncedRef.current) {
            hasAnnouncedRef.current = true;
            // Set character for voice selection
            tts.setCharacter(avatar.avatarId as 'luna' | 'captain' | 'dr_bright');
            // Play pre-recorded greeting
            tts.playGreeting(lang);
        }
    }, [avatar, lang]);

    // Clear and stop timer
    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Finish session (using pre-recorded completion audio)
    const finishSession = useCallback(async () => {
        stopTimer();
        setIsPlaying(false);
        music.stop();
        setIsAvatarSpeaking(true);
        await tts.playCompletion(lang);
        setIsAvatarSpeaking(false);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 500]);
        if (isMountedRef.current) {
            onComplete();
        }
    }, [lang, stopTimer, onComplete]);

    // Go to next step
    const nextStep = useCallback(async (index: number) => {
        if (!isMountedRef.current) return;

        // Cancel any currently playing audio
        tts.cancel();
        stopTimer();

        if (index >= steps.length) {
            await finishSession();
            return;
        }

        const step = steps[index];
        setCurrentStepIndex(index);
        setTimeLeft(0);

        // Play pre-recorded step audio
        setIsAvatarSpeaking(true);
        await tts.playStep(index, lang);
        setIsAvatarSpeaking(false);

        if (!isMountedRef.current || !isPlayingRef.current) return;

        if (navigator.vibrate) navigator.vibrate(step.vibrationPattern);

        if (step.duration > 0) {
            // Start timer countdown
            setTimeLeft(step.duration);
            let remaining = step.duration;

            timerRef.current = setInterval(() => {
                if (!isMountedRef.current || !isPlayingRef.current) {
                    stopTimer();
                    return;
                }

                remaining--;
                setTimeLeft(remaining);

                // Countdown voice (only last 5 seconds, using pre-recorded numbers)
                if (remaining <= 5 && remaining > 0 && !isSpeakingRef.current) {
                    tts.playCountdown(remaining, lang);
                }

                if (remaining <= 0) {
                    stopTimer();
                    nextStep(currentStepIndexRef.current + 1);
                }
            }, 1000);
        } else {
            // No duration - wait briefly then continue
            setTimeout(() => {
                if (isMountedRef.current && isPlayingRef.current) {
                    nextStep(index + 1);
                }
            }, 1000);
        }
    }, [steps, stopTimer, finishSession, lang]);

    // Toggle pause/resume
    const togglePause = useCallback(() => {
        if (isPlayingRef.current) {
            stopTimer();
            setIsPlaying(false);
            tts.cancel();
            music.pause();
        } else {
            setIsPlaying(true);
            music.resume();
            // If there's time left on current step, restart timer
            const step = steps[currentStepIndexRef.current];
            if (step && step.duration > 0) {
                // Play step audio again on resume
                setIsAvatarSpeaking(true);
                tts.playStep(currentStepIndexRef.current, lang).then(() => {
                    if (isMountedRef.current) setIsAvatarSpeaking(false);
                    if (!isMountedRef.current || !isPlayingRef.current) return;
                });
            }
        }
    }, [steps, stopTimer, lang]);

    // Start session (using pre-recorded welcome audio)
    const startSession = useCallback(async () => {
        if (hasStarted) return;

        setHasStarted(true);
        setIsPlaying(true);

        await music.start(avatar.musicTrack);
        tts.setCharacter(avatar.avatarId as 'luna' | 'captain' | 'dr_bright');
        setIsAvatarSpeaking(true);
        await tts.playWelcome(lang);
        setIsAvatarSpeaking(false);

        if (isMountedRef.current) {
            nextStep(0);
        }
    }, [hasStarted, avatar, nextStep, lang]);

    // Voice recognition (runs once, not on every state change)
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-US';

        recognition.onstart = () => { if (isMountedRef.current) setIsListening(true); };

        recognition.onerror = (event: any) => {
            const errorMsg = String(event.error);
            if (errorMsg.includes('aborted') || errorMsg.includes('no-speech')) return;
            console.error("Session Voice Error:", event.error);
        };

        recognition.onend = () => {
            if (isMountedRef.current) {
                setIsListening(false);
                setTimeout(() => {
                    if (isMountedRef.current) {
                        try { recognition.start(); } catch (e) { }
                    }
                }, 1000);
            }
        };

        recognition.onresult = (event: any) => {
            if (!isMountedRef.current) return;
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log("Voice:", transcript);

            // English Commands
            if (transcript.includes('start') || transcript.includes('begin')) {
                tts.playUI('voice_start', lang);
                startSession();
            } else if (transcript.includes('pause') || transcript.includes('stop')) {
                if (isPlayingRef.current) {
                    tts.playUI('voice_pause', lang);
                    togglePause();
                }
            } else if (transcript.includes('resume') || transcript.includes('continue')) {
                if (!isPlayingRef.current) {
                    tts.playUI('voice_resume', lang);
                    togglePause();
                }
            } else if (transcript.includes('skip') || transcript.includes('next')) {
                tts.playUI('voice_skip', lang);
                nextStep(currentStepIndexRef.current + 1);
            }
            // Marathi Commands
            else if (transcript.includes('सुरू') || transcript.includes('चालू') || transcript.includes('स्टार्ट')) {
                tts.playUI('voice_start', lang);
                startSession();
            } else if (transcript.includes('थांबा') || transcript.includes('थांब') || transcript.includes('स्टॉप')) {
                if (isPlayingRef.current) {
                    tts.playUI('voice_pause', lang);
                    togglePause();
                }
            } else if (transcript.includes('पुढे') || transcript.includes('परत') || transcript.includes('रिज्युम')) {
                if (!isPlayingRef.current) {
                    tts.playUI('voice_resume', lang);
                    togglePause();
                }
            } else if (transcript.includes('वगळा') || transcript.includes('पुढचे') || transcript.includes('नेक्स्ट') || transcript.includes('skip')) {
                tts.playUI('voice_skip', lang);
                nextStep(currentStepIndexRef.current + 1);
            }
        };

        // Delay start to prevent mount race conditions
        setTimeout(() => {
            if (isMountedRef.current) {
                try { recognition.start(); } catch (e) { }
            }
        }, 1000);

        return () => { recognition.stop(); };
    }, [lang]); // Restart if language changes

    // Derived state
    const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
    const animationState = currentStep?.animationState || 'idle';
    const currentMessage = lang === 'mr' && currentStep?.message_mr ? currentStep.message_mr : currentStep?.message;

    if (!hasStarted) {
        return (
            <div className={`flex flex-col items-center justify-center p-6 h-full text-center space-y-8 ${avatar.themeColor} text-white`}>
                <h1 className="text-4xl font-bold drop-shadow-md">{getAvatarName()}</h1>
                <div className="relative">
                    <Avatar3D isSpeaking={isAvatarSpeaking} isBrushing={false} animationState="wave" avatarId={avatar.avatarId} />
                    {isListening && (
                        <div className="absolute top-0 right-0 animate-pulse bg-red-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Mic className="w-3 h-3" /> {t('listening')}
                        </div>
                    )}
                </div>
                <Button onClick={startSession} className="w-64 h-24 text-3xl rounded-full shadow-xl bg-white text-black hover:scale-105 transition-all">
                    {t('voiceStart').toUpperCase()}
                </Button>
                <p className="opacity-80 text-lg animate-pulse">
                    {lang === 'mr' ? '"सुरू करा" म्हणा...' : 'Say "Start" to begin...'}
                </p>
            </div>
        );
    }

    return (
        <div className={`flex h-full ${avatar.themeColor} text-white transition-colors duration-1000`}>
            <div className="flex-1 flex flex-col p-4 relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 z-10">
                    <div className="font-bold text-lg">{t('step')} {currentStepIndex + 1} {t('of')} {steps.length}</div>
                    <div className="flex items-center gap-2">
                        {isListening && <Mic className="w-6 h-6 animate-pulse text-red-200" />}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/20">
                                    <Info className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="overflow-y-auto">
                                <SidebarContent avatar={avatar} currentStep={currentStep} lang={lang} t={t} />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <Avatar3D
                        isSpeaking={isAvatarSpeaking}
                        isBrushing={animationState === 'brushing'}
                        animationState={animationState}
                        avatarId={avatar.avatarId}
                    />

                    {/* Timer/Message Area */}
                    <div className="text-center space-y-4 max-w-md z-10">
                        {timeLeft > 0 && (
                            <div className="text-8xl font-black drop-shadow-lg font-mono">{timeLeft}</div>
                        )}
                        <p className="text-2xl font-medium px-4 min-h-[5rem] flex items-center justify-center bg-black/10 rounded-xl p-2 backdrop-blur-sm">
                            {currentMessage || t('getReady')}
                        </p>
                    </div>
                </div>

                <div className="h-24 grid grid-cols-2 gap-4 mt-auto z-10">
                    <Button variant="secondary" className="h-full text-2xl shadow-lg border-4 border-white" onClick={togglePause}>
                        {isPlaying ? <Pause className="w-8 h-8 mr-2" /> : <Play className="w-8 h-8 mr-2" />}
                        {isPlaying ? t('pause').toUpperCase() : t('resume').toUpperCase()}
                    </Button>
                    <Button variant="destructive" className="h-full text-2xl shadow-lg border-4 border-white/50" onClick={() => nextStep(currentStepIndex + 1)}>
                        <SkipForward className="w-8 h-8 mr-2" /> {t('skip').toUpperCase()}
                    </Button>
                </div>
            </div>

            {/* DESKTOP SIDEBAR */}
            <div className="hidden lg:block w-80 bg-white/10 backdrop-blur-md border-l border-white/20 p-6 overflow-y-auto">
                <SidebarContent avatar={avatar} currentStep={currentStep} lang={lang} t={t} />
            </div>
        </div>
    );
}

function SidebarContent({ avatar, currentStep, lang, t }: { avatar: any; currentStep: any; lang: string, t: any }) {
    const getName = () => lang === 'mr' ? avatar.name_mr : avatar.name;
    const getDesc = () => lang === 'mr' ? avatar.description_mr : avatar.description;
    const getProduct = (type: 'brush' | 'paste') => lang === 'mr' ? avatar.productRecommendations[`${type}_mr`] : avatar.productRecommendations[type];
    const getTips = () => lang === 'mr' ? (avatar.hygieneTips_mr || avatar.hygieneTips) : avatar.hygieneTips;

    return (
        <div className="space-y-6 text-white lg:text-white text-slate-900">
            <div>
                <h2 className="text-xl font-bold mb-2">{getName()}{t('guide')}</h2>
                <p className="text-sm opacity-90">{getDesc()}</p>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg border-2 border-white/30">
                <iframe
                    width="100%"
                    height="100%"
                    src={avatar.videoUrl}
                    title="Brushing Guide"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <h3 className="font-semibold">{t('recommendedBrush')}</h3>
                    <p className="text-sm opacity-90">{getProduct('brush')}</p>
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold">{t('toothpaste')}</h3>
                    <p className="text-sm opacity-90">{getProduct('paste')}</p>
                </div>
            </div>

            {currentStep && (
                <div className="p-3 bg-white/20 rounded-lg border border-white/30">
                    <h3 className="font-semibold mb-1 text-sm">{t('currentStep')}</h3>
                    <p className="text-sm">{lang === 'mr' && currentStep.message_mr ? currentStep.message_mr : currentStep.message}</p>
                </div>
            )}

            <div className="opacity-80 text-xs">
                <h4 className="font-semibold mb-1">{t('hygieneTips')}</h4>
                <ul className="list-disc list-inside space-y-1">
                    {getTips()?.map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                    ))}
                </ul>
            </div>

            {/* Emergency Dentist Contact */}
            <div className="mt-6 p-4 bg-red-500/20 rounded-lg border border-red-300/30">
                <h3 className="font-bold text-sm mb-2">🚨 {t('emergencyContact')}</h3>
                <div className="text-xs space-y-1">
                    <p><strong>Dr. Sarah Miller, DDS</strong></p>
                    <p>📞 +1 (555) 123-4567</p>
                    <p>📍 123 Smile Street, Dental City</p>
                    <p className="opacity-70 mt-2">{t('available247')}</p>
                </div>
            </div>
        </div>
    );
}


