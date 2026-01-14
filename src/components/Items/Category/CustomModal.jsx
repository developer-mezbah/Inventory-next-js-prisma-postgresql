import React, { useState, useEffect, useCallback } from 'react';

// The duration of the CSS transition in milliseconds
const TRANSITION_DURATION = 300;

/**
 * Custom Modal component with smooth fade-in/fade-out transitions.
 * It manages mounting/unmounting after the CSS transition completes.
 * @param {{isOpen: boolean, onClose: () => void, children: React.ReactNode}} props
 */
const CustomModal = ({ isOpen, onClose, children, width }) => {
  // State to control if the modal content should be visible (for CSS transitions)
  const [isTransitioning, setIsTransitioning] = useState(false);
  // State to control if the modal component is mounted in the DOM
  const [isMounted, setIsMounted] = useState(false);

  // Effect to manage the transition and mounting state when 'isOpen' changes
  useEffect(() => {
    let timeoutId;

    if (isOpen) {
      // 1. Mount the component immediately
      setIsMounted(true);
      // 2. Wait a tick, then apply the 'shown' state to trigger fade-in
      timeoutId = setTimeout(() => setIsTransitioning(true), 10);
    } else {
      // 1. Apply the 'hidden' state to trigger fade-out
      setIsTransitioning(false);
      // 2. Wait for the transition to finish, then unmount
      timeoutId = setTimeout(() => setIsMounted(false), TRANSITION_DURATION);
    }

    // Cleanup the timeout on component unmount or state change
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  // Effect for handling the Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // If not mounted, render nothing
  if (!isMounted) return null;

  // Tailwind classes for the overlay
  const overlayClasses = `
    fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50
    transition-opacity duration-${TRANSITION_DURATION} ease-in-out
    ${isTransitioning ? 'opacity-100' : 'opacity-0'}
  `;

  // Tailwind classes for the modal content (scale and fade transition)
  const contentClasses = `
    bg-white rounded-xl shadow-2xl w-full ${width ? width: "max-w-sm"} mx-4 transform
    transition-all duration-${TRANSITION_DURATION} ease-in-out
    ${isTransitioning ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
  `;

  return (
    <div
      className={overlayClasses}
      onClick={onClose} // Close modal when clicking outside the content area
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Content container */}
      <div
        className={contentClasses}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
      >
        {children}
      </div>
    </div>
  );
};

export default CustomModal;