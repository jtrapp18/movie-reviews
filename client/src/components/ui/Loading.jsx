import React from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${props => {
        if (props.size === 'small') return '10px';
        if (props.size === 'large') return '60px';
        return props.compact ? '20px' : '40px';
    }};
    text-align: center;
    
    & p {
        color: ${props => {
            if (props.size === 'small') return '#999';
            if (props.size === 'large') return 'var(--yellow)';
            return props.compact ? '#666' : 'var(--yellow)';
        }};
        font-size: ${props => {
            if (props.size === 'small') return '12px';
            if (props.size === 'large') return 'clamp(3.5rem, 7vw, 8rem)';
            return props.compact ? '16px' : 'clamp(3rem, 6vw, 7rem)';
        }};
        margin: 0;
        font-weight: 600;
    }

    & .dots {
        display: inline-block;
        color: inherit;
        font-size: inherit; // Use the same size as the parent p element
        white-space: nowrap;
        margin-left: ${props => props.size === 'small' ? '4px' : '8px'};
    }

    & .dot {
        font-size: inherit;
        color: inherit;
        display: inline-block;
        opacity: 0;
        animation: dotAnimation 1.5s forwards;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
    }

    /* Define the animation to make dots appear one after another */
    @keyframes dotAnimation {
        0% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }

    /* Delay the animation of each dot */
    .dot:nth-child(1) {
        animation-delay: 0.2s;
    }

    .dot:nth-child(2) {
        animation-delay: 0.4s;
    }

    .dot:nth-child(3) {
        animation-delay: 0.6s;
    }
`;

const Loading = ({ 
    text = "Loading", 
    compact = false,
    size = 'medium', // 'small', 'medium', 'large'
    showDots = true, // Always show dots by default
    className = ""
}) => {
    return (
        <LoadingContainer compact={compact} size={size} className={className}>
            <p>
                <strong>{text}</strong>
                {showDots && (
                    <span className="dots">
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                        <span className="dot">.</span>
                    </span>
                )}
            </p>
        </LoadingContainer>
    );
}

export default Loading;