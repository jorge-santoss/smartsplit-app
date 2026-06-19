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
    <div className="min-h-screen flex items-center justify-center bg-[#E1EEE8] p-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-[0_8px_24px_-8px_rgba(21,69,53,0.12)] border border-white/80 overflow-hidden flex flex-col lg:flex-row">
        {/* Left - Image (Fills the entire left half) */}
        <div className="lg:w-1/2 bg-[#E1EEE8] flex items-center justify-center overflow-hidden">
          <img 
            src={bannerImg} 
            alt="SmartSplit" 
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-8">
          <div className="w-full max-w-sm">
            <Link 
              to="/" 
              className="text-sm text-[#4A6B5D] hover:text-[#154535] inline-flex items-center gap-1 mb-4 transition-colors"
            >
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-[#154535] mb-1">Create account</h1>
            <p className="text-[#4A6B5D] text-sm mb-5">Start splitting expenses with ease</p>

            {error && (
              <p className="text-[#D94A4A] text-sm text-center mb-4 bg-red-50/80 border border-red-100/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E1EEE8] bg-[#F8FCFA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#154535] focus:border-transparent text-sm text-[#154535] placeholder:text-[#4A6B5D]/60"
                required
              />
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
                className="w-full bg-gradient-to-b from-[#0b1e15] to-[#2e6c46] hover:brightness-110 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-xs text-center text-[#4A6B5D] mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-[#154535] font-medium hover:underline">
                Click here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}