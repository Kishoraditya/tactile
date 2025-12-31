'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Settings, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const playWelcomeAudio = () => {
    if (hasInteracted) return;
    const speech = new SpeechSynthesisUtterance("Hello! Welcome to Tooth Buddy. Tap the screen or say start.");
    speech.rate = 0.9;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
  };

  const handleStart = () => {
    setHasInteracted(true);
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }

    const speech = new SpeechSynthesisUtterance("Starting. Which group are you in?");
    window.speechSynthesis.speak(speech);

    // Stop listening before navigating
    if (recognitionRef.current) recognitionRef.current.stop();

    router.push('/dashboard');
  };

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => console.error("Recognition error", e);

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Heard:", transcript);
        if (transcript.includes('start') || transcript.includes('begin') || transcript.includes('go')) {
          handleStart();
        }
      };

      // Auto-start listening (might be blocked by browser policy without interaction, but helpful for reload)
      try {
        recognition.start();
      } catch (e) { /* ignore already started */ }

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  }, []);

  const handleParentAccess = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-yellow-300 flex flex-col items-center justify-center p-4 relative" onClick={() => !hasInteracted && playWelcomeAudio()}>
      {/* Giant Touch Area for Child */}
      <button
        onClick={handleStart}
        className="w-full h-[80vh] bg-blue-600 rounded-3xl flex flex-col items-center justify-center space-y-8 shadow-xl active:scale-95 transition-transform"
        aria-label="Tap to start"
      >
        <div className="relative">
          <Play className="w-32 h-32 text-white" />
          {isListening && <Mic className="w-12 h-12 text-red-400 absolute -top-4 -right-4 animate-pulse" />}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold text-white tracking-wider">TAP TO START</span>
          <span className="text-xl text-white/80 mt-2">or say "Start"</span>
        </div>
      </button>

      {/* Parent/Settings - Out of the way */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-black w-12 h-12 z-50 pointer-events-auto"
        onClick={handleParentAccess}
        aria-label="Parent Settings"
      >
        <Settings className="w-8 h-8" />
      </Button>

      <div className="absolute bottom-6 text-black font-semibold text-lg" aria-hidden="true">
        ToothBuddy
      </div>
    </main>
  );
}
