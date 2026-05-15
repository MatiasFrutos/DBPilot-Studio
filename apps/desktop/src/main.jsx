import React from "react";
import { createRoot } from "react-dom/client";

import App from "./app/App.jsx";

import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("DBPilot Studio no pudo encontrar el contenedor #root.");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);