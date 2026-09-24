const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/donaciones.db", (err) => {
    if (err) {
        console.error("Error al conectar con la base de datos:", err.message);
    } else {
        console.log("Base de datos SQLite conectada correctamente");
    }
});

// Tabla de donantes
db.run(`
    CREATE TABLE IF NOT EXISTS donantes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        correo TEXT NOT NULL,
        telefono TEXT NOT NULL,
        tipoRecurso TEXT NOT NULL,
        cantidad INTEGER NOT NULL
    )
`, (err) => {
    if (err) {
        console.error("Error al crear la tabla donantes:", err.message);
    } else {
        console.log("Tabla donantes creada correctamente");
    }
});

// Tabla de usuarios
db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT NOT NULL UNIQUE,
        contrasena TEXT NOT NULL,
        rol TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error("Error al crear la tabla usuarios:", err.message);
    } else {
        console.log("Tabla usuarios creada correctamente");
    }
});

module.exports = db;