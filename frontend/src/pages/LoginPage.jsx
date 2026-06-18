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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F8] p-4">
      {/* Single compact card */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col lg:flex-row">
        {/* Left - Image (smaller padding) */}
        <div className="lg:w-1/2 bg-linear-to-br from-[#F8FAFE] to-[#F0F3F8] flex items-center justify-center">
          <img
            src={bannerImg}
            alt="SmartSplit"
            className="w-full max-w-full md:max-w-full h-auto object-contain"
          />
        </div>

        {/* Right - Form (reduced vertical spacing) */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-sm">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-4"
            >
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-[#0b1c30] mb-1">Welcome back</h1>
            <p className="text-[#434655] text-sm mb-5">
               Sign in to manage your shared expenses.
            </p>

            {error && (
              <p className="text-red-500 text-sm text-center mb-3 bg-red-50 rounded-lg px-3 py-1.5">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#c3c6d7] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#c3c6d7] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity text-sm"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-xs text-center text-gray-500 mt-5">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-teal-500 font-medium hover:underline"
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