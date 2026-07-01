import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import heroImg from "../assets/Hero-landscape-smartsplit.png";
import logoImg from "../assets/smartsplit_logo.png";
import footerLogo from "../assets/smartsplit_logo.png";

export default function LandingPage() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* HEADER - Glassmorphism Style */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#121212]/80 border-b border-white/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img
              src={logoImg}
              alt="SmartSplit"
              className="h-8 sm:h-10 lg:h-12 w-auto"
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold text-[#FCEA3C] font-[Michroma] tracking-tight">
              SmartSplit
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8 text-sm text-white/70">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-white font-medium hover:text-[#FCEA3C] transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              className="hover:text-[#FCEA3C] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#FCEA3C] transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            {token ? (
              <Link
                to="/dashboard"
                className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-[#121212] bg-[#FCEA3C] hover:brightness-105 transition-all shadow-lg shadow-yellow-500/20 whitespace-nowrap"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-white/70 hover:text-[#FCEA3C] transition-colors whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-[#121212] bg-[#FCEA3C] hover:brightness-105 transition-all shadow-lg shadow-yellow-500/20 whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO - FIXED: Picture now clearly visible, Glassmorphism is lean */}
        <section className="relative min-h-[90vh] sm:min-h-[85vh] lg:min-h-[80vh] flex items-center overflow-hidden">
          {/* Full opacity image for maximum visibility */}
          <img
            src={heroImg}
            alt="SmartSplit hero"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Very soft overlay just to keep text readable */}
          <div className="absolute inset-0 backdrop-blur-xs bg-[#121212]/40 border-y border-white/10 shadow-2xl" />

          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="max-w-4xl mx-auto text-center">
  {/* Streamlined glass box - fully centered on all screen sizes */}
  <div className="max-w-2xl mx-auto text-center p-5 sm:p-6 lg:p-8">
    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.2] sm:leading-[1.15] drop-shadow-lg">
      What if every shared bill split itself fairly, every time?
      <br className="hidden sm:block" />
      <span className="text-[#FCEA3C]">That's SmartSplit.</span>
    </h1>

    <p className="mt-3 sm:mt-4 md:mt-5 text-sm sm:text-base md:text-lg lg:text-xl text-gray-100/95 drop-shadow-md max-w-xl mx-auto">
      Track expenses, split bills fairly, monitor balances, and
      settle debts with roommates, couples, or family members.
    </p>

    <div className="mt-5 sm:mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 md:gap-4 justify-center">
      <Link
        to={token ? "/dashboard" : "/register"}
        className="w-full sm:w-auto px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium text-[#121212] bg-[#FCEA3C] hover:brightness-105 transition-all text-center shadow-lg shadow-yellow-500/30"
      >
        {token ? "Go to Dashboard" : "Get Started Free"}
      </Link>
      <a
        href="#how-it-works"
        className="w-full sm:w-auto px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium text-white bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/20 transition text-center"
      >
        See How It Works
      </a>
    </div>
  </div>
</div>
          </div>
        </section>

        {/* FEATURES - Glassmorphism Cards */}
        <section
          id="features"
          className="scroll-mt-14 sm:scroll-mt-16 lg:scroll-mt-18 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-[#FCEA3C] mb-8 sm:mb-10 lg:mb-14">
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
                className="backdrop-blur-xl bg-white/5 rounded-xl p-5 sm:p-6 lg:p-8 border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 shadow-lg"
              >
                <h3 className="text-base sm:text-lg font-semibold text-[#FCEA3C] mb-1.5 sm:mb-2">
                  {t}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="scroll-mt-14 sm:scroll-mt-16 lg:scroll-mt-18 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-[#FCEA3C] mb-8 sm:mb-10 lg:mb-14">
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
                className="text-center backdrop-blur-md bg-white/5 rounded-xl p-6 sm:p-8 border border-white/10 hover:bg-white/10 transition-all shadow-lg"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center text-lg sm:text-xl lg:text-2xl font-bold mx-auto mb-3 sm:mb-4 text-[#121212] bg-[#FCEA3C] shadow-lg shadow-yellow-500/20">
                  {n}
                </div>
                <h3 className="font-semibold text-white mb-1 sm:mb-1.5 text-sm sm:text-base">
                  {t}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
            Ready to split smarter?
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">
            Join thousands of people who already use SmartSplit.
          </p>
          <Link
            to={token ? "/dashboard" : "/register"}
            className="inline-block w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-2.5 sm:py-3 lg:py-3.5 rounded-lg text-sm sm:text-base font-medium text-[#121212] bg-[#FCEA3C] hover:brightness-105 transition-all shadow-lg shadow-yellow-500/30"
          >
            {token ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </section>
      </main>

      {/* FOOTER - Glassmorphism */}
      <footer className="backdrop-blur-xl bg-white/5 border-t border-white/10">
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
              <h4 className="text-xs sm:text-sm font-semibold text-[#FCEA3C] uppercase tracking-wider mb-3 sm:mb-4">
                Product
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-gray-400 hover:text-[#FCEA3C] transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm text-gray-400 hover:text-[#FCEA3C] transition"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-[#FCEA3C] transition"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#FCEA3C] uppercase tracking-wider mb-3 sm:mb-4">
                Company
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-[#FCEA3C] transition"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-[#FCEA3C] transition"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-[#FCEA3C] transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#FCEA3C] uppercase tracking-wider mb-3 sm:mb-4">
                Legal
              </h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-[#FCEA3C] transition"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-[#FCEA3C] transition"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 my-6 sm:my-8"></div>

          {/* Giant brand name – fully responsive */}
          <div className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-wider text-[#FCEA3C] text-center py-3 sm:py-4 font-[Michroma]">
            SmartSplit
          </div>

          <div className="border-t border-white/10 my-6 sm:my-8"></div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400/80">
            <p>© {new Date().getFullYear()} SmartSplit. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="hover:text-[#FCEA3C] transition">
                Twitter
              </a>
              <a href="#" className="hover:text-[#FCEA3C] transition">
                Facebook
              </a>
              <a href="#" className="hover:text-[#FCEA3C] transition">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
