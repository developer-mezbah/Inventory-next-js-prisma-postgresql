import prisma from "@/lib/prisma";
import { getCompanyId } from "@/utils/GetCompanyId";

export async function GET(request) {
  try {
    const companyId = await getCompanyId();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const isOwnerCompany = await prisma.Company.findUnique({
      where: { id: companyId, ownerId: userId },
    });
    if (isOwnerCompany) {
      const data = await prisma.userRole.findMany({
        where: { companyId },
        orderBy: {
          id: "desc",
        },
      });
      return Response.json({ status: true, data });
    } else {
      return Response.json({ status: false, message: "Something went wrong!" });
    }

    return Response.json(companyId);
  } catch (error) {
    return Response.json(
      { error: error.message || "Internal Server Error", status: false },
      { status: 500 }
    );
  }
}
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Missing required query parameter: ID", status: false },
        { status: 400 } // Bad Request
      );
    }
    const deleteResult = await prisma.userRole.delete({
      where: {
        id,
      },
    });

    return Response.json({
      status: true,
      message: `Successfully deleted UserRole record(s).`,
    });
  } catch (error) {
    console.error("DELETE UserRole error:", error);
    return Response.json(
      { error: error.message || "Internal Server Error", status: false },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { fullName, contact, role } = body;

    // Validate required fields
    if (!fullName || !contact || !role) {
      return Response.json(
        {
          error: "Missing required fields: fullName, contact, or role",
          status: false,
        },
        { status: 400 }
      );
    }

    const companyId = await getCompanyId();

    // Map the incoming role string to your RoleType enum
    const roleMap = {
      "secondary admin": "SECONDARY_ADMIN",
      salesman: "SALESMAN",
      biller: "BILLER",
      "biller and salesman": "BILLER_AND_SALESMAN",
      "ca/accountant": "CA_ACCOUNTANT",
      "stock keeper": "STOCK_KEEPER",
      "ca/account (edit access)": "CA_ACCOUNT_EDIT_ACCESS",
    };

    // Convert role to lowercase for case-insensitive matching
    const normalizedRole = role.toLowerCase();
    const mappedRole = roleMap[normalizedRole];

    if (!mappedRole) {
      return Response.json(
        {
          error: `Invalid role: ${role}. Valid roles are: ${Object.keys(
            roleMap
          ).join(", ")}`,
          status: false,
        },
        { status: 400 }
      );
    }

    // Assuming you have a Prisma client instance
    const data = await prisma.userRole.create({
      data: {
        name: fullName,
        email: contact, // Assuming 'contact' is the email
        companyId: companyId,
        role: mappedRole,
        status: "PENDING", // Default status
      },
    });

    return Response.json(
      {
        message: "User role added successfully",
        data: data,
        status: true,
      },
      { status: 201 } // 201 Created is more appropriate for successful creation
    );
  } catch (error) {
    console.error("Error", error);
    console.log(error);
    // Handle unique constraint violation (user already has role in company)
    if (error.code === "P2002") {
      return Response.json(
        { error: "User already has a role in this company", status: false },
        { status: 409 }
      );
    }

    return Response.json(
      { error: error.message || "Internal Server Error", status: false },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, fullName, contact, role } = body;

    // Validate required fields
    if (!id) {
      return Response.json(
        {
          error: "Missing required field: id",
          status: false,
        },
        { status: 400 }
      );
    }

    // Validate at least one field to update is provided
    if (!fullName && !contact && !role) {
      return Response.json(
        {
          error:
            "At least one field to update must be provided: fullName, contact, or role",
          status: false,
        },
        { status: 400 }
      );
    }

    const companyId = await getCompanyId();

    // Prepare update data object
    const updateData = {};

    if (fullName) updateData.name = fullName;
    if (contact) updateData.email = contact;

    // Map role if provided
    if (role) {
      const roleMap = {
        "secondary admin": "SECONDARY_ADMIN",
        salesman: "SALESMAN",
        biller: "BILLER",
        "biller and salesman": "BILLER_AND_SALESMAN",
        "ca/accountant": "CA_ACCOUNTANT",
        "stock keeper": "STOCK_KEEPER",
        "ca/account (edit access)": "CA_ACCOUNT_EDIT_ACCESS",
      };

      const normalizedRole = role.toLowerCase();
      const mappedRole = roleMap[normalizedRole];

      if (!mappedRole) {
        return Response.json(
          {
            error: `Invalid role: ${role}. Valid roles are: ${Object.keys(
              roleMap
            ).join(", ")}`,
            status: false,
          },
          { status: 400 }
        );
      }
      updateData.role = mappedRole;
    }

    // Check if the record exists and belongs to the company
    const existingRecord = await prisma.userRole.findFirst({
      where: {
        id: id,
        companyId: companyId,
      },
    });

    if (!existingRecord) {
      return Response.json(
        {
          error:
            "User role not found or you don't have permission to update it",
          status: false,
        },
        { status: 404 }
      );
    }

    // Update the user role
    const data = await prisma.userRole.update({
      where: {
        id: id,
        companyId: companyId, // Ensure the record belongs to the company
      },
      data: updateData,
    });

    return Response.json(
      {
        message: "User role updated successfully",
        data: data,
        status: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user role", error);

    // Handle specific errors
    if (error.code === "P2025") {
      return Response.json(
        { error: "User role not found", status: false },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return Response.json(
        { error: "Email already exists in this company", status: false },
        { status: 409 }
      );
    }

    return Response.json(
      { error: error.message || "Internal Server Error", status: false },
      { status: 500 }
    );
  }
}
