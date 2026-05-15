import "./toast.css";

export default function Toast({
  items = [],
  position = "bottom-right",
  onClose
}) {
  if (!items.length) return null;

  return (
    <div
      className={[
        "dbp-toast-stack",
        `dbp-toast-stack--${position}`
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
    >
      {items.map((toast) => (
        <article
          key={toast.id}
          className={[
            "dbp-toast",
            toast.type ? `dbp-toast--${toast.type}` : ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="dbp-toast__icon">
            {getToastIcon(toast.type)}
          </div>

          <div className="dbp-toast__content">
            <strong>{toast.title || "Notificación"}</strong>
            {toast.message ? <p>{toast.message}</p> : null}
          </div>

          <button
            className="dbp-toast__close"
            type="button"
            aria-label="Cerrar notificación"
            onClick={() => onClose?.(toast.id)}
          >
            ×
          </button>
        </article>
      ))}
    </div>
  );
}

export function createToast({ title, message, type = "info" }) {
  return {
    id: createToastId(),
    title,
    message,
    type,
    createdAt: new Date().toISOString()
  };
}

function getToastIcon(type) {
  const icons = {
    success: "✓",
    error: "!",
    warning: "!",
    info: "i"
  };

  return icons[type] || icons.info;
}

function createToastId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}