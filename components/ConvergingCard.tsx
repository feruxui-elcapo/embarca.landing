import React from 'react';

interface ConvergingCardProps {
    index: number;
    scrollProgress: number;
    initialX: number;
    initialY: number;
    initialRotation: number;
    children: React.ReactNode;
    className?: string;
    delayStep?: number;
}

export const ConvergingCard: React.FC<ConvergingCardProps> = ({
    index,
    scrollProgress,
    initialX,
    initialY,
    initialRotation,
    children,
    className = '',
    delayStep = 0.1,
}) => {
    // Sequential ordering logic: 
    // Each card starts finding its place at a different scroll point
    const cardStartProgress = index * delayStep;
    // Faster convergence: 0.25 duration instead of 0.4
    const cardLocalProgress = Math.min(1, Math.max(0, (scrollProgress - cardStartProgress) / 0.25));

    // Interpolate from disordered to ordered
    const rotate = initialRotation * (1 - cardLocalProgress);
    const x = initialX * (1 - cardLocalProgress);
    const y = initialY * (1 - cardLocalProgress);
    const opacity = cardLocalProgress;
    const scale = 0.95 + cardLocalProgress * 0.05;

    return (
        <div
            className={`group relative ${className}`}
            style={{
                transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`,
                opacity: opacity,
                transition: 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.3s ease-out',
                willChange: 'transform, opacity',
            }}
        >
            {children}
        </div>
    );
};
