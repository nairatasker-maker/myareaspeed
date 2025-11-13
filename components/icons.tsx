
import React from 'react';

export const MyAreaSpeedFullLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid meet">
        <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
        </defs>
        <path d="M20 2c-2.4 0-4.7.5-6.8 1.4-4.5 2-8.1 5.6-10.1 10.1-1.4 3-2.1 6.3-2.1 9.7s.7 6.7 2.1 9.7c2 4.5 5.6 8.1 10.1 10.1 2.1.9 4.3 1.4 6.8 1.4s4.7-.5 6.8-1.4c4.5-2 8.1-5.6 10.1-10.1 1.4-3 2.1-6.3 2.1-9.7s-.7-6.7-2.1-9.7C34.9 7.6 31.3 4 26.8 2.1 24.7 1.5 22.4 2 20 2zm0 4c1.9 0 3.7.4 5.3 1.1 3.6 1.6 6.5 4.5 8.1 8.1.7 1.6 1.1 3.4 1.1 5.3s-.4 3.7-1.1 5.3c-1.6 3.6-4.5 6.5-8.1 8.1-1.6.7-3.4 1.1-5.3 1.1s-3.7-.4-5.3-1.1c-3.6-1.6-6.5-4.5-8.1-8.1-.7-1.6-1.1-3.4-1.1-5.3s.4-3.7 1.1-5.3C8.1 10.5 11.1 7.6 14.7 6c1.6-.7 3.4-1.1 5.3-1.1z M20 12c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z" fill="url(#logo-gradient)"></path>
        <text x="45" y="27" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="900" fill="currentColor" className="text-text-light dark:text-text-dark">
            myareaspeed
        </text>
    </svg>
);

export const LogoIcon = () => (
    <svg fill="url(#logo-gradient)" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
         <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
        </defs>
        <path d="M20 2c-2.4 0-4.7.5-6.8 1.4-4.5 2-8.1 5.6-10.1 10.1-1.4 3-2.1 6.3-2.1 9.7s.7 6.7 2.1 9.7c2 4.5 5.6 8.1 10.1 10.1 2.1.9 4.3 1.4 6.8 1.4s4.7-.5 6.8-1.4c4.5-2 8.1-5.6 10.1-10.1 1.4-3 2.1-6.3 2.1-9.7s-.7-6.7-2.1-9.7C34.9 7.6 31.3 4 26.8 2.1 24.7 1.5 22.4 2 20 2zm0 4c1.9 0 3.7.4 5.3 1.1 3.6 1.6 6.5 4.5 8.1 8.1.7 1.6 1.1 3.4 1.1 5.3s-.4 3.7-1.1 5.3c-1.6 3.6-4.5 6.5-8.1 8.1-1.6.7-3.4 1.1-5.3 1.1s-3.7-.4-5.3-1.1c-3.6-1.6-6.5-4.5-8.1-8.1-.7-1.6-1.1-3.4-1.1-5.3s.4-3.7 1.1-5.3C8.1 10.5 11.1 7.6 14.7 6c1.6-.7 3.4-1.1 5.3-1.1z M20 12c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"></path>
    </svg>
);
