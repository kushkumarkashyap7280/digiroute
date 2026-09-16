import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

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
