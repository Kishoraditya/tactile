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
    id: AgeGroup;
    name: string;
    name_mr: string; // Marathi name
    description: string;
    description_mr: string; // Marathi description
    themeColor: string;
    avatarId: string;
    welcomeMessage: string;
    welcomeMessage_mr: string;
    completionMessage: string;
    completionMessage_mr: string;
    voiceQuery: string;
    pitch: number;
    rate: number;
    musicTrack: 'lullaby' | 'hero' | 'calm';

    // Sidebar Info
    videoUrl: string;
    hygieneTips: string[];
    hygieneTips_mr: string[];
    productRecommendations: {
        brush: string;
        paste: string;
        brush_mr: string;
        paste_mr: string;
    };
}

export const AVATARS: Record<AgeGroup, AgeGroupData> = {
    '1-4': {
        id: '1-4',
        name: 'Luna the Tooth Fairy',
        name_mr: 'चंदा परी',
        description: 'Gentle, playful guidance for toddlers.',
        description_mr: 'गोड चिमुरड्यांसाठी सोपी आणि मजेत दात घासण्याची शिकवण.',
        themeColor: 'bg-pink-500',
        avatarId: 'luna',
        welcomeMessage: "Hi friend! I'm Luna. I love your smile! Let's make it shine together.",
        welcomeMessage_mr: "अरे माझ्या छोट्या मित्रा! मी चंदा परी. तुझं हसणं कसं मोत्यासारखं आहे! चल, आपण ते अजून चमकवूया.",
        completionMessage: "You did it! Your teeth are super sparkly now!",
        completionMessage_mr: "अरे वा! किती छान चमकतायत तुझे दात! अगदी चांदण्यांसारखे!",
        voiceQuery: 'female',
        pitch: 1.3,
        rate: 0.9,
        musicTrack: 'lullaby',
        videoUrl: "https://www.youtube.com/embed/UMFljLVbddE",
        hygieneTips: [
            "Parents, please help your child brush.",
            "Use a soft toothbrush sized for small mouths.",
            "Just a smear of toothpaste (rice grain size).",
            "Brush twice a day – morning and night!"
        ],
        hygieneTips_mr: [
            "पालक, कृपया बाळाला ब्रश करण्यास हातभार लावा.",
            "छोट्या तोंडासाठी अगदी मऊ ब्रश वापरा.",
            "पेस्ट अगदी थोडी (तांदळाच्या दाण्याएवढी) घ्या.",
            "दिवसातून दोनदा - सकाळी उठल्यावर आणि रात्री झोपण्यापूर्वी!"
        ],
        productRecommendations: {
            brush: "Extra-soft, small-head manual brush.",
            paste: "Fluoride toothpaste (rice grain amount).",
            brush_mr: "अतिशय मऊ, लहान डोक्याचा ब्रश.",
            paste_mr: "फ्लोराइड टूथपेस्ट (तांदळाच्या दाण्याएवढी)."
        }
    },
    '5-11': {
        id: '5-11',
        name: 'Captain Sparkle',
        name_mr: 'कॅप्टन चमक',
        description: 'Action-packed brushing missions for kids.',
        description_mr: 'शूर मुलांसाठी दातांच्या रक्षणाची रोमांचक मोहीम!',
        themeColor: 'bg-blue-600',
        avatarId: 'captain',
        welcomeMessage: "Cadet! Captain Sparkle here. The Sugar Bugs are attacking. Prepare for battle!",
        welcomeMessage_mr: "सावधान! मी कॅप्टन चमक. दातांवर साखरेच्या कीटकांचा हल्ला झालाय! आपल्याला हे युद्ध जिंकायचं आहे. तयार आहात?",
        completionMessage: "Victory! The Sugar Bugs have been defeated. Outstanding performance!",
        completionMessage_mr: "विजय! आपण कीटकांना हरवलं आहे. उत्कृष्ट कामगिरी, सैनिक! मिशन यशस्वी!",
        voiceQuery: 'female',
        pitch: 1.1,
        rate: 1.0,
        musicTrack: 'hero',
        videoUrl: "https://www.youtube.com/embed/KYNOrVpfmWU",
        hygieneTips: [
            "Brush for 2 minutes, 2 times a day.",
            "Floss once a day to clear tight spots.",
            "Spit out the toothpaste, but don't rinse right away."
        ],
        hygieneTips_mr: [
            "नेहमी २ मिनिटे, दिवसातून २ वेळा ब्रश करा.",
            "दातांमधील जागेसाठी दररोज एकदा फ्लॉस वापरा.",
            "पेस्ट थुंकून टाका, पण लगेच खळखळून चूळ भरू नका."
        ],
        productRecommendations: {
            brush: "Soft-bristled, fun colors or themed electric brush.",
            paste: "Pea-sized amount of fluoride toothpaste.",
            brush_mr: "मऊ, रंगीत किंवा इलेक्ट्रिक ब्रश.",
            paste_mr: "वाटाण्याएवढी फ्लोराइड टूथपेस्ट."
        }
    },
    '12-18': {
        id: '12-18',
        name: 'Dr. Bright',
        name_mr: 'डॉ. तेजस्वी',
        description: 'Detailed, effective guidance for teens.',
        description_mr: 'किशोरवयीन मुलांसाठी दात आणि मुख आरोग्याचे शास्त्रशुद्ध मार्गदर्शन.',
        themeColor: 'bg-teal-600',
        avatarId: 'dr_bright',
        welcomeMessage: "Hello. Dr. Bright here. Let's execute the optimal hygiene protocol for your dental health.",
        welcomeMessage_mr: "नमस्कार. मी डॉ. तेजस्वी. ही वेळ आहे आपल्या ओरल हायजीन रुटीनची. योग्य तंत्राने सुरुवात करूया.",
        completionMessage: "Protocol complete. Excellent maintenance of your enamel integrity. See you tonight.",
        completionMessage_mr: "विधी पूर्ण झाली. तुमच्या इनॅमलची स्थिती उत्तम आहे. नियमित राहा.",
        voiceQuery: 'female',
        pitch: 0.95,
        rate: 1.0,
        musicTrack: 'calm',
        videoUrl: "https://www.youtube.com/embed/l4N-Pqmv4E8",
        hygieneTips: [
            "Angle your brush at 45 degrees towards the gums.",
            "Don't brush too hard; it can hurt your gums.",
            "Floss daily to prevent cavities between teeth.",
            "Replace your brush every 3-4 months."
        ],
        hygieneTips_mr: [
            "ब्रश हिरड्यांकडे ४५ अंशांच्या कोनात धरा.",
            "जास्त जोर लावू नका; हिरड्यांना इजा होऊ शकते.",
            "दातांमधील अत्यंत बारीक कीड टाळण्यासाठी फ्लॉसिंग करा.",
            "दर ३-४ महिन्यांनी आपला टूथब्रश बदलणे आवश्यक आहे."
        ],
        productRecommendations: {
            brush: "Electric toothbrush with pressure sensor recommended.",
            paste: "Fluoride toothpaste. Avoid abrasive whitening pastes if sensitive.",
            brush_mr: "प्रेशर सेन्सर असलेला इलेक्ट्रिक ब्रश.",
            paste_mr: "फ्लोराइड टूथपेस्ट. (सेन्सिटिव्हिटी असल्यास व्हाइटनिंग टाळा)."
        }
    }
};


