import ProviderDetailClient from "./ProviderDetailClient";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

async function fetchJSON(path: string) {
  const res = await fetch(`${BACKEND}${path}`, { cache: "no-store" });
  return res.ok ? res.json() : null;
}

export default async function ProviderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [providerRes, carsRes] = await Promise.all([
    fetchJSON(`/api/providers/${params.id}`),
    fetchJSON(`/api/providers/${params.id}/cars`),
  ]);

  return (
    <ProviderDetailClient
      provider={providerRes?.data ?? null}
      initialCars={carsRes?.data ?? []}
    />
  );
}
