"use client"

import { useEffect, useState } from "react"

/**
 * Hook to detect media query matches
 * Useful for responsive design and conditional rendering
 *
 * @param query - CSS media query string (e.g., "(max-width: 768px)")
 * @returns boolean - true if query matches, false otherwise
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)")
 * const isDesktop = useMediaQuery("(min-width: 1024px)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    // Create listener for changes
    const listener = () => setMatches(media.matches)

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener("change", listener)
      return () => media.removeEventListener("change", listener)
    }

    // Fallback for older browsers
    media.addListener(listener)
    return () => media.removeListener(listener)
  }, [matches, query])

  return matches
}
