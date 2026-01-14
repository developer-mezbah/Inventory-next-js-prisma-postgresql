"use client";
import EditUserFormModal from "@/components/sync/SyncShare/EditUserFormModal";
import { useFetchData } from "@/hook/useFetchData";
import { DeleteAlert } from "@/utils/DeleteAlart";
import { unslugifyRole } from "@/utils/roleTransform";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaChevronDown,
  FaCrown,
  FaEdit,
  FaEllipsisV,
  FaEnvelope,
  FaPhoneAlt,
  FaPlus,
  FaQuestionCircle,
  FaRegTrashAlt,
} from "react-icons/fa";
import { IoReload } from "react-icons/io5";
import { toast } from "react-toastify";

// We need to map the generic/library-agnostic names used previously
// (e.g., IoMdAdd) to the Fa-prefixed names we just imported.
const IoMdAdd = FaPlus;
const IoMdHelpCircleOutline = FaQuestionCircle;
const IoMdMail = FaEnvelope;
const IoMdCall = FaPhoneAlt;
const IoMdCheckmarkCircleOutline = FaCheckCircle;
const FiEdit2 = FaEdit;
const FiChevronDown = FaChevronDown;
const HiOutlineDotsVertical = FaEllipsisV;

// Role mapping from API to display names
const ROLE_DISPLAY_NAMES = {
  SECONDARY_ADMIN: "Secondary Admin",
  SALESMAN: "Salesman",
  BILLER: "Biller",
  CA_ACCOUNTANT: "CA/Accountant",
  STOCK_KEEPER: "Stock Keeper",
  CA_ACCOUNT_EDIT_ACCESS: "CA/Account (Edit Access)",
  BILLER_AND_SALESMAN: "Biller and Salesman",
};

const ROLES = Object.values(ROLE_DISPLAY_NAMES);

// Status mapping with colors
const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "text-yellow-600 bg-yellow-50",
    dotColor: "bg-yellow-500",
  },
  OPEN: {
    label: "Open",
    color: "text-blue-600 bg-blue-50",
    dotColor: "bg-blue-500",
  },
  LEAVE: {
    label: "Leave",
    color: "text-red-600 bg-red-50",
    dotColor: "bg-red-500",
  },
  JOINED: {
    // Keep this for compatibility with existing status badge logic
    label: "Joined",
    color: "text-green-600 bg-green-50",
    dotColor: "bg-green-500",
  },
  REMOVED: {
    // Keep this for compatibility with existing status badge logic
    label: "Removed",
    color: "text-red-600 bg-red-50",
    dotColor: "bg-red-500",
  },
};

