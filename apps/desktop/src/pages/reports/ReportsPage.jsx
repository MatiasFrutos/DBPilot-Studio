import { useEffect, useMemo, useState } from "react";

import EmptyState from "../../components/empty-state/EmptyState.jsx";
import { exportClient } from "../../services/export.client.js";
import { historyClient } from "../../services/history.client.js";
import { connectionStore } from "../../store/connection.store.js";

import "./reports.css";

/* =========================================================
   DBPilot Studio
   Reports Page
   ---------------------------------------------------------
   Página de reportes técnicos.

   Responsabilidades:
   - Generar reporte Markdown de la conexión activa.
   - Exportar Markdown.
   - Exportar JSON técnico.
   - Copiar Markdown al portapapeles.
   - Mostrar resumen, metadata y preview colapsable.

   Estilo:
   - Oscuro tipo Claude.
   - Compacto.
   - Preview técnica legible.
   - Cards laterales más claras y con mejor jerarquía.
   ========================================================= */

const SUMMARY_ITEMS = [
  {
    key: "connection",
    label: "Conexión",
    icon: "DB"
  },
  {
    key: "engine",
    label: "Motor",
    icon: "SQL"
  },
  {
    key: "schemas",
    label: "Schemas",
    icon: "SC"
  },
  {
    key: "tables",
    label: "Tablas",
    icon: "TB"
  },
  {
    key: "views",
    label: "Vistas",
    icon: "VW"
  },
  {
    key: "activeTable",
    label: "Tabla activa",
    icon: "AT"
  }
];

