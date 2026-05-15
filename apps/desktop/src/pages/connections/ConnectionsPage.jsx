import { useEffect, useMemo, useState } from "react";

import ConnectionCard from "../../components/connection-card/ConnectionCard.jsx";
import EmptyState from "../../components/empty-state/EmptyState.jsx";

import { connectionsClient } from "../../services/connections.client.js";
import { storageClient } from "../../services/storage.client.js";
import { connectionStore, normalizeConnection } from "../../store/connection.store.js";

import "./connections.css";

/* =========================================================
   DBPilot Studio
   Connections Page
   ---------------------------------------------------------
   Página para administrar conexiones reales.

   Estilo:
   - Oscuro tipo Claude.
   - Más compacto.
   - Íconos y motores más visibles.
   - Feedback claro.
   - Responsive.
   ========================================================= */

const INITIAL_FORM = {
  name: "",
  engine: "postgresql",
  host: "127.0.0.1",
  port: "5432",
  user: "",
  password: "",
  database: "",
  filePath: "",
  readonly: false,
  ssl: false
};

const ENGINE_OPTIONS = [
  {
    id: "postgresql",
    label: "PostgreSQL",
    description: "Servidor local o remoto",
    icon: "PG"
  },
  {
    id: "mysql",
    label: "MySQL",
    description: "MySQL / MariaDB",
    icon: "MY"
  },
  {
    id: "sqlite",
    label: "SQLite",
    description: "Archivo local",
    icon: "SQ"
  }
];

