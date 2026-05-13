import { useState, useRef } from "react";
import { adminAPI } from "../../lib/api.js";
import { toast } from "sonner";

const TABS = ["students", "companies"];

export default function BulkImport() {
  const [activeTab, setActiveTab] = useState("students");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const fileRef = useRef(null);

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const droppedFile = e.dataTransfer.files[0];

    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("import", file);

      const res =
        activeTab === "students"
          ? await adminAPI.bulkImportStudents(formData)
          : await adminAPI.bulkImportCompanies(formData);

      const responseData = res.data;

      setResult(responseData);

      const errors = responseData.data?.errors || [];
      const errorCount = errors.length;

      if (!responseData.success || errorCount > 0) {
        const firstReason =
          errors[0]?.reason ||
          responseData.message ||
          "Import failed";

        toast.error(
          `${responseData.message} (${errorCount} errors) - ${firstReason}`
        );
      } else {
        toast.success(
          responseData.message || "Import completed successfully!"
        );
      }
    } catch (err) {
      const responseData = err?.response?.data;

      if (responseData) {
        setResult(responseData);

        const errors = responseData.data?.errors || [];
        const errorCount = errors.length;

        const firstReason =
          errors[0]?.reason ||
          responseData.message ||
          "Import failed";

        toast.error(
          `${responseData.message} (${errorCount} errors) - ${firstReason}`
        );
      } else {
        const errorMsg = "Import failed. Please try again.";

        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setUploading(false);
    }
  };

  const SAMPLE_FIELDS = {
    students: [
      "name",
      "email",
      "phone",
      "skills",
      "location",
      "degree",
      "institution",
    ],
    companies: [
      "companyName",
      "email",
      "phone",
      "website",
      "industry",
      "location",
      "hrName",
    ],
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bulk Import</h1>

        <p className="text-muted-foreground mt-1">
          Import multiple records at once using Excel or CSV
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setFile(null);
              setResult(null);
              setError("");

              if (fileRef.current) {
                fileRef.current.value = "";
              }
            }}
            className={`px-8 py-2.5 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-card shadow-sm border border-border text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Import {tab}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-8">
        {/* File Requirements */}
        <div>
          <h2 className="font-semibold text-lg mb-3">
            File Requirements
          </h2>

          <div className="bg-muted/60 rounded-xl p-5">
            <p className="text-sm font-medium mb-3">
              Required columns for {activeTab}:
            </p>

            <div className="flex flex-wrap gap-2">
              {SAMPLE_FIELDS[activeTab].map((field, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 bg-background border rounded-full"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div>
          <h2 className="font-semibold text-lg mb-3">
            Upload File
          </h2>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all min-h-[260px] flex flex-col items-center justify-center ${
              file
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary hover:bg-muted/50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.csv,.xls"
              onChange={handleFile}
              className="hidden"
            />

            {file ? (
              <div className="space-y-4 text-center">
                <svg
                  className="w-14 h-14 text-primary mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <p className="font-medium text-lg break-all">
                  {file.name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setFile(null);

                    if (fileRef.current) {
                      fileRef.current.value = "";
                    }
                  }}
                  className="text-destructive hover:underline text-sm"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div>
                <svg
                  className="w-14 h-14 text-muted-foreground mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>

                <p className="font-medium text-lg">
                  Click or drag & drop your file here
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                  .xlsx or .csv supported
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div
            className={`p-6 rounded-2xl border ${
              result.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <svg
                className={`w-6 h-6 ${
                  result.success
                    ? "text-green-600"
                    : "text-red-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <span
                className={`font-semibold text-lg ${
                  result.success
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {result.success
                  ? "Import Completed"
                  : "Import Failed"}
              </span>
            </div>

            {/* API Message */}
            <p
              className={`text-sm mb-6 ${
                result.success
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {result.message}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border text-center">
                <p className="text-sm text-muted-foreground">
                  Created
                </p>

                <p className="text-3xl font-bold text-green-600">
                  {result.data?.created || 0}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border text-center">
                <p className="text-sm text-muted-foreground">
                  Skipped
                </p>

                <p className="text-3xl font-bold text-yellow-600">
                  {result.data?.skipped || 0}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border text-center">
                <p className="text-sm text-muted-foreground">
                  Errors
                </p>

                <p className="text-3xl font-bold text-red-600">
                  {result.data?.errors?.length || 0}
                </p>
              </div>
            </div>

            {/* Error List */}
            {result.data?.errors?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-red-700 mb-3">
                  Import Errors ({result.data.errors.length})
                </h3>

                <div className="space-y-4 max-h-96 overflow-auto">
                  {result.data.errors.map((err, i) => (
                    <div
                      key={i}
                      className="bg-white border border-red-100 rounded-lg p-4"
                    >
                      <p className="font-medium text-red-700 mb-2">
                        • {err.reason}
                      </p>

                      <pre className="text-xs bg-red-50 p-3 rounded overflow-auto text-red-800">
                        {JSON.stringify(err.row, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-primary-foreground font-semibold rounded-xl flex items-center justify-center gap-2 text-base transition"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

              Importing {activeTab}...
            </>
          ) : (
            `Import ${
              activeTab === "students"
                ? "Students"
                : "Companies"
            }`
          )}
        </button>
      </div>
    </div>
  );
}