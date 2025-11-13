export async function testPing(): Promise<{ ping: number; jitter: number }> {
    // Use a server that is known to be highly available and allows CORS/range requests.
    const PING_URL = 'https://cachefly.cachefly.net/10mb.test';
    const results: number[] = [];
    const numPings = 10;
    const pingTimeout = 8000; // Increased timeout for slower connections

    for (let i = 0; i < numPings; i++) {
        try {
            const start = performance.now();
            // Add a random query string to prevent any caching between requests.
            const randomUrl = `${PING_URL}?r=${Math.random()}`;
            await fetch(randomUrl, {
                method: 'GET',
                cache: 'no-store',
                mode: 'cors',
                // A 1-byte GET is a very reliable way to measure latency.
                headers: {
                    'Range': 'bytes=0-0'
                },
                // An AbortController can prevent hanging requests on very slow networks.
                signal: AbortSignal.timeout(pingTimeout)
            });
            const end = performance.now();
            results.push(Math.round(end - start));
        } catch (e) {
            console.warn(`A single ping request failed, continuing test. Error:`, e);
        }

        // Wait between pings, but not after the last one.
        if (i < numPings - 1) await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Need at least 3 successful pings for a meaningful result.
    if (results.length < 3) {
        console.error('Ping test failed: Not enough successful measurements.');
        throw new Error('Ping test failed. Could not connect to the server, please check your internet connection.');
    }

    results.sort((a, b) => a - b);
    
    // Discard the fastest and slowest results to get a more stable average,
    // but only if we have enough data points to make it worthwhile.
    const trimmed = results.length > 3 ? results.slice(1, results.length - 1) : results;
    
    const avgPing = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
    const jitter = Math.round(Math.max(...trimmed) - Math.min(...trimmed));
    return { ping: avgPing, jitter };
}

export async function testDownloadSpeed(
    onProgress: (speedMbps: number) => void, 
    onDataUsed: (bytes: number) => void
): Promise<number> {
    const warmUpDuration = 2000; // 2 seconds
    const testDuration = 10000; // 10 seconds
    const totalDuration = warmUpDuration + testDuration;
    const testUrl = 'https://cachefly.cachefly.net/100mb.test';
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), totalDuration);

    let totalBytes = 0;
    let warmUpBytes = 0;
    const testStartTime = performance.now();
    let lastUpdateTime = testStartTime;
    let lastUpdateBytes = 0;
    let warmUpEndTime = 0;
    let isWarmUp = true;

    try {
        const response = await fetch(`${testUrl}?r=${Math.random() * 999999}`, {
            signal: controller.signal,
            cache: 'no-store'
        });

        if (!response.body) {
            throw new Error('Response body is null.');
        }

        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const now = performance.now();
            totalBytes += value.length;
            onDataUsed(totalBytes);

            // Check if warm-up period has passed
            if (isWarmUp && (now - testStartTime) >= warmUpDuration) {
                warmUpBytes = totalBytes;
                warmUpEndTime = now;
                isWarmUp = false;
            }

            // Send progress update to UI throttled to every 250ms
            if (now - lastUpdateTime > 250) {
                const bytesDelta = totalBytes - lastUpdateBytes;
                const timeDeltaMs = now - lastUpdateTime;
                const speedMbps = (bytesDelta * 8) / (timeDeltaMs / 1000) / 1000000;
                
                onProgress(isFinite(speedMbps) ? speedMbps : 0);
                
                lastUpdateBytes = totalBytes;
                lastUpdateTime = now;
            }
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error("Download test error:", err);
            clearTimeout(timeout);
            throw new Error('Download test failed. Could not connect to the server, please check your internet connection.');
        }
        // AbortError is the expected way for the test to end via timeout.
    } finally {
        clearTimeout(timeout);
    }
    
    const testEndTime = performance.now();

    // If test ended before warm-up, calculate based on overall average as a fallback.
    if (warmUpEndTime === 0) {
        const totalElapsedMs = testEndTime - testStartTime;
        if (totalElapsedMs <= 0 || totalBytes === 0) return 0;
        const fallbackSpeed = (totalBytes * 8) / (totalElapsedMs / 1000) / 1000000;
        onProgress(fallbackSpeed);
        return fallbackSpeed;
    }

    const stableBytesDownloaded = totalBytes - warmUpBytes;
    const stableDurationMs = testEndTime - warmUpEndTime;

    if (stableBytesDownloaded <= 0 || stableDurationMs <= 0) {
        console.warn("No data was downloaded during the stable measurement period.");
        return 0;
    }

    const finalSpeedMbps = (stableBytesDownloaded * 8) / (stableDurationMs / 1000) / 1000000;

    onProgress(finalSpeedMbps); // Send one final, accurate speed to the UI.
    return finalSpeedMbps;
}

