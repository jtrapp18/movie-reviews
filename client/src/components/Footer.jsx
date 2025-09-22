import React from 'react';
import styled from 'styled-components';

const StyledFooter = styled.footer`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--cinema-black);
    padding: 10px 0 0 0;
    margin-top: auto;
    position: relative;
    z-index: 1000;

    section {
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        padding: 10px 0 10px 0;
        z-index: 10;
    }

    #photo-roll {
        width: 100vw;
        height: 100px;
        background-image: url('/images/photo-roll.png');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
    }

        div {
            align-items: center;
            justify-content: center;
        }

        p {
            color: #ffd700;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            margin: 5px 0;
            padding: 0;
            font-weight: 500;
        }

        p:first-of-type {
            color: #ffd700; /* Main title - full gold */
        }

        p:nth-of-type(2) {
            color: #ffed4e; /* Tagline - lighter gold */
            font-style: italic;
        }

        p:nth-of-type(3) {
            color: #ffd700; /* Navigation - full gold */
        }

        a {
            color: #ffd700;
            text-decoration: none;
            transition: all 0.3s ease;
            font-weight: 600;
            
            &:hover {
                color: #ffffff;
                text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
            }
        }
    }

    #data-caveat {
        color: #ffffff;
        font-size: 0.9em;
    }
`

const Footer = () => {

    return (
        <StyledFooter id="footer">
            <div
                id='photo-roll'
                role='img'
                aria-label='Film photo roll spanning the footer'
            />
            <section>
                <div>
                    <p><strong>Film Analysis & Reviews by James Trapp</strong></p>
                    <p><em>Exploring cinema through critical analysis and thematic essays</em></p>
                    <p>
                        <a href="/#/about">ABOUT THE AUTHOR</a> • 
                        <a href="/#/contact">CONTACT</a>
                    </p>
                    <p id='data-caveat'>© 2025 James Trapp</p>
                </div>
            </section>
        </StyledFooter>
    );
}

export default Footer;
