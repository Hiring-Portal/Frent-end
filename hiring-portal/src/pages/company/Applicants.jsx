import { useState, useEffect } from "react";
import { companyAPI } from "../../lib/api.js";
import { formatDate, getInitials } from "../../lib/utils.js";

const STATUS_OPTIONS = ["shortlisted", "interview", "hired", "rejected"];
const STATUS_COLORS = {
  applied: "bg-blue-100 text-blue-700",
  shortlisted: "bg-yellow-100 text-yellow-700",
  interview: "bg-purple-100 text-purple-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function Applicants() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    companyAPI.getMyJobs()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.jobs || [];
        setJobs(list);
        if (list.length > 0) setSelectedJob(list[0]._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);
    companyAPI.getApplicants(selectedJob)
      .then((res) => setApplicants(Array.isArray(res.data) ? res.data : res.data?.data || res.data?.applicants || []))
      .catch(() => setApplicants([]))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  const updateStatus = async (appId, status) => {
    setUpdatingId(appId);
    try {
      await companyAPI.updateApplicationStatus(appId, status);
      setApplicants((prev) => prev.map((a) => a._id === appId ? { ...a, status } : a));
    } catch { /* ignore */ }
    finally { setUpdatingId(null); }
  };

  const filtered = filterStatus === "all" ? applicants : applicants.filter((a) => a.status === filterStatus);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Applicants</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Review and manage candidates for your job postings</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Job:</label>
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
            {jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          {["all", "applied", "shortlisted", "interview", "hired", "rejected"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-semibold mb-1">No job postings yet</h3>
          <p className="text-muted-foreground text-sm">Post a job first to see applicants</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="font-semibold mb-1">No applicants {filterStatus !== "all" ? `with status "${filterStatus}"` : "yet"}</h3>
          <p className="text-muted-foreground text-sm">Share your job posting to attract candidates</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => {
            const student = app.student || app.applicant || {};
            return (
              <div key={app._id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
                      {getInitials(student.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{student.name || "Candidate"}</h3>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                      {student.headline && <p className="text-xs text-muted-foreground">{student.headline}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[app.status] || "bg-gray-100 text-gray-600"}`}>
                      {app.status}
                    </span>
                    <select value={app.status} onChange={(e) => updateStatus(app._id, e.target.value)}
                      disabled={updatingId === app._id}
                      className="px-2 py-1 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 transition disabled:opacity-60">
                      <option value={app.status} disabled>Change status</option>
                      {STATUS_OPTIONS.filter((s) => s !== app.status).map((s) => (
                        <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {app.coverLetter && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Cover Letter</p>
                    <p className="text-sm line-clamp-3 text-foreground/80">{app.coverLetter}</p>
                  </div>
                )}
                {student.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {student.skills.slice(0, 5).map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{s}</span>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">Applied {formatDate(app.createdAt)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
