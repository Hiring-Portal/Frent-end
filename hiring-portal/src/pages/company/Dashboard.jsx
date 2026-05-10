import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { companyAPI } from "../../lib/api.js";
import { useAuth } from "../../hooks/useAuth.js";
import { formatDate } from "../../lib/utils.js";

const STATUS_COLORS = {
  applied: "bg-blue-100 text-blue-700",
  shortlisted: "bg-yellow-100 text-yellow-700",
  interview: "bg-purple-100 text-purple-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyAPI.getMyJobs()
      .then((res) => setJobs(Array.isArray(res.data) ? res.data : res.data?.data || res.data?.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantsCount || j.applications?.length || 0), 0);
  const activeJobs = jobs.filter((j) => j.status === "active" || !j.status).length;

  if (loading) return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your job postings and applicants</p>
        </div>
        <button onClick={() => setLocation("/company/jobs/create")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Post a Job
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Jobs", value: jobs.length, color: "bg-blue-500", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
          { label: "Active Jobs", value: activeJobs, color: "bg-green-500", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Total Applicants", value: totalApplicants, color: "bg-purple-500", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
          { label: "Hired", value: 0, color: "bg-yellow-500", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Your Job Postings</h2>
          <button onClick={() => setLocation("/company/applicants")} className="text-xs text-primary hover:underline">View applicants</button>
        </div>
        {jobs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="font-semibold mb-1">No jobs posted yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Post your first job to start receiving applications</p>
            <button onClick={() => setLocation("/company/jobs/create")}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition">
              Post a Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Job Title</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Applicants</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Posted</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-3.5 font-medium">{job.title}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{job.type || "Full-time"}</td>
                    <td className="px-5 py-3.5">{job.applicantsCount || job.applications?.length || 0}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(job.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.status === "closed" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
                        {job.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subscription upsell */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold text-lg">Unlock full candidate profiles</h3>
          <p className="text-blue-100 text-sm mt-0.5">Upgrade your subscription to view and contact candidates directly</p>
        </div>
        <button onClick={() => setLocation("/company/subscription")}
          className="px-5 py-2 bg-white text-primary font-semibold text-sm rounded-lg hover:bg-blue-50 transition">
          View Plans
        </button>
      </div>
    </div>
  );
}
