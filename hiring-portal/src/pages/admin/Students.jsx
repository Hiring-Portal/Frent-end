import { useState, useEffect } from "react";
import { adminAPI } from "../../lib/api.js";
import { formatDate, getInitials } from "../../lib/utils.js";
import { toast } from "sonner";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const fetchStudents = () => {
    setLoading(true);
    adminAPI
      .getStudents({
        search,
        page: currentPage,
        limit: 20,
      })
      .then((res) => {
        const responseData = res.data?.data || res.data;

        const studentList = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
          ? responseData.data
          : Array.isArray(responseData?.students)
          ? responseData.students
          : [];

        const meta = responseData?.meta || responseData?.pagination;

        setStudents(studentList);
        setTotalStudents(meta?.total || studentList.length);
        setTotalPages(meta?.pages || 1);
        setCurrentPage(meta?.page || 1);        // ← Fixed
      })
      .catch((err) => {
        console.error(err);
        setStudents([]);
        toast.error(err?.response?.data?.message || "Failed to fetch students");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, [search, currentPage]);

  const toggleStatus = async (id) => {
    setTogglingId(id);
    try {
      const res = await adminAPI.toggleUserStatus(id);
      const updatedStatus = res?.data?.data?.isActive;
      const message = res?.data?.message || "Status updated successfully";

      setStudents((prev) =>
        prev.map((s) =>
          (s.userId?._id || s.userId) === id
            ? { ...s, isActive: updatedStatus }
            : s
        )
      );
      toast.success(message);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  // Simple pagination for small number of pages
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-muted-foreground text-sm">
            {totalStudents} students registered
          </p>
        </div>

        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search students..."
            className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition w-64"
          />
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
        <>
          {/* Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
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
                  {students.map((s) => {
                    const userId = s.userId?._id || s.userId;
                    return (
                      <tr key={s._id} className="hover:bg-muted/30 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold uppercase shadow-sm">
                              {getInitials(s.fullName || "U")}
                            </div>
                            <div>
                              <div className="font-medium">{s.fullName}</div>
                              <div className="text-xs text-muted-foreground">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {s.skills?.slice(0, 2).map((skill) => (
                              <span key={skill} className="text-xs px-2 py-1 bg-muted rounded-md">
                                {skill}
                              </span>
                            ))}
                            {s.skills?.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{s.skills.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            s.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {s.isActive !== false ? "Active" : "Blocked"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => toggleStatus(userId)}
                            disabled={togglingId === userId}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition disabled:opacity-60 ${
                              s.isActive !== false
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {togglingId === userId ? "..." : s.isActive !== false ? "Block" : "Unblock"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ✅ Pagination - Now shows even for 1 page */}
          {totalPages >= 1 && students.length > 0 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={currentPage === pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}