export function validateConnection(connection = {}) {
  if (!connection.name || !connection.name.trim()) {
    return {
      ok: false,
      error: "El nombre de la conexión es obligatorio."
    };
  }

  if (!["postgresql", "mysql", "sqlite"].includes(connection.engine)) {
    return {
      ok: false,
      error: "Motor de base de datos no soportado."
    };
  }

  if (connection.engine === "sqlite") {
    if (!connection.filePath || !connection.filePath.trim()) {
      return {
        ok: false,
        error: "Para SQLite necesitás seleccionar un archivo .db, .sqlite o .sqlite3."
      };
    }

    return {
      ok: true,
      error: ""
    };
  }

  if (!connection.host || !connection.host.trim()) {
    return {
      ok: false,
      error: "El host es obligatorio."
    };
  }

  if (!connection.port || !String(connection.port).trim()) {
    return {
      ok: false,
      error: "El puerto es obligatorio."
    };
  }

  const portNumber = Number(connection.port);

  if (!Number.isInteger(portNumber) || portNumber <= 0 || portNumber > 65535) {
    return {
      ok: false,
      error: "El puerto debe ser un número válido entre 1 y 65535."
    };
  }

  if (!connection.user || !connection.user.trim()) {
    return {
      ok: false,
      error: "El usuario de base de datos es obligatorio."
    };
  }

  if (!connection.database || !connection.database.trim()) {
    return {
      ok: false,
      error: "El nombre de la base de datos es obligatorio."
    };
  }

  return {
    ok: true,
    error: ""
  };
}

export function validateSqlQuery(query) {
  const sql = String(query || "").trim();

  if (!sql) {
    return {
      ok: false,
      error: "La consulta SQL está vacía."
    };
  }

  return {
    ok: true,
    error: ""
  };
}

export function validateIdentifier(identifier, label = "identificador") {
  const value = String(identifier || "").trim();

  if (!value) {
    return {
      ok: false,
      error: `El ${label} es obligatorio.`
    };
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    return {
      ok: false,
      error: `El ${label} solo puede contener letras, números y guion bajo. No puede comenzar con número.`
    };
  }

  return {
    ok: true,
    error: ""
  };
}

export function normalizeError(error) {
  if (!error) {
    return "Error desconocido.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  if (error.error) {
    return String(error.error);
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Error desconocido.";
  }
}

export function isSafeFileName(filename) {
  const value = String(filename || "").trim();

  if (!value) return false;

  return !/[<>:"/\\|?*\x00-\x1F]/.test(value);
}