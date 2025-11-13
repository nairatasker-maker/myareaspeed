

import React, { useState, useCallback, useEffect } from 'react';
import type { TestResult, UserInfo, UserAgentPresetKey, Navigate } from './types';
import { HomePage } from './components/HomePage';
import { TestingPage } from './components/TestingPage';
import { ResultsPage } from './components/ResultsPage';
import { useSpeedTest } from './hooks/useSpeedTest';
import { I18nProvider, useTranslation } from './context/i18n';
import { AboutPage } from './components/AboutPage';
import { PrivacyPage } from './components/PrivacyPage';
import { ContactPage } from './components/ContactPage';
import { fetchLocationInfo } from './services/userInfoService';
import { CommunityPage } from './components/CommunityPage';

export type Theme = 'light' | 'dark';

const userAgentPresets: Record<Exclude<UserAgentPresetKey, 'default'>, string> = {
    iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
    windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

function getUserDeviceInfo(ua: string) {
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';

    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iOS|iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
    
    return { os, browser };
}

// Helper to parse location from hash, compatible with the sandboxed environment
const getLocationFromHash = () => {
    const hash = window.location.hash.slice(1); // remove '#'
    if (!hash) {
        return { pathname: '/', search: '' };
    }
    const [pathname, search] = hash.split('?');
    return {
        pathname: pathname || '/', // Default to root if hash is just '?'
        search: search ? `?${search}` : '',
    };
};


const AppContent: React.FC = () => {
    const [location, setLocation] = useState(getLocationFromHash());
    const [latestResult, setLatestResult] = useState<TestResult | null>(null);
    const { t } = useTranslation();
    const [userInfo, setUserInfo] = useState<UserInfo>({
        isp: t('loading'),
        city: t('loading'),
        region: t('loading'),
        country: t('loading'),
        ip: t('loading'),
        os: t('loading'),
        browser: t('loading'),
    });
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    const [userAgent, setUserAgent] = useState<UserAgentPresetKey>('default');

    const navigate: Navigate = useCallback((path: string) => {
        const newHash = path.startsWith('/') ? path : `/${path}`;
        const currentHash = window.location.hash.slice(1);
        
        // Prevent re-triggering hashchange if the hash is already correct
        if (currentHash !== newHash) {
             window.location.hash = newHash;
        } else {
            // If hash is same, manually trigger logic for components that depend on it
            setLocation(getLocationFromHash());
        }
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            setLocation(getLocationFromHash());
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

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

    // This useEffect handles shared URLs on initial load
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const speed = urlParams.get('speed');
        const ping = urlParams.get('ping');

        if (speed && ping) {
             const sharedResult: TestResult = {
                internetSpeed: parseFloat(speed),
                uploadSpeed: parseFloat(urlParams.get('upload') || '0'),
                ping: parseInt(ping, 10),
                jitter: parseInt(urlParams.get('jitter') || '0', 10),
                dataUsed: parseFloat(urlParams.get('dataUsed') || '0'),
                timestamp: Date.now(),
            };
            setLatestResult(sharedResult);
            // The line below was causing a SecurityError in sandboxed environments.
            // window.history.replaceState({}, document.title, window.location.pathname);
            
            // Navigate to the results page using the new hash system
            navigate('/results');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const onTestComplete = useCallback((result: TestResult) => {
        setLatestResult(result);
        navigate('/results');
    }, [navigate]);

    const { stage, internetSpeed, uploadSpeed, ping, error, startTest, resetTest } = useSpeedTest(onTestComplete);

    const handleStartTest = () => {
        resetTest();
        navigate('/testing');
    };

    const handleTestAgain = () => {
        resetTest();
        navigate('/');
    };
    
    useEffect(() => {
        if(location.pathname === '/testing' && stage === 'idle') {
            startTest();
        }
    }, [location.pathname, stage, startTest]);

    useEffect(() => {
        const fetchAndSetUserInfo = async () => {
            try {
                const locationInfo = await fetchLocationInfo();
                
                const uaString = userAgent === 'default' ? navigator.userAgent : userAgentPresets[userAgent as Exclude<UserAgentPresetKey, 'default'>];
                const { os, browser } = getUserDeviceInfo(uaString);

                setUserInfo({
                    ...locationInfo,
                    os,
                    browser,
                });
            } catch (error) {
                console.error("Failed to fetch user info:", error);
                const uaString = userAgent === 'default' ? navigator.userAgent : userAgentPresets[userAgent as Exclude<UserAgentPresetKey, 'default'>];
                const { os, browser } = getUserDeviceInfo(uaString);
                setUserInfo(prev => ({
                    ...prev,
                    isp: t('loading'), // Keep loading state on error
                    city: t('loading'),
                    region: t('loading'),
                    country: t('loading'),
                    ip: t('loading'),
                    os,
                    browser,
                }));
            }
        };

        fetchAndSetUserInfo();
    }, [t, userAgent]);

    useEffect(() => {
        // If the user navigates directly to the results page without having
        // a test result in state, redirect them to the homepage to avoid an error.
        if (location.pathname === '/results' && !latestResult) {
            navigate('/');
        }
    }, [location.pathname, latestResult, navigate]);

    const renderView = () => {
        switch(location.pathname) {
            case '/testing':
                return <TestingPage stage={stage} internetSpeed={internetSpeed} uploadSpeed={uploadSpeed} ping={ping} userInfo={userInfo} startTest={startTest} error={error} onRetry={handleTestAgain} />;
            case '/results':
                if (latestResult) {
                    return <ResultsPage result={latestResult} userInfo={userInfo} onTestAgain={handleTestAgain} theme={theme} toggleTheme={toggleTheme} navigate={navigate} />;
                }
                return null;
            case '/about':
                return <AboutPage theme={theme} toggleTheme={toggleTheme} navigate={navigate} />;
            case '/privacy':
                return <PrivacyPage theme={theme} toggleTheme={toggleTheme} navigate={navigate} />;
            case '/contact':
                return <ContactPage theme={theme} toggleTheme={toggleTheme} navigate={navigate} />;
            case '/community':
                return <CommunityPage theme={theme} toggleTheme={toggleTheme} navigate={navigate} onStartNewTest={handleStartTest} userInfo={userInfo} />;
            default: // Catches '/' and any other unknown paths
                return <HomePage onStartTest={handleStartTest} userInfo={userInfo} theme={theme} toggleTheme={toggleTheme} navigate={navigate} userAgent={userAgent} setUserAgent={setUserAgent} />;
        }
    };

    return <>{renderView()}</>;
};

const App: React.FC = () => {
    return (
        <I18nProvider>
            <AppContent />
        </I18nProvider>
    );
};

export default App;