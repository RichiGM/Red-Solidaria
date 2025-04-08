document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "http://localhost:8080/RedSolidaria/api";
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const saveButton = document.querySelector(".btn");

  saveButton.addEventListener("click", async () => {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    // Validar la fortaleza de la contraseña (puedes agregar más validaciones)
    if (newPassword.length < 8) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }

    try {
      // Enviar solicitud para restablecer la contraseña
      const response = await fetch(`${BASE_URL}/usuario/restablecer-contrasenia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: localStorage.getItem("correo"), // Obtener el correo del localStorage
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Contraseña restablecida",
          text: "Tu contraseña ha sido restablecida correctamente.",
        }).then(() => {
          // Redirigir a la página de inicio de sesión
          window.location.href = "index.html";
        });
      } else {
        // Mostrar mensaje de error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo restablecer la contraseña. Por favor, intenta de nuevo más tarde.",
        });
      }
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al restablecer la contraseña. Por favor, intenta de nuevo más tarde.",
      });
    }
  });
});