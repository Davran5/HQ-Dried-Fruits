import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Filter,
  Hash,
  Loader2,
  Mail,
  MessageSquareText,
  NotebookPen,
  Phone,
  Search,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";
import { cn } from "@/src/lib/utils";

type LeadStatus = "New" | "Contacted" | "In Progress" | "Converted" | "Disqualified";
type AgeFilter = "all" | "today" | "7d" | "30d" | "stale";
type NoteFilter = "all" | "with-notes" | "needs-notes";
type SortOption = "newest" | "oldest" | "company" | "status";

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

const statusColors: Record<LeadStatus, string> = {
  New: "bg-blue-100 text-blue-800 border-blue-200",
  Contacted: "bg-violet-100 text-violet-800 border-violet-200",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
  Converted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Disqualified: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusOrder: LeadStatus[] = ["New", "Contacted", "In Progress", "Converted", "Disqualified"];

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function formatRelativeTime(dateString: string) {
  const diffMinutes = Math.max(1, Math.round((Date.now() - new Date(dateString).getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function isStaleLead(lead: Lead) {
  if (lead.status === "Converted" || lead.status === "Disqualified") return false;
  return Date.now() - new Date(lead.date).getTime() >= 48 * 60 * 60 * 1000;
}

function safeValue(value?: string) {
  return value?.trim() || "Not provided";
}

export function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "All">("All");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
  const [noteFilter, setNoteFilter] = useState<NoteFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [savingNoteIds, setSavingNoteIds] = useState<string[]>([]);
  const [updatingStatusIds, setUpdatingStatusIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<LeadStatus | "">("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/leads");
      if (!response.ok) throw new Error("Failed to fetch leads.");
      const data = await response.json();
      const safeLeads = Array.isArray(data) ? data : [];
      setLeads(safeLeads);
      setDraftNotes(
        safeLeads.reduce<Record<string, string>>((acc, lead) => {
          acc[lead.id] = lead.notes || "";
          return acc;
        }, {}),
      );
      setSelectedIds((prev) => prev.filter((id) => safeLeads.some((lead) => lead.id === id)));
      setExpandedId((prev) => (prev && safeLeads.some((lead) => lead.id === prev) ? prev : null));
    } catch (error) {
      console.error("Failed to load leads:", error);
      showToast("Failed to load leads.");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const persistLead = async (id: string, payload: { status: LeadStatus; notes: string }) => {
    const response = await fetch(`/api/leads/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to update lead.");
  };

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const summaryStats = useMemo(() => {
    const open = leads.filter((lead) => lead.status === "New" || lead.status === "Contacted" || lead.status === "In Progress").length;
    const converted = leads.filter((lead) => lead.status === "Converted").length;
    const stale = leads.filter((lead) => isStaleLead(lead)).length;
    const withoutNotes = leads.filter((lead) => !(draftNotes[lead.id] ?? lead.notes ?? "").trim()).length;
    return { total: leads.length, open, converted, stale, withoutNotes };
  }, [draftNotes, leads]);

  const filteredAndSortedLeads = useMemo(() => {
    const now = Date.now();
    const today = now - 24 * 60 * 60 * 1000;
    const last7d = now - 7 * 24 * 60 * 60 * 1000;
    const last30d = now - 30 * 24 * 60 * 60 * 1000;
    let result = [...leads];

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      result = result.filter((lead) =>
        [lead.id, lead.name, lead.company, lead.email, lead.phone, lead.telegram || "", lead.productInterest, lead.estTonnage, draftNotes[lead.id] ?? lead.notes]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    if (filterStatus !== "All") result = result.filter((lead) => lead.status === filterStatus);
    if (noteFilter !== "all") {
      result = result.filter((lead) =>
        noteFilter === "with-notes"
          ? Boolean((draftNotes[lead.id] ?? lead.notes).trim())
          : !(draftNotes[lead.id] ?? lead.notes).trim(),
      );
    }
    if (ageFilter !== "all") {
      result = result.filter((lead) => {
        const timestamp = new Date(lead.date).getTime();
        if (ageFilter === "stale") return isStaleLead(lead);
        if (ageFilter === "today") return timestamp >= today;
        if (ageFilter === "7d") return timestamp >= last7d;
        return timestamp >= last30d;
      });
    }

    result.sort((a, b) => {
      if (sortOption === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOption === "company") return (a.company || a.name).localeCompare(b.company || b.name);
      if (sortOption === "status") return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return result;
  }, [ageFilter, draftNotes, filterStatus, leads, noteFilter, searchTerm, sortOption]);

  const visibleLeadIds = filteredAndSortedLeads.map((lead) => lead.id);
  const allVisibleSelected = visibleLeadIds.length > 0 && visibleLeadIds.every((id) => selectedSet.has(id));

  const toggleLeadSelection = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const toggleSelectVisible = () =>
    setSelectedIds((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleLeadIds.includes(id))
        : Array.from(new Set([...prev, ...visibleLeadIds])),
    );

  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    const targetLead = leads.find((lead) => lead.id === id);
    if (!targetLead) return;
    const nextNotes = draftNotes[id] ?? targetLead.notes ?? "";
    setUpdatingStatusIds((prev) => [...prev, id]);
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead)));
    try {
      await persistLead(id, { status: newStatus, notes: nextNotes });
      showToast(`Lead ${id} updated to ${newStatus}.`);
    } catch (error) {
      console.error("Failed to update status:", error);
      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status: targetLead.status } : lead)));
      showToast(`Failed to update ${id}.`);
    } finally {
      setUpdatingStatusIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSaveNotes = async (id: string) => {
    const targetLead = leads.find((lead) => lead.id === id);
    if (!targetLead) return;
    const nextNotes = draftNotes[id] ?? "";
    setSavingNoteIds((prev) => [...prev, id]);
    try {
      await persistLead(id, { status: targetLead.status, notes: nextNotes });
      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, notes: nextNotes } : lead)));
      showToast(`Notes saved for ${id}.`);
    } catch (error) {
      console.error("Failed to save notes:", error);
      showToast(`Failed to save notes for ${id}.`);
    } finally {
      setSavingNoteIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const applyBulkStatus = async () => {
    if (!bulkStatus || selectedIds.length === 0) return;
    const selectedLeads = leads.filter((lead) => selectedSet.has(lead.id));
    setIsBulkUpdating(true);
    setLeads((prev) => prev.map((lead) => (selectedSet.has(lead.id) ? { ...lead, status: bulkStatus } : lead)));
    try {
      await Promise.all(
        selectedLeads.map((lead) =>
          persistLead(lead.id, { status: bulkStatus, notes: draftNotes[lead.id] ?? lead.notes ?? "" }),
        ),
      );
      showToast(`Updated ${selectedIds.length} selected lead${selectedIds.length === 1 ? "" : "s"}.`);
      setBulkStatus("");
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk status update failed:", error);
      await fetchLeads();
      showToast("Bulk update failed. Data reloaded.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const copyToClipboard = async (value: string, label: string) => {
    if (!value.trim()) {
      showToast(`No ${label.toLowerCase()} available.`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} copied.`);
    } catch (error) {
      console.error("Clipboard error:", error);
      showToast(`Failed to copy ${label.toLowerCase()}.`);
    }
  };

  const appendNoteTemplate = (leadId: string, template: string) => {
    const dateLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date());
    const nextLine = `${template} (${dateLabel})`;
    setDraftNotes((prev) => {
      const current = (prev[leadId] ?? "").trim();
      return { ...prev, [leadId]: current ? `${current}\n${nextLine}` : nextLine };
    });
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toastMessage ? (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed right-4 top-4 z-[100] rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg"
          >
            {toastMessage}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Leads</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summaryStats.total}</p>
          <p className="mt-1 text-sm text-slate-500">Full captured pipeline across all forms.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Open Pipeline</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summaryStats.open}</p>
          <p className="mt-1 text-sm text-slate-500">Leads still requiring follow-up or qualification.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Converted</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summaryStats.converted}</p>
          <p className="mt-1 text-sm text-slate-500">Closed successfully inside your internal workflow.</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Stale Leads</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">{summaryStats.stale}</p>
          <p className="mt-1 text-sm text-amber-800">Open for more than 48 hours without closure.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Need Notes</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summaryStats.withoutNotes}</p>
          <p className="mt-1 text-sm text-slate-500">Leads missing internal commentary or next steps.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-4 md:grid-cols-2 xl:w-[55%] xl:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by company, lead ID, product, email..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-earth-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Status</label>
              <Select
                value={filterStatus}
                onChange={(value) => setFilterStatus(value as LeadStatus | "All")}
                options={[{ value: "All", label: "All Statuses" }, ...statusOrder.map((status) => ({ value: status, label: status }))]}
                className="rounded-xl border-slate-200 bg-slate-50 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Age</label>
              <Select
                value={ageFilter}
                onChange={(value) => setAgeFilter(value as AgeFilter)}
                options={[
                  { value: "all", label: "All Time" },
                  { value: "today", label: "Today" },
                  { value: "7d", label: "Last 7 Days" },
                  { value: "30d", label: "Last 30 Days" },
                  { value: "stale", label: "Stale Only" },
                ]}
                className="rounded-xl border-slate-200 bg-slate-50 py-3"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:w-[40%] xl:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Notes</label>
              <Select
                value={noteFilter}
                onChange={(value) => setNoteFilter(value as NoteFilter)}
                options={[
                  { value: "all", label: "All Notes States" },
                  { value: "with-notes", label: "Has Notes" },
                  { value: "needs-notes", label: "Needs Notes" },
                ]}
                className="rounded-xl border-slate-200 bg-slate-50 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">Sort</label>
              <Select
                value={sortOption}
                onChange={(value) => setSortOption(value as SortOption)}
                options={[
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "company", label: "Company A-Z" },
                  { value: "status", label: "Status Order" },
                ]}
                className="rounded-xl border-slate-200 bg-slate-50 py-3"
              />
            </div>
            <div className="flex items-end gap-3">
              <Button
                variant="ghost"
                className="h-12 rounded-xl px-5"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("All");
                  setAgeFilter("all");
                  setNoteFilter("all");
                  setSortOption("newest");
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFilterStatus("All")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                filterStatus === "All" ? "border-earth-300 bg-earth-50 text-earth-700" : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              All {summaryStats.total}
            </button>
            {statusOrder.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                  filterStatus === status ? "border-earth-300 bg-earth-50 text-earth-700" : "border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                {status} {leads.filter((lead) => lead.status === status).length}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <button
              type="button"
              onClick={toggleSelectVisible}
              className="font-semibold text-earth-700 hover:text-earth-800"
            >
              {allVisibleSelected ? "Clear Visible" : "Select Visible"}
            </button>
            <span>{filteredAndSortedLeads.length} visible</span>
            <span>{selectedIds.length} selected</span>
            <button type="button" onClick={() => void fetchLeads()} className="font-semibold text-earth-700 hover:text-earth-800">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {selectedIds.length > 0 ? (
        <div className="rounded-2xl border border-earth-200 bg-earth-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-3 text-sm font-medium text-earth-800">
              <Users size={18} />
              {selectedIds.length} lead{selectedIds.length === 1 ? "" : "s"} selected
            </div>
            <div className="grid gap-4 md:grid-cols-[220px_auto_auto]">
              <Select
                value={bulkStatus}
                onChange={(value) => setBulkStatus(value as LeadStatus)}
                options={statusOrder.map((status) => ({ value: status, label: status }))}
                placeholder="Bulk status"
                className="rounded-xl border-earth-200 bg-white py-3"
              />
              <Button onClick={applyBulkStatus} disabled={!bulkStatus || isBulkUpdating} className="rounded-xl">
                {isBulkUpdating ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                Apply Status
              </Button>
              <Button variant="ghost" className="rounded-xl" onClick={() => setSelectedIds([])}>
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-4 text-slate-600">
              <Loader2 className="h-10 w-10 animate-spin text-earth-500" />
              <p className="font-medium">Loading leads...</p>
            </div>
          </div>
        ) : filteredAndSortedLeads.length > 0 ? (
          filteredAndSortedLeads.map((lead) => {
            const isExpanded = expandedId === lead.id;
            const draftNote = draftNotes[lead.id] ?? "";
            const notesChanged = draftNote !== (lead.notes ?? "");
            const isSavingNotes = savingNoteIds.includes(lead.id);
            const isUpdatingStatus = updatingStatusIds.includes(lead.id);

            return (
              <div
                key={lead.id}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-all duration-300",
                  isExpanded ? "border-earth-300 bg-white shadow-xl ring-1 ring-earth-500/10" : "border-slate-200 bg-white shadow-sm hover:border-earth-200",
                )}
              >
                <div className={cn("px-5 py-4", isExpanded ? "bg-earth-50" : "bg-white")}>
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedSet.has(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-earth-600 focus:ring-earth-500"
                      />
                      <button type="button" onClick={() => setExpandedId(isExpanded ? null : lead.id)} className="flex min-w-0 flex-1 items-start gap-4 text-left">
                        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", isExpanded ? "bg-earth-600 text-white" : "bg-slate-100 text-slate-500")}>
                          <User size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="truncate text-base font-bold text-slate-900">{lead.company || lead.name || lead.id}</h3>
                            <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest", statusColors[lead.status])}>{lead.status}</span>
                            {isStaleLead(lead) ? (
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-amber-700">
                                Stale
                              </span>
                            ) : null}
                            {!draftNote.trim() ? (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                No Notes
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-2 grid gap-2 text-xs text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                            <span className="flex items-center gap-1">
                              <Hash size={12} /> {lead.id}
                            </span>
                            <span className="flex items-center gap-1 break-all">
                              <Mail size={12} /> {lead.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays size={12} /> {formatRelativeTime(lead.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquareText size={12} /> {lead.productInterest || "General inquiry"}
                            </span>
                          </div>
                        </div>
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-[200px]">
                        <Select
                          value={lead.status}
                          onChange={(value) => handleStatusChange(lead.id, value as LeadStatus)}
                          options={statusOrder.map((status) => ({ value: status, label: status }))}
                          className={cn("rounded-xl py-3 text-xs font-bold", statusColors[lead.status])}
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="h-11 rounded-xl bg-white px-4"
                        onClick={() =>
                          copyToClipboard(
                            [
                              `Lead ${lead.id}`,
                              `Company: ${safeValue(lead.company)}`,
                              `Name: ${safeValue(lead.name)}`,
                              `Email: ${safeValue(lead.email)}`,
                              `Phone: ${safeValue(lead.phone)}`,
                              `Telegram: ${safeValue(lead.telegram)}`,
                              `Product: ${safeValue(lead.productInterest)}`,
                              `Volume: ${safeValue(lead.estTonnage)}`,
                              `Status: ${lead.status}`,
                              `Message: ${safeValue(lead.message)}`,
                              `Notes: ${safeValue(draftNote || lead.notes)}`,
                            ].join("\n"),
                            "Lead summary",
                          )
                        }
                      >
                        <Clipboard size={15} className="mr-2" />
                        Copy
                      </Button>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-earth-200 hover:text-earth-700"
                      >
                        {isUpdatingStatus ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <ChevronDown size={20} className={cn("transition-transform", isExpanded ? "rotate-180" : "")} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <motion.div
                      key="details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden border-t border-earth-100 bg-slate-50/70"
                    >
                      <div className="space-y-8 p-6 sm:p-8">
                        <div className="grid gap-6 lg:grid-cols-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                              <User size={16} className="text-earth-600" />
                              <h4 className="font-bold text-slate-900">Contact Details</h4>
                            </div>
                            <div className="space-y-4 text-sm text-slate-600">
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                                    <Mail size={14} />
                                    Email
                                  </span>
                                  <button type="button" onClick={() => void copyToClipboard(lead.email || "", "Email")} className="text-xs font-semibold text-earth-700 hover:text-earth-800">
                                    Copy
                                  </button>
                                </div>
                                <p className="break-all">{safeValue(lead.email)}</p>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                                    <Phone size={14} />
                                    Phone
                                  </span>
                                  <button type="button" onClick={() => void copyToClipboard(lead.phone || "", "Phone")} className="text-xs font-semibold text-earth-700 hover:text-earth-800">
                                    Copy
                                  </button>
                                </div>
                                <p>{safeValue(lead.phone)}</p>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                                    <MessageSquareText size={14} />
                                    Telegram
                                  </span>
                                  <button type="button" onClick={() => void copyToClipboard(lead.telegram || "", "Telegram")} className="text-xs font-semibold text-earth-700 hover:text-earth-800">
                                    Copy
                                  </button>
                                </div>
                                <p>{safeValue(lead.telegram)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                              <CalendarDays size={16} className="text-earth-600" />
                              <h4 className="font-bold text-slate-900">Inquiry Snapshot</h4>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Received</p>
                                <p className="mt-1 font-semibold text-slate-900">{formatDate(lead.date)}</p>
                                <p className="mt-1 text-slate-500">{formatRelativeTime(lead.date)}</p>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Product Interest</p>
                                <p className="mt-1 font-semibold text-slate-900">{safeValue(lead.productInterest)}</p>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Estimated Volume</p>
                                <p className="mt-1 font-semibold text-slate-900">{safeValue(lead.estTonnage)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                              <NotebookPen size={16} className="text-earth-600" />
                              <h4 className="font-bold text-slate-900">Internal Shortcuts</h4>
                            </div>
                            <div className="space-y-3">
                              <button
                                type="button"
                                onClick={() => appendNoteTemplate(lead.id, "First response logged")}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-earth-200 hover:bg-earth-50"
                              >
                                <span>Log first response</span>
                                <CheckCircle2 size={16} className="text-earth-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => appendNoteTemplate(lead.id, "Samples requested")}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-earth-200 hover:bg-earth-50"
                              >
                                <span>Mark samples requested</span>
                                <Clipboard size={16} className="text-earth-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => appendNoteTemplate(lead.id, "Waiting on buyer feedback")}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-earth-200 hover:bg-earth-50"
                              >
                                <span>Waiting on buyer feedback</span>
                                <AlertTriangle size={16} className="text-amber-600" />
                              </button>
                              <button
                                type="button"
                                onClick={() => appendNoteTemplate(lead.id, "Qualified for pricing review")}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-earth-200 hover:bg-earth-50"
                              >
                                <span>Qualified for pricing review</span>
                                <Users size={16} className="text-earth-600" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <MessageSquareText size={16} className="text-earth-600" />
                                <h4 className="font-bold text-slate-900">Incoming Message</h4>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl bg-white"
                                onClick={() => void copyToClipboard(lead.message || "", "Message")}
                              >
                                <Clipboard size={14} className="mr-2" />
                                Copy Message
                              </Button>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                {lead.message?.trim() || "No message was supplied with this lead."}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <NotebookPen size={16} className="text-earth-600" />
                                <h4 className="font-bold text-slate-900">Internal Notes</h4>
                              </div>
                              {notesChanged ? (
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-700">
                                  Unsaved
                                </span>
                              ) : (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                                  Saved
                                </span>
                              )}
                            </div>
                            {isStaleLead(lead) ? (
                              <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                <p>This lead is stale. Add a note and move the status if it is still active.</p>
                              </div>
                            ) : null}
                            <textarea
                              rows={12}
                              value={draftNote}
                              onChange={(e) => setDraftNotes((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                              placeholder="Use this area for qualification notes, handoff context, pricing progress, and next steps."
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition-all focus:border-earth-500"
                            />
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs text-slate-500">
                                Internal only. This page does not send email, phone, or Telegram actions.
                              </p>
                              <div className="flex flex-wrap gap-3">
                                <Button
                                  variant="ghost"
                                  className="rounded-xl"
                                  onClick={() => setDraftNotes((prev) => ({ ...prev, [lead.id]: lead.notes || "" }))}
                                  disabled={!notesChanged}
                                >
                                  Revert
                                </Button>
                                <Button
                                  className="rounded-xl"
                                  onClick={() => handleSaveNotes(lead.id)}
                                  disabled={!notesChanged || isSavingNotes}
                                >
                                  {isSavingNotes ? <Loader2 size={16} className="mr-2 animate-spin" /> : <CheckCircle2 size={16} className="mr-2" />}
                                  Save Notes
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex max-w-md flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Users size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">No leads yet</h3>
                <p className="text-sm text-slate-500">
                  New inquiries from the website will appear here as soon as visitors submit a form.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl bg-white"
                onClick={() => void fetchLeads()}
              >
                Refresh Leads
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex max-w-md flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Filter size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">No leads match the current filters</h3>
                <p className="text-sm text-slate-500">
                  Adjust the search, status, age, or notes filters to bring leads back into view.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl bg-white"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("All");
                  setAgeFilter("all");
                  setNoteFilter("all");
                  setSortOption("newest");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3 text-sm text-slate-600">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-earth-600" />
          <p>Internal-only workflow tools enabled. No outbound email, call, or Telegram actions are exposed from this page.</p>
        </div>
      </div>
    </div>
  );
}
