import { normalizeError } from "../utils/validators.util.js";

export const databaseClient = {
  async testConnection(connection) {
    return invokeDatabaseMethod("testConnection", connection);
  },

  async listTables(connection) {
    return invokeDatabaseMethod("listTables", {
      connection
    });
  },

  async listColumns({ connection, schema, table }) {
    return invokeDatabaseMethod("listColumns", {
      connection,
      schema,
      table
    });
  },

  async getTableRows({ connection, schema, table, limit = 100, offset = 0 }) {
    return invokeDatabaseMethod("getTableRows", {
      connection,
      schema,
      table,
      limit,
      offset
    });
  },

  async executeQuery({ connection, query, values = [] }) {
    return invokeDatabaseMethod("executeQuery", {
      connection,
      query,
      values
    });
  },

  async createTable({ connection, schema, table, columns }) {
    return invokeDatabaseMethod("createTable", {
      connection,
      schema,
      table,
      columns
    });
  },

  async dropTable({ connection, schema, table, confirmedText }) {
    return invokeDatabaseMethod("dropTable", {
      connection,
      schema,
      table,
      confirmedText
    });
  },

  async addColumn({ connection, schema, table, column }) {
    return invokeDatabaseMethod("addColumn", {
      connection,
      schema,
      table,
      column
    });
  },

  async dropColumn({ connection, schema, table, columnName, confirmedText }) {
    return invokeDatabaseMethod("dropColumn", {
      connection,
      schema,
      table,
      columnName,
      confirmedText
    });
  },

  async previewCreateTable({ connection, schema, table, columns }) {
    return invokeDatabaseMethod("previewCreateTable", {
      connection,
      schema,
      table,
      columns
    });
  },

  async previewAddColumn({ connection, schema, table, column }) {
    return invokeDatabaseMethod("previewAddColumn", {
      connection,
      schema,
      table,
      column
    });
  }
};

async function invokeDatabaseMethod(methodName, payload) {
  try {
    assertBridgeMethod("database", methodName);

    const response = await window.dbpilot.database[methodName](payload);

    return normalizeResponse(response);
  } catch (error) {
    return {
      ok: false,
      data: null,
      error: normalizeError(error)
    };
  }
}

function assertBridgeMethod(namespace, methodName) {
  if (typeof window === "undefined") {
    throw new Error("WINDOW_NOT_AVAILABLE");
  }

  if (!window.dbpilot) {
    throw new Error("DBPILOT_BRIDGE_NOT_AVAILABLE");
  }

  if (!window.dbpilot[namespace]) {
    throw new Error(`DBPILOT_BRIDGE_NAMESPACE_NOT_AVAILABLE: ${namespace}`);
  }

  if (typeof window.dbpilot[namespace][methodName] !== "function") {
    throw new Error(`DBPILOT_BRIDGE_METHOD_NOT_AVAILABLE: ${namespace}.${methodName}`);
  }
}

function normalizeResponse(response) {
  if (!response) {
    return {
      ok: false,
      data: null,
      error: "Respuesta vacía desde el bridge."
    };
  }

  if (typeof response.ok === "boolean") {
    return response;
  }

  return {
    ok: true,
    data: response,
    error: ""
  };
}