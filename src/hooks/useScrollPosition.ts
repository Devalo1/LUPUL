import { useState, useEffect } from 'react';

interface ScrollPosition {
  scrollX: number;
  scrollY: number;
  isScrolled: boolean;
  scrollDirection: 'up' | 'down' | 'none';
}

/**
 * Hook to track scroll position and direction
 * @param threshold - The amount of pixels to scroll before isScrolled becomes true
 * @returns ScrollPosition object
 */
export function useScrollPosition(threshold = 50): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    scrollX: 0,
    scrollY: 0,
    isScrolled: false,
    scrollDirection: 'none',
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollPosition = () => {
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const isScrolled = scrollY > threshold;
      
      let scrollDirection: 'up' | 'down' | 'none' = 'none';
      if (scrollY > lastScrollY) {
        scrollDirection = 'down';
      } else if (scrollY < lastScrollY) {
        scrollDirection = 'up';
      }
      
      lastScrollY = scrollY;

      setScrollPosition({
        scrollY,
        scrollX,
        isScrolled,
        scrollDirection,
      });
    };

    // Initial check
    updateScrollPosition();

    window.addEventListener('scroll', updateScrollPosition);
    
    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
    };
  }, [threshold]);

  return scrollPosition;
}

export default useScrollPosition;
