document.addEventListener("DOMContentLoaded", async () => {
  // Variables globales
  const BASE_URL = "http://localhost:8080/RedSolidaria/api";
  const token = localStorage.getItem("lastToken");
  const emailLocal = localStorage.getItem("correo");
  let currentUserId = null;
  let currentPage = 1;
  const itemsPerPage = 10;
  let totalPages = 1;
  let allTransactions = [];
  let filteredTransactions = [];

  // Elementos DOM
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
  const applyFiltersButton = document.getElementById("applyFilters");
  const resetFiltersButton = document.getElementById("resetFilters");

  // Inicialización
  init();

  // Función de inicialización
  async function init() {
    try {
      // Obtener ID del usuario actual
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

      // Cargar estadísticas del banco de tiempo
      await cargarEstadisticas();

      // Cargar transacciones
      await cargarTransacciones();

      // Configurar eventos
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

  // Obtener ID del usuario actual
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

      if (!response.ok) {
        throw new Error("Error al obtener el ID de usuario");
      }

      const data = await response.json();
      return data.idUsuario;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }

  // Cargar estadísticas del banco de tiempo
  async function cargarEstadisticas() {
    try {
      // Mostrar indicador de carga
      currentBalanceElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      hoursReceivedElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      hoursGivenElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      completedExchangesElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      // Obtener estadísticas del usuario
      const response = await fetch(`${BASE_URL}/usuario/obtener-datos?email=${emailLocal}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar datos del usuario");
      }

      const usuario = await response.json();

      // Actualizar saldo actual
      currentBalanceElement.textContent = usuario.saldoHoras ? usuario.saldoHoras.toFixed(1) : "0.0";

      // Obtener estadísticas de transacciones
      const transaccionesResponse = await fetch(`${BASE_URL}/transaccion/estadisticas/${currentUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!transaccionesResponse.ok) {
        throw new Error("Error al cargar estadísticas de transacciones");
      }

      const estadisticas = await transaccionesResponse.json();

      // Actualizar estadísticas
      hoursReceivedElement.textContent = estadisticas.horasRecibidas ? estadisticas.horasRecibidas.toFixed(1) : "0.0";
      hoursGivenElement.textContent = estadisticas.horasOfrecidas ? estadisticas.horasOfrecidas.toFixed(1) : "0.0";
      completedExchangesElement.textContent = estadisticas.intercambiosCompletados || "0";
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
      // Mostrar valores por defecto en caso de error
      currentBalanceElement.textContent = "0.0";
      hoursReceivedElement.textContent = "0.0";
      hoursGivenElement.textContent = "0.0";
      completedExchangesElement.textContent = "0";
    }
  }

  // Cargar transacciones
  async function cargarTransacciones() {
    try {
      // Mostrar indicador de carga
      transactionsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <i class="fas fa-spinner fa-spin"></i> Cargando transacciones...
                    </td>
                </tr>
            `;

      // Obtener transacciones del usuario
      const response = await fetch(`${BASE_URL}/transaccion/usuario/${currentUserId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar las transacciones");
      }

      allTransactions = await response.json();
      filteredTransactions = [...allTransactions];
      totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

      // Mostrar transacciones
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

  // Mostrar transacciones
  function mostrarTransacciones() {
    // Limpiar tabla
    transactionsTableBody.innerHTML = "";

    // Verificar si hay transacciones
    if (filteredTransactions.length === 0) {
      emptyTransactionsElement.style.display = "block";
      paginationElement.style.display = "none";
      return;
    }

    // Ocultar mensaje de vacío
    emptyTransactionsElement.style.display = "none";
    paginationElement.style.display = "flex";

    // Calcular índices para paginación
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Renderizar transacciones
    paginatedTransactions.forEach((transaccion) => {
      const row = document.createElement("tr");

      // Determinar tipo de transacción
      const esRecibida = transaccion.idUsuarioSolicitante === currentUserId;
      const tipoTransaccion = esRecibida ? "received" : "given";
      const tipoTexto = esRecibida ? "Recibida" : "Ofrecida";

      // Determinar estado
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

      // Formatear fecha
      const fecha = new Date(transaccion.fecha);
      const fechaFormateada = fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Crear contenido de la fila
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

    // Configurar paginación
    configurarPaginacion();

    // Agregar eventos a los botones de detalles
    document.querySelectorAll(".view-details-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const transaccionId = this.getAttribute("data-id");
        verDetallesTransaccion(transaccionId);
      });
    });
  }

  // Configurar paginación
  function configurarPaginacion() {
    paginationElement.innerHTML = "";

    // Botón anterior
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

    // Botones de página
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

    // Botón siguiente
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

  // Ver detalles de una transacción
  function verDetallesTransaccion(transaccionId) {
    const transaccion = allTransactions.find((t) => t.idTransaccion == transaccionId);

    if (!transaccion) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró la transacción solicitada.",
      });
      return;
    }

    // Determinar tipo de transacción
    const esRecibida = transaccion.idUsuarioSolicitante === currentUserId;
    const tipoTexto = esRecibida ? "Recibida" : "Ofrecida";

    // Determinar estado
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

    // Formatear fecha
    const fecha = new Date(transaccion.fecha);
    const fechaFormateada = fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Mostrar detalles en un modal
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

  // Aplicar filtros
  function aplicarFiltros() {
    const tipoFiltro = typeFilterElement.value;
    const estadoFiltro = statusFilterElement.value;
    const fechaFiltro = dateFilterElement.value;

    // Filtrar transacciones
    filteredTransactions = allTransactions.filter((transaccion) => {
      // Filtro por tipo
      if (tipoFiltro !== "all") {
        const esRecibida = transaccion.idUsuarioSolicitante === currentUserId;
        if (tipoFiltro === "received" && !esRecibida) return false;
        if (tipoFiltro === "given" && esRecibida) return false;
      }

      // Filtro por estado
      if (estadoFiltro !== "all") {
        let estadoTransaccion = "";
        switch (transaccion.estatus) {
          case 0:
            estadoTransaccion = "pending";
            break;
          case 1:
            estadoTransaccion = "completed";
            break;
          case 2:
            estadoTransaccion = "cancelled";
            break;
          default:
            estadoTransaccion = "pending";
        }
        if (estadoFiltro !== estadoTransaccion) return false;
      }

      // Filtro por fecha
      if (fechaFiltro) {
        const fechaTransaccion = new Date(transaccion.fecha).toISOString().split("T")[0];
        if (fechaTransaccion !== fechaFiltro) return false;
      }

      return true;
    });

    // Actualizar paginación
    currentPage = 1;
    totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    // Mostrar transacciones filtradas
    mostrarTransacciones();
  }

  // Restablecer filtros
  function restablecerFiltros() {
    typeFilterElement.value = "all";
    statusFilterElement.value = "all";
    dateFilterElement.value = "";

    // Restablecer transacciones filtradas
    filteredTransactions = [...allTransactions];
    currentPage = 1;
    totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    // Mostrar todas las transacciones
    mostrarTransacciones();
  }

  // Configurar eventos
  function configurarEventos() {
    // Evento para aplicar filtros
    applyFiltersButton.addEventListener("click", aplicarFiltros);

    // Evento para restablecer filtros
    resetFiltersButton.addEventListener("click", restablecerFiltros);
  }
});