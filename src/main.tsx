import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root");
const initialData = window.__HQ_PUBLIC_BOOTSTRAP__ ?? null;

if (!container) {
  throw new Error("Root container not found");
}

const app = (
  <StrictMode>
    <App initialData={initialData} />
  </StrictMode>
);

if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
