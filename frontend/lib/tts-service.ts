'use client';

// Character type for voice selection
type Character = 'luna' | 'captain' | 'dr_bright';

// Age group mapping
const CHARACTER_AGE_GROUP: Record<Character, string> = {
    luna: '1-4',
    captain: '5-11',
    dr_bright: '12-18'
};

/**
 * Get current time slot for greeting selection
 */
function getTimeSlot(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

/**
 * TTS Service - Uses pre-recorded audio files with API fallback
 * 
 * For standard app flows (brushing steps, greetings, etc.), audio is played
 * from pre-generated MP3 files. For dynamic/custom text, falls back to
 * ElevenLabs API via backend.
 */
export class TtsService {
    private audio: HTMLAudioElement | null = null;
    private currentCharacter: Character = 'luna';
    private prerecordedEnabled: boolean = true;

    /**
     * Set the current character for voice selection.
     */
    setCharacter(character: Character) {
        this.currentCharacter = character;
        console.log(`TTS character set: ${character}`);
    }

    /**
     * Play a pre-recorded brushing step
     */
    async playStep(stepIndex: number, lang: 'en' | 'mr'): Promise<void> {
        const ageGroup = CHARACTER_AGE_GROUP[this.currentCharacter];
        const path = `/audio/${lang}/${ageGroup}/step_${stepIndex}.mp3`;
        return this.playAudioFile(path);
    }

    /**
     * Play a time-based greeting
     */
    async playGreeting(lang: 'en' | 'mr'): Promise<void> {
        const ageGroup = CHARACTER_AGE_GROUP[this.currentCharacter];
        const timeSlot = getTimeSlot();
        const path = `/audio/${lang}/${ageGroup}/greeting_${timeSlot}.mp3`;
        return this.playAudioFile(path);
    }

    /**
     * Play welcome message
     */
    async playWelcome(lang: 'en' | 'mr'): Promise<void> {
        const ageGroup = CHARACTER_AGE_GROUP[this.currentCharacter];
        const path = `/audio/${lang}/${ageGroup}/welcome.mp3`;
        return this.playAudioFile(path);
    }

    /**
     * Play completion message
     */
    async playCompletion(lang: 'en' | 'mr'): Promise<void> {
        const ageGroup = CHARACTER_AGE_GROUP[this.currentCharacter];
        const path = `/audio/${lang}/${ageGroup}/completion.mp3`;
        return this.playAudioFile(path);
    }

    /**
     * Play a UI audio clip (e.g., "welcome", "language_prompt")
     */
    async playUI(key: string, lang: 'en' | 'mr'): Promise<void> {
        const path = `/audio/${lang}/ui/${key}.mp3`;
        return this.playAudioFile(path);
    }

    /**
     * Play countdown number (1-5)
     */
    async playCountdown(num: number, lang: 'en' | 'mr'): Promise<void> {
        if (num < 1 || num > 5) return;
        const path = `/audio/${lang}/ui/count_${num}.mp3`;
        return this.playAudioFile(path);
    }

    /**
     * Speak text using ElevenLabs via backend API.
     * This is the fallback for dynamic/custom text not in pre-recorded files.
     */
    async speak(text: string, lang: 'en' | 'mr' = 'en'): Promise<void> {
        this.cancel();

        try {
            const hostname = window.location.hostname;
            const port = '8000';
            const apiUrl = `http://${hostname}:${port}/api/tts/generate`;

            console.log(`TTS API: ${this.currentCharacter} speaking ${lang}: "${text.substring(0, 30)}..."`);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    lang,
                    character: this.currentCharacter
                })
            });

            if (!response.ok) {
                throw new Error(`TTS API failed: ${response.status} ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            return new Promise((resolve) => {
                this.audio = new Audio(url);
                this.audio.onended = () => {
                    URL.revokeObjectURL(url);
                    resolve();
                };
                this.audio.onerror = (e) => {
                    console.error("Audio playback error", e);
                    URL.revokeObjectURL(url);
                    resolve();
                };

                const playPromise = this.audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.error("Autoplay blocked", e);
                        resolve();
                    });
                }
            });
        } catch (e) {
            console.error("TTS failed", e);
        }
    }

    /**
     * Play audio from a pre-recorded file path
     */
    private async playAudioFile(path: string): Promise<void> {
        this.cancel();

        console.log(`Playing pre-recorded: ${path}`);

        return new Promise((resolve) => {
            this.audio = new Audio(path);

            this.audio.onended = () => resolve();
            this.audio.onerror = (e) => {
                console.warn(`Pre-recorded audio not found: ${path}`);
                resolve();
            };

            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.error("Autoplay blocked", e);
                    resolve();
                });
            }
        });
    }

    pause() {
        this.stopAudio();
    }

    resume() {
        if (this.audio) {
            this.audio.play();
        }
    }

    cancel() {
        this.stopAudio();
    }

    private stopAudio() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
        }
    }
}

export const tts = new TtsService();

