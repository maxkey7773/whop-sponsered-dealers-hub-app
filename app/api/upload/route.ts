import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${session.user.id}_${timestamp}.${extension}`;

    // Save to uploads directory
    const uploadDir = join(process.cwd(), "uploads");
    const filepath = join(uploadDir, filename);

    try {
      await writeFile(filepath, buffer);
    } catch (error) {
      // Create uploads directory if it doesn't exist
      const fs = require("fs");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        await writeFile(filepath, buffer);
      } else {
        throw error;
      }
    }

    // Return file URL
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      url: fileUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}