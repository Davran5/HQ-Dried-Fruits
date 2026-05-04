import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
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
  CircleUserRound,
  Search,
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

interface AdminHeaderTab {
  id: string;
  label: string;
  sublabel?: string;
  onClick: () => void;
}

interface AdminSidebarActionContextValue {
  action: SidebarAction | null;
  setAction: (action: SidebarAction | null) => void;
  headerTabs: AdminHeaderTab[] | null;
  activeHeaderTabId: string | null;
  setHeaderTabs: (tabs: AdminHeaderTab[] | null, activeId?: string | null) => void;
}

const AdminSidebarActionContext = createContext<AdminSidebarActionContextValue | undefined>(undefined);

const sidebarLinks = [
  { name: "Dashboard", path: "/control-room", icon: LayoutDashboard },
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

interface AdminSearchResult {
  id: string;
  title: string;
  detail: string;
  element: HTMLElement | null;
  score: number;
  onSelect?: () => void;
}

const ADMIN_SEARCH_MIN_LENGTH = 2;
const ADMIN_SEARCH_SELECTOR = [
  "[data-admin-search-section]",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "label",
  "input:not([type='hidden'])",
  "textarea",
  "select",
  "[contenteditable='true']",
].join(",");

const ADMIN_FOCUS_SELECTOR = [
  "input:not([type='hidden'])",
  "textarea",
  "select",
  "button",
  "[contenteditable='true']",
].join(",");

function normalizeAdminSearchText(value?: string | null) {
  return (value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function trimAdminSearchDetail(value: string, maxLength = 110) {
  const cleanValue = value.replace(/\s+/g, " ").trim();
  if (cleanValue.length <= maxLength) return cleanValue;
  return `${cleanValue.slice(0, maxLength - 1).trim()}...`;
}

function escapeCssIdentifier(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/["\\]/g, "\\$&");
}

function getAdminElementValue(element: HTMLElement) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }

  if (element instanceof HTMLSelectElement) {
    return Array.from(element.selectedOptions).map((option) => option.textContent || option.value).join(" ");
  }

  return element.getAttribute("aria-label") || "";
}

function findAdminFieldLabel(element: HTMLElement, root: HTMLElement) {
  if (element.matches("[data-admin-search-section]")) {
    return element.dataset.adminSearchTitle || element.textContent || "";
  }

  if (element.id) {
    const label = root.querySelector<HTMLLabelElement>(`label[for="${escapeCssIdentifier(element.id)}"]`);
    if (label?.textContent?.trim()) return label.textContent.trim();
  }

  const wrappingLabel = element.closest("label");
  if (wrappingLabel?.textContent?.trim()) return wrappingLabel.textContent.trim();

  const previousLabel = element.previousElementSibling;
  if (previousLabel?.tagName.toLowerCase() === "label" && previousLabel.textContent?.trim()) {
    return previousLabel.textContent.trim();
  }

  const nearbyLabel = element.parentElement?.querySelector<HTMLLabelElement>("label");
  if (nearbyLabel?.textContent?.trim()) return nearbyLabel.textContent.trim();

  return (
    element.getAttribute("placeholder") ||
    element.getAttribute("aria-label") ||
    element.getAttribute("name") ||
    element.textContent ||
    ""
  );
}

function findAdminSearchTarget(element: HTMLElement, root: HTMLElement) {
  if (element instanceof HTMLLabelElement && element.htmlFor) {
    const control = root.querySelector<HTMLElement>(`#${escapeCssIdentifier(element.htmlFor)}`);
    if (control) return control;
  }

  if (element.matches(ADMIN_FOCUS_SELECTOR) || element.matches("[data-admin-search-section]")) {
    return element;
  }

  return element.querySelector<HTMLElement>(ADMIN_FOCUS_SELECTOR) || element;
}

function findAdminSectionTitle(element: HTMLElement) {
  const section = element.closest<HTMLElement>("[data-admin-search-title]");
  return section?.dataset.adminSearchTitle || "";
}

function adminSearchMatches(query: string, haystack: string) {
  const tokens = normalizeAdminSearchText(query).split(" ").filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

function buildAdminSearchResults(root: HTMLElement, query: string, headerTabs: AdminHeaderTab[] | null) {
  const normalizedQuery = normalizeAdminSearchText(query);
  if (normalizedQuery.length < ADMIN_SEARCH_MIN_LENGTH) return [];

  const results = new Map<string, AdminSearchResult>();

  headerTabs?.forEach((tab) => {
    const haystack = normalizeAdminSearchText(`${tab.label} ${tab.sublabel || ""}`);
    if (!adminSearchMatches(normalizedQuery, haystack)) return;

    const titleScore = haystack.startsWith(normalizedQuery) ? 8 : 5;
    results.set(`tab-${tab.id}`, {
      id: `tab-${tab.id}`,
      title: `Open ${tab.label}`,
      detail: tab.sublabel || "Admin tab",
      element: root,
      score: titleScore,
      onSelect: tab.onClick,
    });
  });

  const candidates = Array.from(root.querySelectorAll<HTMLElement>(ADMIN_SEARCH_SELECTOR));

  candidates.forEach((element, index) => {
    const target = findAdminSearchTarget(element, root);
    const sectionTitle = findAdminSectionTitle(element);
    const fieldLabel = findAdminFieldLabel(element, root);
    const fieldValue = getAdminElementValue(element);
    const placeholder = element.getAttribute("placeholder") || "";
    const visibleText = element.matches("input, textarea, select") ? "" : element.textContent || "";
    const title = trimAdminSearchDetail(fieldLabel || sectionTitle || visibleText || "Admin field", 80);

    if (!title || normalizeAdminSearchText(title).length < ADMIN_SEARCH_MIN_LENGTH) return;

    const haystack = normalizeAdminSearchText(`${title} ${sectionTitle} ${fieldValue} ${placeholder} ${visibleText}`);
    if (!adminSearchMatches(normalizedQuery, haystack)) return;

    const titleText = normalizeAdminSearchText(title);
    const valueText = normalizeAdminSearchText(fieldValue);
    const score =
      titleText === normalizedQuery ? 10 :
      titleText.startsWith(normalizedQuery) ? 9 :
      titleText.includes(normalizedQuery) ? 7 :
      valueText.includes(normalizedQuery) ? 6 :
      3;

    const detail = trimAdminSearchDetail(
      [
        sectionTitle && sectionTitle !== title ? sectionTitle : "",
        fieldValue && fieldValue !== title ? fieldValue : "",
        placeholder && placeholder !== title ? placeholder : "",
      ].filter(Boolean).join(" · ") || "Jump to field",
    );
    const targetIndex = target === element ? index : candidates.indexOf(target);
    const id = `${targetIndex >= 0 ? targetIndex : index}-${title}-${detail}`;

    if (!results.has(id) || (results.get(id)?.score || 0) < score) {
      results.set(id, {
        id,
        title,
        detail,
        element: target,
        score,
      });
    }
  });

  return Array.from(results.values())
    .sort((first, second) => second.score - first.score || first.title.localeCompare(second.title))
    .slice(0, 10);
}

function getAdminSearchFocusTarget(element: HTMLElement | null) {
  if (!element) return null;
  if (element.matches(ADMIN_FOCUS_SELECTOR)) return element;
  return element.querySelector<HTMLElement>(ADMIN_FOCUS_SELECTOR);
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
  const [headerTabs, setHeaderTabsState] = useState<AdminHeaderTab[] | null>(null);
  const [activeHeaderTabId, setActiveHeaderTabId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminSearchResults, setAdminSearchResults] = useState<AdminSearchResult[]>([]);
  const [isAdminSearchOpen, setIsAdminSearchOpen] = useState(false);
  const adminMainRef = useRef<HTMLElement | null>(null);
  const { editingLang, setEditingLang } = useAdminLanguage();
  const { globalSettings } = usePages();
  const location = useLocation();
  const navigate = useNavigate();
  const setHeaderTabs = useCallback((tabs: AdminHeaderTab[] | null, activeId: string | null = null) => {
    setHeaderTabsState(tabs);
    setActiveHeaderTabId(activeId);
  }, []);
  const actionContextValue = useMemo(
    () => ({ action, setAction, headerTabs, activeHeaderTabId, setHeaderTabs }),
    [action, activeHeaderTabId, headerTabs],
  );
  const brandLogo = globalSettings.headerLogo || "";
  const siteName = globalSettings.siteName || "HQ Dried Fruits";

  const runAdminSearch = useCallback((query: string) => {
    setAdminSearchQuery(query);
    setIsAdminSearchOpen(true);

    if (!adminMainRef.current) {
      setAdminSearchResults([]);
      return;
    }

    setAdminSearchResults(buildAdminSearchResults(adminMainRef.current, query, headerTabs));
  }, [headerTabs]);

  const closeAdminSearch = useCallback(() => {
    setIsAdminSearchOpen(false);
  }, []);

  const handleAdminSearchSelect = useCallback((result: AdminSearchResult) => {
    setIsAdminSearchOpen(false);
    setAdminSearchQuery("");
    setAdminSearchResults([]);

    result.onSelect?.();
    window.dispatchEvent(new CustomEvent("admin:open-section", { detail: { target: result.element } }));

    window.setTimeout(() => {
      const target = result.element;
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("ring-4", "ring-earth-300", "ring-offset-2", "rounded-lg");

      const focusTarget = getAdminSearchFocusTarget(target);
      focusTarget?.focus({ preventScroll: true });

      window.setTimeout(() => {
        target.classList.remove("ring-4", "ring-earth-300", "ring-offset-2", "rounded-lg");
      }, 1800);
    }, result.onSelect ? 260 : 160);
  }, []);

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

  useEffect(() => {
    setAdminSearchQuery("");
    setAdminSearchResults([]);
    setIsAdminSearchOpen(false);
  }, [editingLang, location.pathname]);

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
          <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="shrink-0 text-slate-500 hover:text-slate-700 lg:hidden"
              >
                <Menu size={24} />
              </button>
              {headerTabs ? (
                <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-2">
                  {headerTabs.map((tab) => {
                    const isActive = activeHeaderTabId === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={tab.onClick}
                        className={cn(
                          "min-w-max rounded-lg border px-3 py-1.5 text-left transition-all",
                          isActive
                            ? "border-earth-300 bg-earth-50 text-earth-800"
                            : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50",
                        )}
                      >
                        <span className="block text-xs font-bold sm:text-sm">{tab.label}</span>
                        {tab.sublabel ? (
                          <span className="block max-w-[11rem] truncate font-mono text-[10px] text-slate-400">
                            {tab.sublabel}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <h1 className="truncate text-xl font-semibold text-slate-900">{currentLink.name}</h1>
              )}
            </div>
            
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="relative w-36 sm:w-52 lg:w-72">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={adminSearchQuery}
                  onChange={(event) => runAdminSearch(event.target.value)}
                  onFocus={() => {
                    setIsAdminSearchOpen(true);
                    if (adminSearchQuery) {
                      runAdminSearch(adminSearchQuery);
                    }
                  }}
                  onBlur={() => window.setTimeout(closeAdminSearch, 140)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.currentTarget.blur();
                      closeAdminSearch();
                    }

                    if (event.key === "Enter" && adminSearchResults[0]) {
                      event.preventDefault();
                      handleAdminSearchSelect(adminSearchResults[0]);
                    }
                  }}
                  placeholder="Search fields"
                  aria-label="Search admin fields"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-9 text-sm font-medium text-slate-800 outline-none transition focus:border-earth-300 focus:bg-white focus:ring-2 focus:ring-earth-100"
                />
                {adminSearchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminSearchQuery("");
                      setAdminSearchResults([]);
                      setIsAdminSearchOpen(false);
                    }}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                    aria-label="Clear admin search"
                  >
                    <X size={14} />
                  </button>
                ) : null}

                <AnimatePresence>
                  {isAdminSearchOpen && adminSearchQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute right-0 top-full z-[90] mt-2 w-[min(28rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15"
                    >
                      <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Admin Search
                      </div>

                      {normalizeAdminSearchText(adminSearchQuery).length < ADMIN_SEARCH_MIN_LENGTH ? (
                        <div className="px-3 py-4 text-sm text-slate-500">
                          Type at least {ADMIN_SEARCH_MIN_LENGTH} characters.
                        </div>
                      ) : adminSearchResults.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto p-1.5">
                          {adminSearchResults.map((result) => (
                            <button
                              key={result.id}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handleAdminSearchSelect(result)}
                              className="block w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-earth-50 focus:bg-earth-50 focus:outline-none"
                            >
                              <span className="block truncate text-sm font-bold text-slate-900">{result.title}</span>
                              <span className="mt-0.5 block truncate text-xs text-slate-500">{result.detail}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-3 py-4 text-sm text-slate-500">
                          No matching field on this admin screen.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
              
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                <CircleUserRound size={18} />
              </div>
            </div>
          </header>
          <main ref={adminMainRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-28 sm:px-6 sm:pt-6 sm:pb-32 lg:px-8 lg:pt-8">
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

export function useAdminHeaderTabs() {
  const context = useContext(AdminSidebarActionContext);
  if (!context) {
    throw new Error("useAdminHeaderTabs must be used within AdminLayout");
  }
  return {
    setHeaderTabs: context.setHeaderTabs,
  };
}
