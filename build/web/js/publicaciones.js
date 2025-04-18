// Variables globales
const BASE_URL = "http://localhost:8080/RedSolidaria/api";
let currentPage = 1;
const itemsPerPage = 6;
let totalPages = 1;
let allServices = [];
let filteredServices = [];
let isLoading = false;
const currentUserId = null;
const selectedServiceId = null;

// Cargar servicios al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    // Mostrar loader
    showLoader(true);

    // Cargar servicios
    loadAllServices();

    // Eventos para filtros y búsqueda
    document.getElementById("searchButton").addEventListener("click", applyFilters);
    document.getElementById("searchInput").addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            applyFilters();
        }
    });

    document.getElementById("modalityFilter").addEventListener("change", applyFilters);
    document.getElementById("sortFilter").addEventListener("change", applyFilters);

    // Eventos para botones en el modal de detalle
    document.getElementById("requestServiceBtn").addEventListener("click", requestService);
    document.getElementById("contactProviderBtn").addEventListener("click", contactProvider);
    document.getElementById("confirmHoursBtn").addEventListener("click", confirmServiceRequest);

    // Verificar si hay parámetros en la URL
    checkUrlParams();
});

// Función para verificar parámetros en la URL
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Si hay un parámetro de búsqueda, aplicarlo
    if (urlParams.has("q")) {
        const searchTerm = urlParams.get("q");
        document.getElementById("searchInput").value = searchTerm;
        // Aplicar filtros después de cargar los servicios
    }

    // Si hay un ID de servicio, abrir el modal de detalle
    if (urlParams.has("servicio")) {
        const serviceId = Number.parseInt(urlParams.get("servicio"));
        // Abrir el detalle después de cargar los servicios
        window.addEventListener("servicesLoaded", () => {
            openServiceDetail(serviceId);
        });
    }
}

// Función para mostrar/ocultar el loader
function showLoader(show) {
    const loader = document.getElementById("servicesLoader");
    const servicesGrid = document.getElementById("servicesGrid");

    if (show) {
        loader.style.display = "flex";
        servicesGrid.style.display = "none";
        isLoading = true;
    } else {
        loader.style.display = "none";
        servicesGrid.style.display = "grid";
        isLoading = false;
    }
}

// Función para cargar todos los servicios
async function loadAllServices() {
    try {
        showLoader(true);

        const modalityFilter = document.getElementById("modalityFilter").value;
        const sortFilter = document.getElementById("sortFilter").value;

        const response = await fetch(`${BASE_URL}/servicio/todos?modalidad=${modalityFilter}&ordenarPor=${sortFilter}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al cargar los servicios");
        }

        allServices = await response.json();

        // Aplicar filtros iniciales si hay un término de búsqueda en la URL
        const searchInput = document.getElementById("searchInput").value;
        if (searchInput) {
            applyFilters();
        } else {
            filteredServices = [...allServices];
            totalPages = Math.ceil(filteredServices.length / itemsPerPage);
            displayServices(currentPage);
            setupPagination();
        }

        // Disparar evento de servicios cargados
        window.dispatchEvent(new CustomEvent("servicesLoaded"));

        showLoader(false);
    } catch (error) {
        console.error("Error:", error);
        showLoader(false);

        // Mostrar mensaje de error
        const servicesGrid = document.getElementById("servicesGrid");
        servicesGrid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-exclamation-circle"></i>
        <p>No se pudieron cargar los servicios. Por favor, intenta de nuevo más tarde.</p>
        <button class="btn" onclick="window.location.reload()"><i class="fas fa-sync-alt"></i> Reintentar</button>
      </div>
    `;

        // Asegúrate de que Swal esté disponible
        const Swal = window.Swal;
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los servicios. Por favor, intenta de nuevo más tarde.",
        });
    }
}

