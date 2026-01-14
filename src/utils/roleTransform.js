export const ROLE_DISPLAY_NAMES = {
  SECONDARY_ADMIN: "Secondary Admin",
  SALESMAN: "Salesman",
  BILLER: "Biller",
  CA_ACCOUNTANT: "CA/Accountant",
  STOCK_KEEPER: "Stock Keeper",
  CA_ACCOUNT_EDIT_ACCESS: "CA/Account (Edit Access)",
  BILLER_AND_SALESMAN: "Biller and Salesman",
};

/**
 * Utility function to convert between property names and display names
 * @param {string} input - Either a property key or display name
 * @param {boolean} [toSlug=false] - Force conversion to slug format
 * @returns {string} - Converted value
 */
function roleTransform(input, toSlug = false) {
  // If forcing to slug format or input is already a display name
  if (toSlug || Object.values(ROLE_DISPLAY_NAMES).includes(input)) {
    // Convert display name to property name (slug)
    const entry = Object.entries(ROLE_DISPLAY_NAMES).find(
      ([key, value]) => value === input
    );
    return entry ? entry[0] : input;
  } else {
    // Convert property name to display name (unslug)
    return ROLE_DISPLAY_NAMES[input] || input;
  }
}

// Alternative: Separate functions for clarity
export function slugifyRole(displayName) {
  const entry = Object.entries(ROLE_DISPLAY_NAMES).find(
    ([key, value]) => value === displayName
  );
  return entry ? entry[0] : displayName;
}

export function unslugifyRole(propertyName) {
  return ROLE_DISPLAY_NAMES[propertyName] || propertyName;
}

// Alternative: Single function with mode parameter
function transformRole(input, mode = "auto") {
  if (mode === "slugify") {
    return slugifyRole(input);
  } else if (mode === "unslugify") {
    return unslugifyRole(input);
  } else {
    // Auto-detect mode
    return ROLE_DISPLAY_NAMES[input]
      ? ROLE_DISPLAY_NAMES[input] // unslugify if input is a property
      : slugifyRole(input); // slugify if input is a display name
  }
}




// Role-based permissions configuration
export const ROLE_PERMISSIONS = {
  // OWNER has access to everything (super admin)
  OWNER: {
    modules: ["*"], // All modules
    settings: true,
    reports: true,
    utilities: true,
    sync: true,
    bulk_operations: true,
    cms: true,
    testing: true,
  },
  
  // Admin has access to everything except maybe some owner-only features
  SECONDARY_ADMIN: {
    modules: ["*"], // All modules
    settings: true,
    reports: true,
    utilities: true,
    sync: true,
    bulk_operations: true,
    cms: true,
    testing: true,
  },
  
  // Salesman can only access sales-related modules
  SALESMAN: {
    modules: ["home", "parties", "sales", "reports_view"],
    settings: false,
    reports: true,
    utilities: false,
    sync: false,
    bulk_operations: false,
    cms: false,
    testing: false,
  },
  
  // Biller can access sales and basic operations
  BILLER: {
    modules: ["home", "parties", "sales", "items_view", "reports_view"],
    settings: true,
    reports: true,
    utilities: false,
    sync: false,
    bulk_operations: false,
    cms: false,
    testing: false,
  },
  
  // CA/Accountant has financial access
  CA_ACCOUNTANT: {
    modules: ["home", "parties", "sales", "purchase", "cash_bank", "reports", "bulk_gst"],
    settings: ["general", "transaction", "taxes"],
    reports: true,
    utilities: ["export_items", "verify_data", "recycle_bin"],
    sync: false,
    bulk_operations: true,
    cms: false,
    testing: false,
  },
  
  // Stock Keeper has inventory access
  STOCK_KEEPER: {
    modules: ["home", "items", "purchase", "reports_view"],
    settings: false,
    reports: true,
    utilities: ["import_items", "barcode_generator", "update_bulk"],
    sync: false,
    bulk_operations: false,
    cms: false,
    testing: false,
  },
  
  // CA/Account with Edit Access
  CA_ACCOUNT_EDIT_ACCESS: {
    modules: ["home", "parties", "sales", "purchase", "cash_bank", "reports", "bulk_gst"],
    settings: ["general", "transaction", "taxes", "print", "transaction_message"],
    reports: true,
    utilities: ["export_items", "verify_data", "recycle_bin", "close_financial"],
    sync: false,
    bulk_operations: true,
    cms: false,
    testing: false,
  },
  
  // Biller and Salesman combined role
  BILLER_AND_SALESMAN: {
    modules: ["home", "parties", "sales", "items_view", "reports_view"],
    settings: false,
    reports: true,
    utilities: false,
    sync: false,
    bulk_operations: false,
    cms: false,
    testing: false,
  },
};


