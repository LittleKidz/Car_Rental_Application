import { NextRequest } from "next/server";
import { proxy } from "@/libs/proxy";

type Ctx = { params: { id: string } };

export const GET = (_: NextRequest, { params }: Ctx) =>
  proxy(`/api/providers/${params.id}/cars/bookings`, undefined, {
    fallback: { success: true, data: [] },
    noStore: true,
  });
