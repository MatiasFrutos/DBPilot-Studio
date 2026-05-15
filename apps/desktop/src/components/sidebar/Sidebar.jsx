import { APP_NAME, APP_VERSION } from "../../app/app.constants.js";
import { getEnabledRoutes } from "../../app/app.routes.js";

import "./sidebar.css";

/* =========================================================
   DBPilot Studio
   Sidebar Component
   ---------------------------------------------------------
   Sidebar principal del sistema.
   Estilo pensado para:
   - UI oscura tipo Claude.
   - Modo compacto.
   - Íconos más visibles.
   - Estados activos claros.
   - Compatibilidad con sidebar colapsado.
   ========================================================= */

const ROUTE_VISUALS = {
  workspace: {
    icon: "⌘",
    tone: "amber"
  },
  dashboard: {
    icon: "⌂",
    tone: "amber"
  },
  home: {
    icon: "⌂",
    tone: "amber"
  },
  connections: {
    icon: "⛓",
    tone: "green"
  },
  connection: {
    icon: "⛓",
    tone: "green"
  },
  explorer: {
    icon: "▦",
    tone: "purple"
  },
  database: {
    icon: "▦",
    tone: "purple"
  },
  "table-structure": {
    icon: "☷",
    tone: "orange"
  },
  structure: {
    icon: "☷",
    tone: "orange"
  },
  schema: {
    icon: "☷",
    tone: "orange"
  },
  "table-data": {
    icon: "▤",
    tone: "teal"
  },
  data: {
    icon: "▤",
    tone: "teal"
  },
  records: {
    icon: "▤",
    tone: "teal"
  },
  "sql-runner": {
    icon: "SQL",
    tone: "indigo"
  },
  sql: {
    icon: "SQL",
    tone: "indigo"
  },
  runner: {
    icon: "▶",
    tone: "indigo"
  },
  "query-history": {
    icon: "↺",
    tone: "pink"
  },
  history: {
    icon: "↺",
    tone: "pink"
  },
  settings: {
    icon: "⚙",
    tone: "slate"
  },
  preferences: {
    icon: "⚙",
    tone: "slate"
  }
};

export default function Sidebar({
  activeRoute,
  bridgeStatus,
  collapsed = false,
  onToggleCollapsed,
  onNavigate
}) {
  const routes = getEnabledRoutes();

  const safeBridgeStatus = bridgeStatus || {
    ok: false,
    label: "Bridge pending"
  };

  return (
    <aside
      className={[
        "dbp-sidebar",
        collapsed ? "dbp-sidebar--collapsed" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="dbp-sidebar__brand">
        <button
          className="dbp-sidebar__brand-mark"
          type="button"
          title={collapsed ? "Abrir sidebar" : "Cerrar sidebar"}
          aria-label={collapsed ? "Abrir sidebar" : "Cerrar sidebar"}
          onClick={onToggleCollapsed}
        >
          <span>DB</span>
        </button>

        <div className="dbp-sidebar__brand-copy">
          <strong>{APP_NAME.replace(" Studio", "")}</strong>
          <span>Studio v{APP_VERSION}</span>
        </div>

        <button
          className="dbp-sidebar__toggle"
          type="button"
          title={collapsed ? "Expandir sidebar" : "Contraer sidebar"}
          aria-label={collapsed ? "Expandir sidebar" : "Contraer sidebar"}
          onClick={onToggleCollapsed}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <div className="dbp-sidebar__section">
        <span className="dbp-sidebar__section-label">Workspace</span>

        <nav className="dbp-sidebar__nav" aria-label="Navegación principal">
          {routes.map((route) => {
            const isActive = activeRoute === route.id;
            const visual = getRouteVisual(route);

            return (
              <button
                key={route.id}
                className={[
                  "dbp-sidebar__nav-item",
                  `dbp-sidebar__nav-item--tone-${visual.tone}`,
                  `dbp-sidebar__nav-item--route-${route.id}`,
                  isActive ? "dbp-sidebar__nav-item--active" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                type="button"
                title={collapsed ? `${route.label} · ${route.title}` : ""}
                aria-label={`${route.label}: ${route.title}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onNavigate(route.id)}
              >
                <span className="dbp-sidebar__nav-icon">{visual.icon}</span>

                <span className="dbp-sidebar__nav-copy">
                  <strong>{route.label}</strong>
                  <small>{route.title}</small>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="dbp-sidebar__quick">
        <span className="dbp-sidebar__section-label">Quick actions</span>

        <button
          className="dbp-sidebar__quick-action dbp-sidebar__quick-action--connection"
          type="button"
          title={collapsed ? "New connection" : ""}
          aria-label="Crear nueva conexión"
          onClick={() => onNavigate("connections")}
        >
          <span>＋</span>
          <strong>New connection</strong>
        </button>

        <button
          className="dbp-sidebar__quick-action dbp-sidebar__quick-action--sql"
          type="button"
          title={collapsed ? "Open runner" : ""}
          aria-label="Abrir SQL Runner"
          onClick={() => onNavigate("sql-runner")}
        >
          <span>SQL</span>
          <strong>Open runner</strong>
        </button>
      </div>

      <div className="dbp-sidebar__footer">
        <div
          className="dbp-sidebar__status"
          title={`${safeBridgeStatus.ok ? "System online" : "System pending"} · ${safeBridgeStatus.label}`}
        >
          <span
            className={[
              "dbp-sidebar__status-dot",
              safeBridgeStatus.ok ? "dbp-sidebar__status-dot--ok" : ""
            ]
              .filter(Boolean)
              .join(" ")}
          ></span>

          <div>
            <strong>{safeBridgeStatus.ok ? "System online" : "System pending"}</strong>
            <small>{safeBridgeStatus.label}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

function getRouteVisual(route) {
  const routeId = String(route?.id || "").trim();

  if (ROUTE_VISUALS[routeId]) {
    return ROUTE_VISUALS[routeId];
  }

  return {
    icon: route?.icon || "•",
    tone: "slate"
  };
}