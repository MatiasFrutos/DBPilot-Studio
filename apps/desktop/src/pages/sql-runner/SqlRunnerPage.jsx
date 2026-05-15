import { useEffect, useMemo, useState } from "react";

import DataTable from "../../components/data-table/DataTable.jsx";
import EmptyState from "../../components/empty-state/EmptyState.jsx";

import { databaseClient } from "../../services/database.client.js";
import { exportClient } from "../../services/export.client.js";
import { historyClient } from "../../services/history.client.js";
import { snippetsClient } from "../../services/snippets.client.js";
import { connectionStore } from "../../store/connection.store.js";
import { createSafePreview, formatSql } from "../../utils/sql-format.util.js";

import "./sql-runner.css";

export default function SqlRunnerPage() {
  const [storeState, setStoreState] = useState(connectionStore.getState());
  const [query, setQuery] = useState("SELECT *\nFROM clientes\nLIMIT 100;");
  const [snippetTitle, setSnippetTitle] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  const activeConnection = storeState.activeConnection;

  const preview = useMemo(() => {
    return createSafePreview(query);
  }, [query]);

  useEffect(() => {
    const unsubscribe = connectionStore.subscribe(setStoreState);

    return unsubscribe;
  }, []);

  async function handleExecuteQuery() {
    if (!activeConnection) {
      setFeedback({
        type: "error",
        message: "Primero seleccioná una conexión activa."
      });

      return;
    }

    setLoading(true);
    setFeedback({
      type: "",
      message: ""
    });

    const response = await databaseClient.executeQuery({
      connection: activeConnection,
      query
    });

    setLoading(false);

    await historyClient.addHistoryItem({
      type: "SQL",
      status: response.ok ? "success" : "error",
      connectionName: activeConnection.name,
      engine: activeConnection.engine,
      query,
      detail: response.ok ? "Consulta ejecutada" : response.error,
      durationMs: response.data?.durationMs || 0
    });

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setResult(response.data);

    setFeedback({
      type: "success",
      message: `Consulta ejecutada. ${response.data?.rowCount || 0} fila(s). ${response.data?.durationMs || 0}ms.`
    });
  }

  function handleFormatQuery() {
    setQuery(formatSql(query));
  }

  async function handleExportCsv() {
    const response = await exportClient.exportCsv({
      filename: "dbpilot-query-result.csv",
      rows: result?.rows || []
    });

    await historyClient.addHistoryItem({
      type: "EXPORT",
      status: response.ok ? "success" : "error",
      connectionName: activeConnection?.name || "",
      engine: activeConnection?.engine || "",
      detail: response.ok ? "Resultado exportado a CSV" : response.error
    });

    setFeedback({
      type: response.ok ? "success" : "error",
      message: response.ok ? "Resultado exportado a CSV." : response.error
    });
  }

  async function handleSaveSnippet() {
    const title = snippetTitle.trim() || `Snippet ${new Date().toLocaleString("es-AR")}`;

    const response = await snippetsClient.saveSnippet({
      title,
      category: preview.type,
      engine: activeConnection?.engine || "any",
      sql: query,
      notes: "Guardado desde SQL Runner"
    });

    setFeedback({
      type: response.ok ? "success" : "error",
      message: response.ok ? "Snippet guardado correctamente." : response.error
    });

    if (response.ok) {
      setSnippetTitle("");
    }
  }

  if (!activeConnection) {
    return (
      <EmptyState
        icon="SQL"
        eyebrow="Sin conexión activa"
        title="Seleccioná una conexión para ejecutar SQL"
        description="Abrí una conexión desde el módulo Conexiones y después volvé al SQL Runner."
      />
    );
  }

  return (
    <div className="dbp-page dbp-sql-page">
      <section className="dbp-page-header">
        <p className="dbp-page-header__eyebrow">Query workspace</p>
        <h1>SQL Runner real</h1>
        <p>
          Ejecutando sobre: <strong>{activeConnection.name}</strong>. Las reglas
          de seguridad bloquean operaciones peligrosas como DELETE/UPDATE sin WHERE.
        </p>
      </section>

      {feedback.message ? (
        <div
          className={[
            "dbp-sql-feedback",
            feedback.type ? `dbp-sql-feedback--${feedback.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="dbp-page-grid">
        <div className="dbp-panel dbp-sql-page__editor">
          <div className="dbp-panel__header">
            <h2>Editor SQL</h2>
            <span>{preview.type}</span>
          </div>

          <div className="dbp-panel__body">
            <div className="dbp-sql-toolbar">
              <button
                className="dbp-button dbp-button--primary"
                type="button"
                disabled={loading}
                onClick={handleExecuteQuery}
              >
                {loading ? "Ejecutando..." : "Ejecutar"}
              </button>

              <button
                className="dbp-button dbp-button--secondary"
                type="button"
                onClick={handleFormatQuery}
              >
                Formatear
              </button>

              <button
                className="dbp-button dbp-button--secondary"
                type="button"
                disabled={!result?.rows?.length}
                onClick={handleExportCsv}
              >
                Exportar CSV
              </button>
            </div>

            <textarea
              className="dbp-sql-editor"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              spellCheck="false"
            />

            <div className="dbp-sql-snippet-row">
              <input
                value={snippetTitle}
                onChange={(event) => setSnippetTitle(event.target.value)}
                placeholder="Nombre del snippet"
              />

              <button
                type="button"
                onClick={handleSaveSnippet}
              >
                Guardar snippet
              </button>
            </div>
          </div>
        </div>

        <aside className="dbp-panel dbp-sql-page__side">
          <div className="dbp-panel__header">
            <h2>Safety Preview</h2>
            <span>Guardrails</span>
          </div>

          <div className="dbp-panel__body">
            <div className="dbp-sql-rules">
              <span className={preview.selectOnly ? "dbp-badge dbp-badge--ok" : "dbp-badge"}>
                Tipo: {preview.type}
              </span>

              <span className={preview.deleteWithoutWhere ? "dbp-badge dbp-badge--danger" : "dbp-badge dbp-badge--ok"}>
                DELETE sin WHERE: {preview.deleteWithoutWhere ? "bloqueado" : "OK"}
              </span>

              <span className={preview.updateWithoutWhere ? "dbp-badge dbp-badge--danger" : "dbp-badge dbp-badge--ok"}>
                UPDATE sin WHERE: {preview.updateWithoutWhere ? "bloqueado" : "OK"}
              </span>

              <span className={preview.dangerous ? "dbp-badge dbp-badge--danger" : "dbp-badge dbp-badge--ok"}>
                Riesgo: {preview.dangerous ? "alto" : "controlado"}
              </span>
            </div>
          </div>
        </aside>
      </section>

      <section className="dbp-panel">
        <div className="dbp-panel__header">
          <h2>Resultado</h2>
          <span>
            {result
              ? `${result.rowCount || 0} fila(s) · ${result.durationMs || 0}ms`
              : "Sin ejecución"}
          </span>
        </div>

        <div className="dbp-panel__body">
          <DataTable
            columns={result?.columns || []}
            rows={result?.rows || []}
            loading={loading}
            emptyTitle="Sin resultado"
            emptyDescription="Ejecutá una consulta para ver el resultado en esta tabla."
          />
        </div>
      </section>
    </div>
  );
}