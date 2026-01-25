'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Settings, Mic, Globe, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, Language } from '@/lib/i18n';
import { tts } from '@/lib/tts-service';

export default function Home() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Interaction logic to satisfy Autoplay policies
  useEffect(() => {
    if (hasInteracted) {
      // Show language selection after interaction
      const timer = setTimeout(() => {
        setShowLanguageSelect(true);
        speakLanguagePrompt().catch(console.error);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted]);

  const speakLanguagePrompt = async () => {
    try {
      // Sequential speaking for better accents
      await tts.playUI("language_prompt", "en");
      await tts.playUI("language_prompt", "mr");
    } catch (e) {
      console.error("TTS Prompt Failed", e);
    }
  };

  const [voiceError, setVoiceError] = useState<string | null>(null);

  const handleLanguageSelect = (selectedLang: Language) => {
    setLang(selectedLang);
    setHasSelectedLanguage(true);
    setShowLanguageSelect(false);

    // Speak welcome in selected language
    tts.playUI("welcome", selectedLang);
  };

  const playWelcomeAudio = () => {
    if (hasInteracted || showLanguageSelect) return;
    tts.playUI("welcome", lang);
  };

  const handleStart = () => {
    setHasInteracted(true);
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }

    // Cancel any playing audio before navigating
    tts.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();

    router.push('/dashboard');
  };

  // Speech Recognition
  useEffect(() => {
    if (!hasSelectedLanguage) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => {
        if (e.error !== 'aborted' && e.error !== 'no-speech') {
          console.error("Recognition error", e);
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            setVoiceError("Microphone blocked. Please allow access.");
          }
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Heard:", transcript);

        // English commands
        if (transcript.includes('start') || transcript.includes('begin') || transcript.includes('go')) {
          handleStart();
        }
        // Marathi commands
        if (transcript.includes('सुरू') || transcript.includes('चालू') || transcript.includes('स्टार्ट')) {
          handleStart();
        }
      };

      try {
        recognition.start();
      } catch (e) { /* ignore */ }

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [hasSelectedLanguage, lang]);

  // Language selection for voice recognition
  useEffect(() => {
    if (!showLanguageSelect) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // Use English for initial recognition

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Language selection heard:", transcript);

        if (transcript.includes('english') || transcript.includes('इंग्लिश')) {
          handleLanguageSelect('en');
          recognition.stop();
        } else if (transcript.includes('marathi') || transcript.includes('मराठी')) {
          handleLanguageSelect('mr');
          recognition.stop();
        }
      };

      try {
        recognition.start();
      } catch (e) { /* ignore */ }

      return () => recognition.stop();
    }
  }, [showLanguageSelect]);

  const handleParentAccess = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/dashboard');
  };

  // 1. Initial Welcome Splash (to enable audio context)
  if (!hasInteracted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <Volume2 className="w-24 h-24 mx-auto text-blue-600 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">ToothBuddy</h1>
            <p className="text-xl text-gray-600 font-medium">Ready for your magic smile?</p>
          </div>
          <Button
            size="lg"
            className="w-full h-20 text-2xl font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg transition-all hover:scale-105"
            onClick={() => setHasInteracted(true)}
          >
            Start / सुरू करा
          </Button>
        </div>
      </main>
    );
  }

  // 2. Language Selection Modal
  if (showLanguageSelect && !hasSelectedLanguage) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-yellow-300 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full text-center space-y-8">
          <Globe className="w-16 h-16 mx-auto text-purple-600" />
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-800">Select Language</h1>
              <button
                onClick={() => speakLanguagePrompt().catch(console.error)}
                className="p-2 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 transition-colors"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-lg text-gray-600">भाषा निवडा</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleLanguageSelect('en')}
              className="w-full p-6 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-2xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => handleLanguageSelect('mr')}
              className="w-full p-6 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-2xl font-bold transition-all hover:scale-105 flex items-center justify-center gap-3"
            >
              🇮🇳 मराठी
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Say "English" or "मराठी" to select
          </p>

          {isListening && (
            <div className="flex items-center justify-center gap-2 text-green-600 animate-pulse">
              <Mic className="w-5 h-5" />
              <span>Listening... ऐकत आहे...</span>
            </div>
          )}

          {voiceError && !isListening && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {voiceError}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yellow-300 flex flex-col items-center justify-center p-4 relative" onClick={() => !hasInteracted && playWelcomeAudio()}>
      {/* Giant Touch Area for Child */}
      <button
        onClick={handleStart}
        className="w-full h-[80vh] bg-blue-600 rounded-3xl flex flex-col items-center justify-center space-y-8 shadow-xl active:scale-95 transition-transform"
        aria-label={t('tapToStart')}
      >
        <div className="relative">
          <Play className="w-32 h-32 text-white" />
          {isListening && <Mic className="w-12 h-12 text-red-400 absolute -top-4 -right-4 animate-pulse" />}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-white tracking-wider">{t('tapToStart')}</span>
          <span className="text-xl text-white/80 mt-2">{t('orSayStart')}</span>
        </div>
      </button>

      {/* Parent/Settings */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-black w-12 h-12 z-50"
        onClick={handleParentAccess}
        aria-label="Parent Settings"
      >
        <Settings className="w-8 h-8" />
      </Button>

      {/* Language indicator */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 text-black z-50"
        onClick={() => {
          setHasSelectedLanguage(false);
          setShowLanguageSelect(true);
          speakLanguagePrompt();
        }}
      >
        <Globe className="w-5 h-5 mr-1" />
        {lang === 'mr' ? 'मराठी' : 'EN'}
      </Button>

      <div className="absolute bottom-6 text-black font-semibold text-lg" aria-hidden="true">
        {t('appName')}
      </div>
    </main>
  );
}
