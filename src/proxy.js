import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { slugifyRole } from "./utils/roleTransform";
import { clearCompanyId, getCompanyId } from "./utils/GetCompanyId";
import permissions from "./utils/middlewareData";

const apiRoutesWithoutCompanyId = [
  "/api/company",
  "/api/company/connect",
  "/api/company/share-with-me",
  "/api/dashboard",
];

export async function proxy(request) {
  try {
    // Get token with proper error handling
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production', // Use secure cookies in production
    });

    const { pathname } = request.nextUrl;
    const method = request.method;
    const userRole = token?.role || "guest";

    // Get companyId with error handling
    let companyId = null;
    try {
      companyId = await getCompanyId();
    } catch (error) {
      console.error("Error getting companyId:", error);
    }

    // 🟢 Define public routes that don't require token or companyId
    const publicRoutes = [
      '/auth/signup',
      '/auth/login',
      '/auth/error',
      '/api/auth', // Allow all auth API routes
    ];

    // 🟢 Define routes that need token but NOT companyId
    const tokenOnlyRoutes = [
      '/company-setup',
      '/api/company/share-with-me'
    ];

    // Check if current route is public
    const isPublicRoute = publicRoutes.some(route =>
      pathname === route || pathname.startsWith(route + '/')
    );

    // Check if route requires token but not companyId
    const isTokenOnlyRoute = tokenOnlyRoutes.some(route =>
      pathname === route || pathname.startsWith(route + '/')
    );

    // 🟢 1️⃣ ALLOW PUBLIC ROUTES
    if (isPublicRoute) {
      // Don't redirect auth pages if they're loading or have errors
      if (pathname.startsWith('/auth') && token) {
        // Check if we have a valid session with company
        if (companyId) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        // If logged in but no company, redirect to setup
        if (token && !companyId) {
          return NextResponse.redirect(new URL("/company-setup", request.url));
        }
      }
      return NextResponse.next();
    }

    // 🟢 2️⃣ HANDLE TOKEN-ONLY ROUTES
    if (isTokenOnlyRoute) {
      // No token - redirect to login
      if (!token) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      // Has token - allow access (even without companyId)
      return NextResponse.next();
    }

    // 🟢 3️⃣ CHECK FOR VALID SESSION
    // if (!token) {
    //   console.log(`No token found for path: ${pathname}`);
    //   const loginUrl = new URL("/auth/login", request.url);
    //   loginUrl.searchParams.set("callbackUrl", pathname);
    //   NextResponse.redirect(loginUrl);
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    // 🟢 4️⃣ CHECK FOR COMPANY ID FOR PROTECTED ROUTES
    if (!companyId && !isTokenOnlyRoute) {
      console.log(`User ${token?.email} has no companyId. Redirecting to company setup.`);

      // Allow certain API routes that don't require companyId
      if (apiRoutesWithoutCompanyId.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/company-setup", request.url));
    }

    // Clean up inconsistent state
    if (companyId && !token) {
      await clearCompanyId();
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // 🟢 5️⃣ PROTECT API ROUTES
    if (pathname.startsWith("/api")) {
      return handleAPIRoutes(pathname, method, userRole, token, request);
    }

    // 🟢 6️⃣ ALLOW ACCESS TO PROTECTED ROUTES
    return NextResponse.next();

  } catch (error) {
    console.error("Middleware error:", error);
    // On error, redirect to login for safety
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

function handleAPIRoutes(pathname, method, userRole, token, request) {
  // Allow auth API routes without additional checks
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow certain API routes that don't require companyId
  if (apiRoutesWithoutCompanyId.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }


  // Require authentication for all other API routes
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Check role permissions for protected API routes
  return checkAPIPermissions(pathname, method, userRole, request);
}

function checkAPIPermissions(pathname, method, userRole, request) {
  // Check for Owner/Admin request
  if (userRole === "OWNER" || userRole === "ADMIN") {
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
  if (!routeRules[method]) {
    return NextResponse.json(
      {
        error: "Method Not Allowed",
        message: `Method "${method}" not allowed for this resource`,
      },
      { status: 405 }
    );
  }

  const allowedRoles = routeRules[method].map((item) => slugifyRole(item));

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
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
};