export interface BrushingStep {
    id?: string;
    message: string;
    message_mr?: string; // Marathi translation
    duration: number; // in seconds, 0 = just speak then continue
    vibrationPattern: number[];
    animationState?: 'idle' | 'wave' | 'thumbsUp' | 'openMouth' | 'tongueOut' | 'brushing' | 'rinsing' | 'spitting' | 'celebrate';
}

// Helper to get time-aware greeting
export function getTimeGreeting(avatarId: string, lang: 'en' | 'mr' = 'en'): string {
    const hour = new Date().getHours();

    if (lang === 'mr') {
        if (avatarId === 'luna') {
            if (hour >= 5 && hour < 12) return "शुभ सकाळ सूर्यकिरण! ☀️ अरे, दात स्वच्छ करण्याची वेळ झाली!";
            if (hour >= 12 && hour < 17) return "नमस्कार छोट्या मित्रा! दुपार झाली, चमकण्याची वेळ!";
            if (hour >= 17 && hour < 21) return "झोपायची वेळ जवळ आली! चल, दात चमकवू!";
            return "अरे, तू अजून जागा आहेस? चल झटपट दात घासून झोपू!";
        }
        if (avatarId === 'captain') {
            if (hour >= 5 && hour < 12) return "शुभ सकाळ, सैनिका! सकाळची मोहीम सुरू!";
            if (hour >= 12 && hour < 17) return "दुपारचा इशारा! साखर किडे सक्रिय आहेत!";
            if (hour >= 17 && hour < 21) return "संध्याकाळची गस्त! झोपण्यापूर्वी दातांची ढाल उभारा!";
            return "रात्रीची आणीबाणी! झटपट मोहीम, सैनिका!";
        }
        // dr_bright
        if (hour >= 5 && hour < 12) return "शुभ सकाळ. नाश्त्यानंतर ३० मिनिटांनी घासणे योग्य असते.";
        if (hour >= 12 && hour < 17) return "दुपारचे सत्र. असामान्य वेळ - पण सातत्य महत्त्वाचे.";
        if (hour >= 17 && hour < 21) return "संध्याकाळचा प्रोटोकॉल. झोपण्यापूर्वी घासणे सर्वोत्तम परिणाम देते.";
        return "उशीरा सत्र आढळले. उशीरा का होईना, प्रोटोकॉल पाळणे चांगले.";
    }

    // English
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

// Marathi Brushing Routines
export const BRUSHING_ROUTINES_MR: Record<AgeGroup, BrushingStep[]> = {
    '1-4': [
        { message: "तयार हो! तुझा ब्रश शोधू शकतोस का?", message_mr: "तयार का? तुझा ब्रश सापडला का तुला?", duration: 0, vibrationPattern: [100], animationState: 'wave' },
        { message: "थोडं पाणी घे. गुर्र गुर्र गुर्र करून तोंडात फिरव! थुंक!", message_mr: "थोडं पाणी घे. गुर्र गुर्र करून चूळ भर! आणि थुंक!", duration: 8, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "अगदी छोट्या तांदळाच्या दाण्यासारखी पेस्ट लाव!", message_mr: "अगदी इवलीशी पेस्ट लाव! जसा तांदळाचा दाणा.", duration: 0, vibrationPattern: [100], animationState: 'idle' },
        { message: "सिंहासारखी गर्जना करू शकतोस का? आ... करून तोंड मोठं उघड!", message_mr: "मोठ्या सिंहासारखं 'आss' कर! बघू तुझं मोठं तोंड!", duration: 8, vibrationPattern: [200], animationState: 'openMouth' },
        { message: "खालच्या दातांना गुदगुल्या कर! मजेशीर गोष्ट: दात आपल्याला खायला मदत करतात!", message_mr: "खालच्या दातांना गुदगुल्या कर! माहितीये? हेच दात आपल्याला खाऊ खायला मदत करतात!", duration: 15, vibrationPattern: [500, 500], animationState: 'brushing' },
        { message: "आता वरचे! गुदगुल्या गुदगुल्या! तू खूप छान करतोय!", message_mr: "आता वरच्या दातांची पाळी! 'गुदगुल्या-गुदगुल्या!' अरे वा, छान जमलंय तुला!", duration: 15, vibrationPattern: [500, 500], animationState: 'brushing' },
        { message: "मोठं हसून दाखव! गोल गोल फिरव!", message_mr: "इईई... करून हस! आणि गोल गोल ब्रश फिरव!", duration: 15, vibrationPattern: [500, 500], animationState: 'brushing' },
        { message: "जीभ बाहेर काढ! हळुवारपणे घास. मजेशीर चेहरा कर!", message_mr: "जीभ बाहेर! अलगद घास बरं. ए, किती गोड दिसतोस!", duration: 8, vibrationPattern: [200], animationState: 'tongueOut' },
        { message: "फेसाचे बुडबुडे बाहेर! सगळं थुंक!", message_mr: "आता सगळे बुडबुडे बाहेर! थुंकून टाक बघू!", duration: 5, vibrationPattern: [200], animationState: 'spitting' },
        { message: "आणखी एक घोट. गुर्र करून थुंक! जवळजवळ झालं!", message_mr: "एक शेवटची चूळ. स्वच्छ पाणी फिरव आणि थुंक!", duration: 5, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "हुर्रे! तुझे दात चमकताहेत! पुन्हा भेटू, सुपरस्टार! 👍", message_mr: "हुर्रे! तुझे दात चमकताहेत! तू आहेस आमचा सुपरस्टार! बाय बाय! 👍", duration: 0, vibrationPattern: [100, 50, 100], animationState: 'celebrate' }
    ],
    '5-11': [
        { message: "तुझं ब्रश शस्त्र घे आणि तयार हो!", message_mr: "सैनिक! आपलं ब्रश-शस्त्र सज्ज करा!", duration: 0, vibrationPattern: [100], animationState: 'wave' },
        { message: "मोहीम-पूर्व स्वच्छता! युद्धभूमी तयार कर!", message_mr: "मोहिमेची सुरुवात! आधी पाण्याने तोंड साफ करा!", duration: 8, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "फ्लोराइड गोळ्या भर! फक्त वाटाण्याएवढी!", message_mr: "दारूगोळा भरा (टूथपेस्ट)! फक्त एका वाटाण्याएवढीच.", duration: 0, vibrationPattern: [100], animationState: 'idle' },
        { message: "खालच्या डाव्या दाढेवर हल्ला! माहीत आहे का? दाढा सर्वात मजबूत दात आहेत!", message_mr: "खालच्या डाव्या बाजूवर हल्ला बोल! शत्रू लपलाय तिथे!", duration: 20, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "उजव्या बाजूला सफाई! कोणताही किडा सुटू देऊ नकोस! शाब्बास!", message_mr: "आता उजवी बाजू! कोपरा न कोपरा साफ करा. उत्तम चाललंय!", duration: 20, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "वरच्या डाव्या भागावर! ब्रश ४५ अंशात ठेव! 💪", message_mr: "वरच्या डाव्या आघाडीवर लक्ष केंद्रित करा! ४५ अंशाचा कोन! 💪", duration: 20, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "वरचे उजवे! जवळजवळ झालं! दिवसातून दोनदा घासल्याने ८०% कीड टळते!", message_mr: "वरची उजवी आघाडी! जवळजवळ जिंकलोच आपण! दिवसातून दोनदा हल्ला गरजेचा आहे.", duration: 20, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "पुढच्या दातांचे संरक्षण! गोलाकार रक्षण कर!", message_mr: "पुढच्या दातांची ढाल! गोलाकार फिरवून संरक्षण मजबूत करा!", duration: 15, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "जीभ ड्रॅगन बॅक्टेरिया लपवतो! हळुवारपणे घास!", message_mr: "ड्रॅगन (जीभ) साफ करा! तिथेच शत्रू लपतात. हळुवार!", duration: 10, vibrationPattern: [500], animationState: 'tongueOut' },
        { message: "थुंक! फेसाचे रॉकेट सोड!", message_mr: "थुंकून टाका! फेसाचे रॉकेट्स लाँच करा!", duration: 5, vibrationPattern: [200], animationState: 'spitting' },
        { message: "शेवटची स्वच्छता! हरलेले किडे धुवून टाक!", message_mr: "विजयी चूळ! हरलेले किडे वाहून जाऊ देत!", duration: 5, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "मोहीम पूर्ण! तू आता दंत रक्षक आहेस! आज रात्री भेटू! 👍", message_mr: "मिशन यशस्वी! तुम्ही खरे दंत-रक्षक आहात! भेटूया पुढच्या मोहिमेवर! 👍", duration: 0, vibrationPattern: [200, 100, 200], animationState: 'celebrate' }
    ],
    '12-18': [
        { message: "पाण्याने स्वच्छता करा. तोंडातील अन्नकण निघून जातील.", message_mr: "सुरुवात पाण्याने चूळ भरून करा; अन्नकण मोकळे होतील.", duration: 8, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "वाटाण्याएवढी फ्लोराइड पेस्ट लावा. टीप: ब्रश ओला करू नका.", message_mr: "वाटाण्याएवढी फ्लोराइड पेस्ट घ्या. टीप: ब्रश आधी ओला करू नका, ते जास्त प्रभावी ठरतं.", duration: 0, vibrationPattern: [100], animationState: 'idle' },
        { message: "खालच्या कमानीची बाहेरची बाजू. हिरड्यांकडे ४५ अंशाचा कोन. लहान स्ट्रोक्स.", message_mr: "खालचा जबडा, बाहेरची बाजू. ४५ अंशाचा कोन आणि हलके स्ट्रोक्स ठेवा.", duration: 25, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "वरच्या कमानीची बाहेरची बाजू. हलका दाब ठेवा. उत्तम तंत्र.", message_mr: "आता वरचा जबडा. दाब हलका ठेवा. तुमचं टेक्निक चांगलं आहे.", duration: 25, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "आतील पृष्ठभाग. पुढच्या दातांसाठी ब्रश उभा करा. गोष्ट: ९०% कीड आतील बाजूला होते.", message_mr: "आतील बाजू. समोरच्या दातांसाठी ब्रश उभा पकडा. ९०% समस्या इथेच सुरू होतात, म्हणून लक्ष द्या.", duration: 25, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "चावण्याचे पृष्ठभाग. आडवी घासणे. चांगले चालू आहे.", message_mr: "चावण्याची जागा. आडवे स्ट्रोक्स. प्लेक काढून टाका. उत्तम.", duration: 20, vibrationPattern: [1000], animationState: 'brushing' },
        { message: "जीभेवरील बॅक्टेरियामुळे दुर्गंधी येतो. मागून पुढे हळुवारपणे घासा.", message_mr: "जीभ स्वच्छ करा. दुर्गंधी निर्माण करणारे बॅक्टेरिया तिथे असतात. मागून पुढे.", duration: 10, vibrationPattern: [500], animationState: 'tongueOut' },
        { message: "थुंका. लगेच स्वच्छ धुवू नका - फ्लोराइड ३० मिनिटे काम करतो.", message_mr: "थुंकून टाका. टीप: लगेच चूळ भरू नका, फ्लोराइडला काम करू द्या.", duration: 5, vibrationPattern: [200], animationState: 'spitting' },
        { message: "हलकेच पाण्याने स्वच्छ करा. तुमच्या दातांचे मुलामा तुमचे आभार मानतो.", message_mr: "आवश्यक असल्यास हलकी चूळ भरा. तुमचं इनॅमल सुरक्षित आहे.", duration: 5, vibrationPattern: [200], animationState: 'rinsing' },
        { message: "प्रोटोकॉल पूर्ण. उत्तम दात देखभाल. आज रात्री भेटू. 👍", message_mr: "प्रोटोकॉल पूर्ण. उत्तम देखभाल. सातत्य ठेवा. भेटूया. 👍", duration: 0, vibrationPattern: [100, 50, 100], animationState: 'thumbsUp' }
    ]
};

// Helper to get routines based on language
export function getRoutines(ageGroup: AgeGroup, lang: 'en' | 'mr' = 'en'): BrushingStep[] {
    return lang === 'mr' ? BRUSHING_ROUTINES_MR[ageGroup] : BRUSHING_ROUTINES[ageGroup];
}
