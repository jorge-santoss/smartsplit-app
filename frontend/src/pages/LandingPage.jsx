import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import heroImg from "../assets/Hero-landscape-smartsplit.png";
import logoImg from "../assets/SmartSplit-isotipo.png";
import footerLogo from "../assets/SmartSplit-isotipo.png";

export default function LandingPage() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F7F8]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="SmartSplit" className="h-12 w-auto" />
            <span className="text-2xl font-bold text-teal-500 font-[Michroma]">
              SmartSplit
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-gray-900 font-medium hover:text-gray-900"
            >
              Home
            </a>
            <a href="#features" className="hover:text-gray-900">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-gray-900">
              How It Works
            </a>
          </div>
          <div className="flex items-center gap-3">
            {token ? (
              <Link
                to="/dashboard"
                className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-teal-500"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-teal-500"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <div className="relative w-full aspect-[2.35/1]">
          <img
            src={heroImg}
            alt="SmartSplit hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6">
            <div className="max-w-6xl mx-auto w-full">
              <div className="max-w-2xl text-center lg:text-left">
                <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight drop-shadow-md">
                  What if every shared bill split itself fairly, every time?
                  That’s SmartSplit.
                </h1>
                <p className="mt-4 text-lg text-gray-100 drop-shadow">
                  Track expenses, split bills fairly, monitor balances, and
                  settle debts with roommates, couples, or family members.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link
                    to={token ? "/dashboard" : "/register"}
                    className="px-8 py-3 rounded-lg text-base font-medium text-white shadow-lg bg-teal-500 hover:bg-teal-600 transition"
                  >
                    {token ? "Go to Dashboard" : "Get Started Free"}
                  </Link>
                  <a
                    href="#how-it-works"
                    className="px-8 py-3 rounded-lg text-base font-medium text-white bg-white/20 backdrop-blur-sm border border-white/40 hover:bg-white/30 transition"
                  >
                    See How It Works
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <section
          id="features"
          className="scroll-mt-18 max-w-6xl mx-auto px-4 sm:px-6 py-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Core Features
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="backdrop-blur-xl bg-white/40 rounded-2xl p-8 shadow-lg border border-white/50"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t}
                </h3>
                <p className="text-sm text-gray-500">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 max-w-4xl mx-auto px-4 sm:px-6 py-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How SmartSplit Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div key={n} className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white shadow-lg bg-teal-500">
                  {n}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{t}</h3>
                <p className="text-sm text-gray-500">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Ready to split smarter?
          </h2>
          <Link
            to={token ? "/dashboard" : "/register"}
            className="inline-block mt-6 px-8 py-3 rounded-lg text-base font-medium text-white shadow-lg bg-teal-500 hover:bg-teal-600 transition"
          >
            {token ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and description column */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex justify-center mb-4">
                <img
                  src={footerLogo}
                  alt="SmartSplit"
                  className="h-36 w-auto"
                />
              </div>
              <p className="text-sm text-teal-500 font-extrabold leading-relaxed font-[Michroma] text-center">
                SPLIT SMART, LIVE EASY
              </p>
            </div>

            {/* Links columns */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-gray-500 hover:text-teal-600 transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm text-gray-500 hover:text-teal-600 transition"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-teal-600 transition"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          <div className="text-8xl sm:text-9xl font-black tracking-wider text-teal-500 text-center py-5 font-[Michroma]">
            SmartSplit
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Copyright row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {new Date().getFullYear()} SmartSplit. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-teal-600 transition">
                Twitter
              </a>
              <a href="#" className="hover:text-teal-600 transition">
                Facebook
              </a>
              <a href="#" className="hover:text-teal-600 transition">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
