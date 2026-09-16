import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session)
    return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({
    user: {
      userId: session.userId,
      id: session.userId,
      name: session.name,
      email: session.email,
    },
  });
}
