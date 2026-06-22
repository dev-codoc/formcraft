import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email } = await req.json();

  if (!name?.trim() && !email?.trim()) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await connectDB();

  // Check email isn't already taken by another account
  if (email && email !== session.user.email) {
    const existing = await User.findOne({ email, _id: { $ne: session.user.id } });
    if (existing) {
      return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
    }
  }

  const updated = await User.findByIdAndUpdate(
    session.user.id,
    { ...(name && { name: name.trim() }), ...(email && { email: email.trim() }) },
    { new: true }
  ).lean();

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
