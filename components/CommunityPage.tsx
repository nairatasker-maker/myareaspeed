
import React, { useState, useEffect, useCallback } from 'react';
import type { AppView, Theme } from '../App';
import type { CommunityFeedback, UserInfo, ExperienceTag } from '../types';
import { searchFeedback, markAsHelpful, SearchFilters } from '../services/communityService';
import { useTranslation } from '../context/i18n';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoIcon } from './icons';
import { AppFooter } from './AppFooter';


interface CommunityPageProps {
    userInfo: UserInfo;
    theme: Theme;
    toggleTheme: () => void;
    setView: (view: AppView) => void;
}

const CommunityHeader: React.FC<{ theme: Theme; toggleTheme: () => void; setView: (view: AppView) => void; }> = ({ theme, toggleTheme, setView }) => {
    const { t } = useTranslation();
    return (
        <header className="w-full sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm z-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark py-4">
                    <button onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer">
                        <LogoIcon />
                        <h1 className="text-xl font-bold leading-tight">{t('communityHub')}</h1>
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

const FeedbackCard: React.FC<{ feedback: CommunityFeedback; onHelpful: (id: string) => void }> = ({ feedback, onHelpful }) => {
    const { t } = useTranslation();
    const timeAgo = new Intl.RelativeTimeFormat(useTranslation().language, { numeric: 'auto' });
    const daysAgo = Math.round((feedback.timestamp - Date.now()) / (1000 * 60 * 60 * 24));
    
    return (
        <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl border border-border-light dark:border-border-dark shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-lg">{feedback.location}</h3>
                    <p className="text-sm text-text-light/70 dark:text-text-dark/70">{feedback.isp} &bull; {timeAgo.format(daysAgo, 'day')}</p>
                </div>
                <div className="flex items-center gap-1 font-bold text-lg">
                    {feedback.rating}
                    <span className="material-symbols-outlined !text-xl text-yellow-400">star</span>
                </div>
            </div>
            <p className="mb-4 text-text-light/90 dark:text-text-dark/90">{`"${feedback.comment}"`}</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {feedback.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{t(`tag_${tag}`)}</span>
                ))}
                 <span className="px-2 py-1 bg-subtle-light dark:bg-subtle-dark text-text-light/70 dark:text-text-dark/70 text-xs font-medium rounded-full">{t(`time_${feedback.timeOfDay}`)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center border-t border-border-light dark:border-border-dark pt-4 mb-4">
                <div>
                    <p className="text-xs text-text-light/70 dark:text-text-dark/70">{t('downloadSpeed')}</p>
                    <p className="font-bold text-lg">{feedback.downloadSpeed.toFixed(1)} <span className="text-sm font-normal">Mbps</span></p>
                </div>
                <div>
                    <p className="text-xs text-text-light/70 dark:text-text-dark/70">{t('uploadSpeed')}</p>
                    <p className="font-bold text-lg">{feedback.uploadSpeed.toFixed(1)} <span className="text-sm font-normal">Mbps</span></p>
                </div>
                <div>
                    <p className="text-xs text-text-light/70 dark:text-text-dark/70">{t('ping')}</p>
                    <p className="font-bold text-lg">{feedback.ping} <span className="text-sm font-normal">ms</span></p>
                </div>
            </div>
            <button onClick={() => onHelpful(feedback.id)} className="flex items-center gap-2 text-sm text-primary font-medium hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined !text-lg">thumb_up</span>
                {t('helpful')} ({feedback.helpfulCount})
            </button>
        </div>
    );
};


export const CommunityPage: React.FC<CommunityPageProps> = (props) => {
    const { t } = useTranslation();
    const [results, setResults] = useState<CommunityFeedback[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<SearchFilters>({ sortBy: 'recent' });
    const [locationQuery, setLocationQuery] = useState('');

    const loadResults = useCallback((currentPage: number, currentFilters: SearchFilters) => {
        setIsLoading(true);
        setTimeout(() => { // Simulate network delay
            const data = searchFeedback(currentFilters, currentPage);
            setResults(prev => currentPage === 1 ? data.results : [...prev, ...data.results]);
            setHasMore(data.hasMore);
            setIsLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        setPage(1);
        loadResults(1, filters);
    }, [filters, loadResults]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, location: locationQuery }));
    };

    const handleHelpful = (id: string) => {
        const success = markAsHelpful(id);
        if (success) {
            setResults(prev => prev.map(r => r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));
        }
    };
    
    const handleLoadMore = () => {
        const newPage = page + 1;
        setPage(newPage);
        loadResults(newPage, filters);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <CommunityHeader {...props} />
            <main className="flex-grow">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('communitySearchTitle')}</h2>
                        <p className="mt-3 max-w-2xl mx-auto text-lg text-text-light/70 dark:text-text-dark/70">{t('communitySearchSubtitle')}</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mb-8">
                        <input
                            type="text"
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            placeholder={t('searchPlaceholder')}
                            className="flex-grow w-full rounded-full border border-border-light bg-subtle-light dark:border-border-dark dark:bg-subtle-dark p-3 px-5 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                         <button type="submit" className="rounded-full bg-primary px-6 text-base font-bold text-white transition-opacity hover:opacity-90">{t('search')}</button>
                    </form>
                    
                    <div className="flex justify-center mb-8">
                        <div className="p-1 bg-subtle-light dark:bg-subtle-dark rounded-full flex items-center gap-1 text-sm">
                             {(['recent', 'helpful', 'speed-fast'] as const).map(sortBy => (
                                <button
                                    key={sortBy}
                                    onClick={() => setFilters(prev => ({ ...prev, sortBy }))}
                                    className={`px-4 py-1.5 rounded-full font-semibold transition-colors ${filters.sortBy === sortBy ? 'bg-card-light dark:bg-card-dark shadow-sm text-primary' : 'text-text-light/70 dark:text-text-dark/70 hover:text-text-light dark:hover:text-text-dark'}`}
                                >
                                   {t(`sortBy_${sortBy}`)}
                                </button>
                             ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.map(feedback => <FeedbackCard key={feedback.id} feedback={feedback} onHelpful={handleHelpful} />)}
                    </div>
                    
                    {(isLoading || hasMore) && (
                        <div className="text-center mt-8">
                            {isLoading ? (
                                 <p className="text-text-light/70 dark:text-text-dark/70">{t('loadingResults')}</p>
                            ) : hasMore ? (
                                <button onClick={handleLoadMore} className="rounded-full bg-primary px-6 py-2 text-base font-bold text-white transition-opacity hover:opacity-90">
                                    {t('loadMore')}
                                </button>
                            ) : <p className="text-text-light/70 dark:text-text-dark/70">{t('noMoreResults')}</p>}
                        </div>
                    )}
                </div>
            </main>
            <AppFooter {...props} />
        </div>
    );
};
