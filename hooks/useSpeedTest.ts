
import { useState, useCallback, useRef } from 'react';
import type { TestResult, TestStage } from '../types';
import { testPing, testDownloadSpeed } from '../services/speedTestService';

export const useSpeedTest = (onComplete: (result: TestResult) => void) => {
    const [stage, setStage] = useState<TestStage>('idle');
    const [ping, setPing] = useState(0);
    const [jitter, setJitter] = useState(0);
    const [internetSpeed, setInternetSpeed] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const dataUsedRef = useRef({ download: 0 });

    const startTest = useCallback(async () => {
        setStage('ping');
        setError(null);
        setPing(0);
        setJitter(0);
        setInternetSpeed(0);
        dataUsedRef.current = { download: 0 };
        
        try {
            const { ping, jitter } = await testPing();
            setPing(ping);
            setJitter(jitter);

            setStage('download');
            const finalDownloadSpeed = await testDownloadSpeed(
                (speed) => setInternetSpeed(speed),
                (bytes) => dataUsedRef.current.download = bytes
            );
            setInternetSpeed(finalDownloadSpeed);
            
            setStage('complete');
            
            const totalDataUsedMB = (dataUsedRef.current.download) / (1024 * 1024);

            onComplete({
                ping,
                jitter,
                internetSpeed: parseFloat(finalDownloadSpeed.toFixed(2)),
                dataUsed: parseFloat(totalDataUsedMB.toFixed(2)),
                timestamp: Date.now(),
            });

        // Fix: Complete the catch block and add a return statement for the hook.
        } catch (err) {
            console.error("Speed test failed", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setStage('error');
        }
    }, [onComplete]);

    const resetTest = useCallback(() => {
        setStage('idle');
        setPing(0);
        setJitter(0);
        setInternetSpeed(0);
        setError(null);
        dataUsedRef.current = { download: 0 };
    }, []);

    return { stage, ping, jitter, internetSpeed, error, startTest, resetTest };
};
