import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import bannerImg from "../assets/smartsplit-landscape-banner.png";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-6xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row rounded-2xl">
        
        {/* Left - Image (Blended with dark glass effect) */}
        <div className="lg:w-1/2 relative overflow-hidden flex items-center justify-center min-h-[200px] lg:min-h-full">
          <img 
            src={bannerImg} 
            alt="SmartSplit" 
            className="w-full h-full object-cover mix-blend-overlay" 
          />
          <div className="absolute inset-0" />
        </div>

        {/* Right - Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8 md:p-12 relative z-10">
          <div className="w-full max-w-sm">
            <Link 
              to="/" 
              className="text-sm text-gray-400 hover:text-[#FCEA3C] inline-flex items-center gap-1 mb-4 transition-colors"
            >
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
            <p className="text-gray-400 text-sm mb-5">Start splitting expenses with ease</p>

            {error && (
              <p className="text-[#FF6B6B] text-sm text-center mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-white/10 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCEA3C] focus:border-transparent text-sm text-white placeholder:text-gray-500 transition-all"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-white/10 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCEA3C] focus:border-transparent text-sm text-white placeholder:text-gray-500 transition-all"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-white/10 bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FCEA3C] focus:border-transparent text-sm text-white placeholder:text-gray-500 transition-all"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FCEA3C] text-[#121212] py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-yellow-500/20 hover:brightness-105"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-xs text-center text-gray-400 mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-[#FCEA3C] font-medium hover:underline">
                Click here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}