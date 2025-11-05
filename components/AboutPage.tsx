
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
    const features = [
        { icon: 'groups', title: t('aboutFeature1Title'), text: t('aboutFeature1Text') },
        { icon: 'my_location', title: t('aboutFeature2Title'), text: t('aboutFeature2Text') },
        { icon: 'verified_user', title: t('aboutFeature3Title'), text: t('aboutFeature3Text') },
    ];
    
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader {...props} title={t('about')} />
            <main className="flex-grow">
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="font-bold text-primary">{t('aboutTagline')}</p>
                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t('aboutTitle')}</h1>
                        <p className="mt-6 mx-auto max-w-2xl text-lg text-text-light/70 dark:text-text-dark/70">{t('aboutText1')}</p>
                    </div>

                    <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
                        <div className="space-y-4 lg:col-span-2">
                            <h2 className="text-3xl font-bold">{t('aboutOurStory')}</h2>
                            <div className="space-y-4 text-text-light/80 dark:text-text-dark/80 text-lg">
                                <p>{t('aboutText2')}</p>
                                <p>{t('aboutText3')}</p>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-primary/10 dark:bg-primary/20 p-8">
                            <span className="material-symbols-outlined !text-4xl text-primary mb-4">rocket_launch</span>
                            <h3 className="text-2xl font-bold">{t('aboutOurMission')}</h3>
                            <p className="mt-2 text-text-light/80 dark:text-text-dark/80">{t('aboutMissionText')}</p>
                        </div>
                    </div>

                    <div className="mt-20 text-center">
                        <h2 className="text-3xl font-bold">{t('aboutWhyUs')}</h2>
                        <p className="mt-4 mx-auto max-w-2xl text-lg text-text-light/70 dark:text-text-dark/70">{t('aboutWhyUsSubtitle')}</p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                             <div key={index} className="flex flex-col items-center text-center p-6 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                   <span className="material-symbols-outlined !text-3xl">{feature.icon}</span>
                               </div>
                               <h3 className="mt-4 text-xl font-bold">{feature.title}</h3>
                               <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{feature.text}</p>
                           </div>
                        ))}
                    </div>
                </div>
            </main>
            <AppFooter {...props} />
        </div>
    );
};
