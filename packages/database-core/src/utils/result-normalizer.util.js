export function normalizeQueryResult(result = {}, meta = {}) {
  const rows = normalizeRows(result.rows || result);
  const columns = normalizeColumns(result.fields, rows);

  return {
    ok: true,
    engine: meta.engine || "",
    durationMs: Number(meta.durationMs || 0),
    rowCount: getRowCount(result, rows),
    affectedRows: Number(result.affectedRows || result.rowCount || 0),
    insertId: result.insertId || null,
    columns,
    rows,
    message: createResultMessage(result, rows)
  };
}

export function normalizeRows(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => {
    if (!row || typeof row !== "object") {
      return {
        value: row
      };
    }

    return normalizeRowValues(row);
  });
}

export function normalizeColumns(fields, rows = []) {
  if (Array.isArray(fields) && fields.length) {
    return fields.map((field) => ({
      key: field.name || field.columnID || field.orgName || String(field),
      name: field.name || field.columnID || field.orgName || String(field),
      label: field.name || field.columnID || field.orgName || String(field),
      type: field.dataTypeID || field.columnType || field.type || ""
    }));
  }

  const firstRow = rows[0];

  if (!firstRow || typeof firstRow !== "object") {
    return [];
  }

  return Object.keys(firstRow).map((key) => ({
    key,
    name: key,
    label: key,
    type: ""
  }));
}

function normalizeRowValues(row) {
  return Object.entries(row).reduce((acc, [key, value]) => {
    acc[key] = normalizeValue(value);
    return acc;
  }, {});
}

function normalizeValue(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
    return value.toString("base64");
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  return value;
}

function getRowCount(result, rows) {
  if (typeof result.rowCount === "number") {
    return result.rowCount;
  }

  if (typeof result.affectedRows === "number") {
    return result.affectedRows;
  }

  return rows.length;
}

function createResultMessage(result, rows) {
  if (typeof result.affectedRows === "number") {
    return `${result.affectedRows} fila(s) afectada(s).`;
  }

  if (typeof result.rowCount === "number") {
    return `${result.rowCount} fila(s).`;
  }

  return `${rows.length} fila(s).`;
}