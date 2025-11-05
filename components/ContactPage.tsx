
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

export const ContactPage: React.FC<PageProps> = (props) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader {...props} title={t('contact')} />
            <main className="flex-grow">
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t('contactTitle')}</h1>
                        <p className="mt-6 mx-auto max-w-2xl text-lg text-text-light/70 dark:text-text-dark/70">{t('contactIntro')}</p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <div className="p-8 rounded-2xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-center">
                            <span className="material-symbols-outlined !text-4xl text-primary">mail</span>
                            <h2 className="mt-4 text-xl font-bold">{t('contactGeneralTitle')}</h2>
                            <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{t('contactGeneralText')}</p>
                            <a href={`mailto:${t('contactGeneralEmail')}`} className="mt-4 inline-block font-bold text-primary hover:underline">{t('contactGeneralEmail')}</a>
                        </div>
                        <div className="p-8 rounded-2xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-center">
                            <span className="material-symbols-outlined !text-4xl text-primary">business_center</span>
                            <h2 className="mt-4 text-xl font-bold">{t('contactPartnershipsTitle')}</h2>
                            <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{t('contactPartnershipsText')}</p>
                            <a href={`mailto:${t('contactPartnershipsEmail')}`} className="mt-4 inline-block font-bold text-primary hover:underline">{t('contactPartnershipsEmail')}</a>
                        </div>
                        <div className="p-8 rounded-2xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-center">
                            <span className="material-symbols-outlined !text-4xl text-primary">campaign</span>
                            <h2 className="mt-4 text-xl font-bold">{t('contactPressTitle')}</h2>
                            <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{t('contactPressText')}</p>
                            <a href={`mailto:${t('contactPressEmail')}`} className="mt-4 inline-block font-bold text-primary hover:underline">{t('contactPressEmail')}</a>
                        </div>
                    </div>

                    <div className="mt-16 text-center border-t border-border-light dark:border-border-dark pt-12">
                        <h2 className="text-2xl font-bold">{t('contactAddressTitle')}</h2>
                        <div className="mt-4 text-lg text-text-light/80 dark:text-text-dark/80">
                            <p>{t('contactAddressLine1')}</p>
                            <p>{t('contactAddressLine2')}</p>
                            <p>{t('contactAddressLine3')}</p>
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter {...props} />
        </div>
    );
};