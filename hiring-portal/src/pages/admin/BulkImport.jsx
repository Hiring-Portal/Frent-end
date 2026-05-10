import { useState, useRef } from "react";
import { adminAPI } from "../../lib/api.js";

const TABS = ["students", "companies"];

export default function BulkImport() {
  const [activeTab, setActiveTab] = useState("students");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) { setError("Please select a file"); return; }
    setUploading(true); setError(""); setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = activeTab === "students"
        ? await adminAPI.bulkImportStudents(formData)
        : await adminAPI.bulkImportCompanies(formData);
      setResult(res.data);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err.response?.data?.message || "Import failed. Please check your file format.");
    } finally { setUploading(false); }
  };

  const SAMPLE_FIELDS = {
    students: ["name", "email", "phone", "skills (comma-separated)", "location", "degree", "institution"],
    companies: ["name", "email", "phone", "website", "industry", "location", "size"],
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Bulk Import</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Import multiple students or companies via Excel/CSV file</p>
      </div>

      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setFile(null); setResult(null); setError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${activeTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            Import {tab}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <h2 className="font-semibold mb-1">File Requirements</h2>
          <p className="text-sm text-muted-foreground">Supported formats: <span className="font-medium">.xlsx, .csv</span></p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Required columns for {activeTab}:</p>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_FIELDS[activeTab].map((field) => (
              <span key={field} className="text-xs px-2.5 py-1 bg-card border border-border rounded-full text-foreground">{field}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold">Upload File</h2>

        <div
          onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}>
          <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" onChange={handleFile} className="hidden" />
          {file ? (
            <div>
              <svg className="w-10 h-10 text-primary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="mt-3 text-xs text-muted-foreground hover:text-destructive transition">Remove</button>
            </div>
          ) : (
            <div>
              <svg className="w-10 h-10 text-muted-foreground mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="font-medium">Click or drag & drop your file here</p>
              <p className="text-sm text-muted-foreground mt-1">Supports .xlsx, .csv files</p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-green-800">Import Successful</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <div>Imported: <span className="font-medium">{result.imported || result.success || 0} records</span></div>
              {result.failed > 0 && <div className="text-yellow-700">Failed: <span className="font-medium">{result.failed} records</span></div>}
              {result.errors?.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-yellow-800">Errors:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-yellow-700">
                    {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <button data-testid="button-import" onClick={handleUpload} disabled={!file || uploading}
          className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-60 text-sm flex items-center justify-center gap-2">
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
