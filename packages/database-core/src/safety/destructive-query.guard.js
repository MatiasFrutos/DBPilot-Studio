export function assertWrittenConfirmation({ expectedText, receivedText }) {
  const expected = String(expectedText || "").trim();
  const received = String(receivedText || "").trim();

  if (!expected) {
    throw new Error("CONFIRMATION_EXPECTED_TEXT_REQUIRED");
  }

  if (received !== expected) {
    throw new Error(`CONFIRMATION_REQUIRED: ${expected}`);
  }

  return true;
}

export function createDropTableConfirmation(tableName) {
  if (!tableName) {
    throw new Error("TABLE_NAME_REQUIRED");
  }

  return `ELIMINAR ${tableName}`;
}

export function createDropColumnConfirmation(columnName) {
  if (!columnName) {
    throw new Error("COLUMN_NAME_REQUIRED");
  }

  return `ELIMINAR ${columnName}`;
}

export function isDestructiveAction(action) {
  return [
    "DROP_TABLE",
    "DROP_COLUMN",
    "TRUNCATE_TABLE",
    "DELETE_WITHOUT_WHERE",
    "UPDATE_WITHOUT_WHERE"
  ].includes(String(action || "").toUpperCase());
}