import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRedis } from "@/lib/redis";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['student', 'teacher'].includes(session.user.role)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { isActive, timestamp } = await req.json();

    // Always save to database as primary source of truth
    try {
      await prisma.activity.create({
        data: {
          userId: session.user.id,
          isActive,
          timestamp: new Date(timestamp || Date.now()),
        },
      });
    } catch (dbError) {
      console.error("Database activity tracking error:", dbError);
      // Continue even if database fails - try Redis as backup
    }

    // Also try to cache in Redis for faster real-time access
    try {
      const redis = getRedis();
      const activityKey = `student:activity:${session.user.id}`;
      const activityData = {
        userId: session.user.id,
        isActive,
        timestamp: timestamp || new Date().toISOString(),
        updatedAt: Date.now(),
      };

      await redis.setex(
        activityKey,
        60,
        JSON.stringify(activityData)
      );
    } catch (redisError) {
      // Fallback: Redis failed, but database succeeded
      console.warn(
        `Redis unavailable: ${redisError.message}. Using database fallback.`
      );
    }

    console.log(`Activity tracked for user ${session.user.id}: isActive=${isActive}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Activity tracking error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to track activity" }),
      { status: 500 }
    );
  }
}
