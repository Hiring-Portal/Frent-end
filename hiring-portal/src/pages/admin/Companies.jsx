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
} from "@/components/ui/pagination";

const STATUS_COLORS = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [processingId, setProcessingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);

  const fetchCompanies = () => {
    setLoading(true);
    adminAPI
      .getCompanies({
        search,
        approvalStatus: filter === "all" ? "" : filter,   // ← Fixed: using approvalStatus
        page: currentPage,
        limit: 20,
      })
      .then((res) => {
        const responseData = res.data?.data || res.data;

        const companyList = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.companies)
          ? responseData.companies
          : Array.isArray(responseData?.data)
          ? responseData.data
          : [];

        const meta = responseData?.meta || responseData?.pagination;

        setCompanies(companyList);
        setTotalCompanies(meta?.total || companyList.length);
        setTotalPages(meta?.pages || 1);
        setCurrentPage(meta?.page || 1);
      })
      .catch((err) => {
        console.error(err);
        setCompanies([]);
        toast.error(err?.response?.data?.message || "Failed to fetch companies");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, filter, currentPage]);

  const approve = async (id) => {
    setProcessingId(id);
    try {
      await adminAPI.approveCompany(id);
      toast.success("Company approved successfully");
      fetchCompanies(); // Refresh list
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve company");
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (id) => {
    setProcessingId(id);
    try {
      await adminAPI.rejectCompany(id);
      toast.success("Company rejected successfully");
      fetchCompanies(); // Refresh list
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reject company");
    } finally {
      setProcessingId(null);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-muted-foreground text-sm">
            {totalCompanies} companies registered
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search companies..."
            className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition w-64"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {status}
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
          <p className="text-muted-foreground text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[950px]">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Company</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">HR Name</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Industry</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Joined</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {companies.map((company) => (
                    <tr key={company._id} className="hover:bg-muted/30 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {getInitials(company.companyName || "C")}
                          </div>
                          <div>
                            <div className="font-medium">{company.companyName}</div>
                            <div className="text-xs text-muted-foreground">{company.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">{company.hrName || "-"}</td>
                      <td className="px-5 py-4">{company.industry || "-"}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {formatDate(company.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
                            STATUS_COLORS[company.approvalStatus] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {company.approvalStatus || "pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {(company.approvalStatus === "pending" || !company.approvalStatus) && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approve(company._id)}
                              disabled={processingId === company._id}
                              className="px-4 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => reject(company._id)}
                              disabled={processingId === company._id}
                              className="px-4 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {company.approvalStatus === "approved" && (
                          <span className="text-green-600 font-medium text-sm">Approved</span>
                        )}
                        {company.approvalStatus === "rejected" && (
                          <span className="text-red-600 font-medium text-sm">Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages >= 1 && companies.length > 0 && (
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