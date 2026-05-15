import { createDatabaseConnection } from "./connection.service.js";
import { buildCreateTableSql } from "../builders/create-table.builder.js";
import { buildAddColumnSql } from "../builders/add-column.builder.js";
import {
  buildDropColumnSql,
  getDropColumnConfirmationText
} from "../builders/drop-column.builder.js";
import {
  buildDropTableSql,
  getDropTableConfirmationText
} from "../builders/alter-table.builder.js";
import { assertWrittenConfirmation } from "../safety/destructive-query.guard.js";
import { assertReadonlyAllowsStructureChange } from "../safety/readonly-mode.guard.js";

export const structureService = {
  async createTable(connection, payload = {}) {
    assertReadonlyAllowsStructureChange(connection.readonly);

    const sql = buildCreateTableSql(connection.engine, {
      ...payload,
      database: connection.database
    });

    const db = createDatabaseConnection(connection);

    return db.executeQuery({
      query: sql
    });
  },

  async dropTable(connection, payload = {}) {
    assertReadonlyAllowsStructureChange(connection.readonly);

    const table = payload.table || payload.name;

    const requiredText = getDropTableConfirmationText(table);

    assertWrittenConfirmation({
      expectedText: requiredText,
      receivedText: payload.confirmedText
    });

    const sql = buildDropTableSql(connection.engine, {
      ...payload,
      database: connection.database
    });

    const db = createDatabaseConnection(connection);

    return db.executeQuery({
      query: sql
    });
  },

  async addColumn(connection, payload = {}) {
    assertReadonlyAllowsStructureChange(connection.readonly);

    const sql = buildAddColumnSql(connection.engine, {
      ...payload,
      database: connection.database
    });

    const db = createDatabaseConnection(connection);

    return db.executeQuery({
      query: sql
    });
  },

  async dropColumn(connection, payload = {}) {
    assertReadonlyAllowsStructureChange(connection.readonly);

    const columnName = payload.columnName || payload.column?.name;

    const requiredText = getDropColumnConfirmationText(columnName);

    assertWrittenConfirmation({
      expectedText: requiredText,
      receivedText: payload.confirmedText
    });

    const sql = buildDropColumnSql(connection.engine, {
      ...payload,
      database: connection.database
    });

    const db = createDatabaseConnection(connection);

    return db.executeQuery({
      query: sql
    });
  },

  previewCreateTable(connection, payload = {}) {
    return buildCreateTableSql(connection.engine, {
      ...payload,
      database: connection.database
    });
  },

  previewAddColumn(connection, payload = {}) {
    return buildAddColumnSql(connection.engine, {
      ...payload,
      database: connection.database
    });
  },

  previewDropColumn(connection, payload = {}) {
    return buildDropColumnSql(connection.engine, {
      ...payload,
      database: connection.database
    });
  },

  previewDropTable(connection, payload = {}) {
    return buildDropTableSql(connection.engine, {
      ...payload,
      database: connection.database
    });
  }
};