import { useEffect, useState } from "react";

import DataTable from "../../components/data-table/DataTable.jsx";
import EmptyState from "../../components/empty-state/EmptyState.jsx";

import { databaseClient } from "../../services/database.client.js";
import { exportClient } from "../../services/export.client.js";
import { historyClient } from "../../services/history.client.js";
import { connectionStore } from "../../store/connection.store.js";

import "./table-data.css";

export default function TableDataPage() {
  const [storeState, setStoreState] = useState(connectionStore.getState());
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  const activeConnection = storeState.activeConnection;
  const activeTable = storeState.activeTable;
  const activeSchema = storeState.activeSchema;

  useEffect(() => {
    const unsubscribe = connectionStore.subscribe(setStoreState);

    return unsubscribe;
  }, []);

  async function handleReloadRows() {
    if (!activeConnection || !activeTable) return;

    setLoading(true);
    setFeedback({
      type: "",
      message: ""
    });

    const response = await databaseClient.getTableRows({
      connection: activeConnection,
      schema: activeSchema,
      table: activeTable,
      limit
    });

    setLoading(false);

    await historyClient.addHistoryItem({
      type: "TABLE_DATA",
      status: response.ok ? "success" : "error",
      connectionName: activeConnection.name,
      engine: activeConnection.engine,
      detail: response.ok
        ? `Registros cargados: ${activeSchema}.${activeTable}`
        : response.error
    });

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    connectionStore.setActiveRows(response.data?.rows || []);

    setFeedback({
      type: "success",
      message: `Registros cargados: ${response.data?.rows?.length || 0}`
    });
  }

  async function handleExportCsv() {
    const response = await exportClient.exportCsv({
      filename: `${activeTable || "tabla"}-export.csv`,
      rows: storeState.activeRows
    });

    await historyClient.addHistoryItem({
      type: "EXPORT",
      status: response.ok ? "success" : "error",
      connectionName: activeConnection?.name || "",
      engine: activeConnection?.engine || "",
      detail: response.ok
        ? `CSV exportado desde tabla ${activeSchema}.${activeTable}`
        : response.error
    });

    setFeedback({
      type: response.ok ? "success" : "error",
      message: response.ok ? "CSV exportado correctamente." : response.error
    });
  }

  if (!activeConnection || !activeTable) {
    return (
      <EmptyState
        icon="▤"
        eyebrow="Sin tabla activa"
        title="Seleccioná una tabla desde Explorer"
        description="Cuando selecciones una tabla, acá vas a poder ver sus registros reales, paginar y exportar."
      />
    );
  }

  return (
    <div className="dbp-page dbp-table-data-page">
      <section className="dbp-page-header">
        <p className="dbp-page-header__eyebrow">Table rows</p>
        <h1>Datos de tabla</h1>
        <p>
          Tabla activa: <strong>{activeSchema}.{activeTable}</strong>. Mostrando
          registros reales desde la conexión activa.
        </p>
      </section>

      {feedback.message ? (
        <div
          className={[
            "dbp-table-data-feedback",
            feedback.type ? `dbp-table-data-feedback--${feedback.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="dbp-panel">
        <div className="dbp-panel__header">
          <h2>Registros</h2>

          <div className="dbp-table-data-actions">
            <select
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
            >
              <option value="50">50 filas</option>
              <option value="100">100 filas</option>
              <option value="250">250 filas</option>
              <option value="500">500 filas</option>
            </select>

            <button
              type="button"
              disabled={loading}
              onClick={handleReloadRows}
            >
              {loading ? "Cargando..." : "Recargar"}
            </button>

            <button
              type="button"
              disabled={!storeState.activeRows.length}
              onClick={handleExportCsv}
            >
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="dbp-panel__body">
          <DataTable
            columns={storeState.activeColumns.map((column) => ({
              key: column.name,
              label: column.name,
              type: column.type
            }))}
            rows={storeState.activeRows}
            loading={loading}
            emptyTitle="Sin registros"
            emptyDescription="La tabla no devolvió registros o todavía no se cargaron datos."
          />
        </div>
      </section>
    </div>
  );
}