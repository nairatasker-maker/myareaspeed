
import { useState, useCallback, useRef } from 'react';
import type { TestResult, TestStage } from '../types';
import { testPing, testDownloadSpeed, testUploadSpeed } from '../services/speedTestService';

export const useSpeedTest = (onComplete: (result: TestResult) => void) => {
    const [stage, setStage] = useState<TestStage>('idle');
    const [ping, setPing] = useState(0);
    const [jitter, setJitter] = useState(0);
    const [internetSpeed, setInternetSpeed] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const dataUsedRef = useRef(0);
    const downloadHistoryRef = useRef<number[]>([]);
    const uploadHistoryRef = useRef<number[]>([]);
    
    const startTest = useCallback(async () => {
        setStage('ping');
        setError(null);
        setPing(0);
        setJitter(0);
        setInternetSpeed(0);
        setUploadSpeed(0);
        dataUsedRef.current = 0;
        downloadHistoryRef.current = [];
        uploadHistoryRef.current = [];
        
        try {
            const { ping, jitter } = await testPing();
            setPing(ping);
            setJitter(jitter);

            setStage('download');

            const finalDownloadSpeed = await testDownloadSpeed(
                (speed) => {
                    setInternetSpeed(speed);
                    downloadHistoryRef.current.push(speed);
                },
                (bytes) => dataUsedRef.current = bytes
            );

            setInternetSpeed(finalDownloadSpeed);

            setStage('upload');
            const finalUploadSpeed = await testUploadSpeed(
                (speed) => {
                    setUploadSpeed(speed);
                    uploadHistoryRef.current.push(speed);
                },
                (bytes) => { /* Not tracking upload data usage separately for now */ }
            );
            setUploadSpeed(finalUploadSpeed);
            
            setStage('complete');
            
            const totalDataUsedMB = dataUsedRef.current / (1024 * 1024);

            onComplete({
                ping,
                jitter,
                internetSpeed: finalDownloadSpeed,
                uploadSpeed: finalUploadSpeed,
                dataUsed: parseFloat(totalDataUsedMB.toFixed(2)),
                timestamp: Date.now(),
                downloadHistory: downloadHistoryRef.current,
                uploadHistory: uploadHistoryRef.current,
            });

        } catch (err) {
            console.error("Speed test failed", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check your connection and try again.');
            setStage('error');
        }
    }, [onComplete]);

    const resetTest = useCallback(() => {
        setStage('idle');
        setPing(0);
        setJitter(0);
        setInternetSpeed(0);
        setUploadSpeed(0);
        setError(null);
        dataUsedRef.current = 0;
    }, []);

    return { stage, ping, jitter, internetSpeed, uploadSpeed, error, startTest, resetTest };
};