import { useState, useEffect } from "react";
import { adminAPI } from "../../lib/api.js";
import { formatDate } from "../../lib/utils.js";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchJobs = () => {
    setLoading(true);
    adminAPI.getJobs({ search, page, limit: 20 })
      .then((res) => {
        const raw = res.data?.data;
        setJobs(Array.isArray(raw) ? raw : Array.isArray(raw?.jobs) ? raw.jobs : Array.isArray(raw?.data) ? raw.data : []);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [search, page]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">All Jobs</h1>
          <p className="text-muted-foreground text-sm">{jobs.length} job listings</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search jobs..."
            className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition w-64" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💼</div>
          <h3 className="font-semibold mb-1">No jobs found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Job</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Company</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Applicants</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Posted</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{job.title}</div>
                      <div className="text-xs text-muted-foreground">{job.location}</div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{job.company?.name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">{job.type || "Full-time"}</span>
                    </td>
                    <td className="px-5 py-3.5">{job.applicantsCount || job.applications?.length || 0}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(job.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${job.status === "closed" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
                        {job.status === "closed" ? "Closed" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
          className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted transition">Previous</button>
        <span className="px-4 py-2 text-sm">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={jobs.length < 20}
          className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted transition">Next</button>
      </div>
    </div>
  );
}
