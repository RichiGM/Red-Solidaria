// Variables globales
const emailLocal = localStorage.getItem("correo");
const token = localStorage.getItem("lastToken");

// Mostrar el modal al hacer clic en "Agregar Servicio"
document.getElementById("addServiceBtn").addEventListener("click", () => {
  document.getElementById("addServiceModal").style.display = "flex";
});

// Manejar el envío del formulario de agregar servicio
document.getElementById("addServiceForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const servicio = {
    titulo: document.getElementById("serviceTitle").value,
    descripcion: document.getElementById("serviceDescription").value,
    modalidad: document.getElementById("serviceModality").value === "presencial" ? 1 : 
          document.getElementById("serviceModality").value === "virtual" ? 2 : 
          document.getElementById("serviceModality").value === "mixto" ? 3 : 1, // Valor por defecto: 1 // Convertir a entero
    estatus: 1, // Asumimos que el estatus por defecto es "Activo"
    idUsuario: await obtenerIdUsuarioPorEmail(emailLocal), // Obtener el ID de usuario
  };

  try {
    const idUsuario = await obtenerIdUsuarioPorEmail(emailLocal);
    servicio.idUsuario = idUsuario;

    const response = await fetch("http://localhost:8080/RedSolidaria/api/servicio/agregar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(servicio),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al guardar el servicio");
    }

    const result = await response.json();
    console.log("Servicio guardado:", result);

    closeModalById("addServiceModal");
    await cargarServicios();
  } catch (error) {
    console.error("Error al guardar el servicio:", error);
    if (window.Swal) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el servicio: " + error.message,
      });
    } else {
      console.error("Swal no está definido");
    }
  }
});

// Manejar el envío del formulario de editar servicio
document.getElementById("editServiceForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const servicio = {
    idServicio: Number.parseInt(document.getElementById("editServiceId").value),
    titulo: document.getElementById("editServiceTitle").value,
    descripcion: document.getElementById("editServiceDescription").value,
    modalidad: document.getElementById("editServiceModality").value === "presencial" ? 1 : 
               document.getElementById("editServiceModality").value === "virtual" ? 2 : 
               document.getElementById("editServiceModality").value === "mixto" ? 3 : 1, // Convertir a entero
    estatus: document.getElementById("editServiceStatus").value === "activo" ? 1 : 0, // Convertir a entero
    idUsuario: await obtenerIdUsuarioPorEmail(emailLocal),
  };

  try {
    const response = await fetch("http://localhost:8080/RedSolidaria/api/servicio/modificar", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(servicio),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al editar el servicio");
    }

    const result = await response.json();
    console.log("Servicio editado:", result);

    closeModalById("editServiceModal");
    await cargarServicios();
  } catch (error) {
    console.error("Error al editar el servicio:", error);
    if (window.Swal) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo editar el servicio: " + error.message,
      });
    } else {
      console.error("Swal no está definido");
    }
  }
});

// Función para cargar los servicios desde la API
async function cargarServicios(query = "") {
  try {
    const idUsuario = await obtenerIdUsuarioPorEmail(emailLocal);
    const response = await fetch(
      `http://localhost:8080/RedSolidaria/api/servicio/mis-servicios?idUsuario=${idUsuario}&query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Error al cargar los servicios");
    }

    const servicios = await response.json();
    const servicesList = document.getElementById("servicesList");
    servicesList.innerHTML = ""; // Limpiar la lista

    servicios.forEach((servicio) => {
      const serviceCard = document.createElement("div");
      serviceCard.className = "service-card";
      serviceCard.innerHTML = `
                <h3>${servicio.titulo}</h3>
                <p><label>Título:</label> ${servicio.titulo}</p>
                <p><label>Descripción:</label> ${servicio.descripcion}</p>
                <p><label>Modalidad:</label> ${servicio.modalidad === 1 ? "Presencial" : servicio.modalidad === 2 ? "Virtual" : "Mixto"}</p>
                <p><label>Estatus:</label> ${servicio.estatus === 1 ? "Activo" : "Inactivo"}</p>
                <button class="edit-icon" data-id="${servicio.idServicio}"><i class="fas fa-edit"></i></button>
            `;
      servicesList.appendChild(serviceCard);
    });

    // Añadir eventos a los botones de edición
    document.querySelectorAll(".edit-icon").forEach((button) => {
      button.addEventListener("click", function () {
        const idServicio = this.getAttribute("data-id");
        const servicio = servicios.find((s) => s.idServicio == idServicio);
        abrirModalEditar(servicio);
      });
    });
  } catch (error) {
    console.error("Error al cargar los servicios:", error);
    if (window.Swal) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los servicios: " + error.message,
      });
    } else {
      console.error("Swal no está definido");
    }
  }
}

// Función para buscar servicios
async function buscarServicios() {
  const searchTerm = document.getElementById("searchInput").value;
  await cargarServicios(searchTerm);
}

// Evento para buscar servicios al hacer clic en el botón de búsqueda
if (document.getElementById("searchButton")) {
  document.getElementById("searchButton").addEventListener("click", buscarServicios);
}

// Evento para buscar servicios al presionar "Enter" en el campo de búsqueda
if (document.getElementById("searchInput")) {
  document.getElementById("searchInput").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      buscarServicios();
    }
  });
}

// Función para abrir el modal de edición con los datos del servicio
function abrirModalEditar(servicio) {
  document.getElementById("editServiceId").value = servicio.idServicio;
  document.getElementById("editServiceTitle").value = servicio.titulo;
  document.getElementById("editServiceDescription").value = servicio.descripcion;
  document.getElementById("editServiceModality").value = servicio.modalidad === 1 ? "presencial" : servicio.modalidad === 2 ? "virtual" : "mixto";
  document.getElementById("editServiceStatus").value = servicio.estatus === 1 ? "activo" : "inactivo";
  document.getElementById("editServiceModal").style.display = "flex";
}

// Función para obtener el ID del usuario por email
async function obtenerIdUsuarioPorEmail(email) {
  try {
    const response = await fetch(`http://localhost:8080/RedSolidaria/api/usuario/obtener-id?email=${email}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || "Error al obtener el ID de usuario.");
    }

    const data = await response.json();
    return data.idUsuario;
  } catch (error) {
    console.error("Error al obtener el ID de usuario:", error);
    throw error;
  }
}

// Función para cerrar modales por ID
function closeModalById(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("modal-open");
  }
}

// Cargar los servicios al iniciar la página
document.addEventListener("DOMContentLoaded", cargarServicios);