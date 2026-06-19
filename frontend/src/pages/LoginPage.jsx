import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import bannerImg from "../assets/smartsplit-landscape-banner.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E1EEE8] p-4">
      {/* Single compact card */}
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-[0_8px_24px_-8px_rgba(21,69,53,0.12)] border border-white/80 overflow-hidden flex flex-col lg:flex-row">
        {/* Left - Image (Fills the entire left half with the image) */}
        <div className="lg:w-1/2 bg-[#E1EEE8] flex items-center justify-center overflow-hidden">
          <img
            src={bannerImg}
            alt="SmartSplit"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right - Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-sm">
            <Link
              to="/"
              className="text-sm text-[#4A6B5D] hover:text-[#154535] inline-flex items-center gap-1 mb-4 transition-colors"
            >
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-[#154535] mb-1">Welcome back</h1>
            <p className="text-[#4A6B5D] text-sm mb-6">
               Sign in to manage your shared expenses.
            </p>

            {error && (
              <p className="text-[#D94A4A] text-sm text-center mb-4 bg-red-50/80 border border-red-100/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E1EEE8] bg-[#F8FCFA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154535] focus:border-transparent text-sm text-[#154535] placeholder:text-[#4A6B5D]/60"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E1EEE8] bg-[#F8FCFA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154535] focus:border-transparent text-sm text-[#154535] placeholder:text-[#4A6B5D]/60"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#154535] text-white py-2.5 rounded-lg font-medium hover:bg-[#1b5c48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-xs text-center text-[#4A6B5D] mt-5">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#154535] font-medium hover:underline"
              >
                Click here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}