export default function ReportsPage() {
  const [storeState, setStoreState] = useState(connectionStore.getState());
  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });
  const [previewOpen, setPreviewOpen] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [metadataOpen, setMetadataOpen] = useState(true);

  const activeConnection = storeState.activeConnection;
  const schemaOverview = storeState.schemaOverview;

  const markdown = useMemo(() => {
    return createDatabaseMarkdownReport({
      connection: activeConnection,
      schemaOverview,
      activeTable: storeState.activeTable,
      activeSchema: storeState.activeSchema,
      activeColumns: storeState.activeColumns
    });
  }, [
    activeConnection,
    schemaOverview,
    storeState.activeTable,
    storeState.activeSchema,
    storeState.activeColumns
  ]);

  const reportStats = useMemo(() => {
    const lines = markdown ? markdown.split("\n").length : 0;
    const words = markdown
      ? markdown
          .replace(/[^\wáéíóúñüÁÉÍÓÚÑÜ]+/g, " ")
          .trim()
          .split(/\s+/)
          .filter(Boolean).length
      : 0;

    return {
      lines,
      words,
      chars: markdown.length
    };
  }, [markdown]);

  const summaryData = useMemo(() => {
    return {
      connection: activeConnection?.name || "-",
      engine: activeConnection?.engine || "-",
      schemas: schemaOverview?.summary?.schemas || 0,
      tables: schemaOverview?.summary?.tables || 0,
      views: schemaOverview?.summary?.views || 0,
      activeTable: storeState.activeTable || "-"
    };
  }, [activeConnection, schemaOverview, storeState.activeTable]);

  useEffect(() => {
    const unsubscribe = connectionStore.subscribe(setStoreState);

    return unsubscribe;
  }, []);

  async function handleExportMarkdown() {
    const response = await exportClient.exportMarkdown({
      filename: "dbpilot-database-report.md",
      markdown
    });

    await historyClient.addHistoryItem({
      type: "EXPORT",
      status: response.ok ? "success" : "error",
      connectionName: activeConnection?.name || "",
      engine: activeConnection?.engine || "",
      detail: response.ok ? "Reporte Markdown exportado" : response.error
    });

    setFeedback({
      type: response.ok ? "success" : "error",
      message: response.ok ? "Reporte Markdown exportado correctamente." : response.error
    });
  }

  async function handleExportJson() {
    const response = await exportClient.exportJson({
      filename: "dbpilot-schema-overview.json",
      data: {
        connection: activeConnection,
        schemaOverview,
        activeTable: storeState.activeTable,
        activeSchema: storeState.activeSchema,
        activeColumns: storeState.activeColumns
      }
    });

    await historyClient.addHistoryItem({
      type: "EXPORT",
      status: response.ok ? "success" : "error",
      connectionName: activeConnection?.name || "",
      engine: activeConnection?.engine || "",
      detail: response.ok ? "Schema JSON exportado" : response.error
    });

    setFeedback({
      type: response.ok ? "success" : "error",
      message: response.ok ? "Schema JSON exportado correctamente." : response.error
    });
  }

  async function handleCopyMarkdown() {
    try {
      await navigator.clipboard.writeText(markdown);

      setFeedback({
        type: "success",
        message: "Reporte Markdown copiado al portapapeles."
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "No se pudo copiar el reporte."
      });
    }
  }

  if (!activeConnection) {
    return (
      <div className="dbp-page dbp-reports-page">
        <EmptyState
          icon="▣"
          eyebrow="Sin conexión activa"
          title="No hay base para documentar"
          description="Seleccioná una conexión y cargá la estructura desde Explorer para generar reportes técnicos."
        />
      </div>
    );
  }

  return (
    <div className="dbp-page dbp-reports-page">
      <section className="dbp-reports-hero">
        <div className="dbp-reports-hero__content">
          <p className="dbp-reports-hero__eyebrow">Technical docs</p>
          <h1>Reportes</h1>
          <span>
            Generá documentación Markdown y exportaciones JSON de la estructura
            cargada. Ideal para auditoría liviana, README técnico o handoff operativo.
          </span>
        </div>

        <div className="dbp-reports-hero__actions">
          <button
            className="dbp-reports-action dbp-reports-action--secondary"
            type="button"
            onClick={handleCopyMarkdown}
          >
            <span>⧉</span>
            Copiar MD
          </button>

          <button
            className="dbp-reports-action dbp-reports-action--secondary"
            type="button"
            onClick={handleExportJson}
          >
            <span>{`{}`}</span>
            Exportar JSON
          </button>

          <button
            className="dbp-reports-action dbp-reports-action--primary"
            type="button"
            onClick={handleExportMarkdown}
          >
            <span>MD</span>
            Exportar Markdown
          </button>
        </div>
      </section>

      {feedback.message ? (
        <div
          className={[
            "dbp-reports-feedback",
            feedback.type ? `dbp-reports-feedback--${feedback.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span>{feedback.type === "error" ? "Error" : "OK"}</span>
          <strong>{feedback.message}</strong>
        </div>
      ) : null}

      <section className="dbp-reports-kpis">
        <ReportKpi label="Líneas" value={reportStats.lines} helper="Markdown" />
        <ReportKpi label="Palabras" value={reportStats.words} helper="Contenido" />
        <ReportKpi label="Caracteres" value={reportStats.chars} helper="Payload" />
        <ReportKpi
          label="Tablas"
          value={schemaOverview?.summary?.tables || 0}
          helper="Estructura"
        />
      </section>

      <section className="dbp-page-grid dbp-reports-grid">
        <div className="dbp-panel dbp-reports-page__main">
          <button
            className="dbp-reports-collapse"
            type="button"
            onClick={() => setPreviewOpen((current) => !current)}
          >
            <span>
              <strong>Preview Markdown</strong>
              <small>Vista previa técnica del reporte generado</small>
            </span>

            <i>{previewOpen ? "−" : "+"}</i>
          </button>

          {previewOpen ? (
            <div className="dbp-panel__body dbp-reports-preview-wrap">
              <pre className="dbp-reports-preview">{markdown}</pre>
            </div>
          ) : null}
        </div>

        <aside className="dbp-reports-page__side">
          <div className="dbp-panel dbp-reports-side-card">
            <button
              className="dbp-reports-collapse"
              type="button"
              onClick={() => setSummaryOpen((current) => !current)}
            >
              <span>
                <strong>Resumen</strong>
                <small>Contexto de la base actual</small>
              </span>

              <i>{summaryOpen ? "−" : "+"}</i>
            </button>

            {summaryOpen ? (
              <div className="dbp-panel__body">
                <div className="dbp-reports-summary">
                  {SUMMARY_ITEMS.map((item) => (
                    <article key={item.key}>
                      <div>
                        <span>{item.icon}</span>
                      </div>

                      <section>
                        <small>{item.label}</small>
                        <strong>{summaryData[item.key]}</strong>
                      </section>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="dbp-panel dbp-reports-side-card">
            <button
              className="dbp-reports-collapse"
              type="button"
              onClick={() => setMetadataOpen((current) => !current)}
            >
              <span>
                <strong>Metadata</strong>
                <small>Datos técnicos del documento</small>
              </span>

              <i>{metadataOpen ? "−" : "+"}</i>
            </button>

            {metadataOpen ? (
              <div className="dbp-panel__body">
                <div className="dbp-reports-metadata">
                  <article>
                    <span>Generado</span>
                    <strong>{formatDateTime(new Date())}</strong>
                  </article>

                  <article>
                    <span>Formato principal</span>
                    <strong>Markdown</strong>
                  </article>

                  <article>
                    <span>Exportación adicional</span>
                    <strong>JSON</strong>
                  </article>

                  <article>
                    <span>Origen</span>
                    <strong>DBPilot Studio</strong>
                  </article>
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </section>
    </div>
  );
}

function ReportKpi({ label, value, helper }) {
  return (
    <article className="dbp-reports-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </article>
  );
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
    .format(date)
    .replace(".", "");
}

function createDatabaseMarkdownReport({
  connection = null,
  schemaOverview = null,
  activeTable = "",
  activeSchema = "",
  activeColumns = []
} = {}) {
  const lines = [];

  lines.push("# DBPilot Studio - Database Report");
  lines.push("");
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push("");

  if (connection) {
    lines.push("## Connection");
    lines.push("");
    lines.push("| Field | Value |");
    lines.push("| --- | --- |");
    lines.push(`| Name | ${escapeCell(connection.name || "-")} |`);
    lines.push(`| Engine | ${escapeCell(connection.engine || "-")} |`);
    lines.push(`| Host/File | ${escapeCell(connection.host || connection.filePath || "-")} |`);
    lines.push(`| Database | ${escapeCell(connection.database || connection.filePath || "-")} |`);
    lines.push(`| Readonly | ${connection.readonly ? "Yes" : "No"} |`);
    lines.push("");
  }

  if (schemaOverview?.summary) {
    lines.push("## Summary");
    lines.push("");
    lines.push("| Metric | Value |");
    lines.push("| --- | ---: |");
    lines.push(`| Schemas | ${schemaOverview.summary.schemas || 0} |`);
    lines.push(`| Tables | ${schemaOverview.summary.tables || 0} |`);
    lines.push(`| Views | ${schemaOverview.summary.views || 0} |`);
    lines.push(`| Estimated Rows | ${schemaOverview.summary.estimatedRows || 0} |`);
    lines.push("");
  }

  if (Array.isArray(schemaOverview?.tables) && schemaOverview.tables.length) {
    lines.push("## Schemas and Tables");
    lines.push("");

    schemaOverview.tables.forEach((schema) => {
      lines.push(`### ${escapeCell(schema.name)}`);
      lines.push("");
      lines.push("| Type | Name | Columns | Rows |");
      lines.push("| --- | --- | ---: | ---: |");

      schema.tables.forEach((table) => {
        lines.push(
          `| ${escapeCell(table.type || "table")} | ${escapeCell(table.name)} | ${table.columns || 0} | ${table.rows || 0} |`
        );
      });

      lines.push("");
    });
  }

  if (activeTable && activeColumns.length) {
    lines.push("## Active Table Structure");
    lines.push("");
    lines.push(`Table: \`${activeSchema ? `${activeSchema}.` : ""}${activeTable}\``);
    lines.push("");
    lines.push("| Column | Type | Nullable | Primary Key | Default |");
    lines.push("| --- | --- | --- | --- | --- |");

    activeColumns.forEach((column) => {
      lines.push(
        `| ${escapeCell(column.name)} | ${escapeCell(column.type || column.rawType || "-")} | ${column.nullable ? "YES" : "NO"} | ${column.primaryKey ? "YES" : "NO"} | ${escapeCell(column.defaultValue || "-")} |`
      );
    });

    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("Created with DBPilot Studio.");

  return lines.join("\n");
}

function escapeCell(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ")
    .replaceAll("\r", " ");
}