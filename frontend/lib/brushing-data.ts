export type AgeGroup = '1-4' | '5-11' | '12-18';

export interface AvatarProfile {
    id: string;
    name: string;
    ageGroup: AgeGroup;
    voiceQuery: string;
    pitch: number;
    rate: number;
    welcomeMessage: string;
    completionMessage: string;
    themeColor: string;
}

export interface AgeGroupData {
    id: AgeGroup; // This IS the age group identifier '1-4', etc.
    name: string;
    description: string;
    themeColor: string;
    avatarId: string;
    welcomeMessage: string;
    completionMessage: string;
    voiceQuery: string; // TTS voice name query
    pitch: number;      // 0.5 to 2
    rate: number;       // 0.5 to 2
    musicTrack: 'lullaby' | 'hero' | 'calm';

    // Sidebar Info
    videoUrl: string; // Placeholder for now
    hygieneTips: string[];
    productRecommendations: {
        brush: string;
        paste: string;
    };
}

export const AVATARS: Record<AgeGroup, AgeGroupData> = {
    '1-4': {
        id: '1-4',
        name: 'Luna the Tooth Fairy',
        description: 'Gentle, playful guidance for toddlers.',
        themeColor: 'bg-pink-500',
        avatarId: 'luna',
        welcomeMessage: "Hi friend! I'm Luna. I love your smile! Let's make it shine together.",
        completionMessage: "You did it! Your teeth are super sparkly now!",
        voiceQuery: 'female',
        pitch: 1.3,
        rate: 0.9,
        musicTrack: 'lullaby',
        videoUrl: "https://www.youtube.com/embed/UMFljLVbddE", // Sesame Street: Healthy Teeth
        hygieneTips: [
            "Parents, please help your child brush.",
            "Use a soft toothbrush sized for small mouths.",
            "Just a smear of toothpaste (rice grain size).",
            "Brush twice a day – morning and night!"
        ],
        productRecommendations: {
            brush: "Extra-soft, small-head manual brush.",
            paste: "Fluoride toothpaste (rice grain amount)."
        }
    },
    '5-11': {
        id: '5-11',
        name: 'Captain Sparkle',
        description: 'Action-packed brushing missions for kids.',
        themeColor: 'bg-blue-600',
        avatarId: 'captain',
        welcomeMessage: "Cadet! Captain Sparkle here. The Sugar Bugs are attacking. Prepare for battle!",
        completionMessage: "Victory! The Sugar Bugs have been defeated. Outstanding performance!",
        voiceQuery: 'female',
        pitch: 1.1,
        rate: 1.0,
        musicTrack: 'hero',
        videoUrl: "https://www.youtube.com/embed/KYNOrVpfmWU", // How to Brush (for kids)
        hygieneTips: [
            "Brush for 2 minutes, 2 times a day.",
            "Floss once a day to clear tight spots.",
            "Spit out the toothpaste, but don't rinse right away (keeps fluoride working!)."
        ],
        productRecommendations: {
            brush: "Soft-bristled, fun colors or themed electric brush.",
            paste: "Pea-sized amount of fluoride toothpaste."
        }
    },
    '12-18': {
        id: '12-18',
        name: 'Dr. Bright',
        description: 'Detailed, effective guidance for teens.',
        themeColor: 'bg-teal-600',
        avatarId: 'dr_bright',
        welcomeMessage: "Hello. Dr. Bright here. Let's execute the optimal hygiene protocol for your dental health.",
        completionMessage: "Protocol complete. Excellent maintenance of your enamel integrity. See you tonight.",
        voiceQuery: 'female',
        pitch: 0.95,
        rate: 1.0,
        musicTrack: 'calm',
        videoUrl: "https://www.youtube.com/embed/l4N-Pqmv4E8", // Proper Brushing Technique
        hygieneTips: [
            "Angle your brush at 45 degrees towards the gums.",
            "Don't brush too hard; it can hurt your gums.",
            "Floss daily to prevent cavities between teeth.",
            "Replace your brush every 3-4 months."
        ],
        productRecommendations: {
            brush: "Electric toothbrush with pressure sensor recommended.",
            paste: "Fluoride toothpaste. Avoid abrasive whitening pastes if sensitive."
        }
    }
};


export interface BrushingStep {
    id?: string;
    message: string;
    duration: number; // in seconds, 0 = just speak then continue
    vibrationPattern: number[];
    animationState?: 'idle' | 'wave' | 'thumbsUp' | 'openMouth' | 'tongueOut' | 'brushing' | 'rinsing' | 'spitting' | 'celebrate';
}

