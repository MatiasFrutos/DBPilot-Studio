import { useEffect, useMemo, useState } from "react";

import EmptyState from "../../components/empty-state/EmptyState.jsx";
import { exportClient } from "../../services/export.client.js";
import { historyClient } from "../../services/history.client.js";

import "./history.css";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  const filteredHistory = useMemo(() => {
    if (filter === "all") return history;

    return history.filter((item) => item.type === filter);
  }, [filter, history]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const response = await historyClient.loadHistory();

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setHistory(response.data);
  }

  async function handleClearHistory() {
    const response = await historyClient.clearHistory();

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setHistory([]);

    setFeedback({
      type: "success",
      message: "Historial limpiado correctamente."
    });
  }

  async function handleExportJson() {
    const response = await exportClient.exportJson({
      filename: "dbpilot-history.json",
      data: filteredHistory
    });

    setFeedback({
      type: response.ok ? "success" : "error",
      message: response.ok ? "Historial exportado a JSON." : response.error
    });
  }

  async function handleExportMarkdown() {
    const markdown = createHistoryMarkdown(filteredHistory);

    const response = await exportClient.exportMarkdown({
      filename: "dbpilot-history.md",
      markdown
    });

    setFeedback({
      type: response.ok ? "success" : "error",
      message: response.ok ? "Historial exportado a Markdown." : response.error
    });
  }

  return (
    <div className="dbp-page dbp-history-page">
      <section className="dbp-page-header">
        <p className="dbp-page-header__eyebrow">Audit trail</p>
        <h1>Historial</h1>
        <p>
          Registro local de consultas SQL, exportaciones, carga de datos y
          operaciones sensibles. Sin esto, auditar es arqueología con casco.
        </p>
      </section>

      {feedback.message ? (
        <div
          className={[
            "dbp-history-feedback",
            feedback.type ? `dbp-history-feedback--${feedback.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="dbp-panel">
        <div className="dbp-panel__header">
          <h2>Eventos</h2>

          <div className="dbp-history-actions">
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="all">Todos</option>
              <option value="SQL">SQL</option>
              <option value="STRUCTURE">Estructura</option>
              <option value="EXPORT">Exportación</option>
              <option value="SNIPPET">Snippet</option>
              <option value="TABLE_DATA">Datos</option>
            </select>

            <button type="button" onClick={loadHistory}>
              Recargar
            </button>

            <button type="button" disabled={!filteredHistory.length} onClick={handleExportJson}>
              JSON
            </button>

            <button type="button" disabled={!filteredHistory.length} onClick={handleExportMarkdown}>
              Markdown
            </button>

            <button type="button" disabled={!history.length} onClick={handleClearHistory}>
              Limpiar
            </button>
          </div>
        </div>

        <div className="dbp-panel__body">
          {filteredHistory.length ? (
            <div className="dbp-history-table-wrap">
              <table className="dbp-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Conexión</th>
                    <th>Detalle</th>
                    <th>Duración</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>{item.type}</td>
                      <td>
                        <span className={item.status === "success" ? "dbp-badge dbp-badge--ok" : "dbp-badge dbp-badge--danger"}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.connectionName || "-"}</td>
                      <td>{item.detail || item.query || "-"}</td>
                      <td>{item.durationMs ? `${item.durationMs}ms` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="◷"
              eyebrow="Sin historial"
              title="Todavía no hay eventos registrados"
              description="Ejecutá consultas, exportá datos o modificá estructura para generar historial local."
              primaryActionLabel="Recargar"
              onPrimaryAction={loadHistory}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function createHistoryMarkdown(history = []) {
  const lines = [];

  lines.push("# DBPilot Studio - History Report");
  lines.push("");
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("| Date | Type | Status | Connection | Detail | Duration |");
  lines.push("| --- | --- | --- | --- | --- | --- |");

  history.forEach((item) => {
    lines.push(
      `| ${escapeCell(item.createdAt)} | ${escapeCell(item.type)} | ${escapeCell(item.status)} | ${escapeCell(item.connectionName || "-")} | ${escapeCell(item.detail || item.query || "-")} | ${escapeCell(item.durationMs ? `${item.durationMs}ms` : "-")} |`
    );
  });

  return lines.join("\n");
}

function escapeCell(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ")
    .replaceAll("\r", " ");
}