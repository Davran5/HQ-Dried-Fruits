import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Edit2, X, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

interface TimelineStep {
  id: string;
  year: string;
  title: string;
  description: string;
}

interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  yearsExperience: string;
  exportVolume: string;
  supplyReachDescription: string;
}

interface AboutContent {
  marqueeHeadline: string;
  timeline: TimelineStep[];
}

interface Page {
  id: string;
  name: string;
  path: string;
  content?: HomeContent | AboutContent | any;
}

const initialPages: Page[] = [
  {
    id: "home",
    name: "Home",
    path: "/",
    content: {
      heroTitle: "Nature's Sweetness, Sun-Dried to Perfection.",
      heroSubtitle: "Premium quality dried fruits from the heart of Uzbekistan. We export the finest apricots, raisins, and prunes to global B2B partners.",
      yearsExperience: "25+",
      exportVolume: "10k+",
      supplyReachDescription: "We bridge the gap between traditional farming and modern global supply chains, ensuring consistent quality, volume, and timely delivery for our B2B partners."
    } as HomeContent
  },
  {
    id: "about",
    name: "About Us",
    path: "/about",
    content: {
      marqueeHeadline: "Decades of expertise in every harvest. Uncompromised quality from farm to facility.",
      timeline: [
        { id: "1", year: "1998", title: "The First Harvest", description: "Started as a small family farm in the Fergana Valley." },
        { id: "2", year: "2005", title: "Facility Expansion", description: "Built our first modern drying and sorting facility." },
        { id: "3", year: "2012", title: "Global Export Begins", description: "Reached our first international B2B partners in Europe." },
        { id: "4", year: "2023", title: "Modernization", description: "Implemented state-of-the-art optical sorting technology." }
      ]
    } as AboutContent
  }
];

export function AdminPages() {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleEdit = (page: Page) => {
    setEditingPage(JSON.parse(JSON.stringify(page))); // Deep copy
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingPage(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      setPages(pages.map(p => p.id === editingPage.id ? editingPage : p));
      setShowToast(true);
    }
    handleClose();
  };

  const renderHomeContentEditor = () => {
    if (!editingPage || editingPage.id !== "home") return null;
    const content = editingPage.content as HomeContent;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hero Title</label>
          <input 
            type="text" 
            value={content.heroTitle}
            onChange={e => setEditingPage({ ...editingPage, content: { ...content, heroTitle: e.target.value } })}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hero Subtitle</label>
          <textarea 
            rows={3}
            value={content.heroSubtitle}
            onChange={e => setEditingPage({ ...editingPage, content: { ...content, heroSubtitle: e.target.value } })}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience (Number)</label>
            <input 
              type="text" 
              value={content.yearsExperience}
              onChange={e => setEditingPage({ ...editingPage, content: { ...content, yearsExperience: e.target.value } })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Export Volume (Number)</label>
            <input 
              type="text" 
              value={content.exportVolume}
              onChange={e => setEditingPage({ ...editingPage, content: { ...content, exportVolume: e.target.value } })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Supply Reach Description</label>
          <textarea 
            rows={3}
            value={content.supplyReachDescription}
            onChange={e => setEditingPage({ ...editingPage, content: { ...content, supplyReachDescription: e.target.value } })}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all resize-none"
          />
        </div>
      </div>
    );
  };

  const renderAboutContentEditor = () => {
    if (!editingPage || editingPage.id !== "about") return null;
    const content = editingPage.content as AboutContent;

    const updateTimelineStep = (id: string, field: keyof TimelineStep, value: string) => {
      const newTimeline = content.timeline.map(step => 
        step.id === id ? { ...step, [field]: value } : step
      );
      setEditingPage({ ...editingPage, content: { ...content, timeline: newTimeline } });
    };

    const removeTimelineStep = (id: string) => {
      const newTimeline = content.timeline.filter(step => step.id !== id);
      setEditingPage({ ...editingPage, content: { ...content, timeline: newTimeline } });
    };

    const addTimelineStep = () => {
      const newStep: TimelineStep = { id: Date.now().toString(), year: "", title: "", description: "" };
      setEditingPage({ ...editingPage, content: { ...content, timeline: [...content.timeline, newStep] } });
    };

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Marquee Headline</label>
          <input 
            type="text" 
            value={content.marqueeHeadline}
            onChange={e => setEditingPage({ ...editingPage, content: { ...content, marqueeHeadline: e.target.value } })}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-earth-500 focus:ring-2 focus:ring-earth-500/20 outline-none transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700">Company Heritage Timeline</label>
            <Button type="button" size="sm" variant="outline" onClick={addTimelineStep} className="h-8 text-xs">
              <Plus size={14} className="mr-1" /> Add Step
            </Button>
          </div>
          
          <div className="space-y-4">
            {content.timeline.map((step, index) => (
              <div key={step.id} className="relative rounded-lg border border-slate-200 bg-slate-50 p-4">
                <button 
                  type="button"
                  onClick={() => removeTimelineStep(step.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid gap-4 sm:grid-cols-3 pr-8">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
                    <input 
                      type="text" 
                      value={step.year}
                      onChange={e => updateTimelineStep(step.id, "year", e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                      placeholder="e.g. 1998"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                    <input 
                      type="text" 
                      value={step.title}
                      onChange={e => updateTimelineStep(step.id, "title", e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none"
                      placeholder="e.g. The First Harvest"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                    <textarea 
                      rows={2}
                      value={step.description}
                      onChange={e => updateTimelineStep(step.id, "description", e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-earth-500 outline-none resize-none"
                      placeholder="Description of this milestone..."
                    />
                  </div>
                </div>
              </div>
            ))}
            {content.timeline.length === 0 && (
              <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg">
                No timeline steps. Click "Add Step" to create one.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg border border-emerald-200"
          >
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span className="text-sm font-medium">Successfully Updated</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pages & Content</h2>
          <p className="text-sm text-slate-500">Manage content for your main website pages.</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Page Name</th>
                <th className="px-6 py-4 font-medium">Path</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">{page.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{page.path}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(page)}
                        className="p-2 text-slate-400 hover:text-earth-600 hover:bg-earth-50 rounded-lg transition-colors flex items-center gap-1"
                        title="Edit Page Content"
                      >
                        <Edit2 size={16} />
                        <span className="text-xs font-medium">Edit Content</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && editingPage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={handleClose}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl"
            >
              <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md rounded-t-2xl">
                <h3 className="text-xl font-bold text-slate-900">
                  Edit Page Content: {editingPage.name}
                </h3>
                <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <form id="page-edit-form" onSubmit={handleSave} className="p-6">
                  {editingPage.content && (
                    <div className="space-y-6">
                      {editingPage.id === "home" && renderHomeContentEditor()}
                      {editingPage.id === "about" && renderAboutContentEditor()}
                    </div>
                  )}
                </form>
              </div>

              <div className="flex-none flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-600 hover:bg-slate-200">
                  Cancel
                </Button>
                <Button type="submit" form="page-edit-form" className="bg-earth-600 hover:bg-earth-700 text-white">
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

