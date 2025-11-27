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

    const { receiverId, content } = await request.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Receiver ID and content are required" }, { status: 400 });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true }
    });

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
      },
      include: {
        sender: {
          select: { name: true, email: true }
        }
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        title: "New Message",
        message: `You have a new message from ${message.sender.name || message.sender.email}`,
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: userId },
          { senderId: userId, receiverId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: { name: true, email: true }
        },
        receiver: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}