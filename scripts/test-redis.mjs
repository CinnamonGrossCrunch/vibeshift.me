/**
 * VibeShift — Upstash Redis connection diagnostic
 *
 * Usage (requires Node 20+):
 *   node --env-file=.env.local scripts/test-redis.mjs
 *
 * Or if you use dotenv:
 *   npx dotenv -e .env.local -- node scripts/test-redis.mjs
 */

import { Redis } from "@upstash/redis";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

console.log("\n🔍 Checking Upstash Redis connection...\n");

if (!url || !token) {
  console.error("❌ Missing environment variables:\n");
  if (!url) console.error("   UPSTASH_REDIS_REST_URL is not set");
  if (!token) console.error("   UPSTASH_REDIS_REST_TOKEN is not set");
  console.error(
    "\n   Create a .env.local file with these values from your Upstash dashboard,"
  );
  console.error(
    "   or run: vercel login && vercel link && vercel env pull .env.local\n"
  );
  process.exit(1);
}

console.log("✅ Environment variables found");
console.log(`   URL: ${url.slice(0, 40)}...`);
console.log(`   Token: ${token.slice(0, 12)}...\n`);

try {
  const redis = new Redis({ url, token });

  // Write a test key
  await redis.set("vibeshift:healthcheck", new Date().toISOString(), {
    ex: 60, // auto-expire after 60s
  });
  console.log("✅ Write succeeded");

  // Read it back
  const val = await redis.get("vibeshift:healthcheck");
  console.log(`✅ Read succeeded: ${val}`);

  // Check waitlist count
  const count = await redis.zcard("waitlist:emails");
  console.log(`✅ Waitlist count: ${count} signups`);

  if (count > 0) {
    // List all emails (sorted by signup time)
    const emails = await redis.zrange("waitlist:emails", 0, -1);
    console.log("\n📋 Waitlist emails:");
    emails.forEach((email, i) => console.log(`   ${i + 1}. ${email}`));
  }

  console.log("\n🎉 Upstash Redis is connected and working.\n");
} catch (err) {
  console.error("\n❌ Redis connection failed:");
  console.error("  ", err.message);
  console.error(
    "\n   Check that your URL and token are correct in .env.local\n"
  );
  process.exit(1);
}
