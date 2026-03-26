import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router doesn't automatically reset scroll on navigation.
 * Mount once near the root layout to ensure every route change scrolls to top.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Keep it predictable; don't animate.
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
}
