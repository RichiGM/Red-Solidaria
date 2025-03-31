// profile.js
const BASE_URL = "http://localhost:8080/RedSolidaria/api";

// Cargar datos del perfil
function loadProfile() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario) {
        fetch(`${BASE_URL}/usuario/${usuario.idUsuario}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById("profileName").value = data.nombre;
                document.getElementById("profileEmail").value = data.correo;
                document.getElementById("profilePassword").value = data.contrasena;
                document.getElementById("profileDescription").textContent = data.descripcion || "Sin descripción";
                if (data.foto) {
                    document.getElementById("profilePhoto").src = data.foto;
                    document.getElementById("userAvatar").src = data.foto;
                }
                document.getElementById("userRating").textContent = data.reputacion || "0.0";
                document.getElementById("public").checked = data.configuracionPrivacidad === "publico";
                document.getElementById("private").checked = data.configuracionPrivacidad === "privado";
                loadUserServices(usuario.idUsuario);
                loadTransactions(usuario.idUsuario);
                loadBankData(usuario.idUsuario);
            })
            .catch(error => {
                console.error("Error al cargar perfil:", error);
            });
    }
}

// Habilitar edición del perfil
function enableEdit() {
    document.getElementById("profileName").removeAttribute("readonly");
    document.getElementById("profileEmail").removeAttribute("readonly");
    document.getElementById("profilePassword").removeAttribute("readonly");
    document.getElementById("saveBtn").style.display = "inline-block";
}

// Actualizar perfil
function handleUpdateProfile(e) {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;

    const updatedUsuario = {
        idUsuario: usuario.idUsuario,
        nombre: document.getElementById("profileName").value,
        apellidos: usuario.apellidos,
        correo: document.getElementById("profileEmail").value,
        contrasena: document.getElementById("profilePassword").value,
        configuracionPrivacidad: document.querySelector('input[name="privacy"]:checked').value,
        preferenciasEmail: usuario.preferenciasEmail,
        idTipoUsuario: usuario.idTipoUsuario,
    };

    fetch(`${BASE_URL}/usuario/actualizar`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUsuario),
    })
        .then(response => response.json())
        .then(data => {
            alert(data);
            localStorage.setItem("usuario", JSON.stringify(updatedUsuario));
            loadProfile();
        })
        .catch(error => {
            console.error("Error al actualizar perfil:", error);
            alert("Error al actualizar perfil");
        });
}

// Cargar servicios del usuario
function loadUserServices(idUsuario) {
    fetch(`${BASE_URL}/servicio/todos`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(servicios => {
            const servicesList = document.getElementById("servicesList");
            if (servicesList) {
                servicesList.innerHTML = "";
                servicios.filter(s => s.idUsuario === idUsuario).forEach(servicio => {
                    const serviceCard = document.createElement("div");
                    serviceCard.className = "service-card";
                    serviceCard.innerHTML = `
                        <button class="edit-icon" onclick="openEditServiceModal(${servicio.idServicio})"><i class="fas fa-edit"></i></button>
                        <div class="modal-header">
                            <i class="fas fa-user"></i>
                            <h2>${servicio.titulo}</h2>
                        </div>
                        <div class="service-content">
                            <label>Nombre del servicio</label>
                            <input type="text" value="${servicio.titulo}" readonly>
                            <label>Descripción</label>
                            <input type="text" value="${servicio.descripcion}" readonly>
                            <label>Habilidades requeridas</label>
                            <input type="text" value="Habilidades" readonly>
                            <label>Tipo de servicio</label>
                            <select disabled>
                                <option value="virtual" ${servicio.idModalidad === 2 ? "selected" : ""}>Virtual</option>
                                <option value="presencial" ${servicio.idModalidad === 1 ? "selected" : ""}>Presencial</option>
                            </select>
                        </div>
                    `;
                    servicesList.appendChild(serviceCard);
                });
            }
        })
        .catch(error => {
            console.error("Error al cargar servicios:", error);
        });
}

// Abrir modal para editar servicio
function openEditServiceModal(idServicio) {
    fetch(`${BASE_URL}/servicio/${idServicio}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(servicio => {
            document.getElementById("serviceId").value = servicio.idServicio;
            document.getElementById("editServiceTitle").value = servicio.titulo;
            document.getElementById("editServiceDescription").value = servicio.descripcion;
            document.getElementById("editServiceSkills").value = "Habilidades";
            document.getElementById("editServiceType").value = servicio.idModalidad === 2 ? "virtual" : "presencial";
            document.getElementById("serviceModalUserName").textContent = servicio.titulo;
            openModalById("serviceModal");
        })
        .catch(error => {
            console.error("Error al cargar servicio:", error);
        });
}

// Editar servicio
function handleEditService(e) {
    e.preventDefault();
    const servicio = {
        idServicio: document.getElementById("serviceId").value,
        titulo: document.getElementById("editServiceTitle").value,
        descripcion: document.getElementById("editServiceDescription").value,
        idModalidad: document.getElementById("editServiceType").value === "virtual" ? 2 : 1,
        idEstatus: 1,
        idUsuario: JSON.parse(localStorage.getItem("usuario")).idUsuario,
    };

    fetch(`${BASE_URL}/servicio/actualizar`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(servicio),
    })
        .then(response => response.json())
        .then(data => {
            alert(data);
            closeModalById("serviceModal");
            loadUserServices(servicio.idUsuario);
        })
        .catch(error => {
            console.error("Error al actualizar servicio:", error);
            alert("Error al actualizar servicio");
        });
}

