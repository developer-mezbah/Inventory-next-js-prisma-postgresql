import { useCallback, useEffect } from "react";

const CashAdjustmentModal = ({ isOpen, onClose, onSave, isSaving, title, children }) => {
  // Use useCallback to memoize the function, preventing unnecessary re-renders
  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Disable body scrolling when the modal is open for better UX
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scrolling
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) {
    return null;
  }

  return (
    // 1. Modal Backdrop (Overlay)
    <div
      className={`fixed fade-in inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300`}
      // Close modal on backdrop click
      onClick={isSaving ? null : onClose} // Prevent closing when saving
      style={{
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(1px)"
      }}
    >
      {/* 2. Modal Container */}
      {/* Stop click propagation to prevent closing when clicking inside the modal content */}
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 id="modal-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 cursor-pointer bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
            disabled={isSaving}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Modal Body (Content) */}
        <div className="p-6">
          {children}
        </div>

        {/* Modal Footer (Action buttons) */}
        <div className="flex justify-end p-4 space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 cursor-pointer font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 cursor-pointer font-medium text-white bg-red-600 rounded-full hover:bg-red-700 shadow-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px]"
            disabled={isSaving}
          >
            {isSaving ? (
              // Loading Spinner
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashAdjustmentModal;