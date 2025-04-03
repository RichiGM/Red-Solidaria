const BASE_URL = "http://localhost:8080/RedSolidaria/api";


// Función para manejar el login
function handleLogin(e) {
    e.preventDefault();
    const loginEmail = document.getElementById("loginEmail").value;
    const loginContrasenia = document.getElementById("loginContrasenia").value;

    // Validar al usuario
    fetch(`${BASE_URL}/login/validate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loginEmail, password: loginContrasenia })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Verificar el usuario
            return fetch(`${BASE_URL}/login/check?email=${loginEmail}`);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Credenciales incorrectas',
            });
            throw new Error('Credenciales incorrectas');
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
            // Almacenar el correo y el token en localStorage
            localStorage.setItem("correo", loginEmail);
            localStorage.setItem("lastToken", data.token);
            localStorage.setItem("username", data.username);


            // Mostrar éxito
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Inicio de sesión exitoso',
            }).then(() => {
                // Redirigir a home.html después de que el usuario cierre la alerta
                window.location.href = "home.html";
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se encontró un token',
            });
        }
    })
    .catch(error => {
        console.error("Error al iniciar sesión:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al iniciar sesión',
        });
    });
}

// Evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.removeEventListener("submit", handleLogin); // Eliminar cualquier evento anterior
        loginForm.addEventListener("submit", handleLogin);
    }
});

