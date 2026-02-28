'use client';

import React, { useState } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { FaCalendarAlt } from 'react-icons/fa';
import { BsCalendarDate, BsCalendarCheck } from 'react-icons/bs';
import { MdDateRange } from 'react-icons/md';

// Floating design classes (extracted from your FloatingInput component)
const getFloatingClasses = (size) => {
  const sizePadding = {
    small: "px-2 pb-1.5 pt-3",
    medium: "px-2.5 pb-2.5 pt-4",
    large: "px-3 pb-3 pt-5",
  };

  return {
    container: "relative border border-gray-300 shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 rounded-lg transition-all",
    picker: `
      block w-full text-sm text-gray-900 bg-transparent rounded-lg 
      border border-gray-300 shadow appearance-none 
      focus:outline-none focus:ring-0 focus:border-blue-600 
      peer transition-all 
      ${sizePadding[size] || sizePadding.medium}
    `,
    label: `
      absolute text-md text-gray-500 duration-300 transform -translate-y-4 scale-75 
      top-2 z-10 origin-left bg-white px-2 
      peer-focus:px-2 peer-focus:text-blue-600 
      peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 
      peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 
      peer-focus:-translate-y-4 start-1 pointer-events-none
      ${size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-md'}
    `,
    icon: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10",
  };
};

// Default design classes (from your original component)
const getDefaultClasses = (size, error) => {
  const sizePadding = {
    small: "p-2",
    medium: "p-3",
    large: "p-4",
  };

  const sizePicker = {
    small: "h-8",
    medium: "h-10",
    large: "h-12",
  };

  return {
    container: `relative bg-white border rounded-lg transition-all ${
      error ? 'border-red-500' : 'border-gray-300'
    } hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100`,
    picker: `w-full border-0 focus:outline-none focus:ring-0 ${sizePadding[size] || sizePadding.medium}`,
    label: `flex items-center gap-2 font-medium text-gray-700 mb-1 ${
      size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm'
    }`,
    icon: size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base',
  };
};

const CustomDatePicker = ({
  value,
  onChange,
  label = "Select Date",
  placeholder = "Choose a date",
  format = "DD-MMM-YYYY",
  icon = "calendar",
  size = "medium",
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
  floatingDesign = false, // New prop to toggle between designs
  padding = "8px", // Default padding for floating design
}) => {
  const [selectedDate, setSelectedDate] = useState(defaultValue ? dayjs(defaultValue) : null);
  const [today] = useState(dayjs());

  // Icon selection based on prop
  const getIcon = () => {
    const iconClass = floatingDesign 
      ? "text-gray-400" 
      : `text-gray-400 ${getDefaultClasses(size, error).icon}`;
    
    switch (icon) {
      case 'calendar':
        return <FaCalendarAlt className={iconClass} />;
      case 'date':
        return <BsCalendarDate className={iconClass} />;
      case 'check':
        return <BsCalendarCheck className={iconClass} />;
      case 'range':
        return <MdDateRange className={iconClass} />;
      default:
        return <FaCalendarAlt className={iconClass} />;
    }
  };

  // Handle date change
  const handleDateChange = (date, dateString) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(dayjs(dateString, format).toDate(), date);
    }
  };

  // Get classes based on design type
  const classes = floatingDesign ? getFloatingClasses(size) : getDefaultClasses(size, error);

  // Render floating design
  const renderFloatingDesign = () => (
    <div className={classes.container}>
      <DatePicker
        value={selectedDate}
        onChange={handleDateChange}
        defaultValue={defaultValue ? dayjs(defaultValue) : (showToday ? today : null)}
        format={format}
        placeholder=" " // Empty placeholder for floating effect
        disabled={disabled}
        size={size === 'large' ? 'large' : size === 'small' ? 'small' : 'middle'}
        className={classes.picker}
        style={{padding: padding}}
        disabledDate={disabledDate}
        minDate={minDate ? dayjs(minDate) : null}
        maxDate={maxDate ? dayjs(maxDate) : null}
        allowClear
        suffixIcon={null} // Hide default suffix icon
        popupClassName="custom-datepicker-popup"
      />
      
      {/* Floating Label */}
      <label className={classes.label}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Custom Icon */}
      {icon && (
        <div className={classes.icon}>
          {getIcon()}
        </div>
      )}
    </div>
  );

  // Render default design
  const renderDefaultDesign = () => (
    <>
      {/* Label with icon */}
      {label && (
        <label className={classes.label}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Date Picker Container */}
      <div className={classes.container}>
        <DatePicker
          value={selectedDate}
          onChange={handleDateChange}
          defaultValue={defaultValue ? dayjs(defaultValue) : (showToday ? today : null)}
          format={format}
          placeholder={placeholder}
          disabled={disabled}
          size={size === 'large' ? 'large' : size === 'small' ? 'small' : 'middle'}
          className={classes.picker}
        style={{padding: padding}}
          disabledDate={disabledDate}
          minDate={minDate ? dayjs(minDate) : null}
          maxDate={maxDate ? dayjs(maxDate) : null}
          allowClear
          suffixIcon={<span>{getIcon()}</span>}
          popupClassName="custom-datepicker-popup"
        />
      </div>
    </>
  );

  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {/* Render appropriate design based on floatingDesign prop */}
      {floatingDesign ? renderFloatingDesign() : renderDefaultDesign()}

      {/* Helper text and error message (common for both designs) */}
      <div className="flex items-center justify-between text-xs px-1 min-h-[20px]">
        <div className="flex items-center gap-1">
          {/* Space for any additional info */}
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