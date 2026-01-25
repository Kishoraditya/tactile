'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from './en';
import { mr } from './mr';

export type Language = 'en' | 'mr';

type Translations = typeof en;

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: keyof Translations) => string;
    isMarathi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = { en, mr };

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>('en');
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Load saved language from localStorage
        const saved = localStorage.getItem('toothbuddy_lang') as Language | null;
        if (saved && (saved === 'en' || saved === 'mr')) {
            setLangState(saved);
        }
        setIsHydrated(true);
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('toothbuddy_lang', newLang);
    };

    const t = (key: keyof Translations): string => {
        return translations[lang][key] || translations['en'][key] || key;
    };

    // Prevent hydration mismatch by showing nothing until client-side
    if (!isHydrated) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, isMarathi: lang === 'mr' }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

// Helper to get localized content from objects with _mr suffix
export function getLocalized<T extends Record<string, any>>(
    obj: T,
    key: string,
    lang: Language
): string {
    if (lang === 'mr' && obj[`${key}_mr`]) {
        return obj[`${key}_mr`];
    }
    return obj[key] || '';
}
