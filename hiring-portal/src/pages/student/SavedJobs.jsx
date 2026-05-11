import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { studentAPI } from "../../lib/api.js";
import { formatDate } from "../../lib/utils.js";

export default function SavedJobs() {
  const [, setLocation] = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    studentAPI.getSavedJobs()
      .then((res) => setJobs(Array.isArray(res.data) ? res.data : res.data?.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (jobId, e) => {
    e.stopPropagation();
    setRemovingId(jobId);
    try {
      await studentAPI.unsaveJob(jobId);
      setJobs((prev) => prev.filter((j) => (j._id || j.job?._id) !== jobId));
    } catch { /* ignore */ }
    finally { setRemovingId(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Saved Jobs</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{jobs.length} saved job{jobs.length !== 1 ? "s" : ""}</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-3 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-14 h-14 text-blue-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 3a2 2 0 00-2 2v16l8-5 8 5V5a2 2 0 00-2-2H6z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">No saved jobs yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Save jobs to review them later</p>
          <button onClick={() => setLocation("/student/jobs")} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((item) => {
            const job = item.job || item;
            const jobId = job._id;
            return (
              <div key={jobId} onClick={() => setLocation(`/student/jobs/${jobId}`)}
                className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">{job.company?.name?.[0] || "C"}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm">{job.title}</h3>
                      <p className="text-xs text-muted-foreground">{job.company?.name || "Company"}</p>
                    </div>
                  </div>
                  <button onClick={(e) => handleRemove(jobId, e)} disabled={removingId === jobId}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {job.location && <span>{job.location}</span>}
                  {job.type && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">{job.type}</span>}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Saved {formatDate(item.savedAt || item.createdAt)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
