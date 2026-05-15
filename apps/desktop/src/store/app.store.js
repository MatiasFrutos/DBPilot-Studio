const APP_STORE_KEY = "dbpilot_app_store_v1";

const initialState = {
  activeRoute: "welcome",
  activeConnectionId: "",
  activeSchema: "",
  activeTable: "",
  lastError: "",
  bootedAt: new Date().toISOString()
};

let state = loadInitialState();
const listeners = new Set();

export const appStore = {
  getState() {
    return structuredCloneSafe(state);
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

  reset() {
    state = {
      ...initialState,
      bootedAt: new Date().toISOString()
    };

    persistState();
    notifyListeners();

    return this.getState();
  },

  setActiveRoute(routeId) {
    return this.setState({
      activeRoute: routeId || "welcome"
    });
  },

  setActiveConnection(connectionId) {
    return this.setState({
      activeConnectionId: connectionId || "",
      activeSchema: "",
      activeTable: ""
    });
  },

  setActiveTable({ schema = "", table = "" } = {}) {
    return this.setState({
      activeSchema: schema,
      activeTable: table
    });
  },

  setError(error) {
    return this.setState({
      lastError: normalizeErrorMessage(error)
    });
  },

  clearError() {
    return this.setState({
      lastError: ""
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

function loadInitialState() {
  try {
    const rawState = localStorage.getItem(APP_STORE_KEY);

    if (!rawState) {
      return {
        ...initialState
      };
    }

    const parsedState = JSON.parse(rawState);

    return {
      ...initialState,
      ...parsedState,
      bootedAt: new Date().toISOString()
    };
  } catch {
    return {
      ...initialState
    };
  }
}

function persistState() {
  try {
    localStorage.setItem(APP_STORE_KEY, JSON.stringify(state));
  } catch {
    /*
      Si localStorage falla, no rompemos la app.
      En Electron después persistimos en JSON local por bridge.
    */
  }
}

function notifyListeners() {
  const snapshot = structuredCloneSafe(state);

  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error("[DBPILOT_APP_STORE_LISTENER_ERROR]", error);
    }
  });
}

function normalizeErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error.message) return error.message;

  return "Error desconocido.";
}

function structuredCloneSafe(value) {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}