/**
 * lib/mongoose.ts
 * Singleton MongoDB connection for Next.js hot-reload environments.
 * Import `connectDB` in any API route before touching models.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

function getCache(): MongooseCache {
  if (!global._mongooseCache) {
    global._mongooseCache = { conn: null, promise: null };
  }
  return global._mongooseCache;
}

export async function connectDB(): Promise<typeof mongoose> {
  const cached = getCache();

  // Already have a live connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Reset if the connection dropped or errored
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, { bufferCommands: false, serverSelectionTimeoutMS: 5000 })
      .catch((err) => {
        // Clear cache on failure so the next request retries fresh
        cached.conn = null;
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
