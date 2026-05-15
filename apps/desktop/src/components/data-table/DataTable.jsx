import "./data-table.css";

export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyTitle = "Sin datos para mostrar",
  emptyDescription = "Cuando ejecutes una consulta o selecciones una tabla, los registros aparecerán acá.",
  onRowClick
}) {
  const normalizedColumns = normalizeColumns(columns, rows);

  if (loading) {
    return (
      <div className="dbp-data-table dbp-data-table--state">
        <div className="dbp-data-table__loader"></div>
        <strong>Cargando datos...</strong>
        <p>Consultando información de la base.</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="dbp-data-table dbp-data-table--state">
        <div className="dbp-data-table__empty-icon">▤</div>
        <strong>{emptyTitle}</strong>
        <p>{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="dbp-data-table">
      <table>
        <thead>
          <tr>
            {normalizedColumns.map((column) => (
              <th key={column.key}>
                <span>{column.label}</span>
                {column.type ? <small>{column.type}</small> : null}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id || row.uuid || rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
            >
              {normalizedColumns.map((column) => (
                <td key={`${rowIndex}-${column.key}`}>
                  {formatCellValue(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeColumns(columns, rows) {
  if (columns.length) {
    return columns.map((column) => {
      if (typeof column === "string") {
        return {
          key: column,
          label: column,
          type: ""
        };
      }

      return {
        key: column.key || column.name,
        label: column.label || column.name || column.key,
        type: column.type || ""
      };
    });
  }

  const firstRow = rows[0];

  if (!firstRow || typeof firstRow !== "object") {
    return [];
  }

  return Object.keys(firstRow).map((key) => ({
    key,
    label: key,
    type: ""
  }));
}

function formatCellValue(value) {
  if (value === null) return <span className="dbp-data-table__null">NULL</span>;
  if (typeof value === "undefined") return <span className="dbp-data-table__null">undefined</span>;
  if (typeof value === "boolean") return value ? "true" : "false";

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}