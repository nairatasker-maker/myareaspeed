
import type { CommunityFeedback, TimeOfDay, ExperienceTag } from '../types';

const MOCK_FEEDBACK_KEY = 'communityFeedback';
const HELPFUL_FEEDBACK_KEY = 'helpfulFeedback';

// Initial mock data to populate the service if localStorage is empty
const INITIAL_MOCK_DATA: CommunityFeedback[] = [
    {
        id: '1',
        location: 'Lekki Phase 1, Lagos',
        isp: 'MTN Nigeria',
        rating: 4,
        downloadSpeed: 55.2,
        uploadSpeed: 12.5,
        ping: 25,
        tags: ['streaming', 'wfh'],
        comment: 'Generally reliable for work and streaming Netflix in the evenings. Sometimes slows down during peak hours.',
        timeOfDay: 'evening',
        timestamp: Date.now() - 86400000 * 2, // 2 days ago
        helpfulCount: 15,
    },
    {
        id: '2',
        location: 'Ikeja, Lagos',
        isp: 'Airtel',
        rating: 3,
        downloadSpeed: 25.8,
        uploadSpeed: 8.1,
        ping: 45,
        tags: ['browsing', 'video_calls'],
        comment: 'It\'s okay for browsing, but video calls can be a bit choppy, especially in the afternoon.',
        timeOfDay: 'afternoon',
        timestamp: Date.now() - 86400000 * 5, // 5 days ago
        helpfulCount: 7,
    },
    {
        id: '3',
        location: 'Wuse 2, Abuja',
        isp: 'Glo',
        rating: 2,
        downloadSpeed: 8.5,
        uploadSpeed: 2.3,
        ping: 88,
        tags: ['gaming'],
        comment: 'Not great for gaming. The ping is too high and I get a lot of lag spikes. Basic browsing is fine though.',
        timeOfDay: 'night',
        timestamp: Date.now() - 86400000 * 1, // 1 day ago
        helpfulCount: 22,
    },
    {
        id: '4',
        location: 'Bodija, Ibadan',
        isp: '9mobile',
        rating: 4,
        downloadSpeed: 30.1,
        uploadSpeed: 15.6,
        ping: 30,
        tags: ['wfh', 'video_calls'],
        comment: 'Surprisingly good for working from home. Stable connection for Zoom calls.',
        timeOfDay: 'morning',
        timestamp: Date.now() - 86400000 * 10, // 10 days ago
        helpfulCount: 12,
    },
    {
        id: '5',
        location: 'Asokoro, Abuja',
        isp: 'MTN Nigeria',
        rating: 5,
        downloadSpeed: 90.7,
        uploadSpeed: 25.2,
        ping: 18,
        tags: ['streaming', 'gaming'],
        comment: 'Excellent speed, can handle multiple 4K streams and online gaming without any issues. Very impressed.',
        timeOfDay: 'evening',
        timestamp: Date.now() - 86400000 * 3, // 3 days ago
        helpfulCount: 31,
    }
];

const getFeedback = (): CommunityFeedback[] => {
    try {
        const storedData = localStorage.getItem(MOCK_FEEDBACK_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
        localStorage.setItem(MOCK_FEEDBACK_KEY, JSON.stringify(INITIAL_MOCK_DATA));
        return INITIAL_MOCK_DATA;
    } catch (error) {
        console.error("Could not access localStorage for feedback.", error);
        return INITIAL_MOCK_DATA;
    }
};

const saveFeedback = (feedback: CommunityFeedback[]) => {
    try {
        localStorage.setItem(MOCK_FEEDBACK_KEY, JSON.stringify(feedback));
    } catch (error) {
        console.error("Could not save feedback to localStorage.", error);
    }
};

export const addFeedback = (newFeedback: Omit<CommunityFeedback, 'id' | 'timestamp' | 'helpfulCount'>) => {
    const allFeedback = getFeedback();
    const feedbackToAdd: CommunityFeedback = {
        ...newFeedback,
        id: new Date().toISOString() + Math.random(),
        timestamp: Date.now(),
        helpfulCount: 0,
    };
    const updatedFeedback = [feedbackToAdd, ...allFeedback];
    saveFeedback(updatedFeedback);
};

export interface SearchFilters {
    location?: string;
    isp?: string[];
    minRating?: number;
    tags?: ExperienceTag[];
    sortBy?: 'recent' | 'helpful' | 'speed-fast';
}

export const searchFeedback = (filters: SearchFilters, page: number, limit: number = 10) => {
    const allFeedback = getFeedback();
    let filtered = allFeedback;

    if (filters.location) {
        const query = filters.location.toLowerCase();
        filtered = filtered.filter(f => f.location.toLowerCase().includes(query));
    }
    if (filters.isp && filters.isp.length > 0) {
        filtered = filtered.filter(f => filters.isp!.includes(f.isp));
    }
    if (filters.minRating) {
        filtered = filtered.filter(f => f.rating >= filters.minRating!);
    }
    if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(f => f.tags.some(tag => filters.tags!.includes(tag)));
    }

    switch (filters.sortBy) {
        case 'helpful':
            filtered.sort((a, b) => b.helpfulCount - a.helpfulCount);
            break;
        case 'speed-fast':
            filtered.sort((a, b) => b.downloadSpeed - a.downloadSpeed);
            break;
        case 'recent':
        default:
            filtered.sort((a, b) => b.timestamp - a.timestamp);
            break;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
        results: paginated,
        hasMore: endIndex < filtered.length,
        total: filtered.length,
    };
};

export const markAsHelpful = (feedbackId: string): boolean => {
    try {
        const markedHelpful: string[] = JSON.parse(localStorage.getItem(HELPFUL_FEEDBACK_KEY) || '[]');
        if (markedHelpful.includes(feedbackId)) {
            return false; // Already marked
        }

        const allFeedback = getFeedback();
        const feedbackToUpdate = allFeedback.find(f => f.id === feedbackId);
        if (feedbackToUpdate) {
            feedbackToUpdate.helpfulCount += 1;
            saveFeedback(allFeedback);
            markedHelpful.push(feedbackId);
            localStorage.setItem(HELPFUL_FEEDBACK_KEY, JSON.stringify(markedHelpful));
            return true;
        }
        return false;
    } catch (error) {
        console.error("Could not mark feedback as helpful.", error);
        return false;
    }
}
