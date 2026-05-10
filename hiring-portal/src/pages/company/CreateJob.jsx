import { useState } from "react";
import { useLocation } from "wouter";
import { companyAPI } from "../../lib/api.js";

const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];
const EXPERIENCE_LEVELS = ["Fresher", "0-1 years", "1-3 years", "3-5 years", "5+ years"];

export default function CreateJob() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [reqInput, setReqInput] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", type: "Full-time", experience: "Fresher",
    location: "", openings: 1, deadline: "",
    salary: { min: "", max: "", currency: "INR" },
    skills: [], requirements: [],
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSalaryChange = (e) => setForm((f) => ({ ...f, salary: { ...f.salary, [e.target.name]: e.target.value } }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput("");
  };
  const removeSkill = (s) => setForm((f) => ({ ...f, skills: f.skills.filter((sk) => sk !== s) }));

  const addReq = () => {
    const r = reqInput.trim();
    if (r) setForm((f) => ({ ...f, requirements: [...f.requirements, r] }));
    setReqInput("");
  };
  const removeReq = (i) => setForm((f) => ({ ...f, requirements: f.requirements.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await companyAPI.createJob({ ...form, openings: Number(form.openings) });
      setSuccess(true);
      setTimeout(() => setLocation("/company/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job. Please try again.");
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

  if (success) return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-1">Job Posted!</h2>
        <p className="text-muted-foreground text-sm">Redirecting to dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setLocation("/company/dashboard")} className="p-1.5 rounded-lg hover:bg-muted transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold">Post a New Job</h1>
          <p className="text-muted-foreground text-sm">Fill in the details to attract the right candidates</p>
        </div>
      </div>

      {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Job Details</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Job Title <span className="text-destructive">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} required className={inputCls} placeholder="e.g. Senior React Developer" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Job Type</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Experience Required</label>
              <select name="experience" value={form.experience} onChange={handleChange} className={inputCls}>
                {EXPERIENCE_LEVELS.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className={inputCls} placeholder="Bangalore, India / Remote" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Number of Openings</label>
              <input type="number" name="openings" value={form.openings} onChange={handleChange} min={1} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Salary Min (INR/year)</label>
              <input type="number" name="min" value={form.salary.min} onChange={handleSalaryChange} className={inputCls} placeholder="500000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Salary Max (INR/year)</label>
              <input type="number" name="max" value={form.salary.max} onChange={handleSalaryChange} className={inputCls} placeholder="1200000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Application Deadline</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className={inputCls} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Description</h2>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={6}
            className={inputCls + " resize-none"} placeholder="Describe the role, responsibilities, and what a typical day looks like..." />
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Requirements</h2>
          <div className="flex gap-2">
            <input value={reqInput} onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addReq(); } }}
              className={inputCls} placeholder="Add a requirement..." />
            <button type="button" onClick={addReq} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">Add</button>
          </div>
          {form.requirements.length > 0 && (
            <ul className="space-y-1.5">
              {form.requirements.map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
                  <span className="flex-1">{r}</span>
                  <button type="button" onClick={() => removeReq(i)} className="text-muted-foreground hover:text-destructive transition">×</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Required Skills</h2>
          <div className="flex gap-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              className={inputCls} placeholder="e.g. React, Node.js..." />
            <button type="button" onClick={addSkill} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skills.map((s) => (
              <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-destructive">×</button>
              </span>
            ))}
          </div>
        </div>

        <button data-testid="button-post-job" type="submit" disabled={loading}
          className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-60 text-sm">
          {loading ? "Posting Job..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}