// Helper to get utility type from item name
const getUtilityType = (itemName) => {
  const map = {
    "Import Items": "import_items",
    "Barcode Generator": "barcode_generator",
    "Update Items In Bulk": "update_bulk",
    "Import Parties": "import_parties",
    "Exports To Tally": "exports_tally",
    "Export Items": "export_items",
    "Verify My Data": "verify_data",
    "Recycle Bin": "recycle_bin",
    "Close Financial Year": "close_financial",
  };
  return map[itemName] || itemName.toLowerCase().replace(/ /g, "_");
};

// Helper to get setting type from item name
const getSettingType = (itemName) => {
  return itemName.toLowerCase().replace(/\s+/g, "_");
};


// Helper function to check if user has access to a specific path
export const checkAccess = (userRole, path, itemName = "") => {
  if (!userRole) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  
  if (!permissions) return false;
  
  // OWNER and Admin have full access
  if (userRole === "OWNER" || userRole === "SECONDARY_ADMIN") return true;
  
  // Check module access based on path
  if (path === "/" || path.includes("/home")) {
    return permissions.modules.includes("home") || permissions.modules.includes("*");
  }
  
  if (path.includes("/parties")) {
    return permissions.modules.includes("parties") || permissions.modules.includes("*");
  }
  
  if (path.includes("/items")) {
    return permissions.modules.includes("items") || 
           permissions.modules.includes("items_view") || 
           permissions.modules.includes("*");
  }
  
  if (path.includes("/sales")) {
    return permissions.modules.includes("sales") || permissions.modules.includes("*");
  }
  
  if (path.includes("/purchase")) {
    return permissions.modules.includes("purchase") || permissions.modules.includes("*");
  }
  
  if (path.includes("/business")) {
    return permissions.modules.includes("business") || permissions.modules.includes("*");
  }
  
  if (path.includes("/cash-bank")) {
    return permissions.modules.includes("cash_bank") || permissions.modules.includes("*");
  }
  
  if (path.includes("/reports")) {
    return permissions.reports === true;
  }
  
  if (path.includes("/sync-share-backup")) {
    return permissions.sync === true;
  }
  
  if (path.includes("/bulk-gst-update")) {
    return permissions.bulk_operations === true;
  }
  
  if (path.includes("/utilities")) {
    if (permissions.utilities === true) return true;
    if (Array.isArray(permissions.utilities)) {
      const utilityType = getUtilityType(itemName);
      return permissions.utilities.includes(utilityType);
    }
    return false;
  }
  
  if (path.includes("/uploaded-files")) {
    return permissions.utilities === true || (Array.isArray(permissions.utilities) && 
           permissions.utilities.includes("uploaded_files"));
  }
  
  if (path.includes("/settings")) {
    if (permissions.settings === true) return true;
    if (Array.isArray(permissions.settings)) {
      const settingType = getSettingType(itemName);
      return permissions.settings.includes(settingType);
    }
    return false;
  }
  if (path.includes("/setting-modal")) {
    if (permissions.settingModal === true) return true;
    return false;
  }
  
  if (path.includes("/cms")) {
    return permissions.cms === true;
  }
  
  if (path.includes("/testing")) {
    return permissions.testing === true;
  }
  
  return false;
};







// Usage examples:
// console.log(roleTransform("SALESMAN")); // Output: "Salesman" (unslugify)
// console.log(roleTransform("Salesman")); // Output: "SALESMAN" (slugify)
// console.log(roleTransform("Salesman", true)); // Output: "SALESMAN" (forced slugify)

// console.log(roleTransform("CA_ACCOUNTANT")); // Output: "CA/Accountant"
// console.log(roleTransform("CA/Accountant")); // Output: "CA_ACCOUNTANT"

// console.log(slugifyRole("Secondary Admin")); // Output: "SECONDARY_ADMIN"
// console.log(unslugifyRole("STOCK_KEEPER")); // Output: "Stock Keeper"

// console.log(transformRole("BILLER_AND_SALESMAN", 'unslugify')); // Output: "Biller and Salesman"
// console.log(transformRole("Biller and Salesman", 'slugify')); // Output: "BILLER_AND_SALESMAN"

// // Edge cases - handles unknown values gracefully
// console.log(roleTransform("UNKNOWN_ROLE")); // Output: "UNKNOWN_ROLE"
// console.log(roleTransform("Unknown Display")); // Output: "Unknown Display"