// Función para aplicar filtros
function applyFilters() {
    if (isLoading)
        return;

    showLoader(true);

    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const modalityFilter = document.getElementById("modalityFilter").value;
    const sortFilter = document.getElementById("sortFilter").value;

    // Filtrar por término de búsqueda y modalidad
    filteredServices = allServices.filter((service) => {
        const matchesSearch =
                searchTerm === "" ||
                service.titulo.toLowerCase().includes(searchTerm) ||
                service.descripcion.toLowerCase().includes(searchTerm) ||
                (service.habilidades && service.habilidades.some((h) => h.nombre.toLowerCase().includes(searchTerm)));

        const matchesModality = modalityFilter === "" || service.modalidad.toString() === modalityFilter;

        return matchesSearch && matchesModality;
    });

    // Ordenar resultados
    switch (sortFilter) {
        case "recent":
            filteredServices.sort((a, b) => new Date(b.fechaCreacion || Date.now()) - new Date(a.fechaCreacion || Date.now()));
            break;
        case "rating":
            filteredServices.sort((a, b) => (b.calificacionUsuario || 0) - (a.calificacionUsuario || 0));
            break;
        case "name":
            filteredServices.sort((a, b) => a.titulo.localeCompare(b.titulo));
            break;
    }

    // Actualizar paginación y mostrar resultados
    currentPage = 1;
    totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    displayServices(currentPage);
    setupPagination();

    showLoader(false);

    // Actualizar URL con parámetros de búsqueda
    if (searchTerm) {
        const url = new URL(window.location);
        url.searchParams.set("q", searchTerm);
        window.history.replaceState({}, "", url);
    } else {
        const url = new URL(window.location);
        url.searchParams.delete("q");
        window.history.replaceState({}, "", url);
    }
}

