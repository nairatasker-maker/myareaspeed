const SPAM_KEYWORDS = [
    'http:', 
    'https:', 
    'www.', 
    '.com', 
    '.ng', 
    '.io',
    '.xyz',
    'crypto', 
    'forex', 
    'free', 
    'offer', 
    'win', 
    'bet', 
    'loan',
    'investment',
    'profit',
    'guaranteed',
    'limited time'
];

export function isCommentSpam(comment: string): boolean {
    const lowerCaseComment = comment.toLowerCase();
    return SPAM_KEYWORDS.some(keyword => lowerCaseComment.includes(keyword));
}

const FEEDBACK_TIMESTAMP_KEY = 'lastFeedbackTimestamp';
const SUBMISSION_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

export function canSubmitFeedback(): boolean {
    try {
        const lastSubmission = localStorage.getItem(FEEDBACK_TIMESTAMP_KEY);
        if (!lastSubmission) {
            return true;
        }
        const lastTimestamp = parseInt(lastSubmission, 10);
        return (Date.now() - lastTimestamp) > SUBMISSION_COOLDOWN;
    } catch (error) {
        console.error("Could not access localStorage for rate limiting.", error);
        return true; // Fail open if localStorage is not available
    }
}

export function recordFeedbackSubmission(): void {
    try {
        localStorage.setItem(FEEDBACK_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
        console.error("Could not record feedback submission timestamp.", error);
    }
}
