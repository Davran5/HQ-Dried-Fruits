import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
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
  Globe
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface SidebarAction {
  label: string;
  formId?: string;
  onClick?: () => void;
}

interface AdminSidebarActionContextValue {
  action: SidebarAction | null;
  setAction: (action: SidebarAction | null) => void;
}

const AdminSidebarActionContext = createContext<AdminSidebarActionContextValue | undefined>(undefined);

const sidebarLinks = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Pages", path: "/admin/pages", icon: FileText },
  { name: "Global Settings", path: "/admin/globals", icon: Globe },
  { name: "Media", path: "/admin/media", icon: ImageIcon },
  { name: "Leads", path: "/admin/leads", icon: Users },
  { name: "SEO Settings", path: "/admin/seo", icon: Settings },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [action, setAction] = useState<SidebarAction | null>(null);
  const location = useLocation();
  const actionContextValue = useMemo(() => ({ action, setAction }), [action]);

  const currentLink = sidebarLinks.find(link => link.path === location.pathname) || sidebarLinks[0];

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
            <Leaf size={20} className="text-earth-500" />
            <span className="font-display text-lg font-bold tracking-tight">
              HQ Dried Fruits <span className="text-earth-500">Admin</span>
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

        {action && (
          <div className="border-t border-slate-800 p-4">
            <button
              type={action.formId ? "submit" : "button"}
              form={action.formId}
              onClick={action.onClick}
              className="flex w-full items-center justify-center rounded-lg bg-earth-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-earth-700"
            >
              {action.label}
            </button>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
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
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
    </AdminSidebarActionContext.Provider>
  );
}

export function useAdminSidebarAction() {
  const context = useContext(AdminSidebarActionContext);

  if (!context) {
    throw new Error("useAdminSidebarAction must be used within AdminLayout");
  }

  return context;
}
