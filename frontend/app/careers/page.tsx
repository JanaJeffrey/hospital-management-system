"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Briefcase, MapPin, Clock, DollarSign, 
  Users, Award, TrendingUp, Sparkles, CheckCircle,
  ExternalLink, Mail, Calendar, Building, Heart,
  Zap, Star, GraduationCap, Globe, XCircle
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Remote" | "Contract" | "Internship";
  postedDate: string;
  description: string;
  requirements: string[];
  benefits: string[];
  salary: string;
}

export default function CareersPage() {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const jobs: Job[] = [
    {
      id: 1,
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      postedDate: "2026-06-20",
      description: "Build the future of healthcare technology. We're looking for a passionate Full Stack Developer to join our team and help us create innovative solutions for patients and doctors.",
      requirements: [
        "3+ years of experience with React, Next.js, and TypeScript",
        "Experience with Node.js and PostgreSQL",
        "Strong understanding of REST APIs and authentication",
        "Passion for healthcare technology",
        "Excellent problem-solving skills"
      ],
      benefits: [
        "Competitive salary",
        "Remote-first culture",
        "Health insurance",
        "Learning budget",
        "Flexible working hours"
      ],
      salary: "$120,000 - $150,000"
    },
    {
      id: 2,
      title: "Healthcare Product Manager",
      department: "Product",
      location: "New York, NY",
      type: "Full-time",
      postedDate: "2026-06-18",
      description: "Shape the future of healthcare products. We need a Product Manager who understands the healthcare industry and can translate user needs into amazing features.",
      requirements: [
        "5+ years of product management experience",
        "Experience in healthcare or healthtech",
        "Strong analytical and communication skills",
        "Ability to work with cross-functional teams",
        "User-centric mindset"
      ],
      benefits: [
        "Competitive salary + equity",
        "Health benefits",
        "Flexible PTO",
        "Professional development",
        "Team retreats"
      ],
      salary: "$140,000 - $170,000"
    },
    {
      id: 3,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      postedDate: "2026-06-15",
      description: "Keep our platform running smoothly. We need a DevOps Engineer to manage our cloud infrastructure and ensure high availability.",
      requirements: [
        "3+ years of DevOps experience",
        "Experience with AWS, Docker, and Kubernetes",
        "Knowledge of CI/CD pipelines",
        "Infrastructure as Code (Terraform)",
        "Security best practices"
      ],
      benefits: [
        "Competitive salary",
        "Remote work",
        "Health insurance",
        "Learning budget",
        "On-call compensation"
      ],
      salary: "$130,000 - $160,000"
    },
    {
      id: 4,
      title: "UX/UI Designer",
      department: "Design",
      location: "San Francisco, CA",
      type: "Full-time",
      postedDate: "2026-06-12",
      description: "Design beautiful and intuitive healthcare experiences. We need a UX/UI Designer who can create user-friendly interfaces for patients and doctors.",
      requirements: [
        "3+ years of UX/UI design experience",
        "Experience with Figma and design systems",
        "Strong portfolio",
        "User research experience",
        "Healthcare industry knowledge is a plus"
      ],
      benefits: [
        "Competitive salary",
        "Health insurance",
        "Design tools budget",
        "Conference attendance",
        "Flexible hours"
      ],
      salary: "$110,000 - $140,000"
    },
    {
      id: 5,
      title: "Healthcare Data Analyst",
      department: "Data",
      location: "Remote",
      type: "Full-time",
      postedDate: "2026-06-10",
      description: "Turn data into insights. We need a Data Analyst who can analyze healthcare data and provide actionable insights to improve patient outcomes.",
      requirements: [
        "3+ years of data analysis experience",
        "Experience with SQL and Python",
        "Healthcare data experience",
        "Strong communication skills",
        "Data visualization skills"
      ],
      benefits: [
        "Competitive salary",
        "Remote work",
        "Health insurance",
        "Learning budget",
        "Data tools stipend"
      ],
      salary: "$90,000 - $120,000"
    },
    {
      id: 6,
      title: "Customer Support Specialist",
      department: "Operations",
      location: "Austin, TX",
      type: "Full-time",
      postedDate: "2026-06-08",
      description: "Help healthcare providers and patients succeed. We're looking for a Customer Support Specialist who can provide exceptional support to our users.",
      requirements: [
        "2+ years of customer support experience",
        "Healthcare industry knowledge",
        "Excellent communication skills",
        "Empathy and patience",
        "Tech-savvy"
      ],
      benefits: [
        "Competitive salary",
        "Health insurance",
        "Flexible hours",
        "Career growth",
        "Supportive team"
      ],
      salary: "$50,000 - $65,000"
    }
  ];

  const openApplyModal = (job: Job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Full-time": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "Remote": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Part-time": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "Contract": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "Internship": return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--text)" }} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6" style={{ color: "rgb(16,185,129)" }} />
              <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Careers</h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-light)" }}>
              Join our team and help transform healthcare
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-light)" }}>
          <Users className="w-4 h-4" /> {jobs.length} open positions
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden p-8 sm:p-12" style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 border-2 border-white rounded-full"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Build the Future of Healthcare</h2>
          <p className="text-white/80 max-w-2xl text-sm sm:text-base">
            Join a passionate team dedicated to making healthcare accessible, efficient, and secure for everyone.
            We're looking for talented individuals who want to make a difference.
          </p>
          <div className="flex flex-wrap gap-6 mt-6 text-white/90 text-sm">
            <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> Innovative culture</span>
            <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> Healthcare impact</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Career growth</span>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {jobs.map((job) => (
          <div 
            key={job.id} 
            className="rounded-2xl p-5 transition-all hover:shadow-xl hover:-translate-y-1"
            style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>{job.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-sm" style={{ color: "var(--text-light)" }}>
                    <Building className="w-3 h-3" /> {job.department}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm" style={{ color: "var(--text-light)" }}>
                    <MapPin className="w-3 h-3" /> {job.location}
                  </span>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTypeColor(job.type)}`}>
                {job.type}
              </span>
            </div>

            <p className="text-sm mt-3 line-clamp-2" style={{ color: "var(--text-light)" }}>
              {job.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs" style={{ color: "var(--text-light)" }}>
              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(job.postedDate)}</span>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => openApplyModal(job)}
                className="flex-1 px-4 py-2 rounded-xl text-white font-medium text-sm hover:scale-105 transition"
                style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
              >
                Apply Now
              </button>
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setShowApplyModal(true);
                }}
                className="px-4 py-2 rounded-xl font-medium text-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ color: "var(--text)", backgroundColor: "var(--muted)" }}
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowApplyModal(false)}>
          <div className="max-w-2xl w-full rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b sticky top-0" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold" style={{ color: "var(--text)" }}>{selectedJob.title}</h3>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <XCircle className="w-5 h-5" style={{ color: "var(--text-light)" }} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Job Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Department</p>
                  <p className="font-semibold text-sm mt-1" style={{ color: "var(--text)" }}>{selectedJob.department}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Location</p>
                  <p className="font-semibold text-sm mt-1" style={{ color: "var(--text)" }}>{selectedJob.location}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--input-bg)" }}>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-light)" }}>Type</p>
                  <p className="font-semibold text-sm mt-1" style={{ color: "var(--text)" }}>{selectedJob.type}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2" style={{ color: "var(--text)" }}>About the Role</h4>
                <p className="text-sm" style={{ color: "var(--text-light)" }}>{selectedJob.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2" style={{ color: "var(--text)" }}>Requirements</h4>
                <ul className="space-y-1">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-light)" }}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgb(16,185,129)" }} />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2" style={{ color: "var(--text)" }}>Benefits</h4>
                <ul className="space-y-1">
                  {selectedJob.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-light)" }}>
                      <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgb(16,185,129)" }} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                  style={{ backgroundColor: "var(--muted)", color: "var(--text)" }}
                >
                  Close
                </button>
                <a
                  href={`mailto:careers@medicarehub.com?subject=Application for ${selectedJob.title}`}
                  className="flex-1 px-4 py-2 rounded-xl text-white font-medium text-sm hover:scale-105 transition text-center"
                  style={{ background: "linear-gradient(135deg, rgb(16,185,129), rgb(20,184,166))" }}
                >
                  <Mail className="w-4 h-4 inline mr-1" /> Apply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}