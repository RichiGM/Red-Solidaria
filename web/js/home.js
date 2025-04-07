document.addEventListener("DOMContentLoaded", () => {
  // Variables globales
  const BASE_URL = "http://localhost:8080/RedSolidaria/api"
  let currentUserId = null

  // Inicialización
  init()

  // Función de inicialización
  async function init() {
    try {
      // Obtener ID del usuario actual
      currentUserId = await obtenerIdUsuario()

      // Cargar servicios destacados
      await cargarServiciosDestacados()

      // Cargar usuarios destacados
      await cargarUsuariosDestacados()

      // Configurar búsqueda
      configurarBusqueda()

      // Configurar botón de chat
      document.querySelector(".chat-btn").addEventListener("click", () => {
        window.location.href = "chat.html"
      })
      
    } catch (error) {
      console.error("Error en la inicialización:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al cargar la página. Por favor, intenta de nuevo más tarde.",
      })
    }
  }
  // Cargar servicios destacados
  async function cargarServiciosDestacados() {
    try {
      const response = await fetch(`${BASE_URL}/servicio/destacados`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar los servicios destacados")
      }

      const servicios = await response.json()

      // Obtener contenedores de servicios destacados
      const featuredSection = document.querySelector(".featured-section")
      featuredSection.innerHTML = ""

      // Mostrar hasta 2 servicios destacados
      const serviciosAMostrar = servicios.slice(0, 2)

      serviciosAMostrar.forEach((servicio) => {
        const servicioElement = document.createElement("div")
        servicioElement.className = "featured-item"

        // Determinar la modalidad en texto
        let modalidadTexto = "Desconocida"
        switch (servicio.modalidad) {
          case 1:
            modalidadTexto = "Presencial"
            break
          case 2:
            modalidadTexto = "Virtual"
            break
          case 3:
            modalidadTexto = "Mixta"
            break
        }

        servicioElement.innerHTML = `
                    <div class="featured-content">
                        <h3>${servicio.titulo}</h3>
                        <p>${servicio.descripcion.substring(0, 100)}${servicio.descripcion.length > 100 ? "..." : ""}</p>
                        <div class="featured-meta">
                            <span class="featured-user">
                                <img src="${servicio.usuario?.foto || "img/usuario.jpg"}" alt="Usuario">
                                ${servicio.usuario?.nombre || "Usuario"}
                            </span>
                            <span class="featured-modality">${modalidadTexto}</span>
                        </div>
                        <button class="btn view-service-btn" data-id="${servicio.idServicio}">Ver detalles</button>
                    </div>
                `

        featuredSection.appendChild(servicioElement)
      })

      // Si no hay suficientes servicios, mostrar placeholders
      for (let i = serviciosAMostrar.length; i < 2; i++) {
        const placeholderElement = document.createElement("div")
        placeholderElement.className = "featured-item placeholder"
        placeholderElement.innerHTML = `
                    <div class="featured-content">
                        <h3>Servicio destacado</h3>
                        <p>Aquí aparecerán los servicios más populares de la plataforma.</p>
                        <button class="btn" onclick="window.location.href='publicaciones.html'">Explorar servicios</button>
                    </div>
                `

        featuredSection.appendChild(placeholderElement)
      }

      // Agregar eventos a los botones de ver detalles
      document.querySelectorAll(".view-service-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const servicioId = this.getAttribute("data-id")
          window.location.href = `publicaciones.html?servicio=${servicioId}`
        })
      })
    } catch (error) {
      console.error("Error al cargar los servicios destacados:", error)

      // Mostrar mensaje de error
      const featuredSection = document.querySelector(".featured-section")
      featuredSection.innerHTML = `
                <div class="featured-item error">
                    <div class="featured-content">
                        <h3>Error al cargar servicios destacados</h3>
                        <p>No se pudieron cargar los servicios destacados. Por favor, intenta de nuevo más tarde.</p>
                        <button class="btn" onclick="window.location.reload()">Reintentar</button>
                    </div>
                </div>
                <div class="featured-item error">
                    <div class="featured-content">
                        <h3>Error al cargar servicios destacados</h3>
                        <p>No se pudieron cargar los servicios destacados. Por favor, intenta de nuevo más tarde.</p>
                        <button class="btn" onclick="window.location.reload()">Reintentar</button>
                    </div>
                </div>
            `
    }
  }

  // Cargar usuarios destacados
  async function cargarUsuariosDestacados() {
    try {
      const response = await fetch(`${BASE_URL}/usuario/destacados`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar los usuarios destacados")
      }

      const usuarios = await response.json()

      // Obtener contenedor de usuarios
      const gridContainer = document.querySelector(".grid-container")
      gridContainer.innerHTML = ""

      // Mostrar hasta 6 usuarios destacados
      const usuariosAMostrar = usuarios.slice(0, 6)

      usuariosAMostrar.forEach((usuario) => {
        const usuarioElement = document.createElement("div")
        usuarioElement.className = "grid-item"
        usuarioElement.innerHTML = `
                    <div class="user-circle">
                        <img src="${usuario.foto || "img/usuario.jpg"}" alt="${usuario.nombre}">
                    </div>
                    <h3>${usuario.nombre}</h3>
                    <div class="user-rating">
                        <span class="rating-value">${usuario.reputacion.toFixed(1)}</span>
                        <div class="stars">${generarEstrellas(usuario.reputacion)}</div>
                    </div>
                    <p class="user-skills">${
                      usuario.habilidades
                        ? usuario.habilidades
                            .slice(0, 3)
                            .map((h) => h.nombre)
                            .join(", ")
                        : "Sin habilidades"
                    }</p>
                    <button class="btn view-profile-btn" data-id="${usuario.idUsuario}">Ver perfil</button>
                `

        gridContainer.appendChild(usuarioElement)
      })

      // Si no hay suficientes usuarios, mostrar placeholders
      for (let i = usuariosAMostrar.length; i < 6; i++) {
        const placeholderElement = document.createElement("div")
        placeholderElement.className = "grid-item placeholder"
        placeholderElement.innerHTML = `
                    <div class="user-circle"></div>
                    <h3>Usuario destacado</h3>
                    <p>Aquí aparecerán los usuarios mejor valorados.</p>
                `

        gridContainer.appendChild(placeholderElement)
      }

      // Agregar eventos a los botones de ver perfil
      document.querySelectorAll(".view-profile-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const usuarioId = this.getAttribute("data-id")
          window.location.href = `perfilVisitante.html?id=${usuarioId}`
        })
      })
    } catch (error) {
      console.error("Error al cargar los usuarios destacados:", error)

      // Mostrar mensaje de error
      const gridContainer = document.querySelector(".grid-container")
      gridContainer.innerHTML = `
                <div class="grid-item error">
                    <div class="error-icon"><i class="fas fa-exclamation-circle"></i></div>
                    <h3>Error al cargar usuarios</h3>
                    <p>No se pudieron cargar los usuarios destacados.</p>
                    <button class="btn" onclick="window.location.reload()">Reintentar</button>
                </div>
            `
    }
  }

  // Configurar búsqueda
  function configurarBusqueda() {
    const searchQuestion = document.querySelector(".search-question")

    // Crear barra de búsqueda si no existe
    if (!document.querySelector(".search-bar")) {
      const searchBar = document.createElement("div")
      searchBar.className = "search-bar"
      searchBar.innerHTML = `
                <input type="text" id="searchInput" placeholder="Buscar servicios o habilidades...">
                <button id="searchBtn" class="btn"><i class="fas fa-search"></i> Buscar</button>
            `

      // Insertar después de la pregunta de búsqueda
      searchQuestion.parentNode.insertBefore(searchBar, searchQuestion.nextSibling)

      // Agregar evento al botón de búsqueda
      document.getElementById("searchBtn").addEventListener("click", realizarBusqueda)

      // Agregar evento al presionar Enter en el campo de búsqueda
      document.getElementById("searchInput").addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          realizarBusqueda()
        }
      })
    }
  }

  // Realizar búsqueda
  function realizarBusqueda() {
    const searchTerm = document.getElementById("searchInput").value.trim()

    if (searchTerm) {
      window.location.href = `publicaciones.html?q=${encodeURIComponent(searchTerm)}`
    } else {
      Swal.fire({
        icon: "info",
        title: "Búsqueda vacía",
        text: "Por favor, ingresa un término de búsqueda.",
      })
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

  // Obtener ID del usuario actual
  async function obtenerIdUsuario() {
    const email = localStorage.getItem("correo")

    if (!email) return null

    try {
      const response = await fetch(`${BASE_URL}/usuario/obtener-id?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener el ID de usuario")
      }

      const data = await response.json()
      return data.idUsuario
    } catch (error) {
      console.error("Error:", error)
      return null
    }
  }

  // Función para abrir modales por ID
  function openModalById(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "block"
      document.body.classList.add("modal-open")
    }
  }

  // Función para cerrar modales por ID
  function closeModalById(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.style.display = "none"
      document.body.classList.remove("modal-open")
    }
  }
})