import { useState, useEffect } from "react";
import { studentAPI } from "../../lib/api.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getInitials } from "../../lib/utils.js";

const SKILLS_POOL = ["JavaScript", "Python", "React", "Node.js", "Java", "SQL",
  "Machine Learning", "Data Analysis", "AWS", "Docker", "TypeScript", "Angular",
  "Vue.js", "MongoDB", "C++", "DevOps", "UI/UX", "Figma", "Excel"];

const NOTICE_PERIODS = ["Immediate", "15 days", "30 days", "60 days", "90 days"];
const GENDERS = [{ value: "male", label: "Male" }, { value: "female", label: "Female" },
  { value: "other", label: "Other" }, { value: "prefer_not_to_say", label: "Prefer not to say" }];

const inputCls = "w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

function CompletionBadge({ pct }) {
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-muted rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold">{pct}%</span>
    </div>
  );
}

export default function StudentProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    fullName: "", phone: "", alternatePhone: "", dob: "", gender: "",
    city: "", state: "", pincode: "", address: "",
    education: {
      degreeName: "", branch: "", degreeCollege: "",
      cgpa: "", passoutYear: "",
      sslcSchool: "", sslcPercentage: "",
      pucCollege: "", pucPercentage: "",
    },
    skills: [],
    linkedin: "", github: "", portfolio: "",
    expectedSalary: "", noticePeriod: "Immediate", experienceYears: "",
    preferredLocations: [],
  });

  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    studentAPI.getProfile()
      .then((res) => {
        const p = res.data?.data || res.data?.student || res.data;
        if (p) {
          setProfileCompletion(p.profileCompletion || 0);
          setForm({
            fullName: p.fullName || "",
            phone: p.phone || "",
            alternatePhone: p.alternatePhone || "",
            dob: p.dob ? p.dob.substring(0, 10) : "",
            gender: p.gender || "",
            city: p.city || "",
            state: p.state || "",
            pincode: p.pincode || "",
            address: p.address || "",
            education: {
              degreeName: p.education?.degreeName || "",
              branch: p.education?.branch || "",
              degreeCollege: p.education?.degreeCollege || "",
              cgpa: p.education?.cgpa || "",
              passoutYear: p.education?.passoutYear || "",
              sslcSchool: p.education?.sslcSchool || "",
              sslcPercentage: p.education?.sslcPercentage || "",
              pucCollege: p.education?.pucCollege || "",
              pucPercentage: p.education?.pucPercentage || "",
            },
            skills: p.skills || [],
            linkedin: p.linkedin || "",
            github: p.github || "",
            portfolio: p.portfolio || "",
            expectedSalary: p.expectedSalary || "",
            noticePeriod: p.noticePeriod || "Immediate",
            experienceYears: p.experienceYears || "",
            preferredLocations: p.preferredLocations || [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handle = (e) => set(e.target.name, e.target.value);
  const setEdu = (k, v) => setForm((f) => ({ ...f, education: { ...f.education, [k]: v } }));

  const addSkill = (s) => {
    const skill = s || skillInput.trim();
    if (skill && !form.skills.includes(skill) && form.skills.length < 20) {
      setForm((f) => ({ ...f, skills: [...f.skills, skill] }));
    }
    setSkillInput("");
  };
  const removeSkill = (s) => setForm((f) => ({ ...f, skills: f.skills.filter((sk) => sk !== s) }));

  const addLocation = () => {
    const loc = locationInput.trim();
    if (loc && !form.preferredLocations.includes(loc)) {
      setForm((f) => ({ ...f, preferredLocations: [...f.preferredLocations, loc] }));
    }
    setLocationInput("");
  };
  const removeLocation = (l) => setForm((f) => ({ ...f, preferredLocations: f.preferredLocations.filter((x) => x !== l) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const payload = {
        ...form,
        education: {
          ...form.education,
          cgpa: form.education.cgpa ? Number(form.education.cgpa) : undefined,
          passoutYear: form.education.passoutYear ? Number(form.education.passoutYear) : undefined,
          sslcPercentage: form.education.sslcPercentage ? Number(form.education.sslcPercentage) : undefined,
          pucPercentage: form.education.pucPercentage ? Number(form.education.pucPercentage) : undefined,
        },
        experienceYears: form.experienceYears ? Number(form.experienceYears) : 0,
        expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : undefined,
      };
      const res = await studentAPI.updateProfile(payload);
      const updated = res.data?.data || res.data;
      setProfileCompletion(updated?.profileCompletion || profileCompletion);
      setSuccess("Profile updated successfully!");
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
    { id: "personal", label: "Personal" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills & Preferences" },
    { id: "links", label: "Links" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {getInitials(form.fullName || user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{form.fullName || "Complete your profile"}</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Profile completion</span>
            <span>{profileCompletion}%</span>
          </div>
          <CompletionBadge pct={profileCompletion} />
          {profileCompletion < 60 && (
            <p className="text-xs text-amber-600 mt-1.5">
              Complete at least 60% to apply for jobs
            </p>
          )}
        </div>
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{success}</div>}
      {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {activeTab === "personal" && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handle} className={inputCls} placeholder="Priya Sharma" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handle} className={inputCls} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Alternate Phone</label>
                <input name="alternatePhone" value={form.alternatePhone} onChange={handle} className={inputCls} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                <input type="date" name="dob" value={form.dob} onChange={handle} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Gender</label>
                <select name="gender" value={form.gender} onChange={handle} className={inputCls}>
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
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
                <label className="block text-sm font-medium mb-1.5">Pincode</label>
                <input name="pincode" value={form.pincode} onChange={handle} className={inputCls} placeholder="560001" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Address</label>
              <textarea name="address" value={form.address} onChange={handle} rows={2} className={inputCls + " resize-none"} placeholder="Your full address..." />
            </div>
          </div>
        )}

        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold">Degree / Graduation</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Degree Name</label>
                  <input value={form.education.degreeName} onChange={(e) => setEdu("degreeName", e.target.value)} className={inputCls} placeholder="B.Tech / B.E / BCA / B.Sc" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Branch / Specialization</label>
                  <input value={form.education.branch} onChange={(e) => setEdu("branch", e.target.value)} className={inputCls} placeholder="Computer Science" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">College / University</label>
                  <input value={form.education.degreeCollege} onChange={(e) => setEdu("degreeCollege", e.target.value)} className={inputCls} placeholder="IIT Bangalore" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">CGPA / Percentage</label>
                  <input type="number" step="0.1" min="0" max="10" value={form.education.cgpa} onChange={(e) => setEdu("cgpa", e.target.value)} className={inputCls} placeholder="8.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Passout Year</label>
                  <input type="number" min="2000" max="2030" value={form.education.passoutYear} onChange={(e) => setEdu("passoutYear", e.target.value)} className={inputCls} placeholder="2025" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold">Class XII / PUC</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">College / School</label>
                  <input value={form.education.pucCollege} onChange={(e) => setEdu("pucCollege", e.target.value)} className={inputCls} placeholder="St. Joseph's PU College" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Percentage</label>
                  <input type="number" step="0.1" min="0" max="100" value={form.education.pucPercentage} onChange={(e) => setEdu("pucPercentage", e.target.value)} className={inputCls} placeholder="85" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold">Class X / SSLC</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">School Name</label>
                  <input value={form.education.sslcSchool} onChange={(e) => setEdu("sslcSchool", e.target.value)} className={inputCls} placeholder="Delhi Public School" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Percentage</label>
                  <input type="number" step="0.1" min="0" max="100" value={form.education.sslcPercentage} onChange={(e) => setEdu("sslcPercentage", e.target.value)} className={inputCls} placeholder="90" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold">Technical Skills</h2>
              <div className="flex gap-2">
                <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  className={inputCls} placeholder="Type a skill and press Enter or Add" />
                <button type="button" onClick={() => addSkill()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition whitespace-nowrap">Add</button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((s) => (
                    <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="hover:text-destructive transition ml-0.5 leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SKILLS_POOL.filter((s) => !form.skills.includes(s)).map((s) => (
                    <button key={s} type="button" onClick={() => addSkill(s)}
                      className="px-2.5 py-1 bg-muted hover:bg-primary/10 hover:text-primary rounded-full text-xs transition">+ {s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold">Job Preferences</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Experience (years)</label>
                  <input type="number" name="experienceYears" value={form.experienceYears} onChange={handle} className={inputCls} placeholder="0" min="0" max="50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Expected Salary (₹/year)</label>
                  <input type="number" name="expectedSalary" value={form.expectedSalary} onChange={handle} className={inputCls} placeholder="500000" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Notice Period</label>
                  <select name="noticePeriod" value={form.noticePeriod} onChange={handle} className={inputCls}>
                    {NOTICE_PERIODS.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Preferred Locations</label>
                <div className="flex gap-2 mb-2">
                  <input value={locationInput} onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLocation(); } }}
                    className={inputCls} placeholder="e.g. Bangalore" />
                  <button type="button" onClick={addLocation}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition whitespace-nowrap">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.preferredLocations.map((l) => (
                    <span key={l} className="flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-sm">
                      {l}
                      <button type="button" onClick={() => removeLocation(l)} className="hover:text-destructive ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "links" && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold">Online Presence</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">LinkedIn</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔗</span>
                  <input name="linkedin" value={form.linkedin} onChange={handle} className={inputCls + " pl-8"} placeholder="https://linkedin.com/in/username" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">GitHub</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">💻</span>
                  <input name="github" value={form.github} onChange={handle} className={inputCls + " pl-8"} placeholder="https://github.com/username" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Portfolio / Website</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🌐</span>
                  <input name="portfolio" value={form.portfolio} onChange={handle} className={inputCls + " pl-8"} placeholder="https://yourportfolio.com" />
                </div>
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
