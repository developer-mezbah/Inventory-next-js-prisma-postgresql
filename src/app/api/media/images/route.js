// app/api/media/images/route.js
import prisma from "@/lib/prisma";
import cloudinary from '@/lib/cloudinary';
import { getCompanyId } from "@/utils/GetCompanyId";

// Handler for GET /api/media/images
export async function GET() {
  try {
    // Fetch images from the MongoDB collection using Prisma
    const images = await prisma.image.findMany({
      orderBy: {
        id: 'desc', // Assuming 'id' is a good proxy for creation order in MongoDB/Prisma
      }, where: {
        companyId: await getCompanyId(),
      },
    });

    // Use NextResponse for returning structured JSON responses
    return Response.json(images, { status: 200 });

  } catch (error) {
    console.error('Error fetching images:', error);
    // Return a 500 error response
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}


// Handler for POST /api/media/images
export async function POST(request) {
  try {
    // 1. Get FormData from the standard Request object
    const formData = await request.formData();
    const images = formData.getAll('images'); // 'images' must match the input name attribute

    if (images.length === 0) {
      return Response.json({ message: "No files uploaded" }, { status: 400 });
    }
    const companyId = await getCompanyId();
    // 2. Upload files to Cloudinary
    const uploadPromises = images.map(async (file) => {
      // Convert the File object to a Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Convert Buffer to base64 data URI for Cloudinary
      const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

      // Upload the file to Cloudinary
      return cloudinary.uploader.upload(dataUri, {
        folder: "InventoryNextJS", // Cloudinary folder name
        resource_type: "auto", // Automatically determine resource type
      });
    });

    const results = await Promise.all(uploadPromises);

    // 3. Prepare data for Prisma
    const imageDetails = results.map((result, index) => ({
      file_name: images[index].name,
      file_size: images[index].size,
      img_url: result.secure_url,
      public_id: result.public_id,
      companyId
    }));

    // 4. Save image details to MongoDB via Prisma
    const savedImages = await prisma.image.createMany({
      data: imageDetails,
    });

    return Response.json({
      message: "Images uploaded successfully",
      images: savedImages,
      status: true,
    }, { status: 200 });

  } catch (error) {
    console.error('Error during upload:', error);
    return Response.json(
      { error: error.message || 'Internal Server Error', status: false },
      { status: 500 }
    );
  }
}

// Handler for DELETE /api/media/images
export async function DELETE(request) {
  try {
    // 1. Get the body content (JSON) from the standard Request object
    const { public_ids } = await request.json(); // Array of public IDs

    if (!public_ids || public_ids.length === 0) {
      return Response.json(
        { message: "No images specified for deletion" },
        { status: 400 }
      );
    }

    // 2. Delete images from Cloudinary
    // Cloudinary's api.delete_resources is asynchronous
    await cloudinary.api.delete_resources(public_ids);

    // 3. Delete images from MongoDB using Prisma
    await prisma.image.deleteMany({
      where: {
        public_id: {
          in: public_ids,
        },
        companyId: await getCompanyId(),
      },
    });

    return Response.json({ message: "Images deleted successfully", status: true }, { status: 200 });
  } catch (error) {
    console.error('Error during deletion:', error);
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}