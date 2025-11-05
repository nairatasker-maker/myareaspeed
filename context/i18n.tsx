import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

export const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'yo', name: 'Yorùbá' },
    { code: 'ha', name: 'Hausa' },
    { code: 'ig', name: 'Igbo' },
];

interface I18nContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [translations, setTranslations] = useState<{ [key: string]: any } | null>(null);
    const [language, setLanguageState] = useState(() => {
        try {
            const savedLang = localStorage.getItem('language');
            const langCodes = availableLanguages.map(l => l.code);
            if (savedLang && langCodes.includes(savedLang)) {
                return savedLang;
            }
            const browserLang = navigator.language.split('-')[0];
            return langCodes.includes(browserLang) ? browserLang : 'en';
        } catch (error) {
            return 'en';
        }
    });

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const responses = await Promise.all(
                    availableLanguages.map(lang => fetch(`./locales/${lang.code}.json`))
                );
                const jsonData = await Promise.all(responses.map(res => {
                    if (!res.ok) throw new Error(`Failed to load ${res.url}`);
                    return res.json();
                }));
                const translationsData = availableLanguages.reduce((acc, lang, index) => {
                    acc[lang.code] = jsonData[index];
                    return acc;
                }, {} as { [key: string]: any });
                setTranslations(translationsData);
            } catch (error) {
                console.error("Failed to load translations", error);
                // Fallback to English if loading fails
                try {
                    const enRes = await fetch('./locales/en.json');
                    const enData = await enRes.json();
                    setTranslations({ en: enData });
                } catch (e) {
                    console.error("Failed to load fallback English translation", e);
                }
            }
        };
        fetchTranslations();
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('language', language);
        } catch (error) {
            console.error("Failed to save language to localStorage", error);
        }
    }, [language]);

    const setLanguage = (lang: string) => {
        if (availableLanguages.some(l => l.code === lang)) {
            setLanguageState(lang);
        }
    };
    
    const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
        if (!translations) {
            return ''; // Return empty string while translations are loading
        }
        let translation = translations[language]?.[key] || translations['en']?.[key] || key;
        
        if (replacements && typeof translation === 'string') {
            Object.keys(replacements).forEach(placeholder => {
                const regex = new RegExp(`{${placeholder}}`, 'g');
                translation = translation.replace(regex, String(replacements[placeholder]));
            });
        }
        
        return translation;
    }, [language, translations]);

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
};