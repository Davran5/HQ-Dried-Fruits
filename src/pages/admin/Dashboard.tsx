import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  FileSearch,
  Globe,
  Loader2,
  MessageSquareMore,
  Package,
  RefreshCw,
  TrendingUp,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Product, SEOData } from "@/src/types/product";
import { ManagedPageId, defaultPageSlugs } from "@/src/lib/routes";
import { cn } from "@/src/lib/utils";

type LeadStatus = "New" | "Contacted" | "In Progress" | "Converted" | "Disqualified";

interface Lead {
  id: string;
  date: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  telegram?: string;
  productInterest: string;
  estTonnage: string;
  status: LeadStatus;
  message: string;
  notes: string;
}

interface DashboardPayload {
  leads: Lead[];
  products: Product[];
  pageSeo: Record<string, SEOData>;
}

const statusConfig: Record<LeadStatus, { label: string; bar: string; badge: string }> = {
  New: {
    label: "New",
    bar: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
  },
  Contacted: {
    label: "Contacted",
    bar: "bg-violet-500",
    badge: "bg-violet-100 text-violet-800 border-violet-200",
  },
  "In Progress": {
    label: "In Progress",
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  Converted: {
    label: "Converted",
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  Disqualified: {
    label: "Disqualified",
    bar: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const statusOrder: LeadStatus[] = ["New", "Contacted", "In Progress", "Converted", "Disqualified"];
const managedPages: ManagedPageId[] = ["home", "about", "products", "export", "contacts", "privacy", "terms"];

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: typeof BarChart3;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-earth-50 text-earth-600">
          <Icon size={20} />
        </div>
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  title,
  value,
  context,
  tone = "neutral",
  icon: Icon,
}: {
  title: string;
  value: string;
  context: ReactNode;
  tone?: "neutral" | "positive" | "warning";
  icon: typeof Users;
}) {
  const toneClass =
    tone === "positive"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700"
        : "bg-earth-50 text-earth-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", toneClass)}>
          <Icon size={22} />
        </div>
      </div>
      <div className="mt-4 text-sm text-slate-600">{context}</div>
    </div>
  );
}

function formatRelativeTime(dateString: string) {
  const timestamp = new Date(dateString).getTime();
  const diffMs = timestamp - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const absMinutes = Math.abs(diffMinutes);

  if (absMinutes < 60) {
    return `${absMinutes} min${absMinutes === 1 ? "" : "s"} ${diffMinutes <= 0 ? "ago" : "from now"}`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  const absHours = Math.abs(diffHours);
  if (absHours < 24) {
    return `${absHours} hour${absHours === 1 ? "" : "s"} ${diffHours <= 0 ? "ago" : "from now"}`;
  }

  const diffDays = Math.round(diffHours / 24);
  const absDays = Math.abs(diffDays);
  return `${absDays} day${absDays === 1 ? "" : "s"} ${diffDays <= 0 ? "ago" : "from now"}`;
}

function formatDateTime(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function formatDelta(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) {
      return { value: "0%", positive: true, label: "Flat vs previous period" };
    }
    return { value: "New", positive: true, label: "No leads in previous period" };
  }

  const delta = ((current - previous) / previous) * 100;
  return {
    value: `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`,
    positive: delta >= 0,
    label: "vs previous 30 days",
  };
}

