import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-3xl w-full rounded-2xl p-8" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>Privacy Policy</h1>
        <p className="text-lg mb-4" style={{ color: "var(--text-light)" }}>
          We take your privacy seriously. Here's how we protect your data.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>📊 Data Collection</h3>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>We only collect necessary information to provide healthcare services.</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>🔐 Data Protection</h3>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>Your medical records are encrypted and accessible only to authorized personnel.</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>📝 Your Rights</h3>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>You can access, modify, or delete your data at any time.</p>
          </div>
        </div>
        <Link href="/" className="inline-block mt-6 px-4 py-2 rounded-xl text-white" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}