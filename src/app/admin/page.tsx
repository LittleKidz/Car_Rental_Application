"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";
import ProvidersTab from "./ProvidersTab";
import CarsTab from "./CarsTab";
import RentalsTab from "./RentalsTab";

type Tab = "providers" | "cars" | "rentals";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("providers");

  useEffect(() => {
    if (status === "authenticated" && session?.user.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") return <Loading />;
  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
        <p className="text-slate-500">Manage providers, cars, and rental bookings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-100 rounded-xl p-1 w-fit">
        {(["providers", "cars", "rentals"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "providers" && <ProvidersTab token={session.user.token} />}
      {tab === "cars" && <CarsTab token={session.user.token} />}
      {tab === "rentals" && <RentalsTab token={session.user.token} />}
    </div>
  );
}
