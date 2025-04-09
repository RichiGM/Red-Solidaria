document.addEventListener("DOMContentLoaded", async () => {
  // Variables globales
  const BASE_URL = "http://localhost:8080/RedSolidaria/api";
  const token = localStorage.getItem("lastToken");
  let profileUserId = null;
  let currentUserId = null;

  // Elementos DOM
  const profileName = document.querySelector(".profile-name");
  const profileEmail = document.querySelector(".profile-email");
  const profileAvatar = document.querySelector(".photo-circle img");
  const aboutMeText = document.querySelector(".profile-card:nth-child(1) .card-body p");
  const skillsContainer = document.querySelector("#skills-container");
  const contactItems = document.querySelectorAll(".profile-card:nth-child(3) .contact-item");
  const servicesContainer = document.querySelector("#services-container");
  const statValues = document.querySelectorAll(".stat-value");
  const starsContainer = document.querySelector(".stars");

  // Inicialización
  await init();

  // Función de inicialización
  async function init() {
    try {
      // Obtener ID del usuario actual (si está logueado)
      currentUserId = await obtenerIdUsuarioActual();

      // Obtener ID del usuario del perfil desde la URL
      const urlParams = new URLSearchParams(window.location.search);
      profileUserId = urlParams.get("id");

      if (!profileUserId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se especificó un usuario para ver.",
          confirmButtonText: "Volver",
          allowOutsideClick: false,
        }).then(() => {
          window.location.href = "home.html";
        });
        return;
      }

      // Cargar datos del perfil y servicios
      await cargarDatosPerfil();
      await cargarServicios();

      // Configurar eventos
      configurarEventos();
    } catch (error) {
      console.error("Error en la inicialización:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al cargar el perfil.",
      });
    }
  }

  // Obtener ID del usuario actual
  async function obtenerIdUsuarioActual() {
    const email = localStorage.getItem("correo");
    if (!email || !token) return null;

    try {
      const response = await fetch(`${BASE_URL}/usuario/obtener-id?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener el ID de usuario");
      }

      const data = await response.json();
      return data.idUsuario;
    } catch (error) {
      console.error("Error al obtener ID del usuario actual:", error);
      return null;
    }
  }

  // Cargar datos del perfil
  async function cargarDatosPerfil() {
    try {
      const response = await fetch(`${BASE_URL}/usuario/obtener-datos-basicos?id=${profileUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar datos del perfil");
      }

      const usuario = await response.json();

      // Actualizar título de la página
      document.title = `Red Solidaria - Perfil de ${usuario.nombre}`;

      // Actualizar nombre y correo
      profileName.textContent = `${usuario.nombre} ${usuario.apellidos || ""}`;
      profileEmail.textContent = usuario.correo || "";

      // Actualizar foto de perfil
      profileAvatar.src = usuario.foto || "img/default.jpg";

      // Actualizar descripción
      aboutMeText.textContent = usuario.descripcion || "Este usuario no ha añadido una descripción.";

      // Actualizar habilidades
      skillsContainer.innerHTML = "";
      if (usuario.habilidades && usuario.habilidades.length > 0) {
        usuario.habilidades.forEach((habilidad) => {
          const skillTag = document.createElement("span");
          skillTag.className = "skill";
          skillTag.textContent = habilidad.nombre;
          skillsContainer.appendChild(skillTag);
        });
      } else {
        skillsContainer.innerHTML = "<p>No hay habilidades registradas.</p>";
      }

      // Actualizar información de contacto
      contactItems.forEach((item) => {
        const icon = item.querySelector("i");
        const span = item.querySelector("span");
        if (icon.classList.contains("fa-envelope")) {
          span.textContent = usuario.correo || "No disponible";
        } else if (icon.classList.contains("fa-phone")) {
          span.textContent = usuario.telefono || "No disponible";
        } else if (icon.classList.contains("fa-map-marker-alt")) {
          span.textContent = usuario.ciudad && usuario.estado ? `${usuario.ciudad}, ${usuario.estado}` : "No especificada";
        }
      });

      // Actualizar estadísticas
      statValues[0].textContent = usuario.reputacion ? usuario.reputacion.toFixed(1) : "0.0";
      statValues[1].textContent = usuario.servicios || "0";
      statValues[2].textContent = usuario.intercambios || "0";

      // Generar estrellas
      starsContainer.innerHTML = generarEstrellas(usuario.reputacion || 0);

      // Verificar si es el perfil del usuario actual
      if (currentUserId && currentUserId.toString() === profileUserId) {
        window.location.href = "perfil-propietario.html";
      }
    } catch (error) {
      console.error("Error al cargar datos del perfil:", error);
      servicesContainer.innerHTML = "<p>Error al cargar el perfil.</p>";
    }
  }

  // Cargar servicios del usuario
  async function cargarServicios() {
    try {
      const response = await fetch(`${BASE_URL}/servicio/mis-servicios?idUsuario=${profileUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar los servicios");
      }

      const servicios = await response.json();

      // Limpiar el contenedor (manteniendo el título)
      servicesContainer.innerHTML = "<h2>Servicios Ofrecidos</h2>";

      if (servicios.length === 0) {
        servicesContainer.innerHTML += `
          <div class="empty-services">
            <i class="fas fa-briefcase"></i>
            <h3>Este usuario no tiene servicios publicados</h3>
            <p>Cuando publique servicios, aparecerán aquí.</p>
          </div>
        `;
        return;
      }

      // Renderizar servicios
      servicios.forEach((servicio) => {
        const servicioElement = document.createElement("div");
        servicioElement.className = "service-card";

        // Determinar modalidad
        let modalidadTexto = "Desconocida";
        switch (servicio.modalidad) {
          case 1:
            modalidadTexto = "Presencial";
            break;
          case 2:
            modalidadTexto = "Virtual";
            break;
          case 3:
            modalidadTexto = "Mixta";
            break;
        }

        // Determinar estado
        const estadoTexto = servicio.estatus === 1 ? "Servicio activo" : "Servicio completado";

        servicioElement.innerHTML = `
          <div class="service-header">
            <div class="photo-circle user-avatar-small">
              <img src="${profileAvatar.src}" alt="Foto de perfil">
            </div>
            <div class="service-info">
              <h3 class="service-author">${profileName.textContent}</h3>
              <span class="service-date">${estadoTexto}</span>
            </div>
          </div>
          <div class="service-body">
            <h3 class="service-title">${servicio.titulo}</h3>
            <p class="service-description">${servicio.descripcion}</p>
            <div class="service-tags">
              <span class="service-tag">${modalidadTexto}</span>
              ${servicio.categoria ? `<span class="service-tag">${servicio.categoria}</span>` : ""}
            </div>
          </div>
          <div class="service-footer">
            <div class="service-stats">
              <span class="stat"><i class="fas fa-eye"></i> ${servicio.vistas || 0} vistas</span>
            </div>
            ${servicio.estatus === 1 ? `
              <button class="btn request-service-btn" data-id="${servicio.idServicio}">Solicitar servicio</button>
            ` : ""}
          </div>
        `;

        servicesContainer.appendChild(servicioElement);
      });

      // Agregar eventos a los botones de solicitar servicio
      document.querySelectorAll(".request-service-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const servicioId = this.getAttribute("data-id");
          solicitarServicio(servicioId);
        });
      });
    } catch (error) {
      console.error("Error al cargar los servicios:", error);
      servicesContainer.innerHTML = `
        <h2>Servicios Ofrecidos</h2>
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error al cargar los servicios</p>
          <button class="btn" onclick="window.location.reload()">Reintentar</button>
        </div>
      `;
    }
  }

  // Configurar eventos
  function configurarEventos() {
    // Aquí podrías agregar más eventos si necesitas, como filtros o botones adicionales
  }

  // Solicitar servicio
  function solicitarServicio(servicioId) {
    if (!currentUserId) {
      Swal.fire({
        icon: "info",
        title: "Iniciar sesión",
        text: "Debes iniciar sesión para solicitar este servicio.",
        confirmButtonText: "Iniciar sesión",
      }).then(() => {
        window.location.href = "index.html";
      });
      return;
    }

    Swal.fire({
      title: "Solicitar servicio",
      html: `
        <div class="swal2-input-container">
          <label for="service-message">Mensaje para el proveedor:</label>
          <textarea id="service-message" class="swal2-textarea" placeholder="Describe brevemente lo que necesitas..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Solicitar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const message = document.getElementById("service-message").value;
        if (!message) {
          Swal.showValidationMessage("Por favor, escribe un mensaje");
          return false;
        }
        return { message };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Aquí iría una llamada a la API para enviar la solicitud (ejemplo ficticio)
          const response = await fetch(`${BASE_URL}/solicitud/crear`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              idServicio: servicioId,
              idUsuarioSolicitante: currentUserId,
              mensaje: result.value.message,
            }),
          });

          if (!response.ok) {
            throw new Error("Error al enviar la solicitud");
          }

          Swal.fire({
            icon: "success",
            title: "Solicitud enviada",
            text: "Tu solicitud ha sido enviada. El proveedor se pondrá en contacto contigo pronto.",
          }).then(() => {
            window.location.href = `chat.html?id=${profileUserId}`;
          });
        } catch (error) {
          console.error("Error al enviar solicitud:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo enviar la solicitud. Intenta de nuevo más tarde.",
          });
        }
      }
    });
  }

  // Generar estrellas según la calificación
  function generarEstrellas(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let starsHTML = "";
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }
    return starsHTML;
  }
});