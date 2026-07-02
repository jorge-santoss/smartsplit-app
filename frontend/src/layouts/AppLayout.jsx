import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router";
import logoImg from "../assets/SmartSplit-isotipo.png";
import Avatar from "../components/Avatar";
import { Settings } from "lucide-react";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#121214]">
      {/* 
        Updated Navigation:
        - Softer, cleaner background matching the minimal flat UI aesthetic of the reference.
        - Highlights use the new Teal (#2DD4BF) and Coral (#FB7185) palette.
      */}
      <nav className="sticky top-0 z-50 bg-[#1C1C1E]/90 backdrop-blur-sm border-b border-[#2C2C2E] shadow-xl shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center text-xl font-bold text-[#2DD4BF]">
            <img src={logoImg} alt="SmartSplit" className="h-8 w-auto inline-block mr-2" />
            SmartSplit
          </Link>
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="sm" className="bg-[#2C2C2E] text-[#2DD4BF]" />
            <span className="text-sm font-medium text-[#9CA3AF]">{user?.name}</span>
            {pathname !== '/dashboard' && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-[#9CA3AF] hover:text-[#2DD4BF] transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/settings"
              className={`text-sm font-medium transition-colors ${pathname === '/settings' ? 'text-[#2DD4BF]' : 'text-[#9CA3AF] hover:text-[#2DD4BF]'}`}
            >
              <Settings className="w-5 h-5" title="Settings" />
            </Link>
            <button
              onClick={logout}
              className="text-sm font-medium text-[#FB7185] hover:text-[#F43F5E] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}