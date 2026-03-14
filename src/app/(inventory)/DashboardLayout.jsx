// components/DashboardClientLayout.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AiOutlineCodeSandbox, AiOutlinePlus } from "react-icons/ai";
import { CiGlobe, CiMenuFries } from "react-icons/ci";
import { FaChartLine } from "react-icons/fa";
import { GoBell } from "react-icons/go";
import { GrCloudUpload } from "react-icons/gr";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { HiOutlineReceiptPercent } from "react-icons/hi2";
import { IoMdClose, IoMdSync } from "react-icons/io";
import {
  IoCartOutline,
  IoChevronDownSharp,
  IoHomeOutline,
  IoSearch,
  IoSettingsOutline,
} from "react-icons/io5";
import { LiaMailBulkSolid } from "react-icons/lia";
import { LuWrench } from "react-icons/lu";
import { MdShoppingCartCheckout } from "react-icons/md";
import { PiBankLight, PiUsers } from "react-icons/pi";
import { RiMenuAddFill } from "react-icons/ri";
import { TbShoppingBag } from "react-icons/tb";
import { TiHomeOutline } from "react-icons/ti";

import AddPurchaseBtn from "@/components/AddPurchaseBtn";
import { Avatar } from "@/components/avatar";
import Loading from "@/components/Loading";
import SettingsModal from "@/components/SettingsModal";
import { checkAccess, ROLE_DISPLAY_NAMES } from "@/utils/roleTransform";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./style.css"; // Fixed import path
import StateMiddleware from "@/components/stateMiddleware";

// Function to get display name for any role, including OWNER
const getRoleDisplayName = (role) => {
  if (role === "OWNER") {
    return "Owner";
  }
  return ROLE_DISPLAY_NAMES[role] || role;
};

// Filter menu items based on user role
const filterMenuItemsByRole = (menuItems, userRole) => {
  if (!userRole) return [];

  if (userRole === "OWNER" || userRole === "SECONDARY_ADMIN") return menuItems;

  return menuItems
    .map((item) => {
      const hasAccessToMainItem = checkAccess(
        userRole,
        item.href || "",
        item.name
      );

      if (item.subItems) {
        const filteredSubItems = item.subItems.filter((subItem) =>
          checkAccess(userRole, subItem.href, subItem.name)
        );

        if (filteredSubItems.length > 0 || hasAccessToMainItem) {
          return {
            ...item,
            subItems: filteredSubItems,
          };
        }
        return null;
      }

      return hasAccessToMainItem ? item : null;
    })
    .filter(Boolean);
};

