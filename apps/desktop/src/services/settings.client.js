import { storageClient } from "./storage.client.js";
import { uiStore } from "../store/ui.store.js";
import { normalizeError } from "../utils/validators.util.js";

const SETTINGS_STORAGE_KEY = "settings";

const defaultSettings = {
  theme: "dark",
  accent: "blue",
  readonlyMode: false,
  rowLimit: 100,
  confirmDangerousActions: true,
  blockDeleteWithoutWhere: true,
  blockUpdateWithoutWhere: true,
  previewAlterQueries: true
};

export const settingsClient = {
  getDefaultSettings() {
    return {
      ...defaultSettings
    };
  },

  async loadSettings() {
    try {
      const response = await storageClient.read(
        SETTINGS_STORAGE_KEY,
        defaultSettings
      );

      if (!response.ok) {
        return response;
      }

      const settings = normalizeSettings(response.data);

      applySettingsToUi(settings);

      return {
        ok: true,
        data: settings,
        error: ""
      };
    } catch (error) {
      return {
        ok: false,
        data: defaultSettings,
        error: normalizeError(error)
      };
    }
  },

  async saveSettings(settings) {
    try {
      const normalizedSettings = normalizeSettings(settings);

      const response = await storageClient.write(
        SETTINGS_STORAGE_KEY,
        normalizedSettings
      );

      if (!response.ok) {
        return response;
      }

      applySettingsToUi(normalizedSettings);

      return {
        ok: true,
        data: normalizedSettings,
        error: ""
      };
    } catch (error) {
      return {
        ok: false,
        data: null,
        error: normalizeError(error)
      };
    }
  },

  async updateSetting(key, value) {
    const currentSettingsResponse = await this.loadSettings();

    if (!currentSettingsResponse.ok) {
      return currentSettingsResponse;
    }

    return this.saveSettings({
      ...currentSettingsResponse.data,
      [key]: value
    });
  }
};

export function normalizeSettings(settings = {}) {
  const rowLimit = Number(settings.rowLimit);

  return {
    ...defaultSettings,
    ...settings,
    theme: ["dark", "light"].includes(settings.theme) ? settings.theme : "dark",
    accent: settings.accent || "blue",
    readonlyMode: Boolean(settings.readonlyMode),
    rowLimit: Number.isFinite(rowLimit) && rowLimit > 0 ? rowLimit : 100,
    confirmDangerousActions: settings.confirmDangerousActions !== false,
    blockDeleteWithoutWhere: settings.blockDeleteWithoutWhere !== false,
    blockUpdateWithoutWhere: settings.blockUpdateWithoutWhere !== false,
    previewAlterQueries: settings.previewAlterQueries !== false
  };
}

function applySettingsToUi(settings) {
  uiStore.setTheme(settings.theme);
  uiStore.setAccent(settings.accent);
}