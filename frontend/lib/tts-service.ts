'use client';

// Simple TTS Service wrapper
export class TtsService {
    private synth: SpeechSynthesis | null = null;
    private voice: SpeechSynthesisVoice | null = null;
    private pitch: number = 1;
    private rate: number = 1;
    private currentUtterance: SpeechSynthesisUtterance | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.synth = window.speechSynthesis;
        }
    }

    setProfile(voiceQuery: string, pitch: number, rate: number) {
        this.pitch = pitch;
        this.rate = rate;

        if (!this.synth) return;

        // Voices load asynchronously in Chrome
        const setVoice = () => {
            const voices = this.synth!.getVoices();
            // Improved matching: try exact query, then gender/lang match, then fallback
            this.voice = voices.find(v => v.name.toLowerCase().includes(voiceQuery.toLowerCase()))
                || voices.find(v => v.lang.startsWith('en') && (voiceQuery === 'female' ? v.name.includes('Female') || v.name.includes('Zira') : v.name.includes('Male') || v.name.includes('David')))
                || voices.find(v => v.lang.startsWith('en'))
                || null;
            console.log(`TTS Profile set: ${voiceQuery} -> ${this.voice?.name}`);
        };

        if (this.synth.getVoices().length === 0) {
            this.synth.onvoiceschanged = setVoice;
        } else {
            setVoice();
        }
    }

    speak(text: string): Promise<void> {
        return new Promise((resolve) => {
            if (!this.synth) {
                resolve();
                return;
            }

            // Stop any currently speaking utterance before starting a new one
            this.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            if (this.voice) utterance.voice = this.voice;
            utterance.pitch = this.pitch;
            utterance.rate = this.rate;

            utterance.onend = () => {
                this.currentUtterance = null; // Clear current utterance on end
                resolve();
            };

            utterance.onerror = (e) => {
                // console.error("TTS Error", e); // Suppress errors for now as they are often just cancellations
                this.currentUtterance = null; // Clear current utterance on error
                resolve();
            };

            this.currentUtterance = utterance;
            this.synth.speak(utterance);
        });
    }

    pause() {
        if (this.synth) {
            this.synth.cancel(); // We use cancel for immediate stop
        }
    }

    resume() {
        // Since we cancelled, we can't native resume. 
        // Logic in session will handle re-playing the step.
    }

    cancel() {
        if (this.synth) {
            this.synth.cancel();
        }
    }
}

export const tts = new TtsService();
