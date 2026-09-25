const express = require("express");
const db = require("./database/database");
const jwt = require("jsonwebtoken");

const app = express();

app.disable("x-powered-by");

const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

// Página principal
app.get("/", (req, res) => {
    res.json({
        mensaje: "Sistema de Gestión de Donaciones funcionando"
    });
});

// Middleware para verificar token
const autenticarToken = (req, res, next) => {
    const encabezado = req.headers["authorization"];

    if (!encabezado) {
        return res.status(401).json({
            error: "Token no proporcionado"
        });
    }

    const token = encabezado.split(" ")[1];

    jwt.verify(token, "clave-secreta-proyecto", (err, usuario) => {
        if (err) {
            return res.status(403).json({
                error: "Token inválido o expirado"
            });
        }

        req.usuario = usuario;
        next();
    });
};

// Middleware para verificar rol
const autorizarRol = (rolPermitido) => {
    return (req, res, next) => {
        if (req.usuario.rol !== rolPermitido) {
            return res.status(403).json({
                error: "No tienes permisos para realizar esta acción"
            });
        }

        next();
    };
};

// Consultar donantes
app.get("/donantes", autenticarToken, (req, res) => {
    db.all("SELECT * FROM donantes", [], (err, filas) => {
        if (err) {
            return res.status(500).json({
                error: "Error al consultar los donantes"
            });
        }

        res.json(filas);
    });
});

// Registrar donante
app.post(
    "/donantes",
    autenticarToken,
    autorizarRol("administrador"),
    (req, res) => {
        const {
            nombre,
            correo,
            telefono,
            tipoRecurso,
            cantidad
        } = req.body;

        const sql = `
            INSERT INTO donantes
            (nombre, correo, telefono, tipoRecurso, cantidad)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(
            sql,
            [nombre, correo, telefono, tipoRecurso, cantidad],
            function (err) {
                if (err) {
                    return res.status(500).json({
                        error: "Error al registrar el donante"
                    });
                }

                res.status(201).json({
                    mensaje: "Donante registrado correctamente",
                    donante: {
                        id: this.lastID,
                        nombre,
                        correo,
                        telefono,
                        tipoRecurso,
                        cantidad
                    }
                });
            }
        );
    }
);

// Editar donante
app.put(
    "/donantes/:id",
    autenticarToken,
    autorizarRol("administrador"),
    (req, res) => {
        const { id } = req.params;
        const {
            nombre,
            correo,
            telefono,
            tipoRecurso,
            cantidad
        } = req.body;

        const sql = `
            UPDATE donantes
            SET nombre = ?,
                correo = ?,
                telefono = ?,
                tipoRecurso = ?,
                cantidad = ?
            WHERE id = ?
        `;

        db.run(
            sql,
            [nombre, correo, telefono, tipoRecurso, cantidad, id],
            function (err) {
                if (err) {
                    return res.status(500).json({
                        error: "Error al editar el donante"
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        error: "Donante no encontrado"
                    });
                }

                res.json({
                    mensaje: "Donante actualizado correctamente"
                });
            }
        );
    }
);

// Eliminar donante
app.delete(
    "/donantes/:id",
    autenticarToken,
    autorizarRol("administrador"),
    (req, res) => {
        const { id } = req.params;

        const sql = `
            DELETE FROM donantes
            WHERE id = ?
        `;

        db.run(sql, [id], function (err) {
            if (err) {
                return res.status(500).json({
                    error: "Error al eliminar el donante"
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Donante no encontrado"
                });
            }

            res.json({
                mensaje: "Donante eliminado correctamente"
            });
        });
    }
);

// Crear usuarios de prueba
app.get("/crear-usuarios", (req, res) => {
    const usuarios = [
        ["admin", "admin123", "administrador"],
        ["usuario", "usuario123", "usuario"]
    ];

    const sql = `
        INSERT OR IGNORE INTO usuarios
        (usuario, contrasena, rol)
        VALUES (?, ?, ?)
    `;

    usuarios.forEach((usuario) => {
        db.run(sql, usuario);
    });

    res.json({
        mensaje: "Usuarios de prueba creados correctamente"
    });
});

// Login
app.post("/login", (req, res) => {
    const { usuario, contrasena } = req.body;

    const sql = `
        SELECT * FROM usuarios
        WHERE usuario = ? AND contrasena = ?
    `;

    db.get(sql, [usuario, contrasena], (err, user) => {
        if (err) {
            return res.status(500).json({
                error: "Error en el servidor"
            });
        }

        if (!user) {
            return res.status(401).json({
                error: "Usuario o contraseña incorrectos"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                usuario: user.usuario,
                rol: user.rol
            },
            "clave-secreta-proyecto",
            {
                expiresIn: "1h"
            }
        );

        res.json({
            mensaje: "Inicio de sesión correcto",
            token,
            rol: user.rol
        });
    });
});

// Iniciar servidor
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
}

module.exports = app;