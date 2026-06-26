import Link from "next/link";


export default function AboutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-3xl w-full rounded-2xl p-8" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>About MediCareHub</h1>
        <p className="text-lg mb-4" style={{ color: "var(--text-light)" }}>
          MediCareHub is a modern hospital management system designed to streamline healthcare operations.
        </p>
        <p className="text-lg mb-4" style={{ color: "var(--text-light)" }}>
          Our platform connects patients with verified doctors, enabling seamless appointment booking, prescription management, and secure health records.
        </p>
        <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: "rgba(16,185,129,0.05)", border: "1px solid var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-light)" }}>
            <strong>Mission:</strong> To make healthcare accessible, efficient, and secure for everyone.
          </p>
        </div>
        <Link href="/" className="inline-block mt-6 px-4 py-2 rounded-xl text-white" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}