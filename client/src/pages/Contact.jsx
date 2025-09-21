import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, StyledContainer } from '../styles';
import yaml from 'js-yaml';
import aboutContentYaml from '../data/aboutContent.yaml?raw';

const aboutContent = yaml.load(aboutContentYaml);

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: var(--cinema-gold);
    font-size: clamp(2rem, 6vw, 3rem);
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: var(--cinema-silver);
    font-size: clamp(1.1rem, 3vw, 1.3rem);
    font-style: italic;
  }
`;

const ContactForm = styled.form`
  width: 100%;
  background: var(--cinema-gray-dark);
  padding: 2rem;
  border-radius: 12px;
  border-left: 4px solid var(--cinema-gold);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    color: var(--cinema-gold);
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  input, textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    &:focus {
      outline: none;
      border-color: var(--cinema-gold);
      box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
    }
  }
  
  textarea {
    min-height: 180px;
    resize: vertical;
    font-family: inherit;
  }
  
  .submit-section {
    text-align: center;
    margin-top: 2rem;
  }
  
  .success-message {
    color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid rgba(76, 175, 80, 0.3);
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .error-message {
    color: var(--cinema-red);
    background: rgba(220, 20, 60, 0.1);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid rgba(220, 20, 60, 0.3);
    margin-bottom: 1rem;
    text-align: center;
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

      <ContactForm onSubmit={handleSubmit}>
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

        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
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
      </ContactForm>

    </StyledContainer>
  );
}

export default Contact;
