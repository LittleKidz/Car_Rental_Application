import Link from "next/link";
import { getProviders } from "@/libs/api";
import { Provider } from "@/types";

export default async function ProvidersPage() {
  let providers: Provider[] = [];
  try {
    const data = await getProviders();
    providers = data.data;
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Rental Car Providers</h1>
        <p className="text-slate-500">Choose a provider to see available cars</p>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No providers found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {providers.map((p) => (
            <Link key={p._id} href={`/providers/${p._id}`} className="card p-6 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {p.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.address}</p>
                  {p.telephone && (
                    <p className="text-sm text-slate-400 mt-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {p.telephone}
                    </p>
                  )}
                  {p.cars && (
                    <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                      {p.cars.length} cars available
                    </div>
                  )}
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
