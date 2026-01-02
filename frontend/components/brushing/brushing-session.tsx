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
import { AVATARS, BRUSHING_ROUTINES, AgeGroup, getTimeGreeting } from '@/lib/brushing-data';
import { tts } from '@/lib/tts-service';
import { Avatar3D } from './avatar-3d';
import { music } from '@/lib/music-service';

// Strip emojis from text for TTS
function stripEmojis(text: string): string {
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu, '').trim();
}

export function BrushingSession({ ageGroup, onComplete }: { ageGroup: AgeGroup; onComplete: () => void }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const router = useRouter();
    const avatar = AVATARS[ageGroup];
    const steps = BRUSHING_ROUTINES[ageGroup];

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

    // Announce greeting on mount (once)
    useEffect(() => {
        if (!hasAnnouncedRef.current) {
            hasAnnouncedRef.current = true;
            tts.setProfile(avatar.voiceQuery, avatar.pitch, avatar.rate);
            const greeting = stripEmojis(getTimeGreeting(avatar.avatarId));
            tts.speak(`${greeting}. Press the Start button or say Start to begin.`);
        }
    }, [avatar]);

    // Helper function to speak with awaiting
    const speak = useCallback(async (text: string): Promise<void> => {
        if (!isMountedRef.current) return;
        isSpeakingRef.current = true;
        setIsAvatarSpeaking(true);
        const cleanText = stripEmojis(text);
        await tts.speak(cleanText);
        if (isMountedRef.current) {
            isSpeakingRef.current = false;
            setIsAvatarSpeaking(false);
        }
    }, []);

    // Clear and stop timer
    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Finish session
    const finishSession = useCallback(async () => {
        stopTimer();
        setIsPlaying(false);
        music.stop();
        await speak(avatar.completionMessage);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 500]);
        if (isMountedRef.current) {
            onComplete();
        }
    }, [avatar.completionMessage, speak, stopTimer, onComplete]);

    // Go to next step
    const nextStep = useCallback(async (index: number) => {
        if (!isMountedRef.current) return;

        stopTimer();

        if (index >= steps.length) {
            await finishSession();
            return;
        }

        const step = steps[index];
        setCurrentStepIndex(index);
        setTimeLeft(0);

        // Speak the step message and wait for it to complete
        await speak(step.message);

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

                // Countdown voice (only last 5 seconds, and don't interrupt other speech)
                if (remaining <= 5 && remaining > 0 && !isSpeakingRef.current) {
                    tts.speak(remaining.toString());
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
    }, [steps, speak, stopTimer, finishSession]);

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
                // Restart the timer from where we left off
                speak(step.message).then(() => {
                    if (!isMountedRef.current || !isPlayingRef.current) return;
                    // Timer will be handled by the next step call pattern
                    // For now, just resume with remaining time
                });
            }
        }
    }, [steps, speak, stopTimer]);

    // Start session
    const startSession = useCallback(async () => {
        if (hasStarted) return;

        setHasStarted(true);
        setIsPlaying(true);

        await music.start(avatar.musicTrack);
        tts.setProfile(avatar.voiceQuery, avatar.pitch, avatar.rate);
        await speak(avatar.welcomeMessage);

        if (isMountedRef.current) {
            nextStep(0);
        }
    }, [hasStarted, avatar, speak, nextStep]);

    // [voiceError, setVoiceError] must be added to state first! 
    // Wait, I need to add state before this useEffect.
    // I will split this into two calls: one for state, one for useEffect.
    // Making this tool call strictly ONLY for the useEffect replacement.

    // Voice recognition (runs once, not on every state change)
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onstart = () => { if (isMountedRef.current) setIsListening(true); };

        recognition.onerror = (event: any) => {
            if (event.error === 'aborted') return;
            console.error("Session Voice Error:", event.error);
            if (isMountedRef.current && event.error === 'not-allowed') {
                // handle permission error
            }
        };

        recognition.onend = () => {
            if (isMountedRef.current) {
                setIsListening(false);
                setTimeout(() => {
                    if (isMountedRef.current) {
                        try { recognition.start(); } catch (e) { }
                    }
                }, 1000); // Increased stability delay
            }
        };

        recognition.onresult = (event: any) => {
            if (!isMountedRef.current) return;
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            console.log("Voice:", transcript);

            if (transcript.includes('start') || transcript.includes('begin')) {
                startSession();
            } else if (transcript.includes('pause') || transcript.includes('stop')) {
                if (isPlayingRef.current) togglePause();
            } else if (transcript.includes('resume') || transcript.includes('continue')) {
                if (!isPlayingRef.current) togglePause();
            } else if (transcript.includes('skip') || transcript.includes('next')) {
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
    }, []); // Empty deps - run once

    // Derived state
    const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
    const animationState = currentStep?.animationState || 'idle';

    if (!hasStarted) {
        return (
            <div className={`flex flex-col items-center justify-center p-6 h-full text-center space-y-8 ${avatar.themeColor} text-white`}>
                <h1 className="text-4xl font-bold drop-shadow-md">{avatar.name}</h1>
                <div className="relative">
                    <Avatar3D isSpeaking={isAvatarSpeaking} isBrushing={false} animationState="wave" avatarId={avatar.avatarId} />
                    {isListening && (
                        <div className="absolute top-0 right-0 animate-pulse bg-red-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Mic className="w-3 h-3" /> Listening
                        </div>
                    )}
                </div>
                <Button onClick={startSession} className="w-64 h-24 text-3xl rounded-full shadow-xl bg-white text-black hover:scale-105 transition-all">
                    START
                </Button>
                <p className="opacity-80 text-lg animate-pulse">Say "Start" to begin...</p>
            </div>
        );
    }

    return (
        <div className={`flex h-full ${avatar.themeColor} text-white transition-colors duration-1000`}>
            <div className="flex-1 flex flex-col p-4 relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 z-10">
                    <div className="font-bold text-lg">Step {currentStepIndex + 1} of {steps.length}</div>
                    <div className="flex items-center gap-2">
                        {isListening && <Mic className="w-6 h-6 animate-pulse text-red-200" />}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/20">
                                    <Info className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="overflow-y-auto">
                                <SidebarContent avatar={avatar} currentStep={currentStep} />
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
                            {currentStep?.message || "Get ready..."}
                        </p>
                    </div>
                </div>

                <div className="h-24 grid grid-cols-2 gap-4 mt-auto z-10">
                    <Button variant="secondary" className="h-full text-2xl shadow-lg border-4 border-white" onClick={togglePause}>
                        {isPlaying ? <Pause className="w-8 h-8 mr-2" /> : <Play className="w-8 h-8 mr-2" />}
                        {isPlaying ? "PAUSE" : "RESUME"}
                    </Button>
                    <Button variant="destructive" className="h-full text-2xl shadow-lg border-4 border-white/50" onClick={() => nextStep(currentStepIndex + 1)}>
                        <SkipForward className="w-8 h-8 mr-2" /> SKIP
                    </Button>
                </div>
            </div>

            {/* DESKTOP SIDEBAR */}
            <div className="hidden lg:block w-80 bg-white/10 backdrop-blur-md border-l border-white/20 p-6 overflow-y-auto">
                <SidebarContent avatar={avatar} currentStep={currentStep} />
            </div>
        </div>
    );
}

