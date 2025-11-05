import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, availableLanguages } from '../context/i18n';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguageName = availableLanguages.find(l => l.code === language)?.name || 'English';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (langCode: string) => {
        setLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-full border border-border-light dark:border-border-dark shadow-sm px-4 py-2 bg-card-light dark:bg-card-dark text-sm font-medium text-text-light dark:text-text-dark hover:bg-subtle-light dark:hover:bg-subtle-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary"
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {currentLanguageName}
                    <span className="material-symbols-outlined -mr-1 ml-2 h-5 w-5">expand_more</span>
                </button>
            </div>

            {isOpen && (
                <div className="origin-bottom-right sm:origin-top-right absolute right-0 bottom-full sm:bottom-auto mb-2 sm:mt-2 w-40 rounded-md shadow-lg bg-card-light dark:bg-card-dark ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {availableLanguages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`${
                                    language === lang.code ? 'font-bold text-primary' : 'text-text-light dark:text-text-dark'
                                } block w-full text-left px-4 py-2 text-sm hover:bg-subtle-light dark:hover:bg-subtle-dark`}
                                role="menuitem"
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
