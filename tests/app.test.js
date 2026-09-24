const request = require("supertest");
const app = require("../app");

beforeAll(async () => {
    await request(app)
        .get("/crear-usuarios");
});

describe("Pruebas del Sistema de Donaciones", () => {

    test("Debe rechazar acceso a donantes sin token", async () => {
        const respuesta = await request(app)
            .get("/donantes");

        expect(respuesta.statusCode).toBe(401);
    });

    test("Debe permitir iniciar sesión con administrador", async () => {
        const respuesta = await request(app)
            .post("/login")
            .send({
                usuario: "admin",
                contrasena: "admin123"
            });

        expect(respuesta.statusCode).toBe(200);
        expect(respuesta.body).toHaveProperty("token");
        expect(respuesta.body.rol).toBe("administrador");
    });

    test("El administrador debe poder registrar un donante", async () => {
        const login = await request(app)
            .post("/login")
            .send({
                usuario: "admin",
                contrasena: "admin123"
            });

        const token = login.body.token;

        const respuesta = await request(app)
            .post("/donantes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nombre: "Donante de prueba",
                correo: "prueba@test.com",
                telefono: "6141234567",
                tipoRecurso: "Despensa",
                cantidad: 10
            });

        expect(respuesta.statusCode).toBe(201);
        expect(respuesta.body.mensaje).toBe("Donante registrado correctamente");
    });

        test("El usuario normal no debe poder registrar un donante", async () => {
        const login = await request(app)
            .post("/login")
            .send({
                usuario: "usuario",
                contrasena: "usuario123"
            });

        const token = login.body.token;

        const respuesta = await request(app)
            .post("/donantes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nombre: "Intento no autorizado",
                correo: "noautorizado@test.com",
                telefono: "6140000000",
                tipoRecurso: "Ropa",
                cantidad: 5
            });

        expect(respuesta.statusCode).toBe(403);
        expect(respuesta.body.error).toBe(
            "No tienes permisos para realizar esta acción"
        );
    });

        test("El administrador debe poder eliminar un donante", async () => {
        const login = await request(app)
            .post("/login")
            .send({
                usuario: "admin",
                contrasena: "admin123"
            });

        const token = login.body.token;

        const registro = await request(app)
            .post("/donantes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nombre: "Donante para eliminar",
                correo: "eliminar@test.com",
                telefono: "6141111111",
                tipoRecurso: "Ropa",
                cantidad: 5
            });

        const id = registro.body.donante.id;

        const respuesta = await request(app)
            .delete(`/donantes/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(respuesta.statusCode).toBe(200);
        expect(respuesta.body.mensaje).toBe(
            "Donante eliminado correctamente"
        );
    });

        test("El usuario normal no debe poder eliminar un donante", async () => {
        const login = await request(app)
            .post("/login")
            .send({
                usuario: "usuario",
                contrasena: "usuario123"
            });

        const token = login.body.token;

        const respuesta = await request(app)
            .delete("/donantes/1")
            .set("Authorization", `Bearer ${token}`);

        expect(respuesta.statusCode).toBe(403);
        expect(respuesta.body.error).toBe(
            "No tienes permisos para realizar esta acción"
        );
    });

        test("Debe rechazar un inicio de sesión con contraseña incorrecta", async () => {
        const respuesta = await request(app)
            .post("/login")
            .send({
                usuario: "admin",
                contrasena: "incorrecta"
            });

        expect(respuesta.statusCode).toBe(401);
        expect(respuesta.body.error).toBe(
            "Usuario o contraseña incorrectos"
        );
    });

        test("Debe rechazar un token inválido", async () => {
        const respuesta = await request(app)
            .get("/donantes")
            .set("Authorization", "Bearer token-invalido");

        expect(respuesta.statusCode).toBe(403);
        expect(respuesta.body.error).toBe(
            "Token inválido o expirado"
        );
    });

        test("El administrador debe poder editar un donante", async () => {
        const login = await request(app)
            .post("/login")
            .send({
                usuario: "admin",
                contrasena: "admin123"
            });

        const token = login.body.token;

        const registro = await request(app)
            .post("/donantes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nombre: "Donante original",
                correo: "original@test.com",
                telefono: "6142222222",
                tipoRecurso: "Ropa",
                cantidad: 5
            });

        const id = registro.body.donante.id;

        const respuesta = await request(app)
            .put(`/donantes/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                nombre: "Donante actualizado",
                correo: "actualizado@test.com",
                telefono: "6143333333",
                tipoRecurso: "Despensa",
                cantidad: 10
            });

        expect(respuesta.statusCode).toBe(200);
        expect(respuesta.body.mensaje).toBe(
            "Donante actualizado correctamente"
        );
    });

        test("Debe rechazar un donante con datos inválidos", async () => {
        const login = await request(app)
            .post("/login")
            .send({
                usuario: "admin",
                contrasena: "admin123"
            });

        const token = login.body.token;

        const respuesta = await request(app)
            .post("/donantes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nombre: null,
                correo: null,
                telefono: null,
                tipoRecurso: null,
                cantidad: null
            });

        expect(respuesta.statusCode).toBe(500);
    });

        test("Debe devolver error al editar un donante inexistente", async () => {
        const login = await request(app)
            .post("/login")
            .send({
                usuario: "admin",
                contrasena: "admin123"
            });

        const token = login.body.token;

        const respuesta = await request(app)
            .put("/donantes/999999")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nombre: "Donante inexistente",
                correo: "noexiste@test.com",
                telefono: "6140000000",
                tipoRecurso: "Ropa",
                cantidad: 5
            });

        expect(respuesta.statusCode).toBe(404);
        expect(respuesta.body.error).toBe(
            "Donante no encontrado"
        );
    });

        test("Debe devolver error al eliminar un donante inexistente", async () => {
        const login = await request(app)
            .post("/login")
            .send({
                usuario: "admin",
                contrasena: "admin123"
            });

        const token = login.body.token;

        const respuesta = await request(app)
            .delete("/donantes/999999")
            .set("Authorization", `Bearer ${token}`);

        expect(respuesta.statusCode).toBe(404);
        expect(respuesta.body.error).toBe(
            "Donante no encontrado"
        );
    });
});