import { proxy } from "@/libs/proxy";

export const GET = () => proxy("/api/cars", undefined, { fallback: { success: false, data: [] }, noStore: true });
