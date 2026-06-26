import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-4xl w-full rounded-2xl p-8" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <h1 className="text-3xl font-bold mb-4 text-center" style={{ color: "var(--text)" }}>Pricing Plans</h1>
        <p className="text-lg mb-8 text-center" style={{ color: "var(--text-light)" }}>Choose the plan that works for you</p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>Basic</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: "var(--text)" }}>$0</p>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>Per month</p>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--text-light)" }}>
              <li>✅ Basic appointment booking</li>
              <li>✅ Patient dashboard</li>
              <li>✅ Up to 5 appointments/month</li>
            </ul>
          </div>
          <div className="p-6 rounded-xl border-2" style={{ borderColor: "rgb(16,185,129)" }}>
            <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>Pro</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: "var(--text)" }}>$29</p>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>Per month</p>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--text-light)" }}>
              <li>✅ Unlimited appointments</li>
              <li>✅ Doctor dashboard</li>
              <li>✅ Prescription management</li>
              <li>✅ Lab reports</li>
            </ul>
          </div>
          <div className="p-6 rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>Enterprise</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: "var(--text)" }}>$99</p>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>Per month</p>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--text-light)" }}>
              <li>✅ Everything in Pro</li>
              <li>✅ Multi-hospital support</li>
              <li>✅ Priority support</li>
              <li>✅ Custom integrations</li>
            </ul>
          </div>
        </div>
        <Link href="/" className="inline-block mt-6 px-4 py-2 rounded-xl text-white" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}