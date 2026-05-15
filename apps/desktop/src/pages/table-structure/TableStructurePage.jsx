import { useEffect, useMemo, useState } from "react";

import ConfirmModal from "../../components/modal/ConfirmModal.jsx";
import EmptyState from "../../components/empty-state/EmptyState.jsx";

import { databaseClient } from "../../services/database.client.js";
import { historyClient } from "../../services/history.client.js";
import { connectionStore } from "../../store/connection.store.js";

import "./table-structure.css";

const INITIAL_COLUMN_FORM = {
  name: "",
  type: "TEXT",
  nullable: true,
  unique: false,
  defaultValue: ""
};

const INITIAL_TABLE_FORM = {
  table: "",
  columnsText: "id INTEGER PRIMARY KEY\nnombre TEXT NOT NULL\ncreated_at TEXT"
};

export default function TableStructurePage() {
  const [storeState, setStoreState] = useState(connectionStore.getState());
  const [columnForm, setColumnForm] = useState(INITIAL_COLUMN_FORM);
  const [tableForm, setTableForm] = useState(INITIAL_TABLE_FORM);
  const [previewSql, setPreviewSql] = useState("");
  const [confirmation, setConfirmation] = useState({
    open: false,
    type: "",
    title: "",
    description: "",
    requiredText: "",
    inputValue: "",
    payload: null
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  const activeConnection = storeState.activeConnection;
  const activeTable = storeState.activeTable;
  const activeSchema = storeState.activeSchema;
  const activeColumns = storeState.activeColumns || [];

  const canEditStructure = Boolean(activeConnection && !activeConnection.readonly);

  const createTableColumns = useMemo(() => {
    return parseColumnsText(tableForm.columnsText);
  }, [tableForm.columnsText]);

  useEffect(() => {
    const unsubscribe = connectionStore.subscribe(setStoreState);

    return unsubscribe;
  }, []);

  async function handleReloadColumns() {
    if (!activeConnection || !activeTable) return;

    setLoading(true);
    setFeedback({
      type: "",
      message: ""
    });

    const response = await databaseClient.listColumns({
      connection: activeConnection,
      schema: activeSchema,
      table: activeTable
    });

    setLoading(false);

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    connectionStore.setActiveColumns(response.data?.columns || []);

    setFeedback({
      type: "success",
      message: "Estructura recargada correctamente."
    });
  }

  async function handlePreviewAddColumn() {
    if (!activeConnection || !activeTable) return;

    const response = await databaseClient.previewAddColumn({
      connection: activeConnection,
      schema: activeSchema,
      table: activeTable,
      column: normalizeColumnForm(columnForm)
    });

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setPreviewSql(response.data.sql);
  }

  async function handleAddColumn() {
    if (!activeConnection || !activeTable) return;

    setLoading(true);
    setFeedback({
      type: "",
      message: ""
    });

    const response = await databaseClient.addColumn({
      connection: activeConnection,
      schema: activeSchema,
      table: activeTable,
      column: normalizeColumnForm(columnForm)
    });

    await historyClient.addHistoryItem({
      type: "STRUCTURE",
      status: response.ok ? "success" : "error",
      connectionName: activeConnection.name,
      engine: activeConnection.engine,
      detail: response.ok
        ? `Columna agregada: ${activeSchema}.${activeTable}.${columnForm.name}`
        : response.error,
      query: previewSql
    });

    setLoading(false);

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setColumnForm(INITIAL_COLUMN_FORM);
    setPreviewSql("");

    await handleReloadColumns();

    setFeedback({
      type: "success",
      message: "Columna agregada correctamente."
    });
  }

  async function handlePreviewCreateTable() {
    if (!activeConnection) return;

    const response = await databaseClient.previewCreateTable({
      connection: activeConnection,
      schema: activeSchema || getDefaultSchema(activeConnection),
      table: tableForm.table,
      columns: createTableColumns
    });

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setPreviewSql(response.data.sql);
  }

  async function handleCreateTable() {
    if (!activeConnection) return;

    setLoading(true);
    setFeedback({
      type: "",
      message: ""
    });

    const response = await databaseClient.createTable({
      connection: activeConnection,
      schema: activeSchema || getDefaultSchema(activeConnection),
      table: tableForm.table,
      columns: createTableColumns
    });

    await historyClient.addHistoryItem({
      type: "STRUCTURE",
      status: response.ok ? "success" : "error",
      connectionName: activeConnection.name,
      engine: activeConnection.engine,
      detail: response.ok ? `Tabla creada: ${tableForm.table}` : response.error,
      query: previewSql
    });

    setLoading(false);

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setTableForm(INITIAL_TABLE_FORM);
    setPreviewSql("");

    setFeedback({
      type: "success",
      message: "Tabla creada correctamente. Volvé a Explorer y recargá estructura."
    });
  }

  function openDropColumnModal(columnName) {
    setConfirmation({
      open: true,
      type: "drop-column",
      title: "Eliminar columna",
      description:
        "Esta operación modifica la estructura de la tabla y puede eliminar datos de forma permanente.",
      requiredText: `ELIMINAR ${columnName}`,
      inputValue: "",
      payload: {
        columnName
      }
    });
  }

  function openDropTableModal() {
    if (!activeTable) return;

    setConfirmation({
      open: true,
      type: "drop-table",
      title: "Eliminar tabla",
      description:
        "Esta operación elimina la tabla completa. Es una acción destructiva y requiere confirmación escrita.",
      requiredText: `ELIMINAR ${activeTable}`,
      inputValue: "",
      payload: {
        table: activeTable
      }
    });
  }

  async function handleConfirmDangerousAction() {
    if (!activeConnection) return;

    setLoading(true);
    setFeedback({
      type: "",
      message: ""
    });

    let response;

    if (confirmation.type === "drop-column") {
      response = await databaseClient.dropColumn({
        connection: activeConnection,
        schema: activeSchema,
        table: activeTable,
        columnName: confirmation.payload.columnName,
        confirmedText: confirmation.inputValue
      });
    }

    if (confirmation.type === "drop-table") {
      response = await databaseClient.dropTable({
        connection: activeConnection,
        schema: activeSchema,
        table: activeTable,
        confirmedText: confirmation.inputValue
      });
    }

    await historyClient.addHistoryItem({
      type: "STRUCTURE",
      status: response?.ok ? "success" : "error",
      connectionName: activeConnection.name,
      engine: activeConnection.engine,
      detail: response?.ok
        ? `Operación destructiva ejecutada: ${confirmation.type}`
        : response?.error || "Error de operación destructiva",
      query: confirmation.requiredText
    });

    setLoading(false);

    if (!response?.ok) {
      setFeedback({
        type: "error",
        message: response?.error || "No se pudo ejecutar la operación."
      });

      return;
    }

    setConfirmation({
      open: false,
      type: "",
      title: "",
      description: "",
      requiredText: "",
      inputValue: "",
      payload: null
    });

    if (confirmation.type === "drop-column") {
      await handleReloadColumns();

      setFeedback({
        type: "success",
        message: "Columna eliminada correctamente."
      });
    }

    if (confirmation.type === "drop-table") {
      connectionStore.setActiveTable({
        schema: "",
        table: "",
        columns: [],
        rows: []
      });

      setFeedback({
        type: "success",
        message: "Tabla eliminada correctamente. Recargá Explorer para actualizar."
      });
    }
  }

  if (!activeConnection) {
    return (
      <EmptyState
        icon="▧"
        eyebrow="Sin conexión activa"
        title="Seleccioná una conexión"
        description="Para editar estructura necesitás abrir una conexión PostgreSQL, MySQL o SQLite."
      />
    );
  }

  if (!activeTable) {
    return (
      <div className="dbp-page dbp-table-structure-page">
        <section className="dbp-page-header">
          <p className="dbp-page-header__eyebrow">Structure editor</p>
          <h1>Crear tabla</h1>
          <p>
            No hay tabla activa. Podés crear una tabla nueva sobre la conexión
            actual: <strong>{activeConnection.name}</strong>.
          </p>
        </section>

        <CreateTablePanel
          activeConnection={activeConnection}
          activeSchema={activeSchema}
          tableForm={tableForm}
          setTableForm={setTableForm}
          canEditStructure={canEditStructure}
          loading={loading}
          onPreview={handlePreviewCreateTable}
          onCreate={handleCreateTable}
          previewSql={previewSql}
          feedback={feedback}
        />
      </div>
    );
  }

  return (
    <div className="dbp-page dbp-table-structure-page">
      <section className="dbp-page-header">
        <p className="dbp-page-header__eyebrow">Table structure</p>
        <h1>Estructura y edición</h1>
        <p>
          Tabla activa: <strong>{activeSchema}.{activeTable}</strong>. Desde acá
          podés agregar columnas, eliminar columnas o eliminar la tabla completa
          con confirmación escrita.
        </p>
      </section>

      {activeConnection.readonly ? (
        <div className="dbp-table-structure-feedback dbp-table-structure-feedback--error">
          Esta conexión está en modo solo lectura. Las operaciones de estructura están bloqueadas.
        </div>
      ) : null}

      {feedback.message ? (
        <div
          className={[
            "dbp-table-structure-feedback",
            feedback.type ? `dbp-table-structure-feedback--${feedback.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="dbp-page-grid">
        <div className="dbp-panel dbp-table-structure-page__columns">
          <div className="dbp-panel__header">
            <h2>Columnas</h2>

            <button
              className="dbp-table-structure-button"
              type="button"
              disabled={loading}
              onClick={handleReloadColumns}
            >
              {loading ? "Cargando..." : "Recargar"}
            </button>
          </div>

          <div className="dbp-panel__body">
            <div className="dbp-table-structure-wrap">
              <table className="dbp-table">
                <thead>
                  <tr>
                    <th>Columna</th>
                    <th>Tipo</th>
                    <th>Nullable</th>
                    <th>Primary Key</th>
                    <th>Default</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {activeColumns.map((column) => (
                    <tr key={column.name}>
                      <td>
                        <strong>{column.name}</strong>
                      </td>
                      <td>{column.type || column.rawType || "-"}</td>
                      <td>{column.nullable ? "YES" : "NO"}</td>
                      <td>{column.primaryKey ? "YES" : "NO"}</td>
                      <td>{column.defaultValue || "-"}</td>
                      <td>
                        <button
                          className="dbp-table-structure-inline-danger"
                          type="button"
                          disabled={!canEditStructure || column.primaryKey}
                          onClick={() => openDropColumnModal(column.name)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!activeColumns.length ? (
                <div className="dbp-table-structure-empty">
                  No hay columnas cargadas.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="dbp-panel dbp-table-structure-page__editor">
          <div className="dbp-panel__header">
            <h2>Agregar columna</h2>
            <span>ALTER TABLE</span>
          </div>

          <div className="dbp-panel__body">
            <div className="dbp-form-grid">
              <div className="dbp-field">
                <label>Nombre</label>
                <input
                  value={columnForm.name}
                  onChange={(event) =>
                    setColumnForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  placeholder="nueva_columna"
                />
              </div>

              <div className="dbp-field">
                <label>Tipo</label>
                <input
                  value={columnForm.type}
                  onChange={(event) =>
                    setColumnForm((current) => ({
                      ...current,
                      type: event.target.value
                    }))
                  }
                  placeholder="TEXT / VARCHAR(120) / INTEGER"
                />
              </div>

              <div className="dbp-field">
                <label>Nullable</label>
                <select
                  value={columnForm.nullable ? "yes" : "no"}
                  onChange={(event) =>
                    setColumnForm((current) => ({
                      ...current,
                      nullable: event.target.value === "yes"
                    }))
                  }
                >
                  <option value="yes">Permitir NULL</option>
                  <option value="no">NOT NULL</option>
                </select>
              </div>

              <div className="dbp-field">
                <label>Único</label>
                <select
                  value={columnForm.unique ? "yes" : "no"}
                  onChange={(event) =>
                    setColumnForm((current) => ({
                      ...current,
                      unique: event.target.value === "yes"
                    }))
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Sí</option>
                </select>
              </div>

              <div className="dbp-field dbp-field--wide">
                <label>Default</label>
                <input
                  value={columnForm.defaultValue}
                  onChange={(event) =>
                    setColumnForm((current) => ({
                      ...current,
                      defaultValue: event.target.value
                    }))
                  }
                  placeholder="Ej: now() / CURRENT_TIMESTAMP / 'activo'"
                />
              </div>
            </div>

            <div className="dbp-table-structure-actions">
              <button
                className="dbp-button dbp-button--secondary"
                type="button"
                disabled={!canEditStructure}
                onClick={handlePreviewAddColumn}
              >
                Preview SQL
              </button>

              <button
                className="dbp-button dbp-button--primary"
                type="button"
                disabled={!canEditStructure || loading}
                onClick={handleAddColumn}
              >
                Agregar columna
              </button>
            </div>
          </div>
        </div>
      </section>

      <CreateTablePanel
        activeConnection={activeConnection}
        activeSchema={activeSchema}
        tableForm={tableForm}
        setTableForm={setTableForm}
        canEditStructure={canEditStructure}
        loading={loading}
        onPreview={handlePreviewCreateTable}
        onCreate={handleCreateTable}
        previewSql={previewSql}
        feedback={null}
      />

      <section className="dbp-panel dbp-table-structure-danger-zone">
        <div className="dbp-panel__header">
          <h2>Zona peligrosa</h2>
          <span>Confirmación escrita</span>
        </div>

        <div className="dbp-panel__body">
          <div className="dbp-table-structure-danger-box">
            <div>
              <h3>Eliminar tabla activa</h3>
              <p>
                Requiere escribir exactamente <strong>ELIMINAR {activeTable}</strong>.
                No es reversible desde DBPilot Studio.
              </p>
            </div>

            <button
              className="dbp-button dbp-button--danger"
              type="button"
              disabled={!canEditStructure}
              onClick={openDropTableModal}
            >
              Eliminar tabla
            </button>
          </div>
        </div>
      </section>

      {previewSql ? (
        <section className="dbp-panel">
          <div className="dbp-panel__header">
            <h2>Preview SQL</h2>
            <span>Antes de ejecutar</span>
          </div>

          <div className="dbp-panel__body">
            <pre className="dbp-table-structure-preview">{previewSql}</pre>
          </div>
        </section>
      ) : null}

      <ConfirmModal
        open={confirmation.open}
        title={confirmation.title}
        description={confirmation.description}
        danger
        requiredText={confirmation.requiredText}
        inputValue={confirmation.inputValue}
        confirmText={loading ? "Ejecutando..." : "Confirmar"}
        cancelText="Cancelar"
        onInputChange={(value) =>
          setConfirmation((current) => ({
            ...current,
            inputValue: value
          }))
        }
        onCancel={() =>
          setConfirmation({
            open: false,
            type: "",
            title: "",
            description: "",
            requiredText: "",
            inputValue: "",
            payload: null
          })
        }
        onConfirm={handleConfirmDangerousAction}
      />
    </div>
  );
}

function CreateTablePanel({
  activeConnection,
  activeSchema,
  tableForm,
  setTableForm,
  canEditStructure,
  loading,
  onPreview,
  onCreate,
  previewSql,
  feedback
}) {
  return (
    <>
      {feedback?.message ? (
        <div
          className={[
            "dbp-table-structure-feedback",
            feedback.type ? `dbp-table-structure-feedback--${feedback.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="dbp-panel">
        <div className="dbp-panel__header">
          <h2>Crear tabla</h2>
          <span>{activeSchema || getDefaultSchema(activeConnection)}</span>
        </div>

        <div className="dbp-panel__body">
          <div className="dbp-form-grid">
            <div className="dbp-field">
              <label>Nombre de tabla</label>
              <input
                value={tableForm.table}
                onChange={(event) =>
                  setTableForm((current) => ({
                    ...current,
                    table: event.target.value
                  }))
                }
                placeholder="nueva_tabla"
              />
            </div>

            <div className="dbp-field">
              <label>Schema</label>
              <input
                value={activeSchema || getDefaultSchema(activeConnection)}
                readOnly
              />
            </div>

            <div className="dbp-field dbp-field--wide">
              <label>Columnas</label>
              <textarea
                value={tableForm.columnsText}
                onChange={(event) =>
                  setTableForm((current) => ({
                    ...current,
                    columnsText: event.target.value
                  }))
                }
                placeholder="id INTEGER PRIMARY KEY&#10;nombre TEXT NOT NULL"
              />
            </div>
          </div>

          <div className="dbp-table-structure-help">
            Formato por línea: <strong>nombre TIPO</strong>. Podés agregar{" "}
            <strong>PRIMARY KEY</strong>, <strong>NOT NULL</strong>,{" "}
            <strong>UNIQUE</strong> o <strong>DEFAULT valor</strong>.
          </div>

          <div className="dbp-table-structure-actions">
            <button
              className="dbp-button dbp-button--secondary"
              type="button"
              disabled={!canEditStructure}
              onClick={onPreview}
            >
              Preview SQL
            </button>

            <button
              className="dbp-button dbp-button--primary"
              type="button"
              disabled={!canEditStructure || loading}
              onClick={onCreate}
            >
              Crear tabla
            </button>
          </div>

          {previewSql ? null : null}
        </div>
      </section>
    </>
  );
}

function normalizeColumnForm(columnForm) {
  return {
    name: columnForm.name.trim(),
    type: columnForm.type.trim(),
    nullable: Boolean(columnForm.nullable),
    unique: Boolean(columnForm.unique),
    defaultValue: columnForm.defaultValue.trim()
  };
}

function parseColumnsText(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split(/\s+/);
      const rawDefinition = rest.join(" ");
      const upperDefinition = rawDefinition.toUpperCase();

      const defaultMatch = rawDefinition.match(/\bDEFAULT\s+(.+)$/i);
      const defaultValue = defaultMatch ? defaultMatch[1].trim() : "";

      const type = rawDefinition
        .replace(/\bPRIMARY\s+KEY\b/gi, "")
        .replace(/\bNOT\s+NULL\b/gi, "")
        .replace(/\bUNIQUE\b/gi, "")
        .replace(/\bDEFAULT\s+.+$/gi, "")
        .trim();

      return {
        name,
        type: type || "TEXT",
        primaryKey: upperDefinition.includes("PRIMARY KEY"),
        nullable: !upperDefinition.includes("NOT NULL"),
        unique: upperDefinition.includes("UNIQUE"),
        defaultValue
      };
    });
}

function getDefaultSchema(connection) {
  if (!connection) return "public";
  if (connection.engine === "sqlite") return "main";
  if (connection.engine === "mysql") return connection.database || "";

  return "public";
}