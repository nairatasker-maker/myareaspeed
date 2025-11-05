
export type TestStage = 'idle' | 'ping' | 'download' | 'upload' | 'complete' | 'error';

export interface TestResult {
    ping: number;
    jitter: number;
    downloadSpeed: number;
    uploadSpeed: number;
    dataUsed: number;
    timestamp: number;
}

export interface UserInfo {
    isp: string;
    city: string;
    country: string;
    ip: string;
}

export interface NetworkStat {
    name: string;
    percentage: number;
    color: string;
}

export interface AverageSpeed {
    name: string;
    speed: number;
}

// New types for Community Feedback
export type ExperienceTag = 'streaming' | 'gaming' | 'video_calls' | 'browsing' | 'wfh';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface CommunityFeedback {
    id: string;
    location: string;
    isp: string;
    rating: number; // 1-5
    downloadSpeed: number;
    uploadSpeed: number;
    ping: number;
    tags: ExperienceTag[];
    comment: string;
    timeOfDay: TimeOfDay;
    timestamp: number;
    helpfulCount: number;
}
