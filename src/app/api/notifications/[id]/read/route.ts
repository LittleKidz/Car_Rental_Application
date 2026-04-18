import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

type Ctx = { params: { id: string } };

export const PUT = (req: NextRequest, { params }: Ctx) =>
  proxy(`/api/notifications/${params.id}/read`, req, { auth: true, method: "PUT" });
