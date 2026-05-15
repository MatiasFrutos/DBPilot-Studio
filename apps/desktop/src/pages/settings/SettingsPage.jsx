import { useEffect, useState } from "react";

import { settingsClient } from "../../services/settings.client.js";

import "./settings.css";

/* =========================================================
   DBPilot Studio
   Settings Page
   ---------------------------------------------------------
   Página de configuración local.

   Responsabilidades:
   - Configurar acento visual.
   - Configurar límite de filas.
   - Configurar guardrails de seguridad.
   - Guardar preferencias en storage local.
   - Restaurar valores seguros.

   Estilo:
   - Oscuro tipo Claude.
   - Compacto.
   - Visual cálido.
   - Sin volver a forzar Light UI.
   ========================================================= */

const ACCENT_OPTIONS = [
  {
    value: "blue",
    label: "Blue",
    description: "Interfaz técnica, limpia y corporativa.",
    preview: "Azul"
  },
  {
    value: "green",
    label: "Green",
    description: "Estado operativo, lectura clara y foco en seguridad.",
    preview: "Verde"
  },
  {
    value: "amber",
    label: "Amber",
    description: "Visual cálido para paneles administrativos.",
    preview: "Ámbar"
  }
];

const ROW_LIMIT_OPTIONS = [25, 50, 100, 250, 500, 1000];

