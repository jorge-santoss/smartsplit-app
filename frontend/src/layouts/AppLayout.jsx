import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router";
import logoImg from "../assets/SmartSplit-isotipo.png";
import Avatar from "../components/Avatar";
import { useState } from "react";
import { Settings, Menu, X, LogOut } from "lucide-react";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#121214]">
      <nav className="sticky top-0 z-50 bg-[#1C1C1E]/90 backdrop-blur-sm border-b border-[#2C2C2E]">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-lg sm:text-xl font-bold text-[#2DD4BF] shrink-0">
            <img src={logoImg} alt="SmartSplit" className="h-7 sm:h-8 w-auto inline-block mr-1 sm:mr-2" />
            SmartSplit
          </Link>
          <div className="flex items-center gap-1 sm:gap-4">
            <Avatar name={user?.name} size="small" className="bg-[#2C2C2E] text-[#2DD4BF]" />
            <span className="hidden sm:inline text-sm font-medium text-[#9CA3AF] truncate max-w-[100px]">{user?.name}</span>
            {pathname !== "/dashboard" && (
              <Link to="/dashboard" className="hidden sm:inline text-sm font-medium text-[#9CA3AF] hover:text-[#2DD4BF] transition-colors">Dashboard</Link>
            )}
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/settings" className={`text-sm font-medium transition-colors ${pathname === "/settings" ? "text-[#2DD4BF]" : "text-[#9CA3AF] hover:text-[#2DD4BF]"}`}>
                <Settings className="w-5 h-5" title="Settings" />
              </Link>
              <button onClick={logout} className="text-sm font-medium text-[#FB7185] hover:text-[#F43F5E] transition-colors">Logout</button>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden p-1 text-[#9CA3AF] hover:text-[#2DD4BF] transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden absolute right-2 mt-1 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg shadow-xl py-1 z-50">
            <Link to="/settings" onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${pathname === "/settings" ? "text-[#2DD4BF] bg-[#2DD4BF]/10" : "text-[#9CA3AF] hover:text-[#2DD4BF] hover:bg-[#2DD4BF]/5"}`}>
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <hr className="border-[#2C2C2E]" />
            <button onClick={() => { logout(); setMenuOpen(false); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#FB7185] hover:bg-[#FB7185]/5 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
