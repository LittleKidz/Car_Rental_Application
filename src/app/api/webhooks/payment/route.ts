import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

// Forwarded to backend without auth — the mock bank calls this directly
export const POST = (req: NextRequest) =>
  proxy("/api/rentals/webhook/payment", req);
