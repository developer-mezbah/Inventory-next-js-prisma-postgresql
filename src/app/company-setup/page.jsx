"use client";

import CompanyCard from "@/components/ChangeCompany/CompanyCard";
import CompanyListHeader from "@/components/ChangeCompany/CompanyListHeader";
import Footer from "@/components/ChangeCompany/Footer";
import Loading from "@/components/Loading";
import { useFetchData } from "@/hook/useFetchData";
import useOutsideClick from "@/hook/useOutsideClick";
import client_api from "@/utils/API_FETCH";
import { unslugifyRole } from "@/utils/roleTransform";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";

// const mockCompanies = [
//     {
//         id: 1,
//         name: "Mezbah Uddin",
//         badge: "Current Company",
//         badgeColor: "orange",
//         lastSaleCreated: "09/11/2025 at 09:50 pm",
//         syncStatus: "SYNC ON",
//         isSyncOn: true,
//     },
//     {
//         id: 2,
//         name: "My Company",
//         badge: null,
//         lastSaleCreated: null,
//         syncStatus: "SYNC OFF",
//         isSyncOn: false,
//     },
// ]

// Components for tab content (simulated)
const MyCompaniesContent = ({ filteredCompanies, user }) => (
  <div className="space-y-4">
    {/* Info and Actions Bar */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <p className="text-gray-600">
        Below are the company that are created by you
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            signOut({ redirect: true, callbackUrl: "/" });
            client_api.delete("/api/company/connect");
          }}
          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition"
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
        <button className="p-2 hover:bg-gray-200 rounded-lg transition">
          <FiRefreshCw className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>

    {/* Company Cards */}
    {filteredCompanies.length > 0 ? (
      filteredCompanies.map((company) => (
        <CompanyCard user={user} key={company.id} company={company} />
      ))
    ) : (
      <div className="text-center py-12">
        <p className="text-gray-500">No companies found</p>
      </div>
    )}
  </div>
);