const initMenuItems = [
  {
    name: "Home",
    icon: <TiHomeOutline />,
    href: "/",
  },
  {
    name: "Parties",
    icon: <PiUsers />,
    subItems: [
      { name: "Party Details", href: "/parties/party-details" },
      { name: "Loyalty Points", href: "/parties/loyalty-points" },
    ],
  },
  {
    name: "Testing Pages",
    icon: <PiUsers />,
    subItems: [
      { name: "Purchase Form", href: "/testing/purchase-form" },
      { name: "Item Form", href: "/testing/item-form" },
      { name: "Add More Menu Col", href: "/testing/menucolumn" },
      { name: "Edit Profile", href: "/testing/edit-profile" },
      { name: "Notification", href: "/testing/notification" },
      { name: "Setting Modal", href: "/testing/setting-modal" },
      { name: "Category Selector", href: "/testing/category" },
      { name: "Reports", href: "/testing/reports" },
      {
        name: "Transaction Table",
        href: "/testing/transaction-table",
      },
      { name: "Change Company", href: "/change-company" },
    ],
  },
  {
    name: "Items",
    icon: <TbShoppingBag />,
    subItems: [
      { name: "Product & Service", href: "/items/products" },
      { name: "Category", href: "/items/category" },
      { name: "Units", href: "/items/units" },
    ],
  },
  {
    name: "Sales",
    icon: <HiOutlineReceiptPercent />,
    subItems: [
      { name: "Sale Invoices", href: "/sales/sale-invoices" },
      {
        name: "Estimate/ Quotation",
        href: "/sales/estimate-quotation",
      },
      { name: "Proforma Invoice", href: "/sales/proforma-invoice" },
      { name: "Payment-In", href: "/sales/payment-in" },
      { name: "Sale Order", href: "/sales/sale-order" },
      {
        name: "Delivery Challange",
        href: "/sales/delivery-challange",
      },
      { name: "Sale Return", href: "/sales/sale-return" },
      { name: "Vypar POS", href: "/sales/pos" },
    ],
  },
  {
    name: "Purchase & Expense",
    icon: <IoCartOutline />,
    subItems: [
      { name: "Purchase Bils", href: "/purchase/purchase-bils" },
      { name: "Payment-Out", href: "/purchase/payment-out" },
      { name: "Expenses", href: "/purchase/expenses" },
      { name: "Add Expense", href: "/purchase/add-expense" },
      { name: "Purchase Order", href: "/purchase/purchase-order" },
      {
        name: "Purchase Return/ Dr. Note",
        href: "/purchase/purchase-return",
      },
    ],
  },
  {
    name: "Grow Your Business",
    icon: <FaChartLine />,
    subItems: [
      {
        name: "Google Profile Manager",
        href: "/business/google-profile",
      },
      {
        name: "Marketing Tools",
        href: "/business/marketing-tools",
      },
      { name: "Online Store", href: "/business/online-store" },
    ],
  },
  {
    name: "Cash & Bank",
    icon: <PiBankLight />,
    subItems: [
      { name: "Bank Accounts", href: "/cash-bank/bank-accounts" },
      { name: "Cash In Hand", href: "/cash-bank/cash-in-hand" },
      { name: "Cheques", href: "/cash-bank/cheques" },
      { name: "Loan Accounts", href: "/cash-bank/loan-accounts" },
    ],
  },
  {
    name: "Reports",
    icon: <HiOutlineDocumentReport />,
    href: "/reports",
  },
  {
    name: "Sync, Share & Backup",
    icon: <IoMdSync />,
    subItems: [
      {
        name: "Sync & Share",
        href: "/sync-share-backup/sync-share",
      },
      {
        name: "Auto Backup",
        href: "/sync-share-backup/auto-backup",
      },
      {
        name: "Backup To Computer",
        href: "/sync-share-backup/backup-to-computer",
      },
      {
        name: "Backup To Drive",
        href: "/sync-share-backup/backup-to-drive",
      },
      {
        name: "Restore Backup",
        href: "/sync-share-backup/restore-backup",
      },
    ],
  },
  {
    name: "Bulk GST Update",
    icon: <LiaMailBulkSolid />,
    href: "/bulk-gst-update",
  },
  {
    name: "Utilities",
    icon: <LuWrench />,
    subItems: [
      { name: "Import Items", href: "/utilities/import-items" },
      {
        name: "Barcode Generator",
        href: "/utilities/barcode-generator",
      },
      {
        name: "Update Items In Bulk",
        href: "/utilities/update-bulk",
      },
      { name: "Import Parties", href: "/utilities/import-parties" },
      {
        name: "Exports To Tally",
        href: "/utilities/exports-tally",
      },
      { name: "Export Items", href: "/utilities/export-items" },
      { name: "Verify My Data", href: "/utilities/verify-data" },
      { name: "Recycle Bin", href: "/utilities/recycle-bin" },
      {
        name: "Close Financial Year",
        href: "/utilities/close-financial",
      },
    ],
  },
  {
    name: "Uploaded Files",
    icon: <GrCloudUpload />,
    href: "/uploaded-files",
  },
  {
    name: "Settings",
    icon: "⚙️",
    subItems: [
      { name: "GENERAL", href: "/settings/general" },
      { name: "FORM SETTINGS", href: "/settings/form-settings" },
      { name: "TRANSACTION", href: "/settings/transaction" },
      { name: "PRINT", href: "/settings/print" },
      { name: "TAXES", href: "/settings/taxes" },
      {
        name: "TRANSACTION MESSAGE",
        href: "/settings/transaction-message",
      },
      { name: "PARTY", href: "/settings/party" },
      { name: "ITEM", href: "/settings/item" },
      {
        name: "SERVICE REMINDERS",
        href: "/settings/service-reminders",
      },
    ],
  },
];

