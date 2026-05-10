import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { jobAPI } from "../../lib/api.js";
import { formatDate, formatCurrency, truncate } from "../../lib/utils.js";

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];
const EXPERIENCE_LEVELS = ["Fresher", "0-1 years", "1-3 years", "3-5 years", "5+ years"];

export default function StudentJobs() {
  const [, setLocation] = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ type: "", experience: "", location: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = () => {
    setLoading(true);
    jobAPI.getAll({ search, ...filters, page, limit: 12 })
      .then((res) => {
        setJobs(Array.isArray(res.data) ? res.data : res.data?.data || res.data?.jobs || []);
        setTotal(res.data?.total || 0);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [search, filters, page]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Browse Jobs</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Find your next opportunity</p>
      </div>

      {/* Search & filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            data-testid="input-search"
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search jobs, companies, skills..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filters.type} onChange={(e) => { setFilters((f) => ({ ...f, type: e.target.value })); setPage(1); }}
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
            <option value="">All Types</option>
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={filters.experience} onChange={(e) => { setFilters((f) => ({ ...f, experience: e.target.value })); setPage(1); }}
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
            <option value="">Experience</option>
            {EXPERIENCE_LEVELS.map((e) => <option key={e}>{e}</option>)}
          </select>
          <input type="text" value={filters.location} onChange={(e) => { setFilters((f) => ({ ...f, location: e.target.value })); setPage(1); }}
            placeholder="Location"
            className="px-3 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
          {(filters.type || filters.experience || filters.location || search) && (
            <button onClick={() => { setFilters({ type: "", experience: "", location: "" }); setSearch(""); setPage(1); }}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition">
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-semibold mb-1">No jobs found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{total || jobs.length} jobs found</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <button key={job._id} onClick={() => setLocation(`/student/jobs/${job._id}`)}
                className="bg-card border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{job.company?.name?.[0] || "C"}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{job.type || "Full-time"}</span>
                </div>
                <h3 className="font-semibold text-sm mb-0.5 group-hover:text-primary transition line-clamp-2">{job.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{job.company?.name || "Company"}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {job.location}
                    </span>
                  )}
                  {job.salary && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
                      {typeof job.salary === "object" ? `${formatCurrency(job.salary.min)}–${formatCurrency(job.salary.max)}` : job.salary}
                    </span>
                  )}
                </div>
                {job.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 3).map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{s}</span>
                    ))}
                    {job.skills.length > 3 && <span className="text-xs text-muted-foreground">+{job.skills.length - 3}</span>}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  Posted {formatDate(job.createdAt)}
                </div>
              </button>
            ))}
          </div>
          {total > 12 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted transition">Previous</button>
              <span className="px-4 py-2 text-sm">Page {page}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={jobs.length < 12}
                className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted transition">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
