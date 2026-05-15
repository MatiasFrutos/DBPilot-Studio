const CONNECTION_STORE_KEY = "dbpilot_connection_store_v1";

const initialState = {
  connections: [],
  activeConnection: null,
  recentConnections: [],
  lastTestResult: null,
  schemaOverview: null,
  activeSchema: "",
  activeTable: "",
  activeColumns: [],
  activeRows: []
};

let state = loadInitialState();
const listeners = new Set();

export const connectionStore = {
  getState() {
    return clone(state);
  },

  setState(partialState) {
    state = {
      ...state,
      ...partialState,
      updatedAt: new Date().toISOString()
    };

    persistState();
    notifyListeners();

    return this.getState();
  },

  setConnections(connections) {
    return this.setState({
      connections: Array.isArray(connections) ? connections.map(normalizeConnection) : []
    });
  },

  addConnection(connection) {
    const normalizedConnection = normalizeConnection(connection);

    const exists = state.connections.some(
      (item) => item.id === normalizedConnection.id
    );

    const nextConnections = exists
      ? state.connections.map((item) =>
          item.id === normalizedConnection.id ? normalizedConnection : item
        )
      : [normalizedConnection, ...state.connections];

    return this.setState({
      connections: nextConnections
    });
  },

  updateConnection(connectionId, patch) {
    const nextConnections = state.connections.map((connection) => {
      if (connection.id !== connectionId) return connection;

      return normalizeConnection({
        ...connection,
        ...patch,
        id: connection.id
      });
    });

    const nextActiveConnection =
      state.activeConnection?.id === connectionId
        ? nextConnections.find((connection) => connection.id === connectionId) || null
        : state.activeConnection;

    return this.setState({
      connections: nextConnections,
      activeConnection: nextActiveConnection
    });
  },

  removeConnection(connectionId) {
    const nextConnections = state.connections.filter(
      (connection) => connection.id !== connectionId
    );

    const nextActiveConnection =
      state.activeConnection?.id === connectionId ? null : state.activeConnection;

    const nextRecentConnections = state.recentConnections.filter(
      (connection) => connection.id !== connectionId
    );

    return this.setState({
      connections: nextConnections,
      activeConnection: nextActiveConnection,
      recentConnections: nextRecentConnections
    });
  },

  setActiveConnection(connection) {
    const normalizedConnection = connection ? normalizeConnection(connection) : null;

    const nextRecentConnections = normalizedConnection
      ? [
          normalizedConnection,
          ...state.recentConnections.filter(
            (item) => item.id !== normalizedConnection.id
          )
        ].slice(0, 8)
      : state.recentConnections;

    return this.setState({
      activeConnection: normalizedConnection,
      recentConnections: nextRecentConnections,
      schemaOverview: null,
      activeSchema: "",
      activeTable: "",
      activeColumns: [],
      activeRows: []
    });
  },

  setConnectionStatus(connectionId, status) {
    return this.updateConnection(connectionId, {
      status
    });
  },

  setLastTestResult(result) {
    return this.setState({
      lastTestResult: result || null
    });
  },

  setSchemaOverview(schemaOverview) {
    return this.setState({
      schemaOverview: schemaOverview || null
    });
  },

  setActiveTable({ schema = "", table = "", columns = [], rows = [] } = {}) {
    return this.setState({
      activeSchema: schema,
      activeTable: table,
      activeColumns: columns,
      activeRows: rows
    });
  },

  setActiveColumns(columns = []) {
    return this.setState({
      activeColumns: Array.isArray(columns) ? columns : []
    });
  },

  setActiveRows(rows = []) {
    return this.setState({
      activeRows: Array.isArray(rows) ? rows : []
    });
  },

  clear() {
    state = {
      ...initialState
    };

    persistState();
    notifyListeners();

    return this.getState();
  },

  subscribe(listener) {
    if (typeof listener !== "function") {
      return () => {};
    }

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }
};

export function normalizeConnection(connection = {}) {
  const engine = connection.engine || "postgresql";

  return {
    id: connection.id || createId("connection"),
    name: connection.name || "Conexión sin nombre",
    engine,
    host: engine === "sqlite" ? "" : connection.host || "127.0.0.1",
    port: engine === "sqlite" ? "" : String(connection.port || getDefaultPort(engine)),
    user: engine === "sqlite" ? "" : connection.user || "",
    password: engine === "sqlite" ? "" : connection.password || "",
    database: connection.database || "",
    filePath: engine === "sqlite" ? connection.filePath || "" : "",
    readonly: Boolean(connection.readonly),
    ssl: Boolean(connection.ssl),
    status: connection.status || "pending",
    createdAt: connection.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function getDefaultPort(engine) {
  const ports = {
    postgresql: "5432",
    mysql: "3306",
    sqlite: ""
  };

  return ports[engine] || "";
}

function loadInitialState() {
  try {
    const rawState = localStorage.getItem(CONNECTION_STORE_KEY);

    if (!rawState) {
      return {
        ...initialState
      };
    }

    const parsedState = JSON.parse(rawState);

    return {
      ...initialState,
      ...parsedState
    };
  } catch {
    return {
      ...initialState
    };
  }
}

function persistState() {
  try {
    localStorage.setItem(CONNECTION_STORE_KEY, JSON.stringify(state));
  } catch {
    /*
      Fallback silencioso. El bridge de storage será la fuente fuerte.
    */
  }
}

function notifyListeners() {
  const snapshot = clone(state);

  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error("[DBPILOT_CONNECTION_STORE_LISTENER_ERROR]", error);
    }
  });
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}