import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Filter, ArrowDownUp, X, MessageSquare, 
  Phone, Mail, Building2, Calendar, FileText, Send
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";

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

const mockLeads: Lead[] = [
  {
    id: "L-1001",
    date: "2026-03-05T14:30:00Z",
    name: "Elena Rostova",
    company: "EuroFoods Import LLC",
    email: "elena.r@eurofoods.example.com",
    phone: "+49 151 2345 6789",
    telegram: "@elenarostova",
    productInterest: "Sun-Dried Apricots (Jumbo)",
    estTonnage: "5 Tons / month",
    status: "New",
    message: "We are looking for a reliable supplier of Jumbo size sun-dried apricots for our premium retail line in Germany. Please provide your latest FOB pricing and specifications.",
    notes: ""
  },
  {
    id: "L-1002",
    date: "2026-03-04T09:15:00Z",
    name: "Ahmed Al-Fayed",
    company: "Gulf Traders",
    email: "ahmed@gulftraders.example.ae",
    phone: "+971 50 123 4567",
    productInterest: "Black Raisins",
    estTonnage: "10 Tons / quarter",
    status: "In Progress",
    message: "Interested in your shadow-dried black raisins. Do you have Halal certification and what is the lead time for shipping to Dubai?",
    notes: "Sent pricing catalog on March 4th. Waiting for their quality team to review."
  },
  {
    id: "L-1003",
    date: "2026-03-02T16:45:00Z",
    name: "Sarah Jenkins",
    company: "HealthySnacks Co.",
    email: "s.jenkins@healthysnacks.example.co.uk",
    phone: "+44 7700 900077",
    telegram: "sjenkins_uk",
    productInterest: "Pitted Prunes",
    estTonnage: "2 Tons / month",
    status: "Converted",
    message: "Looking to add pitted prunes to our organic snack box subscription. Need samples first.",
    notes: "Samples approved. First contract signed for 2 tons monthly."
  },
  {
    id: "L-1004",
    date: "2026-03-06T08:20:00Z",
    name: "Dmitry Volkov",
    company: "Vostok Retail Group",
    email: "d.volkov@vostok.example.ru",
    phone: "+7 903 123 45 67",
    productInterest: "Mixed Dried Fruits",
    estTonnage: "20 Tons / month",
    status: "New",
    message: "We need large volumes of mixed dried fruits for our supermarket chain. Price is the main factor.",
    notes: ""
  }
];

const statusColors: Record<LeadStatus, string> = {
  "New": "bg-blue-100 text-blue-800 border-blue-200",
  "Contacted": "bg-purple-100 text-purple-800 border-purple-200",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
  "Converted": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Disqualified": "bg-slate-100 text-slate-800 border-slate-200"
};

/**
 * PLACEHOLDER: Backend Webhook Integration
 * This function simulates where the backend webhook will be placed.
 * In a production environment, when a user submits a form on the frontend,
 * the backend will receive the payload and trigger a Telegram Bot API call
 * to notify the business owner instantly.
 * 
 * Example Backend Flow (Node.js/Express):
 * app.post('/api/leads', async (req, res) => {
 *   const newLead = await database.createLead(req.body);
 *   
 *   // Trigger Telegram Bot Webhook
 *   const botToken = process.env.TELEGRAM_BOT_TOKEN;
 *   const chatId = process.env.OWNER_CHAT_ID;
 *   const text = `🚨 New Lead: ${newLead.name} from ${newLead.company}\nProduct: ${newLead.productInterest}\nTonnage: ${newLead.estTonnage}`;
 *   
 *   await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ chat_id: chatId, text })
 *   });
 *   
 *   res.status(200).json({ success: true });
 * });
 */
export const notifyOwnerViaTelegram = async (lead: Lead) => {
  console.log("Webhook triggered: Notifying owner via Telegram bot...", lead);
};

export function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "All">("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Format Date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  // Telegram Link Generator
  const getTelegramLink = (lead: Lead) => {
    if (lead.telegram) {
      const handle = lead.telegram.replace('@', '');
      return `https://t.me/${handle}`;
    }
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/\D/g, '');
      return `https://t.me/+${cleanPhone}`;
    }
    return null;
  };

  // Filter and Sort Logic
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];
    
    if (filterStatus !== "All") {
      result = result.filter(lead => lead.status === filterStatus);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [leads, filterStatus, sortOrder]);

  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const handleNotesChange = (id: string, newNotes: string) => {
    setLeads(leads.map(lead => lead.id === id ? { ...lead, notes: newNotes } : lead));
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, notes: newNotes });
    }
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leads & Inquiries</h2>
          <p className="text-sm text-slate-500">Manage your incoming sales pipeline and wholesale requests.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as LeadStatus | "All")}
              className="pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-earth-500/20 focus:border-earth-500 appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Converted">Converted</option>
              <option value="Disqualified">Disqualified</option>
            </select>
          </div>
          
          <Button 
            variant="outline" 
            className="bg-white"
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          >
            <ArrowDownUp size={16} className="mr-2 text-slate-400" />
            {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Date</th>
                <th className="px-6 py-4 font-medium">Lead / Company</th>
                <th className="px-6 py-4 font-medium">Contact Info</th>
                <th className="px-6 py-4 font-medium">Interest & Volume</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {formatDate(lead.date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{lead.name}</div>
                    <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 size={12} /> {lead.company}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900">{lead.email}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{lead.productInterest}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{lead.estTonnage}</div>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border outline-none cursor-pointer appearance-none pr-6 relative ${statusColors[lead.status]}`}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.25rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Converted">Converted</option>
                      <option value="Disqualified">Disqualified</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredAndSortedLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedLead(null)}
              className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%", opacity: 0.5 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Lead Details</h3>
                  <p className="text-xs text-slate-500">ID: {selectedLead.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedLead(null)} 
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Header Info */}
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedLead.name}</h2>
                      <div className="flex items-center gap-2 text-slate-600 mt-1">
                        <Building2 size={16} />
                        <span className="font-medium">{selectedLead.company}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[selectedLead.status]}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="flex flex-col gap-3">
                  {getTelegramLink(selectedLead) && (
                    <a 
                      href={getTelegramLink(selectedLead)!} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#0088cc] hover:bg-[#0077b3] text-white py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                      <Send size={18} />
                      Chat on Telegram
                    </a>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <a href={`mailto:${selectedLead.email}`} className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors">
                      <Mail size={16} /> Email
                    </a>
                    <a href={`tel:${selectedLead.phone}`} className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors">
                      <Phone size={16} /> Call
                    </a>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Calendar size={14}/> Date Received</p>
                    <p className="text-sm text-slate-900 font-medium">{formatDate(selectedLead.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Phone size={14}/> Phone / Telegram</p>
                    <p className="text-sm text-slate-900 font-medium">{selectedLead.phone}</p>
                    {selectedLead.telegram && <p className="text-xs text-slate-500">{selectedLead.telegram}</p>}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><FileText size={14}/> Product Interest</p>
                    <p className="text-sm text-slate-900 font-medium">{selectedLead.productInterest}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><ArrowDownUp size={14}/> Est. Tonnage</p>
                    <p className="text-sm text-slate-900 font-medium">{selectedLead.estTonnage}</p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <MessageSquare size={16} className="text-earth-500" />
                    Original Message
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedLead.message}
                  </div>
                </div>

                {/* Internal Notes */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Internal Notes</h4>
                  <textarea 
                    rows={4}
                    value={selectedLead.notes}
                    onChange={(e) => handleNotesChange(selectedLead.id, e.target.value)}
                    placeholder="Add notes about this lead..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-2">Notes are saved automatically.</p>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