// --- Sub-Components ---

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${config.color}`}
    >
      <span className={`w-2 h-2 mr-2 rounded-full ${config.dotColor}`}></span>
      {config.label}
    </span>
  );
};

// --- MODIFIED RoleDropdown Component ---
const RoleDropdown = ({ currentRole, userId, onRoleChange, rowRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  // Calculate position when dropdown opens or when scrolling/resizing occurs
  const calculatePosition = () => {
    if (buttonRef.current && rowRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      // Position the top edge of the dropdown just below the button
      const top = buttonRect.bottom + 4;
      // Position the left edge of the dropdown to align with the start of the button
      const left = buttonRect.left;

      setPosition({ top, left });
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      // Recalculate position on scroll and resize events
      window.addEventListener("scroll", calculatePosition);
      window.addEventListener("resize", calculatePosition);
    } else {
      window.removeEventListener("scroll", calculatePosition);
      window.removeEventListener("resize", calculatePosition);
    }

    // Cleanup listeners
    return () => {
      window.removeEventListener("scroll", calculatePosition);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the button and outside the dropdown menu itself
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        !event.target.closest('[data-dropdown-id="role-dropdown"]')
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      // Recalculate position right before opening
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleChange = (newRole) => {
    onRoleChange(userId, newRole);
    setIsOpen(false);
  };

  // Only render the button here. The actual dropdown will be rendered at the root level (body/App container) using fixed position.
  return (
    <>
      <div className="relative inline-block text-left">
        <button
          type="button"
          ref={buttonRef}
          className="inline-flex justify-center items-center text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none"
          // onClick={handleToggle}
          aria-expanded={isOpen}
        >
          <span className="mr-1 py-1 px-2 bg-blue-50 rounded-lg">
            {currentRole}
          </span>
          {/* Change Role
          <FiChevronDown className="-mr-1 ml-1 h-4 w-4" aria-hidden="true" /> */}
        </button>
      </div>

      {/* Dropdown rendered outside the flow, using fixed positioning relative to the viewport */}
      {isOpen && (
        <div
          data-dropdown-id="role-dropdown" // Custom attribute for click-outside logic
          className="fixed z-50 w-56 origin-top-left rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition ease-out duration-100 transform scale-100"
          style={{ top: position.top, left: position.left }}
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
    </>
  );
};
// --- END MODIFIED RoleDropdown Component ---

// --- MODIFIED UserTableRow Component ---
const UserTableRow = ({ user, onAction, onEdit }) => {
  const rowRef = useRef(null); // Reference to the table row

  // Determine if user can change role (all users except those with null userId)
  const canChangeRole = user.userId !== null;

  // Determine contact type (email or phone)
  const contactType = user.email.includes("@") ? "email" : "phone";

  // Determine display status - map API status to display status
  const getDisplayStatus = () => {
    if (user.status === "PENDING") return "PENDING";
    if (user.status === "OPEN") return "OPEN";
    if (user.status === "LEAVE") return "LEAVE";
    return "PENDING"; // default
  };

  // Get display role name
  const displayRole = ROLE_DISPLAY_NAMES[user.role] || user.role;

  return (
    <tr
      className="border-b hover:bg-gray-50 transition duration-150"
      ref={rowRef}
    >
      <td className="px-4 py-3 text-gray-800 font-medium">{user.name}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        <div className="flex items-center">
          {contactType === "email" ? (
            <IoMdMail className="mr-2 text-gray-500" />
          ) : (
            <IoMdCall className="mr-2 text-gray-500" />
          )}

          <a
            href={
              contactType === "email"
                ? `mailto:${user.email}`
                : `tel:${user.email}`
            }
            className="hover:underline"
          >
            {user.email}
          </a>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={getDisplayStatus()} />
      </td>
      <td className="px-4 py-3 min-w-[200px] relative">
        {canChangeRole ? (
          <RoleDropdown
            currentRole={displayRole}
            userId={user.id}
            onRoleChange={onAction}
            rowRef={rowRef} // Pass rowRef to RoleDropdown
          />
        ) : (
          <div className="flex items-center space-x-2">
            <span className="py-1 px-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg">
              {displayRole}
            </span>
            <button
              onClick={() => onAction(user.id, "Resend Invite")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition duration-150"
            >
              Resend Invite
            </button>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-3 text-lg">
          <button
            onClick={() => onEdit(user.id, "Edit")}
            className="text-gray-500 hover:text-blue-600 transition duration-150 p-1 rounded-full hover:bg-blue-50"
            aria-label="Edit User"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={() => onAction(user.id, "Delete")}
            className="text-gray-500 hover:text-red-600 transition duration-150 p-1 rounded-full hover:bg-red-50"
            aria-label="Delete User"
          >
            <FaRegTrashAlt />
          </button>
        </div>
      </td>
    </tr>
  );
};
// --- END MODIFIED UserTableRow Component ---

const UserCard = ({ user, onAction, onEdit }) => {
  // Determine if user can change role
  const canChangeRole = user.userId !== null;

  // Determine contact type
  const contactType = user.email.includes("@") ? "email" : "phone";

  // Determine display status
  const getDisplayStatus = () => {
    if (user.status === "PENDING") return "PENDING";
    if (user.status === "OPEN") return "OPEN";
    if (user.status === "LEAVE") return "LEAVE";
    return "PENDING";
  };

  // Get display role name
  const displayRole = ROLE_DISPLAY_NAMES[user.role] || user.role;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 space-y-3">
      <div className="flex justify-between items-start">
        <div className="text-lg font-semibold text-gray-800">{user.name}</div>
        <div className="text-sm">
          <StatusBadge status={getDisplayStatus()} />
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex items-center">
          {contactType === "email" ? (
            <IoMdMail className="mr-2 text-gray-500" />
          ) : (
            <IoMdCall className="mr-2 text-gray-500" />
          )}
          <a
            href={
              contactType === "email"
                ? `mailto:${user.email}`
                : `tel:${user.email}`
            }
            className="hover:underline"
          >
            {user.email}
          </a>
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-gray-500 mb-1 uppercase">
          Role
        </div>
        {canChangeRole ? (
          <RoleDropdown
            currentRole={displayRole}
            userId={user.id}
            onRoleChange={onAction}
            rowRef={{ current: null }}
          />
        ) : (
          <div className="flex items-center space-x-2">
            <span className="py-1 px-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg">
              {displayRole}
            </span>
            <button
              onClick={() => onAction(user.id, "Resend Invite")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition duration-150"
            >
              Resend Invite
            </button>
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-gray-100 flex justify-end space-x-3">
        <button
          onClick={() => onEdit(user.id, "Edit")}
          className="text-gray-500 hover:text-blue-600 transition duration-150 p-2 rounded-full hover:bg-blue-50 text-xl"
          aria-label="Edit User"
        >
          <FiEdit2 />
        </button>
        <button
          onClick={() => onAction(user.id, "Delete")}
          className="text-gray-500 hover:text-red-600 transition duration-150 p-2 rounded-full hover:bg-red-50 text-xl"
          aria-label="Delete User"
        >
          <FaRegTrashAlt />
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---

const App = () => {
  const [users, setUsers] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const [initialUserData, setInitialUserData] = useState(null);

  const {
    isInitialLoading,
    error,
    data = [],
    refetch,
  } = useFetchData(`/api/user-role?userId=${session?.user?.id}`, ["user-role"]);

  // Fetch data from API
  useEffect(() => {
    if (data?.status) {
      setUsers(data?.data);
    }
  }, [data]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Convert display role back to API role format
      const apiRole =
        Object.keys(ROLE_DISPLAY_NAMES).find(
          (key) => ROLE_DISPLAY_NAMES[key] === newRole
        ) || newRole;

      // Update in state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: apiRole } : user
        )
      );

      // Call API to update role
      const response = await fetch("/api/user-role/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          role: apiRole,
          updatedBy: session?.user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      // Optionally revert the state change on error
    }
  };

  const handleAction = async (userId, action) => {
    if (action === "Resend Invite") {
      try {
        // Find the user
        const user = users.find((u) => u.id === userId);
        if (!user) return;

        // Call API to resend invite
        const response = await fetch("/api/user-role/resend-invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            email: user.email,
            name: user.name,
            role: unslugifyRole(user?.role) 
          }),
        });
        const data = await response.json();
        if (data.status === "success") {
          toast.success("Invitation resent successfully!");
        } else {
          toast.error("Failed to resend invitation: " + data.message);
        }
        if (!response.ok) {
          throw new Error("Failed to resend invite");
        }
      } catch (error) {
        console.error("Error resending invite:", error);
      }
    } else if (action === "Edit") {
      const findedData = users.find((item) => item?.id === userId);
      setInitialUserData({
        ...findedData,
        role: ROLE_DISPLAY_NAMES?.[findedData?.role],
      });
      setTimeout(() => {
        setIsOpen(true);
      }, 100);
    } else if (action === "Delete") {
      DeleteAlert(`/api/user-role?id=${userId}`).then((res) => {
        if (res) {
          toast.success("Successfully deleted");
          refetch();
        }
      });
    }
  };

  const handleMoreOptions = (option) => {
    setIsMenuOpen(false);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="mx-auto">
        {/* Top Header Section */}
        <header className="flex sm:flex-nowrap flex-wrap gap-2 justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            Sync & Share
            <FaCrown className="ml-2 text-yellow-500 text-xl" />
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => refetch()}
              className="flex items-center px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition duration-150 text-sm"
            >
              <IoReload className="mr-1 text-lg" />
              Reload
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="flex cursor-pointer items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition duration-150 text-sm"
            >
              <IoMdAdd className="mr-1 text-lg" />
              Add Users
            </button>
          </div>
        </header>

        {/* Current User & More Options */}
        <div className="flex justify-between items-start mb-8">
          <p className="text-sm text-gray-600">
            Currently logged in with the following number:
            <br />
            <span className="font-medium text-gray-800 flex items-center mt-0.5">
              {session?.user?.email || "your@gmail.com"}
              <IoMdCheckmarkCircleOutline className="ml-1 text-green-500" />
              <IoMdMail className="ml-1 text-green-500" />
            </span>
          </p>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full bg-white text-gray-500 shadow-md hover:bg-gray-100 transition duration-150 border border-gray-200"
              aria-label="More options"
            >
              <HiOutlineDotsVertical className="text-xl" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={() => handleMoreOptions("Disable Sync")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                  >
                    Disable Sync
                  </button>
                  <button
                    onClick={() => handleMoreOptions("Logout from Sync")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                  >
                    Logout from Sync
                  </button>
                  <button
                    onClick={() => handleMoreOptions("See User Activity")}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                  >
                    See User Activity
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Roles Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">User Roles</h2>
          <button className="px-3 py-1.5 bg-white text-blue-600 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition duration-150 text-sm">
            See User Activity
          </button>
        </div>

        {/* Desktop Table View (lg screens and up) */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "FULL NAME",
                    "PHONE/E-MAIL",
                    "STATUS",
                    "ROLE",
                    "ACTIONS",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    onAction={handleAction}
                    onEdit={handleAction}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View (sm to md screens) */}
        <div className="lg:hidden space-y-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onAction={handleAction}
              onEdit={handleAction}
            />
          ))}
        </div>
        <EditUserFormModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setInitialUserData(null);
          }}
          refetch={refetch}
          initialUserData={initialUserData}
          isExistingEmailsOfRole={users.map((item) => item?.email)}
        />
      </div>
    </div>
  );
};

export default App;
