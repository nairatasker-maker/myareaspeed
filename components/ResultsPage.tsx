
import React, { useState, useEffect, useRef } from 'react';
import type { TestResult, UserInfo, CommunityFeedback, ExperienceTag, TimeOfDay } from '../types';
import type { AppView } from '../App';
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
    setView: (view: AppView) => void;
}

const useCountUp = (end: number, duration: number = 1500) => {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number>();
    const startTimeRef = useRef<number>();

    useEffect(() => {
        const animate = (timestamp: number) => {
            if (startTimeRef.current === undefined) {
                startTimeRef.current = timestamp;
            }
            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const currentVal = progress * end;
            setCount(currentVal);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        startTimeRef.current = undefined; // Reset for re-renders
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

const getPingStatus = (ping: number, t: (key: string) => string) => {
    if (ping <= 30) return { label: t('statusFast'), color: 'text-status-fast' };
    if (ping <= 100) return { label: t('statusAverage'), color: 'text-status-average' };
    return { label: t('statusSlow'), color: 'text-status-slow' };
};

const getRecommendation = (result: TestResult, t: (key: string) => string) => {
    if (result.internetSpeed > 25) return t("recommendation_great_4k");
    if (result.internetSpeed > 10) return t("recommendation_great_hd");
    if (result.internetSpeed > 5) return t("recommendation_good_calls");
    return t("recommendation_slow_video");
};

const ResultsHeader: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void; setView: (view: AppView) => void; }> = ({ theme, toggleTheme, setView }) => {
    const { t } = useTranslation();
    return (
        <header className="w-full">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark py-4">
                    <button onClick={() => setView('home')} className="flex items-center gap-3 cursor-pointer">
                        <LogoIcon />
                        <h1 className="text-xl font-bold leading-tight">{t('appTitle')}</h1>
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

const ResultCard: React.FC<{ metric: any, isVisible: boolean, delay: number }> = ({ metric, isVisible, delay }) => {
    return (
        <div 
            className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="flex flex-col gap-4 rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm h-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-base font-medium text-text-light/70 dark:text-text-dark/70">{metric.title}</p>
                        <p className={`text-sm font-bold ${metric.status.color}`}>{metric.status.label}</p>
                    </div>
                    <span className={`material-symbols-outlined !text-3xl ${metric.status.color}`}>{metric.icon}</span>
                </div>
                <div>
                    <p className="text-5xl font-bold leading-tight tracking-tighter text-text-light dark:text-text-dark">
                        {metric.format(metric.value)}
                        <span className="text-3xl font-medium text-text-light/70 dark:text-text-dark/70 ml-1">{metric.unit}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void; result: TestResult; }> = ({ isOpen, onClose, result }) => {
    const { t } = useTranslation();
    const modalRef = useRef<HTMLDivElement>(null);
    const [isCopied, setIsCopied] = useState(false);

    const shareText = t('shareSummary', {
        speed: result.internetSpeed.toFixed(2),
        ping: result.ping.toFixed(0)
    });

    const shareUrl = `${window.location.origin}${window.location.pathname}?speed=${result.internetSpeed}&ping=${result.ping}&jitter=${result.jitter}&dataUsed=${result.dataUsed}`;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleTwitterShare = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    };

    const handleFacebookShare = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'noopener,noreferrer');
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="relative m-4 w-full max-w-md rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <h2 id="share-modal-title" className="text-xl font-bold">{t('shareResultsTitle')}</h2>
                    <button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-text-light/60 hover:bg-subtle-light dark:text-text-dark/60 dark:hover:bg-subtle-dark">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <p className="mt-4 rounded-lg bg-subtle-light dark:bg-subtle-dark p-4 text-text-light/80 dark:text-text-dark/80">{shareText}</p>
                <div className="mt-6 flex flex-col gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            className="w-full rounded-full border border-border-light bg-subtle-light px-4 py-2 pr-24 text-sm text-text-light/70 dark:border-border-dark dark:bg-subtle-dark dark:text-text-dark/70"
                        />
                        <button onClick={handleCopy} className="absolute inset-y-0 right-0 m-1 flex items-center rounded-full bg-primary px-4 text-sm font-bold text-white transition hover:opacity-90">
                            {isCopied ? t('copied') : t('copyLink')}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleTwitterShare} className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#1DA1F2] text-white transition hover:opacity-90">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.39.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path></svg>
                            {t('shareOnTwitter')}
                        </button>
                        <button onClick={handleFacebookShare} className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#1877F2] text-white transition hover:opacity-90">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
                            {t('shareOnFacebook')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeedbackModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    result: TestResult;
    userInfo: UserInfo;
}> = ({ isOpen, onClose, onSubmit, result, userInfo }) => {
    const { t } = useTranslation();
    const [location, setLocation] = useState(`${userInfo.city}, ${userInfo.country}`);
    const [rating, setRating] = useState(0);
    const [tags, setTags] = useState<ExperienceTag[]>([]);
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('afternoon');
    const [comment, setComment] = useState('');
    const MAX_COMMENT_LENGTH = 280;

    const experienceTags: { id: ExperienceTag; label: string; icon: string }[] = [
        { id: 'streaming', label: t('tag_streaming'), icon: 'movie' },
        { id: 'gaming', label: t('tag_gaming'), icon: 'stadia_controller' },
        { id: 'video_calls', label: t('tag_video_calls'), icon: 'video_chat' },
        { id: 'browsing', label: t('tag_browsing'), icon: 'public' },
        { id: 'wfh', label: t('tag_wfh'), icon: 'work' },
    ];
    
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto' };
    }, [isOpen]);

    const handleTagToggle = (tag: ExperienceTag) => {
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert(t('error_ratingRequired'));
            return;
        }

        if (isCommentSpam(comment)) {
            alert(t('spam_detected'));
            return;
        }

        if (!canSubmitFeedback()) {
            alert(t('rate_limit_error'));
            return;
        }

        const feedback: Omit<CommunityFeedback, 'id' | 'timestamp' | 'helpfulCount'> = {
            location,
            isp: userInfo.isp,
            rating,
            internetSpeed: result.internetSpeed,
            ping: result.ping,
            tags,
            comment,
            timeOfDay,
        };
        addFeedback(feedback);
        recordFeedbackSubmission();
        onSubmit();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="relative m-4 w-full max-w-lg rounded-xl bg-card-light dark:bg-card-dark shadow-2xl transition-all max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-border-light dark:border-border-dark">
                    <h2 className="text-xl font-bold">{t('feedbackModalTitle_share')}</h2>
                    <p className="text-sm text-text-light/70 dark:text-text-dark/70">{t('feedbackModalSubtitle')}</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-bold mb-1">{t('yourLocation')}</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} required className="w-full rounded-md border-border-light bg-subtle-light dark:border-border-dark dark:bg-subtle-dark p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">{t('overallRating')}</label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button type="button" key={star} onClick={() => setRating(star)} className="group rounded-full p-1 transition-colors">
                                    <span className={`material-symbols-outlined !text-4xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 group-hover:text-yellow-400/50'}`}>star</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">{t('experienceTags')}</label>
                        <div className="flex flex-wrap gap-2">
                            {experienceTags.map(tag => (
                                <button type="button" key={tag.id} onClick={() => handleTagToggle(tag.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${tags.includes(tag.id) ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-border-light dark:border-border-dark hover:bg-subtle-light dark:hover:bg-subtle-dark'}`}>
                                    <span className="material-symbols-outlined !text-base">{tag.icon}</span>
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-bold mb-2">{t('timeOfDay')}</label>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(['morning', 'afternoon', 'evening', 'night'] as TimeOfDay[]).map(time => (
                                <button type="button" key={time} onClick={() => setTimeOfDay(time)} className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${timeOfDay === time ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-border-light dark:border-border-dark hover:bg-subtle-light dark:hover:bg-subtle-dark'}`}>
                                    {t(`time_${time}`)}
                                </button>
                            ))}
                         </div>
                    </div>
                    <div>
                        <label htmlFor="feedback-comment" className="block text-sm font-bold mb-1">{t('additionalComments')}</label>
                        <textarea id="feedback-comment" value={comment} onChange={e => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))} rows={3} className="w-full rounded-md border-border-light bg-subtle-light dark:border-border-dark dark:bg-subtle-dark p-2" placeholder={t('commentPlaceholder')}></textarea>
                        <p className="text-right text-xs text-text-light/60 dark:text-text-dark/60">{comment.length}/{MAX_COMMENT_LENGTH}</p>
                    </div>
                </form>
                <div className="p-6 mt-auto border-t border-border-light dark:border-border-dark flex gap-4">
                    <button type="button" onClick={onClose} className="w-full flex h-11 items-center justify-center gap-2 rounded-full bg-subtle-light dark:bg-subtle-dark px-6 text-base font-bold transition-opacity hover:opacity-90">{t('cancel')}</button>
                    <button type="submit" onClick={handleSubmit} className="w-full flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-bold text-white transition-opacity hover:opacity-90">{t('submitFeedback')}</button>
                </div>
            </div>
        </div>
    );
};

const ResultsChart: React.FC<{ result: TestResult; isVisible: boolean; t: (key: string) => string }> = ({ result, isVisible, t }) => {
    
    const MAX_SPEED = 150;    // Mbps, for scaling
    const MAX_PING = 150;    // ms, for scaling

    const speedStatus = getSpeedStatus(result.internetSpeed, t);
    const pingStatus = getPingStatus(result.ping, t);

    const speedWidth = Math.min((result.internetSpeed / MAX_SPEED) * 100, 100);
    const pingWidth = Math.min((result.ping / MAX_PING) * 100, 100);

    const Bar: React.FC<{ label: string, value: string, width: number, colorClass: string, delay: number }> = ({ label, value, width, colorClass, delay }) => (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <span className="font-medium text-text-light/80 dark:text-text-dark/80">{label}</span>
                <span className="font-bold text-lg text-text-light dark:text-text-dark">{value}</span>
            </div>
            <div className="w-full bg-subtle-light dark:bg-subtle-dark rounded-full h-3 overflow-hidden">
                <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${colorClass.replace('text-', 'bg-')}`}
                    style={{ 
                        width: isVisible ? `${width}%` : '0%',
                        transitionDelay: `${delay}ms`
                    }}
                ></div>
            </div>
        </div>
    );

    return (
        <div 
             className={`w-full rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
             style={{ transitionDelay: '450ms' }} // Stagger after the main cards
        >
            <div className="space-y-6">
                <Bar 
                    label={t('internetSpeed')} 
                    value={`${result.internetSpeed.toFixed(2)} Mbps`}
                    width={speedWidth}
                    colorClass={speedStatus.color}
                    delay={0}
                />
                <Bar 
                    label={t('ping')} 
                    value={`${result.ping.toFixed(0)} ms`}
                    width={pingWidth}
                    colorClass={pingStatus.color}
                    delay={150}
                />
            </div>
        </div>
    );
};

export const ResultsPage: React.FC<ResultsPageProps> = ({ result, userInfo, onTestAgain, theme, toggleTheme, setView }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const { t } = useTranslation();
    
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleFeedbackSubmit = () => {
        setFeedbackSubmitted(true);
    };

    const internetStatus = getSpeedStatus(result.internetSpeed, t);
    const pingStatus = getPingStatus(result.ping, t);

    const animatedSpeed = useCountUp(result.internetSpeed, 1200);
    const animatedPing = useCountUp(result.ping, 1000);

    const metrics = [
        {
            id: 'speed',
            title: t('internetSpeed'),
            value: animatedSpeed,
            unit: 'Mbps',
            status: internetStatus,
            icon: 'speed',
            format: (val: number) => val.toFixed(2),
        },
        {
            id: 'ping',
            title: t('ping'),
            value: animatedPing,
            unit: 'ms',
            status: pingStatus,
            icon: 'network_check',
            format: (val: number) => val.toFixed(0),
        },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <ResultsHeader theme={theme} toggleTheme={toggleTheme} setView={setView}/>
            <main className="flex-grow">
                <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-10 text-center">
                        <div className="flex flex-col gap-2">
                            <p className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">{t('yourResults')}</p>
                            <p className="text-lg text-text-light/70 dark:text-text-dark/70">{t('resultsSubtitle')}</p>
                        </div>
                        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
                           {metrics.map((metric, index) => (
                               <ResultCard key={metric.id} metric={metric} isVisible={isMounted} delay={index * 150} />
                           ))}
                        </div>

                        <ResultsChart result={result} isVisible={isMounted} t={t} />

                        <div className="w-full rounded-xl bg-card-light dark:bg-card-dark p-8 shadow-sm">
                            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined !text-4xl">check_circle</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-lg font-bold leading-tight">{getRecommendation(result, t)}</p>
                                    <p className="text-base text-text-light/70 dark:text-text-dark/70">{t('dataUsed', { dataUsed: result.dataUsed.toFixed(2) })}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full rounded-xl bg-card-light dark:bg-card-dark p-6 shadow-sm">
                             {feedbackSubmitted ? (
                                <div className="flex flex-col items-center justify-center py-4 text-center">
                                    <span className="material-symbols-outlined !text-4xl text-primary">thumb_up</span>
                                    <p className="mt-2 font-bold">{t('thanksForFeedback')}</p>
                                    <button onClick={() => setView('community')} className="mt-2 text-link-light dark:text-link-dark hover:underline">{t('viewCommunityFeedback')}</button>
                                </div>
                             ) : (
                                <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-text-light dark:text-text-dark">{t('shareYourExperience')}</h3>
                                        <p className="text-text-light/70 dark:text-text-dark/70">{t('shareExperienceSubtitle')}</p>
                                    </div>
                                    <button onClick={() => setIsFeedbackModalOpen(true)} className="flex-shrink-0 rounded-full bg-primary px-6 py-2 text-base font-bold text-white transition-opacity hover:opacity-90">
                                        {t('shareFeedbackButton')}
                                    </button>
                                </div>
                             )}
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={onTestAgain} className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-white transition-opacity hover:opacity-90">
                                <span className="material-symbols-outlined">refresh</span>
                                {t('testAgain')}
                            </button>
                            <button onClick={() => setIsShareModalOpen(true)} className="flex h-12 w-12 items-center justify-center rounded-full bg-card-light dark:bg-card-dark text-text-light/70 dark:text-text-dark/70 shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={t('share')}>
                                <span className="material-symbols-outlined">share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter setView={setView} />
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} result={result} />
            <FeedbackModal 
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                onSubmit={handleFeedbackSubmit}
                result={result}
                userInfo={userInfo}
            />
        </div>
    );
};