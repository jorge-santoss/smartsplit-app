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
    <div className="min-h-screen flex items-center justify-center bg-[#121214] p-4">
      {/* Solid Dark Card */}
      <div className="w-full max-w-5xl bg-[#1C1C1E] border border-[#2C2C2E] shadow-xl shadow-black/50 overflow-hidden flex flex-col lg:flex-row rounded-2xl">
        
        {/* Left - Image */}
        <div className="lg:w-1/2 relative overflow-hidden flex items-center justify-center min-h-[200px] lg:min-h-full">
          <img
            src={bannerImg}
            alt="SmartSplit"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay to keep the image from overpowering the look */}
          <div className="absolute inset-0" />
        </div>

        {/* Right - Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 md:p-12 relative z-10">
          <div className="w-full max-w-sm">
            <Link
              to="/"
              className="text-sm text-[#9CA3AF] hover:text-[#2DD4BF] inline-flex items-center gap-1 mb-4 transition-colors"
            >
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-[#9CA3AF] text-sm mb-6">
               Sign in to manage your shared expenses.
            </p>

            {error && (
              <p className="text-[#FB7185] text-sm text-center mb-4 bg-[#FB7185]/10 border border-[#FB7185]/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#2C2C2E] bg-[#121214] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent text-sm text-white placeholder:text-[#6B7280] transition-all"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#2C2C2E] bg-[#121214] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] focus:border-transparent text-sm text-white placeholder:text-[#6B7280] transition-all"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2DD4BF] text-[#121214] py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-teal-400/25 hover:brightness-110"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-xs text-center text-[#9CA3AF] mt-5">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#2DD4BF] font-medium hover:underline"
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