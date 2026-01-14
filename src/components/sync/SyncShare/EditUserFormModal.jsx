"use client";
import client_api from "@/utils/API_FETCH";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { IoMdCheckbox, IoMdClose } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

// --- Utility Hook (Placeholder/Mock - assuming this hook is available) ---
// Note: useOutsideClick is assumed to be defined in '@/hook/useOutsideClick'
const useOutsideClick = (handler) => {
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handler]);
  return ref;
};

// --- Mock Data & Configuration ---

const ROLES = [
  "Secondary Admin",
  "Salesman",
  "Biller",
  "Biller and Salesman",
  "CA/Accountant",
  "Stock Keeper",
  "CA/Account (Edit Access)",
];

const PERMISSION_ACTIONS = ["VIEW", "CREATE", "EDIT", "SHARE", "DELETE"];

// Base Permission Config 1 (Used for Secondary Admin, Biller)
const Biller = [
  {
    name: "Sale",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Payment-In",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Sale Order",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Credit Note",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Delivery Challan",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Estimate",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Expense",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Party",
    permissions: {
      view: true,
      create: true,
      edit: true,
      share: true,
      delete: false,
    },
  },
  {
    name: "Item",
    permissions: {
      view: true,
      create: false,
      edit: false,
      share: false,
      delete: false,
    },
  },
  {
    name: "Proforma",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
];

const SecondaryAdmin = [
  {
    name: "All Transactions",
    permissions: {
      view: true,
      create: true,
      edit: true,
      share: true,
      delete: true,
    },
  },
  {
    name: "Settings",
    permissions: {
      view: true,
      create: false,
      edit: true,
      share: false,
      delete: false,
    },
  },
  {
    name: "Sync Settings",
    permissions: {
      view: false,
      create: false,
      edit: false,
      share: false,
      delete: false,
    },
  },
  {
    name: "Reports",
    permissions: {
      view: true,
      create: false,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Stock Transfer",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: true,
    },
  },
  {
    name: "Party Smart Connect",
    permissions: {
      view: true,
      create: true,
      edit: true,
      share: false,
      delete: false,
    },
  },
];

const Salesman = [
  {
    name: "Sale",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Payment-In",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Sale Order",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Credit Note",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Delivery Challan",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Estimate",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Expense",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Proforma",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
];

const BillerAndSalseMan = [
  {
    name: "Sale",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Payment-In",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Sale Order",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Credit Note",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Delivery Challan",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Estimate",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Expense",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Party",
    permissions: {
      view: true,
      create: true,
      edit: true,
      share: true,
      delete: false,
    },
  },
  {
    name: "Item",
    permissions: {
      view: true,
      create: true,
      edit: true,
      share: true,
      delete: false,
    },
  },
  {
    name: "Proforma",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
];

const CaAccount = [
  {
    name: "All Transactions",
    permissions: {
      view: true,
      create: false,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Settings",
    permissions: {
      view: false,
      create: false,
      edit: false,
      share: false,
      delete: false,
    },
  },
  {
    name: "Sync Settings",
    permissions: {
      view: false,
      create: false,
      edit: false,
      share: false,
      delete: false,
    },
  },
  {
    name: "Reports",
    permissions: {
      view: true,
      create: true,
      edit: true,
      share: true,
      delete: true,
    },
  },
  {
    name: "Stock Transfer",
    permissions: {
      view: true,
      create: false,
      edit: false,
      share: true,
      delete: false,
    },
  },
];

const StockKeeper = [
  {
    name: "Purchase",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: false,
      delete: false,
    },
  },
  {
    name: "Payment-Out",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: false,
      delete: false,
    },
  },
  {
    name: "Purchase Order",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: false,
      delete: false,
    },
  },
  {
    name: "Debit Note",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: false,
      delete: false,
    },
  },
  {
    name: "Stock Transfer",
    permissions: {
      view: false,
      create: true,
      edit: false,
      share: true,
      delete: false,
    },
  },
];

