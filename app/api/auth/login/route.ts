import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

    await createSession({ userId: user._id.toString(), name: user.name, email: user.email });

    return NextResponse.json({ message: "Logged in." });
  } catch (err: unknown) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
