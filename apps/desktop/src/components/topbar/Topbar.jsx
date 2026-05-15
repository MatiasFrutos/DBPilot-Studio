import { useEffect, useState } from "react";

import "./topbar.css";

/* =========================================================
   DBPilot Studio
   Topbar Component
   ---------------------------------------------------------
   Barra superior compacta.
   Estilo:
   - Oscuro tipo Claude.
   - Responsive.
   - Buscador visible.
   - Fecha/hora compacta.
   ========================================================= */

export default function Topbar({ title, description, routeLabel }) {
  const [dateTime, setDateTime] = useState(() => getCurrentDateTime());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDateTime(getCurrentDateTime());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <header className="dbp-topbar">
      <div className="dbp-topbar__heading">
        <div className="dbp-topbar__brand-row">
          <div className="dbp-topbar__brand-mark" aria-hidden="true">
            DB
          </div>

          <div className="dbp-topbar__brand-copy">
            <strong>DBPilot Studio</strong>
            <span>Zernyx Tech Studio</span>
          </div>
        </div>

        <div className="dbp-topbar__route">
          <p className="dbp-topbar__eyebrow">{routeLabel}</p>
          <h2>{title}</h2>
          <span>{description}</span>
        </div>
      </div>

      <div className="dbp-topbar__right">
        <label className="dbp-topbar__search">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            placeholder="Buscar tablas, conexiones o snippets..."
            aria-label="Buscar tablas, conexiones o snippets"
          />
        </label>

        <div className="dbp-topbar__meta">
          <div className="dbp-topbar__datetime" aria-label="Fecha y hora actual">
            <span aria-hidden="true">◷</span>

            <div>
              <strong>{dateTime.time}</strong>
              <small>{dateTime.date}</small>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function getCurrentDateTime() {
  const now = new Date();

  return {
    time: new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(now),
    date: new Intl.DateTimeFormat("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
      .format(now)
      .replace(".", "")
  };
}