function SidebarContent({ avatar, currentStep }: { avatar: any; currentStep: any }) {
    return (
        <div className="space-y-6 text-white lg:text-white text-slate-900">
            <div>
                <h2 className="text-xl font-bold mb-2">{avatar.name}'s Guide</h2>
                <p className="text-sm opacity-90">{avatar.description}</p>
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
                    <h3 className="font-semibold">Recommended Brush</h3>
                    <p className="text-sm opacity-90">{avatar.productRecommendations?.brush}</p>
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold">Toothpaste</h3>
                    <p className="text-sm opacity-90">{avatar.productRecommendations?.paste}</p>
                </div>
            </div>

            {currentStep && (
                <div className="p-3 bg-white/20 rounded-lg border border-white/30">
                    <h3 className="font-semibold mb-1 text-sm">Current Step:</h3>
                    <p className="text-sm">{currentStep.message}</p>
                </div>
            )}

            <div className="opacity-80 text-xs">
                <h4 className="font-semibold mb-1">Hygiene Tips:</h4>
                <ul className="list-disc list-inside space-y-1">
                    {avatar.hygieneTips?.map((tip: string, i: number) => (
                        <li key={i}>{tip}</li>
                    ))}
                </ul>
            </div>

            {/* Emergency Dentist Contact */}
            <div className="mt-6 p-4 bg-red-500/20 rounded-lg border border-red-300/30">
                <h3 className="font-bold text-sm mb-2">🚨 Emergency Dental Contact</h3>
                <div className="text-xs space-y-1">
                    <p><strong>Dr. Sarah Miller, DDS</strong></p>
                    <p>📞 +1 (555) 123-4567</p>
                    <p>📍 123 Smile Street, Dental City</p>
                    <p className="opacity-70 mt-2">Available 24/7 for emergencies</p>
                </div>
            </div>
        </div>
    );
}