// Bottom navigation items with role-based access
const getBottomNavItems = (userRole) => {
  const allItems = [
    {
      id: "HOME",
      label: "HOME",
      icon: <IoHomeOutline />,
      href: "/",
      roles: ["*"],
    },
    {
      id: "sale",
      label: "Add Sale",
      icon: <MdShoppingCartCheckout />,
      href: "/sale-management",
      roles: [
        "OWNER",
        "SECONDARY_ADMIN",
        "SALESMAN",
        "BILLER",
        "CA_ACCOUNTANT",
        "CA_ACCOUNT_EDIT_ACCESS",
        "BILLER_AND_SALESMAN",
      ],
    },
    {
      id: "ITEMS",
      label: "ITEMS",
      icon: <AiOutlineCodeSandbox />,
      href: "/items/products",
      roles: [
        "OWNER",
        "SECONDARY_ADMIN",
        "STOCK_KEEPER",
        "CA_ACCOUNTANT",
        "CA_ACCOUNT_EDIT_ACCESS",
      ],
    },
    {
      id: "MENU",
      label: "MENU",
      icon: <RiMenuAddFill />,
      action: "toggleMenu",
      roles: ["*"],
    },
  ];

  if (!userRole) return allItems.filter((item) => item.roles.includes("*"));

  return allItems.filter(
    (item) => item.roles.includes("*") || item.roles.includes(userRole)
  );
};

