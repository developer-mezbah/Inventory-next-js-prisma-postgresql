'use client';

import React, { useState, useEffect } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { FaCalendarAlt } from 'react-icons/fa';
import { BsCalendarDate, BsCalendarCheck } from 'react-icons/bs';
import { MdDateRange } from 'react-icons/md';
import { CiAlarmOn } from 'react-icons/ci';

const CustomDatePicker = ({
  value,
  onChange,
  label = "Select Date",
  placeholder = "Choose a date",
  format = "DD-MMM-YYYY", // Default format: 25-Feb-2026
  icon = "calendar",
  size = "medium", // small, medium, large
  disabled = false,
  required = false,
  error = "",
  helperText = "",
  className = "",
  showToday = true,
  defaultValue = null,
  minDate = null,
  maxDate = null,
  disabledDate = null,
}) => {
  const [selectedDate, setSelectedDate] = useState(defaultValue ? dayjs(defaultValue) : null);
  const [today] = useState(dayjs());



  // Icon selection based on prop
  const getIcon = () => {
    switch (icon) {
      case 'calendar':
        return <FaCalendarAlt className="text-gray-400" />;
      case 'date':
        return <BsCalendarDate className="text-gray-400" />;
      case 'check':
        return <BsCalendarCheck className="text-gray-400" />;
      case 'range':
        return <MdDateRange className="text-gray-400" />;
      default:
        return <FaCalendarAlt className="text-gray-400" />;
    }
  };

  // Size classes
  const sizeClasses = {
    small: {
      container: "p-2",
      icon: "text-sm",
      picker: "h-8",
      label: "text-xs",
    },
    medium: {
      container: "p-3",
      icon: "text-base",
      picker: "h-10",
      label: "text-sm",
    },
    large: {
      container: "p-4",
      icon: "text-lg",
      picker: "h-12",
      label: "text-base",
    },
  };

  // Handle date change
  const handleDateChange = (date, dateString) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(dayjs(dateString, format).toDate(), date);
    }
  };

  // Format the display value
  const formatDisplayValue = () => {
    if (selectedDate) {
      return selectedDate.format(format);
    }
    if (defaultValue) {
      return dayjs(defaultValue).format(format);
    }
    return showToday ? today.format(format) : '';
  };

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {/* Label with icon */}
      {label && (
        <label className={`flex items-center gap-2 font-medium text-gray-700 ${sizeClasses[size].label}`}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Date Picker Container */}
      <div className={`relative bg-white border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'} hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all`}>
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          defaultValue={defaultValue ? dayjs(defaultValue) : (showToday ? today : null)}
          format={format}
          placeholder={placeholder}
          disabled={disabled}
          size={size === 'large' ? 'large' : size === 'small' ? 'small' : 'middle'}
          className="w-full border-0 focus:outline-none focus:ring-0 p-2"
        //   popupClassName="custom-datepicker-popup"
          disabledDate={disabledDate}
          minDate={minDate ? dayjs(minDate) : null}
          maxDate={maxDate ? dayjs(maxDate) : null}
          allowClear
          suffixIcon={<span className={sizeClasses[size].icon}>{getIcon()}</span>}
        />
      </div>

      {/* Display current value (optional) */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          {/* {selectedDate && (
            <span className="text-gray-600">
              Selected: <span className="font-semibold text-blue-600">{formatDisplayValue()}</span>
            </span>
          )} */}
        </div>
        {helperText && !error && (
          <span className="text-gray-400">{helperText}</span>
        )}
        {error && (
          <span className="text-red-500 text-xs">{error}</span>
        )}
      </div>
    </div>
  );
};

export default CustomDatePicker;