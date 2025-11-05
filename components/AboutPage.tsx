
import React from 'react';
import type { AppView, Theme } from '../App';
import { useTranslation } from '../context/i18n';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoIcon } from './icons';
import { AppFooter } from './AppFooter';

interface PageProps {
    theme: Theme;
    toggleTheme: () => void;
    setView: (view: AppView) => void;
}

const PageHeader: React.FC<PageProps & { title: string }> = ({ theme, toggleTheme, setView, title }) => {
    return (
        <header className="w-full">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark py-4">
                    <button onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer">
                        <LogoIcon />
                        <h1 className="text-xl font-bold leading-tight">{title}</h1>
                    </button>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                    </div>
                </div>
            </div>
        </header>
    );
};


export const AboutPage: React.FC<PageProps> = (props) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader {...props} title={t('about')} />
            <main className="flex-grow">
                <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="prose dark:prose-invert prose-lg prose-h1:font-bold prose-h1:text-3xl prose-p:leading-relaxed">
                        <h1>{t('aboutTitle')}</h1>
                        <p>{t('aboutText1')}</p>
                        <p>{t('aboutText2')}</p>
                        <p>{t('aboutText3')}</p>
                        <h2>{t('aboutOurMission')}</h2>
                        <p>{t('aboutMissionText')}</p>
                    </div>
                </div>
            </main>
            <AppFooter {...props} />
        </div>
    );
};
