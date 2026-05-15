import { useEffect, useMemo, useState } from "react";

import EmptyState from "../../components/empty-state/EmptyState.jsx";
import { snippetsClient } from "../../services/snippets.client.js";
import { databaseClient } from "../../services/database.client.js";
import { historyClient } from "../../services/history.client.js";
import { connectionStore } from "../../store/connection.store.js";

import "./snippets.css";

/* =========================================================
   DBPilot Studio
   Snippets Page
   ---------------------------------------------------------
   Biblioteca local para guardar, editar y ejecutar consultas SQL.

   Responsabilidades:
   - Guardar snippets SQL por categoría y motor.
   - Filtrar snippets compatibles con la conexión activa.
   - Ejecutar snippets contra la conexión activa.
   - Registrar ejecuciones en historial.
   ========================================================= */

const INITIAL_FORM = {
  id: "",
  title: "",
  category: "General",
  engine: "any",
  sql: "SELECT *\nFROM tabla\nLIMIT 100;",
  notes: ""
};

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [storeState, setStoreState] = useState(connectionStore.getState());
  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  const activeConnection = storeState.activeConnection;

  const filteredSnippets = useMemo(() => {
    if (!activeConnection) return snippets;

    return snippets.filter((snippet) => {
      return snippet.engine === "any" || snippet.engine === activeConnection.engine;
    });
  }, [activeConnection, snippets]);

  useEffect(() => {
    const unsubscribe = connectionStore.subscribe(setStoreState);

    loadSnippets();

    return unsubscribe;
  }, []);

  async function loadSnippets() {
    const response = await snippetsClient.loadSnippets();

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setSnippets(response.data);
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSaveSnippet() {
    const response = await snippetsClient.saveSnippet(form);

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setFeedback({
      type: "success",
      message: "Snippet guardado correctamente."
    });

    setForm(INITIAL_FORM);
    await loadSnippets();
  }

  async function handleDeleteSnippet(snippet) {
    const response = await snippetsClient.deleteSnippet(snippet.id);

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setFeedback({
      type: "success",
      message: "Snippet eliminado."
    });

    await loadSnippets();
  }

  function handleEditSnippet(snippet) {
    setForm(snippet);

    setFeedback({
      type: "success",
      message: "Snippet cargado para editar."
    });
  }

  async function handleExecuteSnippet(snippet) {
    if (!activeConnection) {
      setFeedback({
        type: "error",
        message: "Primero seleccioná una conexión activa."
      });

      return;
    }

    const response = await databaseClient.executeQuery({
      connection: activeConnection,
      query: snippet.sql
    });

    await historyClient.addHistoryItem({
      type: "SNIPPET",
      status: response.ok ? "success" : "error",
      connectionName: activeConnection.name,
      engine: activeConnection.engine,
      query: snippet.sql,
      detail: response.ok
        ? `Snippet ejecutado: ${snippet.title}`
        : response.error,
      durationMs: response.data?.durationMs || 0
    });

    setFeedback({
      type: response.ok ? "success" : "error",
      message: response.ok
        ? `Snippet ejecutado. ${response.data?.rowCount || 0} fila(s).`
        : response.error
    });
  }

  return (
    <div className="dbp-page dbp-snippets-page">
      <section className="dbp-page-header">
        <p className="dbp-page-header__eyebrow">SQL Library</p>
        <h1>Snippets SQL</h1>
        <p>
          Guardá consultas frecuentes, organizalas por categoría y ejecutalas
          sobre la conexión activa. Pequeño repositorio SQL, gran retorno operativo.
        </p>
      </section>

      {feedback.message ? (
        <div
          className={[
            "dbp-snippets-feedback",
            feedback.type ? `dbp-snippets-feedback--${feedback.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span>{feedback.type === "error" ? "Error" : "OK"}</span>
          <strong>{feedback.message}</strong>
        </div>
      ) : null}

      <section className="dbp-page-grid">
        <div className="dbp-panel dbp-snippets-page__form">
          <div className="dbp-panel__header">
            <div>
              <h2>{form.id ? "Editar snippet" : "Nuevo snippet"}</h2>
              <p>Guardá consultas reutilizables para acelerar tu operación SQL.</p>
            </div>

            <span>Storage local</span>
          </div>

          <div className="dbp-panel__body">
            <div className="dbp-form-grid">
              <div className="dbp-field">
                <label>Título</label>
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Clientes activos"
                />
              </div>

              <div className="dbp-field">
                <label>Categoría</label>
                <input
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value)}
                  placeholder="Reportes / Admin / Debug"
                />
              </div>

              <div className="dbp-field">
                <label>Motor</label>
                <select
                  value={form.engine}
                  onChange={(event) => updateField("engine", event.target.value)}
                >
                  <option value="any">Cualquier motor</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL / MariaDB</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>

              <div className="dbp-field">
                <label>Notas</label>
                <input
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Uso interno, auditoría, reporte..."
                />
              </div>

              <div className="dbp-field dbp-field--wide">
                <label>SQL</label>
                <textarea
                  value={form.sql}
                  onChange={(event) => updateField("sql", event.target.value)}
                  spellCheck="false"
                />
              </div>
            </div>

            <div className="dbp-snippets-actions">
              <button
                className="dbp-button dbp-button--secondary"
                type="button"
                onClick={() => setForm(INITIAL_FORM)}
              >
                Limpiar
              </button>

              <button
                className="dbp-button dbp-button--primary"
                type="button"
                onClick={handleSaveSnippet}
              >
                Guardar snippet
              </button>
            </div>
          </div>
        </div>

        <div className="dbp-panel dbp-snippets-page__list">
          <div className="dbp-panel__header">
            <div>
              <h2>Biblioteca</h2>
              <p>
                {activeConnection
                  ? `Mostrando snippets compatibles con ${activeConnection.engine}.`
                  : "Mostrando todos los snippets guardados."}
              </p>
            </div>

            <span>{filteredSnippets.length} items</span>
          </div>

          <div className="dbp-panel__body">
            {filteredSnippets.length ? (
              <div className="dbp-snippets-list">
                {filteredSnippets.map((snippet) => (
                  <article
                    className={[
                      "dbp-snippet-card",
                      `dbp-snippet-card--engine-${snippet.engine || "any"}`
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={snippet.id}
                  >
                    <div className="dbp-snippet-card__head">
                      <div>
                        <span>{snippet.category}</span>
                        <h3>{snippet.title}</h3>
                      </div>

                      <small>{getEngineLabel(snippet.engine)}</small>
                    </div>

                    <pre>{snippet.sql}</pre>

                    {snippet.notes ? <p>{snippet.notes}</p> : null}

                    <div className="dbp-snippet-card__actions">
                      <button type="button" onClick={() => handleExecuteSnippet(snippet)}>
                        Ejecutar
                      </button>

                      <button type="button" onClick={() => handleEditSnippet(snippet)}>
                        Editar
                      </button>

                      <button
                        className="dbp-snippet-card__danger"
                        type="button"
                        onClick={() => handleDeleteSnippet(snippet)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="⌘"
                eyebrow="Sin snippets"
                title="Todavía no hay consultas guardadas"
                description="Guardá consultas frecuentes para reutilizarlas por proyecto o motor."
                primaryActionLabel="Guardar snippet"
                onPrimaryAction={handleSaveSnippet}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function getEngineLabel(engine) {
  const labels = {
    any: "Any",
    postgresql: "PostgreSQL",
    mysql: "MySQL",
    sqlite: "SQLite"
  };

  return labels[engine] || "Any";
}