const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!token) {
    window.location.href = "/";
}

if (rol !== "administrador") {
    document.getElementById("nuevoDonante").style.display = "none";
}

const listaDonantes = document.getElementById("listaDonantes");
const cerrarSesion = document.getElementById("cerrarSesion");

async function cargarDonantes() {
    try {
        const respuesta = await fetch("/donantes", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const donantes = await respuesta.json();

        if (!respuesta.ok) {
            listaDonantes.innerHTML = `<p>${donantes.error}</p>`;
            return;
        }

        if (donantes.length === 0) {
            listaDonantes.innerHTML = "<p>No hay donantes registrados.</p>";
            return;
        }

        let tabla = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Recurso</th>
                        <th>Cantidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        donantes.forEach((donante) => {
            tabla += `
                <tr>
                    <td>${donante.id}</td>
                    <td>${donante.nombre}</td>
                    <td>${donante.correo}</td>
                    <td>${donante.telefono}</td>
                    <td>${donante.tipoRecurso}</td>
                    <td>${donante.cantidad}</td>
                    <td>
                        ${
                            rol === "administrador"
                                ? `
                                    <button class="btn-editar" onclick="editarDonante(${donante.id})">
                                        Editar
                                    </button>

                                    <button class="btn-eliminar" onclick="eliminarDonante(${donante.id})">
                                        Eliminar
                                    </button>
                                `
                                : ""
                        }
                    </td>
                </tr>
            `;
        });

        tabla += `
                </tbody>
            </table>
        `;

        listaDonantes.innerHTML = tabla;

    } catch (error) {
        console.error(error);
        listaDonantes.innerHTML = "<p>Error al conectar con el servidor.</p>";
    }
}

cerrarSesion.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    window.location.href = "/";
});

const nuevoDonante = document.getElementById("nuevoDonante");
const formularioDonante = document.getElementById("formularioDonante");
const cancelarDonante = document.getElementById("cancelarDonante");

nuevoDonante.addEventListener("click", () => {
    formularioDonante.classList.remove("oculto");
});

cancelarDonante.addEventListener("click", () => {
    formularioDonante.classList.add("oculto");
});

const donanteForm = document.getElementById("donanteForm");
const mensajeDonante = document.getElementById("mensajeDonante");

donanteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const donante = {
        nombre: document.getElementById("nombre").value,
        correo: document.getElementById("correo").value,
        telefono: document.getElementById("telefono").value,
        tipoRecurso: document.getElementById("tipoRecurso").value,
        cantidad: document.getElementById("cantidad").value
    };

    try {
        const respuesta = await fetch("/donantes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(donante)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensajeDonante.textContent = datos.error;
            return;
        }

        mensajeDonante.textContent = "Donante registrado correctamente";

        donanteForm.reset();

        setTimeout(() => {
            formularioDonante.classList.add("oculto");
            cargarDonantes();
            mensajeDonante.textContent = "";
        }, 800);

    } catch (error) {
        console.error(error);
        mensajeDonante.textContent = "Error al conectar con el servidor";
    }
});

async function editarDonante(id) {
    const nombre = prompt("Nombre completo:");
    if (nombre === null) return;

    const correo = prompt("Correo electrónico:");
    if (correo === null) return;

    const telefono = prompt("Teléfono:");
    if (telefono === null) return;

    const tipoRecurso = prompt("Tipo de recurso:");
    if (tipoRecurso === null) return;

    const cantidad = prompt("Cantidad:");
    if (cantidad === null) return;

    try {
        const respuesta = await fetch(`/donantes/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nombre,
                correo,
                telefono,
                tipoRecurso,
                cantidad
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.error);
            return;
        }

        alert("Donante actualizado correctamente");

        cargarDonantes();

    } catch (error) {
        console.error(error);
        alert("Error al conectar con el servidor");
    }
}

async function eliminarDonante(id) {
    const confirmar = confirm("¿Seguro que quieres eliminar este donante?");

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(`${window.location.origin}/donantes/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.error);
            return;
        }

        alert("Donante eliminado correctamente");

        cargarDonantes();

    } catch (error) {
        console.error(error);
        alert("Error al conectar con el servidor");
    }
}

cargarDonantes();