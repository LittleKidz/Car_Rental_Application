"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HeroButtons() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-center gap-4">
      <Link href="/providers" className="btn-primary text-base px-8 py-3">
        Browse Providers
      </Link>
      {session ? (
        session.user.role !== "admin" && (
          <Link href="/rentals" className="btn-secondary text-base px-8 py-3">
            My Rentals
          </Link>
        )
      ) : (
        <Link href="/register" className="btn-secondary text-base px-8 py-3">
          Create Account
        </Link>
      )}
    </div>
  );
}
