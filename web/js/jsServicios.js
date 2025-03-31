// services.js
const BASE_URL = "http://localhost:8080/RedSolidaria/api";

// Función para cargar todos los servicios
function loadServices() {
    fetch(`${BASE_URL}/servicio/todos`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(servicios => {
            const servicesGrid = document.getElementById("servicesGrid");
            if (servicesGrid) {
                servicesGrid.innerHTML = "";
                servicios.forEach(servicio => {
                    const gridItem = document.createElement("div");
                    gridItem.className = "grid-item";
                    gridItem.innerHTML = `
                        <div class="user-circle"></div>
                        <p>${servicio.titulo}</p>
                        <p>${servicio.descripcion}</p>
                    `;
                    servicesGrid.appendChild(gridItem);
                });
            }
        })
        .catch(error => {
            console.error("Error al cargar servicios:", error);
        });
}

// Función para publicar un nuevo servicio
function handlePublicarServicio(e) {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        alert("Debes iniciar sesión para publicar un servicio");
        return;
    }

    const servicio = {
        titulo: document.getElementById("serviceTitle").value,
        descripcion: document.getElementById("serviceDescription").value,
        idModalidad: document.getElementById("serviceType").value === "virtual" ? 2 : 1,
        idEstatus: 1,
        idUsuario: usuario.idUsuario,
    };

    fetch(`${BASE_URL}/servicio/publicar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(servicio),
    })
        .then(response => response.json())
        .then(data => {
            alert(data);
            closeModalById("serviceModal");
            closeModalById("serviceModalpublic");
            loadServices();
        })
        .catch(error => {
            console.error("Error al publicar servicio:", error);
            alert("Error al publicar servicio");
        });
}

// Cargar servicios al iniciar la página
document.addEventListener("DOMContentLoaded", loadServices);