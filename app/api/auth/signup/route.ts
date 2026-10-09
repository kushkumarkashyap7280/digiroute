import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { createSession } from "@/lib/session";
import { checkRateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

    // Limit account creation per IP (5 per hour).
    const limited = await checkRateLimit(`signup:${clientIp(req)}`, 5, 60 * 60);
    if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const sessionPayload = { userId: user._id.toString(), name: user.name, email: user.email };
    const token = await createSession(sessionPayload);

    return NextResponse.json(
      {
        message: "Account created.",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
