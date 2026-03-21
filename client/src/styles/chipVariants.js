/**
 * Shared chip / pill tokens aligned with ZoomControlsContainer (the gray bar),
 * not ZoomButton circles — uses --background-tertiary so the fill is theme-aware
 * and never soft-white (light: gray; dark: cinema-gray).
 *
 * Use for: line-note timestamp chips in rich HTML, <Tag variant="zoom" />.
 */
export const CHIP_VARIANT_ZOOM = {
  backgroundColor: 'var(--background-tertiary)',
  textColor: 'var(--font-color-1)',
  borderColor: 'transparent',
};
