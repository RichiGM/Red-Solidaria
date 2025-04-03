// chat.js
const BASE_URL = "http://localhost:8080/RedSolidaria/api";

let currentChatUser = null;

// Cargar lista de chats
function loadChats() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;

    fetch(`${BASE_URL}/mensaje/chats/${usuario.idUsuario}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(chats => {
            const chatList = document.getElementById("chatList");
            if (chatList) {
                chatList.innerHTML = "";
                chats.forEach(chat => {
                    const chatItem = document.createElement("div");
                    chatItem.className = "chat-item";
                    chatItem.onclick = () => openChat(chat.idUsuario, chat.nombre);
                    chatItem.innerHTML = `
                        <img src="${chat.foto || 'img/usuario.jpg'}" alt="Usuario" class="user-avatar">
                        <div class="chat-details">
                            <p class="user-name">${chat.nombre}</p>
                            <p class="last-message">${chat.ultimoMensaje || 'Sin mensajes'}</p>
                        </div>
                        <span class="chat-time">${chat.fechaUltimoMensaje || ''}</span>
                        <div class="chat-actions">
                            <button class="block-btn">Bloquear</button>
                            <button class="report-btn">Reportar</button>
                        </div>
                    `;
                    chatList.appendChild(chatItem);
                });
            }
        })
        .catch(error => {
            console.error("Error al cargar chats:", error);
        });
}

// Abrir un chat
function openChat(userId, userName) {
    currentChatUser = { id: userId, name: userName };
    document.getElementById("chatUserName").textContent = userName;
    document.getElementById("chatWindow").style.display = "block";
    loadMessages(userId);
}

// Cargar mensajes de un chat
function loadMessages(userId) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;

    fetch(`${BASE_URL}/mensaje/conversacion/${usuario.idUsuario}/${userId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(mensajes => {
            const chatMessages = document.getElementById("chatMessages");
            if (chatMessages) {
                chatMessages.innerHTML = "";
                mensajes.forEach(mensaje => {
                    const messageDiv = document.createElement("div");
                    messageDiv.className = mensaje.idRemitente === usuario.idUsuario ? "message sent" : "message received";
                    messageDiv.textContent = mensaje.contenido;
                    chatMessages.appendChild(messageDiv);
                });
            }
        })
        .catch(error => {
            console.error("Error al cargar mensajes:", error);
        });
}

// Enviar mensaje
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;
    if (!message || !currentChatUser) return;

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const mensaje = {
        contenido: message,
        idTipoContenido: 1,
        fechaEnvio: new Date().toISOString().split("T")[0],
        idEstatus: 0,
        idRemitente: usuario.idUsuario,
        idDestinatario: currentChatUser.id,
    };

    fetch(`${BASE_URL}/mensaje/enviar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(mensaje),
    })
        .then(response => response.json())
        .then(data => {
            const chatMessages = document.getElementById("chatMessages");
            const messageDiv = document.createElement("div");
            messageDiv.className = "message sent";
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
            messageInput.value = "";
        })
        .catch(error => {
            console.error("Error al enviar mensaje:", error);
            alert("Error al enviar mensaje");
        });
}

// Cargar chats al abrir el modal de chat
const chatModal = document.getElementById("chatModal");
if (chatModal) {
    chatModal.addEventListener("click", loadChats);
}