'use client';

/**
 * Pre-recorded Audio Service
 * Plays audio from pre-generated files, falling back to TTS API if not found.
 */

// Character type for voice selection
type Character = 'luna' | 'captain' | 'dr_bright';

// Age group mapping
const CHARACTER_AGE_GROUP: Record<Character, string> = {
    luna: '1-4',
    captain: '5-11',
    dr_bright: '12-18'
};

// Audio manifest cache
let manifestCache: Record<string, string> | null = null;
let manifestLoading: Promise<void> | null = null;

async function loadManifest(): Promise<Record<string, string>> {
    if (manifestCache) return manifestCache;

    if (!manifestLoading) {
        manifestLoading = fetch('/audio/manifest.json')
            .then(res => res.json())
            .then(data => { manifestCache = data; })
            .catch(err => {
                console.warn('Audio manifest not found, will use TTS API fallback:', err);
                manifestCache = {};
            });
    }

    await manifestLoading;
    return manifestCache || {};
}

/**
 * Get the audio file path for a given key
 */
function getAudioKey(
    type: 'step' | 'greeting' | 'welcome' | 'completion' | 'ui',
    lang: 'en' | 'mr',
    options?: {
        character?: Character;
        index?: number;
        timeSlot?: 'morning' | 'afternoon' | 'evening' | 'night';
        uiKey?: string;
    }
): string {
    const { character, index, timeSlot, uiKey } = options || {};

    switch (type) {
        case 'step':
            return `step_${index}_${lang}`;
        case 'greeting':
            return `greeting_${timeSlot}_${lang}`;
        case 'welcome':
            return `welcome_${lang}`;
        case 'completion':
            return `completion_${lang}`;
        case 'ui':
            return `${uiKey}_${lang}`;
        default:
            return '';
    }
}

/**
 * Get current time slot for greeting selection
 */
export function getTimeSlot(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

export class PrerecordedTtsService {
    private audio: HTMLAudioElement | null = null;
    private currentCharacter: Character = 'luna';
    private usePrerecorded: boolean = true;

    constructor() {
        // Pre-load manifest
        loadManifest();
    }

    setCharacter(character: Character) {
        this.currentCharacter = character;
        console.log(`TTS character set: ${character}`);
    }

    /**
     * Play a pre-recorded brushing step
     */
    async playStep(stepIndex: number, lang: 'en' | 'mr'): Promise<void> {
        const ageGroup = CHARACTER_AGE_GROUP[this.currentCharacter];
        const key = `step_${stepIndex}_${lang}`;
        const path = `/audio/${lang}/${ageGroup}/step_${stepIndex}.mp3`;
        return this.playAudioFile(path, key);
    }

    /**
     * Play a time-based greeting
     */
    async playGreeting(lang: 'en' | 'mr'): Promise<void> {
        const ageGroup = CHARACTER_AGE_GROUP[this.currentCharacter];
        const timeSlot = getTimeSlot();
        const path = `/audio/${lang}/${ageGroup}/greeting_${timeSlot}.mp3`;
        return this.playAudioFile(path, `greeting_${timeSlot}_${lang}`);
    }

    /**
     * Play welcome message
     */
    async playWelcome(lang: 'en' | 'mr'): Promise<void> {
        const ageGroup = CHARACTER_AGE_GROUP[this.currentCharacter];
        const path = `/audio/${lang}/${ageGroup}/welcome.mp3`;
        return this.playAudioFile(path, `welcome_${lang}`);
    }

    /**
     * Play completion message
     */
    async playCompletion(lang: 'en' | 'mr'): Promise<void> {
        const ageGroup = CHARACTER_AGE_GROUP[this.currentCharacter];
        const path = `/audio/${lang}/${ageGroup}/completion.mp3`;
        return this.playAudioFile(path, `completion_${lang}`);
    }

    /**
     * Play a UI audio clip
     */
    async playUI(key: string, lang: 'en' | 'mr'): Promise<void> {
        const path = `/audio/${lang}/ui/${key}.mp3`;
        return this.playAudioFile(path, `${key}_${lang}`);
    }

    /**
     * Play countdown number
     */
    async playCountdown(num: number, lang: 'en' | 'mr'): Promise<void> {
        if (num < 1 || num > 5) return;
        const path = `/audio/${lang}/ui/count_${num}.mp3`;
        return this.playAudioFile(path, `count_${num}_${lang}`);
    }

    /**
     * Speak text - tries pre-recorded first, falls back to TTS API
     */
    async speak(text: string, lang: 'en' | 'mr' = 'en'): Promise<void> {
        // For dynamic text, use the TTS API fallback
        return this.speakWithAPI(text, lang);
    }

    /**
     * Direct API fallback for dynamic text
     */
    private async speakWithAPI(text: string, lang: 'en' | 'mr'): Promise<void> {
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

            return this.playAudioFromUrl(url, true);
        } catch (e) {
            console.error("TTS API failed", e);
        }
    }

    /**
     * Play audio from a file path
     */
    private async playAudioFile(path: string, key: string): Promise<void> {
        this.cancel();

        console.log(`Playing pre-recorded: ${path}`);

        return new Promise((resolve) => {
            this.audio = new Audio(path);

            this.audio.onended = () => resolve();
            this.audio.onerror = (e) => {
                console.warn(`Pre-recorded audio not found: ${path}, falling back to silence`);
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

    /**
     * Play audio from a blob URL
     */
    private async playAudioFromUrl(url: string, revokeOnEnd: boolean = false): Promise<void> {
        return new Promise((resolve) => {
            this.audio = new Audio(url);

            this.audio.onended = () => {
                if (revokeOnEnd) URL.revokeObjectURL(url);
                resolve();
            };
            this.audio.onerror = (e) => {
                console.error("Audio playback error", e);
                if (revokeOnEnd) URL.revokeObjectURL(url);
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
        if (this.audio) {
            this.audio.pause();
        }
    }

    resume() {
        if (this.audio) {
            this.audio.play();
        }
    }

    cancel() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
        }
    }
}

// Export singleton instance
export const prerecordedTts = new PrerecordedTtsService();
