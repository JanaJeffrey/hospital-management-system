"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  Calendar, Clock, Shield, Users, ArrowRight, 
  Activity, Stethoscope, FileText, Star, 
  Video, Database, BarChart3, Sparkles, Heart,
  Menu, X
} from "lucide-react";
import SimpleTheme from "./components/SimpleTheme";

// Animated counter
const Counter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasRun) {
          setHasRun(true);
          let start = 0;
          const duration = 2000;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasRun]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const sections = ["home", "features", "how-it-works", "testimonials"];
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "how-it-works", label: "How it works" },
    { id: "testimonials", label: "Testimonials" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      
      {/* ========== NAVIGATION ========== */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] shadow-sm" 
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("home")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">HMS</span>
              </div>
              {/* ✅ FIXED: Dark mode text visibility - always white/green */}
              <span className="font-bold text-xl hidden sm:inline text-white dark:text-white">
                MediCare<span className="text-emerald-400 dark:text-emerald-400">Hub</span>
              </span>
            </div>

            {/* ✅ FIXED: Desktop nav links - always white in dark mode */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button 
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`cursor-pointer transition ${
                    activeSection === link.id 
                      ? "text-emerald-400 border-b-2 border-emerald-400 pb-1" 
                      : "text-white dark:text-white hover:text-emerald-400"
                  }`}
                  style={{ 
                    color: activeSection === link.id ? "rgb(52,211,153)" : "white",
                    textShadow: "0 1px 8px rgba(0,0,0,0.3)"
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* ✅ FIXED: Desktop buttons - always visible in dark mode */}
            <div className="hidden md:flex items-center gap-3">
              <SimpleTheme />
              <Link 
                href="/login" 
                className="cursor-pointer px-4 py-2 rounded-lg transition hover:bg-white/20 text-white dark:text-white"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="cursor-pointer px-4 py-2 rounded-xl text-white font-medium hover:scale-105 transition" 
                style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
              >
                Get Started
              </Link>
            </div>

            {/* ✅ Mobile Menu Button - always visible */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="cursor-pointer md:hidden p-2 rounded-lg transition hover:bg-white/20 text-white dark:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ✅ Mobile Sidebar - Slide in from LEFT */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar - from LEFT */}
        <div className={`absolute left-0 top-0 h-full w-72 shadow-2xl transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundColor: "var(--card)" }}>
          <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">HMS</span>
              </div>
              <span className="font-bold text-lg" style={{ color: "var(--text)" }}>MediCare<span style={{ color: "rgb(16,185,129)" }}>Hub</span></span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: "var(--text)" }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 80px)" }}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg transition ${
                  activeSection === link.id 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                style={{ color: activeSection === link.id ? "rgb(16,185,129)" : "var(--text)" }}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-center p-2">
                <SimpleTheme />
              </div>
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-4 py-2.5 rounded-lg text-center transition hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ color: "var(--text)", backgroundColor: "var(--muted)" }}
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full px-4 py-2.5 rounded-xl text-center text-white font-medium"
                style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========== HERO ========== */}
      <section id="home" className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50"></div>
          <img 
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&q=80" 
            alt="Modern hospital corridor" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-white [text-shadow:_0_2px_20px_rgba(0,0,0,0.5)]">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Intelligent Care</span>
              <br className="hidden sm:block" />
              <span className="text-white">for Modern Healthcare</span>
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-black/50 backdrop-blur-sm text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> Next-Gen Healthcare Platform
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white/95 mb-6 sm:mb-8 max-w-xl [text-shadow:_0_1px_10px_rgba(0,0,0,0.5)]">
              Streamline appointments, manage schedules, and secure patient records – all in one platform trusted by healthcare professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href="/register" className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-white font-medium hover:scale-105 transition text-sm sm:text-base" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <button onClick={() => scrollToSection("features")} className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 border border-white/50 text-white rounded-xl font-medium hover:bg-white/10 transition text-sm sm:text-base">
                Explore Features
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-white/50 flex justify-center">
            <div className="w-1 h-1.5 sm:w-1 sm:h-2 bg-white/70 rounded-full mt-1.5 sm:mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="py-8 sm:py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 md:-mt-10 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard value={<Counter target={250} suffix="+" />} label="Hospitals" color="emerald" />
          <StatCard value={<Counter target={15000} suffix="+" />} label="Happy Patients" color="teal" />
          <StatCard value={<Counter target={800} suffix="+" />} label="Expert Doctors" color="emerald" />
          <StatCard value={<Counter target={50000} suffix="+" />} label="Appointments" color="teal" />
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-12 sm:py-16 md:py-20" style={{ backgroundColor: "var(--muted)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "rgb(16,185,129)" }}>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" /> Why choose us
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4" style={{ color: "var(--text)" }}>
              Comprehensive Healthcare Suite
            </h2>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "var(--text-light)" }}>
              Everything you need to run a modern healthcare facility
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <FeatureCard icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />} title="Smart Appointment Booking" description="Patients can book, reschedule, or cancel appointments online. Real-time availability prevents double-booking." />
            <FeatureCard icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />} title="Schedule Management" description="Doctors set weekly hours, block time off, and manage vacations easily with drag-and-drop." />
            <FeatureCard icon={<Shield className="w-5 h-5 sm:w-6 sm:h-6" />} title="HIPAA Compliant Security" description="End-to-end encryption, role-based access, and audit logs keep patient data safe." />
            <FeatureCard icon={<Video className="w-5 h-5 sm:w-6 sm:h-6" />} title="Telemedicine Integration" description="Secure video consultations with screen sharing and prescription generation." />
            <FeatureCard icon={<Database className="w-5 h-5 sm:w-6 sm:h-6" />} title="Digital Health Records" description="Centralized patient history, lab reports, and medication lists accessible anytime." />
            <FeatureCard icon={<BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />} title="Analytics Dashboard" description="Real-time insights on appointments, revenue, and patient satisfaction." />
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4" style={{ backgroundColor: "rgba(20,184,166,0.1)", color: "rgb(20,184,166)" }}>
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" /> Simple workflow
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4" style={{ color: "var(--text)" }}>
              Simple, Transparent Workflow
            </h2>
            <p className="text-base sm:text-lg md:text-xl" style={{ color: "var(--text-light)" }}>From booking to follow-up – we've got you covered</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <StepCard number="01" title="Book Appointment" description="Patient selects doctor, date, and time slot. Instant confirmation via email/SMS." icon={<Calendar />} />
            <StepCard number="02" title="Doctor Consultation" description="In-person or video visit. Doctor reviews history and prescribes treatment." icon={<Stethoscope />} />
            <StepCard number="03" title="Follow-up & Records" description="Access prescriptions, lab results, and future appointments from patient portal." icon={<FileText />} />
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section id="testimonials" className="py-12 sm:py-16 md:py-20" style={{ backgroundColor: "var(--muted)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4" style={{ backgroundColor: "rgba(234,179,8,0.1)", color: "rgb(234,179,8)" }}>
              <Star className="w-3 h-3 sm:w-4 sm:h-4" /> Testimonials
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4" style={{ color: "var(--text)" }}>
              Trusted by Healthcare Leaders
            </h2>
            <p className="text-base sm:text-lg md:text-xl" style={{ color: "var(--text-light)" }}>See what our clients say about us</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <TestimonialCard name="Dr. Sarah Johnson" role="Cardiologist, City Hospital" quote="This platform reduced our no-show rate by 40% and saved hours of administrative work every week." rating={5} />
            <TestimonialCard name="Michael Chen" role="Hospital Administrator" quote="The reporting dashboard gives us real-time visibility into operations. A game-changer for our facility." rating={5} />
            <TestimonialCard name="Emily Rodriguez" role="Patient" quote="Booking appointments online is so easy. I love the reminders and ability to view my lab results." rating={5} />
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-6 sm:p-8 md:p-12 rounded-3xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ color: "var(--text)" }}>
              Ready to transform your healthcare experience?
            </h2>
            <p className="text-base sm:text-lg mb-6 sm:mb-8" style={{ color: "var(--text-light)" }}>
              Join thousands of satisfied patients and doctors already using MediCareHub.
            </p>
            <Link href="/register" className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-white font-semibold hover:scale-105 transition w-full sm:w-auto" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t py-8 sm:py-12" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">HMS</span>
                </div>
                <span className="font-bold text-lg sm:text-xl" style={{ color: "var(--text)" }}>MediCare<span style={{ color: "rgb(16,185,129)" }}>Hub</span></span>
              </div>
              <p className="text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>Modern hospital management system designed for efficiency and patient satisfaction.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4" style={{ color: "var(--text)" }}>Product</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>
                <li><button onClick={() => scrollToSection("features")} className="cursor-pointer hover:text-emerald-600 transition">Features</button></li>
                <li><button onClick={() => scrollToSection("how-it-works")} className="cursor-pointer hover:text-emerald-600 transition">How it works</button></li>
                <li><Link href="/pricing" className="cursor-pointer hover:text-emerald-600 transition">Pricing</Link></li>
                <li><Link href="/security" className="cursor-pointer hover:text-emerald-600 transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4" style={{ color: "var(--text)" }}>Company</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>
                <li><Link href="/about" className="cursor-pointer hover:text-emerald-600 transition">About</Link></li>
                <li><Link href="/careers" className="cursor-pointer hover:text-emerald-600 transition">Careers</Link></li>
                <li><Link href="/contact" className="cursor-pointer hover:text-emerald-600 transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4" style={{ color: "var(--text)" }}>Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>
                <li><Link href="/privacy" className="cursor-pointer hover:text-emerald-600 transition">Privacy</Link></li>
                <li><Link href="/terms" className="cursor-pointer hover:text-emerald-600 transition">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-4 sm:pt-6 text-center text-xs sm:text-sm" style={{ borderColor: "var(--border)", color: "var(--text-light)" }}>
            &copy; 2026 MediCareHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ========== REUSABLE COMPONENTS ==========

function StatCard({ value, label, color }: { value: React.ReactNode; label: string; color: string }) {
  const textColor = color === "emerald" ? "rgb(16,185,129)" : "rgb(20,184,166)";
  return (
    <div className="text-center p-3 sm:p-4 md:p-6 rounded-2xl transition-all hover:scale-[1.02] cursor-default" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: textColor }}>{value}</div>
      <div className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: "var(--text-light)" }}>{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group p-4 sm:p-5 md:p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
        <span style={{ color: "rgb(16,185,129)" }}>{icon}</span>
      </div>
      <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1.5 sm:mb-2" style={{ color: "var(--text)" }}>{title}</h3>
      <p className="text-xs sm:text-sm md:text-base" style={{ color: "var(--text-light)" }}>{description}</p>
    </div>
  );
}

function StepCard({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="relative text-center group cursor-pointer">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-sm sm:text-base" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
        {number}
      </div>
      <div className="pt-6 sm:pt-8 px-3 sm:px-4 rounded-2xl transition duration-300 hover:shadow-xl" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition" style={{ backgroundColor: "rgba(16,185,129,0.08)" }}>
          <span style={{ color: "rgb(16,185,129)" }}>{icon}</span>
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-1.5 sm:mb-2" style={{ color: "var(--text)" }}>{title}</h3>
        <p className="text-xs sm:text-sm md:text-base pb-4 sm:pb-6" style={{ color: "var(--text-light)" }}>{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ name, role, quote, rating }: { name: string; role: string; quote: string; rating: number }) {
  return (
    <div className="p-4 sm:p-5 md:p-6 rounded-2xl transition duration-300 hover:shadow-xl cursor-default" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
        {[...Array(rating)].map((_, i) => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />)}
      </div>
      <p className="text-sm sm:text-base italic mb-3 sm:mb-4" style={{ color: "var(--text)" }}>"{quote}"</p>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
          {name[0]}
        </div>
        <div>
          <p className="font-semibold text-sm sm:text-base" style={{ color: "var(--text)" }}>{name}</p>
          <p className="text-xs sm:text-sm" style={{ color: "var(--text-light)" }}>{role}</p>
        </div>
      </div>
    </div>
  );
}