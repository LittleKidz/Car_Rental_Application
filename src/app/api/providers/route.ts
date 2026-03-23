import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND}/api/providers`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy GET /api/providers error:", err);
    return NextResponse.json({ success: false, count: 0, data: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization") || "";
    const body = await req.json();
    const res = await fetch(`${BACKEND}/api/providers`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy POST /api/providers error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
