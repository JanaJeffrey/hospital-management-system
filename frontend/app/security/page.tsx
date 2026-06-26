import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-3xl w-full rounded-2xl p-8" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>Security</h1>
        <p className="text-lg mb-4" style={{ color: "var(--text-light)" }}>
          Your data security is our top priority.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>🔒 Encryption</h3>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>All data is encrypted at rest and in transit using AES-256 and TLS 1.3.</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>🔑 Authentication</h3>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>Secure JWT-based authentication with bcrypt password hashing.</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>🛡️ Compliance</h3>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>We follow HIPAA guidelines for protecting patient health information.</p>
          </div>
        </div>
        <Link href="/" className="inline-block mt-6 px-4 py-2 rounded-xl text-white" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}