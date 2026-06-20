import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

/** Small helper route the pricing page uses to know which plan to grey out as "current" */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const subscription = await Subscription.findOne({ userId: session.user.id }).lean();

  return NextResponse.json({ plan: subscription?.plan ?? "free" });
}
