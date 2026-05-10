import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { studentAPI, applicationAPI, jobAPI } from "../../lib/api.js";
import { useAuth } from "../../hooks/useAuth.js";
import { formatDate, truncate } from "../../lib/utils.js";

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <div className="text-2xl font-bold">{value ?? "—"}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  applied: "bg-blue-100 text-blue-700",
  shortlisted: "bg-yellow-100 text-yellow-700",
  interview: "bg-purple-100 text-purple-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationAPI.getMy().catch(() => ({ data: [] })),
      studentAPI.getRecommendations().catch(() => ({ data: [] })),
    ]).then(([apps, recs]) => {
      setApplications(Array.isArray(apps.data) ? apps.data : apps.data?.data || []);
      setRecommended(Array.isArray(recs.data) ? recs.data : recs.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: applications.length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    interviews: applications.filter((a) => a.status === "interview").length,
    hired: applications.filter((a) => a.status === "hired").length,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Here's your job search overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Applied" value={stats.total} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" color="bg-primary" />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-yellow-500" />
        <StatCard label="Interviews" value={stats.interviews} icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" color="bg-purple-500" />
        <StatCard label="Offers" value={stats.hired} icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" color="bg-green-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Recent Applications</h2>
            <button onClick={() => setLocation("/student/applications")} className="text-xs text-primary hover:underline">View all</button>
          </div>
          {applications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-muted-foreground text-sm">No applications yet</div>
              <button onClick={() => setLocation("/student/jobs")} className="mt-3 text-xs text-primary hover:underline">Browse jobs</button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {applications.slice(0, 5).map((app) => (
                <div key={app._id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{app.job?.title || "Job"}</div>
                    <div className="text-xs text-muted-foreground truncate">{app.job?.company?.name || app.company?.name || "Company"}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ml-2 flex-shrink-0 ${STATUS_COLORS[app.status] || "bg-gray-100 text-gray-600"}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Recommended for You</h2>
            <button onClick={() => setLocation("/student/jobs")} className="text-xs text-primary hover:underline">See all</button>
          </div>
          {recommended.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-muted-foreground text-sm">Complete your profile to get recommendations</div>
              <button onClick={() => setLocation("/student/profile")} className="mt-3 text-xs text-primary hover:underline">Update profile</button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recommended.slice(0, 5).map((job) => (
                <button key={job._id} onClick={() => setLocation(`/student/jobs/${job._id}`)}
                  className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-muted/50 transition text-left">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{job.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{job.company?.name} · {job.location}</div>
                  </div>
                  <svg className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-1">Complete your profile</h3>
        <p className="text-blue-100 text-sm mb-4">A complete profile gets 3x more recruiter views</p>
        <button onClick={() => setLocation("/student/profile")}
          className="px-5 py-2 bg-white text-primary font-semibold text-sm rounded-lg hover:bg-blue-50 transition">
          Update Profile
        </button>
      </div>
    </div>
  );
}
