
const DOWNLOAD_URL = 'https://speed.cloudflare.com/__down';
const UPLOAD_URL = 'https://speed.cloudflare.com/__up';

/**
 * Generates a Uint8Array with random data, handling crypto.getRandomValues limits.
 * @param size The size of the array in bytes.
 * @returns A Uint8Array filled with random data.
 */
function generateRandomData(size: number): Uint8Array {
    const data = new Uint8Array(size);
    const MAX_CRYPTO_CHUNK = 65536; // 64 KiB is the typical max size

    // Use crypto.getRandomValues for better performance and randomness if available
    if (window.crypto && window.crypto.getRandomValues) {
        for (let i = 0; i < size; i += MAX_CRYPTO_CHUNK) {
            const chunk = data.subarray(i, Math.min(i + MAX_CRYPTO_CHUNK, size));
            window.crypto.getRandomValues(chunk);
        }
    } else {
        // Fallback for older browsers or non-secure contexts
        for (let i = 0; i < size; i++) {
            data[i] = Math.floor(Math.random() * 256);
        }
    }
    return data;
}


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
