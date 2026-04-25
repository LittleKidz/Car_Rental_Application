import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

type Ctx = { params: { id: string; reviewId: string } };

export const PUT = (req: NextRequest, { params }: Ctx) =>
  proxy(`/api/providers/${params.id}/reviews/${params.reviewId}`, req, { auth: true, method: "PUT" });

export const DELETE = (req: NextRequest, { params }: Ctx) =>
  proxy(`/api/providers/${params.id}/reviews/${params.reviewId}`, req, { auth: true, method: "DELETE" });
