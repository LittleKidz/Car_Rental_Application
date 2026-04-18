import Link from "next/link";
import Image from "next/image";
import { getProviders } from "@/libs/api";
import HeroButtons from "@/components/HeroButtons";

export default async function HomePage() {
  let providerCount = 0;
  try {
    const data = await getProviders();
    providerCount = data.count || data.data?.length || 0;
  } catch {}

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-28">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-3xl" />
          <div className="absolute -bottom-20 -left-40 w-[400px] h-[400px] rounded-full bg-violet-100/50 blur-3xl" />
        </div>

        <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            {providerCount} rental providers available
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
            Find your perfect
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {" "}
              rental car
            </span>
          </h1>

          <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
            Browse top rental car providers, compare vehicles, and book your
            next ride in just a few clicks.
          </p>

          <HeroButtons />
        </div>
      </section>
    </div>
  );
}
