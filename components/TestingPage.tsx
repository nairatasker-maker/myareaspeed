

import React, { useEffect, useState, useRef } from 'react';
import type { TestStage, UserInfo } from '../types';
import { useTranslation } from '../context/i18n';

interface TestingPageProps {
    stage: TestStage;
    internetSpeed: number;
    uploadSpeed: number;
    ping: number;
    userInfo: UserInfo;
    startTest: () => void;
    error: string | null;
    onRetry: () => void;
}

const ESTIMATED_PING_DURATION = 2.5; // seconds
const ESTIMATED_DOWNLOAD_DURATION = 10;
const ESTIMATED_UPLOAD_DURATION = 10;
const TOTAL_ESTIMATED_DURATION = ESTIMATED_PING_DURATION + ESTIMATED_DOWNLOAD_DURATION + ESTIMATED_UPLOAD_DURATION;


const CircularGauge: React.FC<{ value: number, max: number }> = ({ value, max }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progress = max > 0 ? Math.min(value / max, 1) : 0;
    const offset = circumference * (1 - progress);

    return (
        <svg className="absolute inset-0" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100">
            <defs>
                <linearGradient id="speedGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
            </defs>
            <circle cx="50" cy="50" fill="none" r={radius} stroke="currentColor" strokeWidth="4" className="text-border-light dark:text-border-dark opacity-50"></circle>
            <circle
                className="transform -rotate-90 origin-center transition-all duration-300"
                cx="50"
                cy="50"
                fill="none"
                r={radius}
                stroke="url(#speedGradient)"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeWidth="4"
                strokeLinecap="round"
            ></circle>
        </svg>
    );
};