// Helper to get time-aware greeting
export function getTimeGreeting(avatarId: string): string {
    const hour = new Date().getHours();

    if (avatarId === 'luna') {
        if (hour >= 5 && hour < 12) return "Good morning, sunshine! ☀️ It's tooth time!";
        if (hour >= 12 && hour < 17) return "Hello little one! Afternoon sparkle time!";
        if (hour >= 17 && hour < 21) return "Sleepy time is near! Let's make your teeth sparkle for bed!";
        return "Wow, you're up late! Quick brush before dreamland!";
    }

    if (avatarId === 'captain') {
        if (hour >= 5 && hour < 12) return "Good morning, Cadet! Morning mission is GO!";
        if (hour >= 12 && hour < 17) return "Afternoon alert, soldier! Sugar bugs are active!";
        if (hour >= 17 && hour < 21) return "Evening patrol time! Defend your teeth before sleep!";
        return "Late night emergency! Quick mission, cadet!";
    }

    // dr_bright
    if (hour >= 5 && hour < 12) return "Good morning. Optimal brushing time is 30 minutes after breakfast.";
    if (hour >= 12 && hour < 17) return "Afternoon session. Unusual timing—but consistency matters.";
    if (hour >= 17 && hour < 21) return "Evening hygiene protocol. Brush before bed for best results.";
    return "Late session detected. Better late than never for oral health.";
}

export const BRUSHING_ROUTINES: Record<AgeGroup, BrushingStep[]> = {
    '1-4': [
        // Greeting (handled separately with time awareness)
        { message: "Let's get ready! Can you find your toothbrush?", duration: 0, vibrationPattern: [100], animationState: 'wave' },
        { message: "Rinse your mouth with water. Swish swish like a fishy!", duration: 8, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "Put a teeny tiny bit of paste on. Like a grain of rice!", duration: 0, vibrationPattern: [100], animationState: 'idle' },
        { message: "Can you ROAR like a lion? ROAAAR! Open wide!", duration: 8, vibrationPattern: [200], animationState: 'openMouth' },
        { message: "Wiggle wiggle on the bottom teeth! Fun fact: Your teeth help you eat yummy food!", duration: 15, vibrationPattern: [500, 500], animationState: 'brushing' },
        { message: "Now the top! Tickle tickle! You're doing AMAZING!", duration: 15, vibrationPattern: [500, 500], animationState: 'brushing' },
        { message: "Big cheese smile! Round and round on the front!", duration: 15, vibrationPattern: [500, 500], animationState: 'brushing' },
        { message: "Stick out your tongue! Make a silly face! Brush it gently.", duration: 8, vibrationPattern: [200], animationState: 'tongueOut' },
        { message: "Time for bubbles! Spit them alllll out!", duration: 5, vibrationPattern: [200], animationState: 'spitting' },
        { message: "One more sip. Swish and spit!", duration: 5, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "HOORAY! Your teeth are SPARKLING! You're a superstar! 👍", duration: 0, vibrationPattern: [100, 50, 100], animationState: 'celebrate' }
    ],
    '5-11': [
        { message: "Grab your brush weapon and get ready!", duration: 0, vibrationPattern: [100], animationState: 'wave' },
        { message: "Pre-mission rinse! Clear the battlefield!", duration: 8, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "Load the fluoride ammo! Pea-sized blast only!", duration: 0, vibrationPattern: [100], animationState: 'idle' },
        { message: "ATTACK the lower left molars! Did you know? Molars are your strongest teeth!", duration: 20, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "Sweep to lower right! Don't let any bug escape! Great work, soldier!", duration: 20, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "Upper left sector! Angle your weapon 45 degrees! 💪", duration: 20, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "Upper right! Fact: Brushing twice daily fights 80% of cavities!", duration: 20, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "Front teeth shield! Circular defense formation!", duration: 15, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "The Tongue Dragon hides bacteria! Defeat it gently!", duration: 10, vibrationPattern: [500], animationState: 'tongueOut' },
        { message: "SPIT! Launch the foam missiles!", duration: 5, vibrationPattern: [200], animationState: 'spitting' },
        { message: "Final rinse! Wash away the defeated bugs!", duration: 5, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "MISSION ACCOMPLISHED! You're a Dental Defender! See you tonight! 👍", duration: 0, vibrationPattern: [200, 100, 200], animationState: 'celebrate' }
    ],
    '12-18': [
        { message: "Begin with a water rinse to clear debris.", duration: 8, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "Apply a pea-sized amount of fluoride paste. Pro tip: Don't wet the brush first.", duration: 0, vibrationPattern: [100], animationState: 'idle' },
        { message: "Lower arch, outer surfaces. 45-degree angle to gums. Short, gentle strokes.", duration: 25, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "Upper arch, outer surfaces. Maintain gentle pressure. You're doing well.", duration: 25, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "Inner surfaces. Tilt brush vertically for front teeth. Fact: 90% of cavities start here.", duration: 25, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "Chewing surfaces. Horizontal scrubbing. Consistent brushing prevents cavities and gum disease.", duration: 20, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "Tongue bacteria cause bad breath. Brush from back to front.", duration: 10, vibrationPattern: [500], animationState: 'tongueOut' },
        { message: "Expectorate. Tip: Don't rinse immediately—fluoride continues working for 30 minutes.", duration: 5, vibrationPattern: [200], animationState: 'spitting' },
        { message: "Light rinse to clear excess.", duration: 5, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "Protocol complete. Excellent enamel maintenance. See you tonight. 👍", duration: 0, vibrationPattern: [100, 50, 100], animationState: 'thumbsUp' }
    ]
};
