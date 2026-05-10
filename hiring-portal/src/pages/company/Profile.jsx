import { useState, useEffect } from "react";
import { companyAPI } from "../../lib/api.js";
import { useAuth } from "../../hooks/useAuth.js";

const INDUSTRIES = ["Technology", "Finance & Banking", "Healthcare", "Education",
  "E-commerce & Retail", "Manufacturing", "Consulting", "Media & Entertainment",
  "Real Estate", "Logistics", "Government", "Other"];
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

const inputCls = "w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

const STATUS_BADGE = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  approved: "bg-green-100 text-green-800 border border-green-200",
  rejected: "bg-red-100 text-red-800 border border-red-200",
};

export default function CompanyProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("pending");
  const [activeTab, setActiveTab] = useState("basic");

  const [form, setForm] = useState({
    companyName: "", email: "", phone: "", hrName: "",
    website: "", industry: "", companySize: "", foundedYear: "",
    address: "", city: "", state: "", country: "India",
    description: "", gstNumber: "", panNumber: "",
  });

  useEffect(() => {
    companyAPI.getProfile()
      .then((res) => {
        const p = res.data?.data || res.data?.company || res.data;
        if (p) {
          setApprovalStatus(p.approvalStatus || "pending");
          setForm({
            companyName: p.companyName || "",
            email: p.email || user?.email || "",
            phone: p.phone || "",
            hrName: p.hrName || "",
            website: p.website || "",
            industry: p.industry || "",
            companySize: p.companySize || "",
            foundedYear: p.foundedYear || "",
            address: p.address || "",
            city: p.city || "",
            state: p.state || "",
            country: p.country || "India",
            description: p.description || "",
            gstNumber: p.gstNumber || "",
            panNumber: p.panNumber || "",
          });
        }
      })
      .catch(() => setForm((f) => ({ ...f, email: user?.email || "" })))
      .finally(() => setLoading(false));
  }, []);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      const payload = { ...form, foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined };
      await companyAPI.updateProfile(payload);
      setSuccess("Company profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const TABS = [
    { id: "basic", label: "Basic Info" },
    { id: "details", label: "Company Details" },
    { id: "compliance", label: "GST / PAN" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xl font-bold flex-shrink-0">
              {form.companyName ? form.companyName[0].toUpperCase() : "C"}
            </div>
            <div>
              <h1 className="text-xl font-bold">{form.companyName || "Company Profile"}</h1>
              <p className="text-muted-foreground text-sm">{form.email}</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0 ${STATUS_BADGE[approvalStatus] || STATUS_BADGE.pending}`}>
            {approvalStatus === "approved" ? "✓ Approved" : approvalStatus === "rejected" ? "✗ Rejected" : "⏳ Pending Approval"}
          </span>
        </div>

        {approvalStatus === "pending" && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            Your account is pending admin approval. You'll receive an email once approved and can post jobs.
          </div>
        )}
        {approvalStatus === "rejected" && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            Your account was rejected. Please contact support or update your profile and reapply.
          </div>
        )}
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}
      {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {activeTab === "basic" && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold">Basic Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Company Name</label>
                <input name="companyName" value={form.companyName} onChange={handle} className={inputCls} placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Official Email</label>
                <input name="email" value={form.email} onChange={handle} className={inputCls} placeholder="hr@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handle} className={inputCls} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">HR / Contact Person</label>
                <input name="hrName" value={form.hrName} onChange={handle} className={inputCls} placeholder="Rahul Sharma" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Website</label>
                <input name="website" value={form.website} onChange={handle} className={inputCls} placeholder="https://company.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Company Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={4}
                className={inputCls + " resize-none"} placeholder="Tell candidates about your company, culture, and mission..." />
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold">Company Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Industry</label>
                <select name="industry" value={form.industry} onChange={handle} className={inputCls}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Company Size</label>
                <select name="companySize" value={form.companySize} onChange={handle} className={inputCls}>
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Founded Year</label>
                <input type="number" name="foundedYear" value={form.foundedYear} onChange={handle} className={inputCls} placeholder="2015" min="1900" max="2024" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">City</label>
                <input name="city" value={form.city} onChange={handle} className={inputCls} placeholder="Bangalore" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">State</label>
                <input name="state" value={form.state} onChange={handle} className={inputCls} placeholder="Karnataka" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Country</label>
                <input name="country" value={form.country} onChange={handle} className={inputCls} placeholder="India" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Address</label>
                <textarea name="address" value={form.address} onChange={handle} rows={2}
                  className={inputCls + " resize-none"} placeholder="123, Tech Park, Outer Ring Road" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold">Compliance Details</h2>
            <p className="text-sm text-muted-foreground">Optional — used for invoice generation and verification</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">GST Number</label>
                <input name="gstNumber" value={form.gstNumber} onChange={handle} className={inputCls} placeholder="22AAAAA0000A1Z5" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">PAN Number</label>
                <input name="panNumber" value={form.panNumber} onChange={handle} className={inputCls} placeholder="AAAAA9999A" />
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={saving}
          className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-60 text-sm">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
