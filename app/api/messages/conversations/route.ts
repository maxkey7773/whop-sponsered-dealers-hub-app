import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all users who have exchanged messages with the current user
    const sentMessages = await prisma.message.findMany({
      where: { senderId: session.user.id },
      select: { receiverId: true },
      distinct: ["receiverId"]
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: session.user.id },
      select: { senderId: true },
      distinct: ["senderId"]
    });

    const userIds = [...new Set([
      ...sentMessages.map(m => m.receiverId),
      ...receivedMessages.map(m => m.senderId)
    ])];

    if (userIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get user details and last messages
    const conversations = await Promise.all(
      userIds.map(async (userId) => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true }
        });

        if (!user) return null;

        // Get last message
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: userId },
              { senderId: userId, receiverId: session.user.id }
            ]
          },
          orderBy: { createdAt: "desc" },
          include: {
            sender: { select: { name: true, email: true } }
          }
        });

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            senderId: userId,
            receiverId: session.user.id,
            // Note: In a real app, you'd have a read/unread field
          }
        });

        return {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          lastMessage,
          unreadCount
        };
      })
    );

    return NextResponse.json(conversations.filter(Boolean));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}