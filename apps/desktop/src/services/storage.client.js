import { normalizeError } from "../utils/validators.util.js";

const LOCAL_STORAGE_PREFIX = "dbpilot_storage_";

export const storageClient = {
  async read(key, fallbackValue = null) {
    try {
      if (hasStorageBridge()) {
        const response = await window.dbpilot.storage.read({
          key,
          fallbackValue
        });

        return normalizeResponse(response, fallbackValue);
      }

      return readFromLocalStorage(key, fallbackValue);
    } catch (error) {
      return {
        ok: false,
        data: fallbackValue,
        error: normalizeError(error)
      };
    }
  },

  async write(key, value) {
    try {
      if (hasStorageBridge()) {
        const response = await window.dbpilot.storage.write({
          key,
          value
        });

        return normalizeResponse(response, value);
      }

      return writeToLocalStorage(key, value);
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: normalizeError(error)
      };
    }
  },

  async remove(key) {
    try {
      localStorage.removeItem(getLocalStorageKey(key));

      return {
        ok: true,
        data: {
          key
        },
        error: ""
      };
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: normalizeError(error)
      };
    }
  }
};

function hasStorageBridge() {
  return (
    typeof window !== "undefined" &&
    window.dbpilot &&
    window.dbpilot.storage &&
    typeof window.dbpilot.storage.read === "function" &&
    typeof window.dbpilot.storage.write === "function"
  );
}

function readFromLocalStorage(key, fallbackValue) {
  const rawValue = localStorage.getItem(getLocalStorageKey(key));

  if (!rawValue) {
    return {
      ok: true,
      data: fallbackValue,
      error: ""
    };
  }

  return {
    ok: true,
    data: JSON.parse(rawValue),
    error: ""
  };
}

function writeToLocalStorage(key, value) {
  localStorage.setItem(getLocalStorageKey(key), JSON.stringify(value));

  return {
    ok: true,
    data: value,
    error: ""
  };
}

function getLocalStorageKey(key) {
  return `${LOCAL_STORAGE_PREFIX}${key}`;
}

function normalizeResponse(response, fallbackValue) {
  if (!response) {
    return {
      ok: true,
      data: fallbackValue,
      error: ""
    };
  }

  if (typeof response.ok === "boolean") {
    return response;
  }

  return {
    ok: true,
    data: response,
    error: ""
  };
}