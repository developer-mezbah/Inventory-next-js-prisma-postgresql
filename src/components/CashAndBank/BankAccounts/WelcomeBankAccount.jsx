"use client"
import Link from 'next/link';
import React from 'react';

// --- Icon Components (Inline SVG for self-containment and single-file mandate) ---

// Icon for 'Print Bank Details' (Printer/Document)
const IconPrint = ({ className = "w-6 h-6" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v7H6z" />
  </svg>
);

// Icon for 'Unlimited Payment Types' (Layers/Stack)
const IconPayments = ({ className = "w-6 h-6" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

// Icon for 'Print UPI QR Code' (QR Code)
const IconQR = ({ className = "w-6 h-6" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
    <path d="M17 17h4v4" />
    <path d="M17 10h4" />
    <path d="M10 17h4" />
    <path d="M10 10h1" />
  </svg>
);

// --- Main Illustration Component (Bank with Coins) ---
const BankIllustration = () => (
  <div className="relative mx-auto my-10 w-full max-w-sm h-64 flex items-end justify-center">
    {/* Decorative Coins (Simplified) */}
    {[
      { top: 'top-12', left: 'left-4', rotate: '-15deg' },
      { top: 'top-4', right: 'right-12', rotate: '20deg' },
      { bottom: 'bottom-20', left: 'left-0', rotate: '30deg' },
      { bottom: 'bottom-40', right: 'right-0', rotate: '-25deg' },
    ].map((style, index) => (
      <div
        key={index}
        className="absolute w-10 h-10 rounded-full bg-yellow-400 border-4 border-yellow-500 shadow-md transform transition-transform duration-500 hover:scale-110"
        style={{ ...style, transform: `rotate(${style.rotate})` }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-lg text-yellow-800 font-bold">$</span>
      </div>
    ))}

    {/* Bank Building (Simplified SVG structure) */}
    <svg className="w-full h-auto max-h-56" viewBox="0 0 300 250" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base */}
      <rect x="20" y="200" width="260" height="50" fill="#E5E7EB" /> {/* Ground Base */}

      {/* Pillars */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={`pillar-${i}`} x={40 + i * 40} y="120" width="20" height="130" fill="#D1D5DB" />
      ))}

      {/* Roof (Pediment) */}
      <polygon points="25 120, 275 120, 150 40" fill="#F9FAFB" stroke="#9CA3AF" strokeWidth="3" />

      {/* Emblem/Logo (Circle on the pediment) */}
      <circle cx="150" cy="80" r="10" fill="#FBBF24" />

      {/* Entrances/Doorways */}
      <rect x="60" y="150" width="40" height="50" fill="#A9B1BB" />
      <rect x="125" y="150" width="50" height="50" fill="#9CA3AF" />
      <rect x="200" y="150" width="40" height="50" fill="#A9B1BB" />

    </svg>
  </div>
);

// --- Feature Card Component ---
const FeatureCard = ({ icon, title, description }) => (
  <div className="flex flex-col items-center md:items-start p-6 rounded-xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 text-center md:text-left">
    <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-50 text-blue-600">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
);

// --- Main Application Component ---
const WelcomeBankAccounts = ({pathname}) => {
  // Data for the feature cards
  const features = [
    {
      icon: <IconPrint />,
      title: "Print Bank Details on Invoices",
      description: "Print account details on invoices and get payments via NEFT/RTGS/IMPS.",
    },
    {
      icon: <IconPayments />,
      title: "Unlimited Payment Types",
      description: "Record transactions by methods like Banks, UPI, Net Banking and Cards.",
    },
    {
      icon: <IconQR />,
      title: "Print UPI QR Code on Invoices",
      description: "Print QR code on your invoices or send payment links to your customers.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <header className="text-center pt-8 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Manage Multiple Bank Accounts
          </h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            With Vyapar you can manage multiple banks and payment types like UPI, Net Banking and Credit Card.
          </p>
        </header>

        {/* Illustration */}
        <BankIllustration />

        {/* Feature Cards Grid (Responsive) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 max-w-4xl mx-auto px-4 md:px-0">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </section>

        {/* CTA Button */}
        <div className="flex justify-center mt-12 mb-16">
          {/* Removed the outer relative div and external pulsing span */}
          <Link
            // Added animate-pulse directly to the button
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-full shadow-lg hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-150 transform hover:scale-105 animate-pulse"
            href={pathname + `?create-cash-bank=open`}
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="5" y2="19" />
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
            <span>Add Bank Account</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default WelcomeBankAccounts;