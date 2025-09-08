import React from 'react';
import styled from 'styled-components';
import yaml from 'js-yaml';
import aboutContentYaml from '../data/aboutContent.yaml?raw';
import Section from '../components/Section';
import List from '../components/List';

const aboutContent = yaml.load(aboutContentYaml);

const AboutContainer = styled.div`
  max-width: min(800px, 90vw);
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 2.5rem) clamp(1rem, 4vw, 1.25rem);
  color: white;
  line-height: 1.6;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: clamp(2.5rem, 6vw, 3.125rem);
  
  h1 {
    color: var(--cinema-gold);
    font-size: clamp(2rem, 6vw, 3rem);
    margin-bottom: 0.625rem;
  }
  
  .subtitle {
    color: var(--cinema-silver);
    font-size: clamp(1.1rem, 3vw, 1.5rem);
    font-style: italic;
  }
`;

const ContentType = styled.div`
  background: var(--cinema-gray);
  padding: clamp(1rem, 3vw, 1.25rem);
  margin: clamp(0.75rem, 2vw, 0.9375rem) 0;
  border-radius: 0.5rem;
  border-left: 4px solid var(--cinema-gold);
  
  h4 {
    color: var(--cinema-gold);
    margin: 0 0 0.625rem 0;
    font-size: clamp(1rem, 2.5vw, 1.2rem);
  }
  
  p {
    margin: 0;
    color: var(--cinema-silver);
    font-size: clamp(0.9rem, 2vw, 1rem);
  }
`;

const ContactMethod = styled.div`
  display: flex;
  align-items: center;
  margin: clamp(0.5rem, 1.5vw, 0.625rem) 0;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  .type {
    color: var(--cinema-gold);
    font-weight: bold;
    min-width: clamp(4rem, 10vw, 5rem);
    font-size: clamp(0.9rem, 2vw, 1rem);
  }
  
  .value {
    color: var(--cinema-silver);
    margin-left: clamp(0.75rem, 2vw, 0.9375rem);
    font-size: clamp(0.9rem, 2vw, 1rem);
  }
`;


function About() {
  return (
    <AboutContainer>
      <Header>
        <h1>{aboutContent.header.title}</h1>
        <div className="subtitle">{aboutContent.header.subtitle}</div>
      </Header>

      <Section title="About James">
        <p>{aboutContent.aboutJames.personalStory}</p>
        
        <p>{aboutContent.aboutJames.intro}</p>
        
        <h3>Favorite Directors</h3>
        <List items={aboutContent.aboutJames.favoriteDirectors} />

        <h3>Preferred Genres</h3>
        <List items={aboutContent.aboutJames.preferredGenres} />

        <h3>Favorite Film Eras</h3>
        <List items={aboutContent.aboutJames.favoriteEras} />

        <p>{aboutContent.aboutJames.philosophy}</p>

        <h3>Specialties</h3>
        <List items={aboutContent.aboutJames.specialties} />
      </Section>

      <Section title="About This Website">
        <p>{aboutContent.aboutWebsite.intro}</p>
        
        {aboutContent.aboutWebsite.contentTypes.map((type, index) => (
          <ContentType key={index}>
            <h4>{type.title}</h4>
            <p>{type.description}</p>
          </ContentType>
        ))}
      </Section>

      <Section title="Get in Touch">
        <p>{aboutContent.contact.intro}</p>
        
        {aboutContent.contact.methods.map((method, index) => (
          <ContactMethod key={index}>
            <span className="type">{method.type}:</span>
            <span className="value">{method.value}</span>
          </ContactMethod>
        ))}
      </Section>
    </AboutContainer>
  );
}

export default About;