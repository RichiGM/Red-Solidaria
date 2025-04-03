// Cargar estados al iniciar
document.addEventListener('DOMContentLoaded', cargarEstados);

// Evento para cargar ciudades cuando cambia el estado
document.getElementById('state').addEventListener('change', cargarCiudades);

// Evento para registrar usuario
document.getElementById('btnRegistrar').addEventListener('click', registrarUsuario);

async function cargarEstados() {
    try {
        const response = await fetch('http://localhost:8080/RedSolidaria/api/ubicacion/estados');
        const estados = await response.json();
        const selectEstado = document.getElementById('state');
        estados.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado.idEstado;
            option.textContent = estado.nombre;
            selectEstado.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar estados:', error);
    }
}

async function cargarCiudades() {
    const idEstado = document.getElementById('state').value;
    const selectCiudad = document.getElementById('city');
    selectCiudad.innerHTML = '<option value="">Seleccione una ciudad</option>';

    if (idEstado) {
        try {
            const response = await fetch(`http://localhost:8080/RedSolidaria/api/ubicacion/ciudades/${idEstado}`);
            const ciudades = await response.json();
            ciudades.forEach(ciudad => {
                const option = document.createElement('option');
                option.value = ciudad.idCiudad;
                option.textContent = ciudad.nombre;
                selectCiudad.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar ciudades:', error);
        }
    }
}

function validarContrasenia(contrasenia) {
    if (!contrasenia.trim()) {
        return false; // Retorna falso si la contraseña está vacía o solo tiene espacios
    }
    const tieneLongitud = contrasenia.length >= 12;
    const tieneMayuscula = /[A-Z]/.test(contrasenia);
    const tieneNumero = /[0-9]/.test(contrasenia);
    const tieneEspecial = /[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(contrasenia);
    return tieneLongitud && tieneMayuscula && tieneNumero && tieneEspecial;
}

function contieneMalasPalabras(texto) {
    const malasPalabras = [
        // Lista de malas palabras
    ];
    return malasPalabras.some((palabra) => texto.toLowerCase().includes(palabra));
}

function validarNombreApellido(nombre) {
    const tieneNumero = /[0-9]/.test(nombre);
    return !tieneNumero; // Retorna verdadero si no hay números
}

function validarUbicacion(estado, ciudad) {
    return estado && ciudad; // Retorna verdadero si ambos campos están seleccionados
}

function mostrarError(campo, mensaje) {
    // Limpiar mensajes de error previos
    const errorElemento = campo.parentElement.querySelector('.error');
    if (errorElemento) {
        errorElemento.textContent = mensaje;
    } else {
        const nuevoError = document.createElement('div');
        nuevoError.className = 'error';
        nuevoError.textContent = `⚠️ ${mensaje}`;
        campo.parentElement.appendChild(nuevoError);
    }
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar el formato del correo electrónico
    return regex.test(email);
}
async function verificarEmail(email) {
    const response = await fetch(`http://localhost:8080/RedSolidaria/api/usuario/verificar-email?email=${email}`);
    if (!response.ok) {
        // Si la respuesta no es OK, lanza un error con el mensaje correspondiente
        const errorData = await response.text(); // Cambia a response.json() si el servidor devuelve un JSON
        throw new Error(errorData || 'El correo electrónico ya está registrado.');
    }
}

async function registrarUsuario() {
    const contrasenia = document.getElementById('contrasenia').value;
    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const email = document.getElementById('email').value;
    const estado = document.getElementById('state').value;
    const ciudad = document.getElementById('city').value;
    const preferenciasEmail = document.getElementById('preferenciasEmail').checked;
    let esValido = true;

    // Limpiar mensajes de error previos
    document.querySelectorAll('.error').forEach(error => error.remove());

    // Validar nombre
    if (!nombre.trim()) {
        mostrarError(document.getElementById('nombre'), 'El nombre es obligatorio.');
        esValido = false;
    }

    // Validar apellidos
    if (!apellidos.trim()) {
        mostrarError(document.getElementById('apellidos'), 'Los apellidos son obligatorios.');
        esValido = false;
    }

    // Validar correo electrónico
    if (!validarEmail(email)) {
        mostrarError(document.getElementById('email'), 'El correo electrónico no es válido.');
        esValido = false;
    } else {
        try {
            await verificarEmail(email);
        } catch (error) {
            mostrarError(document.getElementById('email'), error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message // Muestra el mensaje de error aquí
            });
            esValido = false;
        }
    }

    // Validar contraseña
    if (!validarContrasenia(contrasenia)) {
        mostrarError(document.getElementById('contrasenia'), 'La contraseña debe tener al menos 12 caracteres, una mayúscula, un número y un carácter especial.');
        esValido = false;
    }

    // Validar ubicación
    if (!validarUbicacion(estado, ciudad)) {
        mostrarError(document.getElementById('state'), 'La ubicación es obligatoria.');
        esValido = false;
    }

    if (esValido) {
        const usuario = {
            nombre: nombre,
            apellidos: apellidos,
            correo: email,
            contrasenia: contrasenia,
            ciudad: { idCiudad: ciudad },
            preferenciasEmail: preferenciasEmail
        };

        try {
            const response = await fetch('http://localhost:8080/RedSolidaria/api/usuario/registrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuario)
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Registro exitoso',
                    text: 'Tu cuenta ha sido registrada con éxito.'
                });
                console.log(usuario);
                
                
            } else {
                const data = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: ' Error',
                    text: data.message || 'Ocurrió un error al registrar el usuario.'
                });
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al registrar el usuario.'
            });
        }
    }
}