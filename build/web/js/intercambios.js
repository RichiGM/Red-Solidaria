document.addEventListener("DOMContentLoaded", async () => {
  // Variables globales
  const BASE_URL = "http://localhost:8080/RedSolidaria/api";
  const token = localStorage.getItem("lastToken");
  const emailLocal = localStorage.getItem("correo");
  let currentUserId = null;
  let currentTab = "recibidos"; // recibidos, solicitados, todos

  // Elementos DOM
  const tabButtons = document.querySelectorAll(".tab-btn");
  const intercambiosContainer = document.getElementById("intercambiosContainer");

  // Inicialización
  init();

  // Función de inicialización
  async function init() {
    try {
      // Obtener ID del usuario actual
      currentUserId = await obtenerIdUsuario();

      if (!currentUserId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se encontró información de sesión. Por favor, inicia sesión nuevamente.",
          confirmButtonText: "Ir al inicio de sesión",
          allowOutsideClick: false,
        }).then(() => {
          window.location.href = "index.html";
        });
        return;
      }

      // Cargar intercambios
      await cargarIntercambios(currentTab);

      // Configurar eventos
      configurarEventos();
    } catch (error) {
      console.error("Error en la inicialización:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al cargar los intercambios. Por favor, intenta de nuevo más tarde.",
      });
    }
  }

  // Obtener ID del usuario actual
  async function obtenerIdUsuario() {
    if (!emailLocal) return null;

    try {
      const response = await fetch(`${BASE_URL}/usuario/obtener-id?email=${emailLocal}`, {
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
      console.error("Error:", error);
      return null;
    }
  }

  // Cargar intercambios
  async function cargarIntercambios(tipo) {
    try {
      // Mostrar indicador de carga
      intercambiosContainer.innerHTML = `
                <div class="loading-intercambios">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando intercambios...</p>
                </div>
            `;

      // Obtener intercambios del usuario
      const response = await fetch(`${BASE_URL}/intercambio/usuario?idUsuario=${currentUserId}&tipo=${tipo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar los intercambios");
      }

      const intercambios = await response.json();

      // Actualizar pestaña activa
      tabButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tipo);
      });

      // Mostrar intercambios
      mostrarIntercambios(intercambios);
    } catch (error) {
      console.error("Error al cargar intercambios:", error);
      intercambiosContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar los intercambios. Por favor, intenta de nuevo más tarde.</p>
                    <button onclick="cargarIntercambios('${tipo}')" class="retry-btn">Reintentar</button>
                </div>
            `;
    }
  }

  // Mostrar intercambios
  function mostrarIntercambios(intercambios) {
    // Limpiar contenedor
    intercambiosContainer.innerHTML = "";

    // Verificar si hay intercambios
    if (intercambios.length === 0) {
      intercambiosContainer.innerHTML = `
                <div class="empty-intercambios">
                    <i class="fas fa-handshake"></i>
                    <h3>No hay intercambios</h3>
                    <p>Aún no tienes intercambios ${currentTab === "recibidos" ? "recibidos" : currentTab === "solicitados" ? "solicitados" : ""}. Explora servicios para comenzar.</p>
                </div>
            `;
      return;
    }

    // Crear contenedor de tarjetas
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "intercambios-cards";

    // Renderizar intercambios
    intercambios.forEach((intercambio) => {
      const card = document.createElement("div");
      card.className = "intercambio-card";

      // Determinar si el usuario actual es el solicitante o el oferente
      const esSolicitante = intercambio.solicitante.idUsuario === currentUserId;
      const otroUsuario = esSolicitante ? intercambio.oferente : intercambio.solicitante;

      // Determinar estado
      let estadoClase = "";
      let estadoTexto = "";
      switch (intercambio.estatus) {
        case 0:
          estadoClase = "pending";
          estadoTexto = "Pendiente";
          break;
        case 1:
          estadoClase = "confirmed";
          estadoTexto = "Confirmado";
          break;
        case 2:
          estadoClase = "completed";
          estadoTexto = "Completado";
          break;
        case 3:
          estadoClase = "cancelled";
          estadoTexto = "Cancelado";
          break;
        default:
          estadoClase = "pending";
          estadoTexto = "Pendiente";
      }

      // Formatear fecha y hora
      const fecha = new Date(intercambio.dia);
      const fechaFormateada = fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const hora = intercambio.hora.substring(0, 5); // Formato HH:MM

      // Crear contenido de la tarjeta
      card.innerHTML = `
                <div class="intercambio-header">
                    <div class="user-info">
                        <img src="${otroUsuario.foto || "img/usuario.jpg"}" alt="${otroUsuario.nombre}" class="user-avatar">
                        <div>
                            <h3>${otroUsuario.nombre}</h3>
                            <span class="intercambio-type">${esSolicitante ? "Solicitado por ti" : "Te ha solicitado"}</span>
                        </div>
                    </div>
                    <span class="intercambio-status ${estadoClase}">${estadoTexto}</span>
                </div>
                <div class="intercambio-body">
                    ${
                      intercambio.servicio
                        ? `
                                <div class="service-info">
                                    <h4>${intercambio.servicio.titulo}</h4>
                                    <p>${intercambio.servicio.descripcion.substring(0, 100)}${
                                      intercambio.servicio.descripcion.length > 100 ? "..." : ""
                                    }</p>
                                </div>
                            `
                        : `<p class="no-service">Intercambio sin servicio específico</p>`
                    }
                    <div class="intercambio-details">
                        <div class="detail-item">
                            <i class="fas fa-calendar"></i>
                            <span>${fechaFormateada}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span>${hora}</span>
                        </div>
                    </div>
                </div>
                <div class="intercambio-actions">
                    ${
                      intercambio.estatus === 0 && !esSolicitante
                        ? `
                                <button class="btn accept-btn" data-id="${intercambio.idIntercambio}">
                                    <i class="fas fa-check"></i> Aceptar
                                </button>
                                <button class="btn reject-btn" data-id="${intercambio.idIntercambio}">
                                    <i class="fas fa-times"></i> Rechazar
                                </button>
                            `
                        : intercambio.estatus === 1
                          ? `
                                <button class="btn complete-btn" data-id="${intercambio.idIntercambio}">
                                    <i class="fas fa-check-double"></i> Completar
                                </button>
                                <button class="btn cancel-btn" data-id="${intercambio.idIntercambio}">
                                    <i class="fas fa-ban"></i> Cancelar
                                </button>
                            `
                          : intercambio.estatus === 2
                            ? `
                                <button class="btn rate-btn" data-id="${intercambio.idIntercambio}" data-user-id="${otroUsuario.idUsuario}">
                                    <i class="fas fa-star"></i> Calificar
                                </button>
                            `
                            : ""
                    }
                    <button class="btn details-btn" data-id="${intercambio.idIntercambio}">
                        <i class="fas fa-info-circle"></i> Detalles
                    </button>
                </div>
            `;

      cardsContainer.appendChild(card);
    });

    intercambiosContainer.appendChild(cardsContainer);

    // Agregar eventos a los botones
    document.querySelectorAll(".accept-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const intercambioId = this.getAttribute("data-id");
        aceptarIntercambio(intercambioId);
      });
    });

    document.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const intercambioId = this.getAttribute("data-id");
        rechazarIntercambio(intercambioId);
      });
    });

    document.querySelectorAll(".complete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const intercambioId = this.getAttribute("data-id");
        completarIntercambio(intercambioId);
      });
    });

    document.querySelectorAll(".cancel-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const intercambioId = this.getAttribute("data-id");
        cancelarIntercambio(intercambioId);
      });
    });

    document.querySelectorAll(".rate-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const intercambioId = this.getAttribute("data-id");
        const userId = this.getAttribute("data-user-id");
        calificarUsuario(intercambioId, userId);
      });
    });

    document.querySelectorAll(".details-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const intercambioId = this.getAttribute("data-id");
        verDetallesIntercambio(intercambioId);
      });
    });
  }

  // Aceptar intercambio
  async function aceptarIntercambio(intercambioId) {
    try {
      // Confirmar acción
      const result = await Swal.fire({
        title: "¿Aceptar solicitud?",
        text: "¿Estás seguro de que deseas aceptar esta solicitud de intercambio?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#2e7d32",
      });

      if (!result.isConfirmed) return;

      // Mostrar indicador de carga
      Swal.fire({
        title: "Procesando...",
        text: "Por favor, espera mientras se procesa tu solicitud.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Actualizar estatus del intercambio
      const response = await fetch(`${BASE_URL}/intercambio/actualizar-estatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idIntercambio: Number.parseInt(intercambioId),
          estatus: 1, // 1 = Confirmado
        }),
      });

      if (!response.ok) {
        throw new Error("Error al aceptar el intercambio");
      }

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Solicitud aceptada",
        text: "Has aceptado la solicitud de intercambio. Se ha notificado al solicitante.",
      }).then(() => {
        // Recargar intercambios
        cargarIntercambios(currentTab);
      });
    } catch (error) {
      console.error("Error al aceptar intercambio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo aceptar la solicitud. Por favor, intenta de nuevo más tarde.",
      });
    }
  }

  // Rechazar intercambio
  async function rechazarIntercambio(intercambioId) {
    try {
      // Confirmar acción
      const result = await Swal.fire({
        title: "¿Rechazar solicitud?",
        text: "¿Estás seguro de que deseas rechazar esta solicitud de intercambio?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Rechazar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d32f2f",
      });

      if (!result.isConfirmed) return;

      // Mostrar indicador de carga
      Swal.fire({
        title: "Procesando...",
        text: "Por favor, espera mientras se procesa tu solicitud.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Actualizar estatus del intercambio
      const response = await fetch(`${BASE_URL}/intercambio/actualizar-estatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idIntercambio: Number.parseInt(intercambioId),
          estatus: 3, // 3 = Cancelado
        }),
      });

      if (!response.ok) {
        throw new Error("Error al rechazar el intercambio");
      }

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Solicitud rechazada",
        text: "Has rechazado la solicitud de intercambio. Se ha notificado al solicitante.",
      }).then(() => {
        // Recargar intercambios
        cargarIntercambios(currentTab);
      });
    } catch (error) {
      console.error("Error al rechazar intercambio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo rechazar la solicitud. Por favor, intenta de nuevo más tarde.",
      });
    }
  }

  // Completar intercambio
  async function completarIntercambio(intercambioId) {
    try {
      // Confirmar acción
      const result = await Swal.fire({
        title: "¿Completar intercambio?",
        text: "¿Estás seguro de que deseas marcar este intercambio como completado?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Completar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#2e7d32",
      });

      if (!result.isConfirmed) return;

      // Mostrar indicador de carga
      Swal.fire({
        title: "Procesando...",
        text: "Por favor, espera mientras se procesa tu solicitud.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Actualizar estatus del intercambio
      const response = await fetch(`${BASE_URL}/intercambio/actualizar-estatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idIntercambio: Number.parseInt(intercambioId),
          estatus: 2, // 2 = Completado
        }),
      });

      if (!response.ok) {
        throw new Error("Error al completar el intercambio");
      }

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Intercambio completado",
        text: "Has marcado el intercambio como completado. Se ha notificado al otro usuario.",
      }).then(() => {
        // Recargar intercambios
        cargarIntercambios(currentTab);
      });
    } catch (error) {
      console.error("Error al completar intercambio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo completar el intercambio. Por favor, intenta de nuevo más tarde.",
      });
    }
  }

  // Cancelar intercambio
  async function cancelarIntercambio(intercambioId) {
    try {
      // Confirmar acción
      const result = await Swal.fire({
        title: "¿Cancelar intercambio?",
        text: "¿Estás seguro de que deseas cancelar este intercambio?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Cancelar intercambio",
        cancelButtonText: "Volver",
        confirmButtonColor: "#d32f2f",
      });

      if (!result.isConfirmed) return;

      // Mostrar indicador de carga
      Swal.fire({
        title: "Procesando...",
        text: "Por favor, espera mientras se procesa tu solicitud.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Actualizar estatus del intercambio
      const response = await fetch(`${BASE_URL}/intercambio/actualizar-estatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idIntercambio: Number.parseInt(intercambioId),
          estatus: 3, // 3 = Cancelado
        }),
      });

      if (!response.ok) {
        throw new Error("Error al cancelar el intercambio");
      }

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Intercambio cancelado",
        text: "Has cancelado el intercambio. Se ha notificado al otro usuario.",
      }).then(() => {
        // Recargar intercambios
        cargarIntercambios(currentTab);
      });
    } catch (error) {
      console.error("Error al cancelar intercambio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cancelar el intercambio. Por favor, intenta de nuevo más tarde.",
      });
    }
  }

  // Calificar usuario
  function calificarUsuario(intercambioId, userId) {
    Swal.fire({
      title: "Calificar usuario",
      html: `
                <div class="rating-container">
                    <div class="rating">
                        <input type="radio" id="star5" name="rating" value="5" />
                        <label for="star5" title="5 estrellas">★</label>
                        <input type="radio" id="star4" name="rating" value="4" />
                        <label for="star4" title="4 estrellas">★</label>
                        <input type="radio" id="star3" name="rating" value="3" />
                        <label for="star3" title="3 estrellas">★</label>
                        <input type="radio" id="star2" name="rating" value="2" />
                        <label for="star2" title="2 estrellas">★</label>
                        <input type="radio" id="star1" name="rating" value="1" />
                        <label for="star1" title="1 estrella">★</label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="comment">Comentario (opcional):</label>
                    <textarea id="comment" class="swal2-textarea" placeholder="Escribe un comentario sobre tu experiencia..."></textarea>
                </div>
            `,
      showCancelButton: true,
      confirmButtonText: "Enviar calificación",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2e7d32",
      preConfirm: () => {
        const rating = document.querySelector('input[name="rating"]:checked');
        if (!rating) {
          Swal.showValidationMessage("Por favor, selecciona una calificación");
          return false;
        }
        return {
          rating: rating.value,
          comment: document.getElementById("comment").value,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Mostrar indicador de carga
          Swal.fire({
            title: "Enviando calificación...",
            text: "Por favor, espera mientras se procesa tu calificación.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Enviar calificación
          const response = await fetch(`${BASE_URL}/calificacion/calificar`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              idTransaccion: Number.parseInt(intercambioId),
              idUsuarioCalificador: currentUserId,
              idUsuarioCalificado: Number.parseInt(userId),
              calificacion: Number.parseInt(result.value.rating),
              comentario: result.value.comment,
            }),
          });

          if (!response.ok) {
            throw new Error("Error al enviar la calificación");
          }

          // Mostrar mensaje de éxito
          Swal.fire({
            icon: "success",
            title: "Calificación enviada",
            text: "Tu calificación ha sido enviada correctamente. Gracias por tu feedback.",
          }).then(() => {
            // Recargar intercambios
            cargarIntercambios(currentTab);
          });
        } catch (error) {
          console.error("Error al enviar calificación:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo enviar la calificación. Por favor, intenta de nuevo más tarde.",
          });
        }
      }
    });
  }

  // Ver detalles de intercambio
  function verDetallesIntercambio(intercambioId) {
    // Implementar lógica para ver detalles
    Swal.fire({
      title: "Detalles del intercambio",
      text: "Funcionalidad en desarrollo",
      icon: "info",
    });
  }

  // Configurar eventos
  function configurarEventos() {
    // Eventos para cambiar de pestaña
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const tab = this.getAttribute("data-tab");
        currentTab = tab;
        cargarIntercambios(tab);
      });
    });
  }
});