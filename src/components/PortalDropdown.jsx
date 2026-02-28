"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Simple dropdown component using portal
const PortalDropdown = ({ isOpen, onClose, triggerRef, children, position = "bottom-end" }) => {
  const [dropdownStyle, setDropdownStyle] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Calculate dropdown dimensions (approximate)
      const dropdownWidth = 160; // w-40 = 10rem = 160px
      const dropdownHeight = 88; // approximate height for 2 buttons

      let top, left;

      if (position === "bottom-end") {
        left = trigger.right - dropdownWidth;
        top = trigger.bottom + 5;

        // Check if dropdown goes below viewport
        if (top + dropdownHeight > viewportHeight) {
          top = trigger.top - dropdownHeight - 5;
        }

        // Check if dropdown goes off left edge
        if (left < 5) {
          left = trigger.left;
        }

        // Check if dropdown goes off right edge
        if (left + dropdownWidth > viewportWidth - 5) {
          left = viewportWidth - dropdownWidth - 5;
        }
      } else if (position === "right-start") {
        left = trigger.right + 5;
        top = trigger.top;

        // Check if dropdown goes off right edge
        if (left + dropdownWidth > viewportWidth - 5) {
          left = trigger.left - dropdownWidth - 5;
        }

        // Check if dropdown goes below viewport
        if (top + dropdownHeight > viewportHeight) {
          top = viewportHeight - dropdownHeight - 5;
        }
      }

      setDropdownStyle({
        position: 'fixed',
        top: `${Math.max(5, top)}px`,
        left: `${Math.max(5, left)}px`,
        zIndex: 99999,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, triggerRef, position]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};

export default PortalDropdown;