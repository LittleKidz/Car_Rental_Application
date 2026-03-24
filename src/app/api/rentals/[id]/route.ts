import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

type Ctx = { params: { id: string } };

export const GET    = (req: NextRequest, { params }: Ctx) => proxy(`/api/rentals/${params.id}`, req, { auth: true });
export const PUT    = (req: NextRequest, { params }: Ctx) => proxy(`/api/rentals/${params.id}`, req, { auth: true });
export const DELETE = (req: NextRequest, { params }: Ctx) => proxy(`/api/rentals/${params.id}`, req, { auth: true, method: "DELETE" });
