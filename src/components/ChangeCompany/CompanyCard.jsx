"use client";

import useOutsideClick from "@/hook/useOutsideClick";
import client_api from "@/utils/API_FETCH";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";

export default function CompanyCard({ company, user }) {
  const [openMenu, setOpenMenu] = useState(null);
  const { data: session, update } = useSession();

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    setOpenMenu(openMenu === id ? null : id);
  };

  const dropdownRef = useOutsideClick(() => setOpenMenu(null));

  const handleCompanyConnect = () => {
    client_api
      .get(
        `/api/company/connect?companyId=${company?.id}&userId=${user?.id}`,
        "Token"
      )
      .then((data) => {
        console.log(data);
        if (data?.status) {
          update({ ...session?.user, role: "OWNER" }).then((res) => {
            window.location.href = "/";
          });
        }
      })
      .catch((error) => {
        console.error("Error connecting to company:", error);
      });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {company.name}
            </h3>
            {company?.active === true && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>

                {/* Text: "Current Company" */}
                <span className="text-md font-semibold text-blue-500">
                  Current Company
                </span>
              </div>
            )}
            {company.badge && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${
                  company.badgeColor === "orange"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {company.badge}
              </span>
            )}
          </div>
          {company.lastSaleCreated && (
            <p className="text-sm text-gray-500">
              Last Sale Created: {company.lastSaleCreated}
            </p>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 justify-end">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded" />
            <span
              className={`text-xs font-medium ${
                company.isSyncOn ? "text-green-600" : "text-gray-600"
              }`}
            >
              {company.syncStatus}
            </span>
          </div>

          <button
            onClick={handleCompanyConnect}
            className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
          >
            Open
          </button>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={(e) => handleMenuClick(e, company.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiMoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {openMenu === company.id && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              >
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 transition">
                  Edit
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 transition">
                  Duplicate
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600 transition">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
