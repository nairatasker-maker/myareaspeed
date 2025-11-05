
import React, { useState, useCallback, useEffect } from 'react';
import type { TestResult, UserInfo } from './types';
import { HomePage } from './components/HomePage';
import { TestingPage } from './components/TestingPage';
import { ResultsPage } from './components/ResultsPage';
import { useSpeedTest } from './hooks/useSpeedTest';
import { I18nProvider, useTranslation } from './context/i18n';
import { CommunityPage } from './components/CommunityPage';
import { AboutPage } from './components/AboutPage';
import { PrivacyPage } from './components/PrivacyPage';
import { ContactPage } from './components/ContactPage';


export type AppView = 'home' | 'testing' | 'results' | 'community' | 'about' | 'privacy' | 'contact';
export type Theme = 'light' | 'dark';

const AppContent: React.FC = () => {
    const [view, setView] = useState<AppView>('home');
    const [latestResult, setLatestResult] = useState<TestResult | null>(null);
    const { t } = useTranslation();
    const [userInfo, setUserInfo] = useState<UserInfo>({
        isp: t('loading'),
        city: t('loading'),
        country: t('loading'),
        ip: t('loading'),
    });
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        // Check for shared results in URL on initial load
        const urlParams = new URLSearchParams(window.location.search);
        const download = urlParams.get('download');
        const upload = urlParams.get('upload');
        const ping = urlParams.get('ping');

        if (download && upload && ping) {
            const sharedResult: TestResult = {
                downloadSpeed: parseFloat(download),
                uploadSpeed: parseFloat(upload),
                ping: parseInt(ping, 10),
                jitter: parseInt(urlParams.get('jitter') || '0', 10),
                dataUsed: parseFloat(urlParams.get('dataUsed') || '0'),
                timestamp: Date.now(),
            };
            setLatestResult(sharedResult);
            setView('results');
             // Clean the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const fetchUserInfo = async () => {
            try {
                // Using ipinfo.io as a more reliable alternative to ip-api.com
                const response = await fetch('https://ipinfo.io/json');
                if (!response.ok) {
                    throw new Error('Failed to fetch user info');
                }
                const data = await response.json();
                setUserInfo({
                    isp: data.org || 'Unknown ISP',
                    city: data.city || 'Unknown City',
                    country: data.country || 'Unknown Country',
                    ip: data.ip || 'Unknown IP',
                });
            } catch (error) {
                console.error('Error fetching user info:', error);
                // Fallback to mock data on error
                setUserInfo({
                    isp: 'MTN Nigeria',
                    city: 'Lagos',
                    country: 'Nigeria',
                    ip: '197.210.52.41',
                });
            }
        };

        fetchUserInfo();
        
        // Geolocation
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('User location:', position.coords.latitude, position.coords.longitude);
                // In a real app, you would use a reverse geocoding API here.
            },
            (error) => {
                console.warn(`Geolocation error: ${error.message}`);
            }
        );
    }, []);

    const handleTestComplete = useCallback((result: TestResult) => {
        setLatestResult(result);
        setView('results');
    }, []);
    
    const { stage, downloadSpeed, uploadSpeed, uploadProgress, ping, startTest } = useSpeedTest(handleTestComplete);

    const handleStartTest = () => {
        setView('testing');
    };

    const handleTestAgain = () => {
        setLatestResult(null);
        setView('testing');
    };

    const renderView = () => {
        switch (view) {
            case 'testing':
                return (
                    <TestingPage
                        stage={stage}
                        downloadSpeed={downloadSpeed}
                        uploadSpeed={uploadSpeed}
                        uploadProgress={uploadProgress}
                        ping={ping}
                        userInfo={userInfo}
                        startTest={startTest}
                    />
                );
            case 'results':
                if (latestResult) {
                    return (
                        <ResultsPage
                            result={latestResult}
                            userInfo={userInfo}
                            onTestAgain={handleTestAgain}
                            theme={theme}
                            toggleTheme={toggleTheme}
                            setView={setView}
                        />
                    );
                }
                // Fallback to home if no result
                setView('home');
                return <HomePage onStartTest={handleStartTest} userInfo={userInfo} theme={theme} toggleTheme={toggleTheme} setView={setView} />;
            case 'community':
                return <CommunityPage userInfo={userInfo} theme={theme} toggleTheme={toggleTheme} setView={setView} />;
            case 'about':
                return <AboutPage theme={theme} toggleTheme={toggleTheme} setView={setView} />;
            case 'privacy':
                return <PrivacyPage theme={theme} toggleTheme={toggleTheme} setView={setView} />;
            case 'contact':
                return <ContactPage theme={theme} toggleTheme={toggleTheme} setView={setView} />;
            case 'home':
            default:
                return <HomePage onStartTest={handleStartTest} userInfo={userInfo} theme={theme} toggleTheme={toggleTheme} setView={setView} />;
        }
    };
    
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
            {renderView()}
        </div>
    );
};

const App: React.FC = () => (
    <I18nProvider>
        <AppContent />
    </I18nProvider>
);


export default App;
