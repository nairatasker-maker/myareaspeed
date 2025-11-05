
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
        internetSpeed: 55.2,
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
        internetSpeed: 25.8,
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
        internetSpeed: 8.5,
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
        internetSpeed: 30.1,
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
        internetSpeed: 90.7,
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

// Fix: Add missing SearchFilters interface and searchFeedback/markAsHelpful functions.
export interface SearchFilters {
    location?: string;
    isp?: string[];
    sortBy?: 'recent' | 'helpful' | 'speed-fast';
}

const PAGE_SIZE = 9;

export const searchFeedback = (filters: SearchFilters, page: number = 1): { results: CommunityFeedback[], hasMore: boolean } => {
    let allFeedback = getFeedback();

    if (filters.location) {
        const query = filters.location.toLowerCase();
        allFeedback = allFeedback.filter(f => 
            f.location.toLowerCase().includes(query) ||
            f.isp.toLowerCase().includes(query) ||
            f.comment.toLowerCase().includes(query)
        );
    }
    
    if (filters.isp && filters.isp.length > 0) {
        allFeedback = allFeedback.filter(f => filters.isp!.includes(f.isp));
    }

    switch (filters.sortBy) {
        case 'helpful':
            allFeedback.sort((a, b) => b.helpfulCount - a.helpfulCount);
            break;
        case 'speed-fast':
            allFeedback.sort((a, b) => b.internetSpeed - a.internetSpeed);
            break;
        case 'recent':
        default:
            allFeedback.sort((a, b) => b.timestamp - a.timestamp);
            break;
    }

    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const results = allFeedback.slice(startIndex, endIndex);
    const hasMore = endIndex < allFeedback.length;

    return { results, hasMore };
};

const getHelpfulIds = (): string[] => {
    try {
        const stored = localStorage.getItem(HELPFUL_FEEDBACK_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Could not get helpful IDs from localStorage", error);
        return [];
    }
};

const saveHelpfulIds = (ids: string[]) => {
    try {
        localStorage.setItem(HELPFUL_FEEDBACK_KEY, JSON.stringify(ids));
    } catch (error) {
        console.error("Could not save helpful IDs to localStorage", error);
    }
};

export const markAsHelpful = (id: string): boolean => {
    const helpfulIds = getHelpfulIds();
    if (helpfulIds.includes(id)) {
        return false; // Already marked as helpful
    }

    const allFeedback = getFeedback();
    const feedbackIndex = allFeedback.findIndex(f => f.id === id);

    if (feedbackIndex === -1) {
        return false; // Feedback not found
    }

    allFeedback[feedbackIndex].helpfulCount += 1;
    saveFeedback(allFeedback);
    
    saveHelpfulIds([...helpfulIds, id]);
    return true;
};
