/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                'primary-hover': 'var(--primary-hover)',
                'primary-light': 'var(--primary-light)',
                secondary: 'var(--secondary)',
                'secondary-hover': 'var(--secondary-hover)',
                success: 'var(--success)',
                'success-bg': 'var(--success-bg)',
                info: 'var(--info)',
                'info-bg': 'var(--info-bg)',
                warning: 'var(--warning)',
                'warning-bg': 'var(--warning-bg)',
                danger: 'var(--danger)',
                'danger-bg': 'var(--danger-bg)',
                purple: 'var(--purple)',
                'purple-bg': 'var(--purple-bg)',
                background: 'var(--background)',
                surface: 'var(--surface)',
                'surface-hover': 'var(--surface-hover)',
                'surface-element': 'var(--surface-element)',
                'text-primary': 'var(--text-primary)',
                'text-secondary': 'var(--text-secondary)',
                'text-tertiary': 'var(--text-tertiary)',
                'border-light': 'var(--border-light)',
                'border-medium': 'var(--border-medium)',
            }
        },
    },
    plugins: [],
}
