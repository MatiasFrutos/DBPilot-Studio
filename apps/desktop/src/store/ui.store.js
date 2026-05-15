const UI_STORE_KEY = "dbpilot_ui_store_v1";

const initialState = {
  theme: "dark",
  accent: "blue",
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  modal: null,
  toasts: []
};

let state = loadInitialState();
const listeners = new Set();

export const uiStore = {
  getState() {
    return clone(state);
  },

  setState(partialState) {
    state = {
      ...state,
      ...partialState,
      updatedAt: new Date().toISOString()
    };

    persistState();
    notifyListeners();

    return this.getState();
  },

  setTheme(theme) {
    const nextTheme = ["dark", "light"].includes(theme) ? theme : "dark";

    document.documentElement.dataset.theme = nextTheme;

    return this.setState({
      theme: nextTheme
    });
  },

  setAccent(accent) {
    const nextAccent = accent || "blue";

    document.documentElement.dataset.accent = nextAccent;

    return this.setState({
      accent: nextAccent
    });
  },

  toggleSidebar() {
    return this.setState({
      sidebarCollapsed: !state.sidebarCollapsed
    });
  },

  setSidebarCollapsed(collapsed) {
    return this.setState({
      sidebarCollapsed: Boolean(collapsed)
    });
  },

  openModal(modal) {
    return this.setState({
      modal: modal || null
    });
  },

  closeModal() {
    return this.setState({
      modal: null
    });
  },

  addToast(toast) {
    const normalizedToast = normalizeToast(toast);

    return this.setState({
      toasts: [normalizedToast, ...state.toasts].slice(0, 5)
    });
  },

  removeToast(toastId) {
    return this.setState({
      toasts: state.toasts.filter((toast) => toast.id !== toastId)
    });
  },

  clearToasts() {
    return this.setState({
      toasts: []
    });
  },

  subscribe(listener) {
    if (typeof listener !== "function") {
      return () => {};
    }

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }
};

export function normalizeToast(toast = {}) {
  return {
    id: toast.id || createId("toast"),
    title: toast.title || "Notificación",
    message: toast.message || "",
    type: toast.type || "info",
    createdAt: toast.createdAt || new Date().toISOString()
  };
}

function loadInitialState() {
  try {
    const rawState = localStorage.getItem(UI_STORE_KEY);

    if (!rawState) {
      document.documentElement.dataset.theme = initialState.theme;
      document.documentElement.dataset.accent = initialState.accent;

      return {
        ...initialState
      };
    }

    const parsedState = JSON.parse(rawState);

    const nextState = {
      ...initialState,
      ...parsedState,
      modal: null,
      toasts: []
    };

    document.documentElement.dataset.theme = nextState.theme;
    document.documentElement.dataset.accent = nextState.accent;

    return nextState;
  } catch {
    document.documentElement.dataset.theme = initialState.theme;
    document.documentElement.dataset.accent = initialState.accent;

    return {
      ...initialState
    };
  }
}

function persistState() {
  try {
    const persistableState = {
      ...state,
      modal: null,
      toasts: []
    };

    localStorage.setItem(UI_STORE_KEY, JSON.stringify(persistableState));
  } catch {
    /*
      No bloqueamos UI por error de storage.
    */
  }
}

function notifyListeners() {
  const snapshot = clone(state);

  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error("[DBPILOT_UI_STORE_LISTENER_ERROR]", error);
    }
  });
}

function createId(prefix) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clone(value) {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}