"use server";

import { revalidateTag } from "next/cache";

export async function revalidateProvider(providerId: string) {
  revalidateTag(`provider-${providerId}`);
}
