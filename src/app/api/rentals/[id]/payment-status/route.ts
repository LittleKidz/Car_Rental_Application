import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

type Ctx = { params: { id: string } };

export const PATCH = (req: NextRequest, { params }: Ctx) =>
  proxy(`/api/rentals/${params.id}/payment-status`, req, { auth: true, method: "PATCH" });
