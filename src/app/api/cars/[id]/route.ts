import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization") || "";
    const body = await req.json();
    const res = await fetch(`${BACKEND}/api/cars/${params.id}`, {
      method: "PUT",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy PUT /api/cars/[id] error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization") || "";
    const res = await fetch(`${BACKEND}/api/cars/${params.id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy DELETE /api/cars/[id] error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
