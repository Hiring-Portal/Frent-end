import { useState, useEffect } from "react";
import { adminAPI } from "../../lib/api.js";
import { formatDate, getInitials } from "../../lib/utils.js";

const STATUS_COLORS = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [processingId, setProcessingId] = useState(null);
  const [page, setPage] = useState(1);

  const fetchCompanies = () => {
    setLoading(true);
    adminAPI.getCompanies({ search, status: filter === "all" ? "" : filter, page, limit: 20 })
      .then((res) => {
        const raw = res.data?.data;
        setCompanies(Array.isArray(raw) ? raw : Array.isArray(raw?.companies) ? raw.companies : Array.isArray(raw?.data) ? raw.data : []);
      })
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCompanies(); }, [search, filter, page]);

  const approve = async (id) => {
    setProcessingId(id);
    try {
      await adminAPI.approveCompany(id);
      setCompanies((prev) => prev.map((c) => c._id === id ? { ...c, status: "approved" } : c));
    } catch { /* ignore */ }
    finally { setProcessingId(null); }
  };

  const reject = async (id) => {
    setProcessingId(id);
    try {
      await adminAPI.rejectCompany(id);
      setCompanies((prev) => prev.map((c) => c._id === id ? { ...c, status: "rejected" } : c));
    } catch { /* ignore */ }
    finally { setProcessingId(null); }
  };

  const pendingCount = companies.filter((c) => c.status === "pending").length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-yellow-600 mt-0.5 font-medium">{pendingCount} pending approval</p>
          )}
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search companies..."
            className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition w-64" />
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🏢</div>
          <h3 className="font-semibold mb-1">No companies found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((company) => (
            <div key={company._id} className={`bg-card border rounded-xl p-5 ${company.status === "pending" ? "border-yellow-200 bg-yellow-50/30" : "border-border"}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {getInitials(company.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-xs text-muted-foreground">{company.email}</p>
                    <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                      {company.industry && <span>{company.industry}</span>}
                      {company.location && <span>· {company.location}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[company.status] || "bg-gray-100 text-gray-600"}`}>
                    {company.status || "pending"}
                  </span>
                  {(company.status === "pending" || !company.status) && (
                    <>
                      <button onClick={() => approve(company._id)} disabled={processingId === company._id}
                        className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60">
                        Approve
                      </button>
                      <button onClick={() => reject(company._id)} disabled={processingId === company._id}
                        className="text-xs px-3 py-1 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition disabled:opacity-60">
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Registered {formatDate(company.createdAt)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
          className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted transition">Previous</button>
        <span className="px-4 py-2 text-sm">Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={companies.length < 20}
          className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted transition">Next</button>
      </div>
    </div>
  );
}
