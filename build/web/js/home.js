
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