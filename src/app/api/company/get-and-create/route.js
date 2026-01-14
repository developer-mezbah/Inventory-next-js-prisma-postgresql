import prisma from "@/lib/prisma";



export async function POST(request) {
  try {

    // 2. Input Validation: Get the company name from the request body
    const body = await request.json();
    const { name, userId } = body;   

    if (!name) {
      return new Response(JSON.stringify({ error: 'Company name is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- DATABASE LOGIC (Find or Create) ---

    // 3. Find existing company by ownerId
    const existingCompanies = await prisma.company.findMany({
      where: {
        ownerId: userId,
      },
    });

    if (existingCompanies.length > 0) {
      console.log(`Companies found for user ${userId}`);
      return new Response(JSON.stringify(existingCompanies), {
        status: 200, // OK
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. If not found, create a new company
    console.log(`Creating new company '${name}' for user ${userId}`);
    const newCompany = await prisma.company.create({
      data: {
        name: name,
        ownerId: userId,
        // Add any other required fields here
      },
    });

    return new Response(JSON.stringify(newCompany), {
      status: 201, // Created
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('API Error in /api/company:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}