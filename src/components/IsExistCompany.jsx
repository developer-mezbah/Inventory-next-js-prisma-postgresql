"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

const IsExistCompany = ({ companyId }) => {
  const pathName = usePathname();
  const router = useRouter();

  // Define route patterns for public routes
  const publicRoutePatterns = [
    // Exact matches
    "/company-setup",
    "/auth/login",
    "/auth/register",
    "/auth/",
  ];

  useEffect(() => {
    // Check if current route matches any public pattern
    const isPublicRoute = publicRoutePatterns.some((pattern) => {
      // For patterns ending with /, check if route starts with pattern
      if (pattern.endsWith("/")) {
        return pathName.startsWith(pattern);
      }
      // For exact matches
      return pathName === pattern || pathName.startsWith(pattern + "/");
    });

    if (!companyId && !isPublicRoute) {
      toast.info("Please select your company first.");
      router.push("/company-setup");
    }
  }, [companyId, pathName]);

  return null;
};

export default IsExistCompany;
