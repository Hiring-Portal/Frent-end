import { useState, useEffect } from "react";
import { subscriptionAPI } from "../../lib/api.js";
import { formatDate, formatCurrency } from "../../lib/utils.js";

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Subscription() {
  const [current, setCurrent] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    subscriptionAPI
      .getPlans()
      .then((res) => {
        const d = res.data?.data || res.data;
        setCurrent(d?.subscription || d?.company || null);
        if (Array.isArray(d?.plans)) {
          setPlans(d.plans);
        } else if (Array.isArray(d)) {
          setPlans(d);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (plan) => {
    setError("");
    setSuccess("");
    const loaded = await loadRazorpay();
    if (!loaded) {
      setError(
        "Payment gateway could not load. Please check your connection and try again.",
      );
      return;
    }
    setPurchasing(plan.id);
    try {
      const res = await subscriptionAPI.createOrder(plan.id);
      const orderData = res.data?.data || res.data;
      const { orderId, amount, currency, key } = orderData;

      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount || plan.price * 100,
        currency: currency || "INR",
        name: "careers.udugiri.com",
        description: `${plan.label} Subscription`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await subscriptionAPI.verify({ ...response, planId: plan.id });
            setSuccess("Payment successful! Your subscription is now active.");
            window.location.reload();
          } catch {
            setError(
              "Payment verified but activation failed. Please contact support.",
            );
          }
        },
        prefill: { name: "", email: "" },
        theme: { color: "#3b82f6" },
        modal: { ondismiss: () => setPurchasing(null) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setPurchasing(null);
      });
      rzp.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to initiate payment. Please try again.",
      );
      setPurchasing(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const isActive =
    current?.subscriptionActive &&
    current?.subscriptionEnd &&
    new Date(current.subscriptionEnd) > new Date();
  const isPopular = (plan) => plan.id === "monthly";
  const isUnlimited = (val) => val === -1;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Unlock candidates, post jobs, and hire talent
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-start gap-2">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
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
          {success}
        </div>
      )}

      {/* Current plan banner */}
      {isActive && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-5 h-5 text-green-600"
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
                <span className="font-semibold text-green-800">
                  Active Plan:{" "}
                  <span className="capitalize">
                    {current.currentPlan?.replace("_", " ")}
                  </span>
                </span>
              </div>
              <p className="text-sm text-green-700">
                Valid until {formatDate(current.subscriptionEnd)}
              </p>
            </div>
            <div className="flex gap-6 text-sm text-green-800">
              <div className="text-center">
                <div className="font-bold text-lg">
                  {isUnlimited(current.candidateUnlockCredits)
                    ? "∞"
                    : current.candidateUnlockCredits -
                      (current.unlocksUsed || 0)}
                </div>
                <div className="text-xs">Unlocks left</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">
                  {isUnlimited(current.hireQuota)
                    ? "∞"
                    : current.hireQuota - (current.hiresUsed || 0)}
                </div>
                <div className="text-xs">Hires left</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">
                  {isUnlimited(current.jobsAllowed)
                    ? "∞"
                    : current.jobsAllowed - (current.jobsUsed || 0)}
                </div>
                <div className="text-xs">Jobs left</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01",
            label: "Post Jobs",
            desc: "List openings visible to students",
          },
          {
            icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7",
            label: "Unlock Profiles",
            desc: "Access full student contact details",
          },
          {
            icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0",
            label: "Hire Talent",
            desc: "Mark candidates as hired",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-card border border-border rounded-xl p-4 text-center"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={item.icon}
                />
              </svg>
            </div>
            <div className="font-semibold text-sm">{item.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const popular = isPopular(plan);
          return (
            <div
              key={plan.id}
              className={`bg-card border-2 rounded-xl p-6 relative flex flex-col ${popular ? "border-primary ring-1 ring-primary shadow-md" : "border-border"}`}
            >
              {popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className="font-bold text-lg">{plan.label}</h3>
                <div className="mt-1">
                  <span className="text-3xl font-black">
                    {plan.priceFormatted}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {plan.validityDays === 30
                      ? "/month"
                      : plan.validityDays === 365
                        ? "/year"
                        : " one-time"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="font-bold text-sm">
                    {isUnlimited(plan.jobsAllowed) ? "∞" : plan.jobsAllowed}
                  </div>
                  <div className="text-xs text-muted-foreground">Jobs</div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="font-bold text-sm">
                    {isUnlimited(plan.unlockCredits) ? "∞" : plan.unlockCredits}
                  </div>
                  <div className="text-xs text-muted-foreground">Unlocks</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">
                    {isUnlimited(plan.hiresAllowed) ? "∞" : plan.hiresAllowed}
                  </div>
                  <div className="text-xs text-muted-foreground">Hires</div>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan)}
                disabled={
                  purchasing === plan.id ||
                  (isActive && current?.currentPlan === plan.id)
                }
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition disabled:opacity-60 ${popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}
              >
                {purchasing === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : isActive && current?.currentPlan === plan.id ? (
                  "Current Plan"
                ) : (
                  "Get Started"
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Secure payments powered by Razorpay · GST included · Cancel anytime
      </p>
    </div>
  );
}
