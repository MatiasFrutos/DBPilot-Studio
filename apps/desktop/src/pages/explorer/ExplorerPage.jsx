import { useEffect, useMemo, useState } from "react";

import DataTable from "../../components/data-table/DataTable.jsx";
import EmptyState from "../../components/empty-state/EmptyState.jsx";

import { databaseClient } from "../../services/database.client.js";
import { connectionStore } from "../../store/connection.store.js";

import "./explorer.css";

/* =========================================================
   DBPilot Studio
   Explorer Page
   ---------------------------------------------------------
   Página principal para explorar schemas, tablas, vistas,
   columnas y primeros registros de una conexión activa.

   Estilo:
   - Oscuro tipo Claude.
   - Compacto.
   - Objetos con íconos claros.
   - Rail colapsado legible.
   - Tablas y columnas con contraste alto.
   ========================================================= */

const VIEW_MODES = [
  {
    id: "records",
    label: "Registros",
    description: "Primeras filas",
    icon: "▦"
  },
  {
    id: "columns",
    label: "Columnas",
    description: "Estructura",
    icon: "☷"
  }
];

const OBJECT_FILTERS = [
  {
    id: "all",
    label: "Todo"
  },
  {
    id: "table",
    label: "Tablas"
  },
  {
    id: "view",
    label: "Vistas"
  }
];

