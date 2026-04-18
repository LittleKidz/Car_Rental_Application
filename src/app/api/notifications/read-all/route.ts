import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

export const PUT = (req: NextRequest) =>
  proxy("/api/notifications/read-all", req, { auth: true, method: "PUT" });