export default function DashboardLayout({
  children,
  userRole: initialUserRole,
  userName,
  userEmail,
  userImage
}) {
  const { data: session, status } = useSession();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const [screenWidth, setScreenWidth] = useState(0);
  const [menuItems, setMenuItems] = useState(initMenuItems || []);
  const [searchValue, setSearchValue] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeBottomNav, setActiveBottomNav] = useState("HOME");
  const [userRole, setUserRole] = useState(initialUserRole || null);
  const [isMounted, setIsMounted] = useState(false);

  const pathName = usePathname();
  const boxRef = useRef(null);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get user role from session - including OWNER role
  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role);
    }
  }, [session]);

  // Filter menu items based on role
  useEffect(() => {
    if (userRole) {
      const filteredItems = filterMenuItemsByRole(initMenuItems, userRole);
      setMenuItems(filteredItems);
    }
  }, [userRole]);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const handleClickOutside = (event) => {
    if (boxRef.current && !boxRef.current.contains(event.target)) {
      if (768 > window.innerWidth) {
        setToggleSidebar(false);
      }
    }
  };

  useEffect(() => {
    setScreenWidth(window.innerWidth);
    document.title = "Dashboard";
    document.addEventListener("mousedown", handleClickOutside);

    if (pathName === "/") {
      setActiveBottomNav("HOME");
    } else if (pathName.includes("/items")) {
      setActiveBottomNav("ITEMS");
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathName]);

  const filterMenuItems = (menu, searchTerm) => {
    return menu
      .map((item) => {
        if (item.name.toLowerCase().includes(searchTerm?.toLowerCase())) {
          return item;
        }

        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((subItem) =>
            subItem.name
              .toLowerCase()
              .includes(searchTerm?.toLowerCase() || "")
          );

          if (filteredSubItems.length > 0) {
            return { ...item, subItems: filteredSubItems };
          }
        }

        return null;
      })
      .filter(Boolean);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.length === 0) {
      const filteredItems = filterMenuItemsByRole(initMenuItems, userRole);
      setMenuItems(filteredItems);
    } else {
      const filteredMenu = filterMenuItems(initMenuItems, value);
      setMenuItems(filteredMenu);
    }
  };

  const handleBottomNavClick = (item) => {
    setActiveBottomNav(item.id);

    if (item.action === "toggleMenu") {
      setToggleSidebar(!toggleSidebar);
    }
  };

  const getBottomNavItemsForUser = getBottomNavItems(userRole);

  // During SSR or initial load, render a skeleton that matches the layout structure
  if (!isMounted || status === "loading") {
    return (
      <div className="flex">
        {/* Sidebar skeleton - matches your actual sidebar structure */}
        <div className="w-[256px] bg-gray-900 text-white p-4 h-screen fixed z-20">
          <div className="my-5">
            <div className="h-16 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          <div className="mb-3 px-3 py-1 bg-gray-800 rounded-lg text-sm text-center">
            <span className="text-gray-400">Loading role...</span>
          </div>

          <div className="relative mb-4">
            <div className="w-full h-10 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>

          <ul className="space-y-2">
            {/* Static menu items - render actual menu structure without interactivity */}
            {initMenuItems.slice(0, 5).map((item, index) => (
              <li key={index}>
                <div className="flex justify-between items-center w-full p-3 bg-gray-800 rounded-lg opacity-70">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-gray-700 rounded"></span>
                    <span className="bg-gray-700 h-4 w-24 rounded"></span>
                  </span>
                  {item.subItems && (
                    <span className="w-4 h-4 bg-gray-700 rounded"></span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Main content area skeleton */}
        <div className="ml-[256px] w-full">
          {/* Top bar skeleton */}
          <div className="fixed top-0 left-[256px] right-0 bg-white shadow-md p-4 h-[70px] flex justify-between items-center z-10">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex flex-col gap-1">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="mt-[70px] p-6">
            {children}
          </div>
        </div>

        {/* Mobile bottom nav skeleton */}
        <div className="mobile-bottom-nav md:hidden fixed bottom-0 w-full bg-white border-t">
          <div className="flex justify-around items-center h-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const canAccessCurrentPage =
    pathName === "/" ? true : checkAccess(userRole, pathName);

  if (!canAccessCurrentPage) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <div>
            <Link
              href="/company-setup"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Setup Company
            </Link>
            <Link
              href="/auth/login"
              className="ml-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex ${toggleSidebar ? "gap-5" : "gap-0"}`}>
        {/* sidebar */}
        <div
          ref={boxRef}
          className={`${toggleSidebar
              ? "w-[256px] visible fixed z-20"
              : "w-[0px] invisible fixed z-0"
            } transition-all overflow-hidden bg-gray-900 text-white p-4 h-screen`}
        >
          <Link href="/">
            <Image
              className="my-5 h-16 object-contain"
              width={200}
              height={100}
              alt="Dashboard Logo"
              src="/logo.png"
            />
          </Link>

          {userRole && (
            <div className="mb-3 px-3 py-1 bg-gray-800 rounded-lg text-sm text-center">
              <span className="text-gray-400">Role: </span>
              <span className="font-semibold text-blue-300">
                {getRoleDisplayName(userRole)}
              </span>
            </div>
          )}

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search in menu"
              value={searchValue}
              onChange={handleSearch}
              className="w-full p-2 pl-4 pr-10 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            {searchValue ? (
              <IoMdClose
                onClick={() => {
                  setSearchValue("");
                  const filteredItems = filterMenuItemsByRole(
                    initMenuItems,
                    userRole
                  );
                  setMenuItems(filteredItems);
                }}
                className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
              />
            ) : (
              <IoSearch className="absolute right-3 top-2.5 text-gray-400" />
            )}
          </div>

          <ul className="custom-scrollbox md:pb-40 pb-50">
            {menuItems.length === 0 ? (
              <li className="p-3 text-gray-400 text-center">
                No menu items available for your role
              </li>
            ) : (
              menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item?.href || "#"}
                    className={`flex justify-between items-center w-full p-3 mb-1 ${item?.href === pathName && "bg-gray-700"
                      } rounded-lg transition-all hover:bg-gray-700 ${item?.subItems?.some(
                        (nested) => pathName === nested?.href
                      ) && "bg-gray-700"
                      }`}
                    onClick={() => item.subItems && toggleDropdown(index)}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon} {item.name}
                    </span>
                    {item.subItems && item.subItems.length > 0 && (
                      <IoChevronDownSharp
                        className={`transition-transform ${openDropdown === index ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    )}
                  </Link>

                  {item.subItems && item.subItems.length > 0 && (
                    <ul
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${openDropdown === index ? "opacity-100" : "opacity-0"
                        }`}
                      style={{
                        maxHeight:
                          openDropdown === index
                            ? `${item?.subItems.length * 4}rem`
                            : "0",
                      }}
                    >
                      {item.subItems.map((subItem, subIndex) => (
                        <li
                          key={subIndex}
                          className={`pl-8 py-2 hover:bg-gray-800 rounded-md mt-1 ${pathName === subItem?.href && "bg-gray-800"
                            }`}
                        >
                          <Link
                            href={subItem?.href}
                            className="flex gap-2 items-center"
                          >
                            <span
                              className={`w-[5px] h-[5px] rounded-full border-slate-500 border-[1px] ${pathName === subItem?.href &&
                                "bg-slate-100 w-[7px] h-[7px]"
                                }`}
                            ></span>
                            <span>{subItem?.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>

        <div
          className={`mt-[70px] w-full transition-all ${toggleSidebar ? "md:ml-[256px] ml-0" : "ml-0"
            }`}
          style={{
            paddingBottom:
              typeof window !== "undefined" && window.innerWidth < 768
                ? "4rem"
                : "0",
          }}
        >
          <div>{children}</div>
        </div>

        {/* Top Bar */}
        <div
          className={`fixed ${toggleSidebar
              ? "md:left-[256px] left-0 md:w-[calc(100%-256px)] w-full"
              : "left-0 w-full"
            } transition-all bg-white shadow-md p-4 flex justify-between items-center h-[70px] overflow-hidden z-10`}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => setToggleSidebar(!toggleSidebar)}>
              <CiMenuFries className="text-gray-700 cursor-pointer" size={24} />
            </button>
            <CiGlobe className="text-gray-700 cursor-pointer" size={24} />
            <Link
              href="/"
              className="text-gray-700 font-semibold hover:text-blue-500"
            >
              Home
            </Link>
            {checkAccess(userRole, "/sales/sale-invoices") && (
              <Link
                href="/sales/sale-invoices"
                className="text-gray-700 hover:text-blue-500"
              >
                All Sales
              </Link>
            )}
            {checkAccess(userRole, "/settings/general", "GENERAL") && (
              <Link
                href="/settings/general"
                className="text-gray-700 hover:text-blue-500"
              >
                Settings
              </Link>
            )}
          </div>

          <div className="lg:flex hidden items-center gap-4">
            {checkAccess(userRole, "/sale-management") && (
              <Link
                href="/sale-management"
                className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-lg"
              >
                Add Sale <AiOutlinePlus size={16} />
              </Link>
            )}
            {checkAccess(userRole, "/purchase/purchase-bils") && (
              <AddPurchaseBtn />
            )}
            <GoBell className="text-gray-700 cursor-pointer" size={24} />
            {checkAccess(userRole, "/settings/general", "GENERAL") && (
              <button onClick={() => setIsSettingsOpen(true)}>
                <IoSettingsOutline
                  className="text-gray-700 cursor-pointer"
                  size={24}
                />
              </button>
            )}
            <div
              onClick={() => setIsSettingsOpen(true)}
              className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer"
            >
              <Avatar
                name={session?.user?.name || userName}
                image={session?.user?.image || userImage}
                size="sm"
              />
            </div>
            <div
              onClick={() => setIsSettingsOpen(true)}
              className="text-gray-700 flex flex-col cursor-pointer"
            >
              <span className="block font-semibold">
                {session?.user?.name || userName || "Not set"}
              </span>
              <span className="text-sm">
                {userRole ? getRoleDisplayName(userRole) : "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="mobile-bottom-nav md:hidden">
          <div className="flex justify-around items-center h-16">
            {getBottomNavItemsForUser.map((item) => (
              <div
                key={item.id}
                className={`bottom-nav-item flex flex-col items-center justify-center w-full h-full ${activeBottomNav === item.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600"
                  }`}
                onClick={() => handleBottomNavClick(item)}
              >
                {item.action ? (
                  <button className="flex flex-col items-center">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs mt-1">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="flex flex-col items-center w-full h-full justify-center"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs mt-1">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        <SettingsModal
          isVisible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />


        <StateMiddleware />
      </div>
    </>
  );
}