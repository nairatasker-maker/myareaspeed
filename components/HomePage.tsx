
import React, { useState, useEffect } from 'react';
import type { NetworkStat, UserInfo } from '../types';
import type { AppView } from '../App';
import { ThemeToggle } from './ThemeToggle';
import { useTranslation } from '../context/i18n';
import { AppFooter } from './AppFooter';


interface HomePageProps {
    onStartTest: () => void;
    userInfo: UserInfo;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setView: (view: AppView) => void;
}

const MOCK_STATS: { [key: string]: NetworkStat[] } = {
    'Lagos': [
        { name: 'MTN', percentage: 45, color: 'bg-yellow-400' },
        { name: 'Airtel', percentage: 30, color: 'bg-red-500' },
        { name: 'Glo', percentage: 18, color: 'bg-primary' },
        { name: '9mobile', percentage: 7, color: 'bg-green-700' },
    ],
    'Abuja': [
        { name: 'MTN', percentage: 55, color: 'bg-yellow-400' },
        { name: 'Airtel', percentage: 25, color: 'bg-red-500' },
        { name: 'Glo', percentage: 15, color: 'bg-primary' },
        { name: '9mobile', percentage: 5, color: 'bg-green-700' },
    ],
    'Kano': [
         { name: 'Airtel', percentage: 40, color: 'bg-red-500' },
         { name: 'MTN', percentage: 38, color: 'bg-yellow-400' },
         { name: 'Glo', percentage: 12, color: 'bg-primary' },
         { name: '9mobile', percentage: 10, color: 'bg-green-700' },
    ],
    'Default': [
        { name: 'MTN', percentage: 40, color: 'bg-yellow-400' },
        { name: 'Airtel', percentage: 28, color: 'bg-red-500' },
        { name: 'Glo', percentage: 22, color: 'bg-primary' },
        { name: '9mobile', percentage: 10, color: 'bg-green-700' },
    ]
};

const fetchNetworkStats = (city: string): Promise<NetworkStat[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_STATS[city] || MOCK_STATS['Default']);
        }, 1500); // 1.5 second delay to simulate network request
    });
};

const ProgressBar: React.FC<{ stat: NetworkStat }> = ({ stat }) => (
    <div>
        <div className="flex justify-between mb-1 text-sm font-medium text-text-light dark:text-text-dark">
            <span>{stat.name}</span>
            <span>{stat.percentage}%</span>
        </div>
        <div className="w-full bg-subtle-light dark:bg-subtle-dark rounded-full h-2.5">
            <div className={`${stat.color} h-2.5 rounded-full`} style={{ width: `${stat.percentage}%` }}></div>
        </div>
    </div>
);

const StatsSkeletonLoader: React.FC = () => (
    <>
        {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
                <div className="flex justify-between items-center">
                    <div className="h-4 bg-subtle-light dark:bg-subtle-dark rounded w-20"></div>
                    <div className="h-4 bg-subtle-light dark:bg-subtle-dark rounded w-10"></div>
                </div>
                <div className="h-2.5 bg-subtle-light dark:bg-subtle-dark rounded-full"></div>
            </div>
        ))}
    </>
);

export const HomePage: React.FC<HomePageProps> = ({ onStartTest, userInfo, theme, toggleTheme, setView }) => {
    const [networkStats, setNetworkStats] = useState<NetworkStat[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const { t } = useTranslation();

    const city = userInfo.city;

    useEffect(() => {
        if (city && city !== t('loading')) {
            setIsLoadingStats(true);
            fetchNetworkStats(city)
                .then(data => {
                    setNetworkStats(data);
                    setIsLoadingStats(false);
                });
        }
    }, [city, t]);

    return (
        <div className="relative flex flex-col min-h-screen">
            <header className="absolute top-0 right-0 p-4 sm:p-6 z-10">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </header>
            <main className="flex flex-col items-center justify-center flex-1 gap-8 px-4 py-8 text-center">
                <div className="flex flex-col items-center gap-2 mb-4">
                    <h1 className="text-text-light dark:text-text-dark text-4xl sm:text-5xl font-black tracking-[-0.02em]">{t('appTitle')}</h1>
                    <p className="text-text-light/70 dark:text-text-dark/70 text-base font-normal leading-normal">{t('appSubtitle')}</p>
                </div>
                <div className="flex px-4 py-3 justify-center">
                    <button
                        onClick={onStartTest}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-20 w-52 bg-primary text-secondary text-xl font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
                    >
                        <span className="truncate">{t('startTest')}</span>
                    </button>
                </div>
                <p className="text-text-light/80 dark:text-text-dark/80 text-base font-normal leading-normal pb-3 pt-4 px-4">{`${userInfo.city}, ${userInfo.country} | ${userInfo.isp}`}</p>
                
                <div className="w-full max-w-lg mt-12 p-6 bg-card-light dark:bg-card-dark rounded-xl border border-subtle-light dark:border-subtle-dark">
                    <h3 className="text-lg font-bold text-text-light dark:text-text-dark mb-4">{t('mostUsedNetworks', { city })}</h3>
                    <div className="space-y-4">
                        {isLoadingStats ? (
                            <StatsSkeletonLoader />
                        ) : (
                            networkStats.map(stat => <ProgressBar key={stat.name} stat={stat} />)
                        )}
                    </div>
                </div>

                <div className="w-full max-w-lg mt-8 p-6 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 dark:border-primary/30 text-center">
                    <span className="material-symbols-outlined !text-4xl text-primary">groups</span>
                    <h3 className="text-lg font-bold text-text-light dark:text-text-dark mt-2 mb-2">{t('communityHubTitle')}</h3>
                    <p className="text-text-light/80 dark:text-text-dark/80 mb-4">{t('communityHubSubtitle')}</p>
                    <button 
                        onClick={() => setView('community')}
                        className="rounded-full bg-primary px-6 py-2 text-base font-bold text-white transition-opacity hover:opacity-90">
                        {t('exploreCommunity')}
                    </button>
                </div>

            </main>
            <AppFooter setView={setView} />
        </div>
    );
};
