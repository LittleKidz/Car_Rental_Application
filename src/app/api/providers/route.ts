import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

export const GET  = ()                 => proxy("/api/providers", undefined, { noStore: true });
export const POST = (req: NextRequest) => proxy("/api/providers", req, { auth: true });
