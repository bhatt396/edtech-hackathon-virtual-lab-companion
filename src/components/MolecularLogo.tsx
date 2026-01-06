import React from 'react';

export const MolecularLogo = ({ size = 45, className = "" }: { size?: number, className?: string }) => {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-2xl blur-xl opacity-70" />
            <div className="relative bg-gradient-to-br from-teal-500 to-indigo-600 p-2.5 rounded-2xl shadow-2xl backdrop-blur-sm">
                <svg width={size} height={size} viewBox="0 0 60 60" className="text-white">
                    <circle cx="30" cy="30" r="6" fill="currentColor" />
                    <circle cx="15" cy="20" r="4" fill="currentColor" />
                    <circle cx="45" cy="20" r="4" fill="currentColor" />
                    <circle cx="15" cy="40" r="4" fill="currentColor" />
                    <circle cx="45" cy="40" r="4" fill="currentColor" />
                    <circle cx="30" cy="10" r="4" fill="currentColor" />
                    <circle cx="30" cy="50" r="4" fill="currentColor" />
                    <line x1="30" y1="30" x2="15" y2="20" stroke="currentColor" strokeWidth="2" />
                    <line x1="30" y1="30" x2="45" y2="20" stroke="currentColor" strokeWidth="2" />
                    <line x1="30" y1="30" x2="15" y2="40" stroke="currentColor" strokeWidth="2" />
                    <line x1="30" y1="30" x2="45" y2="40" stroke="currentColor" strokeWidth="2" />
                    <line x1="30" y1="30" x2="30" y2="10" stroke="currentColor" strokeWidth="2" />
                    <line x1="30" y1="30" x2="30" y2="50" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
};
