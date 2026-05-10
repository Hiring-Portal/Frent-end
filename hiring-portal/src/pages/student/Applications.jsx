import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { applicationAPI } from "../../lib/api.js";
import { formatDate } from "../../lib/utils.js";

const STATUS_COLORS = {
  applied: "bg-blue-100 text-blue-700",
  shortlisted: "bg-yellow-100 text-yellow-700",
  interview: "bg-purple-100 text-purple-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-100 text-gray-600",
};

export default function StudentApplications() {
  const [, setLocation] = useLocation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    applicationAPI.getMy()
      .then((res) => setApplications(Array.isArray(res.data) ? res.data : res.data?.data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{applications.length} total applications</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "applied", "shortlisted", "interview", "hired", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition ${filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-semibold mb-1">{filter === "all" ? "No applications yet" : `No ${filter} applications`}</h3>
          <p className="text-muted-foreground text-sm mb-4">Start applying to jobs to track them here</p>
          <button onClick={() => setLocation("/student/jobs")} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app._id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{(app.job?.company?.name || app.company?.name || "C")[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{app.job?.title || "Job"}</h3>
                    <p className="text-xs text-muted-foreground">{app.job?.company?.name || app.company?.name || "Company"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Applied {formatDate(app.createdAt)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0 ${STATUS_COLORS[app.status] || "bg-gray-100 text-gray-600"}`}>
                  {app.status}
                </span>
              </div>
              {app.coverLetter && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground line-clamp-2">{app.coverLetter}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
