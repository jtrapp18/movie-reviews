import React from 'react';
import styled from 'styled-components';
import AnimatedText from './AnimatedText';
import Countdown from './Countdown';


const Loading = ({
    text = "Loading",
    compact = false,
    size = 'medium', // 'small', 'medium', 'large'
    showDots = true, // Always show dots by default
    className = ""
}) => {

    if (size === 'large') {
        return (
            <Countdown />
        );
    }

    return (

        <AnimatedText
            text={text}
            compact={compact}
            size={size}
            className={className}
            showDots={showDots}
        />
    );
}

export default Loading;
