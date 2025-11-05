
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
                <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                     <div className="prose dark:prose-invert prose-lg prose-h1:font-bold prose-h1:text-3xl prose-p:leading-relaxed">
                        <h1>{t('contactTitle')}</h1>
                        <p>{t('contactIntro')}</p>
                        <div className="not-prose mt-8 p-6 rounded-xl bg-subtle-light dark:bg-subtle-dark">
                            <h3 className="font-bold text-xl">Kobowallet Innovation</h3>
                            <p className="mt-2">123 Tech Avenue, Silicon Lagoon</p>
                            <p>Lagos, Nigeria</p>
                            <p className="mt-4"><a href="mailto:hello@myareaspeed.com" className="text-link-light dark:text-link-dark">hello@myareaspeed.com</a></p>
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter {...props} />
        </div>
    );
};
