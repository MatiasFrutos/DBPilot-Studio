import { useEffect, useState } from "react";

import Sidebar from "../components/sidebar/Sidebar.jsx";
import Topbar from "../components/topbar/Topbar.jsx";

import WelcomePage from "../pages/welcome/WelcomePage.jsx";
import ConnectionsPage from "../pages/connections/ConnectionsPage.jsx";
import ExplorerPage from "../pages/explorer/ExplorerPage.jsx";
import TableDataPage from "../pages/table-data/TableDataPage.jsx";
import TableStructurePage from "../pages/table-structure/TableStructurePage.jsx";
import SqlRunnerPage from "../pages/sql-runner/SqlRunnerPage.jsx";
import SnippetsPage from "../pages/snippets/SnippetsPage.jsx";
import HistoryPage from "../pages/history/HistoryPage.jsx";
import ReportsPage from "../pages/reports/ReportsPage.jsx";
import SettingsPage from "../pages/settings/SettingsPage.jsx";

import { APP_NAME } from "../app/app.constants.js";

import "./app-shell.css";

/* =========================================================
   DBPilot Studio
   AppShell Component
   ---------------------------------------------------------
   Contenedor principal de la aplicación.

   Responsabilidades:
   - Renderizar layout base: Sidebar + Topbar + Content.
   - Persistir estado del sidebar colapsado.
   - Resolver qué página mostrar según la ruta activa.
   - Inyectar estado del bridge hacia la UI.
   ========================================================= */

const SIDEBAR_STORAGE_KEY = "dbpilot_sidebar_collapsed";

export default function AppShell({ activeRoute, currentRoute, onNavigate }) {
  const bridgeStatus = getBridgeStatus();

  /* =======================================================
     SIDEBAR STATE
     -------------------------------------------------------
     Se guarda en localStorage para respetar la última preferencia
     visual del usuario entre recargas.
     ======================================================= */

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;

    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(sidebarCollapsed)
    );
  }, [sidebarCollapsed]);

  function handleToggleSidebar() {
    setSidebarCollapsed((current) => !current);
  }

  return (
    <div
      className={[
        "dbp-shell",
        sidebarCollapsed ? "dbp-shell--sidebar-collapsed" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Sidebar
        activeRoute={activeRoute}
        bridgeStatus={bridgeStatus}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={handleToggleSidebar}
        onNavigate={onNavigate}
      />

      <main className="dbp-shell__main">
        <Topbar
          title={currentRoute.title}
          description={currentRoute.description}
          routeLabel={currentRoute.label}
        />

        <section className="dbp-shell__content">
          {renderPage({
            activeRoute,
            onNavigate,
            bridgeStatus
          })}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   PAGE RESOLVER
   ---------------------------------------------------------
   Resuelve qué página renderizar según la ruta activa.
   Se mantiene simple para que el routing sea fácil de auditar.
   ========================================================= */

function renderPage({ activeRoute, onNavigate, bridgeStatus }) {
  switch (activeRoute) {
    case "welcome":
      return (
        <WelcomePage
          bridgeStatus={bridgeStatus}
          onNavigate={onNavigate}
        />
      );

    case "connections":
      return <ConnectionsPage onNavigate={onNavigate} />;

    case "explorer":
      return <ExplorerPage onNavigate={onNavigate} />;

    case "table-data":
      return <TableDataPage />;

    case "table-structure":
      return <TableStructurePage />;

    case "sql-runner":
      return <SqlRunnerPage />;

    case "snippets":
      return <SnippetsPage />;

    case "history":
      return <HistoryPage />;

    case "reports":
      return <ReportsPage />;

    case "settings":
      return <SettingsPage />;

    default:
      return (
        <FallbackPage
          title={APP_NAME}
          description="Ruta no encontrada dentro de DBPilot Studio."
        />
      );
  }
}

/* =========================================================
   FALLBACK PAGE
   ---------------------------------------------------------
   Vista de seguridad para rutas inexistentes o módulos
   todavía no conectados al router.
   ========================================================= */

function FallbackPage({ title, description }) {
  return (
    <section className="dbp-fallback-page">
      <div className="dbp-fallback-page__icon">▣</div>

      <div>
        <span>Módulo preparado</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}

/* =========================================================
   BRIDGE STATUS
   ---------------------------------------------------------
   Valida si el bridge de Electron está disponible.
   Esto permite mostrar estados reales en sidebar y páginas.
   ========================================================= */

function getBridgeStatus() {
  if (typeof window === "undefined") {
    return {
      ok: false,
      label: "Bridge no disponible"
    };
  }

  if (!window.dbpilot?.app?.ping) {
    return {
      ok: false,
      label: "Bridge pendiente"
    };
  }

  try {
    return {
      ok: true,
      label: window.dbpilot.app.ping()
    };
  } catch {
    return {
      ok: false,
      label: "Bridge con error"
    };
  }
}