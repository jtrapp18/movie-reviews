import styled from 'styled-components';

const Button = styled.button.attrs(props => ({
  type: props.type || 'button'
}))`
  /* Reset browser defaults */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  
  /* Button styling */
  width: fit-content;
  margin: 5px;
  color: var(--cinema-black);
  background: var(--cinema-gold);
  border: 2px solid var(--cinema-gold-dark);
  border-radius: 15px;
  padding: 5px;
  min-width: 120px;
  height: fit-content;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: var(--cinema-gold-dark);
    border-color: var(--cinema-gold-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--cinema-gold), 0.3);
  }

  &:disabled {
    background-color: var(--cinema-gray-dark);
    color: black;
    border: 2px solid black;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled(Button)`
  background-color: var(--cinema-red);
  color: white;
  border: 2px solid var(--cinema-red-dark);

  &:hover {
    background-color: var(--cinema-red-dark);
    border-color: var(--cinema-red-dark);
  }
`;

const CancelButton = styled(Button)`
  background-color: var(--cinema-gray-light);
  border: 2px solid var(--cinema-gray);

  &:hover {
    background-color: var(--cinema-gray);
    border-color: var(--cinema-gray);
  }
`;

const ExtractButton = styled(Button)`
  background-color: var(--cinema-blue);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: ${props => props.isExtracting ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.isExtracting ? 0.6 : 1};

  &:hover {
    background-color: var(--cinema-blue-dark);
    border-color: var(--cinema-blue-dark);
  }
`;

export { Button, DeleteButton, CancelButton, ExtractButton };
