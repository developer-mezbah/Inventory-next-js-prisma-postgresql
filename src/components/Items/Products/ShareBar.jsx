import React, { useState } from 'react';

// Importing icons from 'react-icons/fa' (Font Awesome) and 'react-icons/hi' (Heroicons)
import { FaWhatsapp, FaRegCopy } from 'react-icons/fa';
import { HiOutlineMail, HiOutlineChatAlt } from 'react-icons/hi';

// Mock data for the content to be shared
const SHARE_DATA = {
  url: 'https://example.com/professional-project-link',
  title: 'Check out this professional project!',
  body: 'This is a high-quality, professional project I wanted to share with you.',
};

/**
 * Custom hook to handle copy functionality with a brief feedback message
 */
const useClipboard = (textToCopy) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    // Note: In a real-world application, you would use navigator.clipboard.writeText.
    // We use a fallback here for better compatibility within certain sandboxed environments.
    const tempInput = document.createElement('textarea');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset feedback after 2 seconds
    console.log(`Copied to clipboard: ${textToCopy}`);
  };

  return { copied, copyToClipboard };
};

/**
 * Individual Share Button Component
 */
const ShareButton = ({ icon: Icon, label, color, onClick, isCopy = false, copied = false }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center text-center group transition duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded-lg"
      style={{ minWidth: '80px' }}
      aria-label={`Share via ${label}`}
    >
      <div className={`p-3 rounded-full ${color} bg-opacity-10 group-hover:bg-opacity-20 transition duration-200`}>
        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${color}`} />
      </div>
      <span className={`mt-2 text-xs sm:text-sm font-medium ${isCopy && copied ? 'text-green-600' : 'text-gray-700'} group-hover:text-gray-900 transition duration-200`}>
        {isCopy && copied ? 'COPIED!' : label}
      </span>
    </button>
  );
};

/**
 * Main Share Bar Component
 */
const ShareBar = () => {
  const { url, title, body } = SHARE_DATA;
  const { copied, copyToClipboard } = useClipboard(url);

  // Handlers for specific share actions
  const handleEmail = () => {
    const subject = encodeURIComponent(title);
    const bodyText = encodeURIComponent(`${body}\n\nLink: ${url}`);
    window.open(`mailto:?subject=${subject}&body=${bodyText}`, '_self');
    console.log('Opened Email client for sharing.');
  };

  const handleSMS = () => {
    const text = encodeURIComponent(`${title}: ${url}`);
    window.open(`sms:?body=${text}`, '_self');
    console.log('Opened SMS client for sharing.');
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${title}: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    console.log('Opened WhatsApp client for sharing.');
  };

  const shareOptions = [
    {
      icon: HiOutlineMail,
      label: 'EMAIL',
      color: 'text-red-600',
      onClick: handleEmail,
    },
    {
      icon: HiOutlineChatAlt,
      label: 'SMS',
      color: 'text-gray-500',
      onClick: handleSMS,
    },
    {
      icon: FaWhatsapp,
      label: 'WHATSAPP',
      color: 'text-green-500',
      onClick: handleWhatsApp,
    },
    {
      icon: FaRegCopy,
      label: 'COPY LINK',
      color: 'text-indigo-500',
      onClick: copyToClipboard,
      isCopy: true,
      copied: copied,
    },
  ];

  return (
    <div className="flex justify-center p-4 sm:p-6 bg-white border shadow-xl rounded-2xl max-w-lg w-full h-40">
      <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full">
        {shareOptions.map((option, index) => (
          <ShareButton key={index} {...option} />
        ))}
      </div>
    </div>
  );
};
export default ShareBar;