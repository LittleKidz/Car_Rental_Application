import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — GoGo Rental",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to home
        </Link>
      </div>

      <div className="card p-8 sm:p-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">Last updated: April 2026</p>
        </div>

        <p className="text-slate-600 leading-relaxed">
          GoGo Rental is committed to protecting your personal information. This
          Privacy Policy explains what data we collect, how we use it, and your
          rights as a user of our platform.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            1. Data We Collect
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm leading-relaxed">
            <li>
              <strong>Account information:</strong> full name, email address,
              and telephone number provided at registration
            </li>
            <li>
              <strong>Rental history:</strong> car bookings, rental dates,
              providers, and total amounts
            </li>
            <li>
              <strong>Payment status:</strong> whether a rental has been paid or
              refunded (we do not store card details)
            </li>
            <li>
              <strong>Reviews:</strong> ratings and comments you submit for
              rental providers
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            2. How We Use Your Data
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm leading-relaxed">
            <li>To process and manage your car rental bookings</li>
            <li>
              To send in-app notifications about booking confirmations,
              payments, and refunds
            </li>
            <li>
              To verify eligibility for leaving provider reviews (completed
              rentals only)
            </li>
            <li>To maintain your rental history and receipts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            3. Data Sharing
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            We do not sell or share your personal data with third parties. Your
            name and contact information are visible only to administrators for
            the purpose of managing the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            4. Data Retention
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Your account data and rental history are retained for as long as
            your account remains active. You may request deletion of your
            account by contacting us directly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            5. Your Rights
          </h2>
          <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm leading-relaxed">
            <li>Access and review your personal data at any time</li>
            <li>Update your account information</li>
            <li>Request deletion of your account and associated data</li>
            <li>
              Withdraw consent — if you no longer agree to this policy, you may
              stop using the service
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            6. Contact
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            If you have any questions about this Privacy Policy or how your data
            is handled, please contact us .
          </p>
        </section>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            By creating an account on GoGo Rental, you acknowledge that you have
            read and agree to this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
