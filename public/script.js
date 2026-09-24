const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const contrasena = document.getElementById("contrasena").value;

    try {
        const respuesta = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                usuario,
                contrasena
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.error;
            return;
        }

        localStorage.setItem("token", datos.token);
        localStorage.setItem("rol", datos.rol);

        mensaje.textContent = "Inicio de sesión correcto";

        setTimeout(() => {
            window.location.href = "/donantes.html";
        }, 500);

    } catch (error) {
        mensaje.textContent = "No se pudo conectar con el servidor";
    }
});