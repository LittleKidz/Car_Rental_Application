import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

export const GET  = (req: NextRequest) => proxy("/api/rentals", req, { auth: true });
export const POST = (req: NextRequest) => proxy("/api/rentals", req, { auth: true });
