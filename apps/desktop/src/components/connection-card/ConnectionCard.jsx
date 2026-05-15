import "./connection-card.css";

/* =========================================================
   DBPilot Studio
   ConnectionCard Component
   ---------------------------------------------------------
   Tarjeta individual para conexiones guardadas.

   Responsabilidades:
   - Mostrar motor, host/base/archivo y usuario.
   - Mostrar estado: pendiente, conectada o error.
   - Acciones: probar, abrir, editar y eliminar.
   - Mantener compatibilidad visual con theme oscuro tipo Claude.
   ========================================================= */

const ENGINE_META = {
  postgresql: {
    label: "PostgreSQL",
    short: "PG",
    icon: "PG",
    tone: "postgresql"
  },
  mysql: {
    label: "MySQL",
    short: "MY",
    icon: "MY",
    tone: "mysql"
  },
  sqlite: {
    label: "SQLite",
    short: "SQ",
    icon: "SQ",
    tone: "sqlite"
  }
};

export default function ConnectionCard({
  connection,
  active = false,
  loadingAction = "",
  onOpen,
  onTest,
  onEdit,
  onDelete
}) {
  const safeConnection = normalizeConnection(connection);
  const engine = ENGINE_META[safeConnection.engine] || ENGINE_META.postgresql;

  const isTesting = loadingAction === `test-${safeConnection.id}`;
  const isDeleting = loadingAction === `delete-${safeConnection.id}`;

  return (
    <article
      className={[
        "dbp-connection-card-component",
        `dbp-connection-card-component--engine-${engine.tone}`,
        active ? "dbp-connection-card-component--active" : "",
        safeConnection.status === "error" ? "dbp-connection-card-component--error" : "",
        safeConnection.status === "connected" ? "dbp-connection-card-component--connected" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="dbp-connection-card-component__main">
        <div className="dbp-connection-card-component__icon">
          <span>{engine.icon}</span>
        </div>

        <div className="dbp-connection-card-component__content">
          <div className="dbp-connection-card-component__head">
            <div>
              <h3>{safeConnection.name}</h3>

              <p>
                {engine.label}
                {safeConnection.engine === "sqlite"
                  ? ` · ${safeConnection.filePath || "Archivo no seleccionado"}`
                  : ` · ${safeConnection.host}:${safeConnection.port}`}
              </p>
            </div>

            <span
              className={[
                "dbp-connection-card-component__status",
                safeConnection.status === "connected"
                  ? "dbp-connection-card-component__status--ok"
                  : "",
                safeConnection.status === "error"
                  ? "dbp-connection-card-component__status--error"
                  : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {getStatusLabel(safeConnection.status)}
            </span>
          </div>

          <div className="dbp-connection-card-component__meta">
            <span>{engine.short}</span>
            <span>{safeConnection.database || "Sin base definida"}</span>
            {safeConnection.user ? <span>{safeConnection.user}</span> : null}
            {safeConnection.readonly ? <span>Solo lectura</span> : null}
            {safeConnection.ssl ? <span>SSL</span> : null}
          </div>
        </div>
      </div>

      <div className="dbp-connection-card-component__actions">
        <button
          type="button"
          disabled={isTesting || isDeleting}
          onClick={() => onTest?.(safeConnection)}
        >
          {isTesting ? "Probando..." : "Probar"}
        </button>

        <button
          className="dbp-connection-card-component__primary"
          type="button"
          disabled={isTesting || isDeleting}
          onClick={() => onOpen?.(safeConnection)}
        >
          Abrir
        </button>

        <button
          type="button"
          disabled={isTesting || isDeleting}
          onClick={() => onEdit?.(safeConnection)}
        >
          Editar
        </button>

        <button
          className="dbp-connection-card-component__danger"
          type="button"
          disabled={isTesting || isDeleting}
          onClick={() => onDelete?.(safeConnection)}
        >
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </article>
  );
}

function normalizeConnection(connection) {
  return {
    id: connection?.id || cryptoFallbackId(),
    name: connection?.name || "Conexión sin nombre",
    engine: connection?.engine || "postgresql",
    host: connection?.host || "127.0.0.1",
    port: connection?.port || "5432",
    user: connection?.user || "",
    password: connection?.password || "",
    database: connection?.database || "",
    filePath: connection?.filePath || "",
    readonly: Boolean(connection?.readonly),
    ssl: Boolean(connection?.ssl),
    status: connection?.status || "pending"
  };
}

function getStatusLabel(status) {
  const labels = {
    connected: "Conectada",
    pending: "Pendiente",
    error: "Error"
  };

  return labels[status] || "Pendiente";
}

function cryptoFallbackId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `connection-${Date.now()}`;
}