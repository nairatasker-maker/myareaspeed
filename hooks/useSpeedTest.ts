
import { useState, useCallback, useRef } from 'react';
import type { TestResult, TestStage } from '../types';
import { testPing, testDownloadSpeed, testUploadSpeed } from '../services/speedTestService';

export const useSpeedTest = (onComplete: (result: TestResult) => void) => {
    const [stage, setStage] = useState<TestStage>('idle');
    const [ping, setPing] = useState(0);
    const [jitter, setJitter] = useState(0);
    const [downloadSpeed, setDownloadSpeed] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState(0);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const dataUsedRef = useRef({ download: 0, upload: 0 });

    const startTest = useCallback(async () => {
        setStage('ping');
        setError(null);
        setPing(0);
        setJitter(0);
        setDownloadSpeed(0);
        setUploadSpeed(0);
        setUploadProgress(0);
        dataUsedRef.current = { download: 0, upload: 0 };
        
        try {
            const { ping, jitter } = await testPing();
            setPing(ping);
            setJitter(jitter);

            setStage('download');
            const finalDownloadSpeed = await testDownloadSpeed(
                (speed) => setDownloadSpeed(speed),
                (bytes) => dataUsedRef.current.download = bytes
            );
            setDownloadSpeed(finalDownloadSpeed);
            
            setStage('upload');
            const finalUploadSpeed = await testUploadSpeed(
                (speed) => setUploadSpeed(speed),
                (progress) => setUploadProgress(progress),
                (bytes) => dataUsedRef.current.upload = bytes
            );
            setUploadSpeed(finalUploadSpeed);

            setStage('complete');
            
            const totalDataUsedMB = (dataUsedRef.current.download + dataUsedRef.current.upload) / (1024 * 1024);

            onComplete({
                ping,
                jitter,
                downloadSpeed: parseFloat(finalDownloadSpeed.toFixed(2)),
                uploadSpeed: parseFloat(finalUploadSpeed.toFixed(2)),
                dataUsed: parseFloat(totalDataUsedMB.toFixed(2)),
                timestamp: Date.now(),
            });

        } catch (err) {
            console.error(err);
            setError("The speed test failed. Please try again.");
            setStage('error');
        }
    }, [onComplete]);

    return {
        stage,
        ping,
        jitter,
        downloadSpeed,
        uploadSpeed,
        uploadProgress,
        error,
        startTest,
    };
};