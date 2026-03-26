import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import yaml from 'js-yaml';
import aboutContentYaml from '@/data/aboutContent.yaml?raw';
import AboutSection from '@components/shared-sections/AboutSection';
import { StaticPageShell, Button } from '@styles';
import GradingModal from '@components/about/GradingModal';
import HeroTextStack from '@components/shared-sections/HeroTextStack';

const aboutContent = yaml.load(aboutContentYaml);

function splitParagraphs(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((s) => s.trim().replace(/\n/g, ' '))
    .filter(Boolean);
}

function normalizeName(s) {
  return String(s || '')
    .trim()
    .toLowerCase();
}

function Paragraphs({ text }) {
  const paragraphs = splitParagraphs(text);
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </>
  );
}

const HeroBand = styled.section`
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  padding: clamp(1.5rem, 5vh, 3rem) 0;
  background: #070d18;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const HeroInner = styled.div`
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
`;

const AfterHeroSpacer = styled.div`
  height: clamp(0.75rem, 2.2vh, 1.25rem);
`;

const AboveFold = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AuthorPhoto = styled.img`
  width: 220px;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.35),
    0 2px 10px rgba(0, 0, 0, 0.35);

  @media (max-width: 768px) {
    width: 220px;
    margin: 0 auto;
  }
`;

const DirectorNameLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }
`;

// Global CSS sets `span { display: block; }` — force inline for sentence fragments.
const Inline = styled.span`
  display: inline;
`;

const ContentType = styled.div`
  background: var(--background-secondary);
  padding: clamp(1rem, 3vw, 1.25rem);
  margin: clamp(0.75rem, 2vw, 0.9375rem) 0;
  border-radius: 0.5rem;
  border-left: 4px solid var(--border);

  h4 {
    margin: 0 0 0.625rem 0;
  }

  p {
    margin: 0;
  }
`;

const ContentTypeLink = styled(Link)`
  display: block;
  background: var(--background-secondary);
  padding: clamp(1rem, 3vw, 1.25rem);
  margin: clamp(0.75rem, 2vw, 0.9375rem) 0;
  border-radius: 0.5rem;
  border-left: 4px solid var(--border);
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;

  h4 {
    margin: 0 0 0.625rem 0;
    color: var(--font-color-1);
  }

  p {
    margin: 0;
    color: var(--font-color-2);
  }

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
    border-left-color: var(--primary);
  }
`;

const ContactMethod = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .type {
    font-weight: bold;
    min-width: clamp(4rem, 10vw, 5rem);
  }

  .value {
    margin-left: clamp(0.75rem, 2vw, 0.9375rem);
  }
`;

const ContactPageLink = styled(Link)`
  color: var(--font-color-1);
  text-decoration: underline;

  &:hover {
    color: var(--cinema-gold-dark);
  }
