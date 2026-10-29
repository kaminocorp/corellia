import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { App } from "./app/App";

const params = new URLSearchParams(window.location.search);
if (params.get("kiosk") === "1") {
  document.documentElement.dataset.kiosk = "1";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
