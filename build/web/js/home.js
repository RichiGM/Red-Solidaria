// modal.js
const BASE_URL = "http://localhost:8080/RedSolidaria/api";

// Funciones específicas para el modal de login
function openModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.style.display = "flex"; // Usamos flex para centrar el modal
        modal.classList.add("modal-open"); // Agregamos clase para animaciones (si aplica)
    }
}

function closeModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("modal-open");
    }
}

// Funciones genéricas para abrir y cerrar modales
function openModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("modal-open");
    }
}

function closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("modal-open");
    }
}

// Función para manejar el login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(`${BASE_URL}/usuario/login?correo=${email}&contrasena=${password}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.idUsuario) {
                localStorage.setItem("usuario", JSON.stringify(data));
                closeModal();
                window.location.href = "principal.html";
            } else {
                alert("Credenciales incorrectas");
            }
        })
        .catch(error => {
            console.error("Error al iniciar sesión:", error);
            alert("Error al iniciar sesión");
        });
}

// Función para manejar el registro de un nuevo usuario
function handleRegistro(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const country = document.getElementById("country").value;
    const state = document.getElementById("state").value;

    const usuario = {
        nombre: username,
        apellidos: "",
        correo: email,
        contrasena: password,
        idCiudad: parseInt(state),
        configuracionPrivacidad: "publico",
        preferenciasEmail: false,
        idTipoUsuario: 1, // Tipo de usuario regular
    };

    fetch(`${BASE_URL}/usuario/registrar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
    })
        .then(response => response.json())
        .then(data => {
            alert(data);
            window.location.href = "registrado.html";
        })
        .catch(error => {
            console.error("Error al registrar usuario:", error);
            alert("Error al registrar usuario");
        });
}

// Único evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    // Elementos del DOM
    const notificationsBtn = document.getElementById("notificationsBtn");
    const notificationsMenu = document.getElementById("notificationsDropdown");
    const userBtn = document.getElementById("userBtn");
    const username = document.querySelector(".username");
    const userDropdown = document.getElementById("userDropdown");
    const settingsBtn = document.getElementById("settings-btn");
    const editBtn = document.getElementById("edit-btn");
    const profileBtn = document.getElementById("profile-btn");
    const serviceBtn = document.querySelector(".action-btn");
    const statsBtn = document.querySelector(".stats-btn");
    const editIcon = document.querySelector(".edit-icon");
    const logoLink = document.querySelector(".logo-link");
    const verPerfil = document.querySelector("#verPerfil");
    const logoutBtn = document.querySelector(".logout-btn");
    const loginBtn = document.querySelector(".login-btn");
    const chatBtn = document.querySelector(".chat-btn");
    const publishBtn = document.querySelector(".publish-service-btn");

    // Intentar obtener los enlaces del menú de usuario
    let transactionsLink = document.getElementById("transactionsLink") || document.querySelector('.user-menu li a[href="#"]:nth-child(2)');
    let bankLink = document.getElementById("bankLink") || document.querySelector('.user-menu li a[href="#"]:nth-child(1)');
    let reportsLink = document.getElementById("reportsLink") || document.querySelector('.user-menu li a[href="#"]:nth-child(3)');

    // Cargar datos del usuario al iniciar la página
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario) {
        const usernameHeader = document.getElementById("usernameHeader");
        const userName = document.getElementById("userName");
        const userEmail = document.getElementById("userEmail");
        const userPhoto = document.getElementById("userPhoto");
        if (usernameHeader) usernameHeader.textContent = usuario.nombre;
        if (userName) userName.textContent = usuario.nombre;
        if (userEmail) userEmail.textContent = usuario.correo;
        if (userPhoto && usuario.foto) userPhoto.src = usuario.foto;
    }

    // Agregar evento de clic para abrir el modal de login
    if (loginBtn) {
        loginBtn.addEventListener("click", openModal);
    }

    // Agregar evento de submit para el formulario de login
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    // Agregar evento de submit para el formulario de registro
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegistro);
    }

    // Función para cerrar todos los menús/dropdowns
    function closeAllMenus() {
        if (notificationsMenu) notificationsMenu.style.display = "none";
        if (userDropdown) userDropdown.classList.remove("active");
    }

    // Redirecciones
    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => (window.location.href = "usuario/Cuenta.html"));
    }

    if (editBtn) {
        editBtn.addEventListener("click", () => (window.location.href = "principal.html"));
    }

    if (profileBtn) {
        profileBtn.addEventListener("click", () => (window.location.href = "perfil.html"));
    }

    if (logoLink) {
        logoLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "principal.html";
        });
    }

    if (verPerfil) {
        verPerfil.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "Perfil.html";
        });
    }

    // Manejar el menú de notificaciones
    if (notificationsBtn && notificationsMenu) {
        notificationsBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            notificationsMenu.style.display = notificationsMenu.style.display === "block" ? "none" : "block";
            if (notificationsMenu.style.display === "block") {
                loadNotifications();
            }
        });
    }

    // Manejar el dropdown de usuario
    if (userBtn && userDropdown) {
        userBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            userDropdown.classList.toggle("active");
        });
    }

    if (username && userDropdown && userBtn) {
        username.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            userBtn.click(); // Simula clic en userBtn
        });
    }

    // Cerrar menús al hacer clic fuera
    document.addEventListener("click", (e) => {
        if (
            notificationsBtn &&
            notificationsMenu &&
            !notificationsBtn.contains(e.target) &&
            !notificationsMenu.contains(e.target)
        ) {
            notificationsMenu.style.display = "none";
        }
        if (
            userBtn &&
            userDropdown &&
            !userBtn.contains(e.target) &&
            !userDropdown.contains(e.target) &&
            (!username || !username.contains(e.target))
        ) {
            userDropdown.classList.remove("active");
        }
    });

    // Evitar que clics dentro de menús cierren el dropdown
    if (notificationsMenu) {
        notificationsMenu.addEventListener("click", (event) => event.stopPropagation());
    }
    if (userDropdown) {
        userDropdown.addEventListener("click", (event) => event.stopPropagation());
    }

    // Cerrar modales con botones de cerrar (close-btn)
    document.querySelectorAll(".close-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const modal = button.closest(".modal");
            if (modal) closeModalById(modal.id);
        });
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener("click", (event) => {
        document.querySelectorAll(".modal").forEach((modal) => {
            if (event.target === modal) closeModalById(modal.id);
        });
    });

    // Abrir modales específicos
    if (serviceBtn) {
        serviceBtn.addEventListener("click", () => openModalById("serviceModal"));
    }

    if (editIcon) {
        editIcon.addEventListener("click", () => openModalById("serviceModal"));
    }

    if (statsBtn) {
        statsBtn.addEventListener("click", () => openModalById("statsModal"));
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => openModalById("logoutConfirm"));
    }

    if (transactionsLink) {
        transactionsLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModalById("transactionsModal");
            console.log("Clic en Transacciones detectado, abriendo modal...");
        });
    }

    if (bankLink) {
        bankLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModalById("bankModal");
            console.log("Clic en Banco Solidario detectado, abriendo modal...");
        });
    }

    if (reportsLink) {
        reportsLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModalById("reportsModal");
            console.log("Clic en Reportes y Denuncias detectado, abriendo modal...");
        });
    }

    if (chatBtn) {
        chatBtn.addEventListener("click", () => openModalById("chatModal"));
    }

    if (publishBtn) {
        publishBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModalById("serviceModal");
        });
    }

    // Funciones para manejar cerrar sesión
    window.showLogoutConfirm = () => openModalById("logoutConfirm");
    window.closeLogoutConfirm = () => closeModalById("logoutConfirm");
    window.logout = () => {
        localStorage.removeItem("usuario");
        closeLogoutConfirm();
        openModalById("logoutMessage");
    };
    window.closeLogoutMessage = () => {
        closeModalById("logoutMessage");
        window.location.href = "index.html";
    };

    // Manejar submit del formulario de servicio
    const serviceForm = document.getElementById("serviceForm");
    if (serviceForm) {
        serviceForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            if (!usuario) {
                alert("Debes iniciar sesión para publicar un servicio");
                return;
            }

            const servicio = {
                titulo: document.getElementById("serviceTitle").value,
                descripcion: document.getElementById("serviceDescription").value,
                modalidad: document.getElementById("serviceType").value === "virtual" ? 2 : 1,
                estatus: 1,
                idUsuario: usuario.idUsuario,
            };

            fetch(`${BASE_URL}/servicio/publicar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(servicio),
            })
                .then(response => response.json())
                .then(data => {
                    alert(data);
                    closeModalById("serviceModal");
                    closeModalById("serviceModalpublic");
                })
                .catch(error => {
                    console.error("Error al publicar servicio:", error);
                    alert("Error al publicar servicio");
                });
        });
    }

    // Manejar el envío del formulario de reportes
    const reportForm = document.getElementById("reportForm");
    if (reportForm) {
        reportForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const usuario = JSON.parse(localStorage.getItem("usuario"));
            if (!usuario) {
                alert("Debes iniciar sesión para reportar una denuncia");
                return;
            }

            const denuncia = {
                motivo: document.getElementById("reportReason").value,
                descripcion: document.getElementById("reportReason").value,
                idUsuarioDenunciante: usuario.idUsuario,
                idUsuarioReportado: parseInt(document.getElementById("reportUser").value),
                estatus: 0,
            };

            fetch(`${BASE_URL}/denuncia/reportar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(denuncia),
            })
                .then(response => response.json())
                .then(data => {
                    alert(data);
                    reportForm.reset();
                    closeModalById("reportsModal");
                })
                .catch(error => {
                    console.error("Error al reportar denuncia:", error);
                    alert("Error al reportar denuncia");
                });
        });
    }

    // Cargar notificaciones
    function loadNotifications() {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        if (!usuario) return;

        fetch(`${BASE_URL}/notificacion/usuario/${usuario.idUsuario}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(notificaciones => {
                const notificationsList = document.getElementById("notificationsList");
                if (notificationsList) {
                    notificationsList.innerHTML = "";
                    notificaciones.forEach(notificacion => {
                        const notificationDiv = document.createElement("div");
                        notificationDiv.className = "notification";
                        notificationDiv.innerHTML = `
                            <button class="close-btn">×</button>
                            <p><strong>${notificacion.tipo}</strong></p>
                            <p class="subtext">${notificacion.contenido}</p>
                            <div class="notification-actions">
                                <button class="btn">Aceptar</button>
                                <button class="btn">Rechazar</button>
                            </div>
                        `;
                        notificationsList.appendChild(notificationDiv);
                    });
                }
            })
            .catch(error => {
                console.error("Error al cargar notificaciones:", error);
            });
    }

    // Manejar pestañas del chat
    const tabs = document.querySelectorAll(".tab");
    const chatList = document.querySelector(".chat-list");
    const chatWindow = document.querySelector(".chat-window");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            const tabContent = tab.getAttribute("data-tab");
            console.log(`Cambiando a pestaña: ${tabContent}`);
            // Aquí puedes agregar lógica para filtrar chats según la pestaña (todos, no leídos, favoritos)
        });
    });

    // Abrir ventana de chat al hacer clic en un chat-item
    let currentChatUser = null;
    const chatItems = document.querySelectorAll(".chat-item");
    chatItems.forEach(item => {
        item.addEventListener("click", () => {
            if (chatList) chatList.style.display = "none";
            if (chatWindow) chatWindow.style.display = "flex";
            const userId = item.getAttribute("data-user-id");
            const userName = item.getAttribute("data-user");
            currentChatUser = { id: userId, name: userName };
            document.querySelector(".chat-user-details .user-name").textContent = userName;
            loadMessages(userId);
        });
    });

    // Cerrar ventana de chat y volver a la lista
    const closeChat = document.querySelector(".chat-header-user .close-btn");
    if (closeChat) {
        closeChat.addEventListener("click", () => {
            if (chatWindow) chatWindow.style.display = "none";
            if (chatList) chatList.style.display = "block";
        });
    }

    // Enviar mensaje
    const sendBtn = document.querySelector(".send-btn");
    const messageInput = document.querySelector(".message-input");
    const chatMessages = document.querySelector(".chat-messages");
    if (sendBtn && messageInput) {
        sendBtn.addEventListener("click", () => {
            const messageText = messageInput.value.trim();
            if (messageText && currentChatUser) {
                const usuario = JSON.parse(localStorage.getItem("usuario"));
                const mensaje = {
                    contenido: messageText,
                    tipoContenido: 1,
                    fechaEnvio: new Date().toISOString().split("T")[0],
                    estatus: 0,
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
                        const messageDiv = document.createElement("div");
                        messageDiv.className = "message sent";
                        messageDiv.textContent = messageText;
                        chatMessages.appendChild(messageDiv);
                        messageInput.value = "";
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    })
                    .catch(error => {
                        console.error("Error al enviar mensaje:", error);
                        alert("Error al enviar mensaje");
                    });
            }
        });

        messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendBtn.click();
            }
        });
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
                if (chatMessages) {
                    chatMessages.innerHTML = "";
                    mensajes.forEach(mensaje => {
                        const messageDiv = document.createElement("div");
                        messageDiv.className = mensaje.idRemitente === usuario.idUsuario ? "message sent" : "message received";
                        messageDiv.textContent = mensaje.contenido;
                        chatMessages.appendChild(messageDiv);
                    });
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            })
            .catch(error => {
                console.error("Error al cargar mensajes:", error);
            });
    }

    // Bloquear y reportar usuarios
    document.querySelectorAll(".block-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const userName = btn.closest(".chat-item").getAttribute("data-user");
            console.log(`Usuario ${userName} bloqueado`);
            // Aquí puedes agregar lógica para bloquear al usuario
        });
    });

    document.querySelectorAll(".report-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const userName = btn.closest(".chat-item").getAttribute("data-user");
            console.log(`Reporte enviado para ${userName}`);
            // Aquí puedes agregar lógica para reportar al usuario
        });
    });
});