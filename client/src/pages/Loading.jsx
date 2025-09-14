import React from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${props => props.compact ? '20px' : '40px'};
    text-align: center;
    
    p {
        color: ${props => props.compact ? '#666' : 'var(--yellow)'};
        font-size: ${props => props.compact ? '14px' : 'clamp(1.4rem, 3.5vw, 2rem)'};
        margin: 0;
        
        strong {
            font-size: ${props => props.compact ? '16px' : 'clamp(3rem, 6vw, 7rem)'};
            font-weight: 600;
        }
    }

    .dots {
        display: inline-block;
        font-size: ${props => props.compact ? '14px' : 'clamp(1.4rem, 3.5vw, 2rem)'};
        white-space: nowrap;
        margin-left: 8px;
    }

    .dot {
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
    showDots = true,
    className = ""
}) => {
    return (
        <LoadingContainer compact={compact} className={className}>
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