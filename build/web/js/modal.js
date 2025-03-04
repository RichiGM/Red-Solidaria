// Funciones específicas para el modal de login
function openModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.style.display = "flex"; // Cambiado a 'flex' para centrar
}

function closeModal() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.style.display = "none";
}

// Funciones genéricas para abrir y cerrar modales
function openModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "flex"; // Cambiado a 'flex' para centrar
}

function closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none"; // Oculta el modal
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
    const loginBtn = document.querySelector(".login-btn"); // Agregado
    const chatBtn = document.querySelector(".chat-btn");

    // Intentar obtener el enlace de transacciones por ID, o usar un selector de respaldo
    let transactionsLink = document.getElementById("transactionsLink");
    if (!transactionsLink) {
        transactionsLink = document.querySelector('.user-menu li a[href="#"]:nth-child(2)');
    }

    // Intentar obtener el enlace de Banco Solidario por ID, o usar un selector de respaldo
    let bankLink = document.getElementById("bankLink");
    if (!bankLink) {
        bankLink = document.querySelector('.user-menu li a[href="#"]:nth-child(1)');
    }

    // Intentar obtener el enlace de Reportes y Denuncias por ID, o usar un selector de respaldo
    let reportsLink = document.getElementById("reportsLink");
    if (!reportsLink) {
        reportsLink = document.querySelector('.user-menu li a[href="#"]:nth-child(3)');
    }

    // Agregar evento de clic para abrir el modal
    if (loginBtn) {
        loginBtn.addEventListener("click", openModal);
    }

    // Función para cerrar todos los menús/dropdowns
    function closeAllMenus() {
        if (notificationsMenu) notificationsMenu.style.display = "none";
        if (userDropdown) userDropdown.classList.remove("active");
    }

    // Redirecciones
    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => (window.location.href = "Cuenta.html"));
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
            notificationsMenu.style.display =
                notificationsMenu.style.display === "block" ? "none" : "block";
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

    // Cerrar modales con la "X" o al hacer clic fuera
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

    if (transactionsLink) { // Manejar el clic en el enlace de transacciones
        transactionsLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModalById("transactionsModal");
            console.log("Clic en Transacciones detectado, abriendo modal...");
        });
    }

    if (bankLink) { // Manejar el clic en el enlace de Banco Solidario
        bankLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModalById("bankModal");
            console.log("Clic en Banco Solidario detectado, abriendo modal...");
        });
    }

    if (reportsLink) { // Manejar el clic en el enlace de Reportes y Denuncias
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

    // Funciones para manejar cerrar sesión
    window.showLogoutConfirm = () => openModalById("logoutConfirm");
    window.closeLogoutConfirm = () => closeModalById("logoutConfirm");
    window.logout = () => {
        closeLogoutConfirm();
        openModalById("logoutMessage");
    };
    window.closeLogoutMessage = () => {
        closeModalById("logoutMessage");
        window.location.href = "index.html"; // Redirigir al login
    };
    
    // Añadir esto dentro del evento DOMContentLoaded
    const publishBtn = document.querySelector(".publish-service-btn");
    if (publishBtn) {
        publishBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openModalById("serviceModal");
        });
    }

    // Manejar submit del formulario
    document.getElementById("serviceForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        // Aquí iría la lógica para guardar el servicio
        closeModalById("serviceModal");
    });

    // Manejar el envío del formulario de reportes
    document.getElementById("reportForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const reason = document.getElementById("reportReason").value;
        const user = document.getElementById("reportUser").value;
        
        // Aquí puedes agregar la lógica para enviar el reporte/denuncia (por ejemplo, a una API o mostrar un mensaje)
        console.log("Reporte enviado:", { reason, user });
        
        // Opcional: limpiar el formulario y cerrar el modal
        document.getElementById("reportForm").reset();
        closeModalById("reportsModal");
    });

    // Manejar pestañas del chat
    const tabs = document.querySelectorAll(".tab");
    const chatList = document.querySelector(".chat-list");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            const tabContent = tab.getAttribute("data-tab");
            // Aquí puedes filtrar la lista de chats según la pestaña (todos, no leídos, favoritos)
            console.log(`Cambiando a pestaña: ${tabContent}`);
        });
    });

    // Abrir ventana de chat al hacer clic en un chat-item
    const chatItems = document.querySelectorAll(".chat-item");
    const chatWindow = document.querySelector(".chat-window");
    chatItems.forEach(item => {
        item.addEventListener("click", () => {
            chatList.style.display = "none";
            chatWindow.style.display = "flex";
            const userName = item.getAttribute("data-user");
            document.querySelector(".chat-user-details .user-name").textContent = userName;
        });
    });

    // Cerrar ventana de chat y volver a la lista
    const closeChat = document.querySelector(".close-btn");
    if (closeChat) {
        closeChat.addEventListener("click", () => {
            chatWindow.style.display = "none";
            chatList.style.display = "block";
        });
    }

    // Enviar mensaje
    const sendBtn = document.querySelector(".send-btn");
    const messageInput = document.querySelector(".message-input");
    const chatMessages = document.querySelector(".chat-messages");
    if (sendBtn && messageInput) {
        sendBtn.addEventListener("click", () => {
            const messageText = messageInput.value.trim();
            if (messageText) {
                const messageDiv = document.createElement("div");
                messageDiv.classList.add("message", "sent");
                messageDiv.textContent = messageText;
                chatMessages.appendChild(messageDiv);
                messageInput.value = "";
                chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll al final
            }
        });
        messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendBtn.click();
            }
        });
    }

    // Bloquear y reportar usuarios (funcionalidad básica)
    document.querySelectorAll(".block-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const userName = btn.closest(".chat-item").getAttribute("data-user");
            console.log(`Usuario ${userName} bloqueado`);
            // Lógica para bloquear usuario
        });
    });

    document.querySelectorAll(".report-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const userName = btn.closest(".chat-item").getAttribute("data-user");
            console.log(`Reporte enviado para ${userName}`);
            // Lógica para reportar usuario
        });
    });
});