document.addEventListener("DOMContentLoaded", async () => {
  // Variables globales
  const BASE_URL = "http://localhost:8080/RedSolidaria/api";
  const token = localStorage.getItem("lastToken");
  const emailLocal = localStorage.getItem("correo");
  let currentUserId = null;
  let currentTab = "recibidos"; // recibidos, solicitados, todos

  // Elementos DOM
  const tabButtons = document.querySelectorAll(".tab-btn");
  const transaccionesContainer = document.getElementById("transaccionesContainer");

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

      // Cargar transacciones
      await cargarTransacciones(currentTab);

      // Configurar eventos
      configurarEventos();
    } catch (error) {
      console.error("Error en la inicialización:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al cargar las transacciones. Por favor, intenta de nuevo más tarde.",
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

  // Cargar transacciones
  async function cargarTransacciones(tipo) {
    try {
      // Mostrar indicador de carga
      transaccionesContainer.innerHTML = `
        <div class="loading-transacciones">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Cargando transacciones...</p>
        </div>
      `;

      // Obtener transacciones del usuario
      const url = `${BASE_URL}/transaccion/usuario/${currentUserId}?tipo=${tipo === "recibidos" ? "received" : tipo === "solicitados" ? "given" : "todos"}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar las transacciones");
      }

      const transacciones = await response.json();

      // Actualizar pestaña activa
      tabButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tipo);
      });

      // Mostrar transacciones
      mostrarTransacciones(transacciones);
    } catch (error) {
      console.error("Error al cargar transacciones:", error);
      transaccionesContainer.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error al cargar las transacciones. Por favor, intenta de nuevo más tarde.</p>
          <button onclick="cargarTransacciones('${tipo}')" class="retry-btn">Reintentar</button>
        </div>
      `;
    }
  }

  // Mostrar transacciones
  function mostrarTransacciones(transacciones) {
    // Limpiar contenedor
    transaccionesContainer.innerHTML = "";

    // Verificar si hay transacciones
    if (!transacciones || transacciones.length === 0) {
      transaccionesContainer.innerHTML = `
        <div class="empty-transacciones">
          <i class="fas fa-handshake"></i>
          <h3>No hay transacciones</h3>
          <p>Aún no tienes transacciones ${currentTab === "recibidos" ? "recibidas" : currentTab === "solicitados" ? "ofrecidas" : ""}. Explora servicios para comenzar.</p>
        </div>
      `;
      return;
    }

    // Crear contenedor de tarjetas
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "transacciones-cards";

    // Renderizar transacciones
    transacciones.forEach((transaccion) => {
      // Verificar que transaccion y sus propiedades existan antes de procesar
      if (!transaccion) return;

      // Verificar y asignar valores por defecto para solicitante y oferente si no existen
      const solicitante = transaccion.solicitante || { idUsuario: 0, nombre: "Usuario desconocido" };
      const oferente = transaccion.oferente || { idUsuario: 0, nombre: "Usuario desconocido" };

      // Determinar si el usuario actual es el solicitante o el oferente
      // Asegurarse de que idUsuario existe y es un número
      const esSolicitante = solicitante.idUsuario === currentUserId;
      const otroUsuario = esSolicitante ? oferente : solicitante;

      // Si no podemos identificar al otro usuario, usamos un valor por defecto
      if (!otroUsuario || typeof otroUsuario.idUsuario === 'undefined') {
        console.warn("Datos de usuario incompletos en transacción:", transaccion);
        otroUsuario = { 
          idUsuario: 0, 
          nombre: "Usuario desconocido", 
          foto: "img/usuario.jpg" 
        };
      }

      const card = document.createElement("div");
      card.className = "transaccion-card";

      // Determinar estado basado en verificadoOferente y verificadoSolicitante
      let estadoClase = "";
      let estadoTexto = "";
      if (transaccion.verificadoOferente && transaccion.verificadoSolicitante) {
        estadoClase = "completed";
        estadoTexto = "Completada";
      } else if (!transaccion.verificadoOferente || !transaccion.verificadoSolicitante) {
        estadoClase = "pending";
        estadoTexto = "Pendiente";
      }

      // Formatear fecha
      let fechaFormateada = "Fecha no disponible";
      if (transaccion.fecha) {
        try {
          const fecha = new Date(transaccion.fecha);
          fechaFormateada = fecha.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        } catch (error) {
          console.error("Error al formatear fecha:", error);
        }
      }

      // Crear contenido de la tarjeta
      card.innerHTML = `
        <div class="transaccion-header">
          <div class="user-info">
            <img src="${otroUsuario.foto || "img/usuario.jpg"}" alt="${otroUsuario.nombre}" class="user-avatar">
            <div>
              <h3>${otroUsuario.nombre}</h3>
              <span class="transaccion-type">${esSolicitante ? "Recibida" : "Ofrecida"}</span>
            </div>
          </div>
          <span class="transaccion-status ${estadoClase}">${estadoTexto}</span>
        </div>
        <div class="transaccion-body">
          ${
            transaccion.tituloServicio
              ? `
                <div class="service-info">
                  <h4>${transaccion.tituloServicio}</h4>
                  <p>${transaccion.detalles ? transaccion.detalles.substring(0, 100) + (transaccion.detalles.length > 100 ? "..." : "") : "Sin detalles"}</p>
                </div>
              `
              : `<p class="no-service">Transacción sin servicio específico</p>`
          }
          <div class="transaccion-details">
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              <span>${fechaFormateada}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-clock"></i>
              <span>${transaccion.horasIntercambiadas || 0} horas</span>
            </div>
          </div>
        </div>
        <div class="transaccion-actions">
          ${
            estadoTexto === "Pendiente" && !esSolicitante
              ? `
                <button class="btn accept-btn" data-id="${transaccion.idTransaccion}">
                  <i class="fas fa-check"></i> Verificar
                </button>
              `
              : estadoTexto === "Pendiente" && esSolicitante
                ? `
                <button class="btn accept-btn" data-id="${transaccion.idTransaccion}">
                  <i class="fas fa-check"></i> Verificar
                </button>
              `
              : estadoTexto === "Completada"
                ? `
                <button class="btn rate-btn" data-id="${transaccion.idTransaccion}" data-user-id="${otroUsuario.idUsuario}">
                  <i class="fas fa-star"></i> Calificar
                </button>
              `
                : ""
          }
          <button class="btn details-btn" data-id="${transaccion.idTransaccion}">
            <i class="fas fa-info-circle"></i> Detalles
          </button>
        </div>
      `;

      cardsContainer.appendChild(card);
    });

    transaccionesContainer.appendChild(cardsContainer);

    // Agregar eventos a los botones
    document.querySelectorAll(".accept-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const transaccionId = this.getAttribute("data-id");
        verificarTransaccion(transaccionId);
      });
    });

    document.querySelectorAll(".rate-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const transaccionId = this.getAttribute("data-id");
        const userId = this.getAttribute("data-user-id");
        calificarUsuario(transaccionId, userId);
      });
    });

    document.querySelectorAll(".details-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const transaccionId = this.getAttribute("data-id");
        verDetallesTransaccion(transaccionId);
      });
    });
  }

  // Verificar transacción
  async function verificarTransaccion(transaccionId) {
    try {
      const result = await Swal.fire({
        title: "¿Verificar transacción?",
        text: "¿Confirmas que esta transacción se realizó correctamente?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Verificar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#2e7d32",
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Procesando...",
        text: "Por favor, espera mientras se verifica la transacción.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Determinar qué campo actualizar basado en el rol del usuario
      const transaccionResponse = await fetch(`${BASE_URL}/transaccion/usuario/${currentUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!transaccionResponse.ok) {
        throw new Error("Error al obtener información de la transacción");
      }

      const transacciones = await transaccionResponse.json();
      const transaccion = transacciones.find(t => t.idTransaccion == transaccionId);
      
      if (!transaccion) {
        throw new Error("No se encontró la transacción especificada");
      }

      // Verificar que solicitante exista antes de acceder a sus propiedades
      if (!transaccion.solicitante || !transaccion.solicitante.idUsuario) {
        throw new Error("Datos incompletos en la transacción: solicitante no encontrado");
      }

      const esSolicitante = transaccion.solicitante.idUsuario === currentUserId;
      const campo = esSolicitante ? "verificadoSolicitante" : "verificadoOferente";

      const response = await fetch(`${BASE_URL}/transaccion/verificar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idTransaccion: Number.parseInt(transaccionId),
          [campo]: true
        }),
      });

      if (!response.ok) {
        throw new Error("Error al verificar la transacción");
      }

      Swal.fire({
        icon: "success",
        title: "Transacción verificada",
        text: "Has verificado la transacción exitosamente.",
      }).then(() => {
        cargarTransacciones(currentTab);
      });
    } catch (error) {
      console.error("Error al verificar transacción:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudo verificar la transacción: ${error.message}`,
      });
    }
  }

  // Calificar usuario
  function calificarUsuario(transaccionId, userId) {
    if (!transaccionId || !userId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Información incompleta para calificar al usuario",
      });
      return;
    }

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
          Swal.fire({
            title: "Enviando calificación...",
            text: "Por favor, espera mientras se procesa tu calificación.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const response = await fetch(`${BASE_URL}/calificacion/calificar`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              idTransaccion: Number.parseInt(transaccionId),
              idUsuarioCalificador: currentUserId,
              idUsuarioCalificado: Number.parseInt(userId),
              calificacion: Number.parseInt(result.value.rating),
              comentario: result.value.comment || "",
              fecha: new Date().toISOString().split('T')[0]
            }),
          });

          if (!response.ok) {
            throw new Error("Error al enviar la calificación");
          }

          Swal.fire({
            icon: "success",
            title: "Calificación enviada",
            text: "Tu calificación ha sido enviada correctamente. Gracias por tu feedback.",
          }).then(() => {
            cargarTransacciones(currentTab);
          });
        } catch (error) {
          console.error("Error al enviar calificación:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `No se pudo enviar la calificación: ${error.message}`,
          });
        }
      }
    });
  }

  // Ver detalles de transacción
  async function verDetallesTransaccion(transaccionId) {
    try {
      Swal.fire({
        title: "Cargando...",
        text: "Obteniendo detalles de la transacción",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Buscar la transacción en las cargadas
      const response = await fetch(`${BASE_URL}/transaccion/usuario/${currentUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener información de la transacción");
      }

      const transacciones = await response.json();
      const transaccion = transacciones.find(t => t.idTransaccion == transaccionId);
      
      if (!transaccion) {
        throw new Error("No se encontró la transacción especificada");
      }

      // Verificar existencia de datos necesarios
      if (!transaccion.solicitante || !transaccion.oferente) {
        throw new Error("Datos incompletos en la transacción");
      }

      const esSolicitante = transaccion.solicitante.idUsuario === currentUserId;
      const otroUsuario = esSolicitante ? transaccion.oferente : transaccion.solicitante;
      
      // Formatear fecha
      let fecha = "Fecha no disponible";
      if (transaccion.fecha) {
        try {
          fecha = new Date(transaccion.fecha).toLocaleDateString("es-ES");
        } catch (e) {
          console.error("Error al formatear fecha:", e);
        }
      }

      Swal.fire({
        title: "Detalles de la Transacción",
        html: `
          <div class="transaccion-details">
            <p><strong>Usuario:</strong> ${otroUsuario.nombre || "Desconocido"}</p>
            <p><strong>Tipo:</strong> ${esSolicitante ? "Recibida" : "Ofrecida"}</p>
            <p><strong>Servicio:</strong> ${transaccion.tituloServicio || "Sin servicio específico"}</p>
            <p><strong>Horas:</strong> ${transaccion.horasIntercambiadas || 0}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <p><strong>Detalles:</strong> ${transaccion.detalles || "Sin detalles adicionales"}</p>
            <p><strong>Estado:</strong> ${transaccion.verificadoOferente && transaccion.verificadoSolicitante ? "Completada" : "Pendiente"}</p>
          </div>
        `,
        confirmButtonText: "Cerrar",
        confirmButtonColor: "#2e7d32",
      });
    } catch (error) {
      console.error("Error al obtener detalles:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudieron cargar los detalles: ${error.message}`,
      });
    }
  }

  // Configurar eventos
  function configurarEventos() {
    // Eventos para cambiar de pestaña
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const tab = this.getAttribute("data-tab");
        currentTab = tab;
        cargarTransacciones(tab);
      });
    });
  }
});