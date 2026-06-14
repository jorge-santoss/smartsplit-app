import { Link } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import heroImg from '../assets/smartsplit-landscape-banner.png';

export default function LandingPage() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F7F8]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#3FE0C5' }}>S</div>
            <span className="text-xl font-bold text-gray-900">SmartSplit</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <span className="text-gray-900 font-medium">Home</span>
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900">How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            {token ? (
              <Link to="/dashboard" className="px-5 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#3FE0C5' }}>Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log In</Link>
                <Link to="/register" className="px-5 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#3FE0C5' }}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">Manage Shared Household Expenses Without the Headaches</h1>
            <p className="mt-4 text-lg text-gray-500 max-w-xl">Track expenses, split bills fairly, monitor balances, and settle debts with roommates, couples, or family members.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to={token ? "/dashboard" : "/register"} className="px-8 py-3 rounded-lg text-base font-medium text-white shadow-lg" style={{ backgroundColor: '#3FE0C5' }}>
                {token ? "Go to Dashboard" : "Get Started Free"}
              </Link>
              <a href="#how-it-works" className="px-8 py-3 rounded-lg text-base font-medium text-gray-700 bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80">
                See How It Works
              </a>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <img src={heroImg} alt="SmartSplit preview" className="w-full rounded-2xl shadow-xl" />
          </div>
        </section>

        {/* Dashboard Preview Card */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="backdrop-blur-xl bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Apartment 4A</h3>
              <div className="flex gap-2">
                {['Sarah','Alex','John'].map(m => (
                  <span key={m} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: '#3FE0C5' }}>{m[0]}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[['Sarah','+$120','text-green-600'],['Alex','-$70','text-red-500'],['John','-$50','text-red-500']].map(([n,b,c]) => (
                <div key={n} className="text-center">
                  <p className="text-sm text-gray-500">{n}</p>
                  <p className={`text-lg font-bold ${c}`}>{b}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[['Rent','$1,200','Sarah','Equal'],['Groceries','$150','Alex','Percentage'],['Internet','$60','John','Exact']].map(([t,a,p,s]) => (
                <div key={t} className="flex items-center justify-between py-2 border-b border-white/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t}</p>
                    <p className="text-xs text-gray-400">Paid by {p} · {s}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">${a}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Core Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              ['Household Management','Create households and invite members.'],
              ['Flexible Expense Splitting','Split expenses equally, by exact amounts, or by percentages.'],
              ['Automatic Balance Tracking','Always know who owes whom.'],
              ['Settlement Recording','Record repayments and keep balances accurate.'],
              ['Expense Categories','Organize expenses by groceries, rent, utilities, and more.'],
              ['Expense History','Review all transactions and settlements.'],
            ].map(([t,d]) => (
              <div key={t} className="backdrop-blur-xl bg-white/40 rounded-2xl p-8 shadow-lg border border-white/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t}</h3>
                <p className="text-sm text-gray-500">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How SmartSplit Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              [1,'Create a Household','Set up your household and invite members.'],
              [2,'Add Shared Expenses','Record expenses and choose how to split them.'],
              [3,'Track Balances','See who owes money and who should be reimbursed.'],
              [4,'Settle Up','Record repayments and keep everything balanced.'],
            ].map(([n,t,d]) => (
              <div key={n} className="text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white shadow-lg" style={{ backgroundColor: '#3FE0C5' }}>{n}</div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{t}</h3>
                <p className="text-sm text-gray-500">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to split smarter?</h2>
          <Link to={token ? "/dashboard" : "/register"} className="inline-block mt-6 px-8 py-3 rounded-lg text-base font-medium text-white shadow-lg" style={{ backgroundColor: '#3FE0C5' }}>
            {token ? "Go to Dashboard" : "Get Started Free"}
          </Link>
        </section>
      </main>

      <footer className="backdrop-blur-xl bg-white/40 border-t border-white/30 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {[
              ['Product',['Features','How It Works','Pricing']],
              ['Company',['About Us','Careers','Contact']],
              ['Legal',['Terms','Privacy Policy']],
              ['Social',['Twitter','Facebook','Instagram']],
            ].map(([t,links]) => (
              <div key={t}>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">{t}</h4>
                <ul className="space-y-2">
                  {links.map(l => <li key={l} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/30 pt-6 text-center text-sm text-gray-400">© 2024 SmartSplit. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}