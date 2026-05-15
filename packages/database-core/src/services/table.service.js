import { createDatabaseConnection } from "./connection.service.js";
import { splitQualifiedName } from "../utils/identifier.util.js";

export const tableService = {
  async getColumns(connection, payload = {}) {
    const db = createDatabaseConnection(connection);
    const normalizedPayload = normalizeTablePayload(payload, connection);

    return db.listColumns(normalizedPayload);
  },

  async getRows(connection, payload = {}) {
    const db = createDatabaseConnection(connection);
    const normalizedPayload = normalizeTablePayload(payload, connection);

    return db.getTableRows({
      ...normalizedPayload,
      limit: payload.limit || 100,
      offset: payload.offset || 0
    });
  },

  async getTableDetails(connection, payload = {}) {
    const [columns, data] = await Promise.all([
      this.getColumns(connection, payload),
      this.getRows(connection, payload)
    ]);

    return {
      table: normalizeTablePayload(payload, connection),
      columns,
      data
    };
  }
};

function normalizeTablePayload(payload = {}, connection = {}) {
  const tableInput = payload.table || payload.name || "";
  const schemaInput = payload.schema || "";

  if (!tableInput) {
    throw new Error("TABLE_NAME_REQUIRED");
  }

  const qualified = splitQualifiedName(tableInput);

  return {
    schema:
      schemaInput ||
      qualified.schema ||
      getDefaultSchema(connection.engine, connection.database),
    table: qualified.table || tableInput
  };
}

function getDefaultSchema(engine, database) {
  if (engine === "mysql") return database || "";
  if (engine === "sqlite") return "main";

  return "public";
}