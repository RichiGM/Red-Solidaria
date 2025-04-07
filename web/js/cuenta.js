document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = "http://localhost:8080/RedSolidaria/api"
  const emailLocal = localStorage.getItem("correo")
  const token = localStorage.getItem("lastToken")
  let cambioContraseniaActivo = false
  let fotoUsuario = null

  // Elementos DOM
  const photoCircle = document.getElementById("photoCircle")
  const removePhotoBtn = document.getElementById("removePhotoBtn")
  const changePhotoBtn = document.getElementById("changePhotoBtn")
  const changePasswordBtn = document.getElementById("changePasswordBtn")
  const cancelChangeBtn = document.getElementById("cancelChangeBtn")
  const newPasswordContainer = document.getElementById("newPasswordContainer")
  const saveChangesBtn = document.getElementById("saveChangesBtn")

  // Funciones de validación
  function validarContrasenia(contrasenia) {
    if (!contrasenia.trim()) return false
    const tieneLongitud = contrasenia.length >= 12
    const tieneMayuscula = /[A-Z]/.test(contrasenia)
    const tieneNumero = /[0-9]/.test(contrasenia)
    const tieneEspecial = /[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/.test(contrasenia)
    return tieneLongitud && tieneMayuscula && tieneNumero && tieneEspecial
  }

  function validarNombreApellido(nombre) {
    return !/[0-9]/.test(nombre)
  }

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  function validarUbicacion(estado, ciudad) {
    return estado && ciudad
  }

  function mostrarError(campoId, mensaje) {
    const errorElemento = document.getElementById(campoId + "Error")
    if (errorElemento) {
      errorElemento.textContent = mensaje ? `⚠️ ${mensaje}` : ""
    } else {
      const campo = document.getElementById(campoId)
      if (campo) {
        const nuevoError = document.createElement("div")
        nuevoError.id = campoId + "Error"
        nuevoError.className = "error"
        nuevoError.textContent = mensaje ? `⚠️ ${mensaje}` : ""
        campo.parentNode.appendChild(nuevoError)
      }
    }
  }

  // Cargar estados
  async function cargarEstados() {
    try {
      const response = await fetch(`${BASE_URL}/ubicacion/estados`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Error al cargar estados")
      }

      const estados = await response.json()
      const selectEstado = document.getElementById("state")

      // Limpiar opciones existentes excepto la primera
      while (selectEstado.options.length > 1) {
        selectEstado.remove(1)
      }

      // Agregar nuevas opciones
      estados.forEach((estado) => {
        const option = document.createElement("option")
        option.value = estado.idEstado
        option.textContent = estado.nombre
        selectEstado.appendChild(option)
      })
    } catch (error) {
      console.error("Error al cargar estados:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los estados. Por favor, intenta de nuevo más tarde.",
      })
    }
  }

  // Cargar ciudades
  async function cargarCiudades(idEstado) {
    try {
      const selectCiudad = document.getElementById("city")

      // Limpiar opciones existentes excepto la primera
      while (selectCiudad.options.length > 1) {
        selectCiudad.remove(1)
      }

      if (!idEstado) {
        return
      }

      const response = await fetch(`${BASE_URL}/ubicacion/ciudades/${idEstado}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Error al cargar ciudades")
      }

      const ciudades = await response.json()

      // Agregar nuevas opciones
      ciudades.forEach((ciudad) => {
        const option = document.createElement("option")
        option.value = ciudad.idCiudad
        option.textContent = ciudad.nombre
        selectCiudad.appendChild(option)
      })
    } catch (error) {
      console.error("Error al cargar ciudades:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las ciudades. Por favor, intenta de nuevo más tarde.",
      })
    }
  }

  // Cargar datos del usuario
  async function cargarDatosUsuario() {
    try {
      if (!emailLocal) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se encontró información de sesión. Por favor, inicia sesión nuevamente.",
          confirmButtonText: "Ir al inicio de sesión",
          allowOutsideClick: false,
        }).then(() => {
          window.location.href = "index.html"
        })
        return
      }

      const response = await fetch(`${BASE_URL}/usuario/obtener-datos?email=${emailLocal}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al cargar datos del usuario")
      }

      const usuario = await response.json()

      // Llenar campos del formulario
      document.getElementById("nombre").value = usuario.nombre || ""
      document.getElementById("apellidos").value = usuario.apellidos || ""
      document.getElementById("email").value = usuario.correo || ""
      document.getElementById("descripcion").value = usuario.descripcion || ""
      document.getElementById("preferenciasEmail").checked = usuario.preferenciasEmail === true

      // Configurar foto de perfil
      if (usuario.foto) {
        photoCircle.innerHTML = `<img src="${usuario.foto}" alt="Foto de perfil">`
        fotoUsuario = usuario.foto
      } else {
        photoCircle.innerHTML = `<img src="img/usuario.jpg" alt="Foto de perfil">`
      }

      // Configurar privacidad
      const publicRadio = document.getElementById("public")
      const privateRadio = document.getElementById("private")
      if (publicRadio && privateRadio) {
        publicRadio.checked = usuario.configuracionPrivacidad === true
        privateRadio.checked = usuario.configuracionPrivacidad === false
      }

      // Configurar ubicación
      const idEstado = usuario.ciudad && usuario.ciudad.idEstado ? usuario.ciudad.idEstado : ""
      const idCiudad = usuario.ciudad && usuario.ciudad.idCiudad ? usuario.ciudad.idCiudad : ""

      if (idEstado) {
        document.getElementById("state").value = idEstado
        await cargarCiudades(idEstado)

        if (idCiudad) {
          document.getElementById("city").value = idCiudad
        }
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos del usuario. Por favor, intenta de nuevo más tarde.",
      })
    }
  }

  // Obtener ID del usuario por email
  async function obtenerIdUsuarioPorEmail(email) {
    try {
      const response = await fetch(`${BASE_URL}/usuario/obtener-id?email=${email}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener el ID de usuario")
      }

      const data = await response.json()
      return data.idUsuario
    } catch (error) {
      console.error("Error al obtener el ID de usuario:", error)
      throw error
    }
  }

  // Modificar usuario
  async function modificarUsuario(usuario) {
    try {
      const response = await fetch(`${BASE_URL}/usuario/modificar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al modificar el usuario")
      }

      return await response.json()
    } catch (error) {
      console.error("Error al modificar el usuario:", error)
      throw error
    }
  }

  // Subir foto de perfil
  async function subirFotoPerfil(file) {
    try {
      const formData = new FormData()
      formData.append("foto", file)
      formData.append("email", emailLocal)

      const response = await fetch(`${BASE_URL}/usuario/subir-foto`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al subir la foto de perfil")
      }

      const data = await response.json()
      return data.fotoUrl
    } catch (error) {
      console.error("Error al subir la foto de perfil:", error)
      throw error
    }
  }

  // Eliminar foto de perfil
  async function eliminarFotoPerfil() {
    try {
      const response = await fetch(`${BASE_URL}/usuario/eliminar-foto`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailLocal }),
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la foto de perfil")
      }

      return true
    } catch (error) {
      console.error("Error al eliminar la foto de perfil:", error)
      throw error
    }
  }

  // Event Listeners
  changePasswordBtn.addEventListener("click", function () {
    newPasswordContainer.style.display = "block"
    this.style.display = "none"
    cambioContraseniaActivo = true
  })

  cancelChangeBtn.addEventListener("click", () => {
    newPasswordContainer.style.display = "none"
    changePasswordBtn.style.display = "block"
    document.getElementById("newPassword").value = ""
    mostrarError("newPassword", "")
    cambioContraseniaActivo = false
  })

  document.getElementById("state").addEventListener("change", function () {
    cargarCiudades(this.value)
  })

  // Cambiar foto de perfil
  changePhotoBtn.addEventListener("click", () => {
    // Crear un input de archivo oculto
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/*"
    fileInput.style.display = "none"
    document.body.appendChild(fileInput)

    // Simular clic en el input
    fileInput.click()

    // Manejar la selección de archivo
    fileInput.addEventListener("change", async function () {
      if (this.files && this.files[0]) {
        const file = this.files[0]

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "La imagen es demasiado grande. El tamaño máximo permitido es 5MB.",
          })
          return
        }

        // Validar tipo (solo imágenes)
        if (!file.type.startsWith("image/")) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "El archivo seleccionado no es una imagen válida.",
          })
          return
        }

        try {
          // Mostrar indicador de carga
          Swal.fire({
            title: "Subiendo imagen...",
            text: "Por favor, espera mientras se sube la imagen.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading()
            },
          })

          // Subir la imagen
          const fotoUrl = await subirFotoPerfil(file)

          // Actualizar la interfaz
          photoCircle.innerHTML = `<img src="${fotoUrl}" alt="Foto de perfil">`
          fotoUsuario = fotoUrl

          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "La foto de perfil se ha actualizado correctamente.",
          })
        } catch (error) {
          console.error("Error al cambiar la foto de perfil:", error)
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cambiar la foto de perfil. Por favor, intenta de nuevo más tarde.",
          })
        }
      }

      // Eliminar el input de archivo
      document.body.removeChild(fileInput)
    })
  })

  // Eliminar foto de perfil
  removePhotoBtn.addEventListener("click", async () => {
    if (!fotoUsuario) {
      Swal.fire({
        icon: "info",
        title: "Información",
        text: "No tienes una foto de perfil para eliminar.",
      })
      return
    }

    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "¿Eliminar foto de perfil?",
        text: "Esta acción no se puede deshacer.",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
      })

      if (result.isConfirmed) {
        // Mostrar indicador de carga
        Swal.fire({
          title: "Eliminando imagen...",
          text: "Por favor, espera mientras se elimina la imagen.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          },
        })

        // Eliminar la foto
        await eliminarFotoPerfil()

        // Actualizar la interfaz
        photoCircle.innerHTML = `<img src="img/usuario.jpg" alt="Foto de perfil">`
        fotoUsuario = null

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "La foto de perfil se ha eliminado correctamente.",
        })
      }
    } catch (error) {
      console.error("Error al eliminar la foto de perfil:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la foto de perfil. Por favor, intenta de nuevo más tarde.",
      })
    }
  })

  // Guardar cambios
  saveChangesBtn.addEventListener("click", async () => {
    // Obtener valores de los campos
    const nombre = document.getElementById("nombre").value
    const apellidos = document.getElementById("apellidos").value
    const email = document.getElementById("email").value
    const estado = document.getElementById("state").value
    const ciudad = document.getElementById("city").value
    const descripcion = document.getElementById("descripcion").value
    const preferenciasEmail = document.getElementById("preferenciasEmail").checked
    const publicRadio = document.getElementById("public")
    const configuracionPrivacidad = publicRadio.checked
    const newPassword = cambioContraseniaActivo ? document.getElementById("newPassword").value : ""

    // Validaciones
    let esValido = true

    if (!nombre.trim()) {
      mostrarError("nombre", "El nombre es obligatorio")
      esValido = false
    } else if (!validarNombreApellido(nombre)) {
      mostrarError("nombre", "El nombre no debe contener números")
      esValido = false
    } else {
      mostrarError("nombre", "")
    }

    if (!apellidos.trim()) {
      mostrarError("apellidos", "Los apellidos son obligatorios")
      esValido = false
    } else if (!validarNombreApellido(apellidos)) {
      mostrarError("apellidos", "Los apellidos no deben contener números")
      esValido = false
    } else {
      mostrarError("apellidos", "")
    }

    if (!email.trim()) {
      mostrarError("email", "El correo electrónico es obligatorio")
      esValido = false
    } else if (!validarEmail(email)) {
      mostrarError("email", "El correo electrónico no es válido")
      esValido = false
    } else {
      mostrarError("email", "")
    }

    if (!validarUbicacion(estado, ciudad)) {
      mostrarError("state", "Por favor, selecciona un estado y una ciudad")
      esValido = false
    } else {
      mostrarError("state", "")
    }

    if (cambioContraseniaActivo && !validarContrasenia(newPassword)) {
      mostrarError(
        "newPassword",
        "La contraseña debe tener al menos 12 caracteres, una mayúscula, un número y un carácter especial",
      )
      esValido = false
    } else if (cambioContraseniaActivo) {
      mostrarError("newPassword", "")
    }

    if (!esValido) {
      return
    }

    try {
      // Mostrar indicador de carga
      Swal.fire({
        title: "Guardando cambios...",
        text: "Por favor, espera mientras se guardan los cambios.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Obtener ID del usuario
      const idUsuario = await obtenerIdUsuarioPorEmail(emailLocal)

      // Crear objeto de usuario
      const usuario = {
        idUsuario: idUsuario,
        nombre: nombre,
        apellidos: apellidos,
        correo: email,
        ciudad: { idCiudad: Number.parseInt(ciudad) },
        descripcion: descripcion,
        preferenciasEmail: preferenciasEmail,
        configuracionPrivacidad: configuracionPrivacidad,
        foto: fotoUsuario,
      }

      // Agregar contraseña si se está cambiando
      if (cambioContraseniaActivo && newPassword) {
        usuario.contrasenia = newPassword
      }

      // Guardar cambios
      await modificarUsuario(usuario)

      // Actualizar localStorage
      localStorage.setItem("username", nombre)

      // Si se cambió el correo, actualizar en localStorage
      if (email !== emailLocal) {
        localStorage.setItem("correo", email)
      }

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Los cambios se han guardado correctamente.",
      }).then(() => {
        // Resetear el contenedor de contraseña si estaba activo
        if (cambioContraseniaActivo) {
          newPasswordContainer.style.display = "none"
          changePasswordBtn.style.display = "block"
          document.getElementById("newPassword").value = ""
          cambioContraseniaActivo = false
        }

        // Recargar la página para mostrar los cambios
        window.location.reload()
      })
    } catch (error) {
      console.error("Error al guardar los cambios:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron guardar los cambios. Por favor, intenta de nuevo más tarde.",
      })
    }
  })

  // Inicialización
  await cargarEstados()
  await cargarDatosUsuario()
})