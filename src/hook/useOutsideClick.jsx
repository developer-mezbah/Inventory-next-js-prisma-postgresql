"use client"
import React, { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of a component, excluding Floating UI elements.
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
      
      // Check if click is inside any Floating UI portal or dropdown
      const floatingUIElements = document.querySelectorAll('[data-floating-ui-portal], [data-floating-ui-root]');
      let isInsideFloatingUI = false;
      
      for (const element of floatingUIElements) {
        if (element.contains(event.target)) {
          isInsideFloatingUI = true;
          break;
        }
      }
      
      if (isInsideFloatingUI) {
        return; // Ignore clicks inside Floating UI elements
      }
      
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
};

export default useOutsideClick;