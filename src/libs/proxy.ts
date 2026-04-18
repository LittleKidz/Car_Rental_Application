import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

interface ProxyOptions {
  /** Override the HTTP method (defaults to the incoming request method). */
  method?: string;
  /** If true, forward the Authorization header from the incoming request. */
  auth?: boolean;
  /** Fallback JSON returned on error (default: `{ success: false }`). */
  fallback?: Record<string, unknown>;
}

/**
 * Generic proxy helper — forwards a request to the backend and returns
 * the JSON response.  Eliminates the repeated try/catch boilerplate in
 * every `route.ts` file.
 *
 * @example
 * // GET /api/providers
 * export const GET = () => proxy("/api/providers");
 *
 * // POST /api/rentals (with auth + body)
 * export const POST = (req: NextRequest) =>
 *   proxy("/api/rentals", req, { auth: true });
 */
export async function proxy(
  path: string,
  req?: NextRequest,
  opts: ProxyOptions = {},
): Promise<NextResponse> {
  const { method, auth = false, fallback } = opts;
  const httpMethod = method ?? req?.method ?? "GET";

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (auth && req) {
      headers.Authorization = req.headers.get("authorization") || "";
    }

    const init: RequestInit = {
      method: httpMethod,
      headers,
      ...(httpMethod === "GET" && !auth
        ? { next: { revalidate: 30 } }
        : { cache: "no-store" }),
    };

    // Attach body for methods that need it
    if (req && ["POST", "PUT", "PATCH"].includes(httpMethod)) {
      try {
        const body = await req.json();
        init.body = JSON.stringify(body);
      } catch {
        // no body — skip
      }
    }

    const res = await fetch(`${BACKEND}${path}`, init);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`Proxy ${httpMethod} ${path} error:`, err);
    return NextResponse.json(
      fallback ?? { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
