"use client"
import React, { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of a component.
 * @param {Function} handler - Callback to be called on outside click.
 * @returns {React.RefObject} - Ref to attach to the target DOM element.
 */
const useOutsideClick = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    // Use 'mousedown' or 'touchstart' for better event order handling
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]); // Re-run effect if the handler function changes (wrap in useCallback if needed)

  return ref;
};

export default useOutsideClick; // Export this hook