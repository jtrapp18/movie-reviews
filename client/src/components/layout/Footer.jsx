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
    padding: 16px 0 18px 0;
    z-index: 10;
  }

  #photo-roll {
    width: 100vw;
    height: 100px;
    background-image: url('/images/photo-roll.png');
    background-image: image-set(
      url('/images/photo-roll.webp') type('image/webp'),
      url('/images/photo-roll.png') type('image/png')
    );
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }

  .footer-inner {
    width: min(1100px, 100%);
    padding: 0 clamp(0.9rem, 3vw, 2rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.95rem;
  }

  .footer-nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1.35rem;
    margin: 0;
    padding: 0;
    text-align: center;
  }

  .footer-nav a {
    color: rgba(255, 255, 255, 0.78);
    text-decoration: none;
    transition: color 0.2s ease, font-weight 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    font-weight: 500;
    font-size: clamp(0.78rem, 1.6vw, 0.95rem);
  }

  .footer-nav a:hover {
    color: rgba(255, 255, 255, 0.92);
    font-weight: 600;
  }

  .footer-tagline {
    color: rgba(255, 255, 255, 0.65);
    text-align: center;
    font-style: italic;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.55);
  }

  .footer-meta {
    color: var(--soft-white);
    text-align: center;
    margin: 0;
    font-size: 0.95em;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
  }

  .footer-meta span {
    color: inherit;
  }

  .footer-meta .dot {
    opacity: 0.75;
  }
`;

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <StyledFooter id="footer">
      <div
        id="photo-roll"
        role="img"
        aria-label="Film photo roll spanning the footer"
      />
      <section>
        <div className="footer-inner">
          <nav className="footer-nav" aria-label="Footer">
            <a href="/#/">Home</a>
            <a href="/#/search_movies">Search Movies</a>
            <a href="/#/directors">Directors</a>
            <a href="/#/about">About</a>
            <a href="/#/contact">Contact</a>
          </nav>

          <p className="footer-tagline">
            Exploring cinema through critical analysis and thematic essays
          </p>

          <p className="footer-meta">
            <span>© {year} James Trapp</span>
            <span className="dot">•</span>
            <span>Designed by Jacqueline Trapp</span>
          </p>
        </div>
      </section>
    </StyledFooter>
  );
};

export default Footer;
