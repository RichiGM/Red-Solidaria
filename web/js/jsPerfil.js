document.addEventListener("DOMContentLoaded", async () => {
  // Variables globales
  const BASE_URL = "http://localhost:8080/RedSolidaria/api";
  const emailLocal = localStorage.getItem("correo");
  const token = localStorage.getItem("lastToken");
  let idUsuario = null;

  // Elementos DOM
  const profileName = document.querySelector(".profile-name");
  const profileEmail = document.querySelector(".profile-email");
  const profileAvatar = document.querySelector(".photo-circle img");
  const editAvatarBtn = document.querySelector(".edit-avatar-btn");
  const editBannerBtn = document.querySelector(".edit-banner-btn");
  const settingsBtn = document.querySelector(".settings-btn");
  const profileBanner = document.querySelector(".profile-banner");
  const aboutMeText = document.querySelector(".profile-card:nth-child(1) .card-body p");
  const skillsContainer = document.querySelector(".profile-card:nth-child(2) .skills-container");
  const contactItems = document.querySelectorAll(".profile-card:nth-child(3) .contact-item");
  const servicesContainer = document.querySelector(".services-container");
  const openNewServiceModalBtn = document.getElementById("openNewServiceModal");

  // Inicialización
  init();

  // Función de inicialización
  async function init() {
    try {
      // Obtener ID del usuario actual
      idUsuario = await obtenerIdUsuario();

      if (!idUsuario) {
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

      // Cargar datos del perfil
      await cargarDatosPerfil();

      // Cargar servicios del usuario
      await cargarServicios();

      // Configurar eventos
      configurarEventos();
    } catch (error) {
      console.error("Error en la inicialización:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al cargar el perfil. Por favor, intenta de nuevo más tarde.",
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

  // Cargar datos del perfil
  async function cargarDatosPerfil() {
    try {
      const response = await fetch(`${BASE_URL}/usuario/obtener-datos?email=${emailLocal}`, {
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

      // Actualizar nombre y correo
      profileName.textContent = `${usuario.nombre} ${usuario.apellidos}`;
      profileEmail.textContent = usuario.correo;

      // Actualizar foto de perfil
      if (usuario.foto) {
        profileAvatar.src = usuario.foto;
        document.querySelectorAll(".user-avatar-small img").forEach((img) => {
          img.src = usuario.foto;
        });
      }

      // Actualizar banner si existe
      if (usuario.banner) {
        profileBanner.style.backgroundImage = `url(${usuario.banner})`;
      }

      // Actualizar descripción
      if (usuario.descripcion) {
        aboutMeText.textContent = usuario.descripcion;
      }

      // Actualizar habilidades
      if (usuario.habilidades && usuario.habilidades.length > 0) {
        skillsContainer.innerHTML = "";
        usuario.habilidades.forEach((habilidad) => {
          const skillTag = document.createElement("span");
          skillTag.className = "skill-tag";
          skillTag.textContent = habilidad.nombre;
          skillsContainer.appendChild(skillTag);
        });
      }

      // Actualizar información de contacto
      contactItems.forEach((item) => {
        const icon = item.querySelector("i");
        const span = item.querySelector("span");

        if (icon.classList.contains("fa-envelope")) {
          span.textContent = usuario.correo;
        } else if (icon.classList.contains("fa-phone")) {
          span.textContent = usuario.telefono || "+52 123 456 7890";
        } else if (icon.classList.contains("fa-map-marker-alt")) {
          span.textContent = usuario.ciudad ? `${usuario.ciudad.nombre}, ${usuario.ciudad.estado}` : "No especificada";
        }
      });

      // Actualizar estadísticas
      document.querySelector(".stat-value:nth-child(1)").textContent = usuario.reputacion
        ? usuario.reputacion.toFixed(1)
        : "0.0";

      // Generar estrellas según la reputación
      const starsContainer = document.querySelector(".stars");
      starsContainer.innerHTML = generarEstrellas(usuario.reputacion || 0);
    } catch (error) {
      console.error("Error al cargar datos del perfil:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos del perfil. Por favor, intenta de nuevo más tarde.",
      });
    }
  }

  // Cargar servicios del usuario
  async function cargarServicios() {
    try {
      const response = await fetch(`${BASE_URL}/servicio/mis-servicios?idUsuario=${idUsuario}`, {
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

      // Actualizar contador de servicios
      document.querySelector(".stat-value:nth-child(2)").textContent = servicios.length;

      // Limpiar contenedor de servicios
      servicesContainer.innerHTML = "";

      if (servicios.length === 0) {
        servicesContainer.innerHTML = `
                    <div class="empty-services">
                        <i class="fas fa-briefcase"></i>
                        <h3>No tienes servicios publicados</h3>
                        <p>Publica tu primer servicio para comenzar a intercambiar.</p>
                    </div>
                `;
        return;
      }

      // Renderizar servicios
      servicios.forEach((servicio) => {
        const servicioElement = document.createElement("div");
        servicioElement.className = "service-card";

        // Determinar la modalidad en texto
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

        // Formatear fecha
        const fechaPublicacion = servicio.fechaPublicacion ? new Date(servicio.fechaPublicacion) : new Date();
        const ahora = new Date();
        const diferencia = ahora - fechaPublicacion;
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

        let fechaTexto = "";
        if (dias === 0) {
          fechaTexto = "Publicado hoy";
        } else if (dias === 1) {
          fechaTexto = "Publicado ayer";
        } else {
          fechaTexto = `Publicado hace ${dias} días`;
        }

        servicioElement.innerHTML = `
                    <div class="service-header">
                        <div class="photo-circle user-avatar-small">
                            <img src="${profileAvatar.src}" alt="Foto de perfil">
                        </div>
                        <div class="service-info">
                            <h3 class="service-author">${profileName.textContent}</h3>
                            <span class="service-date">${fechaTexto}</span>
                        </div>
                        <div class="service-actions">
                            <button class="action-icon edit-service-btn" title="Editar" data-id="${servicio.idServicio}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-icon delete-service-btn" title="Eliminar" data-id="${servicio.idServicio}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="service-body">
                        <h3 class="service-title">${servicio.titulo}</h3>
                        <p class="service-description">${servicio.descripcion}</p>
                        <div class="service-tags">
                            <span class="service-tag">${modalidadTexto}</span>
                            ${servicio.habilidades ? servicio.habilidades.map((h) => `<span class="service-tag">${h.nombre}</span>`).join("") : ""}
                        </div>
                    </div>
                    <div class="service-footer">
                        <div class="service-stats">
                            <span class="stat"><i class="fas fa-eye"></i> ${servicio.vistas || 0} vistas</span>
                            <span class="stat"><i class="fas fa-comment"></i> ${servicio.solicitudes || 0} solicitudes</span>
                        </div>
                        <button class="btn view-details-btn" data-id="${servicio.idServicio}">Ver detalles</button>
                    </div>
                `;

        servicesContainer.appendChild(servicioElement);
      });

      // Agregar eventos a los botones
      document.querySelectorAll(".edit-service-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const servicioId = this.getAttribute("data-id");
          editarServicio(servicioId);
        });
      });

      document.querySelectorAll(".delete-service-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const servicioId = this.getAttribute("data-id");
          eliminarServicio(servicioId);
        });
      });

      document.querySelectorAll(".view-details-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
          const servicioId = this.getAttribute("data-id");
          verDetallesServicio(servicioId);
        });
      });
    } catch (error) {
      console.error("Error al cargar los servicios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los servicios. Por favor, intenta de nuevo más tarde.",
      });
    }
  }

  // Configurar eventos
  function configurarEventos() {
    // Evento para abrir modal de nuevo servicio
    openNewServiceModalBtn.addEventListener("click", () => {
      openModal("newServiceModal");
    });

    // Evento para cambiar foto de perfil
    editAvatarBtn.addEventListener("click", cambiarFotoPerfil);

    // Evento para cambiar banner
    editBannerBtn.addEventListener("click", cambiarBanner);

    // Evento para editar perfil
    document.querySelector(" .settings-btn .edit-profile-btn .edit-btn").addEventListener("click", () => {
      window.location.href = "Cuenta.html";
    });

    // Evento para editar "Acerca de mí"
    document.querySelector(".profile-card:nth-child(1) .edit-btn").addEventListener("click", editarAcercaDe);

    // Evento para editar habilidades
    document.querySelector(".profile-card:nth-child(2) .edit-btn").addEventListener("click", editarHabilidades);

    // Evento para editar contacto
    document.querySelector(".profile-card:nth-child(3) .edit-btn").addEventListener("click", editarContacto);

    // Evento para publicar nuevo servicio
    document.querySelector("#newServiceModal form").addEventListener("submit", publicarServicio);

    // Eventos para filtros de servicios
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        filtrarServicios(this.textContent.toLowerCase());
      });
    });
  }

  // Cambiar foto de perfil
  function cambiarFotoPerfil() {
    // Crear un input de archivo oculto
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    // Simular clic en el input
    fileInput.click();

    // Manejar la selección de archivo
    fileInput.addEventListener("change", async function () {
      if (this.files && this.files[0]) {
        const file = this.files[0];

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "La imagen es demasiado grande. El tamaño máximo permitido es 5MB.",
          });
          return;
        }

        // Validar tipo (solo imágenes)
        if (!file.type.startsWith("image/")) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "El archivo seleccionado no es una imagen válida.",
          });
          return;
        }

        try {
          // Mostrar indicador de carga
          Swal.fire({
            title: "Subiendo imagen...",
            text: "Por favor, espera mientras se sube la imagen.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Subir la imagen
          const formData = new FormData();
          formData.append("foto", file);
          formData.append("email", emailLocal);

          const response = await fetch(`${BASE_URL}/usuario/subir-foto`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Error al subir la foto de perfil");
          }

          const data = await response.json();

          // Actualizar la interfaz
          profileAvatar.src = data.fotoUrl;
          document.querySelectorAll(".user-avatar-small img").forEach((img) => {
            img.src = data.fotoUrl;
          });

          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "La foto de perfil se ha actualizado correctamente.",
          });
        } catch (error) {
          console.error("Error al cambiar la foto de perfil:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cambiar la foto de perfil. Por favor, intenta de nuevo más tarde.",
          });
        }
      }

      // Eliminar el input de archivo
      document.body.removeChild(fileInput);
    });
  }

  // Cambiar banner
  function cambiarBanner() {
    // Crear un input de archivo oculto
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    // Simular clic en el input
    fileInput.click();

    // Manejar la selección de archivo
    fileInput.addEventListener("change", async function () {
      if (this.files && this.files[0]) {
        const file = this.files[0];

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "La imagen es demasiado grande. El tamaño máximo permitido es 5MB.",
          });
          return;
        }

        // Validar tipo (solo imágenes)
        if (!file.type.startsWith("image/")) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "El archivo seleccionado no es una imagen válida.",
          });
          return;
        }

        try {
          // Mostrar indicador de carga
          Swal.fire({
            title: "Subiendo imagen...",
            text: "Por favor, espera mientras se sube la imagen.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Subir la imagen
          const formData = new FormData();
          formData.append("banner", file);
          formData.append("email", emailLocal);

          const response = await fetch(`${BASE_URL}/usuario/subir-banner`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Error al subir el banner");
          }

          const data = await response.json();

          // Actualizar la interfaz
          profileBanner.style.backgroundImage = `url(${data.bannerUrl})`;

          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "El banner se ha actualizado correctamente.",
          });
        } catch (error) {
          console.error("Error al cambiar el banner:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cambiar el banner. Por favor, intenta de nuevo más tarde.",
          });
        }
      }

      // Eliminar el input de archivo
      document.body.removeChild(fileInput);
    });
  }

  // Editar "Acerca de mí"
  function editarAcercaDe() {
    Swal.fire({
      title: "Editar Acerca de mí",
      input: "textarea",
      inputLabel: "Descripción",
      inputValue: aboutMeText.textContent,
      inputAttributes: {
        "aria-label": "Escribe tu descripción aquí",
      },
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: async (descripcion) => {
        try {
          // Obtener ID del usuario
          const idUsuario = await obtenerIdUsuario();

          // Actualizar descripción
          const response = await fetch(`${BASE_URL}/usuario/actualizar-descripcion`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              idUsuario: idUsuario,
              descripcion: descripcion,
            }),
          });

          if (!response.ok) {
            throw new Error("Error al actualizar la descripción");
          }

          // Actualizar la interfaz
          aboutMeText.textContent = descripcion;

          return true;
        } catch (error) {
          console.error("Error al actualizar la descripción:", error);
          Swal.showValidationMessage(`Error: ${error.message}`);
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "La descripción se ha actualizado correctamente.",
        });
      }
    });
  }

  // Editar habilidades
  async function editarHabilidades() {
    try {
      // Obtener todas las habilidades disponibles
      const response = await fetch(`${BASE_URL}/habilidad/todas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener las habilidades");
      }

      const habilidades = await response.json();

      // Obtener habilidades actuales del usuario
      const habilidadesActuales = Array.from(skillsContainer.querySelectorAll(".skill-tag")).map(
        (tag) => tag.textContent,
      );

      // Crear opciones para el select múltiple
      const inputOptions = {};
      habilidades.forEach((habilidad) => {
        inputOptions[habilidad.idHabilidad] = habilidad.nombre;
      });

      // Determinar valores preseleccionados
      const preselectedValues = [];
      habilidades.forEach((habilidad) => {
        if (habilidadesActuales.includes(habilidad.nombre)) {
          preselectedValues.push(habilidad.idHabilidad.toString());
        }
      });

      // Mostrar modal de selección
      const { value: selectedHabilidades } = await Swal.fire({
        title: "Editar Habilidades",
        html: "<p>Selecciona tus habilidades:</p>",
        input: "select",
        inputOptions: inputOptions,
        inputAttributes: {
          multiple: "multiple",
          style: "height: 200px; width: 100%;",
        },
        inputValue: preselectedValues,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        didOpen: () => {
          const select = Swal.getInput();
          for (let i = 0; i < select.options.length; i++) {
            if (preselectedValues.includes(select.options[i].value)) {
              select.options[i].selected = true;
            }
          }
        },
        preConfirm: async (value) => {
          try {
            // Convertir a array si es un solo valor
            const habilidadesSeleccionadas = Array.isArray(value) ? value : [value];

            // Actualizar habilidades del usuario
            const response = await fetch(`${BASE_URL}/usuario/actualizar-habilidades`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                idUsuario: idUsuario,
                habilidades: habilidadesSeleccionadas.map((id) => ({ idHabilidad: Number.parseInt(id) })),
              }),
            });

            if (!response.ok) {
              throw new Error("Error al actualizar las habilidades");
            }

            return habilidadesSeleccionadas;
          } catch (error) {
            console.error("Error al actualizar las habilidades:", error);
            Swal.showValidationMessage(`Error: ${error.message}`);
            return false;
          }
        },
      });

      if (selectedHabilidades) {
        // Actualizar la interfaz
        skillsContainer.innerHTML = "";

        // Convertir a array si es un solo valor
        const habilidadesSeleccionadas = Array.isArray(selectedHabilidades)
          ? selectedHabilidades
          : [selectedHabilidades];

        habilidadesSeleccionadas.forEach((idHabilidad) => {
          const habilidad = habilidades.find((h) => h.idHabilidad.toString() === idHabilidad);
          if (habilidad) {
            const skillTag = document.createElement("span");
            skillTag.className = "skill-tag";
            skillTag.textContent = habilidad.nombre;
            skillsContainer.appendChild(skillTag);
          }
        });

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Las habilidades se han actualizado correctamente.",
        });
      }
    } catch (error) {
      console.error("Error al editar las habilidades:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron editar las habilidades. Por favor, intenta de nuevo más tarde.",
      });
    }
  }

  // Editar contacto
  function editarContacto() {
    // Obtener valores actuales
    const contactItems = document.querySelectorAll(".profile-card:nth-child(3) .contact-item");
    let telefono = "";

    contactItems.forEach((item) => {
      const icon = item.querySelector("i");
      const span = item.querySelector("span");

      if (icon.classList.contains("fa-phone")) {
        telefono = span.textContent;
      }
    });

    Swal.fire({
      title: "Editar Contacto",
      html: `
                <div class="swal2-input-container">
                    <label for="telefono">Teléfono:</label>
                    <input id="telefono" class="swal2-input" value="${telefono}">
                </div>
            `,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        try {
          const telefonoNuevo = document.getElementById("telefono").value;

          // Actualizar teléfono del usuario
          const response = await fetch(`${BASE_URL}/usuario/actualizar-telefono`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              idUsuario: idUsuario,
              telefono: telefonoNuevo,
            }),
          });

          if (!response.ok) {
            throw new Error("Error al actualizar el teléfono");
          }

          // Actualizar la interfaz
          contactItems.forEach((item) => {
            const icon = item.querySelector("i");
            const span = item.querySelector("span");

            if (icon.classList.contains("fa-phone")) {
              span.textContent = telefonoNuevo;
            }
          });

          return true;
        } catch (error) {
          console.error("Error al actualizar el teléfono:", error);
          Swal.showValidationMessage(`Error: ${error.message}`);
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "La información de contacto se ha actualizado correctamente.",
        });
      }
    });
  }

  // Publicar nuevo servicio
  async function publicarServicio(event) {
    event.preventDefault();

    // Obtener valores del formulario
    const titulo = document.getElementById("service-title").value;
    const descripcion = document.getElementById("service-description").value;
    const categoria = document.getElementById("service-category").value;
    const tags = document.getElementById("service-tags").value;
    const tipo = document.getElementById("service-type").value;

    // Validar campos obligatorios
    if (!titulo || !descripcion || !categoria || !tipo) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, completa todos los campos obligatorios.",
      });
      return;
    }

    try {
      // Mostrar indicador de carga
      Swal.fire({
        title: "Publicando servicio...",
        text: "Por favor, espera mientras se publica el servicio.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Determinar modalidad según el tipo
      let modalidad = 1; // Presencial por defecto
      switch (tipo) {
        case "virtual":
          modalidad = 2;
          break;
        case "mixto":
          modalidad = 3;
          break;
      }

      // Crear objeto de servicio
      const servicio = {
        titulo: titulo,
        descripcion: descripcion,
        modalidad: modalidad,
        estatus: 1, // Activo
        idUsuario: idUsuario,
        idCategoria: Number.parseInt(categoria),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      // Publicar servicio
      const response = await fetch(`${BASE_URL}/servicio/publicar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(servicio),
      });

      if (!response.ok) {
        throw new Error("Error al publicar el servicio");
      }

      // Cerrar modal
      closeModal("newServiceModal");

      // Limpiar formulario
      document.getElementById("service-title").value = "";
      document.getElementById("service-description").value = "";
      document.getElementById("service-category").value = "";
      document.getElementById("service-tags").value = "";
      document.getElementById("service-type").value = "";

      // Recargar servicios
      await cargarServicios();

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "El servicio se ha publicado correctamente.",
      });
    } catch (error) {
      console.error("Error al publicar el servicio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo publicar el servicio. Por favor, intenta de nuevo más tarde.",
      });
    }
  }

  // Editar servicio
  async function editarServicio(servicioId) {
    try {
      // Obtener datos del servicio
      const response = await fetch(`${BASE_URL}/servicio/detalle/${servicioId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener los detalles del servicio");
      }

      const servicio = await response.json();

      // Determinar tipo según la modalidad
      let tipo = "";
      switch (servicio.modalidad) {
        case 1:
          tipo = "presencial";
          break;
        case 2:
          tipo = "virtual";
          break;
        case 3:
          tipo = "mixto";
          break;
      }

      // Mostrar formulario de edición
      const { value: formValues } = await Swal.fire({
        title: "Editar Servicio",
        html: `
                    <div class="swal2-input-container">
                        <label for="edit-titulo">Título:</label>
                        <input id="edit-titulo" class="swal2-input" value="${servicio.titulo}">
                    </div>
                    <div class="swal2-input-container">
                        <label for="edit-descripcion">Descripción:</label>
                        <textarea id="edit-descripcion" class="swal2-textarea">${servicio.descripcion}</textarea>
                    </div>
                    <div class="swal2-input-container">
                        <label for="edit-tipo">Tipo de servicio:</label>
                        <select id="edit-tipo" class="swal2-select">
                            <option value="presencial" ${tipo === "presencial" ? "selected" : ""}>Presencial</option>
                            <option value="virtual" ${tipo === "virtual" ? "selected" : ""}>Virtual</option>
                            <option value="mixto" ${tipo === "mixto" ? "selected" : ""}>Mixto</option>
                        </select>
                    </div>
                    <div class="swal2-input-container">
                        <label for="edit-estatus">Estatus:</label>
                        <select id="edit-estatus" class="swal2-select">
                            <option value="1" ${servicio.estatus === 1 ? "selected" : ""}>Activo</option>
                            <option value="0" ${servicio.estatus === 0 ? "selected" : ""}>Inactivo</option>
                        </select>
                    </div>
                `,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          const titulo = document.getElementById("edit-titulo").value;
          const descripcion = document.getElementById("edit-descripcion").value;
          const tipo = document.getElementById("edit-tipo").value;
          const estatus = document.getElementById("edit-estatus").value;

          if (!titulo || !descripcion) {
            Swal.showValidationMessage("Por favor, completa todos los campos obligatorios");
            return false;
          }

          return { titulo, descripcion, tipo, estatus };
        },
      });

      if (formValues) {
        // Determinar modalidad según el tipo
        let modalidad = 1; // Presencial por defecto
        switch (formValues.tipo) {
          case "virtual":
            modalidad = 2;
            break;
          case "mixto":
            modalidad = 3;
            break;
        }

        // Actualizar servicio
        const updateResponse = await fetch(`${BASE_URL}/servicio/modificar`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            idServicio: servicioId,
            titulo: formValues.titulo,
            descripcion: formValues.descripcion,
            modalidad: modalidad,
            estatus: Number.parseInt(formValues.estatus),
          }),
        });

        if (!updateResponse.ok) {
          throw new Error("Error al actualizar el servicio");
        }

        // Recargar servicios
        await cargarServicios();

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "El servicio se ha actualizado correctamente.",
        });
      }
    } catch (error) {
      console.error("Error al editar el servicio:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo editar el servicio. Por favor, intenta de nuevo más tarde.",
      });
    }
  }

  // Eliminar servicio
  async function eliminarServicio(servicioId) {
    Swal.fire({
      title: "¿Estás seguro de que quieres eliminar este servicio?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Eliminar servicio
          const response = await fetch(`${BASE_URL}/servicio/eliminar?idServicio=${servicioId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error("Error al eliminar el servicio");
          }

          // Recargar servicios
          await cargarServicios();

          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "El servicio se ha eliminado correctamente.",
          });
        } catch (error) {
          console.error("Error al eliminar el servicio:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el servicio. Por favor, intenta de nuevo más tarde.",
          });
        }
      }
    });
  }

  // Ver detalles del servicio
  function verDetallesServicio(servicioId) {
    window.location.href = `servicio.html?id=${servicioId}`;
  }

  // Filtrar servicios
  function filtrarServicios(filtro) {
    // Obtener todos los elementos de servicio
    const servicios = document.querySelectorAll(".service-card");

    // Iterar sobre cada servicio y mostrar u ocultar según el filtro
    servicios.forEach((servicio) => {
      const titulo = servicio.querySelector(".service-title").textContent.toLowerCase();
      const descripcion = servicio.querySelector(".service-description").textContent.toLowerCase();

      if (titulo.includes(filtro) || descripcion.includes(filtro) || filtro === "todos") {
        servicio.style.display = "block";
      } else {
        servicio.style.display = "none";
      }
    });
  }

  // Generar estrellas según la reputación
  function generarEstrellas(reputacion) {
    const estrellasLlenas = Math.floor(reputacion);
    const tieneMediaEstrella = reputacion % 1 !== 0;
    let estrellasHTML = "";

    for (let i = 0; i < estrellasLlenas; i++) {
      estrellasHTML += '<i class="fas fa-star"></i>';
    }

    if (tieneMediaEstrella) {
      estrellasHTML += '<i class="fas fa-star-half-alt"></i>';
    }

    const estrellasVacias = 5 - estrellasLlenas - (tieneMediaEstrella ? 1 : 0);
    for (let i = 0; i < estrellasVacias; i++) {
      estrellasHTML += '<i class="far fa-star"></i>';
    }

    return estrellasHTML;
  }

  // Abrir modal
  function openModal(modalId) {
    document.getElementById(modalId).classList.add("active");
    document.body.classList.add("modal-open");
  }

  // Cerrar modal
  function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
    document.body.classList.remove("modal-open");
  }
});