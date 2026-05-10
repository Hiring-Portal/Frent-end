import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { authAPI } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef([]);
  const email = sessionStorage.getItem("otp_email") || "";

  useEffect(() => {
    if (!email) { setLocation("/login"); return; }
    refs.current[0]?.focus();
    const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      refs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the 6-digit OTP"); return; }
    setError(""); setLoading(true);
    try {
      const res = await authAPI.verifyOTP(email, code);
      const payload = res.data?.data || res.data;
      const { accessToken, user } = payload;
      login(accessToken, user);
      sessionStorage.removeItem("otp_email");
      setLocation(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.sendOTP(email);
      setCountdown(60);
      setError("");
    } catch { setError("Failed to resend OTP"); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  maxLength={1}
                  className="w-12 h-12 text-center text-xl font-bold border-2 rounded-xl bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-60 text-sm">
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {countdown > 0 ? (
              <span>Resend OTP in <span className="font-semibold text-foreground">{countdown}s</span></span>
            ) : (
              <button onClick={handleResend} disabled={resending}
                className="text-primary font-medium hover:underline disabled:opacity-60">
                {resending ? "Resending..." : "Resend OTP"}
              </button>
            )}
          </div>

          <button onClick={() => setLocation("/login")}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
