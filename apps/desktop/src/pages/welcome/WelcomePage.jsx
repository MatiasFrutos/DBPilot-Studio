import { APP_DESCRIPTION, APP_NAME, DATABASE_ENGINES } from "../../app/app.constants.js";

import "./welcome.css";

/* =========================================================
   DBPilot Studio
   Welcome Page
   ---------------------------------------------------------
   Página inicial del producto.

   Ajustes aplicados:
   - Se elimina runtime.status.
   - Se elimina badge "MVP operativo · v0.1.0".
   - Se mantiene una bienvenida más limpia, oscura y compacta.
   - Se priorizan acciones principales y flujo de trabajo.
   ========================================================= */

const WORKFLOW_ITEMS = [
  {
    title: "Crear conexión",
    description: "Configurá PostgreSQL, MySQL/MariaDB o SQLite local con validación inicial.",
    icon: "↗"
  },
  {
    title: "Explorar estructura",
    description: "Inspeccioná schemas, tablas, columnas, tipos, claves y registros.",
    icon: "▦"
  },
  {
    title: "Ejecutar SQL",
    description: "Trabajá consultas SQL con controles de seguridad y salida tabular.",
    icon: "⌘"
  },
  {
    title: "Documentar",
    description: "Exportá reportes Markdown, JSON técnico e historial operativo.",
    icon: "◇"
  }
];

const PRODUCT_METRICS = [
  {
    label: "Motores",
    value: "3",
    detail: "PostgreSQL · MySQL · SQLite"
  },
  {
    label: "Modo",
    value: "Local",
    detail: "Datos bajo tu entorno"
  },
  {
    label: "Seguridad",
    value: "Guardrails",
    detail: "Bloqueos y confirmaciones"
  }
];

const QUICK_FEATURES = [
  {
    label: "Schema Explorer",
    value: "Estructura clara",
    icon: "▦"
  },
  {
    label: "SQL Runner",
    value: "Consultas rápidas",
    icon: "SQL"
  },
  {
    label: "Docs",
    value: "Reportes técnicos",
    icon: "◇"
  }
];

export default function WelcomePage({ onNavigate }) {
  return (
    <div className="dbp-page dbp-welcome">
      <section className="dbp-welcome-hero">
        <div className="dbp-welcome-hero__content">
          <div className="dbp-welcome-hero__top">
            <span className="dbp-welcome-hero__eyebrow">
              Local database workspace
            </span>
          </div>

          <h1>{APP_NAME}</h1>

          <p>
            {APP_DESCRIPTION} Un workspace local para inspeccionar, consultar,
            administrar y documentar bases de datos sin fricción operativa.
          </p>

          <div className="dbp-welcome-hero__actions">
            <button
              className="dbp-welcome-action dbp-welcome-action--primary"
              type="button"
              onClick={() => onNavigate("connections")}
            >
              <span>＋</span>
              Crear conexión
            </button>

            <button
              className="dbp-welcome-action dbp-welcome-action--secondary"
              type="button"
              onClick={() => onNavigate("explorer")}
            >
              <span>▦</span>
              Abrir Explorer
            </button>

            <button
              className="dbp-welcome-action dbp-welcome-action--ghost"
              type="button"
              onClick={() => onNavigate("sql-runner")}
            >
              <span>SQL</span>
              SQL Runner
            </button>
          </div>

          <div className="dbp-welcome-metrics">
            {PRODUCT_METRICS.map((metric) => (
              <article key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </article>
            ))}
          </div>
        </div>

        <aside className="dbp-welcome-side-panel">
          <div className="dbp-welcome-side-panel__header">
            <span>Product focus</span>
            <h2>Todo lo importante, en una vista compacta.</h2>
            <p>
              Conectá, inspeccioná y documentá bases sin abrir cinco herramientas distintas.
            </p>
          </div>

          <div className="dbp-welcome-feature-list">
            {QUICK_FEATURES.map((feature) => (
              <article key={feature.label}>
                <span>{feature.icon}</span>

                <div>
                  <strong>{feature.label}</strong>
                  <small>{feature.value}</small>
                </div>
              </article>
            ))}
          </div>

          <button
            className="dbp-welcome-side-panel__action"
            type="button"
            onClick={() => onNavigate("explorer")}
          >
            Empezar exploración
            <span>→</span>
          </button>
        </aside>
      </section>

      <section className="dbp-welcome-engines" aria-label="Motores soportados">
        {DATABASE_ENGINES.map((engine, index) => (
          <article
            className="dbp-welcome-engine"
            key={engine.id}
            style={{ "--dbp-delay": `${index * 70}ms` }}
          >
            <div className="dbp-welcome-engine__top">
              <span>{engine.icon}</span>
              <small>{engine.shortName}</small>
            </div>

            <h2>{engine.name}</h2>
            <p>{engine.description}</p>

            <button
              type="button"
              onClick={() => onNavigate("connections")}
            >
              Configurar conexión
              <span>→</span>
            </button>
          </article>
        ))}
      </section>

      <section className="dbp-welcome-workflow-panel">
        <div className="dbp-welcome-workflow-panel__header">
          <div>
            <span>Workflow</span>
            <h2>Flujo de trabajo del producto</h2>
            <p>
              Una secuencia clara para pasar de una conexión vacía a documentación técnica exportable.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("reports")}
          >
            Ver reportes
          </button>
        </div>

        <div className="dbp-welcome-workflow">
          {WORKFLOW_ITEMS.map((item, index) => (
            <article
              className="dbp-welcome-workflow__item"
              key={item.title}
              style={{ "--dbp-delay": `${index * 80}ms` }}
            >
              <span>{item.icon}</span>

              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}