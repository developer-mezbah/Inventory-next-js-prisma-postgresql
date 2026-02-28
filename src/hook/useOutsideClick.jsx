"use client"
import React, { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of a component, excluding UI library popups.
 * @param {Function} handler - Callback to be called on outside click.
 * @param {Object} options - Configuration options.
 * @param {boolean} options.ignoreFloatingUI - Whether to ignore Floating UI elements.
 * @param {boolean} options.ignoreAntD - Whether to ignore Ant Design popups.
 * @returns {React.RefObject} - Ref to attach to the target DOM element.
 */
const useOutsideClick = (handler, options = { ignoreFloatingUI: true, ignoreAntD: true }) => {
  const ref = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      
      // Check for Floating UI elements
      if (options.ignoreFloatingUI) {
        const floatingUIElements = document.querySelectorAll('[data-floating-ui-portal], [data-floating-ui-root]');
        for (const element of floatingUIElements) {
          if (element.contains(event.target)) {
            return;
          }
        }
      }
      
      // Check for Ant Design popups
      if (options.ignoreAntD) {
        const antdPopupSelectors = [
          '.ant-picker-dropdown',
          '.ant-select-dropdown',
          '.ant-dropdown',
          '.ant-modal-root',
          '.ant-tooltip',
          '.ant-popover',
          '.ant-message',
          '.ant-notification'
        ];
        
        const antdPopupElements = document.querySelectorAll(antdPopupSelectors.join(','));
        for (const element of antdPopupElements) {
          if (element.contains(event.target)) {
            return;
          }
        }
      }
      
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, options.ignoreFloatingUI, options.ignoreAntD]);

  return ref;
};

export default useOutsideClick;