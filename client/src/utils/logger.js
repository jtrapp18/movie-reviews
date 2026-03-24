/**
 * Optional verbose diagnostics for local debugging.
 * Set `VITE_ENV=dev` in `.env.local` to enable `devDebug` output.
 *
 * Otherwise use the console directly: `console.error`, `console.warn`, `console.info`.
 */

export function isDevDebugEnabled() {
  return import.meta.env.VITE_ENV === 'dev';
}

/** Calls `console.debug` only when `VITE_ENV=dev`. */
export function devDebug(...args) {
  if (!isDevDebugEnabled()) return;
  console.debug(...args);
}
