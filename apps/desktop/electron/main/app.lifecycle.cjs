"use strict";

const { app, BrowserWindow } = require("electron");

function setupAppLifecycle(createMainWindow) {
  app.whenReady().then(() => {
    createMainWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  process.on("uncaughtException", (error) => {
    console.error("[DBPILOT_UNCAUGHT_EXCEPTION]", error);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("[DBPILOT_UNHANDLED_REJECTION]", reason);
  });
}

module.exports = {
  setupAppLifecycle
};