// Eliminar servicio
function deleteService() {
    const idServicio = document.getElementById("serviceId").value;
    fetch(`${BASE_URL}/servicio/eliminar/${idServicio}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(data => {
            alert(data);
            closeModalById("serviceModal");
            loadUserServices(JSON.parse(localStorage.getItem("usuario")).idUsuario);
        })
        .catch(error => {
            console.error("Error al eliminar servicio:", error);
            alert("Error al eliminar servicio");
        });
}

// Cargar transacciones del usuario
function loadTransactions(idUsuario) {
    fetch(`${BASE_URL}/transaccion/usuario/${idUsuario}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(transacciones => {
            const transactionsList = document.getElementById("transactionsList");
            if (transactionsList) {
                transactionsList.innerHTML = "";
                transacciones.forEach(transaccion => {
                    const transactionDiv = document.createElement("div");
                    transactionDiv.className = "transaction-details";
                    transactionDiv.innerHTML = `
                        <div class="transaction-field">
                            <label>Servicio</label>
                            <input type="text" value="Servicio" readonly>
                        </div>
                        <div class="transaction-field">
                            <label>Descripción</label>
                            <textarea readonly>${transaccion.detalles}</textarea>
                        </div>
                        <div class="transaction-field">
                            <label>Horas intercambiadas <i class="fas fa-clock"></i></label>
                            <input type="number" value="${transaccion.horasIntercambiadas}" readonly>
                        </div>
                        <div class="transaction-field">
                            <label>Calificación</label>
                            <div class="transaction-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    `;
                    transactionsList.appendChild(transactionDiv);
                });
            }
        })
        .catch(error => {
            console.error("Error al cargar transacciones:", error);
        });
}

// Cargar datos del banco solidario
function loadBankData(idUsuario) {
    fetch(`${BASE_URL}/usuario/${idUsuario}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById("bankHours").value = `${data.saldoHoras} horas`;
            // Calcular horas ofrecidas y utilizadas (puedes ajustar según tu lógica)
            document.getElementById("offeredHours").value = "0 horas";
            document.getElementById("usedHours").value = "0 horas";
        })
        .catch(error => {
            console.error("Error al cargar datos del banco:", error);
        });
}

// Subir foto de perfil
function uploadPhoto(event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    // Aquí deberías implementar un endpoint para subir la foto y obtener la URL
    // Por ahora, simularemos que se sube y se actualiza el perfil
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    usuario.foto = URL.createObjectURL(file);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    loadProfile();
}

function removePhoto() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    usuario.foto = null;
    localStorage.setItem("usuario", JSON.stringify(usuario));
    loadProfile();
}

// Enviar denuncia
function handleReportarDenuncia(e) {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        alert("Debes iniciar sesión para reportar una denuncia");
        return;
    }

    const denuncia = {
        motivo: document.getElementById("reportReason").value,
        descripcion: document.getElementById("reportReason").value,
        idDenunciante: usuario.idUsuario,
        idReportado: parseInt(document.getElementById("reportUser").value),
        idEstatus: 0,
    };

    fetch(`${BASE_URL}/denuncia/reportar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(denuncia),
    })
        .then(response => response.json())
        .then(data => {
            alert(data);
            closeModalById("reportsModal");
        })
        .catch(error => {
            console.error("Error al reportar denuncia:", error);
            alert("Error al reportar denuncia");
        });
}

// Cargar notificaciones
function loadNotifications() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;

    fetch(`${BASE_URL}/notificacion/usuario/${usuario.idUsuario}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => response.json())
        .then(notificaciones => {
            const notificationsList = document.getElementById("notificationsList");
            if (notificationsList) {
                notificationsList.innerHTML = "";
                notificaciones.forEach(notificacion => {
                    const notificationDiv = document.createElement("div");
                    notificationDiv.className = "notification";
                    notificationDiv.innerHTML = `
                        <button class="close-btn">×</button>
                        <p><strong>Notificación</strong></p>
                        <p class="subtext">${notificacion.contenido}</p>
                        <div class="notification-actions">
                            <button class="btn">Aceptar</button>
                            <button class="btn">Rechazar</button>
                        </div>
                    `;
                    notificationsList.appendChild(notificationDiv);
                });
            }
        })
        .catch(error => {
            console.error("Error al cargar notificaciones:", error);
        });
}

// Cargar datos al iniciar la página
document.addEventListener("DOMContentLoaded", loadProfile);