export async function testUploadSpeed(
    onProgress: (speedMbps: number) => void,
    onDataUsed: (bytes: number) => void
): Promise<number> {
    const warmUpDuration = 2000; // 2 seconds
    const testDuration = 10000; // 10 seconds
    const totalDuration = warmUpDuration + testDuration;
    // NOTE: A dedicated server endpoint is highly recommended for production use.
    // This public endpoint accepts POST data and is used here for demonstration purposes.
    const testUrl = 'https://httpbin.org/post';
    const totalSize = 25 * 1024 * 1024; // 25MB total data to upload
    
    // Generate some random data to upload
    const data = new Blob([new ArrayBuffer(totalSize)], { type: 'application/octet-stream' });

    return new Promise<number>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let testStartTime = 0;
        let lastUpdateTime = 0;
        let lastUpdateBytes = 0;
        let warmUpBytes = 0;
        let warmUpEndTime = 0;
        let isWarmUp = true;
        let timedOut = false;

        const timeout = setTimeout(() => {
            timedOut = true;
            xhr.abort();
        }, totalDuration);

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            
            const now = performance.now();
            if (testStartTime === 0) {
                testStartTime = now;
                lastUpdateTime = now;
            }
            
            const totalBytes = event.loaded;
            onDataUsed(totalBytes);

            if (isWarmUp && (now - testStartTime) >= warmUpDuration) {
                warmUpBytes = totalBytes;
                warmUpEndTime = now;
                isWarmUp = false;
            }

            if (now - lastUpdateTime > 250) {
                const bytesDelta = totalBytes - lastUpdateBytes;
                const timeDeltaMs = now - lastUpdateTime;
                const speedMbps = (bytesDelta * 8) / (timeDeltaMs / 1000) / 1000000;
                
                onProgress(isFinite(speedMbps) ? speedMbps : 0);
                
                lastUpdateBytes = totalBytes;
                lastUpdateTime = now;
            }
        };

        const calculateFinalSpeed = () => {
            const testEndTime = performance.now();
            const totalBytes = lastUpdateBytes;

            if (warmUpEndTime === 0 || testStartTime === 0) {
                const totalElapsedMs = testEndTime - (testStartTime || testEndTime);
                if (totalElapsedMs <= 0 || totalBytes === 0) return 0;
                const fallbackSpeed = (totalBytes * 8) / (totalElapsedMs / 1000) / 1000000;
                onProgress(fallbackSpeed);
                return fallbackSpeed;
            }

            const stableBytesUploaded = totalBytes - warmUpBytes;
            const stableDurationMs = testEndTime - warmUpEndTime;

            if (stableBytesUploaded <= 0 || stableDurationMs <= 0) return 0;
            
            const finalSpeedMbps = (stableBytesUploaded * 8) / (stableDurationMs / 1000) / 1000000;
            onProgress(finalSpeedMbps);
            return finalSpeedMbps;
        }

        xhr.onloadend = () => {
            clearTimeout(timeout);
            resolve(calculateFinalSpeed());
        };
        
        xhr.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Upload test failed. Could not connect to the server.'));
        };
        
        xhr.onabort = () => {
            clearTimeout(timeout);
            if (timedOut) {
                 resolve(calculateFinalSpeed());
            } else {
                reject(new Error('Upload test was aborted.'));
            }
        };

        xhr.open('POST', `${testUrl}?r=${Math.random() * 999999}`, true);
        xhr.send(data);
    });
}