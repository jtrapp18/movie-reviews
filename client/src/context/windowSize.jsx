import { createContext, useState, useEffect } from 'react';

const WindowWidthContext = createContext();

function layoutFlagsForWidth(width) {
  return {
    isMobile: width <= 768,
    isTablet: width >= 769 && width <= 1024,
  };
}

const WindowWidthProvider = ({ children }) => {
  const [layoutFlags, setLayoutFlags] = useState(() =>
    layoutFlagsForWidth(window.innerWidth)
  );

  useEffect(() => {
    const handleResize = () => setLayoutFlags(layoutFlagsForWidth(window.innerWidth));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <WindowWidthContext.Provider
      value={{
        isMobile: layoutFlags.isMobile,
        isTablet: layoutFlags.isTablet,
      }}
    >
      {children}
    </WindowWidthContext.Provider>
  );
};

export { WindowWidthProvider, WindowWidthContext };
