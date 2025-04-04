document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "http://localhost:8080/RedSolidaria/api"
  const emailInput = document.getElementById("email")
  const nextButton = document.querySelector(".btn")

  nextButton.addEventListener("click", async () => {
    const email = emailInput.value

    // Validar que el correo electrónico no esté vacío
    if (!email || email.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, ingresa tu correo electrónico.",
      })
      return
    }

    // Validar el formato del correo electrónico
    if (!isValidEmail(email)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, ingresa un correo electrónico válido.",
      })
      return
    }

    try {
      // Enviar solicitud para restablecer la contraseña
      const response = await fetch(`${BASE_URL}/usuario/solicitar-restablecimiento`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      })

      if (response.ok) {
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Correo enviado",
          text: "Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.",
        }).then(() => {
          // Redirigir a la página de inicio de sesión
          window.location.href = "index.html"
        })
      } else {
        // Mostrar mensaje de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo enviar el correo electrónico. Por favor, verifica que el correo electrónico sea correcto.",
        })
      }
    } catch (error) {
      console.error("Error al enviar la solicitud de restablecimiento:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al enviar la solicitud. Por favor, intenta de nuevo más tarde.",
      })
    }
  })

  // Función para validar el formato del correo electrónico
  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }
})

