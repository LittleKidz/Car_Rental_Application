import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

export const GET = (req: NextRequest) =>
  proxy("/api/notifications", req, { auth: true });
