// For Three.js / React Three Fiber integration
import * as THREE from 'three';

interface AnimationScene {
    id: string;
    dialogue: string;
    duration: number;
    animation: {
        name: string;
        tracks: AnimationTrack[];
    };
    actions: ActionData;
}

interface ActionData {
    primary_action: string;
    sub_actions: string[];
    body_parts: string[];
    emotion: string;
    special_effects: string[];
}

interface AnimationTrack {
    name: string;
    type: string;
    times: number[];
    values: number[];
}

class AvatarAnimationController {
    private mixer: THREE.AnimationMixer;
    private currentClip: THREE.AnimationAction | null = null;
    private timeline: AnimationScene[] = [];
    private currentIndex: number = 0;

    constructor(avatar: THREE.Object3D) {
        this.mixer = new THREE.AnimationMixer(avatar);
    }

    loadTimeline(scenes: AnimationScene[]) {
        this.timeline = scenes;
        this.currentIndex = 0;
    }

    playScene(index: number) {
        if (index >= this.timeline.length) return;

        const scene = this.timeline[index];
        this.currentIndex = index;

        // Convert JSON to THREE.AnimationClip
        const clip = this.jsonToClip(scene.animation);

        // Crossfade from current
        if (this.currentClip) {
            this.currentClip.fadeOut(0.3);
        }

        this.currentClip = this.mixer.clipAction(clip);
        this.currentClip.reset().fadeIn(0.3).play();

        // Trigger effects
        scene.actions.special_effects?.forEach(effect => {
            this.triggerEffect(effect);
        });

        // Auto-advance after duration
        setTimeout(() => {
            this.playScene(index + 1);
        }, scene.duration * 1000);
    }

    private jsonToClip(animData: any): THREE.AnimationClip {
        const tracks: THREE.KeyframeTrack[] = [];

        for (const track of animData.tracks) {
            const trackType = track.type === 'number'
                ? THREE.NumberKeyframeTrack
                : THREE.VectorKeyframeTrack;

            tracks.push(new trackType(
                track.name,
                track.times,
                track.values
            ));
        }

        return new THREE.AnimationClip(animData.name, animData.duration, tracks);
    }

    private triggerEffect(effectName: string) {
        // Emit events for particle systems, sounds, etc.
        window.dispatchEvent(new CustomEvent('avatar-effect', {
            detail: { effect: effectName }
        }));
    }

    update(deltaTime: number) {
        this.mixer.update(deltaTime);
    }
}

export { AvatarAnimationController };
