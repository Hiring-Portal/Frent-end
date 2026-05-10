import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { jobAPI, applicationAPI, studentAPI } from "../../lib/api.js";
import { formatDate, formatCurrency } from "../../lib/utils.js";

export default function JobDetail({ id }) {
  const [, setLocation] = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    jobAPI.getById(id)
      .then((res) => setJob(res.data?.job || res.data?.data || res.data))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true); setError("");
    try {
      await applicationAPI.apply(id, { coverLetter });
      setApplied(true); setSuccess("Application submitted successfully!");
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    setSavingJob(true);
    try {
      if (saved) { await studentAPI.unsaveJob(id); setSaved(false); }
      else { await studentAPI.saveJob(id); setSaved(true); }
    } catch { /* ignore */ }
    finally { setSavingJob(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!job) return (
    <div className="p-6 text-center">
      <div className="text-muted-foreground">Job not found</div>
      <button onClick={() => setLocation("/student/jobs")} className="mt-3 text-primary text-sm hover:underline">Back to jobs</button>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => setLocation("/student/jobs")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to jobs
      </button>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-xl">{job.company?.name?.[0] || "C"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold">{job.title}</h1>
                <p className="text-muted-foreground">{job.company?.name || "Company"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-5">
              {job.location && <span className="flex items-center gap-1 text-sm text-muted-foreground"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>{job.location}</span>}
              {job.type && <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{job.type}</span>}
              {job.experience && <span className="text-sm text-muted-foreground">{job.experience}</span>}
              {job.salary && <span className="flex items-center gap-1 text-sm text-green-700 font-medium">
                {typeof job.salary === "object" ? `${formatCurrency(job.salary.min)} – ${formatCurrency(job.salary.max)}` : job.salary}
              </span>}
            </div>
            <div className="prose prose-sm max-w-none text-foreground">
              <div dangerouslySetInnerHTML={{ __html: job.description?.replace(/\n/g, "<br>") || job.description }} />
            </div>
          </div>

          {job.requirements?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-3">Requirements</h2>
              <ul className="space-y-1.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {job.skills?.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            {applied ? (
              <div className="w-full py-2.5 bg-green-50 text-green-700 border border-green-200 font-semibold rounded-lg text-sm text-center">
                Applied Successfully
              </div>
            ) : (
              <button data-testid="button-apply" onClick={() => setShowModal(true)}
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition text-sm">
                Apply Now
              </button>
            )}
            <button onClick={handleSave} disabled={savingJob}
              className={`w-full py-2.5 border font-semibold rounded-lg text-sm transition ${saved ? "border-primary text-primary bg-primary/5" : "border-border text-foreground hover:border-primary/50"}`}>
              {saved ? "Saved" : "Save Job"}
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-sm">Job Details</h3>
            <div className="space-y-2 text-sm">
              {job.type && <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{job.type}</span></div>}
              {job.experience && <div className="flex justify-between"><span className="text-muted-foreground">Experience</span><span className="font-medium">{job.experience}</span></div>}
              {job.openings && <div className="flex justify-between"><span className="text-muted-foreground">Openings</span><span className="font-medium">{job.openings}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Posted</span><span className="font-medium">{formatDate(job.createdAt)}</span></div>
              {job.deadline && <div className="flex justify-between"><span className="text-muted-foreground">Deadline</span><span className="font-medium text-orange-600">{formatDate(job.deadline)}</span></div>}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-bold mb-1">Apply for {job.title}</h2>
            <p className="text-muted-foreground text-sm mb-4">{job.company?.name}</p>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Cover Letter <span className="text-muted-foreground">(optional)</span></label>
                <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5} placeholder="Tell the employer why you're a great fit..."
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none" />
              </div>
              {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition">
                  Cancel
                </button>
                <button type="submit" disabled={applying}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
