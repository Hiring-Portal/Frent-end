import axios from "axios";

const DEFAULT_BASE = "https://back-end-7ut2.onrender.com";
const envBase = import.meta?.env?.VITE_API_BASE;
// If a VITE_API_BASE exists and points to localhost in production builds,
// prefer the safe DEFAULT_BASE to avoid accidental calls to developer machines.
const BASE = (import.meta?.env?.MODE === "production" && envBase && envBase.includes("localhost"))
  ? DEFAULT_BASE
  : (envBase ?? DEFAULT_BASE);

const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  sendOTP: (email) => api.post("/auth/send-otp", { email }),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  loginWithPassword: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post("/auth/reset-password", { token, password }),
  changePassword: (data) => api.post("/auth/change-password", data),
};

export const studentAPI = {
  getProfile: () => api.get("/students/profile"),
  updateProfile: (data) => api.put("/students/profile", data),
  uploadResume: (formData) =>
    api.post("/students/resume", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  getSavedJobs: () => api.get("/students/saved-jobs"),
  saveJob: (jobId) => api.post(`/students/save-job/${jobId}`),
  unsaveJob: (jobId) => api.delete(`/students/save-job/${jobId}`),
  getRecommendations: () => api.get("/students/recommendations"),
};

export const jobAPI = {
  getAll: (params) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  search: (q) => api.get("/jobs/search", { params: { q } }),
};

export const applicationAPI = {
  apply: (jobId, data) => api.post("/applications", { jobId, ...data }),
  getMy: () => api.get("/applications/my"),
  getById: (id) => api.get(`/applications/${id}`),
  withdraw: (id) => api.delete(`/applications/${id}`),
};

export const companyAPI = {
  getProfile: () => api.get("/companies/profile"),
  updateProfile: (data) => api.put("/companies/profile", data),
createJob: (data) => api.post("/jobs", data),
  getMyJobs: () => api.get("/jobs"),
  updateJob: (id, data) => api.put(`/companies/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/companies/jobs/${id}`),
  getApplicants: (jobId) => api.get(`/companies/jobs/${jobId}/applicants`),
  updateApplicationStatus: (appId, status) =>
    api.patch(`/applications/${appId}/status`, { status }),
  unlockProfile: (studentId) => api.post(`/companies/unlock/${studentId}`),
};

export const subscriptionAPI = {
  getPlans: () => api.get("/subscriptions/plans"),
  getMy: () => api.get("/subscriptions/my"),
 createOrder: (planId) => api.post("/subscriptions/create-order", { planType: planId }),
  verify: (data) => api.post("/subscriptions/verify", data),
};

export const adminAPI = {
  getStats: () => api.get("/admin/dashboard"),
  getStudents: (params) => api.get("/admin/students", { params }),
  getCompanies: (params) => api.get("/admin/companies", { params }),
  getJobs: (params) => api.get("/admin/jobs", { params }),
  getPayments: (params) => api.get("/admin/payments", { params }),
  approveCompany: (id) => api.patch(`/admin/companies/${id}/approve`),
  rejectCompany: (id) => api.patch(`/admin/companies/${id}/reject`),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  bulkImportStudents: (formData) =>
  api.post("/admin/import/students", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
 bulkImportCompanies: (formData) =>
  api.post("/admin/import/companies", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const notificationAPI = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};
