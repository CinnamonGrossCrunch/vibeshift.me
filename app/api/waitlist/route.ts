import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

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

    // Store email with timestamp. Using a sorted set so we can list in order.
    const timestamp = Date.now();
    await kv.zadd("waitlist:emails", { score: timestamp, member: trimmed });

    // Also store signup metadata
    await kv.hset(`waitlist:meta:${trimmed}`, {
      email: trimmed,
      signedUpAt: new Date(timestamp).toISOString(),
      source: "landing-page",
    });

    // Get current count for the response
    const count = await kv.zcard("waitlist:emails");

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
    const count = await kv.zcard("waitlist:emails");
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
