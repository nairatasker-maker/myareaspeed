
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

export const PrivacyPage: React.FC<PageProps> = (props) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader {...props} title={t('privacyPolicy')} />
            <main className="flex-grow">
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t('privacyTitle')}</h1>
                        <p className="mt-6 mx-auto max-w-3xl text-lg text-text-light/70 dark:text-text-dark/70">{t('privacyIntro')}</p>
                    </div>

                    <div className="mt-16 space-y-12">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
                            <div className="lg:col-span-1">
                                <h2 className="text-2xl font-bold text-primary">{t('privacyDataTitle')}</h2>
                                <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{t('privacyDataText1')}</p>
                            </div>
                            <div className="lg:col-span-2">
                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <span className="material-symbols-outlined text-primary mt-1">speed</span>
                                        <div>
                                            <h3 className="font-semibold text-lg">{t('privacyDataPoint1_title')}</h3>
                                            <p className="text-text-light/70 dark:text-text-dark/70">{t('privacyDataPoint1')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <span className="material-symbols-outlined text-primary mt-1">location_on</span>
                                        <div>
                                            <h3 className="font-semibold text-lg">{t('privacyDataPoint2_title')}</h3>
                                            <p className="text-text-light/70 dark:text-text-dark/70">{t('privacyDataPoint2')}</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <span className="material-symbols-outlined text-primary mt-1">rate_review</span>
                                        <div>
                                            <h3 className="font-semibold text-lg">{t('privacyDataPoint3_title')}</h3>
                                            <p className="text-text-light/70 dark:text-text-dark/70">{t('privacyDataPoint3')}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
                            <div className="lg:col-span-1">
                                <h2 className="text-2xl font-bold text-primary">{t('privacyUsageTitle')}</h2>
                            </div>
                            <div className="lg:col-span-2">
                                <p className="text-text-light/80 dark:text-text-dark/80 text-lg">{t('privacyUsageText')}</p>
                            </div>
                        </div>

                        <div className="text-center border-t border-border-light dark:border-border-dark pt-16">
                            <h2 className="text-3xl font-bold">{t('privacyPrinciplesTitle')}</h2>
                            <p className="mt-4 mx-auto max-w-2xl text-lg text-text-light/70 dark:text-text-dark/70">{t('privacyPrinciplesSubtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col items-center text-center p-6 rounded-xl">
                                <span className="material-symbols-outlined !text-4xl text-primary mb-4">visibility_off</span>
                                <h3 className="text-xl font-bold">{t('privacyPrinciple1Title')}</h3>
                                <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{t('privacyPrinciple1Text')}</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-6 rounded-xl">
                                <span className="material-symbols-outlined !text-4xl text-primary mb-4">handshake</span>
                                <h3 className="text-xl font-bold">{t('privacyPrinciple2Title')}</h3>
                                <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{t('privacyPrinciple2Text')}</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-6 rounded-xl">
                                <span className="material-symbols-outlined !text-4xl text-primary mb-4">no_accounts</span>
                                <h3 className="text-xl font-bold">{t('privacyPrinciple3Title')}</h3>
                                <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{t('privacyPrinciple3Text')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter {...props} />
        </div>
    );
};
