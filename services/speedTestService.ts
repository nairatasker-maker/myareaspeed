
const DOWNLOAD_URL = 'https://speed.cloudflare.com/__down';
const UPLOAD_URL = 'https://speed.cloudflare.com/__up';

export async function testPing(): Promise<{ ping: number; jitter: number }> {
    const results: number[] = [];
    try {
        for (let i = 0; i < 10; i++) {
            const start = performance.now();
            await fetch(`${DOWNLOAD_URL}?bytes=1`, {
                method: 'GET',
                cache: 'no-store', // Use no-store for more accurate ping
                mode: 'cors',
            });
            const end = performance.now();
            results.push(Math.round(end - start));
            if (i < 9) await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (results.length < 3) {
            return { ping: 0, jitter: 0 };
        }

        results.sort((a, b) => a - b);
        const trimmed = results.slice(1, results.length - 1);
        const avgPing = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
        const jitter = Math.round(Math.max(...trimmed) - Math.min(...trimmed));
        return { ping: avgPing, jitter };
    } catch (e) {
        console.error("Ping test failed", e);
        return { ping: 0, jitter: 0 };
    }
}

export async function testDownloadSpeed(onProgress: (speedMbps: number) => void, onDataUsed: (bytes: number) => void): Promise<number> {
    const testDuration = 10000; // 10 seconds
    const testUrls = [
        `${DOWNLOAD_URL}?bytes=25000000`, // 25MB
        `${DOWNLOAD_URL}?bytes=50000000`, // 50MB
        `${DOWNLOAD_URL}?bytes=100000000`, // 100MB
    ];

    let totalBytes = 0;
    const startTime = Date.now();
    let isRunning = true;

    const timeout = setTimeout(() => { isRunning = false; }, testDuration);

    const downloads = testUrls.map(async (url) => {
        try {
            const response = await fetch(url, { cache: 'no-store' });
            const reader = response.body?.getReader();
            if (!reader) return;

            while (isRunning) {
                const { done, value } = await reader.read();
                if (done) break;
                totalBytes += value.length;
                
                const elapsed = (Date.now() - startTime) / 1000;
                if (elapsed > 0) {
                    const speedMbps = (totalBytes * 8) / elapsed / 1000000;
                    onProgress(speedMbps);
                    onDataUsed(totalBytes);
                }
            }
        } catch (e) {
            console.warn(`Download from ${url} failed`, e);
        }
    });

    await Promise.all(downloads);
    clearTimeout(timeout);
    isRunning = false;

    const totalTime = (Date.now() - startTime) / 1000;
    if (totalTime === 0) return 0;

    const finalSpeedMbps = (totalBytes * 8) / totalTime / 1000000;
    onProgress(finalSpeedMbps);
    onDataUsed(totalBytes);
    return finalSpeedMbps;
}

export async function testUploadSpeed(onProgress: (speedMbps: number) => void, onUploadProgress: (progress: number) => void, onDataUsed: (bytes: number) => void): Promise<number> {
    const testDuration = 10000;
    const chunkSize = 1024 * 1024;
    const parallelConnections = 4;
    const data = new Blob([new Uint8Array(chunkSize)], { type: 'application/octet-stream' });

    let totalBytesUploaded = 0;
    const startTime = Date.now();
    const testEndTime = startTime + testDuration;

    let isTestRunning = true;

    const uploadWorker = async () => {
        while (isTestRunning && Date.now() < testEndTime) {
            try {
                const response = await fetch(UPLOAD_URL, {
                    method: 'POST',
                    body: data,
                    headers: { 'Content-Type': 'application/octet-stream' },
                    mode: 'cors',
                    signal: AbortSignal.timeout(5000),
                });
                if (response.ok) {
                    totalBytesUploaded += chunkSize;
                } else {
                    console.warn(`Upload worker failed with status: ${response.status}`);
                    break;
                }
            } catch (e) {
                console.warn("Upload worker failed", e);
                break;
            }
        }
    };

    const progressUpdater = () => {
        if (!isTestRunning) return;
        
        const now = Date.now();
        const elapsedMs = now - startTime;
        const isDone = now >= testEndTime;

        if (elapsedMs > 0) {
            const speedMbps = (totalBytesUploaded * 8) / (elapsedMs / 1000) / 1000000;
            onProgress(speedMbps);
            onDataUsed(totalBytesUploaded);
            const progress = Math.min((elapsedMs / testDuration) * 100, 100);
            onUploadProgress(progress);
        }

        if (isDone) {
            isTestRunning = false;
        } else {
            setTimeout(progressUpdater, 250);
        }
    };
    
    // Start progress updater
    setTimeout(progressUpdater, 250);

    const workers = Array(parallelConnections).fill(0).map(uploadWorker);
    await Promise.all(workers);

    isTestRunning = false; // Stop progress updater if workers finish early

    const actualDurationMs = Math.max(Date.now() - startTime, 1);

    const finalSpeedMbps = (totalBytesUploaded * 8) / (actualDurationMs / 1000) / 1000000;
    
    // Final update
    onProgress(finalSpeedMbps);
    onDataUsed(totalBytesUploaded);
    onUploadProgress(100);

    return finalSpeedMbps;
}
