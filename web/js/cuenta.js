let cambioContraseniaActivo = false;
const emailLocal = localStorage.getItem('correo');
const token = localStorage.getItem('lastToken');

// Funciones de validación
function validarContrasenia(contrasenia) {
    if (!contrasenia.trim()) {
        return false;
    }
    const tieneLongitud = contrasenia.length >= 12;
    const tieneMayuscula = /[A-Z]/.test(contrasenia);
    const tieneNumero = /[0-9]/.test(contrasenia);
    const tieneEspecial = /[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(contrasenia);
    return tieneLongitud && tieneMayuscula && tieneNumero && tieneEspecial;
}

function validarNombreApellido(nombre) {
    const tieneNumero = /[0-9]/.test(nombre);
    return !tieneNumero; // Retorna verdadero si no hay números
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarUbicacion(estado, ciudad) {
    return estado && ciudad;
}

function mostrarError(campo, mensaje) {
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

// Funciones de carga de datos
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

async function obtenerIdUsuarioPorEmail(email) {
    try {
        const response = await fetch(`http://localhost:8080/RedSolidaria/api/usuario/obtener-id?email=${email}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Error al obtener el ID de usuario.');
        }

        const data = await response.json();
        return data.idUsuario;
    } catch (error) {
        console.error('Error al obtener el ID de usuario:', error);
        throw error;
    }
}

async function modificarUsuario(usuario) {
    try {
        console.log('Enviando usuario:', usuario);
        const response = await fetch('http://localhost:8080/RedSolidaria/api/usuario/modificar', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response JSON:', result);

        if (!response.ok) {
            throw new Error(result.error || 'Error al modificar el usuario.');
        }

        console.log('Usuario modificado:', result.message);
    } catch (error) {
        console.error('Error al modificar el usuario:', error);
        throw error;
    }
}

// Event Listeners
document.getElementById('changePasswordBtn').addEventListener('click', function() {
    document.getElementById('newPasswordContainer').style.display = 'block';
    this.style.display = 'none';
    cambioContraseniaActivo = true;
});

document.getElementById('cancelChangeBtn').addEventListener('click', function() {
    document.getElementById('newPasswordContainer').style.display = 'none';
    document.getElementById('changePasswordBtn').style.display = 'block';
    cambioContraseniaActivo = false;
    document.getElementById('newPassword').value = '';
});

document.getElementById('saveNewPasswordBtn').addEventListener('click', async function() {
    const newPassword = document.getElementById('newPassword').value;

    if (!validarContrasenia(newPassword)) {
        mostrarError(document.getElementById('newPassword'), 'La contraseña debe tener al menos 12 caracteres, una mayúscula, un número y un carácter especial.');
        return;
    }

    alert('Contraseña válida. Haz clic en "Guardar Cambios" para aplicar todos los cambios.');
});

document.addEventListener('DOMContentLoaded', cargarEstados);

document.getElementById('state').addEventListener('change', cargarCiudades);

document.getElementById('saveChangesBtn').addEventListener('click', async function() {
    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const email = document.getElementById('email').value;
    const estado = document.getElementById('state').value;
    const ciudad = document.getElementById('city').value;
    const descripcion = document.getElementById('descripcion').value;
    const preferenciasEmail = document.getElementById('preferenciasEmail').checked;
    const privacy = document.querySelector('input[name="privacy"]:checked').id === 'public' ? 1 : 0;
    const newPassword = cambioContraseniaActivo ? document.getElementById('newPassword').value : '';

    // Validaciones
    if (!validarNombreApellido(nombre)) {
        mostrarError(document.getElementById('nombre'), 'El nombre no debe contener números.');
        return;
    }
    if (!validarNombreApellido(apellidos)) {
        mostrarError(document.getElementById('apellidos'), 'Los apellidos no deben contener números.');
        return;
    }
    if (!validarEmail(email)) {
        mostrarError(document.getElementById('email'), 'El correo electrónico no es válido.');
        return;
    }
    if (!validarUbicacion(estado, ciudad)) {
        mostrarError(document.getElementById('state'), 'Por favor, selecciona un estado y una ciudad.');
        return;
    }
    if (cambioContraseniaActivo && !validarContrasenia(newPassword)) {
        mostrarError(document.getElementById('newPassword'), 'La contraseña debe tener al menos 12 caracteres, una mayúscula, un número y un carácter especial.');
        return;
    }

    try {
        const idUsuario = await obtenerIdUsuarioPorEmail(emailLocal);
        const usuario = {
            idUsuario: idUsuario,
            nombre: nombre,
            apellidos: apellidos,
            correo: email,
            ciudad: { idCiudad: parseInt(ciudad) },
            descripcion: descripcion,
            preferenciasEmail: preferenciasEmail,
            configuracionPrivacidad: privacy,
            contrasenia: newPassword
        };

        await modificarUsuario(usuario);
        alert('Usuario modificado exitosamente.');

        if (cambioContraseniaActivo) {
            document.getElementById('newPasswordContainer').style.display = 'none';
            document.getElementById('changePasswordBtn').style.display = 'block';
            document.getElementById('newPassword').value = '';
            cambioContraseniaActivo = false;
        }
    } catch (error) {
        console.error('Error al guardar los cambios:', error);
        alert('No se pudo modificar el usuario: ' + error.message);
    }
});