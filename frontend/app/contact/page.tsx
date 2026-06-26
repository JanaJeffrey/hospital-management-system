import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-3xl w-full rounded-2xl p-8" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>Contact Us</h1>
        <p className="text-lg mb-4" style={{ color: "var(--text-light)" }}>
          Have questions or need support? Reach out to us!
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <p className="font-medium" style={{ color: "var(--text)" }}>📧 Email</p>
            <p style={{ color: "var(--text-light)" }}>support@medicarehub.com</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <p className="font-medium" style={{ color: "var(--text)" }}>📞 Phone</p>
            <p style={{ color: "var(--text-light)" }}>+1 (555) 123-4567</p>
          </div>
          <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
            <p className="font-medium" style={{ color: "var(--text)" }}>📍 Address</p>
            <p style={{ color: "var(--text-light)" }}>123 Healthcare Blvd, Medical City, MC 12345</p>
          </div>
        </div>
        <Link href="/" className="inline-block mt-6 px-4 py-2 rounded-xl text-white" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}