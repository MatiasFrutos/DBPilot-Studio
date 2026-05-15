import "./modal.css";

export default function ConfirmModal({
  open = false,
  title = "Confirmar acción",
  description = "Esta acción requiere confirmación.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  requiredText = "",
  inputValue = "",
  onInputChange,
  onCancel,
  onConfirm
}) {
  if (!open) return null;

  const needsWrittenConfirmation = Boolean(requiredText);
  const canConfirm = needsWrittenConfirmation
    ? inputValue.trim() === requiredText.trim()
    : true;

  return (
    <div className="dbp-modal-backdrop" role="presentation">
      <div
        className={[
          "dbp-modal",
          danger ? "dbp-modal--danger" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dbp-confirm-modal-title"
      >
        <div className="dbp-modal__icon">
          {danger ? "!" : "?"}
        </div>

        <div className="dbp-modal__content">
          <h2 id="dbp-confirm-modal-title">{title}</h2>
          <p>{description}</p>

          {needsWrittenConfirmation ? (
            <div className="dbp-modal__confirmation">
              <label>
                Escribí exactamente:
                <strong>{requiredText}</strong>
              </label>

              <input
                value={inputValue}
                onChange={(event) => onInputChange?.(event.target.value)}
                placeholder={requiredText}
                autoFocus
              />
            </div>
          ) : null}

          <div className="dbp-modal__actions">
            <button
              className="dbp-modal__button dbp-modal__button--secondary"
              type="button"
              onClick={onCancel}
            >
              {cancelText}
            </button>

            <button
              className={[
                "dbp-modal__button",
                danger
                  ? "dbp-modal__button--danger"
                  : "dbp-modal__button--primary"
              ]
                .filter(Boolean)
                .join(" ")}
              type="button"
              disabled={!canConfirm}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}