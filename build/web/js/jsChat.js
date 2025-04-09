document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    const BASE_URL = "http://localhost:8080/RedSolidaria/api";
    let currentChatUserId = null;
    let currentChatUserName = null;
    let currentUserId = null;
    let chatOptionsMenuVisible = false;
    let pollingInterval = null; // Movido aquí

    // Elementos DOM
    const chatList = document.getElementById("chatList");
    const chatMain = document.getElementById("chatConversation");
    const chatMessages = document.getElementById("chatMessages");
    const messageInput = document.getElementById("messageInput");
    const sendMessageBtn = document.getElementById("sendMessageBtn");
    const chatSearchInput = document.getElementById("chatSearchInput");
    const chatSearchBtn = document.getElementById("chatSearchButton");
    const chatTabs = document.querySelectorAll(".tab-btn");
    const chatOptionsMenu = document.getElementById("chatOptionsMenu");
    const blockUserBtn = document.getElementById("blockUserBtn");
    const reportUserBtn = document.getElementById("reportUserBtn");
    const clearChatBtn = document.getElementById("clearChatBtn");
    const viewProfileBtn = document.getElementById("viewProfileBtn");
    const chatUserImage = document.getElementById("chatUserImage");
    const chatUserName = document.getElementById("chatUserName");
    const chatUserStatus = document.getElementById("chatUserStatus");
    const activeConversation = document.getElementById("activeConversation");
    const emptyConversation = document.getElementById("emptyConversation");

    // Inicialización
    init();

    // Función de inicialización
    async function init() {
        try {
            currentUserId = await obtenerIdUsuario();
            if (!currentUserId) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Debes iniciar sesión para acceder al chat.",
                    confirmButtonText: "Ir al inicio de sesión",
                    allowOutsideClick: false,
                }).then(() => {
                    window.location.href = "index.html";
                });
                return;
            }
            await cargarChats();
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get("id");
            if (userId) {
                const chatItem = document.querySelector(`.chat-item[data-id="${userId}"]`);
                if (chatItem) {
                    chatItem.click();
                } else {
                    await iniciarNuevoChat(userId);
                }
            }
            setupEventListeners();
        } catch (error) {
            console.error("Error en la inicialización:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un error al cargar el chat. Por favor, intenta de nuevo más tarde.",
            });
        }
    }

    // Configurar event listeners
    function setupEventListeners() {
        sendMessageBtn.addEventListener("click", enviarMensaje);
        messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviarMensaje();
            }
        });
        chatSearchBtn.addEventListener("click", buscarChats);
        chatSearchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") buscarChats();
        });
        chatTabs.forEach((tab) => {
            tab.addEventListener("click", function () {
                chatTabs.forEach((t) => t.classList.remove("active"));
                this.classList.add("active");
                filtrarChatsPorTab(this.getAttribute("data-tab"));
            });
        });
        document.getElementById("moreOptionsBtn").addEventListener("click", (e) => {
            e.stopPropagation();
            toggleChatOptionsMenu();
        });
        blockUserBtn.addEventListener("click", bloquearUsuario);
        reportUserBtn.addEventListener("click", reportarUsuario);
        clearChatBtn.addEventListener("click", limpiarConversacion);
        viewProfileBtn.addEventListener("click", () => {
            if (currentChatUserId) window.location.href = `perfilVisitante.html?id=${currentChatUserId}`;
        });
        document.addEventListener("click", () => {
            if (chatOptionsMenuVisible) {
                chatOptionsMenu.style.display = "none";
                chatOptionsMenuVisible = false;
            }
        });
    }

    // Cargar lista de chats
    async function cargarChats() {
        try {
            chatList.innerHTML = "";
            for (let i = 0; i < 3; i++) {
                chatList.innerHTML += `
                    <div class="chat-item skeleton">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-title"></div>
                            <div class="skeleton-text"></div>
                        </div>
                    </div>
                `;
            }
            const response = await fetch(`${BASE_URL}/mensaje/chats/${currentUserId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
                },
            });
            if (!response.ok) throw new Error("Error al cargar los chats");
            const chats = await response.json();
            console.log("Chats recibidos:", chats);
            chatList.innerHTML = "";
            if (chats.length === 0) {
                chatList.innerHTML = `
                    <div class="empty-chats">
                        <i class="fas fa-comments"></i>
                        <p>No tienes conversaciones aún</p>
                        <p>Visita perfiles de usuarios para iniciar un chat</p>
                    </div>
                `;
                return;
            }
            chats.forEach((chat) => {
                const chatItem = document.createElement("div");
                chatItem.className = "chat-item";
                chatItem.setAttribute("data-id", chat.idUsuario);
                chatItem.setAttribute("data-unread", chat.mensajesNoLeidos > 0 ? "true" : "false");
                let fechaFormateada = "Sin mensajes";
                if (chat.fechaUltimoMensaje) {
                    const fecha = new Date(chat.fechaUltimoMensaje);
                    if (!isNaN(fecha.getTime())) {
                        const hoy = new Date();
                        const ayer = new Date(hoy);
                        ayer.setDate(hoy.getDate() - 1);
                        if (fecha.toDateString() === hoy.toDateString()) {
                            fechaFormateada = fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
                        } else if (fecha.toDateString() === ayer.toDateString()) {
                            fechaFormateada = "Ayer";
                        } else {
                            fechaFormateada = fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
                        }
                    } else {
                        console.warn(`Fecha inválida para chat ${chat.idUsuario}:`, chat.fechaUltimoMensaje);
                        fechaFormateada = "Sin fecha";
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
                `;
                chatItem.addEventListener("click", function () {
                    const userId = this.getAttribute("data-id");
                    const userName = this.querySelector(".chat-item-name").textContent;
                    abrirChat(userId, userName);
                    document.querySelectorAll(".chat-item").forEach((item) => item.classList.remove("active"));
                    this.classList.add("active");
                    const badge = this.querySelector(".chat-item-badge");
                    if (badge) badge.remove();
                    this.setAttribute("data-unread", "false");
                });
                chatList.appendChild(chatItem);
            });
        } catch (error) {
            console.error("Error al cargar los chats:", error);
            chatList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar los chats</p>
                    <button id="retryLoadChats" class="retry-btn">Reintentar</button>
                </div>
            `;
            document.getElementById("retryLoadChats").addEventListener("click", cargarChats);
        }
    }

    // Abrir un chat específico
    async function abrirChat(userId, userName) {
        try {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
            currentChatUserId = userId;
            currentChatUserName = userName;
            emptyConversation.style.display = "none";
            activeConversation.style.display = "flex";
            chatUserName.textContent = userName;
            const userResponse = await fetch(`${BASE_URL}/usuario/obtener-datos-basicos?id=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
                },
            });
            if (userResponse.ok) {
                const userData = await userResponse.json();
                chatUserImage.src = userData.foto || "img/usuario.jpg";
                chatUserStatus.textContent = userData.online ? "En línea" : "Desconectado";
            }
            await cargarMensajes();
            await marcarMensajesComoLeidos();
            pollingInterval = setInterval(async () => {
                await cargarMensajesNuevos();
            }, 5000);
            messageInput.focus();
        } catch (error) {
            console.error("Error al abrir el chat:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo abrir la conversación. Por favor, intenta de nuevo más tarde.",
            });
        }
    }

    // Iniciar un nuevo chat con un usuario
    async function iniciarNuevoChat(userId) {
        try {
            const response = await fetch(`${BASE_URL}/usuario/obtener-datos-basicos?id=${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
                },
            });
            if (!response.ok) throw new Error("Error al obtener información del usuario");
            const userData = await response.json();
            const chatItem = document.createElement("div");
            chatItem.className = "chat-item";
            chatItem.setAttribute("data-id", userId);
            chatItem.setAttribute("data-unread", "false");
            chatItem.innerHTML = `
                <img src="${userData.foto || "img/usuario.jpg"}" alt="${userData.nombre}" class="user-avatar">
                <div class="chat-item-content">
                    <div class="chat-item-header">
                        <h3 class="chat-item-name">${userData.nombre}</h3>
                        <span class="chat-item-time">Nuevo</span>
                    </div>
                    <p class="chat-item-preview">Inicia una conversación</p>
                </div>
            `;
            chatItem.addEventListener("click", function () {
                abrirChat(userId, userData.nombre);
                document.querySelectorAll(".chat-item").forEach((item) => item.classList.remove("active"));
                this.classList.add("active");
            });
            if (chatList.firstChild) {
                chatList.insertBefore(chatItem, chatList.firstChild);
            } else {
                chatList.appendChild(chatItem);
            }
            chatItem.click();
        } catch (error) {
            console.error("Error al iniciar nuevo chat:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo iniciar la conversación. Por favor, intenta de nuevo más tarde.",
            });
        }
    }

    // Cargar mensajes de un chat
    async function cargarMensajes() {
        try {
            chatMessages.innerHTML = `
                <div class="loading-messages">
                    <div class="loading-spinner"></div>
                    <p>Cargando mensajes...</p>
                </div>
            `;
            const response = await fetch(`${BASE_URL}/mensaje/conversacion/${currentUserId}/${currentChatUserId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
                },
            });
            if (!response.ok) throw new Error("Error al cargar los mensajes");
            const mensajes = await response.json();
            chatMessages.innerHTML = "";
            if (mensajes.length === 0) {
                chatMessages.innerHTML = `
                    <div class="empty-messages">
                        <p>No hay mensajes aún</p>
                        <p>¡Sé el primero en escribir!</p>
                    </div>
                `;
                return;
            }
            const mensajesPorFecha = {};
            mensajes.forEach((mensaje) => {
                const fecha = new Date(mensaje.fechaEnvio);
                const fechaStr = fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
                if (!mensajesPorFecha[fechaStr]) mensajesPorFecha[fechaStr] = [];
                mensajesPorFecha[fechaStr].push(mensaje);
            });
            const fechas = Object.keys(mensajesPorFecha);
            fechas.forEach((fecha) => {
                const hoy = new Date();
                const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
                let fechaLabel = fecha;
                if (fecha === hoy.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })) fechaLabel = "Hoy";
                else if (fecha === ayer.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })) fechaLabel = "Ayer";
                const dateDivider = document.createElement("div");
                dateDivider.className = "chat-date-divider";
                dateDivider.dataset.fecha = fecha;
                dateDivider.textContent = fechaLabel;
                chatMessages.appendChild(dateDivider);
                mensajesPorFecha[fecha].forEach((mensaje) => {
                    const messageDiv = document.createElement("div");
                    messageDiv.className = mensaje.idRemitente == currentUserId ? "message sent" : "message received";
                    messageDiv.dataset.idMensaje = mensaje.idMensaje;
                    const hora = new Date(mensaje.fechaEnvio).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
                    let estadoMensaje = "";
                    if (mensaje.idRemitente == currentUserId) {
                        switch (mensaje.estatus) {
                            case 0: estadoMensaje = '<span class="message-status">Enviado</span>'; break;
                            case 1: estadoMensaje = '<span class="message-status">Leído</span>'; break;
                        }
                    }
                    messageDiv.innerHTML = `
                        ${mensaje.contenido}
                        <div class="message-time">${hora}</div>
                        ${estadoMensaje}
                    `;
                    chatMessages.appendChild(messageDiv);
                });
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error("Error al cargar los mensajes:", error);
            chatMessages.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar los mensajes</p>
                    <button id="retryLoadMessages" class="retry-btn">Reintentar</button>
                </div>
            `;
            document.getElementById("retryLoadMessages").addEventListener("click", cargarMensajes);
        }
    }

    // Enviar un mensaje
    async function enviarMensaje() {
    const mensaje = messageInput.value.trim();
    if (!mensaje || !currentChatUserId) return;
    let messageDiv;
    try {
        messageInput.value = "";
        messageDiv = document.createElement("div");
        messageDiv.className = "message sent";
        const hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
        messageDiv.innerHTML = `
            ${mensaje}
            <div class="message-time">${hora}</div>
            <span class="message-status">Enviando...</span>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const response = await fetch(`${BASE_URL}/mensaje/enviar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
            },
            body: JSON.stringify({
                contenido: mensaje,
                tipoContenido: 1,
                estatus: 0,
                idRemitente: currentUserId,
                idDestinatario: currentChatUserId,
            }),
        });
        if (!response.ok) throw new Error("Error al enviar el mensaje");

        const mensajeEnviado = await response.json();
        messageDiv.dataset.idMensaje = mensajeEnviado.idMensaje; // Asignar el ID del servidor
        messageDiv.querySelector(".message-status").textContent = "Enviado";
        actualizarChatEnLista(currentChatUserId, mensaje);
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        const statusSpan = messageDiv.querySelector(".message-status");
        if (statusSpan) {
            statusSpan.textContent = "Error al enviar";
            statusSpan.style.color = "red";
        }
        const retryBtn = document.createElement("button");
        retryBtn.className = "retry-message-btn";
        retryBtn.textContent = "Reintentar";
        retryBtn.onclick = () => {
            messageDiv.remove();
            messageInput.value = mensaje;
            messageInput.focus();
        };
        messageDiv.appendChild(retryBtn);
    }
}

    // Actualizar un chat en la lista después de enviar un mensaje
    function actualizarChatEnLista(userId, mensaje) {
        const chatItem = document.querySelector(`.chat-item[data-id="${userId}"]`);
        if (chatItem) {
            const preview = chatItem.querySelector(".chat-item-preview");
            if (preview) preview.textContent = mensaje;
            const timeSpan = chatItem.querySelector(".chat-item-time");
            if (timeSpan) timeSpan.textContent = "Ahora";
            if (chatItem.parentNode.firstChild !== chatItem) {
                chatItem.parentNode.insertBefore(chatItem, chatItem.parentNode.firstChild);
            }
        }
    }

    // Marcar mensajes como leídos
    async function marcarMensajesComoLeidos() {
    const datos = {
        idUsuario: parseInt(currentUserId, 10),
        idRemitente: parseInt(currentChatUserId, 10),
    };
    try {
        const response = await fetch(`${BASE_URL}/mensaje/marcar-leidos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
            },
            body: JSON.stringify(datos),
        });
        if (!response.ok) throw new Error("Error al marcar mensajes como leídos");

        // Opcional: Actualizar la UI localmente (aunque cargarMensajesNuevos ya lo hace)
        const mensajesRecibidos = chatMessages.querySelectorAll(".message.received");
        mensajesRecibidos.forEach(msg => {
            msg.dataset.estatus = "1";
        });
    } catch (error) {
        console.error("Error al marcar mensajes como leídos:", error);
    }
}

    // Buscar chats
    function buscarChats() {
        const searchTerm = chatSearchInput.value.toLowerCase();
        document.querySelectorAll(".chat-item").forEach((item) => {
            const userName = item.querySelector(".chat-item-name").textContent.toLowerCase();
            const lastMessage = item.querySelector(".chat-item-preview").textContent.toLowerCase();
            item.style.display = (userName.includes(searchTerm) || lastMessage.includes(searchTerm)) ? "flex" : "none";
        });
    }

    // Filtrar chats por pestaña
    function filtrarChatsPorTab(tab) {
        document.querySelectorAll(".chat-item").forEach((item) => {
            switch (tab) {
                case "unread": item.style.display = item.getAttribute("data-unread") === "true" ? "flex" : "none"; break;
                case "favorites": item.style.display = "flex"; break; // Implementar favoritos después
                default: item.style.display = "flex"; break;
            }
        });
    }

    // Mostrar/ocultar menú de opciones de chat
    function toggleChatOptionsMenu() {
        if (!chatOptionsMenuVisible) {
            const rect = document.getElementById("moreOptionsBtn").getBoundingClientRect();
            chatOptionsMenu.style.top = `${rect.bottom + 5}px`;
            chatOptionsMenu.style.right = `${window.innerWidth - rect.right}px`;
            chatOptionsMenu.style.display = "block";
            chatOptionsMenuVisible = true;
        } else {
            chatOptionsMenu.style.display = "none";
            chatOptionsMenuVisible = false;
        }
    }

    // Bloquear usuario
    async function bloquearUsuario() {
        if (!currentChatUserId) return;
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
                    });
                    if (!response.ok) throw new Error("Error al bloquear al usuario");
                    Swal.fire("Usuario bloqueado", `Has bloqueado a ${currentChatUserName}`, "success");
                    const chatItem = document.querySelector(`.chat-item[data-id="${currentChatUserId}"]`);
                    if (chatItem) chatItem.remove();
                    activeConversation.style.display = "none";
                    emptyConversation.style.display = "flex";
                    currentChatUserId = null;
                    currentChatUserName = null;
                } catch (error) {
                    console.error("Error al bloquear al usuario:", error);
                    Swal.fire("Error", "No se pudo bloquear al usuario. Por favor, intenta de nuevo más tarde.", "error");
                }
            }
            chatOptionsMenu.style.display = "none";
            chatOptionsMenuVisible = false;
        });
    }

    // Reportar usuario
    function reportarUsuario() {
        if (!currentChatUserId) return;
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
                const reason = document.getElementById("report-reason").value;
                const description = document.getElementById("report-description").value;
                if (!description) {
                    Swal.showValidationMessage("Por favor, describe el problema");
                    return false;
                }
                return { reason, description };
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
                            estatus: 0,
                        }),
                    });
                    if (!response.ok) throw new Error("Error al reportar al usuario");
                    Swal.fire("Usuario reportado", "Tu reporte ha sido enviado y será revisado por nuestro equipo.", "success");
                } catch (error) {
                    console.error("Error al reportar al usuario:", error);
                    Swal.fire("Error", "No se pudo enviar el reporte. Por favor, intenta de nuevo más tarde.", "error");
                }
            }
            chatOptionsMenu.style.display = "none";
            chatOptionsMenuVisible = false;
        });
    }

    // Limpiar conversación
    function limpiarConversacion() {
        if (!currentChatUserId) return;
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
                    });
                    if (!response.ok) throw new Error("Error al limpiar la conversación");
                    chatMessages.innerHTML = `
                        <div class="empty-messages">
                            <p>No hay mensajes aún</p>
                            <p>¡Sé el primero en escribir!</p>
                        </div>
                    `;
                    const chatItem = document.querySelector(`.chat-item[data-id="${currentChatUserId}"]`);
                    if (chatItem) {
                        const preview = chatItem.querySelector(".chat-item-preview");
                        if (preview) preview.textContent = "Sin mensajes";
                    }
                    Swal.fire("Conversación limpiada", "Todos los mensajes han sido eliminados.", "success");
                } catch (error) {
                    console.error("Error al limpiar la conversación:", error);
                    Swal.fire("Error", "No se pudo limpiar la conversación. Por favor, intenta de nuevo más tarde.", "error");
                }
            }
            chatOptionsMenu.style.display = "none";
            chatOptionsMenuVisible = false;
        });
    }

    // Obtener ID del usuario actual
    async function obtenerIdUsuario() {
        const email = localStorage.getItem("correo");
        if (!email) return null;
        try {
            const response = await fetch(`${BASE_URL}/usuario/obtener-id?email=${email}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
                },
            });
            if (!response.ok) throw new Error("Error al obtener el ID de usuario");
            const data = await response.json();
            return data.idUsuario;
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    }

    // Función para abrir modales por ID
    function openModalById(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = "block";
            document.body.classList.add("modal-open");
        }
    }

    // Función para cerrar modales por ID
    function closeModalById(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = "none";
            document.body.classList.remove("modal-open");
        }
    }

    // Generar estrellas según la calificación
    function generarEstrellas(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        let starsHTML = "";
        for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
        if (halfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star"></i>';
        return starsHTML;
    }

    // Cargar mensajes nuevos (movido aquí)
    async function cargarMensajesNuevos() {
    try {
        const response = await fetch(`${BASE_URL}/mensaje/conversacion/${currentUserId}/${currentChatUserId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("lastToken")}`,
            },
        });
        if (!response.ok) throw new Error("Error al cargar mensajes nuevos");
        const mensajes = await response.json();

        const existingMessages = chatMessages.querySelectorAll(".message");
        const existingMessageIds = new Set(Array.from(existingMessages).map(msg => msg.dataset.idMensaje));

        // Lista para almacenar mensajes nuevos recibidos
        const nuevosMensajesRecibidos = [];

        mensajes.forEach((mensaje) => {
            const messageDiv = chatMessages.querySelector(`.message[data-id-mensaje="${mensaje.idMensaje}"]`);
            if (messageDiv) {
                // Actualizar estado de mensajes existentes (para el remitente)
                if (mensaje.idRemitente == currentUserId) {
                    const statusSpan = messageDiv.querySelector(".message-status");
                    if (statusSpan) {
                        statusSpan.textContent = mensaje.estatus === 0 ? "Enviado" : "Leído";
                    }
                }
            } else {
                // Agregar mensajes nuevos
                const newMessageDiv = document.createElement("div");
                newMessageDiv.className = mensaje.idRemitente == currentUserId ? "message sent" : "message received";
                newMessageDiv.dataset.idMensaje = mensaje.idMensaje;
                const fecha = new Date(mensaje.fechaEnvio);
                const hora = fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
                let estadoMensaje = "";
                if (mensaje.idRemitente == currentUserId) {
                    estadoMensaje = mensaje.estatus === 0 
                        ? '<span class="message-status">Enviado</span>' 
                        : '<span class="message-status">Leído</span>';
                }
                newMessageDiv.innerHTML = `
                    ${mensaje.contenido}
                    <div class="message-time">${hora}</div>
                    ${estadoMensaje}
                `;
                chatMessages.appendChild(newMessageDiv);

                const fechaStr = fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
                if (!chatMessages.querySelector(`.chat-date-divider[data-fecha="${fechaStr}"]`)) {
                    const hoy = new Date();
                    const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
                    const fechaLabel = fechaStr === hoy.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) ? "Hoy" :
                                      fechaStr === ayer.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) ? "Ayer" : fechaStr;
                    const dateDivider = document.createElement("div");
                    dateDivider.className = "chat-date-divider";
                    dateDivider.dataset.fecha = fechaStr;
                    dateDivider.textContent = fechaLabel;
                    chatMessages.insertBefore(dateDivider, newMessageDiv);
                }

                // Si es un mensaje recibido y no estaba antes, agregarlo a la lista para marcar como leído
                if (mensaje.idDestinatario == currentUserId && mensaje.idRemitente == currentChatUserId) {
                    nuevosMensajesRecibidos.push(mensaje);
                }
            }
        });

        // Marcar como leídos los mensajes nuevos recibidos
        if (nuevosMensajesRecibidos.length > 0) {
            await marcarMensajesComoLeidos();
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error("Error al cargar mensajes nuevos:", error);
    }
}
});