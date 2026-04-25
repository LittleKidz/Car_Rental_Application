import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

export const GET = (req: NextRequest) =>
  proxy("/api/reviews", req, { auth: true });