export default function ExplorerPage({ onNavigate }) {
  const [storeState, setStoreState] = useState(connectionStore.getState());
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("records");
  const [filterText, setFilterText] = useState("");
  const [objectFilter, setObjectFilter] = useState("all");
  const [selectedSchema, setSelectedSchema] = useState("all");
  const [objectsCollapsed, setObjectsCollapsed] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  const activeConnection = storeState.activeConnection;
  const schemaOverview = storeState.schemaOverview;

  useEffect(() => {
    const unsubscribe = connectionStore.subscribe(setStoreState);

    return unsubscribe;
  }, []);

  const summary = schemaOverview?.summary || {
    schemas: 0,
    tables: 0,
    views: 0,
    estimatedRows: 0
  };

  const schemaOptions = useMemo(() => {
    if (!Array.isArray(schemaOverview?.tables)) {
      return [];
    }

    return schemaOverview.tables.map((schema) => ({
      name: schema.name,
      count: Array.isArray(schema.tables) ? schema.tables.length : 0
    }));
  }, [schemaOverview]);

  const flatObjects = useMemo(() => {
    if (!Array.isArray(schemaOverview?.tables)) {
      return [];
    }

    return schemaOverview.tables.flatMap((schema) => {
      const tables = Array.isArray(schema.tables) ? schema.tables : [];

      return tables.map((table) => {
        const type = String(table.type || "table").toLowerCase();

        return {
          ...table,
          schema: table.schema || schema.name,
          type,
          fullName: `${table.schema || schema.name}.${table.name}`,
          columns: Number(table.columns || 0),
          rows: Number(table.rows || 0)
        };
      });
    });
  }, [schemaOverview]);

  const filteredObjects = useMemo(() => {
    const cleanFilter = filterText.trim().toLowerCase();

    return flatObjects.filter((item) => {
      const matchesText =
        !cleanFilter ||
        String(item.name || "").toLowerCase().includes(cleanFilter) ||
        String(item.schema || "").toLowerCase().includes(cleanFilter) ||
        String(item.type || "").toLowerCase().includes(cleanFilter);

      const matchesSchema =
        selectedSchema === "all" || item.schema === selectedSchema;

      const matchesType =
        objectFilter === "all" || item.type === objectFilter;

      return matchesText && matchesSchema && matchesType;
    });
  }, [flatObjects, filterText, selectedSchema, objectFilter]);

  const selectedObject = useMemo(() => {
    if (!storeState.activeSchema || !storeState.activeTable) {
      return null;
    }

    return flatObjects.find(
      (item) =>
        item.schema === storeState.activeSchema &&
        item.name === storeState.activeTable
    );
  }, [flatObjects, storeState.activeSchema, storeState.activeTable]);

  const selectedTableTitle = storeState.activeTable
    ? `${storeState.activeSchema}.${storeState.activeTable}`
    : "Seleccioná una tabla";

  const selectedColumns = Array.isArray(storeState.activeColumns)
    ? storeState.activeColumns
    : [];

  const selectedRows = Array.isArray(storeState.activeRows)
    ? storeState.activeRows
    : [];

  async function handleLoadSchema() {
    if (!activeConnection) {
      setFeedback({
        type: "error",
        message: "Primero seleccioná una conexión activa."
      });

      return;
    }

    setLoading(true);
    setFeedback({
      type: "",
      message: ""
    });

    const response = await databaseClient.listTables(activeConnection);

    setLoading(false);

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    connectionStore.setSchemaOverview(response.data);

    setFeedback({
      type: "success",
      message: "Estructura cargada correctamente."
    });
  }

  async function handleSelectTable(table) {
    if (!activeConnection) return;

    setLoading(true);
    setFeedback({
      type: "",
      message: ""
    });

    const [columnsResponse, rowsResponse] = await Promise.all([
      databaseClient.listColumns({
        connection: activeConnection,
        schema: table.schema,
        table: table.name
      }),
      databaseClient.getTableRows({
        connection: activeConnection,
        schema: table.schema,
        table: table.name,
        limit: 100
      })
    ]);

    setLoading(false);

    if (!columnsResponse.ok) {
      setFeedback({
        type: "error",
        message: columnsResponse.error
      });

      return;
    }

    if (!rowsResponse.ok) {
      setFeedback({
        type: "error",
        message: rowsResponse.error
      });

      return;
    }

    connectionStore.setActiveTable({
      schema: table.schema,
      table: table.name,
      columns: columnsResponse.data?.columns || [],
      rows: rowsResponse.data?.rows || []
    });

    setFeedback({
      type: "success",
      message: `Tabla activa: ${table.schema}.${table.name}`
    });
  }

  if (!activeConnection) {
    return (
      <div className="dbp-page dbp-explorer-page">
        <EmptyState
          icon="⛁"
          eyebrow="Sin conexión activa"
          title="Seleccioná una conexión para explorar la base"
          description="Primero guardá o abrí una conexión PostgreSQL, MySQL o SQLite desde el módulo Conexiones."
          primaryActionLabel="Ir a conexiones"
          onPrimaryAction={() => onNavigate?.("connections")}
        />
      </div>
    );
  }

  return (
    <div className="dbp-page dbp-explorer-page">
      <section className="dbp-explorer-hero">
        <div className="dbp-explorer-hero__content">
          <p className="dbp-explorer-hero__eyebrow">Schema workspace</p>

          <h1>Explorer</h1>

          <span>
            Navegá schemas, tablas, columnas y registros reales desde una vista
            compacta. Conexión activa: <strong>{activeConnection.name}</strong>.
          </span>
        </div>

        <div className="dbp-explorer-hero__actions">
          <button
            className="dbp-explorer-action dbp-explorer-action--secondary"
            type="button"
            onClick={() => onNavigate?.("connections")}
          >
            <span>↩</span>
            Conexiones
          </button>

          <button
            className="dbp-explorer-action dbp-explorer-action--primary"
            type="button"
            disabled={loading}
            onClick={handleLoadSchema}
          >
            <span>{loading ? "…" : "↻"}</span>
            {loading ? "Cargando..." : "Cargar estructura"}
          </button>
        </div>
      </section>

      {feedback.message ? (
        <div
          className={[
            "dbp-explorer-feedback",
            feedback.type ? `dbp-explorer-feedback--${feedback.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span>{feedback.type === "error" ? "Error" : "OK"}</span>
          <strong>{feedback.message}</strong>
        </div>
      ) : null}

      <section className="dbp-explorer-kpis">
        <ExplorerKpi label="Schemas" value={summary.schemas} helper="Espacios lógicos" />
        <ExplorerKpi label="Tablas" value={summary.tables} helper="Entidades detectadas" />
        <ExplorerKpi label="Vistas" value={summary.views} helper="Consultas guardadas" />
        <ExplorerKpi label="Filas estimadas" value={summary.estimatedRows} helper="Volumen aproximado" />
      </section>

      <section
        className={[
          "dbp-explorer-workspace",
          objectsCollapsed ? "dbp-explorer-workspace--collapsed" : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <aside className="dbp-explorer-objects-panel">
          <div className="dbp-explorer-objects-head">
            <div>
              <span>Database objects</span>
              <h2>Objetos</h2>
              <p>{filteredObjects.length} visibles · {flatObjects.length} totales</p>
            </div>

            <button
              type="button"
              title={objectsCollapsed ? "Expandir objetos" : "Contraer objetos"}
              aria-label={objectsCollapsed ? "Expandir objetos" : "Contraer objetos"}
              onClick={() => setObjectsCollapsed((current) => !current)}
            >
              {objectsCollapsed ? "→" : "←"}
            </button>
          </div>

          {!objectsCollapsed ? (
            <>
              <div className="dbp-explorer-object-tools">
                <div className="dbp-explorer-search">
                  <span>⌕</span>
                  <input
                    value={filterText}
                    type="search"
                    placeholder="Buscar objeto..."
                    onChange={(event) => setFilterText(event.target.value)}
                  />
                </div>

                <div className="dbp-explorer-filter-row">
                  <select
                    value={selectedSchema}
                    onChange={(event) => setSelectedSchema(event.target.value)}
                  >
                    <option value="all">Todos los schemas</option>
                    {schemaOptions.map((schema) => (
                      <option value={schema.name} key={schema.name}>
                        {schema.name} ({schema.count})
                      </option>
                    ))}
                  </select>

                  <div className="dbp-explorer-type-filter">
                    {OBJECT_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        className={objectFilter === filter.id ? "is-active" : ""}
                        type="button"
                        onClick={() => setObjectFilter(filter.id)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dbp-explorer-object-summary">
                <article>
                  <span>Tablas</span>
                  <strong>{summary.tables}</strong>
                </article>

                <article>
                  <span>Vistas</span>
                  <strong>{summary.views}</strong>
                </article>

                <article>
                  <span>Schemas</span>
                  <strong>{summary.schemas}</strong>
                </article>
              </div>

              <div className="dbp-explorer-object-list">
                {schemaOverview ? (
                  filteredObjects.length ? (
                    filteredObjects.map((item) => (
                      <DatabaseObjectCard
                        key={`${item.schema}.${item.name}`}
                        item={item}
                        active={
                          storeState.activeSchema === item.schema &&
                          storeState.activeTable === item.name
                        }
                        loading={loading}
                        onSelect={() => handleSelectTable(item)}
                      />
                    ))
                  ) : (
                    <div className="dbp-explorer-object-empty">
                      <span>⌕</span>
                      <strong>Sin resultados</strong>
                      <p>No hay objetos que coincidan con el filtro actual.</p>
                    </div>
                  )
                ) : (
                  <div className="dbp-explorer-start-card">
                    <span>▦</span>
                    <strong>Sin estructura cargada</strong>
                    <p>Presioná “Cargar estructura” para leer schemas y tablas.</p>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleLoadSchema}
                    >
                      {loading ? "Cargando..." : "Cargar ahora"}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <CollapsedObjectsRail
              objects={filteredObjects}
              activeSchema={storeState.activeSchema}
              activeTable={storeState.activeTable}
              loading={loading}
              onSelect={handleSelectTable}
            />
          )}
        </aside>

        <main className="dbp-explorer-main-panel">
          <div className="dbp-explorer-main-header">
            <div className="dbp-explorer-selected">
              <span>{storeState.activeTable ? "Tabla activa" : "Vista previa"}</span>
              <h2>{selectedTableTitle}</h2>
              <p>
                {storeState.activeTable
                  ? `${selectedColumns.length} columnas · ${selectedRows.length} registros cargados`
                  : "Seleccioná una tabla para ver datos, estructura y acciones rápidas."}
              </p>
            </div>

            {selectedObject ? (
              <div className="dbp-explorer-selected-meta">
                <span>{selectedObject.type}</span>
                <strong>{selectedObject.columns || 0} columnas</strong>
                <small>{selectedObject.rows || 0} filas estimadas</small>
              </div>
            ) : null}

            <div className="dbp-explorer-main-actions">
              <div className="dbp-explorer-view-switch">
                {VIEW_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    className={viewMode === mode.id ? "is-active" : ""}
                    type="button"
                    onClick={() => setViewMode(mode.id)}
                  >
                    <span>{mode.icon}</span>
                    <strong>{mode.label}</strong>
                    <small>{mode.description}</small>
                  </button>
                ))}
              </div>

              <div className="dbp-explorer-route-actions">
                <button
                  type="button"
                  onClick={() => onNavigate?.("table-structure")}
                  disabled={!storeState.activeTable}
                >
                  Estructura
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate?.("table-data")}
                  disabled={!storeState.activeTable}
                >
                  Datos
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate?.("sql-runner")}
                >
                  SQL
                </button>
              </div>
            </div>
          </div>

          <div className="dbp-explorer-main-body">
            {viewMode === "records" ? (
              <DataTable
                columns={selectedColumns.map((column) => ({
                  key: column.name,
                  label: column.name,
                  type: column.type
                }))}
                rows={selectedRows}
                loading={loading}
                emptyTitle="Seleccioná una tabla"
                emptyDescription="Al seleccionar una tabla se van a cargar columnas y primeros registros."
              />
            ) : (
              <ColumnsPreview
                columns={selectedColumns}
                loading={loading}
                hasActiveTable={Boolean(storeState.activeTable)}
              />
            )}
          </div>
        </main>
      </section>
    </div>
  );
}

function DatabaseObjectCard({ item, active, loading, onSelect }) {
  const typeLabel = item.type === "view" ? "Vista" : "Tabla";
  const objectInitial = item.type === "view" ? "VW" : "TB";

  return (
    <button
      className={[
        "dbp-explorer-object-card",
        `dbp-explorer-object-card--${item.type === "view" ? "view" : "table"}`,
        active ? "dbp-explorer-object-card--active" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      type="button"
      disabled={loading}
      onClick={onSelect}
    >
      <span className="dbp-explorer-object-card__icon">{objectInitial}</span>

      <span className="dbp-explorer-object-card__copy">
        <strong>{item.name}</strong>
        <small>{item.schema}</small>
      </span>

      <span className="dbp-explorer-object-card__meta">
        <i>{typeLabel}</i>
        <b>{item.columns || 0} col</b>
      </span>
    </button>
  );
}

function CollapsedObjectsRail({
  objects,
  activeSchema,
  activeTable,
  loading,
  onSelect
}) {
  const visibleObjects = objects.slice(0, 32);

  return (
    <div className="dbp-explorer-objects-rail">
      {visibleObjects.length ? (
        visibleObjects.map((item) => {
          const isView = item.type === "view";
          const isActive = activeSchema === item.schema && activeTable === item.name;

          return (
            <button
              key={`${item.schema}.${item.name}`}
              className={[
                "dbp-explorer-rail-item",
                isView
                  ? "dbp-explorer-rail-item--view"
                  : "dbp-explorer-rail-item--table",
                isActive ? "dbp-explorer-rail-item--active" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              type="button"
              title={`${isView ? "Vista" : "Tabla"} · ${item.schema}.${item.name}`}
              disabled={loading}
              onClick={() => onSelect(item)}
            >
              <span className="dbp-explorer-rail-item__icon">
                {isView ? "◇" : "▦"}
              </span>

              <small>{isView ? "VW" : "TB"}</small>
            </button>
          );
        })
      ) : (
        <span className="dbp-explorer-rail-empty">—</span>
      )}
    </div>
  );
}

function ExplorerKpi({ label, value, helper }) {
  return (
    <article className="dbp-explorer-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </article>
  );
}

function ColumnsPreview({ columns, loading, hasActiveTable }) {
  if (loading) {
    return (
      <div className="dbp-explorer-loading">
        <span></span>
        <strong>Cargando estructura...</strong>
      </div>
    );
  }

  if (!hasActiveTable) {
    return (
      <div className="dbp-explorer-empty-preview">
        <span>☷</span>
        <strong>Sin tabla seleccionada</strong>
        <p>Elegí una tabla desde el panel izquierdo para inspeccionar sus columnas.</p>
      </div>
    );
  }

  if (!columns.length) {
    return (
      <div className="dbp-explorer-empty-preview">
        <span>☷</span>
        <strong>No se encontraron columnas</strong>
        <p>La tabla seleccionada no devolvió metadata de estructura.</p>
      </div>
    );
  }

  return (
    <div className="dbp-explorer-columns">
      {columns.map((column) => (
        <article className="dbp-explorer-column-card" key={column.name}>
          <div>
            <span>{column.primaryKey ? "PK" : column.nullable ? "NULL" : "NN"}</span>
          </div>

          <section>
            <strong>{column.name}</strong>
            <p>{column.type || column.rawType || "Tipo no informado"}</p>
          </section>

          <small>
            {column.primaryKey
              ? "Primary key"
              : column.nullable
                ? "Nullable"
                : "Required"}
          </small>
        </article>
      ))}
    </div>
  );
}