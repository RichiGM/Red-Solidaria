let cambioContraseniaActivo = false;


document.getElementById('changePasswordBtn').addEventListener('click', function() {
    document.getElementById('newPasswordContainer').style.display = 'block'; // Mostrar el contenedor de nueva contraseña
    this.style.display = 'none'; // Ocultar el botón de modificar contraseña
    cambioContraseniaActivo = true;

});

document.getElementById('cancelChangeBtn').addEventListener('click', function() {
    document.getElementById('newPasswordContainer').style.display = 'none'; // Ocultar el contenedor de nueva contraseña
    document.getElementById('changePasswordBtn').style.display = 'block'; // Mostrar el botón de modificar contraseña
    cambioContraseniaActivo = false;
});





// Cargar estados al iniciar
document.addEventListener('DOMContentLoaded', cargarEstados);

// Evento para cargar ciudades cuando cambia el estado
document.getElementById('state').addEventListener('change', cargarCiudades);


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