const CaAccountEdit = [
  {
    name: "All Transactions",
    permissions: {
      view: true,
      create: true,
      edit: true,
      share: true,
      delete: true,
    },
  },
  {
    name: "Settings",
    permissions: {
      view: true,
      create: false,
      edit: true,
      share: false,
      delete: false,
    },
  },
  {
    name: "Sync Settings",
    permissions: {
      view: false,
      create: false,
      edit: false,
      share: false,
      delete: false,
    },
  },
  {
    name: "Reports",
    permissions: {
      view: true,
      create: false,
      edit: false,
      share: true,
      delete: false,
    },
  },
  {
    name: "Stock Transfer",
    permissions: {
      view: true,
      create: true,
      edit: false,
      share: true,
      delete: true,
    },
  },
  {
    name: "Party Smart Connect",
    permissions: {
      view: false,
      create: false,
      edit: false,
      share: false,
      delete: false,
    },
  },
];

// --- Dynamic Role Permission Mapping ---

const ROLE_PERMISSIONS_MAP = {
  "Secondary Admin": SecondaryAdmin,
  Biller: Biller,
  Salesman: Salesman,
  "Biller and Salesman": BillerAndSalseMan, // Could be a merged config in a real app
  "CA/Accountant": CaAccount,
  "Stock Keeper": StockKeeper,
  "CA/Account (Edit Access)": CaAccountEdit,
  // Default fallback in case a role isn't mapped
  default: SecondaryAdmin,
};

