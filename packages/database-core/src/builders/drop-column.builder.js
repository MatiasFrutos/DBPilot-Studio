import { quoteIdentifier } from "../utils/identifier.util.js";
import { getDefaultSchema } from "../utils/dialect.util.js";
import { buildQualifiedTableName } from "./create-table.builder.js";

export function buildDropColumnSql(engine, payload = {}) {
  const schema = payload.schema || getDefaultSchema(engine, payload.database);
  const table = payload.table || payload.name;
  const columnNameRaw = payload.columnName || payload.column?.name;

  if (!table) {
    throw new Error("TABLE_NAME_REQUIRED");
  }

  if (!columnNameRaw) {
    throw new Error("COLUMN_NAME_REQUIRED");
  }

  const fullName = buildQualifiedTableName(engine, schema, table);
  const columnName = quoteIdentifier(columnNameRaw, engine);

  return `ALTER TABLE ${fullName} DROP COLUMN ${columnName};`;
}

export function getDropColumnConfirmationText(columnName) {
  if (!columnName) {
    throw new Error("COLUMN_NAME_REQUIRED");
  }

  return `ELIMINAR ${columnName}`;
}