import { Link } from "react-router-dom";
import { Leaf, MapPin, Phone, Mail, Send } from "lucide-react";
import { Button } from "@/src/components/ui/Button";

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden bg-earth-900 pt-32 pb-12 text-earth-50">
      {/* Organic top border using SVG */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block h-[100px] w-full"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-bg-primary"
          ></path>
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand & Info */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 group mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-earth-600 text-white transition-transform group-hover:rotate-12">
                <Leaf size={24} />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Uzbek<span className="text-earth-500">Sun</span>
              </span>
            </Link>
            <p className="mb-8 text-earth-200 leading-relaxed max-w-sm">
              Premium sun-dried fruits from the heart of Uzbekistan. Exporting nature's sweetness to global B2B partners with uncompromising quality.
            </p>
            <div className="flex flex-col gap-4 text-earth-200">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-earth-500" />
                <span>123 Silk Road Ave, Tashkent, Uzbekistan</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-earth-500" />
                <span>+998 90 123 45 67</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-earth-500" />
                <span>export@uzbeksun.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="mb-6 font-display text-lg font-semibold text-white">Company</h3>
            <ul className="flex flex-col gap-3">
              {["Home", "About Us", "Products", "Export & Logistics", "Contacts"].map((item) => (
                <li key={item}>
                  <Link
                    to={item === "Home" ? "/" : `/${item.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                    className="text-earth-200 transition-colors hover:text-earth-500"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lead Capture Form */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-earth-800/50 p-8 backdrop-blur-sm border border-earth-700/50">
              <h3 className="mb-2 font-display text-xl font-semibold text-white">Request Wholesale Catalog</h3>
              <p className="mb-6 text-sm text-earth-300">Get our latest pricing and export terms directly to your inbox or Telegram.</p>
              
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full rounded-xl bg-earth-900/50 px-4 py-3 text-white placeholder-earth-400 outline-none focus:ring-2 focus:ring-earth-500 transition-all border border-earth-700"
                />
                <div className="flex gap-4">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full rounded-xl bg-earth-900/50 px-4 py-3 text-white placeholder-earth-400 outline-none focus:ring-2 focus:ring-earth-500 transition-all border border-earth-700"
                  />
                  <Button type="button" className="shrink-0 px-8" onClick={() => window.location.href = '#telegram-bot-integration'}>
                    <Send size={18} className="mr-2" />
                    Send
                  </Button>
                </div>
                <p className="text-xs text-earth-400 mt-2">
                  Prefer instant chat? <a href="#telegram-bot-integration" className="text-earth-500 hover:underline">Contact us on Telegram</a>.
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-earth-800 pt-8 sm:flex-row">
          <p className="text-sm text-earth-400">
            © {new Date().getFullYear()} UzbekSun Dried Fruits. All rights reserved.
          </p>
          <div className="mt-4 flex gap-4 sm:mt-0">
            <Link to="/admin" className="text-sm text-earth-400 hover:text-earth-200">Admin Panel</Link>
            <Link to="/privacy" className="text-sm text-earth-400 hover:text-earth-200">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-earth-400 hover:text-earth-200">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
