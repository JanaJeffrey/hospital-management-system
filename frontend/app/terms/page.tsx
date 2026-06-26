import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-3xl w-full rounded-2xl p-8" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>Terms of Service</h1>
        <p className="text-lg mb-4" style={{ color: "var(--text-light)" }}>
          By using MediCareHub, you agree to the following terms.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>📋 Acceptance of Terms</h3>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>By creating an account, you agree to these terms of service.</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>👤 User Responsibilities</h3>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>You are responsible for maintaining the confidentiality of your account.</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>🚫 Prohibited Use</h3>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>The platform may not be used for any unlawful or unauthorized purpose.</p>
          </div>
        </div>
        <Link href="/" className="inline-block mt-6 px-4 py-2 rounded-xl text-white" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}