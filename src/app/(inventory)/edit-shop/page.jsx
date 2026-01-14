"use client";
import Media from "@/components/gallery/Media";
import Loading from "@/components/Loading";
import { useFetchData } from "@/hook/useFetchData";
import useOutsideClick from "@/hook/useOutsideClick";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import client_api from "@/utils/API_FETCH";
import { countriesData } from "@/utils/CountriesData";
import { useEffect, useState } from "react";
import { BiCamera, BiLoader, BiSave } from "react-icons/bi";
import { toast } from "react-toastify";

// Mock data for dropdowns
const mockBusinessTypes = ["Retail", "Service", "Manufacturing", "E-commerce"];
const mockBusinessCategories = [
  "Electronics",
  "Clothing",
  "Food & Beverage",
  "Software",
];

const InputField = ({
  label,
  id,
  value,
  onChange,
  placeholder = "Enter details",
  type = "text",
  readOnly = false,
}) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`
        p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
        ${readOnly ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
      `}
    />
  </div>
);

const SelectField = ({ label, id, options, value, onChange }) => (
  <div className="flex flex-col space-y-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

// Component for the Profile Logo/Image Upload area
const ProfileLogoUploader = ({ logoUrl, onUploadClick }) => (
  <div className="flex justify-center mb-8">
    <div className="relative w-32 h-32">
      {/* Outer circle for styling */}
      <div className="w-full h-full rounded-full border-4 border-blue-500/20 flex items-center justify-center">
        {/* Inner logo container */}
        <div
          className={`w-28 h-28 rounded-full ${
            logoUrl ? "bg-gray-200" : "bg-blue-50"
          } flex items-center justify-center text-center p-2`}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Business Logo"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-blue-700 font-semibold text-sm">
              Add Logo
            </span>
          )}
        </div>
      </div>

      {/* Edit/Camera Button */}
      <button
        type="button"
        onClick={onUploadClick}
        className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg border border-gray-300 text-gray-600 hover:text-blue-600 transition duration-150"
        aria-label="Upload logo"
      >
        <BiCamera className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const App = () => {
  // Zustand currency store
  const {
    currencySymbol,
    currencyCode,
    availableCurrencies,
    setCurrency,
    updateFromCompanyData,
    searchCurrencies,
  } = useCurrencyStore();

  const [profile, setProfile] = useState({
    name: "",
    phoneNumber: "",
    emailId: "",
    businessType: "",
    businessCategory: "",
    businessAddress: "",
    websiteUrl: "",
    currencyCode: currencyCode,
    currencySymbol: currencySymbol,
    country: "",
    countryCode: "",
  });

  const [image, setImage] = useState([]);
  const [signature, setSignature] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [currency, setIsCurrency] = useState(null);
  console.log(currency);

  // Keep countries as local state (not in Zustand)
  const [availableCountries, setAvailableCountries] = useState(countriesData);

  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  const currencyBoxRef = useOutsideClick(() => setIsCurrencyOpen(false));
  const countryBoxRef = useOutsideClick(() => setIsCountryOpen(false));

  const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData("/api/company/edit-shop", ["edit-shop"]);

  useEffect(() => {
    if (data?.status) {
      const companyData = data.company;
      const newProfile = {
        name: companyData?.name || "",
        phoneNumber: companyData?.phoneNumber || "",
        emailId: companyData?.emailId || "",
        businessType: companyData?.businessType || "",
        businessCategory: companyData?.businessCategory || "",
        businessAddress: companyData?.businessAddress || "",
        websiteUrl: companyData?.websiteUrl || "",
        currencyCode: companyData?.currencyCode || currencyCode,
        currencySymbol: companyData?.currencySymbol || currencySymbol,
        country: companyData?.country || "",
        countryCode: companyData?.countryCode || "",
      };

      setProfile(newProfile);

      // Update Zustand currency store with company data
      updateFromCompanyData(companyData);

      setImage(companyData?.logoUrl ? [companyData?.logoUrl] : []);
      setSignature(
        companyData?.signatureUrl ? [companyData?.signatureUrl] : []
      );
    }
  }, [data]);

  // Sync Zustand currency state with local profile state
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      currencyCode: currencyCode,
      currencySymbol: currencySymbol,
    }));
  }, [currencyCode, currencySymbol]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleCurrencyChange = (currency) => {
    // Update Zustand store
    // setCurrency(currency);

    // Update local profile state
    setProfile((prev) => ({
      ...prev,
      currencyCode: currency.code,
      currencySymbol: currency.symbol,
    }));

    setIsCurrencyOpen(false);
    setCurrencySearch("");
  };

  const handleCountryChange = (country) => {
    // Only update local state for country
    setProfile((prev) => ({
      ...prev,
      country: country.name,
      countryCode: country.code,
    }));

    setIsCountryOpen(false);
    setCountrySearch("");
  };

  const handleSave = () => {
    setFormLoading(true);
    client_api
      .update("/api/company/edit-shop", "", {
        ...profile,
        logoUrl: image[0],
        signatureUrl: signature[0],
      })
      .then((res) => {
        if (res?.status) {
          setCurrency(currency);
          toast.success("Shop updated successfully:");
        } else {
          toast.error("Failed to update shop:");
        }
      })
      .catch((err) => {
        console.log("Error updating shop:", err);
      })
      .finally(() => {
        setFormLoading(false);
      });
  };

  // Use Zustand search function for currencies
  const filteredCurrencies = searchCurrencies(currencySearch);

  // Filter countries locally (not using Zustand)
  const filteredCountries = availableCountries.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.currency.toLowerCase().includes(countrySearch.toLowerCase())
  );

  if (isInitialLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-4 sm:p-6 font-inter">
      {/* Main Form Container */}
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-semibold text-gray-800">Edit Shop</h1>
        </div>

        {/* Form Body - Responsive Layout */}
        <div className="p-6">
          {/* Form Fields Grid: Responsive layout (1 column on mobile, 3 columns on tablet/desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-6">
            {/* Column 1: Business Details */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
                Business Details
              </h2>
              <InputField
                label="Business Name"
                id="name"
                value={profile.name}
                onChange={handleChange}
              />

              <InputField
                label="Phone Number"
                id="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                type="tel"
              />
              <InputField
                label="Email ID"
                id="emailId"
                value={profile.emailId}
                onChange={handleChange}
                type="email"
              />

              {/* Currency Selector with Search - Using Zustand */}
              <div className="space-y-2" ref={currencyBoxRef}>
                <label className="block text-sm font-medium text-gray-700">
                  Default Currency
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {currency?.symbol || currencySymbol}
                      </span>
                      <span className="text-gray-700">
                        {currency?.code || currencyCode}
                      </span>
                    </div>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        isCurrencyOpen ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isCurrencyOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                      {/* Search input */}
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search currency by code, symbol or name..."
                          value={currencySearch}
                          onChange={(e) => setCurrencySearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Currencies list from Zustand */}
                      <div className="overflow-y-auto max-h-52">
                        {filteredCurrencies.length > 0 ? (
                          filteredCurrencies.map((currency, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setIsCurrency(currency);
                                handleCurrencyChange(currency);
                              }}
                              className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                currencyCode === currency.code
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-medium">
                                  {currency.symbol}
                                </span>
                                <div>
                                  <div className="font-medium text-sm">
                                    {currency.code}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {currency.name}
                                  </div>
                                </div>
                              </div>
                              {currencyCode === currency.code && (
                                <svg
                                  className="w-4 h-4 text-blue-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 text-sm">
                            No currencies found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  This currency will be used for all transactions and invoices
                </p>
              </div>
            </div>

            {/* Column 2: More Details */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
                More Details
              </h2>
              <SelectField
                label="Business Type"
                id="businessType"
                options={mockBusinessTypes}
                value={profile.businessType}
                onChange={handleChange}
              />
              <SelectField
                label="Business Category"
                id="businessCategory"
                options={mockBusinessCategories}
                value={profile.businessCategory}
                onChange={handleChange}
              />
              <InputField
                label="Website URL"
                id="websiteUrl"
                value={profile.websiteUrl}
                onChange={handleChange}
                type="text"
              />

              {/* Country Selector - Local state only */}
              <div className="space-y-2" ref={countryBoxRef}>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <div className="flex items-center gap-2">
                      {profile.country ? (
                        <>
                          <span className="text-sm font-medium">
                            {profile.country}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({profile.countryCode})
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500">Select country...</span>
                      )}
                    </div>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        isCountryOpen ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isCountryOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col">
                      {/* Search input */}
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Countries list - Local state */}
                      <div className="overflow-y-auto max-h-52">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => handleCountryChange(country)}
                              className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                profile.countryCode === country.code
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-gray-700"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-4 flex items-center justify-center bg-gray-100 rounded text-xs font-bold">
                                  {country.code}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">
                                    {country.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {country.phoneCode}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  {country.currencySymbol}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {country.currency}
                                </span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 text-sm">
                            No countries found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 3: Address and Signature */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
                Business Address
              </h2>
              <div className="flex flex-col space-y-1">
                <textarea
                  id="businessAddress"
                  rows="4"
                  value={profile.businessAddress}
                  onChange={handleChange}
                  placeholder="Enter Business Address"
                  className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div>
                <Media
                  images={image}
                  setImages={setImage}
                  subTitle="Upload Business Logo"
                />
              </div>
              <div>
                <Media
                  images={signature}
                  setImages={setSignature}
                  subTitle="Upload Signature"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Action Buttons */}
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-3 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition duration-150"
          >
            {formLoading ? (
              <>
                <BiLoader className="w-4 h-4 mr-1" />
                Saving...
              </>
            ) : (
              <>
                <BiSave className="w-4 h-4 mr-1" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
