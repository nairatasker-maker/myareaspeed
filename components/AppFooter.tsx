import React from 'react';
import type { Navigate } from '../types';
import { useTranslation } from '../context/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';

interface AppFooterProps {
    navigate: Navigate;
}

export const AppFooter: React.FC<AppFooterProps> = ({ navigate }) => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        navigate(path);
    };

    return (
        <footer className="w-full mt-auto text-center border-t border-solid border-subtle-light dark:border-subtle-dark">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 mb-6">
                    <a href="#/about" onClick={(e) => handleNav(e, '/about')} className="text-link-light dark:text-link-dark hover:underline">{t('about')}</a>
                    <a href="#/community" onClick={(e) => handleNav(e, '/community')} className="text-link-light dark:text-link-dark hover:underline">{t('communityFeedback')}</a>
                    <a href="#/privacy" onClick={(e) => handleNav(e, '/privacy')} className="text-link-light dark:text-link-dark hover:underline">{t('privacyPolicy')}</a>
                    <a href="#/contact" onClick={(e) => handleNav(e, '/contact')} className="text-link-light dark:text-link-dark hover:underline">{t('contact')}</a>
                </div>
                <div className="flex justify-center my-6">
                     <LanguageSwitcher />
                </div>
                <p className="text-text-light/60 dark:text-text-dark/60 text-sm">{t('copyright', { year: currentYear })}</p>
            </div>
        </footer>
    );
};