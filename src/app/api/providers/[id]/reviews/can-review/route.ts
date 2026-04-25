import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

type Ctx = { params: { id: string } };

export const GET = (req: NextRequest, { params }: Ctx) =>
  proxy(`/api/providers/${params.id}/reviews/can-review`, req, { auth: true });
