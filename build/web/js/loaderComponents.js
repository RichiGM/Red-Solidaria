function loadHeaderAndFooter() {
    // Cargar el header
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el header: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
            // Llamar a la función para registrar eventos después de cargar el header
            registerHeaderEvents();
        })
        .catch(error => console.error(error));

    // Cargar el footer
    fetch('footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el footer: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
        .catch(error => console.error(error));
}

// Función para registrar eventos del header
function registerHeaderEvents() {
    const userBtn = document.getElementById("userBtn");
    const notificationsBtn = document.getElementById("notificationsBtn");
    const userDropdown = document.getElementById("userDropdown");
    const notificationsDropdown = document.getElementById("notificationsDropdown");
    const logoutBtn = document.getElementById("logoutBtn"); // Asegúrate de que este ID coincida con tu header.html

    if (userBtn) {
        userBtn.addEventListener("click", handleUserButtonClick);
    }

    if (notificationsBtn) {
        notificationsBtn.addEventListener("click", handleNotificationsButtonClick);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async function(event) {
            event.preventDefault();
            await logout(); // Llamar a la función logout
        });
    }

    document.addEventListener('click', closeAllMenus);
}

// Función para manejar el clic en el botón de usuario
function handleUserButtonClick(event) {
    event.stopPropagation();
    const userDropdown = document.getElementById("userDropdown");
    if (userDropdown) {
        userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
    }
}

// Función para manejar el clic en el botón de notificaciones
function handleNotificationsButtonClick(event) {
    event.stopPropagation();
    const notificationsMenu = document.getElementById("notificationsDropdown");
    if (notificationsMenu) {
        notificationsMenu.style.display = notificationsMenu.style.display === "block" ? "none" : "block";
    }
}

// Cerrar menús al hacer clic fuera
function closeAllMenus(event) {
    const userDropdown = document.getElementById("userDropdown");
    const notificationsMenu = document.getElementById("notificationsDropdown");
    const userBtn = document.getElementById("userBtn");
    const notificationsBtn = document.getElementById("notificationsBtn");

    if (userDropdown && userBtn && !userDropdown.contains(event.target) && !userBtn.contains(event.target)) {
        userDropdown.style.display = "none";
    }
    
    if (notificationsMenu && notificationsBtn && !notificationsMenu.contains(event.target) && !notificationsBtn.contains(event.target)) {
        notificationsMenu.style.display = "none";
    }
}

// Función para abrir modales por ID
function openModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex";
        modal.classList.add("modal-open");
    }
}

// Función para cerrar modales por ID
function closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("modal-open");
    }
}

// Función para mostrar confirmación de cierre de sesión
function showLogoutConfirm() {
    openModalById("logoutConfirm");
}

// Función para cerrar confirmación de cierre de sesión
function closeLogoutConfirm() {
    closeModalById("logoutConfirm");
}

// Función para cerrar sesión
async function logout() {
    localStorage.removeItem("usuario");
    closeLogoutConfirm();
    openModalById("logoutMessage");

    console.log("Cerrando sesión...");

    try {
        const email = localStorage.getItem("correo"); // Usamos 'correo' como en tu proyecto actual

        if (email) {
            console.log("Iniciando logout en el servidor para:", email);

            const response = await fetch('http://localhost:8080/RedSolidaria/api/usuario/logout', {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Bearer ${localStorage.getItem('lastToken')}`
                },
                body: `email=${encodeURIComponent(email)}`
            });

            if (response.ok) {
                const result = await response.json();
                console.log("Respuesta del servidor:", result);

                if (!result.result.includes("Logout exitoso")) {
                    console.warn("El servidor respondió, pero no con éxito:", result);
                }
            } else {
                console.error("Error en la petición de logout:", response.status);
            }
        }
    } catch (error) {
        console.error("Error al realizar el logout:", error);
    } finally {
        console.log("Borrando localStorage...");
        localStorage.removeItem("correo");
        localStorage.removeItem("lastToken");

        console.log("Redirigiendo al login...");
        window.location.href = "index.html"; // Ajusta la URL según tu proyecto
    }
}

// Función para cerrar mensaje de cierre de sesión
function closeLogoutMessage() {
    closeModalById("logoutMessage");
    window.location.href = "index.html";
}

// Función para registrar eventos del menú de usuario
function registerUserMenuEvents() {
    // Lógica para registrar eventos del menú de usuario
    const usernameDisplay = document.getElementById("usernameDisplay");
    const userNameDisplay = document.getElementById("userNameDisplay");
    const userEmailDisplay = document.getElementById("userEmailDisplay");
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("correo");

    if (usernameDisplay && storedUsername) {
        userNameDisplay.textContent = storedUsername;
        usernameDisplay.textContent = `Bienvenido, ${storedUsername}`; // Mostrar el nombre de usuario
    }
    if (userEmailDisplay && storedEmail) {
        userEmailDisplay.textContent = storedEmail; // Mostrar el correo electrónico
    }
}

// Exponer funciones al ámbito global
window.showLogoutConfirm = showLogoutConfirm;
window.closeLogoutConfirm = closeLogoutConfirm;
window.logout = logout;
window.closeLogoutMessage = closeLogoutMessage;
window.openModalById = openModalById;
window.closeModalById = closeModalById;

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadHeaderAndFooter();
    
    // Registrar eventos adicionales después de un breve retraso para asegurar que los elementos estén cargados
    setTimeout(function() {
        registerUserMenuEvents();
    }, 500);
});