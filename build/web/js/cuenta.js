const emailLocal = localStorage.getItem('correo');
const token = localStorage.getItem('lastToken');
let cambioContraseniaActivo = false;

// Funciones de validación
function validarContrasenia(contrasenia) {
    if (!contrasenia.trim()) return false;
    const tieneLongitud = contrasenia.length >= 12;
    const tieneMayuscula = /[A-Z]/.test(contrasenia);
    const tieneNumero = /[0-9]/.test(contrasenia);
    const tieneEspecial = /[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(contrasenia);
    return tieneLongitud && tieneMayuscula && tieneNumero && tieneEspecial;
}

function validarNombreApellido(nombre) {
    return !/[0-9]/.test(nombre);
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarUbicacion(estado, ciudad) {
    return estado && ciudad;
}

function mostrarError(campoId, mensaje) {
    const errorElemento = document.getElementById(campoId + 'Error');
    if (errorElemento) {
        errorElemento.textContent = mensaje ? `⚠️ ${mensaje}` : '';
    }
}

// Funciones de carga de datos
async function cargarEstados() {
    try {
        const response = await fetch('http://localhost:8080/RedSolidaria/api/ubicacion/estados', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
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

async function cargarCiudades(idEstado) {
    const selectCiudad = document.getElementById('city');
    selectCiudad.innerHTML = '<option value="">Seleccione una ciudad</option>';

    if (idEstado) {
        try {
            const response = await fetch(`http://localhost:8080/RedSolidaria/api/ubicacion/ciudades/${idEstado}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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

async function cargarDatosUsuario() {
    try {
        console.log('Cargando datos para:', emailLocal);
        const response = await fetch(`http://localhost:8080/RedSolidaria/api/usuario/obtener-datos?email=${emailLocal}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Error al cargar datos del usuario');
        }
        const usuario = await response.json();
        console.log('Datos del usuario:', usuario);

        document.getElementById('nombre').value = usuario.nombre || '';
        document.getElementById('apellidos').value = usuario.apellidos || '';
        document.getElementById('email').value = usuario.correo || '';
        
        const idEstado = usuario.ciudad && usuario.ciudad.idEstado ? usuario.ciudad.idEstado : '';
        const idCiudad = usuario.ciudad && usuario.ciudad.idCiudad ? usuario.ciudad.idCiudad : '';
        
        document.getElementById('state').value = idEstado;
        if (idEstado) {
            await cargarCiudades(idEstado);
            document.getElementById('city').value = idCiudad;
        }
        
        document.getElementById('descripcion').value = usuario.descripcion || '';
        document.getElementById('preferenciasEmail').checked = usuario.preferenciasEmail === true;

        const publicRadio = document.getElementById('public');
        const privateRadio = document.getElementById('private');
        if (publicRadio && privateRadio) {
            publicRadio.checked = usuario.configuracionPrivacidad === true;
            privateRadio.checked = usuario.configuracionPrivacidad === false;
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
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
        if (!response.ok) throw new Error('Error al obtener el ID de usuario');
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
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al modificar el usuario');
        }
        const result = await response.json();
        console.log('Usuario modificado:', result.message);
        return result;
    } catch (error) {
        console.error('Error al modificar el usuario:', error);
        throw error;
    }
}

// Event Listeners
document.getElementById('changePasswordBtn').addEventListener('click', function() {
    document.getElementById('newPasswordContainer').style.display = 'block';
    this.style.display = 'none'; // Oculta el botón "Modificar Contraseña"
    cambioContraseniaActivo = true;
});

document.getElementById('cancelChangeBtn').addEventListener('click', function() {
    document.getElementById('newPasswordContainer').style.display = 'none';
    document.getElementById('changePasswordBtn').style.display = 'block';
    document.getElementById('newPassword').value = '';
    mostrarError('newPassword', '');
    cambioContraseniaActivo = false;
});

document.getElementById('state').addEventListener('change', function() {
    cargarCiudades(this.value);
});

document.getElementById('saveChangesBtn').addEventListener('click', async function() {
    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const email = document.getElementById('email').value;
    const estado = document.getElementById('state').value;
    const ciudad = document.getElementById('city').value;
    const descripcion = document.getElementById('descripcion').value;
    const preferenciasEmail = document.getElementById('preferenciasEmail').checked;
    const publicRadio = document.getElementById('public');
    const configuracionPrivacidad = publicRadio.checked ? true : false;
    const newPassword = cambioContraseniaActivo ? document.getElementById('newPassword').value : '';

    // Validaciones
    if (!validarNombreApellido(nombre)) {
        mostrarError('nombre', 'El nombre no debe contener números');
        return;
    }
    if (!validarNombreApellido(apellidos)) {
        mostrarError('apellidos', 'Los apellidos no deben contener números');
        return;
    }
    if (!validarEmail(email)) {
        mostrarError('email', 'El correo electrónico no es válido');
        return;
    }
    if (!validarUbicacion(estado, ciudad)) {
        mostrarError('state', 'Por favor, selecciona un estado y una ciudad');
        return;
    }
    if (cambioContraseniaActivo && !validarContrasenia(newPassword)) {
        mostrarError('newPassword', 'La contraseña debe tener al menos 12 caracteres, una mayúscula, un número y un carácter especial');
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
            configuracionPrivacidad: configuracionPrivacidad
        };

        // Solo agregar la contraseña si cambioContraseniaActivo es true y hay un valor
        if (cambioContraseniaActivo && newPassword) {
            usuario.contrasenia = newPassword;
        }

        console.log('Enviando al backend:', usuario);
        await modificarUsuario(usuario);
        alert('Usuario modificado exitosamente');
        
        // Resetear el contenedor de contraseña si estaba activo
        if (cambioContraseniaActivo) {
            document.getElementById('newPasswordContainer').style.display = 'none';
            document.getElementById('changePasswordBtn').style.display = 'block';
            document.getElementById('newPassword').value = '';
            cambioContraseniaActivo = false;
        }
        location.reload();
    } catch (error) {
        alert('No se pudo modificar el usuario: ' + error.message);
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    await cargarEstados();
    await cargarDatosUsuario();
});

// Listeners para los radios de privacidad
document.getElementById('public').addEventListener('change', function() {
    console.log('Privacidad pública seleccionada:', this.checked);
});

document.getElementById('private').addEventListener('change', function() {
    console.log('Privacidad privada seleccionada:', this.checked);
});

document.getElementById('preferenciasEmail').addEventListener('change', function() {
    console.log('Preferencia seleccionada:', this.checked);
});