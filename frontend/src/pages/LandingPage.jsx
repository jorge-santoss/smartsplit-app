import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import heroImg from "../assets/smartsplit-hero-banner.png";
import logoImg from "../assets/SmartSplit-isotipo.png";
import footerLogo from "../assets/SmartSplit-isotipo.png";

export default function LandingPage() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-[#121214] text-white">
      {/* HEADER - Solid Dark Style */}
      <header className="sticky top-0 z-50 bg-[#1C1C1E]/90 backdrop-blur-sm border-b border-[#2C2C2E] shadow-xl shadow-black/20">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img
              src={logoImg}
              alt="SmartSplit"
              className="h-8 sm:h-10 lg:h-12 w-auto"
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[#2DD4BF] font-[Michroma] tracking-tight">
              SmartSplit
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8 text-sm text-[#9CA3AF]">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-white font-medium hover:text-[#2DD4BF] transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              className="hover:text-[#2DD4BF] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#2DD4BF] transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            {token ? (
              <Link
                to="/dashboard"
                className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-[#121214] bg-[#2DD4BF] hover:brightness-110 transition-all shadow-lg shadow-teal-400/25 whitespace-nowrap"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-[#9CA3AF] hover:text-[#2DD4BF] transition-colors whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-[#121214] bg-[#2DD4BF] hover:brightness-110 transition-all shadow-lg shadow-teal-400/25 whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative min-h-[90vh] sm:min-h-[85vh] lg:min-h-[80vh] flex items-center overflow-hidden">
          {/* Full opacity image for maximum visibility */}
          <img
            src={heroImg}
            alt="SmartSplit hero"
            className="absolute inset-0 w-full h-full object-cover object-center bg-linear-to-br from-[#121214] to-[#1C1C1E] opacity-80 z-0"
          />
          {/* Darker, cleaner overlay */}
          <div className="absolute inset-0 bg-[#121214]/30 backdrop-blur-xxs border-y border-[#2C2C2E] shadow-2xl" />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 justify-start">
              <div className="max-w-2xl w-full text-center lg:text-left space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] text-white">
                  What if every shared bill split itself fairly, every time?
                  <br className="hidden sm:block" />
                  <span className="text-[#2DD4BF]">That's SmartSplit.</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-[#ffffff] max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Track expenses, split bills fairly, monitor balances, and
                  settle debts with roommates, couples, or family members.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <Link
                    to={token ? "/dashboard" : "/register"}
                    className="w-full sm:w-auto px-8 py-3 rounded-lg text-base font-medium text-[#121214] bg-[#2DD4BF] hover:brightness-110 transition-all text-center shadow-lg shadow-teal-400/30"
                  >
                    {token ? "Go to Dashboard" : "Get Started Free"}
                  </Link>
                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto px-8 py-3 rounded-lg text-base font-medium text-white bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] transition text-center"
                  >
                    See How It Works
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES - Solid Dark Cards */}
        <section
          id="features"
          className="scroll-mt-14 sm:scroll-mt-16 lg:scroll-mt-18 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-[#2DD4BF] mb-8 sm:mb-10 lg:mb-14">
            Core Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {[
              ["Household Management", "Create households and invite members."],
              [
                "Flexible Expense Splitting",
                "Split expenses equally, by exact amounts, or by percentages.",
              ],
              ["Automatic Balance Tracking", "Always know who owes whom."],
              [
                "Settlement Recording",
                "Record repayments and keep balances accurate.",
              ],
              [
                "Expense Categories",
                "Organize expenses by groceries, rent, utilities, and more.",
              ],
              ["Expense History", "Review all transactions and settlements."],
            ].map(([t, d]) => (
              <div
                key={t}
                className="bg-[#1C1C1E] rounded-xl p-5 sm:p-6 lg:p-8 border border-[#2C2C2E] hover:bg-[#2C2C2E] hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-black/50"
              >
                <h3 className="text-base sm:text-lg font-semibold text-[#2DD4BF] mb-1.5 sm:mb-2">
                  {t}
                </h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="scroll-mt-14 sm:scroll-mt-16 lg:scroll-mt-18 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-[#2DD4BF] mb-8 sm:mb-10 lg:mb-14">
            How SmartSplit Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6">
            {[
              [
                1,
                "Create a Household",
                "Set up your household and invite members.",
              ],
              [
                2,
                "Add Shared Expenses",
                "Record expenses and choose how to split them.",
              ],
              [
                3,
                "Track Balances",
                "See who owes money and who should be reimbursed.",
              ],
              [
                4,
                "Settle Up",
                "Record repayments and keep everything balanced.",
              ],
            ].map(([n, t, d]) => (
              <div
                key={n}
                className="text-center bg-[#1C1C1E] rounded-xl p-6 sm:p-8 border border-[#2C2C2E] hover:bg-[#2C2C2E] transition-all shadow-xl shadow-black/50"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-bold mx-auto mb-3 sm:mb-4 text-[#121214] bg-[#2DD4BF] shadow-lg shadow-teal-400/20">
                  {n}
                </div>
                <h3 className="font-semibold text-white mb-1 sm:mb-1.5 text-sm sm:text-base">
                  {t}
                </h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
            Ready to split smarter?
          </h2>
          <p className="text-sm sm:text-base text-[#9CA3AF] mb-6 sm:mb-8">
            Join thousands of people who already use SmartSplit.
          </p>
          <Link
            to={token ? "/dashboard" : "/register"}
            className="inline-block w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-3.5 rounded-lg text-sm sm:text-base font-medium text-[#121214] bg-[#2DD4BF] hover:brightness-110 transition-all shadow-lg shadow-teal-400/30"
          >
            {token ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </section>
      </main>

      {/* FOOTER - Solid Dark Style */}
      <footer className="bg-[#1C1C1E] border-t border-[#2C2C2E] shadow-xl shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-22">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8">
            {/* Logo + tagline */}
            <div className="sm:col-span-2 lg:col-span-1 flex flex-col items-center lg:items-center">
              <div className="flex justify-center lg:justify-start mb-3">
                <img
                  src={footerLogo}
                  alt="SmartSplit"
                  className="h-20 sm:h-24 lg:h-28 w-auto"
                />
              </div>
              <p className="text-xs sm:text-sm text-white font-extrabold leading-relaxed font-[Michroma] text-center lg:text-left">
                SPLIT SMART,
                <br className="hidden sm:block lg:hidden" />
                <span className="sm:inline"> LIVE EASY</span>
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#2DD4BF] uppercase tracking-wider mb-3 sm:mb-4">
                Product
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-[#9CA3AF] hover:text-[#2DD4BF] transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm text-[#9CA3AF] hover:text-[#2DD4BF] transition"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[#9CA3AF] hover:text-[#2DD4BF] transition"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#2DD4BF] uppercase tracking-wider mb-3 sm:mb-4">
                Company
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-[#9CA3AF] hover:text-[#2DD4BF] transition"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[#9CA3AF] hover:text-[#2DD4BF] transition"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[#9CA3AF] hover:text-[#2DD4BF] transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#2DD4BF] uppercase tracking-wider mb-3 sm:mb-4">
                Legal
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-[#9CA3AF] hover:text-[#2DD4BF] transition"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[#9CA3AF] hover:text-[#2DD4BF] transition"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2C2C2E] my-6 sm:my-8"></div>

          {/* Giant brand name – fully responsive */}
          <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-wider text-[#2DD4BF] text-center py-3 sm:py-4 font-[Michroma]">
            SmartSplit
          </div>

          <div className="border-t border-[#2C2C2E] my-6 sm:my-8"></div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#9CA3AF]/80">
            <p>© {new Date().getFullYear()} SmartSplit. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="hover:text-[#2DD4BF] transition">
                Twitter
              </a>
              <a href="#" className="hover:text-[#2DD4BF] transition">
                Facebook
              </a>
              <a href="#" className="hover:text-[#2DD4BF] transition">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}