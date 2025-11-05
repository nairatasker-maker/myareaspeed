
import React from 'react';
import type { AppView } from '../App';
import { useTranslation } from '../context/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

interface AppFooterProps {
    setView: (view: AppView) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ setView }) => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    return (
        <footer className="w-full mt-auto text-center border-t border-solid border-subtle-light dark:border-subtle-dark">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 mb-6">
                    <button onClick={() => setView('about')} className="text-link-light dark:text-link-dark hover:underline">{t('about')}</button>
                    <button onClick={() => setView('privacy')} className="text-link-light dark:text-link-dark hover:underline">{t('privacyPolicy')}</button>
                    <button onClick={() => setView('contact')} className="text-link-light dark:text-link-dark hover:underline">{t('contact')}</button>
                    <button onClick={() => setView('community')} className="text-link-light dark:text-link-dark hover:underline">{t('communityHub')}</button>
                </div>
                <div className="flex justify-center my-6">
                     <LanguageSwitcher />
                </div>
                <p className="text-text-light/60 dark:text-text-dark/60 text-sm">{t('copyright', { year: currentYear })}</p>
            </div>
        </footer>
    );
};