export default function SettingsPage() {
  const [settings, setSettings] = useState(settingsClient.getDefaultSettings());
  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const response = await settingsClient.loadSettings();

    if (!response.ok) {
      setFeedback({
        type: "error",
        message: response.error
      });

      return;
    }

    setSettings({
      ...response.data,
      theme: "dark"
    });
  }

  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      theme: "dark",
      [key]: value
    }));
  }

  async function handleSaveSettings() {
    setSaving(true);

    const response = await settingsClient.saveSettings({
      ...settings,
      theme: "dark"
    });

    setSaving(false);

    setFeedback({
      type: response.ok ? "success" : "error",
      message: response.ok ? "Configuración guardada correctamente." : response.error
    });
  }

  function handleResetSafeDefaults() {
    setSettings((current) => ({
      ...current,
      theme: "dark",
      accent: "amber",
      rowLimit: 100,
      readonlyMode: false,
      blockDeleteWithoutWhere: true,
      blockUpdateWithoutWhere: true
    }));

    setFeedback({
      type: "success",
      message: "Valores seguros restaurados. Guardá la configuración para persistirlos."
    });
  }

  return (
    <div className="dbp-page dbp-settings-page">
      <section className="dbp-settings-hero">
        <div>
          <p className="dbp-settings-hero__eyebrow">Local preferences</p>
          <h1>Configuración</h1>
          <span>
            Preferencias operativas para seguridad, rendimiento, límites de consulta
            y comportamiento local de DBPilot Studio.
          </span>
        </div>

        <div className="dbp-settings-hero__status">
          <span>Modo visual</span>
          <strong>Dark UI</strong>
          <small>Optimizado para trabajo técnico prolongado con baja fatiga visual</small>
        </div>
      </section>

      {feedback.message ? (
        <div
          className={[
            "dbp-settings-feedback",
            feedback.type ? `dbp-settings-feedback--${feedback.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span>{feedback.type === "error" ? "Error" : "OK"}</span>
          <strong>{feedback.message}</strong>
        </div>
      ) : null}

      <section className="dbp-page-grid dbp-settings-grid">
        <div className="dbp-panel dbp-settings-page__main">
          <div className="dbp-panel__header">
            <div>
              <h2>Preferencias principales</h2>
              <p>Definí cómo responde el workspace local.</p>
            </div>

            <span>Storage JSON</span>
          </div>

          <div className="dbp-panel__body">
            <div className="dbp-settings-section">
              <div className="dbp-settings-section__header">
                <span>01</span>
                <div>
                  <h3>Acento visual</h3>
                  <p>Elegí el color principal para estados, foco y acciones.</p>
                </div>
              </div>

              <div className="dbp-settings-accent-grid">
                {ACCENT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={[
                      "dbp-settings-accent-card",
                      `dbp-settings-accent-card--${option.value}`,
                      settings.accent === option.value
                        ? "dbp-settings-accent-card--active"
                        : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    type="button"
                    onClick={() => updateSetting("accent", option.value)}
                  >
                    <span>{option.preview}</span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="dbp-settings-section">
              <div className="dbp-settings-section__header">
                <span>02</span>
                <div>
                  <h3>Rendimiento</h3>
                  <p>Controlá el volumen inicial de datos por consulta.</p>
                </div>
              </div>

              <div className="dbp-settings-row-limit">
                <label htmlFor="rowLimit">Límite de filas por defecto</label>

                <div className="dbp-settings-row-limit__control">
                  <input
                    id="rowLimit"
                    type="number"
                    min="1"
                    max="1000"
                    value={settings.rowLimit}
                    onChange={(event) =>
                      updateSetting("rowLimit", Number(event.target.value))
                    }
                  />

                  <div className="dbp-settings-row-limit__chips">
                    {ROW_LIMIT_OPTIONS.map((limit) => (
                      <button
                        key={limit}
                        className={settings.rowLimit === limit ? "is-active" : ""}
                        type="button"
                        onClick={() => updateSetting("rowLimit", limit)}
                      >
                        {limit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="dbp-settings-section">
              <div className="dbp-settings-section__header">
                <span>03</span>
                <div>
                  <h3>Guardrails de seguridad</h3>
                  <p>Activá protecciones para evitar cambios masivos accidentales.</p>
                </div>
              </div>

              <div className="dbp-settings-toggle-list">
                <SettingToggle
                  title="Modo solo lectura global"
                  description="Bloquea operaciones de escritura y cambios de estructura."
                  checked={settings.readonlyMode}
                  onChange={(value) => updateSetting("readonlyMode", value)}
                />

                <SettingToggle
                  title="Bloquear DELETE sin WHERE"
                  description="Evita eliminaciones masivas sin condición explícita."
                  checked={settings.blockDeleteWithoutWhere}
                  onChange={(value) =>
                    updateSetting("blockDeleteWithoutWhere", value)
                  }
                />

                <SettingToggle
                  title="Bloquear UPDATE sin WHERE"
                  description="Evita actualizaciones masivas sin filtro de seguridad."
                  checked={settings.blockUpdateWithoutWhere}
                  onChange={(value) =>
                    updateSetting("blockUpdateWithoutWhere", value)
                  }
                />
              </div>
            </div>

            <div className="dbp-settings-actions">
              <button
                className="dbp-button dbp-button--secondary"
                type="button"
                onClick={handleResetSafeDefaults}
              >
                Restaurar seguros
              </button>

              <button
                className="dbp-button dbp-button--primary"
                type="button"
                disabled={saving}
                onClick={handleSaveSettings}
              >
                {saving ? "Guardando..." : "Guardar configuración"}
              </button>
            </div>
          </div>
        </div>

        <aside className="dbp-panel dbp-settings-page__side">
          <div className="dbp-panel__header">
            <div>
              <h2>Seguridad activa</h2>
              <p>Políticas base del MVP.</p>
            </div>

            <span>Default</span>
          </div>

          <div className="dbp-panel__body">
            <div className="dbp-settings-security">
              <SecurityCard
                status="danger"
                title="DROP protegido"
                description="Requiere confirmación escrita antes de ejecutar."
              />

              <SecurityCard
                status="danger"
                title="TRUNCATE protegido"
                description="Bloqueado por safety guard."
              />

              <SecurityCard
                status="warn"
                title="ALTER con preview"
                description="Los cambios de estructura muestran SQL previo."
              />

              <SecurityCard
                status="ok"
                title="Historial local"
                description="Registra acciones clave del workspace."
              />

              <SecurityCard
                status="ok"
                title="Storage JSON"
                description="Preferencias y snippets guardados localmente."
              />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function SettingToggle({ title, description, checked, onChange }) {
  return (
    <article className="dbp-setting-toggle">
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>

      <button
        className={[
          "dbp-setting-switch",
          checked ? "dbp-setting-switch--active" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      >
        <span></span>
      </button>
    </article>
  );
}

function SecurityCard({ status, title, description }) {
  return (
    <article className={`dbp-settings-security-card dbp-settings-security-card--${status}`}>
      <span></span>

      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
    </article>
  );
}