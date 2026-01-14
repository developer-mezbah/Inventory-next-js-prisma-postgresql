import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to calculate the position of a dropdown relative to a button.
 * @param {React.RefObject<HTMLElement>} buttonRef - Ref object for the button/trigger element.
 * @returns {{top: number | null, left: number | null, calculatePosition: () => void}}
 */
const useDropdownPosition = (buttonRef) => {
    // 1. State to hold the calculated position
    const [position, setPosition] = useState({ top: null, left: null });

    // 2. The core positioning logic, memoized with useCallback
    const calculatePosition = useCallback(() => {
        if (buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();

            // Position the top edge of the dropdown just below the button (e.g., + 4px offset)
            const top = buttonRect.bottom + 4;
            // Position the left edge of the dropdown to align with the start of the button
            const left = buttonRect.left;

            setPosition({ top, left });
        }
    }, [buttonRef]); // Dependency on buttonRef ensures the latest ref is used

    // 3. Effect to calculate the position on mount and whenever dependencies change
    useEffect(() => {
        calculatePosition();

        // 4. Optional: Recalculate position on window resize or scroll
        window.addEventListener('resize', calculatePosition);
        window.addEventListener('scroll', calculatePosition);

        return () => {
            window.removeEventListener('resize', calculatePosition);
            window.removeEventListener('scroll', calculatePosition);
        };
    }, [calculatePosition]);

    // Return the position and the function in case the user needs to recalculate manually
    return { position, calculatePosition };
};

export default useDropdownPosition;






// import React, { useRef } from 'react';
// import useDropdownPosition from './useDropdownPosition'; // Adjust path as needed

// const DropdownComponent = () => {
//     // 1. Create a ref for the button element
//     const buttonRef = useRef(null);

//     // 2. Use the custom hook, passing the button ref
//     const { position } = useDropdownPosition(buttonRef);

//     return (
//         <div>
//             {/* Attach the ref to the trigger element */}
//             <button ref={buttonRef}>
//                 Open Menu
//             </button>

//             {/* The element to be positioned (the dropdown) */}
//             {/* The 'position' must be applied using style properties */}
//             <div
//                 style={{
//                     position: 'absolute', // Required for top/left to work
//                     top: position.top ?? 0, // Use 0 as fallback or handle null/loading state
//                     left: position.left ?? 0,
//                     border: '1px solid black',
//                     padding: '10px',
//                     zIndex: 10,
//                     // You'll likely need to conditionally render this element
//                     display: position.top === null ? 'none' : 'block'
//                 }}
//             >
//                 Dropdown Content
//             </div>
//         </div>
//     );
// };

// export default DropdownComponent;