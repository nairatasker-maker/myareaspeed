

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Navigate, CommunityFeedback, UserInfo } from '../types';
import { searchFeedback } from '../services/communityService';
import { useTranslation } from '../context/i18n';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoIcon } from './icons';
import { AppFooter } from './AppFooter';

interface CommunityPageProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    navigate: Navigate;
    onStartNewTest: () => void;
    userInfo: UserInfo;
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

const CommunityHeader: React.FC<Pick<CommunityPageProps, 'theme' | 'toggleTheme' | 'navigate'>> = ({ theme, toggleTheme, navigate }) => {
    const { t } = useTranslation();
    return (
        <header className="w-full sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm z-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark py-4">
                    <a href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center gap-3 cursor-pointer">
                        <LogoIcon />
                        <h1 className="text-xl font-bold leading-tight">{t('communityFeedback')}</h1>
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

const FeedbackCard: React.FC<{ feedback: CommunityFeedback }> = ({ feedback }) => {
    const { t, language } = useTranslation();
    const timeAgo = useMemo(() => new Intl.RelativeTimeFormat(language, { numeric: 'auto' }), [language]);
    const daysAgo = Math.round((feedback.timestamp - Date.now()) / (1000 * 60 * 60 * 24));
    
    return (
        <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-lg">{feedback.location}</h3>
                    <p className="text-sm text-text-light/70 dark:text-text-dark/70">{feedback.isp} &bull; {timeAgo.format(daysAgo, 'day')}</p>
                </div>
                <div className="flex items-center gap-1 font-bold text-lg flex-shrink-0">
                    {feedback.rating}
                    <span className="material-symbols-outlined !text-xl text-yellow-400">star</span>
                </div>
            </div>
            {feedback.comment && <p className="mb-4 text-text-light/90 dark:text-text-dark/90 italic">{`"${feedback.comment}"`}</p>}
            <div className="grid grid-cols-3 gap-2 text-center border-t border-border-light dark:border-border-dark pt-4 mt-auto">
                <div>
                    <p className="text-xs text-text-light/70 dark:text-text-dark/70">{t('downloadSpeed')}</p>
                    <p className="font-bold text-lg">{feedback.internetSpeed.toFixed(1)} <span className="text-sm font-normal">Mbps</span></p>
                </div>
                <div>
                    <p className="text-xs text-text-light/70 dark:text-text-dark/70">{t('ping')}</p>
                    <p className="font-bold text-lg">{feedback.ping} <span className="text-sm font-normal">ms</span></p>
                </div>
                <div>
                    <p className="text-xs text-text-light/70 dark:text-text-dark/70">{t('jitter')}</p>
                    <p className="font-bold text-lg">{feedback.jitter} <span className="text-sm font-normal">ms</span></p>
                </div>
            </div>
        </div>
    );
};


export const CommunityPage: React.FC<CommunityPageProps> = (props) => {
    const { t } = useTranslation();
    const [results, setResults] = useState<CommunityFeedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const queryFromUrl = useMemo(() => {
        const hash = window.location.hash;
        const searchPart = hash.split('?')[1];
        if (!searchPart) return '';
        const searchParams = new URLSearchParams(searchPart);
        return searchParams.get('q') || '';
    }, []);

    const seoTitle = queryFromUrl 
        ? `Internet Speed in ${queryFromUrl} | Community Feedback | myareaspeed`
        : `Community Feedback | myareaspeed`;
    const seoDescription = queryFromUrl
        ? `See real user feedback on internet speed and ISP performance in ${queryFromUrl}, Nigeria. Compare download speeds, ping, and ratings from the myareaspeed community.`
        : `Explore real-world internet performance reports from users across Nigeria. Search by location to see feedback on ISP speed, ping, and reliability.`;
    useSEOTags(seoTitle, seoDescription);
    

    const loadResults = useCallback((query: string) => {
        setIsLoading(true);
        // Simulate network delay for better UX
        const timer = setTimeout(() => {
            const data = searchFeedback(query);
            setResults(data);
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        setSearchQuery(queryFromUrl);
        loadResults(queryFromUrl);
    }, [queryFromUrl, loadResults]);
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        props.navigate(`/community?q=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <CommunityHeader {...props} />
            <main className="flex-grow">
                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('communitySearchTitle')}</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-lg text-text-light/70 dark:text-text-dark/70">{t('communitySearchSubtitle')}</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto mb-8">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('searchPlaceholder')}
                            className="flex-grow w-full rounded-full border border-border-light bg-subtle-light dark:border-border-dark dark:bg-subtle-dark p-3 px-5 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                         <button type="submit" className="rounded-full bg-primary px-6 text-base font-bold text-white transition-opacity hover:opacity-90">{t('search')}</button>
                    </form>

                    {isLoading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-card-light dark:bg-card-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm animate-pulse"></div>)}
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-16 px-6 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark">
                            <span className="material-symbols-outlined !text-6xl text-text-light/30 dark:text-text-dark/30">forum_off</span>
                            <h3 className="mt-4 text-2xl font-bold">{t('noFeedbackTitle')}</h3>
                            <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{t('noFeedbackSubtitle')}</p>
                            <button
                                onClick={props.onStartNewTest}
                                className="mt-6 rounded-full bg-primary px-6 py-2 text-base font-bold text-white transition-opacity hover:opacity-90"
                            >
                                {t('beTheFirst')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map(feedback => (
                                <FeedbackCard key={feedback.id} feedback={feedback} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <AppFooter {...props} />
        </div>
    );
};