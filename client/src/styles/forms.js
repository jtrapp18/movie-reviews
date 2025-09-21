import styled from 'styled-components';

const StyledForm = styled.form`
  width: 100%;
  padding: 2%;
  overflow-y: visible;
  display: flex;
  flex-direction: column;

  h1 {
    padding: 5px;
    border-radius: 200px;
    text-align: center;
  }

  input, textarea, select, option {
    /* Reset browser defaults */
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    
    /* Styled form inputs */
    width: 100%;
    background: var(--cinema-gold);
    color: black;
    padding: 5px;
    border: 1px solid var(--cinema-gold-dark);
    border-radius: 4px;
    box-sizing: border-box;
  }

  textarea:hover, input:hover, select:hover {
    background: var(--cinema-gold-dark);
  }

  div {
    margin-bottom: 12px;
  }

  span {
    color: gray;
  }

  .submit-error {
    cursor: pointer;
  }
`;

export { StyledForm };
