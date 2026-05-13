import { useState } from "react";
import { useLocation } from "wouter";
import { authAPI } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";

const ROLES = [
  {
    id: "student",
    label: "Student / Job Seeker",
    desc: "Looking for jobs, internships, or placements",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 border-blue-200",
    activeBg: "bg-blue-600",
  },
  {
    id: "company",
    label: "Company / Recruiter",
    desc: "Post jobs and hire talented candidates",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50 border-purple-200",
    activeBg: "bg-purple-600",
  },
];

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Healthcare", "Education",
  "E-commerce & Retail", "Manufacturing", "Consulting", "Media & Entertainment",
  "Real Estate", "Logistics", "Government", "Other",
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

const SKILLS_POOL = [
  "JavaScript", "Python", "Java", "React", "Node.js", "SQL", "Machine Learning",
  "Data Analysis", "AWS", "Docker", "C++", "Angular", "Vue.js", "MongoDB",
  "TypeScript", "DevOps", "UI/UX", "Product Management",
];

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < step ? "bg-primary" : "bg-muted"}`} />
      ))}
    </div>
  );
}

function StudentForm({ onSuccess, onBack }) {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
    gender: "", dob: "", city: "", state: "",
    degree: "", branch: "", college: "", passoutYear: "", cgpa: "",
    skills: [],
    linkedin: "", github: "", portfolio: "",
    agreeTerms: false,
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const handle = (e) => set(e.target.name, e.target.type === "checkbox" ? e.target.checked : e.target.value);

  const addSkill = (s) => {
    const skill = s || skillInput.trim();
    if (skill && !form.skills.includes(skill) && form.skills.length < 15) {
      setForm((f) => ({ ...f, skills: [...f.skills, skill] }));
    }
    setSkillInput("");
  };
  const removeSkill = (s) => setForm((f) => ({ ...f, skills: f.skills.filter((sk) => sk !== s) }));

  const validateStep = () => {
    if (step === 1) {
      if (!form.fullName.trim()) { setError("Full name is required"); return false; }
      if (!form.email.trim()) { setError("Email is required"); return false; }
      if (!form.password) { setError("Password is required"); return false; }
      if (form.password.length < 8) { setError("Password must be at least 8 characters"); return false; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return false; }
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreeTerms) { setError("Please agree to the terms and conditions"); return; }
    setError(""); setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.fullName,
        email: form.email,
        password: form.password,
        role: "student",
        phone: form.phone,
        education: {
          degreeName: form.degree,
          branch: form.branch,
          degreeCollege: form.college,
          passoutYear: form.passoutYear ? Number(form.passoutYear) : undefined,
          cgpa: form.cgpa ? Number(form.cgpa) : undefined,
        },
        skills: form.skills,
        gender: form.gender,
        dob: form.dob,
        city: form.city,
        state: form.state,
        linkedin: form.linkedin,
        github: form.github,
        portfolio: form.portfolio,
      });
      const payload = res.data?.data || res.data;
      login(payload.accessToken, payload.user);
      setLocation("/student/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <StepIndicator step={step} total={3} />

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base mb-4">Account Information</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Full Name <span className="text-destructive">*</span></label>
              <input name="fullName" value={form.fullName} onChange={handle} className={inputCls} placeholder="Priya Sharma" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address <span className="text-destructive">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handle} className={inputCls} placeholder="priya@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handle} className={inputCls} placeholder="+91 9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Gender</label>
              <select name="gender" value={form.gender} onChange={handle} className={inputCls}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
              <input type="date" name="dob" value={form.dob} onChange={handle} className={inputCls} />
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
              <label className="block text-sm font-medium mb-1.5">Password <span className="text-destructive">*</span></label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handle} className={inputCls + " pr-10"} placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPass
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password <span className="text-destructive">*</span></label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handle} className={inputCls} placeholder="Re-enter password" />
            </div>
          </div>
          {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}
          <button type="button" onClick={handleNext}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition text-sm">
            Continue to Education →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base mb-4">Education & Skills</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Degree</label>
              <input name="degree" value={form.degree} onChange={handle} className={inputCls} placeholder="B.Tech / B.E / BCA" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Branch / Specialization</label>
              <input name="branch" value={form.branch} onChange={handle} className={inputCls} placeholder="Computer Science" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">College / University</label>
              <input name="college" value={form.college} onChange={handle} className={inputCls} placeholder="IIT Bangalore" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Passout Year</label>
              <input type="number" name="passoutYear" value={form.passoutYear} onChange={handle} className={inputCls} placeholder="2025" min="2000" max="2030" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">CGPA / Percentage</label>
              <input type="number" name="cgpa" value={form.cgpa} onChange={handle} className={inputCls} placeholder="8.5" step="0.1" min="0" max="10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Skills</label>
            <div className="flex gap-2 mb-2">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                className={inputCls} placeholder="Type a skill and press Enter or Add" />
              <button type="button" onClick={() => addSkill()}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition whitespace-nowrap">
                Add
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.skills.map((s) => (
                  <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-destructive ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {SKILLS_POOL.filter((s) => !form.skills.includes(s)).slice(0, 10).map((s) => (
                <button key={s} type="button" onClick={() => addSkill(s)}
                  className="px-2.5 py-1 bg-muted hover:bg-primary/10 hover:text-primary rounded-full text-xs transition">
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}
          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep(1); setError(""); }}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition">
              ← Back
            </button>
            <button type="button" onClick={() => { setError(""); setStep(3); }}
              className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition text-sm">
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-base mb-4">Online Presence & Finish</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">LinkedIn URL</label>
              <input name="linkedin" value={form.linkedin} onChange={handle} className={inputCls} placeholder="https://linkedin.com/in/username" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">GitHub URL</label>
              <input name="github" value={form.github} onChange={handle} className={inputCls} placeholder="https://github.com/username" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Portfolio / Website</label>
              <input name="portfolio" value={form.portfolio} onChange={handle} className={inputCls} placeholder="https://yourportfolio.com" />
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={handle} className="mt-0.5 rounded" />
            <span className="text-sm text-muted-foreground">
              I agree to the{" "}
              <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and{" "}
              <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
            </span>
          </label>

          {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}

          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep(2); setError(""); }}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition">
              ← Back
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-60 text-sm">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function CompanyForm({ onBack }) {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
    hrName: "", website: "", industry: "", companySize: "", foundedYear: "",
    city: "", state: "", address: "", description: "",
    gstNumber: "", panNumber: "",
    agreeTerms: false,
  });

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const validateStep = () => {
    if (step === 1) {
      if (!form.name.trim()) { setError("Name is required"); return false; }
      if (!form.email.trim()) { setError("Email is required"); return false; }
      if (!form.password) { setError("Password is required"); return false; }
      if (form.password.length < 8) { setError("Password must be at least 8 characters"); return false; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return false; }
    }
    setError(""); return true;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => s + 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agreeTerms) { setError("Please agree to the terms and conditions"); return; }
    setError(""); setLoading(true);
    try {
      const res = await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "company",
        phone: form.phone,
        hrName: form.hrName,
        website: form.website,
        industry: form.industry,
        companySize: form.companySize,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        city: form.city,
        state: form.state,
        address: form.address,
        description: form.description,
        gstNumber: form.gstNumber,
        panNumber: form.panNumber,
      });
      const payload = res.data?.data || res.data;
      login(payload.accessToken, payload.user);
      setLocation("/company/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <StepIndicator step={step} total={3} />

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base mb-4">Account Information</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Name <span className="text-destructive">*</span></label>
              <input name="name" value={form.name} onChange={handle} className={inputCls} placeholder="Acme Technologies Pvt. Ltd." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Official Email <span className="text-destructive">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handle} className={inputCls} placeholder="hr@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handle} className={inputCls} placeholder="+91 9876543210" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">HR / Contact Person Name</label>
              <input name="hrName" value={form.hrName} onChange={handle} className={inputCls} placeholder="Rahul Sharma" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Company Website</label>
              <input name="website" value={form.website} onChange={handle} className={inputCls} placeholder="https://company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password <span className="text-destructive">*</span></label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handle} className={inputCls + " pr-10"} placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password <span className="text-destructive">*</span></label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handle} className={inputCls} placeholder="Re-enter password" />
            </div>
          </div>
          {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}
          <button type="button" onClick={handleNext}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition text-sm">
            Continue to Company Details →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-base mb-4">Company Details</h3>
          <div className="grid sm:grid-cols-2 gap-3">
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
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Address</label>
              <input name="address" value={form.address} onChange={handle} className={inputCls} placeholder="123, Tech Park, Outer Ring Road" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Company Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3}
                className={inputCls + " resize-none"} placeholder="Brief description of what your company does..." />
            </div>
          </div>
          {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}
          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep(1); setError(""); }}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition">← Back</button>
            <button type="button" onClick={() => { setError(""); setStep(3); }}
              className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition text-sm">Continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-base mb-1">Compliance & Finish</h3>
          <p className="text-xs text-muted-foreground mb-4">Optional — provide GST/PAN for invoice generation</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">GST Number</label>
              <input name="gstNumber" value={form.gstNumber} onChange={handle} className={inputCls} placeholder="22AAAAA0000A1Z5" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">PAN Number</label>
              <input name="panNumber" value={form.panNumber} onChange={handle} className={inputCls} placeholder="AAAAA9999A" />
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-yellow-800">
                Company accounts require <strong>admin approval</strong> before you can post jobs.
                You'll be notified via email once approved.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={handle} className="mt-0.5 rounded" />
            <span className="text-sm text-muted-foreground">
              I agree to the{" "}
              <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and{" "}
              <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
            </span>
          </label>

          {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}
          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep(2); setError(""); }}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition">← Back</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-60 text-sm">
              {loading ? "Creating..." : "Create Company Account"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function Register() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl mb-3 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join careers.udugiri.com today</p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Role selector — always visible at top */}
          {!selectedRole ? (
            <div className="p-8">
              <h2 className="text-lg font-semibold mb-1">I am a...</h2>
              <p className="text-muted-foreground text-sm mb-6">Choose your account type to get started</p>
              <div className="space-y-3">
                {ROLES.map((role) => (
                  <button key={role.id} onClick={() => setSelectedRole(role.id)}
                    className="w-full flex items-center gap-4 p-5 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                      {role.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{role.label}</div>
                      <div className="text-sm text-muted-foreground">{role.desc}</div>
                    </div>
                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-7">
              {/* Role badge + back */}
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setSelectedRole(null)}
                  className="p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r ${ROLES.find((r) => r.id === selectedRole)?.color}`}>
                  {selectedRole === "student" ? "Student Registration" : "Company Registration"}
                </div>
              </div>

              {selectedRole === "student"
                ? <StudentForm onBack={() => setSelectedRole(null)} />
                : <CompanyForm onBack={() => setSelectedRole(null)} />
              }
            </div>
          )}

          {/* Sign in link */}
          <div className="px-7 pb-6 text-center text-sm text-muted-foreground border-t border-border pt-5">
            Already have an account?{" "}
            <button onClick={() => setLocation("/login")} className="text-primary font-semibold hover:underline">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
