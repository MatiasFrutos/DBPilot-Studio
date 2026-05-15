import { quoteIdentifier } from "../utils/identifier.util.js";
import { getDefaultSchema } from "../utils/dialect.util.js";
import { buildQualifiedTableName } from "./create-table.builder.js";

export function buildAddColumnSql(engine, payload = {}) {
  const schema = payload.schema || getDefaultSchema(engine, payload.database);
  const table = payload.table || payload.name;
  const column = payload.column || {};

  if (!table) {
    throw new Error("TABLE_NAME_REQUIRED");
  }

  if (!column.name) {
    throw new Error("COLUMN_NAME_REQUIRED");
  }

  if (!column.type) {
    throw new Error("COLUMN_TYPE_REQUIRED");
  }

  const fullName = buildQualifiedTableName(engine, schema, table);
  const columnName = quoteIdentifier(column.name, engine);
  const columnType = String(column.type).trim();
  const nullable = column.nullable === false ? " NOT NULL" : "";
  const unique = column.unique ? " UNIQUE" : "";
  const defaultValue = column.defaultValue ? ` DEFAULT ${column.defaultValue}` : "";

  return `ALTER TABLE ${fullName} ADD COLUMN ${columnName} ${columnType}${nullable}${unique}${defaultValue};`;
}