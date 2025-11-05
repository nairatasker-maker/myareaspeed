import React, { useEffect, useState, useRef } from 'react';
import type { TestStage, UserInfo } from '../types';
import { useTranslation } from '../context/i18n';

interface TestingPageProps {
    stage: TestStage;
    downloadSpeed: number;
    uploadSpeed: number;
    uploadProgress: number;
    ping: number;
    userInfo: UserInfo;
    startTest: () => void;
}

const ESTIMATED_PING_DURATION = 2.5; // seconds
const ESTIMATED_DOWNLOAD_DURATION = 10;
const ESTIMATED_UPLOAD_DURATION = 10;
const TOTAL_ESTIMATED_DURATION = ESTIMATED_PING_DURATION + ESTIMATED_DOWNLOAD_DURATION + ESTIMATED_UPLOAD_DURATION;


const CircularGauge: React.FC<{ value: number, max: number }> = ({ value, max }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / max, 1);
    const offset = circumference * (1 - progress);

    return (
        <svg className="absolute inset-0" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r={radius} stroke="currentColor" strokeWidth="4" className="text-border-light dark:text-border-dark opacity-50"></circle>
            <circle
                className="transform -rotate-90 origin-center transition-all duration-300 text-primary"
                cx="50"
                cy="50"
                fill="none"
                r={radius}
                stroke="currentColor"
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
    downloadSpeed,
    uploadSpeed,
    uploadProgress,
    ping,
    userInfo,
    startTest,
}) => {
    const { t } = useTranslation();
    const [overallProgress, setOverallProgress] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(Math.ceil(TOTAL_ESTIMATED_DURATION));
    const testStartTimeRef = useRef<number>();

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
                const elapsedMs = Date.now() - testStartTimeRef.current!;
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
                        stageProgress = (uploadProgress / 100) * uploadWeight;
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

    }, [stage, uploadProgress]);


    const currentSpeed = stage === 'download' ? downloadSpeed : uploadSpeed;
    const stageText = stage !== 'idle' && stage !== 'complete' && stage !== 'error' ? t(`stage_${stage}`) : '';
    const speedText = stage === 'ping' ? ping.toFixed(0) : currentSpeed.toFixed(2);
    const unitText = stage === 'ping' ? 'ms' : 'Mbps';
    const gaugeValue = stage === 'ping' ? ping : currentSpeed;
    const gaugeMax = stage === 'ping' ? 100 : stage === 'download' ? 100 : 50;


    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex flex-1 justify-center items-center py-5">
                <div className="flex flex-col w-full max-w-4xl flex-1 px-4 sm:px-6 lg:px-8 items-center justify-center">
                    <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center">
                       <CircularGauge value={gaugeValue} max={gaugeMax} />
                        <div className="z-10 flex flex-col items-center justify-center text-center">
                            <p className="text-text-light/70 dark:text-text-dark/70 text-base font-medium">{stageText}</p>
                            <p className="text-6xl sm:text-7xl font-black text-text-light dark:text-text-dark my-2">{speedText}</p>
                            <p className="text-text-light/70 dark:text-text-dark/70 text-base font-medium">{unitText}</p>
                        </div>
                    </div>
                    
                    {(stage !== 'idle' && stage !== 'complete' && stage !== 'error') && (
                         <div className="w-full max-w-sm mt-8">
                            <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-2">
                                <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-200 ease-linear"
                                    style={{ width: `${overallProgress.toFixed(0)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-end items-center mt-2">
                                <p className="text-sm text-text-light/70 dark:text-text-dark/70">
                                    {t('estimatedTimeRemaining', { seconds: timeRemaining })}
                                </p>
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
                            <p className="text-2xl font-bold text-text-light dark:text-text-dark">{downloadSpeed.toFixed(2)} <span className="text-base font-medium text-text-light/70 dark:text-text-dark/70">Mbps</span></p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-text-light/70 dark:text-text-dark/70">{t('uploadSpeed').toUpperCase()}</p>
                            <p className="text-2xl font-bold text-text-light dark:text-text-dark">{uploadSpeed.toFixed(2)} <span className="text-base font-medium text-text-light/70 dark:text-text-dark/70">Mbps</span></p>
                        </div>
                    </div>

                    <div className="bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm w-full max-w-2xl mt-12">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                            <div className="flex justify-between sm:justify-start sm:gap-6 py-2">
                                <p className="text-primary text-sm font-medium">{t('isp')}</p>
                                <p className="text-sm font-normal text-right sm:text-left text-text-light dark:text-text-dark">{userInfo.isp}</p>
                            </div>
                             <div className="flex justify-between sm:justify-start sm:gap-6 py-2">
                                <p className="text-primary text-sm font-medium">{t('serverLocation')}</p>
                                <p className="text-sm font-normal text-right sm:text-left text-text-light dark:text-text-dark">{userInfo.city}, {userInfo.country}</p>
                            </div>
                            <div className="flex justify-between sm:justify-start sm:gap-6 py-2">
                                <p className="text-primary text-sm font-medium">{t('ipAddress')}</p>
                                <p className="text-sm font-normal text-right sm:text-left text-text-light dark:text-text-dark">{userInfo.ip}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};