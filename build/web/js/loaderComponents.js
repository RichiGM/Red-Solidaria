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

    if (userBtn) {
        userBtn.addEventListener("click", handleUserButtonClick);
    }

    if (notificationsBtn) {
        notificationsBtn.addEventListener("click", handleNotificationsButtonClick);
    }

    // Cerrar menús al hacer clic fuera
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

// Registrar eventos para los enlaces del menú de usuario
function registerUserMenuEvents() {
    const bankLink = document.getElementById("bankLink");
    const transactionsLink = document.getElementById("transactionsLink");
    const reportsLink = document.getElementById("reportsLink");

    if (bankLink) {
        bankLink.addEventListener("click", function(e) {
            e.preventDefault();
            openModalById("bankModal");
        });
    }

    if (transactionsLink) {
        transactionsLink.addEventListener("click", function(e) {
            e.preventDefault();
            openModalById("transactionsModal");
        });
    }

    if (reportsLink) {
        reportsLink.addEventListener("click", function(e) {
            e.preventDefault();
            openModalById("reportsModal");
        });
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
function logout() {
    localStorage.removeItem("usuario");
    closeLogoutConfirm();
    openModalById("logoutMessage");
}

// Función para cerrar mensaje de cierre de sesión
function closeLogoutMessage() {
    closeModalById("logoutMessage");
    window.location.href = "index.html";
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
