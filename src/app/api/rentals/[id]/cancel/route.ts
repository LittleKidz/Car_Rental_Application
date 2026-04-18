import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

type Ctx = { params: { id: string } };

export const POST = (req: NextRequest, { params }: Ctx) =>
  proxy(`/api/rentals/${params.id}/cancel`, req, { auth: true });
