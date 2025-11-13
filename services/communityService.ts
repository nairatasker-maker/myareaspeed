import type { CommunityFeedback } from '../types';

const MOCK_FEEDBACK_KEY = 'communityFeedback';

// Initial mock data to populate the service if localStorage is empty
const INITIAL_MOCK_DATA: CommunityFeedback[] = [
    {
        id: '1',
        location: 'Lekki Phase 1, Lagos',
        isp: 'MTN Nigeria',
        rating: 4,
        internetSpeed: 55.2,
        // FIX: Add missing 'uploadSpeed' property.
        uploadSpeed: 15.6,
        ping: 25,
        jitter: 5,
        comment: 'Generally reliable for work and streaming Netflix in the evenings. Sometimes slows down during peak hours.',
        timestamp: Date.now() - 86400000 * 2, // 2 days ago
    },
    {
        id: '2',
        location: 'Ikeja, Lagos',
        isp: 'Airtel',
        rating: 3,
        internetSpeed: 25.8,
        // FIX: Add missing 'uploadSpeed' property.
        uploadSpeed: 8.2,
        ping: 45,
        jitter: 12,
        comment: 'It\'s okay for browsing, but video calls can be a bit choppy, especially in the afternoon.',
        timestamp: Date.now() - 86400000 * 5, // 5 days ago
    },
    {
        id: '3',
        location: 'Wuse 2, Abuja',
        isp: 'Glo',
        rating: 2,
        internetSpeed: 8.5,
        // FIX: Add missing 'uploadSpeed' property.
        uploadSpeed: 2.1,
        ping: 88,
        jitter: 25,
        comment: 'Not great for gaming. The ping is too high and I get a lot of lag spikes. Basic browsing is fine though.',
        timestamp: Date.now() - 86400000 * 1, // 1 day ago
    },
    {
        id: '4',
        location: 'Bodija, Ibadan',
        isp: '9mobile',
        rating: 4,
        internetSpeed: 30.1,
        // FIX: Add missing 'uploadSpeed' property.
        uploadSpeed: 11.5,
        ping: 30,
        jitter: 8,
        comment: 'Surprisingly good for working from home. Stable connection for Zoom calls.',
        timestamp: Date.now() - 86400000 * 10, // 10 days ago
    },
];

export const getFeedback = (): CommunityFeedback[] => {
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

export const addFeedback = (newFeedback: Omit<CommunityFeedback, 'id' | 'timestamp'>) => {
    const allFeedback = getFeedback();
    const feedbackToAdd: CommunityFeedback = {
        ...newFeedback,
        id: new Date().toISOString() + Math.random(),
        timestamp: Date.now(),
    };
    const updatedFeedback = [feedbackToAdd, ...allFeedback];
    saveFeedback(updatedFeedback);
};


export const searchFeedback = (query: string): CommunityFeedback[] => {
    let allFeedback = getFeedback();
    
    // Always sort by most recent first
    allFeedback.sort((a, b) => b.timestamp - a.timestamp);

    if (!query) {
        return allFeedback;
    }

    const lowerCaseQuery = query.toLowerCase().trim();
    return allFeedback.filter(f => 
        f.location.toLowerCase().includes(lowerCaseQuery) ||
        f.isp.toLowerCase().includes(lowerCaseQuery) ||
        f.comment.toLowerCase().includes(lowerCaseQuery)
    );
};