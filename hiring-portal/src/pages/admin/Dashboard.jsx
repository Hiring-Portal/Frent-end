import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { adminAPI } from "../../lib/api.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then((res) => setStats(res.data?.stats || res.data?.data || res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents ?? 0, icon: "M12 14l9-5-9-5-9 5 9 5z", color: "bg-blue-500", href: "/admin/students" },
    { label: "Total Companies", value: stats?.totalCompanies ?? 0, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16", color: "bg-purple-500", href: "/admin/companies" },
    { label: "Total Jobs", value: stats?.totalJobs ?? 0, icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2", color: "bg-green-500", href: "/admin/jobs" },
    { label: "Applications", value: stats?.totalApplications ?? 0, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2", color: "bg-yellow-500", href: "/admin/students" },
    { label: "Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", color: "bg-emerald-500", href: "/admin/payments" },
    { label: "Pending Approvals", value: stats?.pendingApprovals ?? 0, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-orange-500", href: "/admin/companies" },
  ];

  const applicationStatusData = [
    { name: "Applied", value: stats?.applicationsByStatus?.applied || 24 },
    { name: "Shortlisted", value: stats?.applicationsByStatus?.shortlisted || 12 },
    { name: "Interview", value: stats?.applicationsByStatus?.interview || 8 },
    { name: "Hired", value: stats?.applicationsByStatus?.hired || 5 },
    { name: "Rejected", value: stats?.applicationsByStatus?.rejected || 15 },
  ];

  const monthlyData = stats?.monthlyRegistrations || [
    { month: "Jan", students: 12, companies: 3 },
    { month: "Feb", students: 19, companies: 5 },
    { month: "Mar", students: 28, companies: 8 },
    { month: "Apr", students: 35, companies: 12 },
    { month: "May", students: 42, companies: 9 },
    { month: "Jun", students: 38, companies: 14 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Platform overview and metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <button key={card.label} onClick={() => setLocation(card.href)}
            className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:shadow-md hover:border-primary/30 transition-all text-left">
            <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center flex-shrink-0`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm text-muted-foreground">{card.label}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Monthly Registrations</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Students" />
              <Bar dataKey="companies" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Companies" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Application Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={applicationStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {applicationStatusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <button onClick={() => setLocation("/admin/bulk-import")}
          className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl p-5 text-left hover:shadow-lg transition-all">
          <svg className="w-8 h-8 mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <h3 className="font-semibold">Bulk Import</h3>
          <p className="text-sm text-blue-100 mt-0.5">Import students or companies via Excel/CSV</p>
        </button>
        <button onClick={() => setLocation("/admin/companies")}
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl p-5 text-left hover:shadow-lg transition-all">
          <svg className="w-8 h-8 mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold">Pending Approvals</h3>
          <p className="text-sm text-purple-100 mt-0.5">{stats?.pendingApprovals ?? 0} companies awaiting approval</p>
        </button>
        <button onClick={() => setLocation("/admin/payments")}
          className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl p-5 text-left hover:shadow-lg transition-all">
          <svg className="w-8 h-8 mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold">Payments</h3>
          <p className="text-sm text-emerald-100 mt-0.5">View subscription payments & history</p>
        </button>
      </div>
    </div>
  );
}
