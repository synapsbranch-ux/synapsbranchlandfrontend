import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SynapsBranch Logo Component
 * Uses logo.png from public folder for production compatibility
 */
const Logo = ({
    size = 'md',
    showText = true,
    onClick = null,
    className = ''
}) => {
    const navigate = useNavigate();

    const sizes = {
        sm: { logo: 'h-6', text: 'text-sm' },
        md: { logo: 'h-8', text: 'text-base' },
        lg: { logo: 'h-12', text: 'text-xl' },
    };

    const currentSize = sizes[size] || sizes.md;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate('/');
        }
    };

    return (
        <div
            className={`flex items-center gap-2 cursor-pointer group ${className}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
            data-testid="logo"
        >
            {/* Logo Image from public folder */}
            <img
                src={`${process.env.PUBLIC_URL}/logo.png`}
                alt="SynapsBranch"
                className={`${currentSize.logo} object-contain transition-transform group-hover:scale-105`}
            />

            {showText && (
                <span className={`font-semibold text-foreground ${currentSize.text} group-hover:text-primary transition-colors`}>
                    SynapsBranch
                </span>
            )}
        </div>
    );
};

export default Logo;
