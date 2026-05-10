import { useState } from "react";
import { useLocation } from "wouter";
import { authAPI } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";

const Logo = () => (
  <div className="text-center mb-8">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
      <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
    <h1 className="text-2xl font-bold text-foreground">careers.udugiri.com</h1>
    <p className="text-muted-foreground mt-1 text-sm">Your gateway to great opportunities</p>
  </div>
);

function OtpLoginForm() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await authAPI.sendOTP(email);
      sessionStorage.setItem("otp_email", email);
      setLocation("/verify-otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please check your email.");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1.5">Email address</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-60 text-sm">
        {loading ? "Sending OTP..." : "Send OTP →"}
      </button>
      <p className="text-xs text-center text-muted-foreground">We'll send a 6-digit code to your email</p>
    </form>
  );
}

function PasswordLoginForm() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await authAPI.loginWithPassword(form.email, form.password);
      const { accessToken, user } = res.data?.data || res.data;
      login(accessToken, user);
      setLocation(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1.5">Email address</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm" />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-medium">Password</label>
          <button type="button" onClick={() => setLocation("/forgot-password")}
            className="text-xs text-primary hover:underline">Forgot password?</button>
        </div>
        <div className="relative">
          <input type={showPass ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required
            placeholder="Enter your password"
            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
            {showPass
              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            }
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-60 text-sm">
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState("otp");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Logo />

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-border">
            <button onClick={() => setMode("otp")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all ${mode === "otp" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
              Login with OTP
            </button>
            <button onClick={() => setMode("password")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-all ${mode === "password" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}>
              Login with Password
            </button>
          </div>

          <div className="p-8">
            <h2 className="text-lg font-semibold mb-1">
              {mode === "otp" ? "OTP Login" : "Password Login"}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {mode === "otp" ? "Enter your email to receive a one-time code" : "Sign in with your email and password"}
            </p>

            {mode === "otp" ? <OtpLoginForm /> : <PasswordLoginForm />}

            <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => setLocation("/register")} className="text-primary font-medium hover:underline">
                Create an account
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Admin: admin@udugiri.com · Both login methods supported
        </p>
      </div>
    </div>
  );
}
