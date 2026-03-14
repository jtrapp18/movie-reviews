import React from 'react';
import styled from 'styled-components';
import yaml from 'js-yaml';
import aboutContentYaml from '../data/aboutContent.yaml?raw';
import AboutSection from '../components/AboutSection';
import List from '../components/List';
import { StyledContainer } from '../styles';

const aboutContent = yaml.load(aboutContentYaml);

const Header = styled.div`
  text-align: center;
  
  h1 {
    // color: var(--cinema-gold);
    // font-size: clamp(2rem, 6vw, 3rem);
    margin-bottom: 0.625rem;
  }
  
  .subtitle {
    // color: var(--cinema-silver);
    // font-size: clamp(1.1rem, 3vw, 1.5rem);
    font-style: italic;
  }
`;

function Paragraphs({ text }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((s) => s.trim().replace(/\n/g, ' '))
    .filter(Boolean);
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </>
  );
}

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
    // color: var(--cinema-silver);
    // font-size: clamp(0.9rem, 2vw, 1rem);
  }
`;

const ContactMethod = styled.div`
  display: flex;
  // align-items: center;
  // margin: clamp(0.5rem, 1.5vw, 0.625rem) 0;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  .type {
    // color: var(--cinema-gold);
    font-weight: bold;
    min-width: clamp(4rem, 10vw, 5rem);
    // font-size: clamp(0.9rem, 2vw, 1rem);
  }
  
  .value {
    // color: var(--cinema-silver);
    margin-left: clamp(0.75rem, 2vw, 0.9375rem);
    // font-size: clamp(0.9rem, 2vw, 1rem);
  }
`;


function About() {
  return (
    <StyledContainer>
      <Header>
        <h1>{aboutContent.header.title}</h1>
        <div className="subtitle">{aboutContent.header.subtitle}</div>
      </Header>

      <AboutSection>
        <Paragraphs text={aboutContent.aboutJames.personalStory} />

        <Paragraphs text={aboutContent.aboutJames.intro} />

        <h3>His favorite filmmakers include:</h3>
        <List items={aboutContent.aboutJames.favoriteDirectors} />

        <Paragraphs text={aboutContent.aboutJames.closing} />

      </AboutSection>

      <AboutSection title="About This Website">
        <Paragraphs text={aboutContent.aboutWebsite.intro} />
        
        {aboutContent.aboutWebsite.contentTypes.map((type, index) => (
          <ContentType key={index}>
            <h4>{type.title}</h4>
            <p>{type.description}</p>
          </ContentType>
        ))}
      </AboutSection>

      <AboutSection title="Get in Touch">
        <Paragraphs text={aboutContent.contact.intro} />
        
        {aboutContent.contact.methods.map((method, index) => (
          <ContactMethod key={index}>
            <span className="type">{method.type}:</span>
            <span className="value">{method.value}</span>
          </ContactMethod>
        ))}
      </AboutSection>
    </StyledContainer>
  );
}

export default About;