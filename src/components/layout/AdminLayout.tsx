import { createContext, useContext, useMemo, useState, useEffect, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  ImageIcon,
  Globe,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { AdminLanguageProvider, useAdminLanguage, SUPPORTED_EDIT_LANGUAGES, languageNames } from "@/src/contexts/AdminLanguageContext";
import { usePages } from "@/src/contexts/PageContext";

interface SidebarAction {
  label: string;
  formId?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

interface AdminSidebarActionContextValue {
  action: SidebarAction | null;
  setAction: (action: SidebarAction | null) => void;
}

const AdminSidebarActionContext = createContext<AdminSidebarActionContextValue | undefined>(undefined);

const sidebarLinks = [
  { name: "Dashboard", path: "/control-room", icon: LayoutDashboard },
  { name: "Products", path: "/control-room/products", icon: Package },
  { name: "Pages", path: "/control-room/pages", icon: FileText },
  { name: "Global Settings", path: "/control-room/globals", icon: Globe },
  { name: "Media", path: "/control-room/media", icon: ImageIcon },
  { name: "Leads", path: "/control-room/leads", icon: Users },
  { name: "SEO Settings", path: "/control-room/seo", icon: Settings },
];

const AUTH_KEY = "hq_admin_token";

function getStoredToken(): string | null {
  try { return localStorage.getItem(AUTH_KEY); } catch { return null; }
}
function setStoredToken(token: string) {
  try { localStorage.setItem(AUTH_KEY, token); } catch {}
}
function clearStoredToken() {
  try { localStorage.removeItem(AUTH_KEY); } catch {}
}

function AdminBrandMark({ logo, className }: { logo?: string; className?: string }) {
  if (logo) {
    return (
      <span className={cn("flex items-center justify-center overflow-hidden rounded-xl bg-white", className)}>
        <img src={logo} alt="HQ Dried Fruits logo" className="h-full w-full object-contain" />
      </span>
    );
  }

  return (
    <span className={cn("flex items-center justify-center rounded-xl bg-earth-600 text-white", className)}>
      <Leaf size={20} />
    </span>
  );
}

// ---------- Login Screen ----------
function LoginScreen({ onSuccess, brandLogo }: { onSuccess: () => void; brandLogo?: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid username or password.");
      } else {
        setStoredToken(data.token);
        onSuccess();
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <AdminBrandMark logo={brandLogo} className="mx-auto mb-4 h-14 w-14 rounded-2xl shadow-lg shadow-earth-900/40" />
          <h1 className="font-display text-2xl font-bold text-white">Control Room</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to manage your website</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder-slate-500 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/30"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pr-12 text-white outline-none transition placeholder-slate-500 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/30"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 border border-red-500/20"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-earth-600 py-3 text-sm font-semibold text-white shadow-lg shadow-earth-900/40 transition-all hover:bg-earth-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-600">
          HQ Dried Fruits · Admin Access Only
        </p>
      </motion.div>
    </div>
  );
}

// ---------- Main AdminLayout Content ----------
function AdminLayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [action, setAction] = useState<SidebarAction | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { editingLang, setEditingLang } = useAdminLanguage();
  const { globalSettings } = usePages();
  const location = useLocation();
  const navigate = useNavigate();
  const actionContextValue = useMemo(() => ({ action, setAction }), [action]);
  const brandLogo = globalSettings.headerLogo || "";
  const siteName = globalSettings.siteName || "HQ Dried Fruits";

  // Verify stored token with the server on mount
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setIsAuthenticated(res.ok))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    setIsAuthenticated(false);
    navigate("/control-room");
  };

  useEffect(() => {
    if (!action) return undefined;

    const handleSaveShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();

      if (action.disabled || action.isLoading) return;
      if (action.onClick) {
        action.onClick();
        return;
      }

      if (action.formId) {
        const form = document.getElementById(action.formId) as HTMLFormElement | null;
        form?.requestSubmit();
      }
    };

    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [action]);

  // Still checking auth
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-earth-600 border-t-transparent" />
      </div>
    );
  }

  // Not logged in → show login screen
  if (!isAuthenticated) {
    return <LoginScreen onSuccess={() => setIsAuthenticated(true)} brandLogo={brandLogo} />;
  }

  const currentLink = sidebarLinks.find((link) => link.path === location.pathname) || sidebarLinks[0];

  return (
    <AdminSidebarActionContext.Provider value={actionContextValue}>
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
            />
          )}
        </AnimatePresence>
        <motion.aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-slate-300 transition-transform duration-300 lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2 text-white">
              <AdminBrandMark logo={brandLogo} className="h-9 w-9" />
              <span className="font-display text-lg font-bold tracking-tight">
                {siteName} <span className="text-earth-500">Admin</span>
              </span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  <Icon size={18} className={isActive ? "text-earth-500" : "text-slate-500"} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <LogOut size={18} className="text-slate-500" />
              Log Out
            </button>
          </div>
        </motion.aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-slate-500 hover:text-slate-700 lg:hidden"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-semibold text-slate-900">{currentLink.name}</h1>
            </div>
            
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex items-center rounded-lg bg-slate-100 p-1">
                {SUPPORTED_EDIT_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setEditingLang(lang)}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-[11px] font-bold transition-all sm:px-3 sm:text-xs",
                      editingLang === lang
                        ? "bg-white text-earth-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {languageNames[lang].toUpperCase()}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <AdminBrandMark logo={brandLogo} className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 sm:px-6 sm:pt-6 sm:pb-32 lg:px-8 lg:pt-8">
            <Outlet />
          </main>
        </div>
        <AnimatePresence>
          {action && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed bottom-4 right-4 z-[80] sm:bottom-6 sm:right-6 lg:right-8"
            >
              <button
                type={action.formId ? "submit" : "button"}
                form={action.formId}
                onClick={action.onClick}
                disabled={action.disabled || action.isLoading}
                className="flex min-w-[11rem] items-center justify-center gap-2 rounded-2xl bg-earth-600 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-earth-900/25 transition-all hover:bg-earth-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {action.isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {action.label}
              </button>
              <div className="mt-2 hidden text-center text-[11px] font-semibold text-slate-500 sm:block">
                Ctrl / Cmd + S
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminSidebarActionContext.Provider>
  );
}

// Wrapper to provide AdminLanguageContext
export function AdminLayout() {
  return (
    <AdminLanguageProvider>
      <AdminLayoutContent />
    </AdminLanguageProvider>
  );
}

export function useAdminSidebarAction() {
  const context = useContext(AdminSidebarActionContext);
  if (!context) {
    throw new Error("useAdminSidebarAction must be used within AdminLayout");
  }
  return context;
}
