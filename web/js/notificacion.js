// Controlador para las notificaciones adaptado para el menú existente
const notificacionController = {
    // Variables globales
    notificaciones: [],
    notificacionesPendientes: 0,
    intervalCheckPendientes: null,
    
    // Inicializar controlador
    init: function() {
        this.cargarNotificaciones();
        this.iniciarCheckPendientes();
        this.setupListeners();
    },
    
    // Configurar listeners para la interfaz
    setupListeners: function() {
        // Botón para mostrar/ocultar el panel de notificaciones
        const notifIcon = document.querySelector('.notification-icon') || document.getElementById('notifications-icon');
        if (notifIcon) {
            notifIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleNotificationsPanel();
            });
        }
        
        // Cerrar el panel al hacer clic fuera
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notificationsDropdown');
            const icon = document.querySelector('.notification-icon') || document.getElementById('notifications-icon');
            
            if (panel && !panel.contains(e.target) && e.target !== icon) {
                panel.classList.remove('show');
            }
        });
        
        // Botón para marcar todas como leídas (si existe)
        const btnMarkAllRead = document.getElementById('mark-all-read');
        if (btnMarkAllRead) {
            btnMarkAllRead.addEventListener('click', () => {
                this.marcarTodasLeidas();
            });
        }
    },
    
    // Alternar visibilidad del panel de notificaciones
    toggleNotificationsPanel: function() {
        const panel = document.getElementById('notificationsDropdown');
        if (panel) {
            panel.classList.toggle('show');
            if (panel.classList.contains('show')) {
                this.cargarNotificaciones(); // Recargar al abrir
            }
        }
    },
    
    // Cargar todas las notificaciones del usuario
    cargarNotificaciones: function() {
        const idUsuario = sessionStorage.getItem('idUsuario');
        if (!idUsuario) return;
        
        fetch(`api/notificacion/getAll?idUsuario=${idUsuario}`)
            .then(response => response.json())
            .then(data => {
                this.notificaciones = data;
                this.actualizarVistaNotificaciones();
            })
            .catch(error => console.error('Error al cargar notificaciones:', error));
    },
    
    // Verificar notificaciones pendientes
    verificarPendientes: function() {
        const idUsuario = sessionStorage.getItem('idUsuario');
        if (!idUsuario) return;
        
        fetch(`api/notificacion/getPendientes?idUsuario=${idUsuario}`)
            .then(response => response.json())
            .then(data => {
                this.notificacionesPendientes = data.length;
                this.actualizarContadorNotificaciones();
                
                // Si hay nuevas notificaciones desde la última verificación
                if (data.length > 0 && data.some(n => !this.notificaciones.some(existente => existente.idNotificacion === n.idNotificacion))) {
                    this.cargarNotificaciones();
                    this.mostrarNotificacionNueva(data[0]);
                }
            })
            .catch(error => console.error('Error al verificar notificaciones pendientes:', error));
    },
    
    // Iniciar verificación periódica de notificaciones
    iniciarCheckPendientes: function() {
        // Verificar de inmediato al cargar
        this.verificarPendientes();
        
        // Verificar cada minuto
        this.intervalCheckPendientes = setInterval(() => {
            this.verificarPendientes();
        }, 60000);
    },
    
    // Detener verificación periódica
    detenerCheckPendientes: function() {
        if (this.intervalCheckPendientes) {
            clearInterval(this.intervalCheckPendientes);
            this.intervalCheckPendientes = null;
        }
    },
    
    // Actualizar contador de notificaciones pendientes
    actualizarContadorNotificaciones: function() {
        const contador = document.querySelector('.notification-counter') || document.getElementById('notifications-counter');
        if (contador) {
            if (this.notificacionesPendientes > 0) {
                contador.textContent = this.notificacionesPendientes;
                contador.classList.remove('hidden');
            } else {
                contador.classList.add('hidden');
            }
        }
    },
    
    // Actualizar la vista de notificaciones
    actualizarVistaNotificaciones: function() {
        const panel = document.getElementById('notificationsDropdown');
        if (!panel) return;
        
        // Mantener el título existente
        const panelTitle = panel.querySelector('.panel-title');
        
        // Limpiar panel pero mantener el título
        panel.innerHTML = '';
        if (panelTitle) {
            panel.appendChild(panelTitle);
        } else {
            const title = document.createElement('h3');
            title.className = 'panel-title';
            title.textContent = 'Notificaciones';
            panel.appendChild(title);
        }
        
        // Añadir botón "Marcar todas como leídas" si hay notificaciones pendientes
        if (this.notificacionesPendientes > 0) {
            const markAllBtn = document.createElement('button');
            markAllBtn.id = 'mark-all-read';
            markAllBtn.className = 'mark-all-btn';
            markAllBtn.textContent = 'Marcar todas como leídas';
            markAllBtn.addEventListener('click', () => this.marcarTodasLeidas());
            panel.appendChild(markAllBtn);
        }
        
        if (this.notificaciones.length === 0) {
            const noNotif = document.createElement('div');
            noNotif.className = 'no-notifications';
            noNotif.textContent = 'No tienes notificaciones';
            panel.appendChild(noNotif);
            return;
        }
        
        // Crear elementos para cada notificación
        this.notificaciones.forEach(notificacion => {
            const elemento = this.crearElementoNotificacion(notificacion);
            panel.appendChild(elemento);
        });
    },
    
    // Crear elemento HTML para una notificación
    crearElementoNotificacion: function(notificacion) {
        const elemento = document.createElement('div');
        elemento.className = `notification ${notificacion.estatus === 0 ? 'unread' : ''}`;
        elemento.dataset.id = notificacion.idNotificacion;
        
        // Formatear fecha
        const fecha = new Date(notificacion.fecha);
        const fechaFormateada = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
        
        // Estructura HTML basada en el diseño existente
        elemento.innerHTML = `
            <button class="close-btn">×</button>
            <p><strong>${notificacion.tipo}</strong></p>
            <p class="subtext">${notificacion.contenido}</p>
            <p class="notification-date">${fechaFormateada}</p>
            <div class="notification-actions">
                ${this.generarBotonesAccion(notificacion)}
            </div>
        `;
        
        // Agregar evento para cerrar/eliminar notificación
        elemento.querySelector('.close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.eliminarNotificacion(notificacion.idNotificacion);
        });
        
        // Marcar como leída al hacer clic
        elemento.addEventListener('click', () => {
            if (notificacion.estatus === 0) {
                this.marcarLeida(notificacion.idNotificacion);
            }
            
            // Redirigir según el tipo de evento
            this.manejarAccionNotificacion(notificacion);
        });
        
        // Configurar botones de acción si existen
        const botonesAccion = elemento.querySelectorAll('.notification-actions button');
        if (botonesAccion.length > 0) {
            botonesAccion.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    if (action) {
                        this.ejecutarAccion(action, notificacion);
                    }
                });
            });
        }
        
        return elemento;
    },
    
    // Generar botones de acción según el tipo de notificación
    generarBotonesAccion: function(notificacion) {
        // Si ya está leída, solo mostrar botón para ver detalles
        if (notificacion.estatus !== 0) {
            return `<button class="btn" data-action="ver">Ver detalles</button>`;
        }
        
        // Para solicitudes de servicio
        if (notificacion.tipoEvento === 1) {
            return `
                <button class="btn btn-accept" data-action="aceptar">Aceptar</button>
                <button class="btn btn-reject" data-action="rechazar">Rechazar</button>
            `;
        }
        
        // Para mensajes nuevos
        if (notificacion.tipoEvento === 2) {
            return `<button class="btn" data-action="responder">Responder</button>`;
        }
        
        // Por defecto, mostrar botón para ver detalles
        return `<button class="btn" data-action="ver">Ver detalles</button>`;
    },
    
    // Mostrar notificación nueva (toast)
    mostrarNotificacionNueva: function(notificacion) {
        // Verificar si ya existe un contenedor para toasts, si no, crearlo
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        
        let icono = '';
        switch(notificacion.tipoEvento) {
            case 1: // Intercambio/Servicio
                icono = '<i class="fas fa-exchange-alt"></i>';
                break;
            case 2: // Mensaje
                icono = '<i class="fas fa-envelope"></i>';
                break;
            default:
                icono = '<i class="fas fa-bell"></i>';
        }
        
        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-icon">${icono}</div>
                <div class="toast-title">${notificacion.tipo}</div>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-body">
                ${notificacion.contenido}
            </div>
        `;
        
        // Agregar al DOM
        toastContainer.appendChild(toast);
        
        // Reproducir sonido de notificación si existe
        const notifSound = document.getElementById('notification-sound');
        if (notifSound) {
            notifSound.play().catch(e => console.log('No se pudo reproducir el sonido:', e));
        }
        
        // Configurar eventos
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        toast.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                this.marcarLeida(notificacion.idNotificacion);
                this.manejarAccionNotificacion(notificacion);
                toast.remove();
            }
        });
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('toast-hide');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    },
    
    // Marcar una notificación como leída
    marcarLeida: function(idNotificacion) {
        fetch(`api/notificacion/marcarLeida?idNotificacion=${idNotificacion}`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            if (data.result) {
                // Actualizar estado en el arreglo local
                const notificacion = this.notificaciones.find(n => n.idNotificacion === idNotificacion);
                if (notificacion) {
                    notificacion.estatus = 1;
                    this.notificacionesPendientes--;
                    this.actualizarContadorNotificaciones();
                    this.actualizarVistaNotificaciones();
                }
            }
        })
        .catch(error => console.error('Error al marcar notificación como leída:', error));
    },
    
    // Marcar todas las notificaciones como leídas
    marcarTodasLeidas: function() {
        const idUsuario = sessionStorage.getItem('idUsuario');
        if (!idUsuario) return;
        
        fetch(`api/notificacion/marcarTodasLeidas?idUsuario=${idUsuario}`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            if (data.result) {
                // Actualizar estado en el arreglo local
                this.notificaciones.forEach(n => n.estatus = 1);
                this.notificacionesPendientes = 0;
                this.actualizarContadorNotificaciones();
                this.actualizarVistaNotificaciones();
            }
        })
        .catch(error => console.error('Error al marcar todas las notificaciones como leídas:', error));
    },
    
    // Eliminar notificación
    eliminarNotificacion: function(idNotificacion) {
        fetch(`api/notificacion/delete?idNotificacion=${idNotificacion}`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            if (data.result) {
                // Eliminar del arreglo local y actualizar vista
                const index = this.notificaciones.findIndex(n => n.idNotificacion === idNotificacion);
                if (index !== -1) {
                    const wasUnread = this.notificaciones[index].estatus === 0;
                    this.notificaciones.splice(index, 1);
                    
                    // Actualizar contador si era no leída
                    if (wasUnread) {
                        this.notificacionesPendientes--;
                        this.actualizarContadorNotificaciones();
                    }
                    
                    // Eliminar elemento del DOM directamente
                    const elemento = document.querySelector(`.notification[data-id="${idNotificacion}"]`);
                    if (elemento) {
                        elemento.classList.add('fade-out');
                        setTimeout(() => {
                            if (elemento.parentNode) {
                                elemento.remove();
                                
                                // Si era la última notificación, mostrar mensaje "No hay notificaciones"
                                if (this.notificaciones.length === 0) {
                                    this.actualizarVistaNotificaciones();
                                }
                            }
                        }, 300);
                    }
                }
            }
        })
        .catch(error => console.error('Error al eliminar notificación:', error));
    },
    
    // Manejar acción según el tipo de notificación
    manejarAccionNotificacion: function(notificacion) {
        // Redireccionar según el tipo de evento
        switch(notificacion.tipoEvento) {
            case 1: // Intercambio/Servicio
                window.location.href = `servicio.html?id=${notificacion.idEvento}`;
                break;
            case 2: // Mensaje
                window.location.href = `mensajes.html?conversacion=${notificacion.idEvento}`;
                break;
            default:
                // No hacer nada específico
                break;
        }
    },
    
    // Ejecutar acción específica según botón presionado
    ejecutarAccion: function(accion, notificacion) {
        // Marcar como leída primero
        this.marcarLeida(notificacion.idNotificacion);
        
        switch(accion) {
            case 'aceptar':
                // Lógica para aceptar solicitud de servicio
                fetch(`api/servicio/aceptar?idServicio=${notificacion.idEvento}`, {
                    method: 'PUT'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.result) {
                        // Redirigir a la página del servicio
                        window.location.href = `servicio.html?id=${notificacion.idEvento}`;
                    } else {
                        alert('No se pudo aceptar la solicitud');
                    }
                })
                .catch(error => console.error('Error al aceptar solicitud:', error));
                break;
                
            case 'rechazar':
                // Lógica para rechazar solicitud de servicio
                fetch(`api/servicio/rechazar?idServicio=${notificacion.idEvento}`, {
                    method: 'PUT'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.result) {
                        this.eliminarNotificacion(notificacion.idNotificacion);
                    } else {
                        alert('No se pudo rechazar la solicitud');
                    }
                })
                .catch(error => console.error('Error al rechazar solicitud:', error));
                break;
                
            case 'responder':
                // Redirigir a la página de mensajes
                window.location.href = `mensajes.html?conversacion=${notificacion.idEvento}`;
                break;
                
            case 'ver':
                // Redirigir según el tipo de evento
                this.manejarAccionNotificacion(notificacion);
                break;
        }
    }
};

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si el usuario está logueado
    if (sessionStorage.getItem('idUsuario')) {
        notificacionController.init();
        
        // Agregar elemento de audio para sonido de notificación
        if (!document.getElementById('notification-sound')) {
            const audio = document.createElement('audio');
            audio.id = 'notification-sound';
            audio.src = 'assets/sounds/notification.mp3'; // Ajustar ruta según tu proyecto
            audio.preload = 'auto';
            document.body.appendChild(audio);
        }
    }
});

// CSS adaptado para el sistema de notificaciones
const addNotificacionesCSS = () => {
    if (document.getElementById('notifications-css')) return;
    
    const style = document.createElement('style');
    style.id = 'notifications-css';
    style.textContent = `
        /* Contador de notificaciones */
        .notification-counter {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #d32f2f;
            color: white;
            border-radius: 50%;
            min-width: 18px;
            height: 18px;
            font-size: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
        }
        
        /* Panel de notificaciones */
        .notifications-panel {
            display: none;
            max-height: 400px;
            overflow-y: auto;
            overflow-x: hidden;
        }
        
        .notifications-panel.show {
            display: block;
        }
        
        .mark-all-btn {
            background: none;
            border: none;
            color: #2196f3;
            text-align: right;
            display: block;
            width: 100%;
            padding: 5px 10px;
            cursor: pointer;
            font-size: 12px;
            margin-bottom: 5px;
        }
        
        .mark-all-btn:hover {
            text-decoration: underline;
        }
        
        .notification {
            position: relative;
            border-bottom: 1px solid #eee;
            padding: 10px;
            animation: fade-in 0.3s ease-out;
        }
        
        .notification.fade-out {
            animation: fade-out 0.3s ease-out;
        }
        
        .notification.unread {
            background-color: #f0f7ff;
        }
        
        .notification:hover {
            background-color: #f5f5f5;
        }
        
        .notification .close-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            opacity: 0.5;
        }
        
        .notification .close-btn:hover {
            opacity: 1;
        }
        
        .notification p {
            margin: 3px 0;
        }
        
        .notification .subtext {
            color: #666;
            font-size: 14px;
        }
        
        .notification-date {
            font-size: 11px;
            color: #999;
            margin-top: 5px !important;
        }
        
        .notification-actions {
            display: flex;
            gap: 5px;
            margin-top: 5px;
        }
        
        .notification-actions .btn {
            padding: 3px 8px;
            font-size: 12px;
            border-radius: 3px;
            border: 1px solid #ddd;
            background-color: #f5f5f5;
            cursor: pointer;
        }
        
        .notification-actions .btn-accept {
            background-color: #4caf50;
            color: white;
            border-color: #4caf50;
        }
        
        .notification-actions .btn-reject {
            background-color: #f44336;
            color: white;
            border-color: #f44336;
        }
        
        .no-notifications {
            padding: 20px;
            text-align: center;
            color: #999;
            font-style: italic;
        }
        
        .hidden {
            display: none !important;
        }
        
        /* Toast de notificaciones */
        #toast-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        .notification-toast {
            width: 300px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            margin-top: 10px;
            overflow: hidden;
            animation: toast-in 0.3s ease-out;
            cursor: pointer;
            border-left: 4px solid #2196f3;
        }
        
        .notification-toast.toast-hide {
            animation: toast-out 0.3s ease-in forwards;
        }
        
        @keyframes toast-in {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes toast-out {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes fade-in {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        @keyframes fade-out {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
        
        .toast-header {
            display: flex;
            align-items: center;
            padding: 10px;
            background-color: #f0f7ff;
        }
        
        .toast-icon {
            margin-right: 10px;
        }
        
        .toast-title {
            font-weight: bold;
            flex-grow: 1;
        }
        
        .toast-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
        }
        
        .toast-body {
            padding: 10px;
        }
    `;
    document.head.appendChild(style);
};

// Agregar el CSS cuando se carga el documento
document.addEventListener('DOMContentLoaded', addNotificacionesCSS);