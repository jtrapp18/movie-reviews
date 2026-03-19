import styled from 'styled-components';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.95rem;

  th,
  td {
    padding: 0.75rem 0.5rem;
    text-align: left;
  }

  thead {
    background: var(--background-secondary);
  }

  th {
    border-bottom: 2px solid var(--border);
    font-weight: 600;
  }

  tbody tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.02);
  }

  tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  td {
    border-bottom: 1px solid var(--border);
  }
`;

export { StyledTable };
