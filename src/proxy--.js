import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import permissions from "./utils/middlewareData";
import { slugifyRole } from "./utils/roleTransform";

export async function proxy(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  const method = request.method;
  const userRole = token?.role || "guest";

  // 1️⃣ Redirect to login for dashboard without token
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  // if (pathname === "/" && !token) {
  //   return NextResponse.redirect(new URL("/auth/login", request.url));
  // }

  // 2️⃣ Redirect to dashboard if logged in and accessing auth
  if (pathname.startsWith("/auth") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  // 3️⃣ PROTECT API ROUTES
  if (pathname.startsWith("/api")) {
    // Skip auth for public routes
    if (pathname.startsWith("/api/auth") && !token) {
      return NextResponse.next();
    }
    // Require authentication for all other API routes
    // if (!token) {
    //   return NextResponse.json(
    //     { error: "Authentication required" },
    //     { status: 401 }
    //   );
    // }

    // Check role permissions
    return checkAPIPermissions(pathname, method, userRole, request);
  }

  return NextResponse.next();
}

// Simple permission checker
function checkAPIPermissions(pathname, method, userRole, request) {
  // Chack for Owner request
  if (userRole === "OWNER") {
    return NextResponse.next();
  }

  // Find matching route from permissions
  let routeRules = null;

  // First check exact match
  if (permissions[pathname]) {
    routeRules = permissions[pathname];
  } else {
    // Check for dynamic routes (with [id])
    for (const route in permissions) {
      if (route.includes("[id]")) {
        // Convert route pattern to regex (e.g., /api/items/[id] → /api/items/\d+)
        const baseRoute = route.split("[id]")[0];
        if (pathname.startsWith(baseRoute)) {
          routeRules = permissions[route];
          break;
        }
      } else if (pathname.startsWith(route)) {
        routeRules = permissions[route];
        break;
      }
    }
  }

  // If no rules found for this route, allow access
  if (!routeRules) {
    return NextResponse.next();
  }

  // Check if method has permission rules
  const allowedRoles = routeRules[method].map((item) => slugifyRole(item));

  // If method doesn't have specific rules, allow access
  if (!allowedRoles) {
    return NextResponse.next();
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      {
        error: "Access Denied",
        message: `Role "${userRole}" cannot ${method} this resource`,
        requiredRoles: allowedRoles,
      },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/:path*", "/auth/:path*", "/api/:path*"],
};

// "/api/settings": {
//     ALL: [ROLES.SECONDARY_ADMIN], // Only secondary admin can access settings
//   },
