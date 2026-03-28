import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Support both Vercel KV naming (KV_REST_API_*) and Upstash naming (UPSTASH_REDIS_REST_*)
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Store email in a sorted set (score = timestamp for chronological order)
    const timestamp = Date.now();
    await redis.zadd("waitlist:emails", { score: timestamp, member: trimmed });

    // Store signup metadata in a hash
    await redis.hset(`waitlist:meta:${trimmed}`, {
      email: trimmed,
      signedUpAt: new Date(timestamp).toISOString(),
      source: "landing-page",
    });

    // Return waitlist position
    const count = await redis.zcard("waitlist:emails");

    return NextResponse.json({ success: true, position: count });
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await redis.zcard("waitlist:emails");
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
