import { useState } from 'react';
import { Button, StaticPageShell, StyledForm } from '@styles';
import {
  StaticPageHeader,
  StaticPageSubtitle,
} from '@components/layout/staticPageStyles';


function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null

  // Check if all required fields are filled
  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.subject.trim() &&
    formData.message.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message);

      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StaticPageShell>
      <StaticPageHeader>
        <h1>Contact James</h1>
        <StaticPageSubtitle>
          Get in touch about film reviews, suggestions, or feedback
        </StaticPageSubtitle>
      </StaticPageHeader>

      <StyledForm onSubmit={handleSubmit}>
        {submitStatus === 'success' && (
          <div className="success-message">
            Success! Your message has been sent.
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
              cursor: !isFormValid ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
          {!isFormValid && (
            <p
              style={{
                color: 'var(--cinema-silver)',
                fontSize: '0.9rem',
                marginTop: '0.5rem',
                fontStyle: 'italic',
              }}
            >
              Please fill in all fields to send your message
            </p>
          )}
        </div>
      </StyledForm>
    </StaticPageShell>
  );
}

export default Contact;
