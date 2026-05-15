import "./table-tree.css";

export default function TableTree({
  schemas = [],
  activeTable = "",
  onSelectTable,
  onSelectSchema
}) {
  const normalizedSchemas = normalizeSchemas(schemas);

  if (!normalizedSchemas.length) {
    return (
      <div className="dbp-table-tree dbp-table-tree--empty">
        <span>▦</span>
        <strong>Sin estructura cargada</strong>
        <p>Seleccioná una conexión para listar schemas, tablas y vistas.</p>
      </div>
    );
  }

  return (
    <div className="dbp-table-tree">
      {normalizedSchemas.map((schema) => (
        <section className="dbp-table-tree__schema" key={schema.name}>
          <button
            className="dbp-table-tree__schema-button"
            type="button"
            onClick={() => onSelectSchema?.(schema)}
          >
            <span>▾</span>
            <strong>{schema.name}</strong>
            <small>{schema.tables.length}</small>
          </button>

          <div className="dbp-table-tree__items">
            {schema.tables.map((table) => {
              const fullName = `${schema.name}.${table.name}`;
              const isActive = activeTable === fullName || activeTable === table.name;

              return (
                <button
                  key={fullName}
                  className={[
                    "dbp-table-tree__item",
                    isActive ? "dbp-table-tree__item--active" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  type="button"
                  onClick={() => onSelectTable?.({ ...table, schema: schema.name, fullName })}
                >
                  <span>{table.type === "view" ? "◇" : "▤"}</span>

                  <div>
                    <strong>{table.name}</strong>
                    <small>
                      {table.columns || 0} columnas
                      {typeof table.rows !== "undefined" ? ` · ${table.rows} filas` : ""}
                    </small>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function normalizeSchemas(schemas) {
  if (!Array.isArray(schemas)) return [];

  return schemas.map((schema) => ({
    name: schema.name || "public",
    tables: Array.isArray(schema.tables) ? schema.tables : []
  }));
}