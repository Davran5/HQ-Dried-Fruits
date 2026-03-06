import { Users, Package, FileText, TrendingUp } from "lucide-react";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat Cards */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">Total Leads</h3>
            <Users size={20} className="text-earth-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">128</p>
          <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
            <TrendingUp size={14} /> +12% from last month
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">Products</h3>
            <Package size={20} className="text-earth-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">24</p>
          <p className="mt-2 text-sm text-slate-500">Active in catalog</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">Page Views</h3>
            <FileText size={20} className="text-earth-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">12.5k</p>
          <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
            <TrendingUp size={14} /> +5.2% from last month
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">Conversion Rate</h3>
            <TrendingUp size={20} className="text-earth-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">3.2%</p>
          <p className="mt-2 text-sm text-slate-500">Average across all forms</p>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-medium text-slate-900">Recent Leads</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-slate-900">Global Imports Ltd.</p>
                  <p className="text-sm text-slate-500">Requested quote for Sun-Dried Apricots</p>
                </div>
                <div className="text-sm text-slate-500">
                  {i} hour{i > 1 ? 's' : ''} ago
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
