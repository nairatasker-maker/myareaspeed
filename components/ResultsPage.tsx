

import React, { useState, useEffect, useRef } from 'react';
import type { TestResult, UserInfo, Navigate } from '../types';
import { LogoIcon } from './icons';
import { ThemeToggle } from './ThemeToggle';
import { useTranslation } from '../context/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AppFooter } from './AppFooter';
import { addFeedback } from '../services/communityService';
import { isCommentSpam, canSubmitFeedback, recordFeedbackSubmission } from '../services/spamService';


interface ResultsPageProps {
    result: TestResult;
    userInfo: UserInfo;
    onTestAgain: () => void;
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


const useCountUp = (end: number, duration: number = 1500) => {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number | undefined>(undefined);
    const startTimeRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const animate = (timestamp: number) => {
            if (startTimeRef.current === undefined) {
                startTimeRef.current = timestamp;
            }
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easedProgress * end;
            setCount(currentVal);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        startTimeRef.current = undefined;
        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [end, duration]);

    return count;
};


const getSpeedStatus = (speed: number, t: (key: string) => string) => {
    const thresholds = { fast: 50, average: 15 };
    if (speed >= thresholds.fast) return { label: t('statusFast'), color: 'text-status-fast' };
    if (speed >= thresholds.average) return { label: t('statusAverage'), color: 'text-status-average' };
    return { label: t('statusSlow'), color: 'text-status-slow' };
};

const getUploadStatus = (speed: number, t: (key: string) => string) => {
    const thresholds = { fast: 10, average: 3 };
    if (speed >= thresholds.fast) return { label: t('statusFast'), color: 'text-status-fast' };
    if (speed >= thresholds.average) return { label: t('statusAverage'), color: 'text-status-average' };
    return { label: t('statusSlow'), color: 'text-status-slow' };
};

const getPingStatus = (ping: number, t: (key: string) => string) => {
    if (ping <= 30) return { label: t('statusFast'), color: 'text-status-fast' };
    if (ping <= 100) return { label: t('statusAverage'), color: 'text-status-average' };
    return { label: t('statusSlow'), color: 'text-status-slow' };
};

const getJitterStatus = (jitter: number, t: (key: string) => string) => {
    if (jitter <= 5) return { label: t('statusFast'), color: 'text-status-fast' };
    if (jitter <= 30) return { label: t('statusAverage'), color: 'text-status-average' };
    return { label: t('statusSlow'), color: 'text-status-slow' };
};

const SpeedHistoryChart: React.FC<{ history?: number[], statusColor: string }> = ({ history, statusColor }) => {
    if (!history || history.length < 2) return null;

    const width = 100;
    const height = 40;
    const maxVal = Math.max(...history, 1);
    const points = history.map((val, i) => `${(i / (history.length - 1)) * width},${height - (val / maxVal) * height}`).join(' ');

    const gradientId = `chartGradient-${statusColor.replace('text-', '')}`;

    return (
        <div className="mt-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polyline
                    fill={`url(#${gradientId})`}
                    className={statusColor}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
            </svg>
        </div>
    );
};

const ResultsHeader: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void; navigate: Navigate; }> = ({ theme, toggleTheme, navigate }) => {
    const { t } = useTranslation();
    return (
        <header className="w-full">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark py-4">
                    <a href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center gap-3 cursor-pointer">
                        <LogoIcon />
                        <h1 className="text-xl font-bold leading-tight">{t('yourResults')}</h1>
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

const ResultCard: React.FC<{ icon: string; label: string; value: string; unit: string; status: { label: string; color: string; }; tooltip: string; }> = ({ icon, label, value, unit, status, tooltip }) => (
    <div className="relative group bg-card-light dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-text-light/70 dark:text-text-dark/70">{icon}</span>
            <h3 className="text-lg font-medium">{label}</h3>
        </div>
        <p className="text-5xl font-black my-2">
            {value}
            <span className="text-2xl font-bold ml-1 text-text-light/50 dark:text-text-dark/50">{unit}</span>
        </p>
        <div className={`px-3 py-1 text-sm font-bold rounded-full ${status.color} bg-opacity-10 ${status.color.replace('text-', 'bg-')}`}>{status.label}</div>
        <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs bg-subtle-dark text-text-dark rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {tooltip}
        </div>
    </div>
);

const ActivityIndicator: React.FC<{ speed: number; threshold: number; label: string; }> = ({ speed, threshold, label }) => {
    const isCapable = speed >= threshold;
    return (
        <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined !text-xl ${isCapable ? 'text-status-fast' : 'text-status-slow'}`}>
                {isCapable ? 'check_circle' : 'cancel'}
            </span>
            <span className="text-text-light dark:text-text-dark">{label}</span>
        </div>
    );
};

const formatSpeed = (speed: number): string => {
    if (speed < 10) {
        return speed.toFixed(2);
    }
    return speed.toFixed(1);
};

const JitterRangeIndicator: React.FC<{ jitterStatus: { label: string; color: string } }> = ({ jitterStatus }) => {
    const { t } = useTranslation();
    const statuses = [
        { label: t('jitterStatusExcellent'), range: '0-5ms', key: t('statusFast'), color: 'bg-status-fast' },
        { label: t('jitterStatusGood'), range: '6-30ms', key: t('statusAverage'), color: 'bg-status-average' },
        { label: t('jitterStatusPoor'), range: '>30ms', key: t('statusSlow'), color: 'bg-status-slow' },
    ];

    const currentStatusKey = jitterStatus.label;

    return (
        <div>
            <h4 className="font-bold text-text-light dark:text-text-dark">{t('jitterOptimalRange')}</h4>
            <div className="mt-2 flex gap-1 w-full rounded-full overflow-hidden">
                {statuses.map((status, index) => {
                    const isCurrent = status.key === currentStatusKey;
                    const bgColor = isCurrent ? status.color : 'bg-border-light dark:bg-border-dark';
                    
                    return (
                        <div key={index} className="flex-1 text-center group relative">
                            <div className={`h-2 transition-colors ${bgColor}`}></div>
                             <div className={`text-xs mt-1 font-medium ${isCurrent ? 'text-text-light dark:text-text-dark' : 'text-text-light/70 dark:text-text-dark/70'}`}>{status.label}</div>
                            <div className="text-xs text-text-light/50 dark:text-text-dark/50">{status.range}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const JitterExplainedCard: React.FC<{ jitterStatus: { label: string; color: string; } }> = ({ jitterStatus }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">insights</span>
                <h3 className="text-xl font-bold">{t('jitterExplainedTitle')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-text-light dark:text-text-dark">{t('jitterExplainedWhat')}</h4>
                        <p className="mt-1 text-sm text-text-light/80 dark:text-text-dark/80">{t('jitterExplainedWhatText')}</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-text-light dark:text-text-dark">{t('jitterExplainedWhy')}</h4>
                        <p className="mt-1 text-sm text-text-light/80 dark:text-text-dark/80">{t('jitterExplainedWhyText')}</p>
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    <JitterRangeIndicator jitterStatus={jitterStatus} />
                </div>
            </div>
        </div>
    );
};

export const ResultsPage: React.FC<ResultsPageProps> = ({ result, userInfo, onTestAgain, theme, toggleTheme, navigate }) => {
    const { t } = useTranslation();

    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [location, setLocation] = useState('');
    const [feedbackError, setFeedbackError] = useState('');
    const [feedbackSuccess, setFeedbackSuccess] = useState(false);

    const seoTitle = `My Speed Test Result: ${formatSpeed(result.internetSpeed)} Mbps Download, ${formatSpeed(result.uploadSpeed)} Mbps Upload | myareaspeed`;
    const seoDescription = `I just tested my internet speed with myareaspeed! My download speed is ${formatSpeed(result.internetSpeed)} Mbps, upload is ${formatSpeed(result.uploadSpeed)} Mbps, with a ${result.ping}ms ping in ${userInfo.city}. Check your speed and compare with your local community.`;
    useSEOTags(seoTitle, seoDescription);

    const speed = useCountUp(result.internetSpeed);
    const upload = useCountUp(result.uploadSpeed);
    const ping = useCountUp(result.ping);
    const jitter = useCountUp(result.jitter);

    const speedStatus = getSpeedStatus(result.internetSpeed, t);
    const uploadStatus = getUploadStatus(result.uploadSpeed, t);
    const pingStatus = getPingStatus(result.ping, t);
    const jitterStatus = getJitterStatus(result.jitter, t);

    const handleOpenFeedbackModal = () => {
        setRating(0);
        setComment('');
        setLocation(`${userInfo.city}, ${userInfo.country}`);
        setFeedbackError('');
        setFeedbackSuccess(false);
        setIsFeedbackModalOpen(true);
    };

    const handleSubmitFeedback = () => {
        if (rating === 0) {
            setFeedbackError(t('ratingRequiredError'));
            return;
        }
        if (!location.trim()) {
            setFeedbackError(t('locationRequiredError'));
            return;
        }
        if (isCommentSpam(comment)) {
            setFeedbackError(t('spamCommentError'));
            return;
        }
        if (!canSubmitFeedback()) {
            setFeedbackError(t('rateLimitError'));
            return;
        }

        addFeedback({
            location: location.trim(),
            isp: userInfo.isp,
            rating,
            internetSpeed: result.internetSpeed,
            uploadSpeed: result.uploadSpeed,
            ping: result.ping,
            jitter: result.jitter,
            comment,
        });

        recordFeedbackSubmission();
        setFeedbackSuccess(true);
        setFeedbackError('');

        setTimeout(() => {
            setIsFeedbackModalOpen(false);
        }, 2000);
    };
    
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <ResultsHeader theme={theme} toggleTheme={toggleTheme} navigate={navigate} />
                <main className="flex-grow py-8">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                             <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('yourResults')}</h2>
                            <p className="mt-3 max-w-2xl mx-auto text-lg text-text-light/70 dark:text-text-dark/70">{t('resultsSubtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark h-full flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-text-light/70 dark:text-text-dark/70">download</span>
                                    <h3 className="text-lg font-medium">{t('downloadSpeed')}</h3>
                                </div>
                                <p className={`text-7xl font-black my-2 ${speedStatus.color}`}>
                                    {formatSpeed(speed)}
                                    <span className="text-4xl font-bold ml-2 text-text-light/50 dark:text-text-dark/50">Mbps</span>
                                </p>
                                <div className={`self-start px-3 py-1 text-sm font-bold rounded-full ${speedStatus.color} bg-opacity-10 ${speedStatus.color.replace('text-', 'bg-')}`}>{speedStatus.label}</div>
                                <div className="mt-auto">
                                    <SpeedHistoryChart history={result.downloadHistory} statusColor={speedStatus.color} />
                                </div>
                            </div>
                            <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark h-full flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-text-light/70 dark:text-text-dark/70">upload</span>
                                    <h3 className="text-lg font-medium">{t('uploadSpeed')}</h3>
                                </div>
                                <p className={`text-7xl font-black my-2 ${uploadStatus.color}`}>
                                    {formatSpeed(upload)}
                                    <span className="text-4xl font-bold ml-2 text-text-light/50 dark:text-text-dark/50">Mbps</span>
                                </p>
                                <div className={`self-start px-3 py-1 text-sm font-bold rounded-full ${uploadStatus.color} bg-opacity-10 ${uploadStatus.color.replace('text-', 'bg-')}`}>{uploadStatus.label}</div>
                                <div className="mt-auto">
                                    <SpeedHistoryChart history={result.uploadHistory} statusColor={uploadStatus.color} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <ResultCard icon="timer" label={t('ping')} value={ping.toFixed(0)} unit="ms" status={pingStatus} tooltip={t('tooltip_ping')} />
                            <ResultCard icon="moving" label={t('jitter')} value={jitter.toFixed(0)} unit="ms" status={jitterStatus} tooltip={t('tooltip_jitter')} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                             <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
                                <h3 className="text-xl font-bold mb-4">{t('whatYouCanDoTitle')}</h3>
                                <div className="space-y-4">
                                    <ActivityIndicator speed={result.internetSpeed} threshold={25} label={t('activity_streaming_4k')} />
                                    <ActivityIndicator speed={result.internetSpeed} threshold={5} label={t('activity_streaming_hd')} />
                                    <ActivityIndicator speed={result.uploadSpeed} threshold={5} label={t('activity_live_streaming_hd')} />
                                    <ActivityIndicator speed={result.uploadSpeed} threshold={10} label={t('activity_cloud_backup')} />
                                    <ActivityIndicator speed={result.internetSpeed} threshold={20} label={t('activity_gaming')} />
                                </div>
                            </div>
                             <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark">
                                <h3 className="text-xl font-bold mb-4">{t('testDetails')}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <p><strong>{t('isp')}:</strong> {userInfo.isp}</p>
                                    <p><strong>{t('serverLocation')}:</strong> {userInfo.city}, {userInfo.country}</p>
                                    <p><strong>{t('ipAddress')}:</strong> {userInfo.ip}</p>
                                    <p><strong>{t('device')}:</strong> {userInfo.os} / {userInfo.browser}</p>
                                    <p className="col-span-2"><strong>{t('dataUsed', { dataUsed: result.dataUsed })}</strong></p>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <JitterExplainedCard jitterStatus={jitterStatus} />
                            </div>
                        </div>

                        <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark text-center mb-8">
                            <h3 className="text-xl font-bold mb-2">{t('shareExperienceTitle')}</h3>
                            <p className="text-text-light/70 dark:text-text-dark/70 mb-4 max-w-lg mx-auto">{t('shareExperienceSubtitle')}</p>
                            <button onClick={handleOpenFeedbackModal} className="px-6 py-2 font-bold rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                                {t('shareYourExperience')}
                            </button>
                        </div>

                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-text-light/70 dark:text-text-dark/70">groups</span>
                                <h3 className="text-xl font-bold">{t('seeOthersSayingTitle')}</h3>
                            </div>
                            <p className="text-text-light/70 dark:text-text-dark/70 mt-2 mb-4 max-w-lg mx-auto">{t('seeOthersSayingSubtitle')}</p>
                            <button
                                onClick={() => navigate(`/community?q=${encodeURIComponent(userInfo.city)}`)}
                                className="px-6 py-2 font-bold rounded-full border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-subtle-light dark:hover:bg-subtle-dark transition-colors"
                            >
                                {t('exploreCommunityButton', { location: userInfo.city })}
                            </button>
                        </div>


                        <div className="text-center space-y-4">
                            <button onClick={onTestAgain} className="px-10 py-4 text-xl font-bold rounded-full bg-primary text-white hover:opacity-90 transition-opacity">
                                {t('testAgain')}
                            </button>
                        </div>

                    </div>
                </main>
                <AppFooter navigate={navigate} />
            </div>

            {isFeedbackModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-border-light dark:border-border-dark">
                        <button onClick={() => setIsFeedbackModalOpen(false)} className="absolute top-3 right-3 text-text-light/50 dark:text-text-dark/50 hover:text-text-light dark:hover:text-text-dark" aria-label={t('close')}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        {feedbackSuccess ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined !text-6xl text-status-fast">check_circle</span>
                                <h3 className="text-2xl font-bold mt-4">{t('feedbackSubmittedTitle')}</h3>
                                <p className="mt-2 text-text-light/70 dark:text-text-dark/70">{t('feedbackSubmittedText')}</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold mb-4 text-center">{t('shareYourExperience')}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-center">{t('yourRating')}</label>
                                        <div className="flex items-center justify-center gap-2 text-4xl">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110" aria-label={`${star} star rating`}>
                                                    <span className={`material-symbols-outlined ${star <= rating ? 'text-yellow-400' : 'text-text-light/30 dark:text-text-dark/30'}`}>
                                                        star
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="location" className="block text-sm font-medium mb-2">{t('yourLocation')}</label>
                                        <input
                                            id="location"
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder={t('locationPlaceholder')}
                                            className="w-full rounded-lg border border-border-light bg-subtle-light dark:border-border-dark dark:bg-subtle-dark p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="comment" className="block text-sm font-medium mb-2">{t('yourComment')} ({t('optional')})</label>
                                        <textarea
                                            id="comment"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={3}
                                            placeholder={t('commentPlaceholder')}
                                            className="w-full rounded-lg border border-border-light bg-subtle-light dark:border-border-dark dark:bg-subtle-dark p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                                        ></textarea>
                                    </div>
                                    {feedbackError && <p className="text-status-slow text-sm text-center">{feedbackError}</p>}
                                    <button onClick={handleSubmitFeedback} className="w-full px-10 py-3 text-lg font-bold rounded-full bg-primary text-white hover:opacity-90 transition-opacity">
                                        {t('submitFeedback')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};