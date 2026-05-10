import { useState, useEffect } from "react";
import { adminAPI } from "../../lib/api.js";
import { formatDate, getInitials } from "../../lib/utils.js";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [page, setPage] = useState(1);

  const fetchStudents = () => {
    setLoading(true);
    adminAPI.getStudents({ search, page, limit: 20 })
      .then((res) => {
        const raw = res.data?.data;
        setStudents(Array.isArray(raw) ? raw : Array.isArray(raw?.students) ? raw.students : Array.isArray(raw?.data) ? raw.data : []);
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [search, page]);

  const toggleStatus = async (id) => {
    setTogglingId(id);
    try {
      await adminAPI.toggleUserStatus(id);
      setStudents((prev) => prev.map((s) => s._id === id ? { ...s, isActive: !s.isActive } : s));
    } catch { /* ignore */ }
    finally { setTogglingId(null); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground text-sm">{students.length} students registered</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search students..."
            className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition w-64" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">👨‍🎓</div>
          <h3 className="font-semibold mb-1">No students found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Skills</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Joined</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {s.skills?.slice(0, 2).map((skill) => (
                          <span key={skill} className="text-xs px-1.5 py-0.5 bg-muted rounded">{skill}</span>
                        ))}
                        {s.skills?.length > 2 && <span className="text-xs text-muted-foreground">+{s.skills.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(s.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {s.isActive !== false ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => toggleStatus(s._id || s.userId)} disabled={togglingId === (s._id || s.userId)}
                        className={`text-xs px-3 py-1 rounded-lg border transition disabled:opacity-60 ${s.isActive !== false ? "border-red-200 text-red-600 hover:bg-red-50" : "border-green-200 text-green-600 hover:bg-green-50"}`}>
                        {togglingId === (s._id || s.userId) ? "..." : s.isActive !== false ? "Block" : "Unblock"}
                      </button>
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
        <button onClick={() => setPage((p) => p + 1)} disabled={students.length < 20}
          className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted transition">Next</button>
      </div>
    </div>
  );
}
