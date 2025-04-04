document.addEventListener("DOMContentLoaded", () => {
  // Variables globales
  const BASE_URL = "http://localhost:8080/RedSolidaria/api"
  let currentChatUserId = null
  let currentChatUserName = null
  let currentUserId = null
  let chatOptionsMenuVisible = false

  // Elementos DOM
  const chatList = document.getElementById("chatList")
  const chatMain = document.getElementById("chatConversation")
  const chatMessages = document.getElementById("chatMessages")
  const messageInput = document.getElementById("messageInput")
  const sendMessageBtn = document.getElementById("sendMessageBtn")
  const chatSearchInput = document.getElementById("chatSearchInput")
  const chatSearchBtn = document.getElementById("chatSearchButton")
  const chatTabs = document.querySelectorAll(".tab-btn")
  const chatOptionsMenu = document.getElementById("chatOptionsMenu")
  const blockUserBtn = document.getElementById("blockUserBtn")
  const reportUserBtn = document.getElementById("reportUserBtn")
  const clearChatBtn = document.getElementById("clearChatBtn")
  const viewProfileBtn = document.getElementById("viewProfileBtn")
  const chatUserImage = document.getElementById("chatUserImage")
  const chatUserName = document.getElementById("chatUserName")
  const chatUserStatus = document.getElementById("chatUserStatus")
  const activeConversation = document.getElementById("activeConversation")
  const emptyConversation = document.getElementById("emptyConversation")

  // Inicialización
  init()

  // Función de inicialización
  async function init() {
    try {
      // Obtener ID del usuario actual
      currentUserId = await obtenerIdUsuario()

      if (!currentUserId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debes iniciar sesión para acceder al chat.",
          confirmButtonText: "Ir al inicio de sesión",
          allowOutsideClick: false,
        }).then(() => {
          window.location.href = "index.html"
        })
        return
      }

      // Cargar lista de chats
      await cargarChats()

      // Verificar si hay un ID de usuario en la URL (para iniciar un chat específico)
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get("id")

      if (userId) {
        // Buscar si ya existe un chat con este usuario
        const chatItem = document.querySelector(`.chat-item[data-id="${userId}"]`)

        if (chatItem) {
          // Si existe, seleccionarlo
          chatItem.click()
        } else {
          // Si no existe, obtener información del usuario y crear un nuevo chat
          await iniciarNuevoChat(userId)
        }
      }

      // Configurar eventos
      setupEventListeners()
    } catch (error) {
      console.error("Error en la inicialización:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al cargar el chat. Por favor, intenta de nuevo más tarde.",
      })
    }
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Enviar mensaje al hacer clic en el botón
    sendMessageBtn.addEventListener("click", enviarMensaje)

    // Enviar mensaje al presionar Enter
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault() // Evitar el salto de línea por defecto
        enviarMensaje()
      }
    })

    // Búsqueda de chats
    chatSearchBtn.addEventListener("click", buscarChats)
    chatSearchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        buscarChats()
      }
    })

    // Cambio de pestañas
    chatTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        chatTabs.forEach((t) => t.classList.remove("active"))
        this.classList.add("active")
        filtrarChatsPorTab(this.getAttribute("data-tab"))
      })
    })

    // Menú de opciones de chat
    document.getElementById("moreOptionsBtn").addEventListener("click", (e) => {
      e.stopPropagation()
      toggleChatOptionsMenu()
    })

    // Opciones del menú
    blockUserBtn.addEventListener("click", bloquearUsuario)
    reportUserBtn.addEventListener("click", reportarUsuario)
    clearChatBtn.addEventListener("click", limpiarConversacion)

    // Ver perfil de usuario
    viewProfileBtn.addEventListener("click", () => {
      if (currentChatUserId) {
        window.location.href = `perfilVisitante.html?id=${currentChatUserId}`
      }
    })

    // Cerrar menú de opciones al hacer clic fuera
    document.addEventListener("click", () => {
      if (chatOptionsMenuVisible) {
        document.getElementById("chatOptionsMenu").style.display = "none"
        chatOptionsMenuVisible = false
      }
    })
  }

  // Cargar lista de chats
  async function cargarChats() {
    try {
      chatList.innerHTML = "" // Limpiar lista actual

      // Mostrar skeleton loading
      for (let i = 0; i < 3; i++) {
        chatList.innerHTML += `
                    <div class="chat-item skeleton">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-text"></div>
                        </div>
                    </div>
                `
      }

      const response = await fetch(`${BASE_URL}/mensaje/chats/${currentUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar los chats")
      }

      const chats = await response.json()

      // Limpiar skeleton loading
      chatList.innerHTML = ""

      if (chats.length === 0) {
        chatList.innerHTML = `
                    <div class="empty-chats">
                        <i class="fas fa-comments"></i>
                        <p>No tienes conversaciones aún</p>
                        <p>Visita perfiles de usuarios para iniciar un chat</p>
                    </div>
                `
        return
      }

      // Renderizar cada chat
      chats.forEach((chat) => {
        const chatItem = document.createElement("div")
        chatItem.className = "chat-item"
        chatItem.setAttribute("data-id", chat.idUsuario)
        chatItem.setAttribute("data-unread", chat.mensajesNoLeidos > 0 ? "true" : "false")

        // Formatear la fecha del último mensaje
        let fechaFormateada = "Sin mensajes"
        if (chat.fechaUltimoMensaje) {
          const fecha = new Date(chat.fechaUltimoMensaje)
          const hoy = new Date()
          const ayer = new Date(hoy)
          ayer.setDate(hoy.getDate() - 1)

          if (fecha.toDateString() === hoy.toDateString()) {
            // Si es hoy, mostrar la hora
            fechaFormateada = fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
          } else if (fecha.toDateString() === ayer.toDateString()) {
            // Si es ayer, mostrar "Ayer"
            fechaFormateada = "Ayer"
          } else {
            // Si es otro día, mostrar la fecha
            fechaFormateada = fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
          }
        }

        chatItem.innerHTML = `
                    <img src="${chat.foto || "img/usuario.jpg"}" alt="${chat.nombre}" class="user-avatar">
                    <div class="chat-item-content">
                        <div class="chat-item-header">
                            <h3 class="chat-item-name">${chat.nombre}</h3>
                            <span class="chat-item-time">${fechaFormateada}</span>
                        </div>
                        <p class="chat-item-preview">${chat.ultimoMensaje || "Sin mensajes"}</p>
                    </div>
                    ${chat.mensajesNoLeidos > 0 ? `<span class="chat-item-badge">${chat.mensajesNoLeidos}</span>` : ""}
                `

        // Evento para abrir el chat
        chatItem.addEventListener("click", function () {
          const userId = this.getAttribute("data-id")
          const userName = this.querySelector(".chat-item-name").textContent
          abrirChat(userId, userName)

          // Marcar como activo
          document.querySelectorAll(".chat-item").forEach((item) => {
            item.classList.remove("active")
          })
          this.classList.add("active")

          // Quitar badge de no leídos
          const badge = this.querySelector(".chat-item-badge")
          if (badge) {
            badge.remove()
          }
          this.setAttribute("data-unread", "false")
        })

        chatList.appendChild(chatItem)
      })
    } catch (error) {
      console.error("Error al cargar los chats:", error)
      chatList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar los chats</p>
                    <button id="retryLoadChats" class="retry-btn">Reintentar</button>
                </div>
            `

      document.getElementById("retryLoadChats").addEventListener("click", cargarChats)
    }
  }

  // Abrir un chat específico
  async function abrirChat(userId, userName) {
    try {
      currentChatUserId = userId
      currentChatUserName = userName

      // Mostrar la sección de chat activo y ocultar el estado vacío
      document.getElementById("emptyConversation").style.display = "none"
      document.getElementById("activeConversation").style.display = "flex"

      // Actualizar información del usuario en el encabezado
      chatUserName.textContent = userName

      // Cargar foto del usuario
      const userResponse = await fetch(`${BASE_URL}/usuario/obtener-datos-basicos?id=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        chatUserImage.src = userData.foto || "img/usuario.jpg"

        // Actualizar estado del usuario
        if (userData.online) {
          chatUserStatus.textContent = "En línea"
        } else {
          chatUserStatus.textContent = "Desconectado"
        }
      }

      // Cargar mensajes
      await cargarMensajes()

      // Marcar mensajes como leídos
      await marcarMensajesComoLeidos()

      // Enfocar el campo de entrada de mensaje
      messageInput.focus()
    } catch (error) {
      console.error("Error al abrir el chat:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo abrir la conversación. Por favor, intenta de nuevo más tarde.",
      })
    }
  }

  // Iniciar un nuevo chat con un usuario
  async function iniciarNuevoChat(userId) {
    try {
      // Obtener información del usuario
      const response = await fetch(`${BASE_URL}/usuario/obtener-datos-basicos?id=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener información del usuario")
      }

      const userData = await response.json()

      // Crear un nuevo elemento de chat
      const chatItem = document.createElement("div")
      chatItem.className = "chat-item"
      chatItem.setAttribute("data-id", userId)
      chatItem.setAttribute("data-unread", "false")

      chatItem.innerHTML = `
                <img src="${userData.foto || "img/usuario.jpg"}" alt="${userData.nombre}" class="user-avatar">
                <div class="chat-item-content">
                    <div class="chat-item-header">
                        <h3 class="chat-item-name">${userData.nombre}</h3>
                        <span class="chat-item-time">Nuevo</span>
                    </div>
                    <p class="chat-item-preview">Inicia una conversación</p>
                </div>
            `

      // Evento para abrir el chat
      chatItem.addEventListener("click", function () {
        abrirChat(userId, userData.nombre)

        // Marcar como activo
        document.querySelectorAll(".chat-item").forEach((item) => {
          item.classList.remove("active")
        })
        this.classList.add("active")
      })

      // Agregar al inicio de la lista
      if (chatList.firstChild) {
        chatList.insertBefore(chatItem, chatList.firstChild)
      } else {
        chatList.appendChild(chatItem)
      }

      // Simular clic para abrir el chat
      chatItem.click()
    } catch (error) {
      console.error("Error al iniciar nuevo chat:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo iniciar la conversación. Por favor, intenta de nuevo más tarde.",
      })
    }
  }

  // Cargar mensajes de un chat
  async function cargarMensajes() {
    try {
      chatMessages.innerHTML = "" // Limpiar mensajes actuales

      // Mostrar indicador de carga
      chatMessages.innerHTML = `
                <div class="loading-messages">
                    <div class="loading-spinner"></div>
                    <p>Cargando mensajes...</p>
                </div>
            `

      const response = await fetch(`${BASE_URL}/mensaje/conversacion/${currentUserId}/${currentChatUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar los mensajes")
      }

      const mensajes = await response.json()

      // Limpiar indicador de carga
      chatMessages.innerHTML = ""

      if (mensajes.length === 0) {
        chatMessages.innerHTML = `
                    <div class="empty-messages">
                        <p>No hay mensajes aún</p>
                        <p>¡Sé el primero en escribir!</p>
                    </div>
                `
        return
      }

      // Agrupar mensajes por fecha
      const mensajesPorFecha = {}

      mensajes.forEach((mensaje) => {
        const fecha = new Date(mensaje.fechaEnvio)
        const fechaStr = fecha.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })

        if (!mensajesPorFecha[fechaStr]) {
          mensajesPorFecha[fechaStr] = []
        }

        mensajesPorFecha[fechaStr].push(mensaje)
      })

      // Renderizar mensajes agrupados por fecha
      const fechas = Object.keys(mensajesPorFecha)
      fechas.forEach((fecha) => {
        // Agregar divisor de fecha
        const hoy = new Date()
        const ayer = new Date(hoy)
        ayer.setDate(hoy.getDate() - 1)

        let fechaLabel = fecha
        if (fecha === hoy.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })) {
          fechaLabel = "Hoy"
        } else if (fecha === ayer.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })) {
          fechaLabel = "Ayer"
        }

        const dateDivider = document.createElement("div")
        dateDivider.className = "chat-date-divider"
        dateDivider.textContent = fechaLabel
        chatMessages.appendChild(dateDivider)

        // Renderizar mensajes de esta fecha
        mensajesPorFecha[fecha].forEach((mensaje) => {
          const messageDiv = document.createElement("div")
          messageDiv.className = mensaje.idRemitente == currentUserId ? "message sent" : "message received"

          // Formatear hora
          const hora = new Date(mensaje.fechaEnvio).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })

          // Determinar estado del mensaje
          let estadoMensaje = ""
          if (mensaje.idRemitente == currentUserId) {
            switch (mensaje.estatus) {
              case 0:
                estadoMensaje = '<span class="message-status">Enviado</span>'
                break
              case 1:
                estadoMensaje = '<span class="message-status">Leído</span>'
                break
            }
          }

          messageDiv.innerHTML = `
                        ${mensaje.contenido}
                        <div class="message-time">${hora}</div>
                        ${estadoMensaje}
                    `

          chatMessages.appendChild(messageDiv)
        })
      })

      // Scroll al final de los mensajes
      chatMessages.scrollTop = chatMessages.scrollHeight
    } catch (error) {
      console.error("Error al cargar los mensajes:", error)
      chatMessages.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar los mensajes</p>
                    <button id="retryLoadMessages" class="retry-btn">Reintentar</button>
                </div>
            `

      document.getElementById("retryLoadMessages").addEventListener("click", cargarMensajes)
    }
  }

  // Enviar un mensaje
  async function enviarMensaje() {
    const mensaje = messageInput.value.trim()

    if (!mensaje || !currentChatUserId) return

    let messageDiv // Declare messageDiv here

    try {
      // Limpiar campo de entrada
      messageInput.value = ""

      // Agregar mensaje a la interfaz (optimista)
      messageDiv = document.createElement("div")
      messageDiv.className = "message sent"

      // Formatear hora actual
      const hora = new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })

      messageDiv.innerHTML = `
                ${mensaje}
                <div class="message-time">${hora}</div>
                <span class="message-status">Enviando...</span>
            `

      chatMessages.appendChild(messageDiv)

      // Scroll al final de los mensajes
      chatMessages.scrollTop = chatMessages.scrollHeight

      // Enviar mensaje al servidor
      const response = await fetch(`${BASE_URL}/mensaje/enviar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
        body: JSON.stringify({
          contenido: mensaje,
          tipoContenido: 1, // 1 = Texto
          fechaEnvio: new Date().toISOString(),
          estatus: 0, // 0 = Enviado
          idRemitente: currentUserId,
          idDestinatario: currentChatUserId,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar el mensaje")
      }

      // Actualizar estado del mensaje
      messageDiv.querySelector(".message-status").textContent = "Enviado"

      // Actualizar la lista de chats (para mostrar el último mensaje)
      actualizarChatEnLista(currentChatUserId, mensaje)
    } catch (error) {
      console.error("Error al enviar el mensaje:", error)

      // Mostrar error en el mensaje
      const statusSpan = messageDiv.querySelector(".message-status")
      if (statusSpan) {
        statusSpan.textContent = "Error al enviar"
        statusSpan.style.color = "red"
      }

      // Opción para reintentar
      const retryBtn = document.createElement("button")
      retryBtn.className = "retry-message-btn"
      retryBtn.textContent = "Reintentar"
      retryBtn.onclick = () => {
        // Eliminar el mensaje fallido
        messageDiv.remove()

        // Restaurar el texto en el campo de entrada
        messageInput.value = mensaje
        messageInput.focus()
      }

      messageDiv.appendChild(retryBtn)
    }
  }

  // Actualizar un chat en la lista después de enviar un mensaje
  function actualizarChatEnLista(userId, mensaje) {
    const chatItem = document.querySelector(`.chat-item[data-id="${userId}"]`)

    if (chatItem) {
      // Actualizar vista previa del mensaje
      const preview = chatItem.querySelector(".chat-item-preview")
      if (preview) {
        preview.textContent = mensaje
      }

      // Actualizar hora
      const timeSpan = chatItem.querySelector(".chat-item-time")
      if (timeSpan) {
        timeSpan.textContent = "Ahora"
      }

      // Mover al inicio de la lista
      if (chatItem.parentNode.firstChild !== chatItem) {
        chatItem.parentNode.insertBefore(chatItem, chatItem.parentNode.firstChild)
      }
    }
  }

  // Marcar mensajes como leídos
  async function marcarMensajesComoLeidos() {
    if (!currentChatUserId) return

    try {
      await fetch(`${BASE_URL}/mensaje/marcar-leidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
        },
        body: JSON.stringify({
          idUsuario: currentUserId,
          idRemitente: currentChatUserId,
        }),
      })

      // Actualizar la interfaz
      const chatItem = document.querySelector(`.chat-item[data-id="${currentChatUserId}"]`)
      if (chatItem) {
        const badge = chatItem.querySelector(".chat-item-badge")
        if (badge) {
          badge.remove()
        }
        chatItem.setAttribute("data-unread", "false")
      }
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error)
    }
  }

  // Buscar chats
  function buscarChats() {
    const searchTerm = chatSearchInput.value.toLowerCase()

    document.querySelectorAll(".chat-item").forEach((item) => {
      const userName = item.querySelector(".chat-item-name").textContent.toLowerCase()
      const lastMessage = item.querySelector(".chat-item-preview").textContent.toLowerCase()

      if (userName.includes(searchTerm) || lastMessage.includes(searchTerm)) {
        item.style.display = "flex"
      } else {
        item.style.display = "none"
      }
    })
  }

  // Filtrar chats por pestaña
  function filtrarChatsPorTab(tab) {
    document.querySelectorAll(".chat-item").forEach((item) => {
      switch (tab) {
        case "unread":
          item.style.display = item.getAttribute("data-unread") === "true" ? "flex" : "none"
          break
        case "favorites":
          // Implementar cuando se agregue la funcionalidad de favoritos
          item.style.display = "flex"
          break
        default: // 'all'
          item.style.display = "flex"
          break
      }
    })
  }

  // Mostrar/ocultar menú de opciones de chat
  function toggleChatOptionsMenu() {
    if (!chatOptionsMenuVisible) {
      // Posicionar el menú
      const rect = document.getElementById("moreOptionsBtn").getBoundingClientRect()
      document.getElementById("chatOptionsMenu").style.top = `${rect.bottom + 5}px`
      document.getElementById("chatOptionsMenu").style.right = `${window.innerWidth - rect.right}px`
      document.getElementById("chatOptionsMenu").style.display = "block"
      chatOptionsMenuVisible = true
    } else {
      document.getElementById("chatOptionsMenu").style.display = "none"
      chatOptionsMenuVisible = false
    }
  }

  // Bloquear usuario
  async function bloquearUsuario() {
    if (!currentChatUserId) return

    Swal.fire({
      title: "¿Bloquear usuario?",
      text: `¿Estás seguro de que deseas bloquear a ${currentChatUserName}? No podrás recibir mensajes de este usuario.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Bloquear",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${BASE_URL}/usuario/bloquear`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
            },
            body: JSON.stringify({
              idUsuarioBloquea: currentUserId,
              idUsuarioBloqueado: currentChatUserId,
            }),
          })

          if (!response.ok) {
            throw new Error("Error al bloquear al usuario")
          }

          Swal.fire("Usuario bloqueado", `Has bloqueado a ${currentChatUserName}`, "success")

          // Actualizar la interfaz
          const chatItem = document.querySelector(`.chat-item[data-id="${currentChatUserId}"]`)
          if (chatItem) {
            chatItem.remove()
          }

          // Volver al estado vacío
          document.getElementById("activeConversation").style.display = "none"
          document.getElementById("emptyConversation").style.display = "flex"
          currentChatUserId = null
          currentChatUserName = null
        } catch (error) {
          console.error("Error al bloquear al usuario:", error)
          Swal.fire("Error", "No se pudo bloquear al usuario. Por favor, intenta de nuevo más tarde.", "error")
        }
      }

      // Cerrar menú de opciones
      document.getElementById("chatOptionsMenu").style.display = "none"
      chatOptionsMenuVisible = false
    })
  }

  // Reportar usuario
  function reportarUsuario() {
    if (!currentChatUserId) return

    Swal.fire({
      title: "Reportar usuario",
      html: `
                <div class="swal2-input-container">
                    <label for="report-reason">Motivo del reporte:</label>
                    <select id="report-reason" class="swal2-select">
                        <option value="spam">Spam o contenido no deseado</option>
                        <option value="inappropriate">Contenido inapropiado</option>
                        <option value="harassment">Acoso</option>
                        <option value="scam">Intento de estafa</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div class="swal2-input-container">
                    <label for="report-description">Descripción:</label>
                    <textarea id="report-description" class="swal2-textarea" placeholder="Describe el problema..."></textarea>
                </div>
            `,
      showCancelButton: true,
      confirmButtonText: "Reportar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const reason = document.getElementById("report-reason").value
        const description = document.getElementById("report-description").value

        if (!description) {
          Swal.showValidationMessage("Por favor, describe el problema")
          return false
        }

        return { reason, description }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${BASE_URL}/denuncia/reportar`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
            },
            body: JSON.stringify({
              motivo: result.value.reason,
              descripcion: result.value.description,
              idUsuarioDenunciante: currentUserId,
              idUsuarioReportado: currentChatUserId,
              estatus: 0, // 0 = No verificado
            }),
          })

          if (!response.ok) {
            throw new Error("Error al reportar al usuario")
          }

          Swal.fire("Usuario reportado", "Tu reporte ha sido enviado y será revisado por nuestro equipo.", "success")
        } catch (error) {
          console.error("Error al reportar al usuario:", error)
          Swal.fire("Error", "No se pudo enviar el reporte. Por favor, intenta de nuevo más tarde.", "error")
        }
      }

      // Cerrar menú de opciones
      document.getElementById("chatOptionsMenu").style.display = "none"
      chatOptionsMenuVisible = false
    })
  }

  // Limpiar conversación
  function limpiarConversacion() {
    if (!currentChatUserId) return

    Swal.fire({
      title: "¿Limpiar conversación?",
      text: "Esta acción eliminará todos los mensajes de esta conversación para ti. No se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Limpiar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${BASE_URL}/mensaje/limpiar-conversacion`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
            },
            body: JSON.stringify({
              idUsuario: currentUserId,
              idOtroUsuario: currentChatUserId,
            }),
          })

          if (!response.ok) {
            throw new Error("Error al limpiar la conversación")
          }

          // Limpiar mensajes en la interfaz
          document.getElementById("chatMessages").innerHTML = `
                        <div class="empty-messages">
                            <p>No hay mensajes aún</p>
                            <p>¡Sé el primero en escribir!</p>
                        </div>
                    `

          // Actualizar la vista previa en la lista de chats
          const chatItem = document.querySelector(`.chat-item[data-id="${currentChatUserId}"]`)
          if (chatItem) {
            const preview = chatItem.querySelector(".chat-item-preview")
            if (preview) {
              preview.textContent = "Sin mensajes"
            }
          }

          Swal.fire("Conversación limpiada", "Todos los mensajes han sido eliminados.", "success")
        } catch (error) {
          console.error("Error al limpiar la conversación:", error)
          Swal.fire("Error", "No se pudo limpiar la conversación. Por favor, intenta de nuevo más tarde.", "error")
        }
      }

      // Cerrar menú de opciones
      document.getElementById("chatOptionsMenu").style.display = "none"
      chatOptionsMenuVisible = false
    })
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
})

