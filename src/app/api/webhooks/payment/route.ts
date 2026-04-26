import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND}/api/rentals/webhook/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json();

    // Bust the provider detail cache immediately so the next page load shows the car as booked
    if (data.success && data.data?.provider) {
      revalidateTag(`provider-${data.data.provider}`);
    }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Webhook error" },
      { status: 500 },
    );
  }
}
