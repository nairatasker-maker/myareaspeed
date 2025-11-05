import React from 'react';

interface ThemeToggleProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card-light dark:bg-card-dark text-text-light/70 dark:text-text-dark/70 shadow-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <span className="material-symbols-outlined">dark_mode</span>
            ) : (
                <span className="material-symbols-outlined">light_mode</span>
            )}
        </button>
    );
};
