import React, { useEffect } from 'react';
import type { Navigate } from '../types';
import { useTranslation } from '../context/i18n';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoIcon } from './icons';
import { AppFooter } from './AppFooter';

interface PageProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    navigate: Navigate;
}

const useSEOTags = (title: string, description: string) => {
    useEffect(() => {
        if (title) document.title = title;
        if (description) {
            let meta = document.querySelector('meta[name="description"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'description');
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', description);
        }
    }, [title, description]);
};

const PageHeader: React.FC<PageProps & { title: string }> = ({ theme, toggleTheme, navigate, title }) => {
    return (
        <header className="w-full">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark py-4">
                     <a href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center gap-3 cursor-pointer">
                        <LogoIcon />
                        <h1 className="text-xl font-bold leading-tight">{title}</h1>
                    </a>
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
    useSEOTags(
        `${t('privacyTitle')} | myareaspeed`,
        t('privacyIntro')
    );

    const dataPoints = [
        { icon: 'receipt_long', title: t('privacyDataPoint1_title'), text: t('privacyDataPoint1') },
        { icon: 'location_on', title: t('privacyDataPoint2_title'), text: t('privacyDataPoint2') },
        { icon: 'volunteer_activism', title: t('privacyDataPoint3_title'), text: t('privacyDataPoint3') },
    ];
    
    const principles = [
        { icon: 'visibility_off', title: t('privacyPrinciple1Title'), text: t('privacyPrinciple1Text') },
        { icon: 'groups', title: t('privacyPrinciple2Title'), text: t('privacyPrinciple2Text') },
        { icon: 'no_cell', title: t('privacyPrinciple3Title'), text: t('privacyPrinciple3Text') },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <PageHeader {...props} title={t('privacyTitle')} />
            <main className="flex-grow">
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t('privacyTitle')}</h1>
                        <p className="mt-6 mx-auto max-w-2xl text-lg text-text-light/70 dark:text-text-dark/70">{t('privacyIntro')}</p>
                    </div>

                    <div className="mt-20 space-y-12">
                         <div>
                            <h2 className="text-3xl font-bold">{t('privacyDataTitle')}</h2>
                            <p className="mt-4 text-lg text-text-light/80 dark:text-text-dark/80">{t('privacyDataText1')}</p>
                            <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
                                {dataPoints.map(point => (
                                    <div key={point.title} className="flex gap-4">
                                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <span className="material-symbols-outlined">{point.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{point.title}</h3>
                                            <p className="mt-1 text-text-light/70 dark:text-text-dark/70">{point.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold">{t('privacyUsageTitle')}</h2>
                            <p className="mt-4 text-lg text-text-light/80 dark:text-text-dark/80">{t('privacyUsageText')}</p>
                        </div>

                        <div className="mt-20 text-center">
                            <h2 className="text-3xl font-bold">{t('privacyPrinciplesTitle')}</h2>
                            <p className="mt-4 mx-auto max-w-2xl text-lg text-text-light/70 dark:text-text-dark/70">{t('privacyPrinciplesSubtitle')}</p>
                        </div>
    
                        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {principles.map((principle, index) => (
                                 <div key={index} className="flex flex-col items-center text-center p-6 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                       <span className="material-symbols-outlined !text-3xl">{principle.icon}</span>
                                   </div>
                                   <h3 className="mt-4 text-xl font-bold">{principle.title}</h3>
                                   <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{principle.text}</p>
                               </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter {...props} />
        </div>
    );
};