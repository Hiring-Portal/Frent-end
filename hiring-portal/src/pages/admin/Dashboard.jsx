import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { adminAPI } from "../../lib/api.js";
import { toast } from "sonner";

import {
  Users,
  Building2,
  Briefcase,
  FileText,
  IndianRupee,
  Clock3,
  Upload,
  CreditCard,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingCompanies: 0,
    pendingJobs: 0,
    totalPlacements: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await adminAPI.getStats();

      console.log("Dashboard Response:", res.data);

      const dashboardStats = res?.data?.data?.stats || {};

      setStats(dashboardStats);

      toast.success("Dashboard loaded successfully");
    } catch (err) {
      console.error("Dashboard Error:", err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      color: "from-blue-500 to-blue-700",
      icon: Users,
      href: "/admin/students",
    },
    {
      label: "Total Companies",
      value: stats.totalCompanies,
      color: "from-purple-500 to-purple-700",
      icon: Building2,
      href: "/admin/companies",
    },
    {
      label: "Total Jobs",
      value: stats.totalJobs,
      color: "from-green-500 to-green-700",
      icon: Briefcase,
      href: "/admin/jobs",
    },
    {
      label: "Applications",
      value: stats.totalApplications,
      color: "from-yellow-500 to-orange-500",
      icon: FileText,
      href: "/admin/students",
    },
    {
      label: "Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      color: "from-emerald-500 to-emerald-700",
      icon: IndianRupee,
      href: "/admin/payments",
    },
    {
      label: "Pending Companies",
      value: stats.pendingCompanies,
      color: "from-red-500 to-red-700",
      icon: Clock3,
      href: "/admin/companies",
    },
  ];

  const applicationStatusData = [
    { name: "Applied", value: 24 },
    { name: "Shortlisted", value: 12 },
    { name: "Interview", value: 8 },
    { name: "Hired", value: 5 },
    { name: "Rejected", value: 15 },
  ];

  const monthlyData = [
    { month: "Jan", students: 12, companies: 3 },
    { month: "Feb", students: 19, companies: 5 },
    { month: "Mar", students: 28, companies: 8 },
    { month: "Apr", students: 35, companies: 12 },
    { month: "May", students: 42, companies: 9 },
    { month: "Jun", students: 38, companies: 14 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Admin Dashboard
            </h1>

            <p className="text-muted-foreground text-sm mt-1">
              Platform overview and analytics
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.label}
                onClick={() => setLocation(card.href)}
                className="group bg-card border border-border rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition`}
                />

                <div className="relative flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-bold">
                      {card.value}
                    </h2>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="text-white w-7 h-7" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Bar Chart */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg">
                Monthly Registrations
              </h2>
            </div>

            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="students"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="companies"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg">
                Application Status
              </h2>
            </div>

            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label
                  >
                    {applicationStatusData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setLocation("/admin/bulk-import")}
            className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-5 text-left hover:scale-[1.02] hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-6 h-6" />

              <h3 className="font-semibold text-lg">
                Bulk Import
              </h3>
            </div>

            <p className="text-sm opacity-90">
              Import students or companies
            </p>
          </button>

          <button
            onClick={() => setLocation("/admin/companies")}
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-2xl p-5 text-left hover:scale-[1.02] hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <Clock3 className="w-6 h-6" />

              <h3 className="font-semibold text-lg">
                Pending Approvals
              </h3>
            </div>

            <p className="text-sm opacity-90">
              {stats.pendingCompanies} companies awaiting
              approval
            </p>
          </button>

          <button
            onClick={() => setLocation("/admin/payments")}
            className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-2xl p-5 text-left hover:scale-[1.02] hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="w-6 h-6" />

              <h3 className="font-semibold text-lg">
                Payments
              </h3>
            </div>

            <p className="text-sm opacity-90">
              View payment history
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}