`;

function About() {
  const { directors: contextDirectors = [] } = useOutletContext() || {};
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const personalParas = splitParagraphs(aboutContent?.aboutJames?.personalStory);
  const personalLead = personalParas.slice(0, 2);
  const personalRemainder = personalParas.slice(2);
  const favoriteNames = Array.isArray(aboutContent?.aboutJames?.favoriteFilmmakers)
    ? aboutContent.aboutJames.favoriteFilmmakers
    : [];

  const directorsByName = useMemo(() => {
    const m = new Map();
    for (const d of contextDirectors || []) {
      const key = normalizeName(d?.name);
      const id = d?.id;
      if (key && id != null) {
        m.set(key, id);
      }
    }
    return m;
  }, [contextDirectors]);

  const renderFilmmakerSentence = () => {
    if (!favoriteNames.length) return null;

    const renderName = (name) => {
      const normalized = normalizeName(name);
      const id = directorsByName.get(normalized);
      return id ? (
        <DirectorNameLink
          to={`/directors/${id}`}
          title={`View ${name} page`}
          aria-label={`View ${name} page`}
        >
          {name}
        </DirectorNameLink>
      ) : (
        <Inline>{name}</Inline>
      );
    };

    if (favoriteNames.length === 1) {
      return (
        <p>
          His favorite filmmakers include {renderName(favoriteNames[0])}, among others.
        </p>
      );
    }

    if (favoriteNames.length === 2) {
      return (
        <p>
          His favorite filmmakers include {renderName(favoriteNames[0])} and{' '}
          {renderName(favoriteNames[1])}, among others.
        </p>
      );
    }

    return (
      <p>
        His favorite filmmakers include{' '}
        {favoriteNames.map((name, idx) => {
          const isLast = idx === favoriteNames.length - 1;
          const isSecondLast = idx === favoriteNames.length - 2;
          return (
            <Inline key={`${normalizeName(name) || name}-${idx}`}>
              {renderName(name)}
              {isLast ? null : isSecondLast ? ', and ' : ', '}
            </Inline>
          );
        })}
        , among others.
      </p>
    );
  };

  return (
    <>
      <HeroBand>
        <HeroInner>
          <HeroTextStack
            title={aboutContent?.header?.title || 'About James'}
            subtitle={aboutContent?.header?.subtitle || 'Film Enthusiast and Critic'}
            showDivider
            size="hero"
            tone="onPrimary"
          />
        </HeroInner>
      </HeroBand>
      <StaticPageShell>
        <AfterHeroSpacer />

        <AboutSection>
          <AboveFold>
            <div>
              {/* Placeholder image path; add file at `client/public/images/james-trapp.png` */}
              <AuthorPhoto
                src="/images/james-trapp.png"
                alt="James Trapp"
                loading="lazy"
              />
            </div>
            <div>
              {personalLead.map((p, i) => (
                <p key={`lead-${i}`}>{p}</p>
              ))}
            </div>
          </AboveFold>

          {personalRemainder.map((p, i) => (
            <p key={`rest-${i}`}>{p}</p>
          ))}

          {renderFilmmakerSentence()}

          <p>{aboutContent?.aboutJames?.criticismLine}</p>

          <Button
            onClick={() => setIsGradingOpen(true)}
            style={{ marginTop: '0.05rem', marginBottom: '0.9rem' }}
          >
            View James&apos; Film Grading System
          </Button>

          <Paragraphs text={aboutContent.aboutJames.closing} />
        </AboutSection>

        <AboutSection title="About This Website">
          <Paragraphs text={aboutContent.aboutWebsite.intro} />

          {aboutContent.aboutWebsite.contentTypes.map((type, index) =>
            (() => {
              const normalizedTitle = String(type?.title || '').toLowerCase();
              const to =
                normalizedTitle === 'director spotlights'
                  ? '/directors'
                  : normalizedTitle === 'individual film reviews'
                    ? '/search_movies'
                    : null;

              if (to) {
                return (
                  <ContentTypeLink
                    key={index}
                    to={to}
                    title={
                      to === '/directors'
                        ? 'Browse Director Highlights'
                        : 'Search and browse movie reviews'
                    }
                  >
                    <h4>{type.title}</h4>
                    <p>{type.description}</p>
                  </ContentTypeLink>
                );
              }

              return (
                <ContentType key={index}>
                  <h4>{type.title}</h4>
                  <p>{type.description}</p>
                </ContentType>
              );
            })()
          )}
        </AboutSection>

        <AboutSection title="Get in Touch">
          <Paragraphs text={aboutContent.contact.intro} />

          {aboutContent.contact.methods.map((method, index) => (
            <ContactMethod key={index}>
              <span className="type">{method.type}:</span>
              <span className="value">
                {method.type === 'Contact' ? (
                  <ContactPageLink to="/contact">Contact page</ContactPageLink>
                ) : (
                  method.value
                )}
              </span>
            </ContactMethod>
          ))}
        </AboutSection>
      </StaticPageShell>

      <GradingModal isOpen={isGradingOpen} onClose={() => setIsGradingOpen(false)} />
    </>
  );
}

export default About;
