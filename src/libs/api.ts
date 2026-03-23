const API = process.env.BACKEND_URL || "http://localhost:5000";

export async function getProviders() {
  const res = await fetch(`${API}/api/providers`, { cache: "no-cache" });
  if (!res.ok) throw new Error("Failed to fetch providers");
  return res.json();
}

export async function getProvider(id: string) {
  const res = await fetch(`${API}/api/providers/${id}`, { cache: "no-cache" });
  if (!res.ok) throw new Error("Failed to fetch provider");
  return res.json();
}

export async function getCars() {
  const res = await fetch(`${API}/api/cars`, { cache: "no-cache" });
  if (!res.ok) throw new Error("Failed to fetch cars");
  return res.json();
}

export async function getCarsByProvider(providerId: string) {
  const res = await fetch(`${API}/api/providers/${providerId}/cars`, {
    cache: "no-cache",
  });
  if (!res.ok) throw new Error("Failed to fetch cars");
  return res.json();
}

export async function getRentals(token: string) {
  const res = await fetch(`${API}/api/rentals`, {
    cache: "no-cache",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch rentals");
  return res.json();
}

export async function createRental(
  token: string,
  body: { rentalDate: string; provider: string; car: string }
) {
  const res = await fetch(`${API}/api/rentals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function updateRental(
  token: string,
  id: string,
  body: { rentalDate?: string; provider?: string; car?: string }
) {
  const res = await fetch(`${API}/api/rentals/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteRental(token: string, id: string) {
  const res = await fetch(`${API}/api/rentals/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function registerUser(body: {
  name: string;
  email: string;
  password: string;
  telephone: string;
}) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// Admin: Providers
export async function createProvider(
  token: string,
  body: { name: string; address: string; telephone: string }
) {
  const res = await fetch(`${API}/api/providers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function updateProvider(
  token: string,
  id: string,
  body: { name?: string; address?: string; telephone?: string }
) {
  const res = await fetch(`${API}/api/providers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteProvider(token: string, id: string) {
  const res = await fetch(`${API}/api/providers/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Admin: Cars
export async function createCar(
  token: string,
  providerId: string,
  body: {
    brand: string;
    model: string;
    color: string;
    licensePlate: string;
    dailyRate: number;
  }
) {
  const res = await fetch(`${API}/api/providers/${providerId}/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function updateCar(
  token: string,
  id: string,
  body: Partial<{
    brand: string;
    model: string;
    color: string;
    licensePlate: string;
    dailyRate: number;
    available: boolean;
  }>
) {
  const res = await fetch(`${API}/api/cars/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteCar(token: string, id: string) {
  const res = await fetch(`${API}/api/cars/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
