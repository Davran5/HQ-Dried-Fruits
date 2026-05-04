import { useState, useRef, useEffect, type FormEvent } from "react";

const UNLOCK_KEY = "hq_site_unlocked";

interface ComingSoonProps {
  onUnlock: () => void;
}

export function ComingSoon({ onUnlock }: ComingSoonProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [clickCount, setClickCount] = useState(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPasswordModal && passwordInputRef.current) {
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    }
  }, [showPasswordModal]);

  // Hidden triple-click in top-left to open password modal
  function handleLogoClick() {
    const next = clickCount + 1;
    setClickCount(next);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (next >= 3) {
      setClickCount(0);
      setShowPasswordModal(true);
      setPassword("");
      setPasswordError("");
    } else {
      clickTimer.current = setTimeout(() => setClickCount(0), 1200);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password) return;
    
    setIsVerifying(true);
    setPasswordError("");
    
    try {
      const res = await fetch("/api/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem(UNLOCK_KEY, "1");
        setShowPasswordModal(false);
        onUnlock();
      } else {
        setPasswordError("Incorrect password. Please try again.");
        setPassword("");
        passwordInputRef.current?.focus();
      }
    } catch {
      setPasswordError("Server error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    setFormState("sending");
    try {
      const res = await fetch("/api/coming-soon-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      setFormState("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setFormState("error");
    }
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-bg-primary text-earth-900 font-sans relative">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-2 shrink-0 z-10 relative">
        {/* INVISIBLE hidden button — triple click to unlock */}
        <button
          className="opacity-0 hover:opacity-10 focus:opacity-10 transition-opacity p-2 flex flex-col items-start select-none outline-none"
          onClick={handleLogoClick}
          aria-label="Brand logo"
          tabIndex={-1}
        >
          <span className="font-display font-bold text-lg leading-none text-earth-900">HQ</span>
          <span className="text-[9px] font-medium tracking-widest text-earth-600 uppercase">DRIED FRUITS</span>
        </button>
        <a href="mailto:info@hqdriedfruits.uz" className="text-xs font-medium text-earth-600 hover:text-earth-900 transition-colors border-b border-earth-200 hover:border-earth-900 pb-0.5">
          info@hqdriedfruits.uz
        </a>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 text-center z-10 relative overflow-hidden">
        
        <div className="flex flex-col items-center justify-center h-full max-w-5xl w-full">
          {/* Headline */}
          <div className="shrink-0 mb-4 md:mb-6">
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-2 md:mb-3 tracking-tight">
              <span className="block text-earth-800">We are still</span>
              <span className="block text-mint-700">planting the seeds</span>
            </h1>

            <p className="text-sm md:text-base text-earth-700 max-w-lg mx-auto leading-relaxed m-0">
              The website will be ready soon — have patience,<br className="hidden md:inline" />
              and something truly beautiful will grow.
            </p>
          </div>

          {/* Contact section */}
          <div className="w-full shrink grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 items-center bg-white/60 backdrop-blur-sm p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-earth-100 text-left">
            {/* Left: info */}
            <div className="flex flex-col gap-2 md:gap-3">
              <h2 className="font-display text-xl md:text-2xl font-bold text-earth-900 m-0">Get in touch early</h2>
              <p className="text-xs md:text-sm text-earth-700 leading-relaxed m-0">
                We export premium sun-dried fruits from the heart of Uzbekistan. If you're a wholesale buyer or distributor, reach out — we'll respond directly.
              </p>
              <a href="mailto:info@hqdriedfruits.uz" className="inline-flex items-center gap-2 bg-earth-50 border border-earth-200 text-earth-800 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-medium hover:bg-earth-100 hover:border-earth-300 transition-all w-fit mt-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 7l10 7 10-7" />
                </svg>
                info@hqdriedfruits.uz
              </a>
            </div>

            {/* Right: form */}
            <form className="flex flex-col gap-2 md:gap-3" onSubmit={handleFormSubmit}>
              {formState === "success" ? (
                <div className="flex flex-col items-center justify-center gap-2 md:gap-3 p-4 md:p-8 text-center h-full min-h-[150px] md:min-h-[200px]">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center text-lg md:text-xl font-bold">
                    ✓
                  </div>
                  <p className="text-earth-800 font-medium text-xs md:text-sm">Message received! We'll be in touch soon.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    <label className="flex flex-col gap-1 md:gap-1.5 text-[10px] md:text-xs font-semibold text-earth-600 uppercase tracking-wide">
                      Your Name
                      <input
                        className="bg-white border border-earth-200 rounded-lg text-earth-900 text-xs md:text-sm px-3 py-2 md:px-3.5 md:py-2.5 outline-none focus:border-earth-500 focus:ring-1 focus:ring-earth-500 transition-shadow w-full placeholder:text-earth-300"
                        type="text"
                        placeholder="Full name"
                        value={formData.name}
                        required
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      />
                    </label>
                    <label className="flex flex-col gap-1 md:gap-1.5 text-[10px] md:text-xs font-semibold text-earth-600 uppercase tracking-wide">
                      Email Address
                      <input
                        className="bg-white border border-earth-200 rounded-lg text-earth-900 text-xs md:text-sm px-3 py-2 md:px-3.5 md:py-2.5 outline-none focus:border-earth-500 focus:ring-1 focus:ring-earth-500 transition-shadow w-full placeholder:text-earth-300"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        required
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1 md:gap-1.5 text-[10px] md:text-xs font-semibold text-earth-600 uppercase tracking-wide">
                    Message
                    <textarea
                      className="bg-white border border-earth-200 rounded-lg text-earth-900 text-xs md:text-sm px-3 py-2 md:px-3.5 md:py-2.5 outline-none focus:border-earth-500 focus:ring-1 focus:ring-earth-500 transition-shadow w-full resize-none placeholder:text-earth-300"
                      placeholder="Tell us about your business or inquiry..."
                      rows={2}
                      value={formData.message}
                      required
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    />
                  </label>
                  {formState === "error" && (
                    <p className="text-red-500 text-[10px] md:text-xs m-0">Something went wrong. Please email us directly.</p>
                  )}
                  <button 
                    className="mt-1 md:mt-2 w-full bg-earth-900 text-white font-medium text-xs md:text-sm py-2 md:py-3 rounded-lg hover:bg-earth-800 disabled:opacity-70 transition-colors flex items-center justify-center gap-1.5 md:gap-2 shadow-sm shrink-0"
                    type="submit" 
                    disabled={formState === "sending"}
                  >
                    {formState === "sending" ? (
                      <span className="animate-spin text-sm md:text-lg leading-none">◌</span>
                    ) : (
                      <>Send Message <span className="text-sm md:text-base leading-none">→</span></>
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="shrink-0 py-2 md:py-4 text-center text-[10px] md:text-xs text-earth-500 z-10 relative">
        <p className="m-0">© {new Date().getFullYear()} HQ Dried Fruits · Tashkent, Uzbekistan</p>
      </footer>

      {/* Password modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-earth-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white border border-earth-100 rounded-2xl p-6 md:p-8 w-full max-w-sm flex flex-col gap-3 md:gap-4 items-center text-center shadow-xl relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-earth-400 hover:text-earth-900 transition-colors" onClick={() => setShowPasswordModal(false)} aria-label="Close">
              ✕
            </button>
            <div className="text-2xl md:text-3xl mb-0 md:mb-1">🔑</div>
            <h3 className="font-display text-xl md:text-2xl font-bold text-earth-900 m-0">Staff Access</h3>
            <p className="text-xs md:text-sm text-earth-600 m-0 mb-1 md:mb-2">Enter your access password to preview the live site.</p>
            <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-2 md:gap-3">
              <input
                ref={passwordInputRef}
                className="bg-earth-50 border border-earth-200 rounded-lg text-earth-900 text-center text-sm md:text-base tracking-widest px-3 py-2 md:px-4 md:py-3 outline-none focus:border-earth-500 focus:ring-1 focus:ring-earth-500 w-full"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPasswordError(""); }}
                autoComplete="current-password"
              />
              {passwordError && <p className="text-red-500 text-[10px] md:text-xs m-0">{passwordError}</p>}
              <button 
                className="w-full bg-earth-900 text-white font-medium text-xs md:text-sm py-2.5 md:py-3 rounded-lg hover:bg-earth-800 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2" 
                type="submit"
                disabled={isVerifying}
              >
                {isVerifying ? <span className="animate-spin text-sm leading-none">◌</span> : "Unlock Site"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function isUnlocked(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}
