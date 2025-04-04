document.addEventListener("DOMContentLoaded", () => {
  // Funcionalidad para abrir/cerrar modales
  function openModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.add("active")
      document.body.style.overflow = "hidden"
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = ""
    }
  }

  // Asignar eventos a botones de modales
  const contactBtn = document.querySelector(".contact-btn")
  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      openModal("contactModal")
    })
  }

  // Cerrar modales al hacer clic en la X o fuera del modal
  const closeButtons = document.querySelectorAll(".close")
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modalId = this.closest(".modal").id
      closeModal(modalId)
    })
  })

  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target.id)
    }
  })

  // Filtros de servicios
  const filterBtns = document.querySelectorAll(".filter-btn")
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      filterBtns.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
      // Aquí se podría implementar la lógica de filtrado real
    })
  })

  // Exponer funciones al ámbito global
  window.openModal = openModal
  window.closeModal = closeModal
})