export const TestingPage: React.FC<TestingPageProps> = ({
    stage,
    internetSpeed,
    uploadSpeed,
    ping,
    userInfo,
    startTest,
    error,
    onRetry,
}) => {
    const { t } = useTranslation();
    const [overallProgress, setOverallProgress] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(Math.ceil(TOTAL_ESTIMATED_DURATION));
    const testStartTimeRef = useRef<number | undefined>(undefined);
    const [gaugeMaxSpeed, setGaugeMaxSpeed] = useState(50);

    const currentMainSpeed = stage === 'download' ? internetSpeed : uploadSpeed;

    useEffect(() => {
        if (stage === 'download' || stage === 'upload') {
            if (currentMainSpeed > gaugeMaxSpeed) {
                if (currentMainSpeed > 500) setGaugeMaxSpeed(1000);
                else if (currentMainSpeed > 250) setGaugeMaxSpeed(500);
                else if (currentMainSpeed > 100) setGaugeMaxSpeed(250);
                else if (currentMainSpeed > 50) setGaugeMaxSpeed(100);
            }
        } else if (stage === 'idle' || stage === 'error' || stage === 'complete') {
             setGaugeMaxSpeed(50);
        }
    }, [currentMainSpeed, stage, gaugeMaxSpeed]);

    useEffect(() => {
        if (stage === 'idle') {
            startTest();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stage, startTest]);
    
    useEffect(() => {
        let intervalId: number;

        if (stage !== 'idle' && stage !== 'complete' && stage !== 'error') {
            if (!testStartTimeRef.current) {
                testStartTimeRef.current = Date.now();
            }

            intervalId = window.setInterval(() => {
                if (!testStartTimeRef.current) return;
                const elapsedMs = Date.now() - testStartTimeRef.current;
                const elapsedSeconds = elapsedMs / 1000;

                const pingWeight = ESTIMATED_PING_DURATION / TOTAL_ESTIMATED_DURATION;
                const downloadWeight = ESTIMATED_DOWNLOAD_DURATION / TOTAL_ESTIMATED_DURATION;
                const uploadWeight = ESTIMATED_UPLOAD_DURATION / TOTAL_ESTIMATED_DURATION;

                let baseProgress = 0;
                let stageProgress = 0;

                switch(stage) {
                    case 'ping': {
                        const elapsedInStage = elapsedSeconds;
                        stageProgress = Math.min(elapsedInStage / ESTIMATED_PING_DURATION, 1) * pingWeight;
                        break;
                    }
                    case 'download': {
                        baseProgress = pingWeight;
                        const elapsedInStage = elapsedSeconds - ESTIMATED_PING_DURATION;
                        stageProgress = Math.min(elapsedInStage / ESTIMATED_DOWNLOAD_DURATION, 1) * downloadWeight;
                        break;
                    }
                    case 'upload': {
                        baseProgress = pingWeight + downloadWeight;
                        const elapsedInStage = elapsedSeconds - (ESTIMATED_PING_DURATION + ESTIMATED_DOWNLOAD_DURATION);
                        stageProgress = Math.min(elapsedInStage / ESTIMATED_UPLOAD_DURATION, 1) * uploadWeight;
                        break;
                    }
                }

                const progressPercentage = (baseProgress + stageProgress) * 100;
                
                setOverallProgress(Math.min(progressPercentage, 100));
                setTimeRemaining(Math.max(0, Math.ceil(TOTAL_ESTIMATED_DURATION - elapsedSeconds)));

            }, 200);

        } else {
            testStartTimeRef.current = undefined;
            if (stage === 'complete' || stage === 'error') {
                setOverallProgress(100);
                setTimeRemaining(0);
            } else { // idle
                setOverallProgress(0);
                setTimeRemaining(Math.ceil(TOTAL_ESTIMATED_DURATION));
            }
        }
        
        return () => {
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        };

    }, [stage]);

    const getSpeedColorClass = (speed: number): string => {
        const thresholds = { fast: 50, average: 15 };
        if (speed >= thresholds.fast) return 'text-status-fast';
        if (speed >= thresholds.average) return 'text-status-average';
        return 'text-status-slow';
    };
    
    const formatSpeed = (speed: number): string => {
        if (speed < 10) {
            return speed.toFixed(2);
        }
        return speed.toFixed(1);
    };

    if (stage === 'error') {
        return (
            <div className="flex flex-col min-h-screen">
                <main className="flex flex-1 justify-center items-center py-5">
                    <div className="flex flex-col w-full max-w-md flex-1 px-4 sm:px-6 lg:px-8 items-center justify-center text-center">
                        <div className="p-8 rounded-xl bg-card-light dark:bg-card-dark border border-status-slow shadow-lg">
                            <span className="material-symbols-outlined !text-5xl text-status-slow">wifi_off</span>
                            <h2 className="text-2xl font-bold mt-4">{t('testFailedTitle')}</h2>
                            <p className="mt-2 text-text-light/80 dark:text-text-dark/80">{error}</p>
                            <button
                                onClick={onRetry}
                                className="mt-6 rounded-full bg-primary px-8 py-3 text-lg font-bold text-white transition-opacity hover:opacity-90"
                            >
                                {t('testAgain')}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const stageText = stage !== 'idle' && stage !== 'complete' ? t(`stage_${stage}`) : '';
    const speedText = stage === 'ping' ? ping.toFixed(0) : formatSpeed(currentMainSpeed);
    const unitText = stage === 'ping' ? 'ms' : 'Mbps';
    const gaugeValue = stage === 'ping' ? ping : currentMainSpeed;
    const gaugeMax = stage === 'ping' 
        ? 100 // max ping of 100ms
        : gaugeMaxSpeed;
    const speedColorClass = stage === 'download' || stage === 'upload'
        ? getSpeedColorClass(currentMainSpeed) 
        : 'text-text-light dark:text-text-dark';


    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex flex-1 justify-center items-center py-5">
                <div className="flex flex-col w-full max-w-4xl flex-1 px-4 sm:px-6 lg:px-8 items-center justify-center">
                    <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center">
                       <CircularGauge value={gaugeValue} max={gaugeMax} />
                        <div className="z-10 flex flex-col items-center justify-center text-center">
                            <p className="text-text-light/70 dark:text-text-dark/70 text-base font-medium">{stageText}</p>
                            <p className={`text-6xl sm:text-7xl font-black my-2 transition-colors duration-300 ${speedColorClass}`}>{speedText}</p>
                            <p className="text-text-light/70 dark:text-text-dark/70 text-base font-medium">{unitText}</p>
                        </div>
                    </div>
                    
                    {(stage !== 'idle' && stage !== 'complete') && (
                         <div className="w-full max-w-sm mt-8">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-medium text-text-light/80 dark:text-text-dark/80">
                                    {t('testingInProgress')}
                                </p>
                                <p className="text-sm text-text-light/70 dark:text-text-dark/70">
                                    {t('estimatedTimeRemaining', { seconds: timeRemaining })}
                                </p>
                            </div>
                            <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-3 overflow-hidden">
                                <div 
                                    className="bg-primary h-3 rounded-full transition-all duration-200 ease-linear"
                                    style={{ width: `${overallProgress.toFixed(0)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}


                     <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-lg">
                        <div className="text-center">
                            <p className="text-sm font-medium text-text-light/70 dark:text-text-dark/70">{t('ping').toUpperCase()}</p>
                            <p className="text-2xl font-bold text-text-light dark:text-text-dark">{ping.toFixed(0)} <span className="text-base font-medium text-text-light/70 dark:text-text-dark/70">ms</span></p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-text-light/70 dark:text-text-dark/70">{t('downloadSpeed').toUpperCase()}</p>
                            <p className="text-2xl font-bold text-text-light dark:text-text-dark">{formatSpeed(internetSpeed)} <span className="text-base font-medium text-text-light/70 dark:text-text-dark/70">Mbps</span></p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-text-light/70 dark:text-text-dark/70">{t('uploadSpeed').toUpperCase()}</p>
                            <p className="text-2xl font-bold text-text-light dark:text-text-dark">{formatSpeed(uploadSpeed)} <span className="text-base font-medium text-text-light/70 dark:text-text-dark/70">Mbps</span></p>
                        </div>
                    </div>

                    <div className="bg-card-light dark:bg-card-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm w-full max-w-2xl mt-12">
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
                            <div className="py-2">
                                <p className="text-primary text-sm font-medium">{t('isp')}</p>
                                <p className="text-sm font-normal text-text-light dark:text-text-dark truncate" title={userInfo.isp}>{userInfo.isp}</p>
                            </div>
                            <div className="py-2">
                                <p className="text-primary text-sm font-medium">{t('serverLocation')}</p>
                                <p className="text-sm font-normal text-text-light dark:text-text-dark truncate" title={`${userInfo.city}, ${userInfo.country}`}>{userInfo.city}, {userInfo.country}</p>
                            </div>
                            <div className="py-2">
                                <p className="text-primary text-sm font-medium">{t('device')}</p>
                                <p className="text-sm font-normal text-text-light dark:text-text-dark truncate" title={`${userInfo.os} / ${userInfo.browser}`}>{userInfo.os} / {userInfo.browser}</p>
                            </div>
                            <div className="py-2">
                                <p className="text-primary text-sm font-medium">{t('ipAddress')}</p>
                                <p className="text-sm font-normal text-text-light dark:text-text-dark truncate" title={userInfo.ip}>{userInfo.ip}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};