const SharedCompaniesContent = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { data: session, update } = useSession();
  const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData(
    `/api/company/share-with-me?userId=${session?.user?.id}&email=${session?.user?.email}`,
    ["share-with-me"]
  );

  // Function to toggle the dropdown state for a specific company
  const toggleDropdown = (companyId) => {
    if (selectedCompany === companyId) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      setSelectedCompany(companyId);
      setIsDropdownOpen(true);
    }
  };

  const dropdownRef = useOutsideClick(() => {
    setIsDropdownOpen(false);
    setSelectedCompany(null);
  });

  const router = useRouter();

  const handleOpenLeaveCompany = (id, companyName, role, status) => {
    client_api
      .update(`/api/company/share-with-me`, "token", {
        userId: session?.user?.id,
        email: session?.user?.email,
        status: status,
        id: id,
        role: role,
      })
      .then((res) => {
        if (res?.status) {
          if (res?.data?.status === "OPEN") {
            update({ ...session?.user, role });
            router.push("/");
          } else {
            refetch();
          }
        }
      });

    if (status === "LEAVE") {
      client_api.delete("/api/company/connect");
      update({ ...session?.user, role: null });
      toast.success("You Leaved from this Company.");
    }
  };

  if (isInitialLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 border rounded-lg shadow-xl bg-white space-y-4 mx-auto w-full max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 border rounded-lg shadow-xl bg-white space-y-4 mx-auto w-full max-w-7xl">
        <div className="text-center text-red-600">
          Error loading shared companies
        </div>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 border rounded-lg shadow-xl bg-white space-y-4 mx-auto w-full max-w-7xl">
        <div className="py-8 sm:py-12 text-center text-gray-500">
          <p className="text-base sm:text-lg">
            No companies shared with you yet.
          </p>
          <p className="text-sm sm:text-base mt-2 text-gray-400">
            Companies shared with you will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      {/* Shared Companies Section */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 px-2 sm:px-0">
          Companies Shared With You
        </h3>

        {data.data.map((company) => (
          <div
            key={company.id}
            className="p-4 sm:p-6 lg:p-8 rounded-lg shadow-xl bg-white space-y-4 w-full"
          >
            {/* Company Info Section with Dropdown */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 lg:gap-0">
              {/* Company Name Display */}
              <div className="flex flex-col space-y-2 sm:space-y-3 sm:w-full lg:w-auto">
                <span className="font-bold text-base sm:text-lg lg:text-xl text-indigo-600">
                  <span className="text-black">Company Name:</span>{" "}
                  {company.company.name}
                </span>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 text-sm sm:text-base text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Role:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded">
                      {/* {company.role.replace(/_/g, " ")} */}
                      {unslugifyRole(company.role)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Status:</span>
                    <span
                      className={`px-2 py-1 text-xs sm:text-sm font-medium rounded ${
                        company.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : company.status === "LEAVE"
                          ? "bg-red-100 text-red-800" // <-- New condition for LEAVE
                          : "bg-green-100 text-green-800" // <-- Default/APPROVED status
                      }`}
                    >
                      {company?.status === "OPEN"
                        ? "Opened"
                        : company.status === "LEAVE"
                        ? "Leaved"
                        : company?.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leave Button (Always visible) */}
              <div className="flex md:flex-col gap-3 w-full md:w-auto mt-2 lg:mt-0">
                <button
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition duration-150 ease-in-out w-full xs:w-auto"
                  onClick={() =>
                    handleOpenLeaveCompany(
                      company.id,
                      company.company.name,
                      company?.role,
                      "OPEN"
                    )
                  }
                >
                  Open
                </button>
                <button
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition duration-150 ease-in-out w-full xs:w-auto"
                  onClick={() =>
                    handleOpenLeaveCompany(
                      company.id,
                      company.company.name,
                      company?.role,
                      "LEAVE"
                    )
                  }
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CompanyListPage() {
  const defaultTabId = "my-companies";
  const [activeTabUrlSegment, setActiveTabUrlSegment] = useState(defaultTabId);
  const [searchQuery, setSearchQuery] = useState("");
  // const [companies, setCompanies] = useState([])
  const { data: session, status } = useSession();
  const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData(`/api/company?userId=${session?.user?.id}`, ["comapny"]);

  // Use the URL hash to set the active tab on mount and hash change
  useEffect(() => {
    const handleHashChange = () => {
      // Remove the '#' from the hash, or use default if empty
      const hash = window.location.hash.substring(1) || defaultTabId;
      setActiveTabUrlSegment(hash);
    };

    // Set initial active tab
    handleHashChange();

    // Listen for hash changes (e.g., back/forward buttons)
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [defaultTabId]);

  const filteredCompanies = useMemo(() => {
    // Note: Only 'my-companies' currently uses the mock data and filter
    return data.filter((company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  // Define tabs with their URL segment and content component
  const tabsData = [
    {
      id: "shared", // URL segment: #shared
      label: "Companies Shared with Me",
      url: "#shared",
      tabcontent: <SharedCompaniesContent />,
    },
    {
      id: "my-companies", // URL segment: #my-companies (or default)
      label: "My Companies",
      url: "#my-companies",
      tabcontent: (
        <MyCompaniesContent
          user={session?.user}
          filteredCompanies={filteredCompanies}
        />
      ),
    },
  ];

  // Function to change the tab (updates the URL hash)
  const handleTabChange = (tabId) => {
    if (activeTabUrlSegment !== tabId) {
      window.location.hash = tabId; // This also triggers the useEffect 'hashchange' listener
    }
  };

  // Get the content for the currently active tab
  const activeTab =
    tabsData.find((tab) => tab.id === activeTabUrlSegment) || tabsData[1]; // Default to 'My Companies'

  if (isInitialLoading || status === "loading") {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <CompanyListHeader
        activeTab={activeTab.id} // Pass the ID from the URL state
        setActiveTab={handleTabChange} // Pass the function to change the URL
        tabs={tabsData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1 md:px-6 md:py-8 p-2 max-w-7xl mx-auto w-full">
        {/* Render the content based on the active tab from the URL */}
        {activeTab.tabcontent}
      </main>

      {/* Footer */}
      <Footer user={session?.user} refetch={refetch} />
    </div>
  );
}
