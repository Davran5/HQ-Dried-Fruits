/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Products } from "./pages/Products";
import { Export } from "./pages/Export";
import { Contacts } from "./pages/Contacts";
import { ProductDetail } from "./pages/ProductDetail";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { AdminProducts } from "./pages/admin/Products";
import { AdminPages } from "./pages/admin/Pages";
import { AdminLeads } from "./pages/admin/Leads";
import { AdminSeoSettings } from "./pages/admin/SeoSettings";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/export" element={<Export />} />
        <Route path="/contacts" element={<Contacts />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="seo" element={<AdminSeoSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}









