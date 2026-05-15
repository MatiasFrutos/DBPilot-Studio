import { createDatabaseConnection } from "./connection.service.js";

export const schemaService = {
  async listSchemas(connection) {
    const db = createDatabaseConnection(connection);

    return db.listSchemas();
  },

  async listTables(connection) {
    const db = createDatabaseConnection(connection);
    const tables = await db.listTables();

    return groupTablesBySchema(tables);
  },

  async listFlatTables(connection) {
    const db = createDatabaseConnection(connection);

    return db.listTables();
  },

  async listColumns(connection, payload) {
    const db = createDatabaseConnection(connection);

    return db.listColumns(payload);
  },

  async getDatabaseOverview(connection) {
    const db = createDatabaseConnection(connection);

    const [schemas, tables] = await Promise.all([
      db.listSchemas(),
      db.listTables()
    ]);

    const tableCount = tables.filter((item) => item.type === "table").length;
    const viewCount = tables.filter((item) => item.type === "view").length;
    const estimatedRows = tables.reduce((total, table) => {
      return total + Number(table.rows || 0);
    }, 0);

    return {
      schemas,
      tables: groupTablesBySchema(tables),
      flatTables: tables,
      summary: {
        schemas: schemas.length,
        tables: tableCount,
        views: viewCount,
        estimatedRows
      }
    };
  }
};

function groupTablesBySchema(tables = []) {
  const schemaMap = new Map();

  tables.forEach((table) => {
    const schemaName = table.schema || "public";

    if (!schemaMap.has(schemaName)) {
      schemaMap.set(schemaName, {
        name: schemaName,
        tables: []
      });
    }

    schemaMap.get(schemaName).tables.push({
      name: table.name,
      fullName: table.fullName,
      type: table.type,
      rows: table.rows || 0,
      columns: table.columns || 0
    });
  });

  return Array.from(schemaMap.values());
}