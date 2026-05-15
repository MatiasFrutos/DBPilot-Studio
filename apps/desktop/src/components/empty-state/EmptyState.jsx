import "./empty-state.css";

export default function EmptyState({
  icon = "▣",
  eyebrow = "Sin información",
  title = "No hay datos disponibles",
  description = "Cuando exista información para mostrar, va a aparecer en este panel.",
  primaryActionLabel = "",
  secondaryActionLabel = "",
  onPrimaryAction,
  onSecondaryAction
}) {
  return (
    <section className="dbp-empty-state">
      <div className="dbp-empty-state__icon">{icon}</div>

      <div className="dbp-empty-state__content">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>

        {primaryActionLabel || secondaryActionLabel ? (
          <div className="dbp-empty-state__actions">
            {secondaryActionLabel ? (
              <button
                className="dbp-empty-state__button dbp-empty-state__button--secondary"
                type="button"
                onClick={onSecondaryAction}
              >
                {secondaryActionLabel}
              </button>
            ) : null}

            {primaryActionLabel ? (
              <button
                className="dbp-empty-state__button dbp-empty-state__button--primary"
                type="button"
                onClick={onPrimaryAction}
              >
                {primaryActionLabel}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}