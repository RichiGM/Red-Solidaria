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
      const chatBtn = document.querySelector(".chat-btn")
      if (chatBtn) {
        chatBtn.addEventListener("click", (e) => {
          e.preventDefault()
          window.location.href = "chat.html"
        })
      }
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
      console.log("Iniciando carga de servicios destacados...")

      // Realizar petición sin token para depuración
      const response = await fetch(`${BASE_URL}/servicio/destacados`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

      if (!response.ok) {
        console.error("Error en la respuesta:", response.status, response.statusText)
        throw new Error("Error al cargar los servicios destacados")
      }

      const servicios = await response.json()
      console.log("Servicios destacados recibidos:", servicios)

      // Obtener contenedores de servicios destacados
      const featuredSection = document.querySelector(".featured-section")
      if (!featuredSection) {
        console.error("No se encontró el contenedor de servicios destacados")
        return
      }
      featuredSection.innerHTML = ""

      // Mostrar hasta 3 servicios destacados
      const serviciosAMostrar = servicios.slice(0, 3)

      if (serviciosAMostrar.length === 0) {
        mostrarServiciosPlaceholder()
        return
      }

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

        // Verificar que los datos existan antes de usarlos
        const titulo = servicio.titulo || "Sin título"
        const descripcion = servicio.descripcion || "Sin descripción"
        const nombreUsuario = servicio.nombreUsuario || "Usuario"
        const fotoUsuario = servicio.fotoUsuario || "img/usuario.jpg"

        servicioElement.innerHTML = `
                    <div class="featured-content">
                        <h3>${titulo}</h3>
                        <p>${descripcion.substring(0, 100)}${descripcion.length > 100 ? "..." : ""}</p>
                        <div class="featured-meta">
                            <span class="featured-user">
                                <img src="${fotoUsuario}" alt="${nombreUsuario}">
                                ${nombreUsuario}
                            </span>
                            <span class="featured-modality">${modalidadTexto}</span>
                        </div>
                        <button class="btn view-service-btn" data-id="${servicio.idServicio}">Ver detalles</button>
                    </div>
                `

        featuredSection.appendChild(servicioElement)
      })

      // Si no hay suficientes servicios, mostrar placeholders
      if (serviciosAMostrar.length < 3) {
        for (let i = serviciosAMostrar.length; i < 3; i++) {
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
      mostrarServiciosPlaceholder()
    }
  }

  // Mostrar placeholders para servicios en caso de error
  function mostrarServiciosPlaceholder() {
    const featuredSection = document.querySelector(".featured-section")
    featuredSection.innerHTML = ""

    for (let i = 0; i < 3; i++) {
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
  }

  // Cargar servicios destacados de ejemplo (cuando la API falla)
  function cargarServiciosDestacadosEjemplo() {
    const serviciosEjemplo = [
      {
        idServicio: 1,
        titulo: "Diseño de logotipos",
        descripcion: "Creación de logotipos profesionales para tu empresa o proyecto",
        modalidad: 3,
        nombreUsuario: "Ana García",
        fotoUsuario: "img/usuario.jpg",
      },
      {
        idServicio: 2,
        titulo: "Desarrollo web frontend",
        descripcion: "Creación de sitios web responsivos con React",
        modalidad: 2,
        nombreUsuario: "Carlos Rodríguez",
        fotoUsuario: "img/usuario.jpg",
      },
    ]

    const featuredSection = document.querySelector(".featured-section")
    if (!featuredSection) {
      console.error("No se encontró el contenedor de servicios destacados")
      return
    }

    featuredSection.innerHTML = ""

    serviciosEjemplo.forEach((servicio) => {
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
                <img src="${servicio.fotoUsuario}" alt="Usuario">
                ${servicio.nombreUsuario}
              </span>
              <span class="featured-modality">${modalidadTexto}</span>
            </div>
            <button class="btn view-service-btn" data-id="${servicio.idServicio}">Ver detalles</button>
          </div>
        `

      featuredSection.appendChild(servicioElement)
    })

    // Agregar eventos a los botones de ver detalles
    document.querySelectorAll(".view-service-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const servicioId = this.getAttribute("data-id")
        window.location.href = `publicaciones.html?servicio=${servicioId}`
      })
    })
  }

  // Cargar usuarios destacados
  async function cargarUsuariosDestacados() {
    try {
      console.log("Iniciando carga de usuarios destacados...")

      // Realizar petición sin token para depuración
      const response = await fetch(`${BASE_URL}/usuario/destacados`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

      if (!response.ok) {
        console.error("Error en la respuesta:", response.status, response.statusText)
        throw new Error("Error al cargar los usuarios destacados")
      }

      const usuarios = await response.json()
      console.log("Usuarios destacados recibidos:", usuarios)

      // Obtener contenedor de usuarios
      const gridContainer = document.querySelector(".grid-container")
      if (!gridContainer) {
        console.error("No se encontró el contenedor de usuarios destacados")
        return
      }
      gridContainer.innerHTML = ""

      // Mostrar hasta 6 usuarios destacados
      const usuariosAMostrar = usuarios.slice(0, 6)

      if (usuariosAMostrar.length === 0) {
        mostrarUsuariosPlaceholder()
        return
      }

      usuariosAMostrar.forEach((usuario) => {
        const usuarioElement = document.createElement("div")
        usuarioElement.className = "grid-item"

        // Verificar que los datos existan antes de usarlos
        const nombre = usuario.nombre || "Usuario"
        const foto = usuario.foto || "img/usuario.jpg"
        const reputacion = usuario.reputacion || 0

        usuarioElement.innerHTML = `
                    <div class="user-circle">
                        <img src="${foto}" alt="${nombre}">
                    </div>
                    <h3>${nombre}</h3>
                    <div class="user-rating">
                        <span class="rating-value">${reputacion.toFixed(1)}</span>
                        <div class="stars">${generarEstrellas(reputacion)}</div>
                    </div>
                    <p class="user-skills">${
                      usuario.habilidades && Array.isArray(usuario.habilidades)
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
      if (usuariosAMostrar.length < 6) {
        for (let i = usuariosAMostrar.length; i < 6; i++) {
          const placeholderElement = document.createElement("div")
          placeholderElement.className = "grid-item placeholder"
          placeholderElement.innerHTML = `
                        <div class="user-circle"></div>
                        <h3>Usuario destacado</h3>
                        <p class="user-skills">Aquí aparecerán los usuarios mejor valorados.</p>
                    `

          gridContainer.appendChild(placeholderElement)
        }
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
      mostrarUsuariosPlaceholder()
    }
  }

  // Mostrar placeholders para usuarios en caso de error
  function mostrarUsuariosPlaceholder() {
    const gridContainer = document.querySelector(".grid-container")
    gridContainer.innerHTML = ""

    for (let i = 0; i < 6; i++) {
      const placeholderElement = document.createElement("div")
      placeholderElement.className = "grid-item placeholder"
      placeholderElement.innerHTML = `
                <div class="user-circle"></div>
                <h3>Usuario destacado</h3>
                <p class="user-skills">Aquí aparecerán los usuarios mejor valorados.</p>
            `
      gridContainer.appendChild(placeholderElement)
    }
  }

  // Cargar usuarios destacados de ejemplo (cuando la API falla)
  function cargarUsuariosDestacadosEjemplo() {
    const usuariosEjemplo = [
      {
        idUsuario: 1,
        nombre: "Ana García",
        foto: "img/usuario.jpg",
        reputacion: 4.8,
        habilidades: [{ nombre: "Diseño gráfico" }, { nombre: "Ilustración" }, { nombre: "Photoshop" }],
      },
      {
        idUsuario: 2,
        nombre: "Carlos Rodríguez",
        foto: "img/usuario.jpg",
        reputacion: 4.5,
        habilidades: [{ nombre: "Programación" }, { nombre: "JavaScript" }, { nombre: "React" }],
      },
      {
        idUsuario: 3,
        nombre: "Laura Hernández",
        foto: "img/usuario.jpg",
        reputacion: 4.9,
        habilidades: [{ nombre: "Inglés" }, { nombre: "Francés" }, { nombre: "Enseñanza" }],
      },
      {
        idUsuario: 4,
        nombre: "Miguel López",
        foto: "img/usuario.jpg",
        reputacion: 4.2,
        habilidades: [{ nombre: "Contabilidad" }, { nombre: "Impuestos" }, { nombre: "Excel" }],
      },
      {
        idUsuario: 5,
        nombre: "Sofía Martínez",
        foto: "img/usuario.jpg",
        reputacion: 4.7,
        habilidades: [{ nombre: "Derecho" }, { nombre: "Contratos" }, { nombre: "Asesoría" }],
      },
      {
        idUsuario: 6,
        nombre: "Javier Pérez",
        foto: "img/usuario.jpg",
        reputacion: 4.6,
        habilidades: [{ nombre: "Marketing" }, { nombre: "Redes sociales" }, { nombre: "SEO" }],
      },
    ]

    const gridContainer = document.querySelector(".grid-container")
    if (!gridContainer) {
      console.error("No se encontró el contenedor de usuarios destacados")
      return
    }

    gridContainer.innerHTML = ""

    usuariosEjemplo.forEach((usuario) => {
      const usuarioElement = document.createElement("div")
      usuarioElement.className = "grid-item"

      usuarioElement.innerHTML = `
          <div class="user-circle">
            <img src="${usuario.foto}" alt="${usuario.nombre}">
          </div>
          <h3>${usuario.nombre}</h3>
          <div class="user-rating">
            <span class="rating-value">${usuario.reputacion.toFixed(1)}</span>
            <div class="stars">${generarEstrellas(usuario.reputacion)}</div>
          </div>
          <p class="user-skills">${usuario.habilidades
            .slice(0, 3)
            .map((h) => h.nombre)
            .join(", ")}</p>
          <button class="btn view-profile-btn" data-id="${usuario.idUsuario}">Ver perfil</button>
        `

      gridContainer.appendChild(usuarioElement)
    })

    // Agregar eventos a los botones de ver perfil
    document.querySelectorAll(".view-profile-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const usuarioId = this.getAttribute("data-id")
        window.location.href = `perfil-visitante.html?id=${usuarioId}`
      })
    })
  }

  // Configurar búsqueda
  function configurarBusqueda() {
    const searchQuestion = document.querySelector(".search-question")
    if (!searchQuestion) {
      console.error("No se encontró el elemento de pregunta de búsqueda")
      return
    }

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
      const searchBtn = document.getElementById("searchBtn")
      if (searchBtn) {
        searchBtn.addEventListener("click", realizarBusqueda)
      }

      // Agregar evento al presionar Enter en el campo de búsqueda
      const searchInput = document.getElementById("searchInput")
      if (searchInput) {
        searchInput.addEventListener("keyup", (e) => {
          if (e.key === "Enter") {
            realizarBusqueda()
          }
        })
      }
    }
  }

  // Realizar búsqueda
  function realizarBusqueda() {
    const searchInput = document.getElementById("searchInput")
    if (!searchInput) {
      console.error("No se encontró el campo de búsqueda")
      return
    }

    const searchTerm = searchInput.value.trim()

    if (searchTerm) {
      window.location.href = `publicaciones.html?q=${encodeURIComponent(searchTerm)}`
    } else {
      alert("Por favor, ingresa un término de búsqueda.")
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
})
