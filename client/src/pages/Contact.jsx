import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, StyledContainer, StyledForm } from '../styles';
import yaml from 'js-yaml';
import aboutContentYaml from '../data/aboutContent.yaml?raw';

const aboutContent = yaml.load(aboutContentYaml);

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: var(--cinema-gold-dark);
    font-size: clamp(2rem, 6vw, 3rem);
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: var(--cinema-silver);
    font-size: clamp(1.1rem, 3vw, 1.3rem);
    font-style: italic;
  }
`;


function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  // Check if all required fields are filled
  const isFormValid = formData.name.trim() && 
                     formData.email.trim() && 
                     formData.subject.trim() && 
                     formData.message.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create mailto link with form data
      const email = aboutContent.contact.methods[0].value;
      const subject = encodeURIComponent(`Contact Form: ${formData.subject}`);
      const body = encodeURIComponent(
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n` +
        `Subject: ${formData.subject}\n\n` +
        `Message:\n${formData.message}`
      );
      
      // Open email client
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledContainer>
      <Header>
        <h1>Contact Jamie</h1>
        <div className="subtitle">Get in touch about film reviews, suggestions, or feedback</div>
      </Header>

      <StyledForm onSubmit={handleSubmit}>
        {submitStatus === 'success' && (
          <div className="success-message">
            Your email client should open with a pre-filled message to Jamie. If it doesn't open, you can email him directly at {aboutContent.contact.methods[0].value}
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="error-message">
            Sorry, there was an error sending your message. Please try again.
          </div>
        )}

        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="What's this about?"
            required
          />
        </div>

        <div>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Share your thoughts, questions, or suggestions..."
            required
          />
        </div>

        <div className="submit-section">
          <Button 
            type="submit" 
            disabled={isSubmitting || !isFormValid}
            style={{ 
              minWidth: '200px',
              opacity: !isFormValid ? 0.6 : 1,
              cursor: !isFormValid ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
          {!isFormValid && (
            <p style={{ 
              color: 'var(--cinema-silver)', 
              fontSize: '0.9rem', 
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              Please fill in all fields to send your message
            </p>
          )}
        </div>
      </StyledForm>

    </StyledContainer>
  );
}

export default Contact;
