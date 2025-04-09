document.addEventListener("DOMContentLoaded", async () => {
    const BASE_URL = "http://localhost:8080/RedSolidaria/api";
    const token = localStorage.getItem("lastToken");
    const emailLocal = localStorage.getItem("correo");
    let currentUserId = null;
    let currentPage = 1;
    const itemsPerPage = 10;
    let totalPages = 1;
    let allTransactions = [];
    let filteredTransactions = [];

    const currentBalanceElement = document.getElementById("currentBalance");
    const hoursReceivedElement = document.getElementById("hoursReceived");
    const hoursGivenElement = document.getElementById("hoursGiven");
    const completedExchangesElement = document.getElementById("completedExchanges");
    const transactionsTableBody = document.getElementById("transactionsTableBody");
    const emptyTransactionsElement = document.getElementById("emptyTransactions");
    const paginationElement = document.getElementById("transactionsPagination");
    const typeFilterElement = document.getElementById("typeFilter");
    const statusFilterElement = document.getElementById("statusFilter");
    const dateFilterElement = document.getElementById("dateFilter");
    const resetFiltersButton = document.getElementById("resetFilters");

    init();

    async function init() {
        try {
            currentUserId = await obtenerIdUsuario();
            if (!currentUserId) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se encontró información de sesión. Por favor, inicia sesión nuevamente.",
                    confirmButtonText: "Ir al inicio de sesión",
                    allowOutsideClick: false,
                }).then(() => {
                    window.location.href = "index.html";
                });
                return;
            }
            await cargarEstadisticas();
            await cargarTransacciones();
            configurarEventos();
        } catch (error) {
            console.error("Error en la inicialización:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un error al cargar el banco de tiempo. Por favor, intenta de nuevo más tarde.",
            });
        }
    }

    async function obtenerIdUsuario() {
        if (!emailLocal) return null;
        try {
            const response = await fetch(`${BASE_URL}/usuario/obtener-id?email=${emailLocal}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Error al obtener el ID de usuario");
            const data = await response.json();
            return data.idUsuario;
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    }

    async function cargarEstadisticas() {
        try {
            currentBalanceElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            hoursReceivedElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            hoursGivenElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            completedExchangesElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            const response = await fetch(`${BASE_URL}/usuario/obtener-datos?email=${emailLocal}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Error al cargar datos del usuario");
            const usuario = await response.json();
            currentBalanceElement.textContent = usuario.saldoHoras ? usuario.saldoHoras.toFixed(1) : "0.0";

            const transaccionesResponse = await fetch(`${BASE_URL}/transaccion/usuario/${currentUserId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!transaccionesResponse.ok) throw new Error("Error al cargar transacciones");
            const transacciones = await transaccionesResponse.json();

            let horasRecibidas = 0;
            let horasOfrecidas = 0;
            let intercambiosCompletados = 0;

            transacciones.forEach(transaccion => {
                if (transaccion.estatus === 1) {
                    intercambiosCompletados++;
                }
                if (transaccion.idUsuarioSolicitante === currentUserId) {
                    horasRecibidas += transaccion.horasIntercambiadas;
                } else if (transaccion.idUsuarioOferente === currentUserId) {
                    horasOfrecidas += transaccion.horasIntercambiadas;
                }
            });

            hoursReceivedElement.textContent = horasRecibidas.toFixed(1);
            hoursGivenElement.textContent = horasOfrecidas.toFixed(1);
            completedExchangesElement.textContent = intercambiosCompletados;

        } catch (error) {
            console.error("Error al cargar estadísticas:", error);
            currentBalanceElement.textContent = "0.0";
            hoursReceivedElement.textContent = "0.0";
            hoursGivenElement.textContent = "0.0";
            completedExchangesElement.textContent = "0";
        }
    }

    async function cargarTransacciones() {
        try {
            transactionsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <i class="fas fa-spinner fa-spin"></i> Cargando transacciones...
        </td>
      </tr>
    `;

            const tipoFiltro = typeFilterElement.value !== "all" ? typeFilterElement.value : "";
            const estadoFiltro = statusFilterElement.value !== "all" ? statusFilterElement.value : "";
            const fechaFiltro = dateFilterElement.value || "";

            let url = `${BASE_URL}/transaccion/usuario/${currentUserId}`;
            const params = new URLSearchParams();
            if (tipoFiltro) params.append("tipo", tipoFiltro);
            if (estadoFiltro) params.append("estado", estadoFiltro);
            if (fechaFiltro) params.append("fecha", fechaFiltro);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Error al cargar las transacciones");
            allTransactions = await response.json();
            filteredTransactions = [...allTransactions];
            totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
            mostrarTransacciones();
        } catch (error) {
            console.error("Error al cargar transacciones:", error);
            transactionsTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <i class="fas fa-exclamation-circle"></i> Error al cargar las transacciones.
          <button onclick="cargarTransacciones()" class="retry-btn">Reintentar</button>
        </td>
      </tr>
    `;
        }
    }

    function configurarEventos() {
        typeFilterElement.addEventListener("change", cargarTransacciones);
        statusFilterElement.addEventListener("change", cargarTransacciones);
        dateFilterElement.addEventListener("change", cargarTransacciones);
        resetFiltersButton.addEventListener("click", restablecerFiltros); // Asegúrate de que esta línea esté aquí
    }

    function mostrarTransacciones() {
        transactionsTableBody.innerHTML = "";
        if (filteredTransactions.length === 0) {
            emptyTransactionsElement.style.display = "block";
            paginationElement.style.display = "none";
            return;
        }
        emptyTransactionsElement.style.display = "none";
        paginationElement.style.display = "flex";

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
        const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

        paginatedTransactions.forEach((transaccion) => {
            const row = document.createElement("tr");
            const esRecibida = transaccion.idUsuarioSolicitante === currentUserId;
            const tipoTransaccion = esRecibida ? "received" : "given";
            const tipoTexto = esRecibida ? "Recibida" : "Ofrecida";

            let estadoClase = "";
            let estadoTexto = "";
            switch (transaccion.estatus) {
                case 0:
                    estadoClase = "pending";
                    estadoTexto = "Pendiente";
                    break;
                case 1:
                    estadoClase = "completed";
                    estadoTexto = "Completado";
                    break;
                case 2:
                    estadoClase = "cancelled";
                    estadoTexto = "Cancelado";
                    break;
                default:
                    estadoClase = "pending";
                    estadoTexto = "Pendiente";
            }

            let fechaFormateada = transaccion.fecha;
            try {
                const partesFecha = transaccion.fecha.split('-');
                if (partesFecha.length === 3) {
                    fechaFormateada = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;
                }
            } catch (e) {
                console.error("Error al formatear fecha:", e);
            }

            row.innerHTML = `
      <td>${fechaFormateada}</td>
      <td>${esRecibida ? transaccion.nombreOferente : transaccion.nombreSolicitante}</td>
      <td>${transaccion.tituloServicio || "Servicio general"}</td>
      <td><span class="transaction-type ${tipoTransaccion}">${tipoTexto}</span></td>
      <td>${transaccion.horasIntercambiadas}</td>
      <td><span class="transaction-status ${estadoClase}">${estadoTexto}</span></td>
      <td>
        <button class="action-icon view-details-btn" title="Ver detalles" data-id="${transaccion.idTransaccion}">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;
            transactionsTableBody.appendChild(row);
        });

        configurarPaginacion();
        document.querySelectorAll(".view-details-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
                const transaccionId = this.getAttribute("data-id");
                verDetallesTransaccion(transaccionId);
            });
        });
    }

    function verDetallesTransaccion(transaccionId) {
        const transaccion = allTransactions.find((t) => t.idTransaccion == transaccionId);
        if (!transaccion) {
            Swal.fire({icon: "error", title: "Error", text: "No se encontró la transacción solicitada."});
            return;
        }

        const esRecibida = transaccion.idUsuarioSolicitante === currentUserId;
        const tipoTexto = esRecibida ? "Recibida" : "Ofrecida";
        let estadoTexto = "";
        switch (transaccion.estatus) {
            case 0:
                estadoTexto = "Pendiente";
                break;
            case 1:
                estadoTexto = "Completado";
                break;
            case 2:
                estadoTexto = "Cancelado";
                break;
            default:
                estadoTexto = "Pendiente";
        }

        let fechaFormateada = transaccion.fecha;
        try {
            const partesFecha = transaccion.fecha.split('-');
            if (partesFecha.length === 3) {
                fechaFormateada = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`;
            }
        } catch (e) {
            console.error("Error al formatear fecha:", e);
        }

        Swal.fire({
            title: "Detalles de la Transacción",
            html: `
      <div class="transaction-details">
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>Usuario:</strong> ${esRecibida ? transaccion.nombreOferente : transaccion.nombreSolicitante}</p>
        <p><strong>Servicio:</strong> ${transaccion.tituloServicio || "Servicio general"}</p>
        <p><strong>Tipo:</strong> ${tipoTexto}</p>
        <p><strong>Horas:</strong> ${transaccion.horasIntercambiadas}</p>
        <p><strong>Estado:</strong> ${estadoTexto}</p>
        <p><strong>Detalles:</strong> ${transaccion.detalles || "Sin detalles adicionales"}</p>
      </div>
    `,
            confirmButtonText: "Cerrar",
            confirmButtonColor: "#2e7d32",
        });
    }

    function configurarPaginacion() {
        paginationElement.innerHTML = "";
        const prevButton = document.createElement("button");
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                mostrarTransacciones();
            }
        });
        paginationElement.appendChild(prevButton);

        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement("button");
            pageButton.textContent = i;
            pageButton.classList.toggle("active", i === currentPage);
            pageButton.addEventListener("click", () => {
                currentPage = i;
                mostrarTransacciones();
            });
            paginationElement.appendChild(pageButton);
        }

        const nextButton = document.createElement("button");
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                mostrarTransacciones();
            }
        });
        paginationElement.appendChild(nextButton);
    }

    // Función para restablecer los filtros
    function restablecerFiltros() {
        // Restablecer los valores de los filtros a sus valores predeterminados
        typeFilterElement.value = "all"; // O el valor predeterminado que uses
        statusFilterElement.value = "all"; // O el valor predeterminado que uses
        dateFilterElement.value = ""; // Limpiar el campo de fecha

        // Llamar a cargarTransacciones para aplicar los filtros restablecidos
        cargarTransacciones();
    }
});