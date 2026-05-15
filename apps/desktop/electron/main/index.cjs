"use strict";

const {
  createMainWindow,
  getMainWindow
} = require("./window.manager.cjs");

const {
  setupApplicationMenu
} = require("./menu.manager.cjs");

const {
  setupAppLifecycle
} = require("./app.lifecycle.cjs");

const {
  registerDatabaseBridge
} = require("../bridges/database.bridge.cjs");

const {
  registerConnectionsBridge
} = require("../bridges/connections.bridge.cjs");

const {
  registerSqliteFileBridge
} = require("../bridges/sqlite-file.bridge.cjs");

const {
  registerExportBridge
} = require("../bridges/export.bridge.cjs");

const {
  registerStorageBridge
} = require("../bridges/storage.bridge.cjs");

setupApplicationMenu();

registerStorageBridge();
registerDatabaseBridge();
registerConnectionsBridge();
registerSqliteFileBridge(getMainWindow);
registerExportBridge(getMainWindow);

setupAppLifecycle(createMainWindow);