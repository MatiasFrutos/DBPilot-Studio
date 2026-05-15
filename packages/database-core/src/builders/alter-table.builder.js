import { quoteIdentifier } from "../utils/identifier.util.js";
import { getDefaultSchema } from "../utils/dialect.util.js";
import { buildQualifiedTableName } from "./create-table.builder.js";

export function buildDropTableSql(engine, payload = {}) {
  const schema = payload.schema || getDefaultSchema(engine, payload.database);
  const table = payload.table || payload.name;

  if (!table) {
    throw new Error("TABLE_NAME_REQUIRED");
  }

  const fullName = buildQualifiedTableName(engine, schema, table);

  return `DROP TABLE ${fullName};`;
}

export function buildRenameTableSql(engine, payload = {}) {
  const schema = payload.schema || getDefaultSchema(engine, payload.database);
  const table = payload.table || payload.name;
  const newName = payload.newName;

  if (!table) {
    throw new Error("TABLE_NAME_REQUIRED");
  }

  if (!newName) {
    throw new Error("NEW_TABLE_NAME_REQUIRED");
  }

  if (engine === "mysql") {
    const oldName = buildQualifiedTableName(engine, schema, table);
    const nextName = buildQualifiedTableName(engine, schema, newName);

    return `RENAME TABLE ${oldName} TO ${nextName};`;
  }

  const fullName = buildQualifiedTableName(engine, schema, table);
  const safeNewName = quoteIdentifier(newName, engine);

  return `ALTER TABLE ${fullName} RENAME TO ${safeNewName};`;
}

export function getDropTableConfirmationText(table) {
  if (!table) {
    throw new Error("TABLE_NAME_REQUIRED");
  }

  return `ELIMINAR ${table}`;
}