export function Dashboard() {
  const [data, setData] = useState<DashboardPayload>({
    leads: [],
    products: [],
    pageSeo: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = async (showRefreshState = false) => {
    if (showRefreshState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [leadsResponse, productsResponse, seoResponse] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/products"),
        fetch("/api/seo/pages"),
      ]);

      if (!leadsResponse.ok || !productsResponse.ok || !seoResponse.ok) {
        throw new Error("Failed to load dashboard data from the server.");
      }

      const [leads, products, pageSeo] = await Promise.all([
        leadsResponse.json(),
        productsResponse.json(),
        seoResponse.json(),
      ]);

      setData({
        leads: Array.isArray(leads) ? leads : [],
        products: Array.isArray(products) ? products : [],
        pageSeo: pageSeo && typeof pageSeo === "object" ? pageSeo : {},
      });
      setLastUpdated(new Date());
    } catch (loadError) {
      console.error("Dashboard load error:", loadError);
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const dashboardStats = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * day;
    const sixtyDaysAgo = now - 60 * day;
    const sevenDaysAgo = now - 7 * day;
    const fortyEightHoursAgo = now - 2 * day;

    const leads = [...data.leads].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const products = data.products;

    const totalLeads = leads.length;
    const recent30 = leads.filter((lead) => new Date(lead.date).getTime() >= thirtyDaysAgo);
    const previous30 = leads.filter((lead) => {
      const timestamp = new Date(lead.date).getTime();
      return timestamp >= sixtyDaysAgo && timestamp < thirtyDaysAgo;
    });
    const recent7 = leads.filter((lead) => new Date(lead.date).getTime() >= sevenDaysAgo);
    const staleNewLeads = leads.filter(
      (lead) => lead.status === "New" && new Date(lead.date).getTime() <= fortyEightHoursAgo,
    );
    const openPipeline = leads.filter((lead) =>
      lead.status === "New" || lead.status === "Contacted" || lead.status === "In Progress",
    );
    const convertedLeads = leads.filter((lead) => lead.status === "Converted");
    const openLeadsWithoutNotes = openPipeline.filter((lead) => !lead.notes?.trim());
    const missingDirectContact = openPipeline.filter((lead) => !lead.phone?.trim() && !lead.telegram?.trim());

    const totalProducts = products.length;
    const activeProducts = products.filter((product) => product.status === "Active");
    const inactiveProducts = products.filter((product) => product.status !== "Active");
    const productsMissingSeo = products.filter(
      (product) => !product.seo?.metaTitle?.trim() || !product.seo?.metaDescription?.trim(),
    );
    const productsMissingGallery = products.filter((product) => !product.imageGallery?.length);
    const productsMissingStory = products.filter((product) => !product.longDescription?.trim());

    const pageCustomSlugs = managedPages.filter((pageId) => {
      if (pageId === "home") {
        return false;
      }
      const slug = data.pageSeo[pageId]?.slug?.trim().toLowerCase() || defaultPageSlugs[pageId];
      return slug !== defaultPageSlugs[pageId];
    }).length;

    const topProducts = Object.entries(
      leads.reduce<Record<string, number>>((acc, lead) => {
        const key = lead.productInterest?.trim() || "Unspecified inquiry";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({
        label,
        count,
        share: totalLeads ? (count / totalLeads) * 100 : 0,
      }));

    const monthlyTrend = Array.from({ length: 6 }, (_item, index) => {
      const baseDate = new Date();
      baseDate.setDate(1);
      baseDate.setHours(0, 0, 0, 0);
      baseDate.setMonth(baseDate.getMonth() - (5 - index));

      const nextDate = new Date(baseDate);
      nextDate.setMonth(baseDate.getMonth() + 1);

      const count = leads.filter((lead) => {
        const timestamp = new Date(lead.date).getTime();
        return timestamp >= baseDate.getTime() && timestamp < nextDate.getTime();
      }).length;

      return {
        label: baseDate.toLocaleString("en-US", { month: "short" }),
        count,
      };
    });

    return {
      totalLeads,
      recent30,
      previous30,
      recent7,
      staleNewLeads,
      openPipeline,
      convertedLeads,
      openLeadsWithoutNotes,
      missingDirectContact,
      totalProducts,
      activeProducts,
      inactiveProducts,
      productsMissingSeo,
      productsMissingGallery,
      productsMissingStory,
      pageCustomSlugs,
      topProducts,
      monthlyTrend,
      recentLeads: leads.slice(0, 6),
      statusCounts: statusOrder.map((status) => ({
        status,
        count: leads.filter((lead) => lead.status === status).length,
      })),
    };
  }, [data]);

  const leadsDelta = formatDelta(dashboardStats.recent30.length, dashboardStats.previous30.length);
  const maxTrendValue = Math.max(...dashboardStats.monthlyTrend.map((item) => item.count), 1);
  const conversionRate = dashboardStats.totalLeads
    ? (dashboardStats.convertedLeads.length / dashboardStats.totalLeads) * 100
    : 0;
  const openPipelineShare = dashboardStats.totalLeads
    ? (dashboardStats.openPipeline.length / dashboardStats.totalLeads) * 100
    : 0;
  const seoCoverage = dashboardStats.totalProducts
    ? ((dashboardStats.totalProducts - dashboardStats.productsMissingSeo.length) / dashboardStats.totalProducts) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-10 w-10 animate-spin text-earth-500" />
          <p className="font-medium">Loading live dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-900 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Dashboard failed to load</h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button className="mt-4" onClick={() => loadDashboard()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Operations Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Live view of inquiry flow, catalog health, and SEO readiness.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-slate-500">
            {lastUpdated ? `Last updated ${formatRelativeTime(lastUpdated.toISOString())}` : "Not refreshed yet"}
          </p>
          <Button
            variant="outline"
            className="rounded-xl bg-white px-5"
            onClick={() => loadDashboard(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          title="Total Leads"
          value={String(dashboardStats.totalLeads)}
          icon={Users}
          context={
            <div className="flex items-center gap-2">
              {leadsDelta.positive ? (
                <ArrowUpRight size={14} className="text-emerald-600" />
              ) : (
                <ArrowDownRight size={14} className="text-red-600" />
              )}
              <span className={leadsDelta.positive ? "text-emerald-600" : "text-red-600"}>{leadsDelta.value}</span>
              <span className="text-slate-500">{leadsDelta.label}</span>
            </div>
          }
        />
        <MetricCard
          title="Last 30 Days"
          value={String(dashboardStats.recent30.length)}
          icon={UserRoundPlus}
          tone="positive"
          context={<span>{dashboardStats.recent7.length} inquiries landed in the last 7 days.</span>}
        />
        <MetricCard
          title="Open Pipeline"
          value={String(dashboardStats.openPipeline.length)}
          icon={Clock3}
          tone="warning"
          context={<span>{openPipelineShare.toFixed(1)}% of total leads still need follow-up.</span>}
        />
        <MetricCard
          title="Converted"
          value={String(dashboardStats.convertedLeads.length)}
          icon={CheckCircle2}
          tone="positive"
          context={<span>{conversionRate.toFixed(1)}% conversion rate across all captured leads.</span>}
        />
        <MetricCard
          title="Active Products"
          value={String(dashboardStats.activeProducts.length)}
          icon={Package}
          context={<span>{dashboardStats.inactiveProducts.length} inactive products are hidden from the catalog.</span>}
        />
        <MetricCard
          title="SEO Coverage"
          value={`${seoCoverage.toFixed(0)}%`}
          icon={Globe}
          context={<span>{dashboardStats.productsMissingSeo.length} products are still missing core SEO metadata.</span>}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Lead Pipeline"
          subtitle="Current status mix across all inquiries."
          icon={BarChart3}
        >
          <div className="space-y-4">
            {dashboardStats.statusCounts.map(({ status, count }) => {
              const width = dashboardStats.totalLeads ? (count / dashboardStats.totalLeads) * 100 : 0;
              return (
                <div key={status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider", statusConfig[status].badge)}>
                        {statusConfig[status].label}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-700">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn("h-full rounded-full transition-all", statusConfig[status].bar)} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Attention Needed"
          subtitle="Items most likely to block response time."
          icon={AlertTriangle}
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Stale New Leads</p>
              <p className="mt-2 text-3xl font-bold text-amber-900">{dashboardStats.staleNewLeads.length}</p>
              <p className="mt-1 text-sm text-amber-800">New leads older than 48 hours without status movement.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Open Without Notes</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{dashboardStats.openLeadsWithoutNotes.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Missing Direct Contact</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{dashboardStats.missingDirectContact.length}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/leads" className="flex-1">
                <Button className="w-full rounded-xl">Review Leads</Button>
              </Link>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Catalog Health"
          subtitle="Content and catalog readiness checks."
          icon={Boxes}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Products Missing SEO</span>
              <span className="text-sm font-bold text-slate-900">{dashboardStats.productsMissingSeo.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Products Missing Gallery</span>
              <span className="text-sm font-bold text-slate-900">{dashboardStats.productsMissingGallery.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Products Missing Long Description</span>
              <span className="text-sm font-bold text-slate-900">{dashboardStats.productsMissingStory.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-600">Pages on Custom Slugs</span>
              <span className="text-sm font-bold text-slate-900">{dashboardStats.pageCustomSlugs}</span>
            </div>
            <div className="flex gap-3 pt-1">
              <Link to="/admin/products" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl bg-white">Catalog</Button>
              </Link>
              <Link to="/admin/seo" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl bg-white">SEO</Button>
              </Link>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Inquiry Trend"
          subtitle="Lead volume over the last six months."
          icon={TrendingUp}
        >
          <div className="grid grid-cols-6 items-end gap-3">
            {dashboardStats.monthlyTrend.map((month) => (
              <div key={month.label} className="flex flex-col items-center gap-3">
                <div className="flex h-48 w-full items-end rounded-2xl bg-slate-50 p-2">
                  <div
                    className="w-full rounded-xl bg-gradient-to-t from-earth-600 to-earth-400"
                    style={{ height: `${(month.count / maxTrendValue) * 100}%` }}
                    title={`${month.label}: ${month.count}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900">{month.count}</p>
                  <p className="text-xs uppercase tracking-widest text-slate-400">{month.label}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Demand Highlights"
          subtitle="Most requested products and categories."
          icon={MessageSquareMore}
        >
          {dashboardStats.topProducts.length > 0 ? (
            <div className="space-y-4">
              {dashboardStats.topProducts.map((item, index) => (
                <div key={`${item.label}-${index}`}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-medium text-slate-700">{item.label}</p>
                    <p className="text-sm font-bold text-slate-900">{item.count}</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-mint-500" style={{ width: `${item.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No product inquiry data yet.
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent Leads"
        subtitle="Latest inquiry activity with direct next-step visibility."
        icon={FileSearch}
      >
        {dashboardStats.recentLeads.length > 0 ? (
          <div className="space-y-4">
            {dashboardStats.recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="font-bold text-slate-900">{lead.company || lead.name || lead.id}</h4>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider", statusConfig[lead.status].badge)}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-600">{lead.productInterest || "General inquiry"}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDateTime(lead.date)} · {formatRelativeTime(lead.date)}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 text-sm text-slate-600 lg:items-end">
                  <p>{lead.email}</p>
                  <p>{lead.estTonnage || "Volume not specified"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No leads have been captured yet.</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