// Función para mostrar servicios en la página actual
function displayServices(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentServices = filteredServices.slice(startIndex, endIndex);

    const servicesGrid = document.getElementById("servicesGrid");
    servicesGrid.innerHTML = "";

    if (currentServices.length === 0) {
        servicesGrid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>No se encontraron servicios que coincidan con tu búsqueda.</p>
        <button class="btn" onclick="resetFilters()"><i class="fas fa-undo"></i> Mostrar todos los servicios</button>
      </div>
    `;
        return;
    }

    currentServices.forEach((service) => {
        const serviceCard = document.createElement("div");
        serviceCard.className = "service-card";

        // Determinar la modalidad en texto
        let modalidadTexto = "Desconocida";
        let modalidadIcon = "fas fa-question-circle";
        switch (service.modalidad) {
            case 1:
                modalidadTexto = "Presencial";
                modalidadIcon = "fas fa-map-marker-alt";
                break;
            case 2:
                modalidadTexto = "Virtual";
                modalidadIcon = "fas fa-laptop";
                break;
            case 3:
                modalidadTexto = "Mixto";
                modalidadIcon = "fas fa-globe";
                break;
        }

        serviceCard.innerHTML = `
      <div class="service-header">
        <div class="user-avatar-small">
          <img src="${service.fotoUsuario || "img/usuario.jpg"}" alt="Foto de perfil">
        </div>
        <div class="service-info">
          <h3 class="service-author">${service.nombreUsuario || "Usuario"}</h3>
          <div class="rating-stars">
            <span>${service.calificacionUsuario || "4.0"}</span>
            <div class="stars">${generarEstrellas(service.calificacionUsuario || 4)}</div>
          </div>
        </div>
      </div>
      <div class="service-body">
        <h3 class="service-title">${service.titulo}</h3>
        <p class="service-description">${service.descripcion.substring(0, 100)}${service.descripcion.length > 100 ? "..." : ""}</p>
        <div class="service-tags">
          <span class="service-tag"><i class="${modalidadIcon}"></i> ${modalidadTexto}</span>
          ${
                service.habilidades && service.habilidades.length > 0
                ? service.habilidades
                .slice(0, 2)
                .map((h) => `<span class="service-tag"><i class="fas fa-tag"></i> ${h.nombre}</span>`)
                .join("")
                : ""
                }
        </div>
      </div>
      <div class="service-footer">
        <button class="btn" data-id="${service.idServicio}"><i class="fas fa-info-circle"></i> Ver detalles</button>
      </div>
    `;

        servicesGrid.appendChild(serviceCard);

        // Agregar evento al botón "Ver detalles"
        const detailButton = serviceCard.querySelector(".btn");
        detailButton.addEventListener("click", () => openServiceDetail(service.idServicio));
    });
}

// Función para configurar la paginación
function setupPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    // Botón "Anterior"
    const prevButton = document.createElement("button");
    prevButton.className = "pagination-btn prev";
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayServices(currentPage);
            setupPagination();
        }
    });
    pagination.appendChild(prevButton);

    // Números de página
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button");
        pageButton.className = `pagination-btn page ${i === currentPage ? "active" : ""}`;
        pageButton.textContent = i;
        pageButton.addEventListener("click", () => {
            currentPage = i;
            displayServices(currentPage);
            setupPagination();
        });
        pagination.appendChild(pageButton);
    }

    // Botón "Siguiente"
    const nextButton = document.createElement("button");
    nextButton.className = "pagination-btn next";
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayServices(currentPage);
            setupPagination();
        }
    });
    pagination.appendChild(nextButton);
}

// Función para abrir el detalle de un servicio
async function openServiceDetail(serviceId) {
    try {
        const service = allServices.find((s) => s.idServicio === serviceId);

        if (!service) {
            throw new Error("Servicio no encontrado");
        }

        // Determinar la modalidad en texto
        let modalidadTexto = "Desconocida";
        switch (service.modalidad) {
            case 1:
                modalidadTexto = "Presencial";
                break;
            case 2:
                modalidadTexto = "Virtual";
                break;
            case 3:
                modalidadTexto = "Mixto";
                break;
        }

        // Llenar el modal con los datos del servicio
        document.getElementById("modalServiceTitle").textContent = service.titulo;
        document.getElementById("modalUserName").textContent = service.nombreUsuario || "Usuario";
        document.getElementById("modalUserRating").textContent = service.calificacionUsuario || "4.0";
        document.getElementById("modalServiceDescription").textContent = service.descripcion;
        document.getElementById("modalServiceModality").textContent = modalidadTexto;

        // Configurar la imagen del usuario
        const userImage = document.getElementById("modalUserImage");
        userImage.src = service.fotoUsuario || "img/usuario.jpg";

        // Configurar el enlace al perfil
        const viewProfileLink = document.getElementById("modalViewProfile");
        viewProfileLink.href = `perfilVisitante.html?id=${service.idUsuario}`;

        // Configurar las estrellas
        document.getElementById("modalStars").innerHTML = generarEstrellas(service.calificacionUsuario || 4);

        // Configurar las etiquetas/habilidades
        const tagsContainer = document.getElementById("modalServiceTags");
        tagsContainer.innerHTML = "";
        if (service.habilidades && service.habilidades.length > 0) {
            service.habilidades.forEach((habilidad) => {
                const tag = document.createElement("span");
                tag.className = "service-tag";
                tag.innerHTML = `<i class="fas fa-tag"></i> ${habilidad.nombre}`;
                tagsContainer.appendChild(tag);
            });
        } else {
            tagsContainer.innerHTML = "<span class='no-tags'>Sin habilidades</span>";
        }

        // Configurar botones de acción
        const requestServiceBtn = document.getElementById("requestServiceBtn");
        requestServiceBtn.setAttribute("data-id", service.idServicio);

        const contactProviderBtn = document.getElementById("contactProviderBtn");
        contactProviderBtn.setAttribute("data-id", service.idUsuario);

        // Mostrar el modal
        openModalById("serviceDetailModal");

        // Actualizar URL con el ID del servicio
        const url = new URL(window.location);
        url.searchParams.set("servicio", serviceId);
        window.history.replaceState({}, "", url);
    } catch (error) {
        console.error("Error al abrir el detalle del servicio:", error);
        const Swal = window.Swal;
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los detalles del servicio. Por favor, intenta de nuevo más tarde.",
        });
    }
}

// Función para solicitar un servicio
async function requestService(event) {
    const serviceId = parseInt(event.target.getAttribute("data-id"));

    const token = localStorage.getItem("lastToken");
    if (!token) {
        Swal.fire({
            icon: "warning",
            title: "Inicio de sesión requerido",
            text: "Debes iniciar sesión para solicitar servicios",
            showCancelButton: true,
            confirmButtonText: "Iniciar sesión",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.href);
            }
        });
        return;
    }

    // Obtener información del servicio
    const service = allServices.find(s => s.idServicio === serviceId);
    if (!service) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se encontró el servicio seleccionado"
        });
        return;
    }

    // Configurar modal de horas
    document.getElementById("confirmHoursBtn").setAttribute("data-id", serviceId);
    document.getElementById("hoursInput").value = "1";
    openModalById("hoursSelectionModal");
}

async function confirmServiceRequest(event) {
    const serviceId = parseInt(event.target.getAttribute("data-id"));
    const hoursOffered = parseFloat(document.getElementById("hoursInput").value);
    
    if (!hoursOffered || hoursOffered <= 0) {
        Swal.fire({
            icon: "error",
            title: "Cantidad inválida",
            text: "Por favor, ingresa una cantidad válida de horas (mayor a 0)"
        });
        return;
    }

    try {
        const token = localStorage.getItem("lastToken");
        if (!token) {
            throw new Error("No hay token de autenticación. Por favor, inicia sesión.");
        }

        const correo = localStorage.getItem("correo");
        if (!correo) {
            Swal.fire({
                icon: "warning",
                title: "Sesión no iniciada",
                text: "No se encontró el correo del usuario. Por favor, inicia sesión.",
                showCancelButton: true,
                confirmButtonText: "Iniciar sesión",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.href);
                }
            });
            return;
        }

        const idUsuarioResponse = await fetch(`${BASE_URL}/usuario/obtener-id?email=${encodeURIComponent(correo)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!idUsuarioResponse.ok) {
            throw new Error("Error al obtener el ID del usuario");
        }

        const idUsuarioData = await idUsuarioResponse.json();
        const idUsuario = idUsuarioData.idUsuario;

        const service = allServices.find(s => s.idServicio === serviceId);
        if (!service) {
            throw new Error("No se encontró el servicio seleccionado");
        }

        if (service.idUsuario === idUsuario) {
            Swal.fire({
                icon: "error",
                title: "Acción no permitida",
                text: "No puedes solicitar tu propio servicio"
            });
            return;
        }

        Swal.fire({
            title: "Procesando solicitud",
            html: "Estamos procesando tu solicitud...",
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        // Crear primero el intercambio
        const intercambioData = {
            dia: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('en-US', { hour12: false }),
            estatus: 0,
            idUsuarioSolicitante: idUsuario,
            idUsuarioOferente: service.idUsuario
        };

        const intercambioResponse = await fetch(`${BASE_URL}/intercambio/crear`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(intercambioData)
        });

        if (!intercambioResponse.ok) {
            const errorText = await intercambioResponse.text();
            throw new Error(`Error al crear el intercambio: ${errorText}`);
        }

        const intercambioResult = await intercambioResponse.json();
        
        // Crear la transacción usando el modelo DTO
        const transaccionData = {
            idIntercambio: intercambioResult.idIntercambio,
            idUsuarioOferente: service.idUsuario,
            idUsuarioSolicitante: idUsuario,
            horasIntercambiadas: hoursOffered,
            fecha: new Date().toISOString().split('T')[0],
            detalles: `Solicitud de servicio: ${service.titulo}`,
            verificadoOferente: false,
            verificadoSolicitante: false,
            horasRecibidas: 0,
            horasOfrecidas: hoursOffered,
            intercambiosCompletados: 0
        };

        const transaccionResponse = await fetch(`${BASE_URL}/transaccion/solicitar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(transaccionData)
        });

        if (!transaccionResponse.ok) {
            const errorText = await transaccionResponse.text();
            throw new Error(`Error al crear la transacción: ${errorText}`);
        }

        // Crear relación servicio-intercambio
        const servicioIntercambioData = {
            idServicio: serviceId,
            idIntercambio: intercambioResult.idIntercambio
        };

        const siResponse = await fetch(`${BASE_URL}/servicio-intercambio/crear`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(servicioIntercambioData)
        });

        if (!siResponse.ok) {
            const errorText = await siResponse.text();
            throw new Error(`Error al vincular servicio con intercambio: ${errorText}`);
        }

        closeModalById("hoursSelectionModal");
        
        Swal.fire({
            icon: "success",
            title: "Solicitud enviada",
            text: "Tu solicitud de servicio ha sido enviada correctamente.",
            confirmButtonText: "Ver mis intercambios"
        }).then(() => {
            window.location.href = "intercambios.html";
        });

    } catch (error) {
        console.error("Error al solicitar servicio:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: `No se pudo procesar la solicitud: ${error.message}`
        });
    }
}

// Función para contactar al proveedor
function contactProvider(event) {
    const userId = event.target.getAttribute("data-id");
    const Swal = window.Swal;
    Swal.fire({
        icon: "info",
        title: "Contactar proveedor",
        text: `Serás redirigido al chat con el usuario ID ${userId}.`,
    }).then(() => {
        window.location.href = `chat.html?id=${userId}`;
    });
}

// Función para resetear los filtros
function resetFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("modalityFilter").value = "";
    document.getElementById("sortFilter").value = "recent";
    applyFilters();
}

// Funciones para abrir y cerrar el modal
function openModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex";
        document.body.classList.add("modal-open");

        // Agregar evento para cerrar al hacer clic fuera del modal
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeModalById(modalId);
            }
        });
    }
}

function closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        document.body.classList.remove("modal-open");

        // Eliminar el parámetro de servicio de la URL
        const url = new URL(window.location);
        url.searchParams.delete("servicio");
        window.history.replaceState({}, "", url);
    }
}

// Generar estrellas según la calificación
function generarEstrellas(rating) {
    rating = Number.parseFloat(rating) || 0;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let starsHTML = "";

    // Estrellas completas
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }

    // Media estrella si corresponde
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }

    // Estrellas vacías
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }

    return starsHTML;
}