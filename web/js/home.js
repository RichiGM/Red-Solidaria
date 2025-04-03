// script.js

// Función para abrir el modal de servicio
function openServiceModal() {
    const modal = document.getElementById("serviceModal");
    if (modal) {
        modal.style.display = "flex"; // Usamos flex para centrar el modal
        modal.classList.add("modal-open"); // Agregamos clase para animaciones (si aplica)
    }
}

// Función para cerrar el modal
function closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove("modal-open");
    }
}

// Evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    const publishServiceBtn = document.querySelector(".publish-service-btn");
    
    // Agregar evento de clic para abrir el modal de servicio
    if (publishServiceBtn) {
        publishServiceBtn.addEventListener("click", openServiceModal);
    }
});