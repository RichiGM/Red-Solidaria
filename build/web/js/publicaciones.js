// Variables globales
const BASE_URL = "http://localhost:8080/RedSolidaria/api"
let currentPage = 1
const itemsPerPage = 6
let totalPages = 1
let allServices = []
let filteredServices = []

// Cargar servicios al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
  loadAllServices()

  // Eventos para filtros y búsqueda
  document.getElementById("searchButton").addEventListener("click", applyFilters)
  document.getElementById("searchInput").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      applyFilters()
    }z
  })

  document.getElementById("modalityFilter").addEventListener("change", applyFilters)
  document.getElementById("sortFilter").addEventListener("change", applyFilters)

  // Eventos para botones en el modal de detalle
  document.getElementById("requestServiceBtn").addEventListener("click", requestService)
  document.getElementById("contactProviderBtn").addEventListener("click", contactProvider)
})

// Función para cargar todos los servicios
async function loadAllServices() {
  try {
    const response = await fetch(`${BASE_URL}/servicio/todos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Error al cargar los servicios")
    }

    allServices = await response.json()
    filteredServices = [...allServices]
    totalPages = Math.ceil(filteredServices.length / itemsPerPage)

    displayServices(currentPage)
    setupPagination()
  } catch (error) {
    console.error("Error:", error)
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los servicios. Por favor, intenta de nuevo más tarde.",
    })
  }
}

// Función para aplicar filtros
function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  const modalityFilter = document.getElementById("modalityFilter").value
  const sortFilter = document.getElementById("sortFilter").value

  // Filtrar por término de búsqueda y modalidad
  filteredServices = allServices.filter((service) => {
    const matchesSearch =
      searchTerm === "" ||
      service.titulo.toLowerCase().includes(searchTerm) ||
      service.descripcion.toLowerCase().includes(searchTerm)

    const matchesModality = modalityFilter === "" || service.modalidad.toString() === modalityFilter

    return matchesSearch && matchesModality
  })

  // Ordenar resultados
  switch (sortFilter) {
    case "recent":
      // Asumiendo que hay un campo fecha en el servicio
      filteredServices.sort((a, b) => new Date(b.fechaCreacion || Date.now()) - new Date(a.fechaCreacion || Date.now()))
      break
    case "rating":
      // Asumiendo que hay un campo calificación en el servicio o usuario
      filteredServices.sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0))
      break
    case "name":
      filteredServices.sort((a, b) => a.titulo.localeCompare(b.titulo))
      break
  }

  // Actualizar paginación y mostrar resultados
  currentPage = 1
  totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  displayServices(currentPage)
  setupPagination()
}

// Función para mostrar servicios en la página actual
function displayServices(page) {
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentServices = filteredServices.slice(startIndex, endIndex)

  const servicesGrid = document.getElementById("servicesGrid")
  servicesGrid.innerHTML = ""

  if (currentServices.length === 0) {
    servicesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No se encontraron servicios que coincidan con tu búsqueda.</p>
                <button class="btn" onclick="resetFilters()">Mostrar todos los servicios</button>
            </div>
        `
    return
  }

  currentServices.forEach((service) => {
    const serviceCard = document.createElement("div")
    serviceCard.className = "service-card"

    // Determinar la modalidad en texto
    let modalidadTexto = "Desconocida"
    switch (service.modalidad) {
      case 1:
        modalidadTexto = "Presencial"
        break
      case 2:
        modalidadTexto = "Virtual"
        break
      case 3:
        modalidadTexto = "Mixto"
        break
    }

    serviceCard.innerHTML = `
            <div class="service-header">
                <div class="photo-circle user-avatar-small">
                    <img src="${service.fotoUsuario || "img/usuario.jpg"}" alt="Foto de perfil">
                </div>
                <div class="service-info">
                    <h3 class="service-author">${service.nombreUsuario || "Usuario"}</h3>
                    <div class="rating-stars">
                        <span>${service.calificacionUsuario || "4.0"}</span>
                        <div class="stars">★★★★★</div>
                    </div>
                </div>
            </div>
            <div class="service-body">
                <h3 class="service-title">${service.titulo}</h3>
                <p class="service-description">${service.descripcion.substring(0, 100)}${service.descripcion.length > 100 ? "..." : ""}</p>
                <div class="service-tags">
                    <span class="service-tag">${modalidadTexto}</span>
                </div>
            </div>
            <div class="service-footer">
                <button class="btn" data-id="${service.idServicio}">Ver detalles</button>
            </div>
        `

    servicesGrid.appendChild(serviceCard)

    // Agregar evento al botón "Ver detalles"
    const detailButton = serviceCard.querySelector(".btn")
    detailButton.addEventListener("click", () => openServiceDetail(service.idServicio))
  })
}

// Función para configurar la paginación
function setupPagination() {
  const pagination = document.getElementById("pagination")
  pagination.innerHTML = ""

  if (totalPages <= 1) {
    return
  }

  // Botón "Anterior"
  const prevButton = document.createElement("button")
  prevButton.className = "pagination-btn prev"
  prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>'
  prevButton.disabled = currentPage === 1
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--
      displayServices(currentPage)
      setupPagination()
    }
  })
  pagination.appendChild(prevButton)

  // Números de página
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement("button")
    pageButton.className = `pagination-btn page ${i === currentPage ? "active" : ""}`
    pageButton.textContent = i
    pageButton.addEventListener("click", () => {
      currentPage = i
      displayServices(currentPage)
      setupPagination()
    })
    pagination.appendChild(pageButton)
  }

  // Botón "Siguiente"
  const nextButton = document.createElement("button")
  nextButton.className = "pagination-btn next"
  nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>'
  nextButton.disabled = currentPage === totalPages
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++
      displayServices(currentPage)
      setupPagination()
    }
  })
  pagination.appendChild(nextButton)
}

