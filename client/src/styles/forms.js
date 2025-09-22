import styled from 'styled-components';

const StyledForm = styled.form`
  width: 100%;
  background: var(--cinema-gray-dark);
  padding: 2rem;
  border-radius: 12px;
  border-left: 4px solid var(--cinema-gold-dark);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  overflow-y: visible;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    border: none;
    padding: 0;
    background: none;
  }

  h1 {
    padding: 5px;
    border-radius: 200px;
    text-align: center;
  }

  label {
    display: block;
    color: var(--cinema-gold-dark);
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  input, textarea, select, option {
    /* Reset browser defaults */
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    
    /* Styled form inputs */
    width: 100%;
    padding: 12px 16px;
    border: 2px solid rgba(184, 134, 11, 0.3);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-sizing: border-box;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
    
    &:focus {
      outline: none;
      border-color: var(--cinema-gold-dark);
      box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.2);
    }
  }

  textarea {
    min-height: 180px;
    resize: vertical;
    font-family: inherit;
  }

  div {
    margin-bottom: 1.5rem;
  }

  .submit-error {
    cursor: pointer;
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

  .submit-section {
    text-align: center;
    margin-top: 2rem;
  }
`;

export { StyledForm };