export default function ConnectionsPage({ onNavigate }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [storeState, setStoreState] = useState(connectionStore.getState());
  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });
  const [loadingAction, setLoadingAction] = useState("");

  const connections = storeState.connections;
  const engine = form.engine;

  const formTitle = useMemo(() => {
    if (engine === "postgresql") return "Nueva conexión PostgreSQL";
    if (engine === "mysql") return "Nueva conexión MySQL / MariaDB";
    return "Abrir archivo SQLite";
  }, [engine]);

  const selectedEngine = useMemo(() => {
    return ENGINE_OPTIONS.find((option) => option.id === engine) || ENGINE_OPTIONS[0];
  }, [engine]);

  useEffect(() => {
    const unsubscribe = connectionStore.subscribe(setStoreState);

    connectionsClient.loadConnections();

    return unsubscribe;
  }, []);

  function updateField(field, value) {
    setForm((currentForm) => {
      const nextForm = {
        ...currentForm,
        [field]: value
      };

      if (field === "engine") {
        if (value === "postgresql") {
          nextForm.port = "5432";
          nextForm.host = "127.0.0.1";
          nextForm.filePath = "";
        }

        if (value === "mysql") {
          nextForm.port = "3306";
          nextForm.host = "127.0.0.1";
          nextForm.filePath = "";
        }

        if (value === "sqlite") {
          nextForm.port = "";
          nextForm.host = "";
          nextForm.user = "";
          nextForm.password = "";
          nextForm.database = "";
        }
      }

      return nextForm;
    });
  }

  function clearFeedback() {
    setFeedback({
      type: "",
      message: ""
    });
  }

  function setSuccess(message) {
    setFeedback({
      type: "success",
      message
    });
  }

  function setError(message) {
    setFeedback({
      type: "error",
      message
    });
  }

  function validateConnectionInput(connectionInput) {
    const connection = normalizeConnection(connectionInput);

    if (!connection.name?.trim()) {
      return "El nombre de la conexión es obligatorio.";
    }

    if (connection.engine === "sqlite") {
      if (!connection.filePath?.trim()) {
        return "El archivo SQLite es obligatorio.";
      }

      return "";
    }

    if (!connection.host?.trim()) {
      return "El host de base de datos es obligatorio.";
    }

    if (!String(connection.port || "").trim()) {
      return "El puerto de base de datos es obligatorio.";
    }

    if (!connection.user?.trim()) {
      return "El usuario de base de datos es obligatorio.";
    }

    if (!connection.database?.trim()) {
      return "El nombre de la base de datos es obligatorio.";
    }

    return "";
  }

  async function handleOpenSqliteFile() {
    try {
      if (!window.dbpilot?.sqlite?.openFile) {
        setError("El bridge para abrir SQLite no está disponible.");
        return;
      }

      const response = await window.dbpilot.sqlite.openFile();

      if (!response.ok) {
        setError(response.error || "No se pudo abrir el archivo SQLite.");
        return;
      }

      if (response.data?.canceled) {
        return;
      }

      updateField("filePath", response.data.filePath);

      if (!form.name) {
        updateField("name", getFileBaseName(response.data.filePath));
      }
    } catch (error) {
      setError(error.message || "Error al seleccionar SQLite.");
    }
  }

  async function handleSaveConnection() {
    clearFeedback();
    setLoadingAction("save");

    const normalizedConnection = normalizeConnection(form);
    const validationError = validateConnectionInput(normalizedConnection);

    if (validationError) {
      setLoadingAction("");
      setError(validationError);
      return;
    }

    const response = await connectionsClient.saveConnection(normalizedConnection);

    setLoadingAction("");

    if (!response.ok) {
      setError(response.error);
      return;
    }

    setSuccess("Conexión guardada correctamente.");

    setForm({
      ...INITIAL_FORM,
      engine: form.engine,
      port: form.engine === "mysql" ? "3306" : form.engine === "postgresql" ? "5432" : "",
      host: form.engine === "sqlite" ? "" : "127.0.0.1"
    });
  }

  async function handleTestConnection(connectionInput = form) {
    clearFeedback();
    setLoadingAction(`test-${connectionInput?.id || "form"}`);

    const normalizedConnection = normalizeConnection(connectionInput);
    const validationError = validateConnectionInput(normalizedConnection);

    if (validationError) {
      setLoadingAction("");

      if (normalizedConnection.id) {
        connectionStore.updateConnection(normalizedConnection.id, {
          status: "error"
        });

        await storageClient.write(
          "connections",
          connectionStore.getState().connections
        );
      }

      setError(validationError);
      return;
    }

    const response = await connectionsClient.testConnection(normalizedConnection);

    setLoadingAction("");

    if (!response.ok) {
      connectionStore.updateConnection(normalizedConnection.id, {
        status: "error"
      });

      await storageClient.write(
        "connections",
        connectionStore.getState().connections
      );

      setError(response.error);
      return;
    }

    connectionStore.addConnection({
      ...normalizedConnection,
      status: "connected"
    });

    await storageClient.write(
      "connections",
      connectionStore.getState().connections
    );

    setSuccess(response.data?.message || "Conexión correcta.");
  }

  async function handleOpenConnection(connection) {
    const normalizedConnection = normalizeConnection(connection);
    const validationError = validateConnectionInput(normalizedConnection);

    if (validationError) {
      connectionStore.updateConnection(normalizedConnection.id, {
        status: "error"
      });

      await storageClient.write(
        "connections",
        connectionStore.getState().connections
      );

      setError(validationError);
      return;
    }

    connectionStore.setActiveConnection({
      ...normalizedConnection,
      status: "connected"
    });

    setSuccess(`Conexión activa: ${normalizedConnection.name}`);

    onNavigate?.("explorer");
  }

  async function handleDeleteConnection(connection) {
    clearFeedback();
    setLoadingAction(`delete-${connection.id}`);

    const response = await connectionsClient.removeConnection(connection.id);

    setLoadingAction("");

    if (!response.ok) {
      setError(response.error);
      return;
    }

    setSuccess("Conexión eliminada.");
  }

  function handleEditConnection(connection) {
    const normalizedConnection = normalizeConnection(connection);

    setForm({
      ...INITIAL_FORM,
      ...normalizedConnection
    });

    setSuccess("Conexión cargada para editar.");
  }

  return (
    <div className="dbp-page dbp-connections-page">
      <section className="dbp-connections-hero">
        <div>
          <p className="dbp-connections-hero__eyebrow">Database access</p>
          <h1>Conexiones reales</h1>
          <span>
            Administrá accesos PostgreSQL, MySQL/MariaDB y SQLite desde un panel
            local, liviano y seguro para operar bases reales.
          </span>
        </div>

        <div className="dbp-connections-hero__status">
          <span>Conexiones</span>
          <strong>{connections.length}</strong>
          <small>{selectedEngine.label} seleccionado</small>
        </div>
      </section>

      {feedback.message ? (
        <div
          className={[
            "dbp-connections-feedback",
            feedback.type ? `dbp-connections-feedback--${feedback.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span>{feedback.type === "error" ? "Error" : "OK"}</span>
          <strong>{feedback.message}</strong>
        </div>
      ) : null}

      <section className="dbp-page-grid dbp-connections-grid">
        <div className="dbp-panel dbp-connections-page__form-panel">
          <div className="dbp-panel__header">
            <div>
              <h2>{formTitle}</h2>
              <p>Completá credenciales, probá el acceso y guardá la conexión.</p>
            </div>

            <span>Bridge real</span>
          </div>

          <div className="dbp-panel__body">
            <div className="dbp-connection-tabs">
              {ENGINE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={[
                    engine === option.id ? "is-active" : "",
                    `dbp-connection-tabs__item--${option.id}`
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  type="button"
                  onClick={() => updateField("engine", option.id)}
                >
                  <span>{option.icon}</span>

                  <strong>{option.label}</strong>

                  <small>{option.description}</small>
                </button>
              ))}
            </div>

            <form className="dbp-connection-form">
              <div className="dbp-form-grid">
                <div className="dbp-field">
                  <label>Nombre de conexión</label>
                  <input
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Ej: CRM7 Local"
                  />
                </div>

                <div className="dbp-field">
                  <label>Motor</label>
                  <input
                    value={getEngineLabel(engine)}
                    readOnly
                  />
                </div>

                {engine !== "sqlite" ? (
                  <>
                    <div className="dbp-field">
                      <label>Host</label>
                      <input
                        value={form.host}
                        onChange={(event) => updateField("host", event.target.value)}
                        placeholder="127.0.0.1"
                      />
                    </div>

                    <div className="dbp-field">
                      <label>Puerto</label>
                      <input
                        value={form.port}
                        onChange={(event) => updateField("port", event.target.value)}
                        placeholder={engine === "postgresql" ? "5432" : "3306"}
                      />
                    </div>

                    <div className="dbp-field">
                      <label>Usuario</label>
                      <input
                        value={form.user}
                        onChange={(event) => updateField("user", event.target.value)}
                        placeholder="postgres"
                        autoComplete="username"
                      />
                    </div>

                    <div className="dbp-field">
                      <label>Contraseña</label>
                      <input
                        value={form.password}
                        onChange={(event) => updateField("password", event.target.value)}
                        type="password"
                        placeholder="Contraseña"
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="dbp-field">
                      <label>Base de datos</label>
                      <input
                        value={form.database}
                        onChange={(event) => updateField("database", event.target.value)}
                        placeholder="crm7"
                      />
                    </div>

                    <div className="dbp-field">
                      <label>SSL</label>
                      <select
                        value={form.ssl ? "yes" : "no"}
                        onChange={(event) => updateField("ssl", event.target.value === "yes")}
                      >
                        <option value="no">No</option>
                        <option value="yes">Sí</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="dbp-field dbp-field--wide">
                    <label>Archivo SQLite</label>

                    <div className="dbp-connections-file-row">
                      <input
                        value={form.filePath}
                        onChange={(event) => updateField("filePath", event.target.value)}
                        placeholder="Seleccionar archivo .db / .sqlite / .sqlite3"
                      />

                      <button
                        className="dbp-button dbp-button--secondary"
                        type="button"
                        onClick={handleOpenSqliteFile}
                      >
                        Buscar
                      </button>
                    </div>
                  </div>
                )}

                <div className="dbp-field">
                  <label>Modo</label>
                  <select
                    value={form.readonly ? "readonly" : "normal"}
                    onChange={(event) => updateField("readonly", event.target.value === "readonly")}
                  >
                    <option value="normal">Lectura y escritura</option>
                    <option value="readonly">Solo lectura</option>
                  </select>
                </div>
              </div>

              <div className="dbp-connection-form__actions">
                <button
                  className="dbp-button dbp-button--secondary"
                  type="button"
                  disabled={Boolean(loadingAction)}
                  onClick={() => handleTestConnection()}
                >
                  {loadingAction === "test-form" ? "Probando..." : "Probar conexión"}
                </button>

                <button
                  className="dbp-button dbp-button--primary"
                  type="button"
                  disabled={Boolean(loadingAction)}
                  onClick={handleSaveConnection}
                >
                  {loadingAction === "save" ? "Guardando..." : "Guardar conexión"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="dbp-panel dbp-connections-page__list-panel">
          <div className="dbp-panel__header">
            <div>
              <h2>Conexiones guardadas</h2>
              <p>Accesos disponibles para abrir, probar o editar.</p>
            </div>

            <span>{connections.length} items</span>
          </div>

          <div className="dbp-panel__body">
            {connections.length ? (
              <div className="dbp-connection-list">
                {connections.map((connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    active={storeState.activeConnection?.id === connection.id}
                    loadingAction={loadingAction}
                    onTest={handleTestConnection}
                    onOpen={handleOpenConnection}
                    onEdit={handleEditConnection}
                    onDelete={handleDeleteConnection}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="⛁"
                eyebrow="Sin conexiones"
                title="Todavía no hay conexiones guardadas"
                description="Cargá una conexión PostgreSQL, MySQL o SQLite para empezar a explorar tablas reales."
                primaryActionLabel="Guardar primera conexión"
                onPrimaryAction={handleSaveConnection}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function getEngineLabel(engine) {
  if (engine === "postgresql") return "PostgreSQL";
  if (engine === "mysql") return "MySQL / MariaDB";
  return "SQLite";
}

function getFileBaseName(filePath) {
  return String(filePath || "")
    .split(/[\\/]/)
    .pop()
    .replace(/\.(db|sqlite|sqlite3)$/i, "");
}