import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a brand
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== "BRAND") {
      return NextResponse.json({ error: "Only brands can create deals" }, { status: 403 });
    }

    const { title, description, niche, platform, budget, region } = await request.json();

    if (!title || !description || !niche || !platform || !budget || !region) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        description,
        niche,
        platform,
        budget: parseFloat(budget),
        region,
        brandId: session.user.id,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error("Error creating deal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get("niche");
    const platform = searchParams.get("platform");
    const region = searchParams.get("region");
    const search = searchParams.get("search");

    const where: any = {
      status: "OPEN",
    };

    if (niche) where.niche = niche;
    if (platform) where.platform = platform;
    if (region) where.region = region;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        brand: {
          select: { name: true, email: true }
        },
        applications: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}