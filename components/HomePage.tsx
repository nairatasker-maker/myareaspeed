

import React, { useState } from 'react';
import type { UserInfo, UserAgentPresetKey, Navigate } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { useTranslation } from '../context/i18n';
import { AppFooter } from './AppFooter';
import { MyAreaSpeedFullLogo } from './icons';

interface HomePageProps {
    onStartTest: () => void;
    userInfo: UserInfo;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    navigate: Navigate;
    userAgent: UserAgentPresetKey;
    setUserAgent: (key: UserAgentPresetKey) => void;
}

const UserAgentSpoofer: React.FC<{
    userAgent: UserAgentPresetKey;
    setUserAgent: (key: UserAgentPresetKey) => void;
}> = ({ userAgent, setUserAgent }) => {
    const { t } = useTranslation();
    const userAgentOptions: Record<UserAgentPresetKey, string> = {
        default: t('spoof_default'),
        iphone: t('spoof_iphone'),
        android: t('spoof_android'),
        windows: t('spoof_windows'),
    };

    return (
         <div className="w-full max-w-sm mx-auto">
            <label htmlFor="user-agent-select" className="flex items-center justify-center gap-2 text-sm font-medium text-text-light/70 dark:text-text-dark/70 mb-2">
                <span className="material-symbols-outlined !text-base">devices</span>
                {t('spoofUserAgentLabel')}
            </label>
            <div className="relative">
                <select
                    id="user-agent-select"
                    value={userAgent}
                    onChange={(e) => setUserAgent(e.target.value as UserAgentPresetKey)}
                    className="w-full appearance-none cursor-pointer pl-4 pr-10 py-2.5 text-base border border-border-light dark:border-border-dark focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm rounded-full bg-card-light dark:bg-card-dark"
                    aria-label={t('spoofUserAgentLabel')}
                >
                    {Object.entries(userAgentOptions).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-text-light/70 dark:text-text-dark/70">
                    <span className="material-symbols-outlined !text-lg">expand_more</span>
                </div>
            </div>
        </div>
    );
};

const AreaInsights: React.FC<{ navigate: Navigate }> = ({ navigate }) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/community?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <section className="w-full py-16 bg-subtle-light dark:bg-subtle-dark">
            <div className="mx-auto max-w-2xl px-4 text-center">
                <h2 className="text-3xl font-bold">{t('areaInsightsTitle')}</h2>
                <p className="mt-2 text-lg text-text-light/70 dark:text-text-dark/70">{t('areaInsightsSubtitle')}</p>
                <form onSubmit={handleSearch} className="flex gap-2 mt-6">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className="flex-grow w-full rounded-full border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-3 px-5 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <button type="submit" className="rounded-full bg-primary px-6 text-base font-bold text-white transition-opacity hover:opacity-90">{t('search')}</button>
                </form>
            </div>
        </section>
    );
};


export const HomePage: React.FC<HomePageProps> = ({ onStartTest, userInfo, theme, toggleTheme, navigate, userAgent, setUserAgent }) => {
    const { t } = useTranslation();

    return (
        <div className="relative flex flex-col min-h-screen">
            <header className="absolute top-0 right-0 p-4 sm:p-6 z-10">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </header>
            <main className="flex flex-col items-center justify-center flex-1 gap-8 px-4 py-8 text-center">
                <div className="flex flex-col items-center gap-4 mb-4">
                    <MyAreaSpeedFullLogo className="w-full max-w-sm h-auto text-text-light dark:text-text-dark" />
                    <p className="text-text-light/70 dark:text-text-dark/70 text-lg font-normal leading-normal max-w-xl">{t('appSubtitle')}</p>
                </div>
                <div className="flex px-4 py-3 justify-center">
                    <button
                        onClick={onStartTest}
                        className="flex relative cursor-pointer items-center justify-center rounded-full h-48 w-48 bg-primary text-secondary text-4xl font-black uppercase tracking-wider hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/50 transition-transform duration-300 ease-in-out shadow-2xl shadow-primary/40 animate-pulse"
                    >
                        <span className="truncate">{t('startTest')}</span>
                    </button>
                </div>
                <p className="text-text-light/80 dark:text-text-dark/80 text-base font-normal leading-normal px-4">{`${userInfo.city}, ${userInfo.country} | ${userInfo.isp}`}</p>
                
                <UserAgentSpoofer userAgent={userAgent} setUserAgent={setUserAgent} />

            </main>
            <AreaInsights navigate={navigate} />
            <AppFooter navigate={navigate} />
        </div>
    );
};