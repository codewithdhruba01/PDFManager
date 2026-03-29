import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface SectionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
    to?: string;
    onClick?: () => void;
    className?: string;
    icon?: React.ReactNode;
    type?: 'button' | 'submit' | 'reset';
}

export const SectionButton = ({
    text,
    to,
    onClick,
    className,
    icon,
    type = 'button',
    ...props
}: SectionButtonProps) => {
    const baseClasses = "inline-flex items-center gap-3 px-6 py-3 bg-[#111111] border border-[#2d2e2d] rounded-xl text-[#d3d1d1] hover:border-[#A3A3A3]/50 hover:bg-[#1a1a1a] transition-all duration-300 group shadow-lg shadow-black/20 text-lg font-bold font-outfit";

    const content = (
        <>
            {text}
            {icon && icon}
        </>
    );

    if (to) {
        return (
            <Link to={to} className={cn(baseClasses, className)} {...(props as any)}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={cn(baseClasses, className)}
            disabled={props.disabled}
            {...props}
        >
            {content}
        </button>
    );
};
