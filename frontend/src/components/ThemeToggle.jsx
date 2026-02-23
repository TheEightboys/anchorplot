import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn relative flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-300 group"
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            title={`Currently in ${isDarkMode ? 'dark' : 'light'} mode. Click to switch.`}
        >
            {/* Toggle Track */}
            <div className="theme-toggle-track relative w-14 h-7 rounded-full transition-all duration-300">
                {/* Toggle Thumb */}
                <div className={`theme-toggle-thumb absolute top-1 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center ${isDarkMode ? 'left-[30px]' : 'left-1'}`}>
                    <Sun
                        size={13}
                        className={`absolute transition-all duration-300 ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                        strokeWidth={3}
                    />
                    <Moon
                        size={13}
                        className={`absolute transition-all duration-300 ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
                        strokeWidth={3}
                    />
                </div>
            </div>

            {/* Label Text */}
            <span className="theme-toggle-label text-sm font-bold transition-all duration-300 min-w-[40px]">
                {isDarkMode ? 'Dark' : 'Light'}
            </span>
        </button>
    );
};

export default ThemeToggle;
