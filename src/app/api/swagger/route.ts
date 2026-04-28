import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const spec = JSON.parse(
    readFileSync(join(process.cwd(), "public", "swagger.json"), "utf-8"),
  );

  spec.servers = [{ url: process.env.BACKEND_URL || "http://localhost:5000" }];

  return NextResponse.json(spec);
}
