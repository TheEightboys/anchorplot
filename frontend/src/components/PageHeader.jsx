import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * PageHeader — Reusable premium header for all dashboard pages.
 * Shows a back button (history or fixed path), page title, badge, and optional actions.
 */
const PageHeader = ({
    title,
    subtitle,
    badge,
    backTo,              // Optional: override back navigation path
    backLabel = 'Back',
    actions,             // Optional: JSX slot for action buttons
    className = '',
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        if (backTo) {
            navigate(backTo);
        } else if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/app');
        }
    };

    return (
        <div className={`page-header flex flex-col gap-1 ${className}`}>
            {/* Back navigation */}
            <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary transition-colors w-fit mb-3 group"
            >
                <ArrowLeft
                    size={15}
                    className="group-hover:-translate-x-0.5 transition-transform"
                />
                {backLabel}
            </button>

            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-extrabold text-text-primary tracking-tight leading-none">
                        {title}
                    </h1>
                    {badge && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                            {badge}
                        </span>
                    )}
                </div>

                {actions && (
                    <div className="flex items-center gap-2 shrink-0">
                        {actions}
                    </div>
                )}
            </div>

            {/* Subtitle */}
            {subtitle && (
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default PageHeader;
