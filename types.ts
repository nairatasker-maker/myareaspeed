

export type TestStage = 'idle' | 'ping' | 'download' | 'upload' | 'complete' | 'error';

export interface TestResult {
    ping: number;
    jitter: number;
    internetSpeed: number; // download speed
    uploadSpeed: number;
    dataUsed: number;
    timestamp: number;
    downloadHistory?: number[];
    uploadHistory?: number[];
}

export interface UserInfo {
    isp: string;
    city: string;
    region: string;
    country: string;
    ip: string;
    os: string;
    browser: string;
    lat?: number;
    lng?: number;
}

export type UserAgentPresetKey = 'default' | 'iphone' | 'android' | 'windows';

export type Navigate = (path: string) => void;

export interface CommunityFeedback {
    id: string;
    location: string;
    isp: string;
    rating: number;
    internetSpeed: number;
    uploadSpeed: number;
    ping: number;
    jitter: number;
    comment: string;
    timestamp: number;
}

// FIX: Add missing Coordinates type for geocoding service.
export type Coordinates = {
    lat: number;
    lng: number;
};

// FIX: Add missing UserMapLocation type for map component.
export interface UserMapLocation {
    lat: number;
    lng: number;
    city: string;
}

// FIX: Add missing FeedbackMapLocation type for map component.
export interface FeedbackMapLocation {
    id: string;
    lat: number;
    lng: number;
    isp: string;
    speed: number; // This is download speed
    rating: number;
    comment?: string;
}