// --- Role Dropdown Component ---
const RoleDropdown = ({ currentRole, onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (newRole) => {
    onRoleChange(newRole);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex justify-between items-center w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{currentRole}</span>
        <FiChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {isOpen && (
        <div
          className="absolute left-0 right-0 z-50 mt-1 w-full rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
        >
          <div className="py-1 max-h-60 overflow-y-auto" role="none">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => handleChange(role)}
                className={`block w-full text-left px-4 py-2 text-sm transition duration-150 ease-in-out ${
                  role === currentRole
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                role="menuitem"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Permissions Table Component ---
// This component now receives the specific permissions array for the role

const PermissionsTable = ({ role, permissionsData }) => {
  // Fallback if no specific permission data is found (should be handled by the map)
  if (!permissionsData || permissionsData.length === 0) {
    return (
      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded-lg">
        No specific permissions configured for the **{role}** role.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Permissions for: <span className="text-blue-600">{role}</span>
      </h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                  Module / Transaction
                </th>
                {PERMISSION_ACTIONS.map((action) => (
                  <th
                    key={action}
                    className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[80px]"
                  >
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permissionsData.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition duration-100"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {item.name}
                  </td>
                  {PERMISSION_ACTIONS.map((action) => {
                    const key = action.toLowerCase();
                    // Use optional chaining for robustness against missing 'permissions' object or key
                    const isAllowed = item.permissions?.[key];

                    // Handle NA case (i.e., permission explicitly not defined for this module/action)
                    if (isAllowed === undefined) {
                      return (
                        <td
                          key={key}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          NA
                        </td>
                      );
                    }

                    return (
                      <td key={key} className="px-6 py-4 text-center text-lg">
                        {isAllowed ? (
                          <IoMdCheckbox
                            className="text-green-500 mx-auto"
                            aria-label={`Allowed to ${action}`}
                          />
                        ) : (
                          <IoMdClose
                            className="text-red-500 mx-auto"
                            aria-label={`Not allowed to ${action}`}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main Modal Component ---

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EditUserFormModal = ({
  isOpen,
  onClose,
  initialUserData,
  refetch,
  isExistingEmailsOfRole,
}) => {
  const { data: session } = useSession();
  // Mock initial user data if not provided
  const defaultData = {
    fullName: "",
    contact: "", // Should be an email
    role: "Secondary Admin", // Must be one of the ROLES
  };

  const hiderBoxRef = useOutsideClick(() => onClose());

  const [formData, setFormData] = useState(defaultData);
  const [errors, setErrors] = useState({}); // State for validation errors
  const [isSaving, setIsSaving] = useState(false); // State to disable button during save

  useEffect(() => {
    if (initialUserData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        fullName: initialUserData?.name,
        contact: initialUserData?.email,
        role: initialUserData?.role,
      });
    }
  }, [initialUserData]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field immediately when the user starts typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /**
   * Validation function
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Email is required.";
    } else if (!EMAIL_REGEX.test(formData.contact)) {
      newErrors.contact = "Please enter a valid email address.";
    }

    if (!formData.role.trim()) {
      newErrors.role = "User Role is required.";
    }
    if (formData.contact === session?.user?.email) {
      newErrors.contact = "You already owner of this Company!";
    }
    // if (isExistingEmailsOfRole.includes(formData.contact)) {
    //   newErrors.contact = "User already has access. Change the Email!";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return; // Stop if validation fails
    }

    setIsSaving(true);

    if (initialUserData) {
      client_api
        .update(`/api/user-role`, "token", {
          id: initialUserData?.id,
          ...formData,
        })
        .then(async (res) => {
          if (res?.status) {
            toast.success(res?.message);
            setFormData({
              fullName: "",
              contact: "",
              role: "",
            });
            onClose();
            refetch();
          } else {
            // Handle API error case (e.g., if response has status: false and a message)
            toast.error(res?.message || "Failed to save user data.");
          }
        })
        .catch((error) => {
          // Handle network or request error
          console.error("Save User API Error:", error);
          toast.error("An unexpected error occurred during save.");
        })
        .finally(() => {
          setIsSaving(false);
        });
    } else {
      client_api
        .create(`/api/user-role?userId=${session?.user?.id}`, "token", formData)
        .then((res) => {
          if (res?.status) {
            fetch("/api/user-role/resend-invite", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: "",
                email: formData.contact,
                name: formData.fullName,
                role: formData.role,
              }),
            });
            toast.success(res?.message);
            setFormData({
              fullName: "",
              contact: "",
              role: "",
            });
            onClose();
            refetch();
          } else {
            // Handle API error case (e.g., if response has status: false and a message)
            toast.error(res?.message || "Failed to save user data.");
          }
        })
        .catch((error) => {
          // Handle network or request error
          console.error("Save User API Error:", error);
          toast.error("An unexpected error occurred during save.");
        })
        .finally(() => {
          setIsSaving(false);
        });
    }
  };

  // **DYNAMICALLY SELECT PERMISSIONS BASED ON ROLE**
  const currentPermissionsData =
    ROLE_PERMISSIONS_MAP[formData.role] || ROLE_PERMISSIONS_MAP["default"];

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div
        ref={hiderBoxRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            disabled={isSaving} // Prevent closing while saving
          >
            <IoClose aria-label="Close modal" className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body: Form and Permissions */}
        <div className="p-6 space-y-8">
          {/* User Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="contact"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter Email <span className="text-red-500">*</span>
              </label>
              <input
                type="text" // Use text for generic contact/email input
                id="contact"
                name="contact"
                placeholder="Email"
                value={formData.contact}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border ${
                  errors.contact ? "border-red-500" : "border-gray-300"
                } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                User will receive an invite on this email.
              </p>
              {errors.contact && (
                <p className="mt-1 text-xs text-red-500">{errors.contact}</p>
              )}
            </div>

            {/* Choose User Role */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Choose User Role <span className="text-red-500">*</span>
              </label>
              <RoleDropdown
                currentRole={formData.role}
                onRoleChange={(newRole) => {
                  setFormData((prev) => ({ ...prev, role: newRole }));
                  setErrors((prev) => ({ ...prev, role: "" })); // Clear role error on change
                }}
              />
              {errors.role && (
                <p className="mt-1 text-xs text-red-500">{errors.role}</p>
              )}
            </div>
          </div>

          {/* Permissions Grid Section - Now uses the dynamically selected permission data */}
          <PermissionsTable
            role={formData.role}
            permissionsData={currentPermissionsData}
          />
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white p-6 border-t flex justify-end items-center z-10">
          <button
            onClick={handleSave}
            disabled={isSaving} // Disable button when saving
            className={`px-6 py-3 text-white font-semibold rounded-lg shadow-md transition duration-150 transform focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
              isSaving
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 hover:scale-[1.02] focus:ring-red-500"
            }`}
          >
            {isSaving
              ? "Saving..."
              : `${initialUserData ? "Update" : "Save"} User`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserFormModal;
