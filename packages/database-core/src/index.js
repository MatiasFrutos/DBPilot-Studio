export { createDatabaseConnection, connectionService } from "./services/connection.service.js";
export { schemaService } from "./services/schema.service.js";
export { tableService } from "./services/table.service.js";
export { queryService } from "./services/query.service.js";
export { structureService } from "./services/structure.service.js";
export { exportService, toCsvText, toMarkdownTable } from "./services/export.service.js";
export { documentationService } from "./services/documentation.service.js";

export { postgresDriver } from "./drivers/postgres.driver.js";
export { mysqlDriver } from "./drivers/mysql.driver.js";
export { sqliteDriver } from "./drivers/sqlite.driver.js";

export { buildCreateTableSql } from "./builders/create-table.builder.js";
export { buildAddColumnSql } from "./builders/add-column.builder.js";
export { buildDropColumnSql } from "./builders/drop-column.builder.js";
export { buildDropTableSql, buildRenameTableSql } from "./builders/alter-table.builder.js";

export { analyzeSqlSafety, assertSqlSafe } from "./safety/sql-safety.guard.js";
export {
  assertWrittenConfirmation,
  createDropTableConfirmation,
  createDropColumnConfirmation,
  isDestructiveAction
} from "./safety/destructive-query.guard.js";
export {
  assertReadonlyAllowsQuery,
  assertReadonlyAllowsStructureChange
} from "./safety/readonly-mode.guard.js";

export { normalizeRows, normalizeColumns, normalizeQueryResult } from "./utils/result-normalizer.util.js";
export { quoteIdentifier, splitQualifiedName, normalizeIdentifier } from "./utils/identifier.util.js";
export { getDialect, isSupportedEngine, getDefaultPort } from "./utils/dialect.util.js";
export { compactSql, getQueryType, isSelectQuery, hasWhereClause } from "./utils/sql.util.js";

export const DBPILOT_DATABASE_CORE_VERSION = "0.1.0";

export function createCoreInfo() {
  return {
    name: "DBPilot Database Core",
    version: DBPILOT_DATABASE_CORE_VERSION,
    engines: ["postgresql", "mysql", "sqlite"],
    drivers: ["pg", "mysql2", "better-sqlite3"]
  };
}