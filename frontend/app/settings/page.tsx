'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);

    useEffect(() => {
        // Load settings from localStorage
        const settings = localStorage.getItem('toothbuddy_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            setVoiceEnabled(parsed.voiceEnabled ?? true);
            setVibrationEnabled(parsed.vibrationEnabled ?? true);
            setMusicEnabled(parsed.musicEnabled ?? true);
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('toothbuddy_settings', JSON.stringify({
            voiceEnabled,
            vibrationEnabled,
            musicEnabled
        }));
        alert('Settings saved!');
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">⚙️ Settings</h1>
                <Link href="/dashboard"><Button variant="ghost">← Back</Button></Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Audio & Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Voice Instructions</p>
                            <p className="text-sm text-gray-500">Spoken guidance during brushing</p>
                        </div>
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors ${voiceEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Vibration Feedback</p>
                            <p className="text-sm text-gray-500">Haptic feedback on mobile devices</p>
                        </div>
                        <button
                            onClick={() => setVibrationEnabled(!vibrationEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors ${vibrationEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${vibrationEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Background Music</p>
                            <p className="text-sm text-gray-500">Ambient music during sessions</p>
                        </div>
                        <button
                            onClick={() => setMusicEnabled(!musicEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors ${musicEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${musicEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">ToothBuddy v1.0</p>
                    <p className="text-sm text-gray-400 mt-2">A fun, accessible tooth brushing guide for all ages.</p>
                </CardContent>
            </Card>

            <Button onClick={saveSettings} className="w-full">Save Settings</Button>
        </div>
    );
}
