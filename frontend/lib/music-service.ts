import * as Tone from 'tone';

class MusicService {
    private synth: Tone.PolySynth | null = null;
    private loop: Tone.Loop | null = null;
    private isPlaying = false;

    async start(type: 'lullaby' | 'hero' | 'calm') {
        await Tone.start();

        if (this.synth) this.stop();

        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: { attack: 0.8, decay: 0.1, sustain: 0.5, release: 2 }
        }).toDestination();
        this.synth.volume.value = -15; // Soft background

        // Simple chord progressions for each style
        let chords: string[][];
        if (type === 'lullaby') {
            chords = [['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5']];
        } else if (type === 'calm') {
            // Calm/Lo-fi style: softer, more ambient
            chords = [['D3', 'F#3', 'A3'], ['G3', 'B3', 'D4'], ['E3', 'G#3', 'B3'], ['A3', 'C#4', 'E4']];
        } else {
            // Hero style: more energetic
            chords = [['C3', 'G3', 'C4'], ['F3', 'C4', 'F4'], ['G3', 'D4', 'G4']];
        }

        let index = 0;
        this.loop = new Tone.Loop((time) => {
            this.synth?.triggerAttackRelease(chords[index], "2n", time);
            index = (index + 1) % chords.length;
        }, "1n").start(0);

        Tone.Transport.start();
        this.isPlaying = true;
    }


    stop() {
        if (!this.isPlaying) return;
        this.loop?.stop();
        this.loop?.dispose();
        this.synth?.dispose();
        Tone.Transport.stop();
        this.isPlaying = false;
    }

    pause() {
        if (this.isPlaying) Tone.Transport.pause();
    }

    resume() {
        if (this.isPlaying) Tone.Transport.start();
    }
}

export const music = new MusicService();
