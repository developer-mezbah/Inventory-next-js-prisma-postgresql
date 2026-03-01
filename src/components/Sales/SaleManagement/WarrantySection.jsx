// WarrantySection.jsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FiClock, FiChevronDown, FiCheck } from "react-icons/fi";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
  useId,
} from "@floating-ui/react";

export default function WarrantySection({ warranty, onWarrantyChange }) {
  const [duration, setDuration] = useState(warranty?.duration || "");
  const [period, setPeriod] = useState(warranty?.period || "Years");
  const [isOpen, setIsOpen] = useState(false);

  const periods = ["Days", "Weeks", "Months", "Years"];

  // Memoize the warranty object to prevent unnecessary re-renders
  const warrantyData = useMemo(() => ({
    duration,
    period,
    enabled: true,
  }), [duration, period]);

  // Use useCallback for the change handler
  const handlePeriodSelect = useCallback((selectedPeriod) => {
    setPeriod(selectedPeriod);
    setIsOpen(false);
  }, []);

  // Update parent only when warrantyData changes, but not on initial mount
  useEffect(() => {
    // Skip if this is the initial mount and we're not in update mode
    if (!warranty?.duration && !duration) {
      return;
    }
    
    onWarrantyChange(warrantyData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, period]); // Only depend on primitive values, not warrantyData

  // Sync with parent warranty prop when it changes externally
  useEffect(() => {
    if (warranty && (warranty.duration !== duration || warranty.period !== period)) {
      setDuration(warranty.duration || "");
      setPeriod(warranty.period || "Years");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warranty]); // Only depend on warranty

  // Floating UI setup
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const headingId = useId();

  const getWarrantyEndDate = useCallback(() => {
    if (!duration) return null;
    
    const today = new Date();
    const endDate = new Date(today);
    
    switch (period) {
      case "Days":
        endDate.setDate(today.getDate() + parseInt(duration));
        break;
      case "Weeks":
        endDate.setDate(today.getDate() + (parseInt(duration) * 7));
        break;
      case "Months":
        endDate.setMonth(today.getMonth() + parseInt(duration));
        break;
      case "Years":
        endDate.setFullYear(today.getFullYear() + parseInt(duration));
        break;
      default:
        return null;
    }
    
    return endDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }, [duration, period]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gray-100 rounded-lg">
            <FiClock className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Warranty</h3>
            <p className="text-xs text-gray-500">Add warranty period for this order</p>
          </div>
        </div>

        {/* Warranty Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Duration Input */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Duration
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter duration"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all pr-20"
              />
              {duration && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {period}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Period Dropdown with Floating UI */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Period
            </label>
            <div ref={refs.setReference} {...getReferenceProps()}>
              <button
                type="button"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent flex items-center justify-between group hover:border-gray-400 transition-all"
              >
                <span className="text-gray-700">{period}</span>
                <FiChevronDown 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    isOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Floating Dropdown */}
            {isOpen && (
              <FloatingFocusManager context={context} modal={false}>
                <div
                  ref={refs.setFloating}
                  style={floatingStyles}
                  className="z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
                  aria-labelledby={headingId}
                  {...getFloatingProps()}
                >
                  <div className="py-1">
                    {periods.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePeriodSelect(p)}
                        className={`
                          w-full px-4 py-2.5 text-left flex items-center justify-between
                          hover:bg-gray-50 transition-colors
                          ${period === p ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}
                        `}
                      >
                        <span className="font-medium">{p}</span>
                        {period === p && (
                          <FiCheck className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </FloatingFocusManager>
            )}
          </div>
        </div>

        {/* Warranty Summary Card */}
        {duration && (
          <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center gap-3">
            <div className="p-1.5 bg-gray-200 rounded-full">
              <FiCheck className="w-3.5 h-3.5 text-gray-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{duration} {period}</span> warranty
              </p>
              <p className="text-xs text-gray-500">
                Valid until {getWarrantyEndDate()}
              </p>
            </div>
            <div className="text-xs font-medium text-gray-700 bg-gray-200 px-2 py-1 rounded-full">
              Active
            </div>
          </div>
        )}

        {/* Hint text for empty state */}
        {!duration && (
          <p className="text-xs text-gray-400 mt-3">
            Enter duration and select period
          </p>
        )}
      </div>
    </div>
  );
}