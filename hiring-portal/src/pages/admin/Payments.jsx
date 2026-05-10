import { useState, useEffect } from "react";
import { adminAPI } from "../../lib/api.js";
import { formatDate, formatCurrency } from "../../lib/utils.js";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchPayments = () => {
    setLoading(true);
    adminAPI.getPayments({ search, page, limit: 20 })
      .then((res) => {
        const raw = res.data?.data;
        setPayments(Array.isArray(raw) ? raw : Array.isArray(raw?.payments) ? raw.payments : Array.isArray(raw?.data) ? raw.data : []);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, [search, page]);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground text-sm">Subscription payment history</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search payments..."
            className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition w-64" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Total Revenue</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-2xl font-bold">{payments.length}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Total Transactions</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-2xl font-bold">{payments.filter((p) => p.status === "success" || p.status === "captured").length}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Successful</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">💳</div>
          <h3 className="font-semibold mb-1">No payments found</h3>
          <p className="text-muted-foreground text-sm">Payment records will appear here once companies subscribe</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Company</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">Order ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-medium">{payment.company?.name || payment.companyName || "—"}</div>
                      <div className="text-xs text-muted-foreground">{payment.company?.email || payment.email}</div>
                    </td>
                    <td className="px-5 py-3.5 capitalize">{payment.plan || payment.planName || "—"}</td>
                    <td className="px-5 py-3.5 font-semibold text-green-700">{formatCurrency(payment.amount || 0)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(payment.createdAt || payment.paidAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                        payment.status === "success" || payment.status === "captured" ? "bg-green-100 text-green-700" :
                        payment.status === "failed" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {payment.status || "pending"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground font-mono">{payment.orderId || payment.razorpayOrderId || "—"}</td>
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
        <button onClick={() => setPage((p) => p + 1)} disabled={payments.length < 20}
          className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 hover:bg-muted transition">Next</button>
      </div>
    </div>
  );
}
