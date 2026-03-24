import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

export const POST = (req: NextRequest) => proxy("/api/auth/register", req);