// Función para abrir el detalle de un servicio
async function openServiceDetail(serviceId) {
  try {
    // En un caso real, aquí harías una petición para obtener los detalles completos del servicio
    // Por ahora, usamos los datos que ya tenemos
    const service = allServices.find((s) => s.idServicio === serviceId)

    if (!service) {
      throw new Error("Servicio no encontrado")
    }

    // Determinar la modalidad en texto
    let modalidadTexto = "Desconocida"
    switch (service.modalidad) {
      case 1:
        modalidadTexto = "Presencial"
        break
      case 2:
        modalidadTexto = "Virtual"
        break
      case 3:
        modalidadTexto = "Mixto"
        break
    }

    // Llenar el modal con los datos del servicio
    document.getElementById("modalServiceTitle").textContent = service.titulo
    document.getElementById("modalUserName").textContent = service.nombreUsuario || "Usuario"
    document.getElementById("modalUserRating").textContent = service.calificacionUsuario || "4.0"
    document.getElementById("modalServiceDescription").textContent = service.descripcion
    document.getElementById("modalServiceModality").textContent = modalidadTexto

    // Configurar la imagen del usuario
    const userImage = document.getElementById("modalUserImage")
    userImage.src = service.fotoUsuario || "img/usuario.jpg"

    // Configurar el enlace al perfil
    const viewProfileLink = document.getElementById("modalViewProfile")
    viewProfileLink.href = `perfilVisitante.html?id=${service.idUsuario}`

    // Configurar las etiquetas/habilidades
    const tagsContainer = document.getElementById("modalServiceTags")
    tagsContainer.innerHTML = ""
    if (service.habilidades && service.habilidades.length > 0) {
      service.habilidades.forEach((habilidad) => {
        const tag = document.createElement("span")
        tag.className = "service-tag"
        tag.textContent = habilidad.nombre
        tagsContainer.appendChild(tag)
      })
    } else {
      tagsContainer.innerHTML = "<span class='no-tags'>Sin habilidades</span>"
    }

    // Configurar botones de acción
    const requestServiceBtn = document.getElementById("requestServiceBtn")
    requestServiceBtn.setAttribute("data-id", service.idServicio)

    const contactProviderBtn = document.getElementById("contactProviderBtn")
    contactProviderBtn.setAttribute("data-id", service.idUsuario)

    // Mostrar el modal
    openModalById("serviceDetailModal")
  } catch (error) {
    console.error("Error al abrir el detalle del servicio:", error)
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los detalles del servicio. Por favor, intenta de nuevo más tarde.",
    })
  }
}

// Función para solicitar un servicio
function requestService(event) {
  const serviceId = event.target.getAttribute("data-id")
  // Aquí implementarías la lógica para solicitar el servicio
  Swal.fire({
    icon: "success",
    title: "Solicitud enviada",
    text: `Has solicitado el servicio con ID ${serviceId}.`,
  })
}

// Función para contactar al proveedor
function contactProvider(event) {
  const userId = event.target.getAttribute("data-id")
  // Aquí implementarías la lógica para contactar al proveedor
  Swal.fire({
    icon: "info",
    title: "Contactar proveedor",
    text: `Serás redirigido al chat con el usuario ID ${userId}.`,
  }).then(() => {
    window.location.href = `chat.html?id=${userId}`
  })
}

// Función para resetear los filtros
function resetFilters() {
  document.getElementById("searchInput").value = ""
  document.getElementById("modalityFilter").value = ""
  document.getElementById("sortFilter").value = "recent"
  applyFilters()
}

// Funciones para abrir y cerrar el modal
function openModalById(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "block"
    document.body.classList.add("modal-open")
  }
}

function closeModalById(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "none"
    document.body.classList.remove("modal-open")
  }
}

// Generar estrellas según la calificación
function generarEstrellas(rating) {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

  let starsHTML = ""

  // Estrellas completas
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>'
  }

  // Media estrella si corresponde
  if (halfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>'
  }

  // Estrellas vacías
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>'
  }

  return starsHTML
}

