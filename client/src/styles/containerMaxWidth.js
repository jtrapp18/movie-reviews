/** Max widths for centered page shells (SearchPageFrame, etc.) */
export const CONTAINER_MAX_WIDTH = {
  /** Current default: reading column */
  narrow: 'min(900px, 90vw)',
  /** Home + side rail: room for feed + panel without going edge-to-edge */
  medium: 'min(1200px, 94vw)',
  /** Widest bounded content */
  full: 'min(1400px, 96vw)',
};
