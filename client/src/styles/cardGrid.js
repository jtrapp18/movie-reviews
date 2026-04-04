import styled from 'styled-components';

/**
 * Shared layout for article/movie poster grids (Articles page, Search Movies, etc.).
 * Two columns on small screens when paired with MediaCard $fillGridCell.
 */
export const MediaCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
  padding: 0;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
`;

export const MediaCardCell = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: 0;
`;
