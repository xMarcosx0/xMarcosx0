// coordinador.js - Funcionalidades para el rol de Coordinador

document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el usuario está logueado y tiene el rol correcto
  const loggedUser = Storage.getLoggedUser()
  if (!loggedUser || loggedUser.rol !== "coordinador") {
    window.location.href = "login.html"
    return
  }

  // Inicializar variables globales
  let currentProject = null
  const currentAction = null

  // Definir bootstrap globalmente
  //const bootstrap = window.bootstrap //This line was causing the error.  It's commented out below.  The solution is to import bootstrap.  This is assumed to be done elsewhere in the project.

  // Cargar datos del usuario
  loadUserData()

  // Cargar proyectos según el tipo de coordinador
  loadProjects()

  // Cargar notificaciones
  loadNotifications()

  // Configurar eventos
  setupEventListeners()

  // Función para cargar datos del usuario
  function loadUserData() {
    // Mostrar nombre del usuario
    document.getElementById("nombreUsuario").textContent = loggedUser.nombre
    document.getElementById("nombreCoordinador").textContent = loggedUser.nombre

    // Mostrar tipo de coordinador
    const tipoCoordinador = loggedUser.tipoCoordinador || "No especificado"
    document.getElementById("tipoCoordinador").textContent = tipoCoordinador

    // Cargar datos en la sección de perfil
    document.getElementById("perfilNombre").textContent = `${loggedUser.nombre} ${loggedUser.apellido || ""}`
    document.getElementById("perfilRol").textContent = "Coordinador"
    document.getElementById("perfilTipo").textContent = `Tipo: ${tipoCoordinador}`
    document.getElementById("perfilUsuario").textContent = loggedUser.usuario || "-"
    document.getElementById("perfilCorreo").textContent = loggedUser.correo || "-"
    document.getElementById("perfilDepartamento").textContent = loggedUser.departamento || "-"
    document.getElementById("perfilCargo").textContent = loggedUser.cargo || "Coordinador"

    // Ocultar pestañas según el tipo de coordinador
    if (tipoCoordinador.toLowerCase() !== "operativo") {
      // Para coordinadores administrativos y de censo, ocultar la pestaña "Por Asignar"
      document.getElementById("porAsignar-tab").classList.add("d-none")
    }
  }

  // Función para cargar proyectos
  // Modificar la función loadProjects para asegurar que se muestren correctamente los proyectos asignados
  function loadProjects() {
    const tipoCoordinador = loggedUser.tipoCoordinador?.toLowerCase() || ""
    const allProjects = Storage.getProjects()

    console.log("Todos los proyectos:", allProjects)
    console.log("ID del coordinador actual:", loggedUser.id)
    console.log("Nombre del coordinador actual:", loggedUser.nombre)
    console.log("Tipo de coordinador:", tipoCoordinador)

    // Mostrar todos los proyectos en estado "En Asignación" para depuración
    const proyectosEnAsignacion = allProjects.filter((project) => project.estado === "En Asignación")
    console.log("Proyectos en estado 'En Asignación':", proyectosEnAsignacion)

    // Filtrar proyectos según el tipo de coordinador
    let proyectosPorAsignar = []
    let proyectosEnGestion = []
    let proyectosVerificados = []
    let proyectosFinalizados = []

    if (tipoCoordinador === "operativo") {
      // Para Wadith (ID 9), mostrar todos los proyectos en estado "En Asignación"
      if (loggedUser.id === "9") {
        console.log("Coordinador es Wadith, mostrando todos los proyectos en asignación")

        // Mostrar TODOS los proyectos en estado "En Asignación" sin filtros adicionales
        proyectosPorAsignar = allProjects.filter((project) => project.estado === "En Asignación")

        console.log("Proyectos por asignar para Wadith:", proyectosPorAsignar)
      } else {
        // Para otros coordinadores operativos
        proyectosPorAsignar = allProjects.filter(
          (project) =>
            project.estado === "En Asignación" &&
            (project.coordinadorId === loggedUser.id || project.coordinadorNombre?.includes(loggedUser.nombre)),
        )
      }

      console.log("Proyectos por asignar (filtrados):", proyectosPorAsignar)

      proyectosEnGestion = allProjects.filter(
        (project) =>
          (project.estado === "Asignado" ||
            project.estado === "En Gestion por Analista" ||
            project.estado === "En Gestion por Brigada") &&
          (project.coordinadorId === loggedUser.id || project.coordinadorNombre?.includes(loggedUser.nombre)),
      )

      proyectosVerificados = allProjects.filter(
        (project) =>
          project.estado === "En Revision de Verificacion" &&
          (project.coordinadorId === loggedUser.id || project.coordinadorNombre?.includes(loggedUser.nombre)),
      )

      proyectosFinalizados = allProjects.filter(
        (project) =>
          (project.estado === "Verificado" ||
            project.estado === "Finalizado" ||
            project.estado === "Generacion de Informe") &&
          (project.coordinadorId === loggedUser.id || project.coordinadorNombre?.includes(loggedUser.nombre)),
      )
    } else if (tipoCoordinador === "administrativo") {
      // Coordinador Administrativo: Solo ve proyectos, no asigna
      proyectosEnGestion = allProjects.filter(
        (project) =>
          (project.estado === "Asignado" ||
            project.estado === "En Gestion por Analista" ||
            project.estado === "En Gestion por Brigada") &&
          project.tipoCoordinacion === "administrativa",
      )

      proyectosVerificados = allProjects.filter(
        (project) =>
          (project.estado === "En Revision de Verificacion" || project.estado === "Verificado") &&
          project.tipoCoordinacion === "administrativa",
      )

      proyectosFinalizados = allProjects.filter(
        (project) =>
          (project.estado === "Finalizado" || project.estado === "Generacion de Informe") &&
          project.tipoCoordinacion === "administrativa",
      )
    } else if (tipoCoordinador === "censo") {
      // Coordinador de Censo: Solo ve proyectos, no asigna
      proyectosEnGestion = allProjects.filter(
        (project) =>
          (project.estado === "Asignado" ||
            project.estado === "En Gestion por Analista" ||
            project.estado === "En Gestion por Brigada") &&
          project.tipoCoordinacion === "censo",
      )

      proyectosVerificados = allProjects.filter(
        (project) =>
          (project.estado === "En Revision de Verificacion" || project.estado === "Verificado") &&
          project.tipoCoordinacion === "censo",
      )

      proyectosFinalizados = allProjects.filter(
        (project) =>
          (project.estado === "Finalizado" || project.estado === "Generacion de Informe") &&
          project.tipoCoordinacion === "censo",
      )
    }

    // Cargar proyectos en las tablas correspondientes
    loadProjectsTable("tablaProyectosPorAsignar", proyectosPorAsignar, "porAsignar")
    loadProjectsTable("tablaProyectosEnGestion", proyectosEnGestion, "enGestion")
    loadProjectsTable("tablaProyectosVerificados", proyectosVerificados, "verificados")
    loadProjectsTable("tablaProyectosFinalizados", proyectosFinalizados, "finalizados")

    // After loading projects, populate date filters
    populateDateFilters()
  }

  // Función para cargar proyectos en una tabla específica
  function loadProjectsTable(tableId, projects, type) {
    const table = document.getElementById(tableId)
    if (!table) {
      console.error(`Tabla con ID ${tableId} no encontrada`)
      return
    }

    console.log(`Cargando tabla ${tableId} con ${projects.length} proyectos:`, projects)

    if (projects.length === 0) {
      table.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">No hay proyectos disponibles</td>
      </tr>
    `
      return
    }

    table.innerHTML = ""
    projects.forEach((project) => {
      const row = document.createElement("tr")

      // Determine the content of the row based on the table type
      if (type === "porAsignar") {
        row.innerHTML = `
        <td>${project.id}</td>
        <td>${project.nombre}</td>
        <td>${project.prstNombre || "No definido"}</td>
        <td>${project.municipio || "No definido"}</td>
        <td>${project.departamento || "No definido"}</td>
        <td>${formatDateTime(project.fechaAprobacion || project.fechaCreacion)}</td>
        <td><span class="badge bg-info">Por Asignar</span></td>
        <td>
          <button class="btn btn-sm btn-primary asignar-proyecto" data-id="${project.id}">
            <i class="bi bi-person-check"></i>
          </button>
          <button class="btn btn-sm btn-info ver-proyecto" data-id="${project.id}">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-secondary ver-historial" data-id="${project.id}">
            <i class="bi bi-clock-history"></i>
          </button>
        </td>
      `
      } else if (type === "enGestion") {
        const asignadoA = project.analistaNombre || project.brigadaNombre || "No asignado"
        row.innerHTML = `
        <td>${project.id}</td>
        <td>${project.nombre}</td>
        <td>${project.prstNombre || "No definido"}</td>
        <td>${asignadoA}</td>
        <td>${project.municipio || "No definido"}</td>
        <td>${project.departamento || "No definido"}</td>
        <td>${formatDateTime(project.fechaAsignacion || project.fechaCreacion)}</td>
        <td><span class="badge ${getBadgeClass(project.estado)}">${project.estado}</span></td>
        <td>
          <div class="progress" style="height: 10px;">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${Storage.getProjectProgress(project.id).porcentaje}%;" 
              aria-valuenow="${Storage.getProjectProgress(project.id).porcentaje}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
          <button class="btn btn-sm btn-info ver-proyecto" data-id="${project.id}">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-secondary ver-historial" data-id="${project.id}">
            <i class="bi bi-clock-history"></i>
          </button>
        </td>
      `
      } else if (type === "verificados") {
        const verificadoPor = project.analistaNombre || project.brigadaNombre || "No definido"
        row.innerHTML = `
        <td>${project.id}</td>
        <td>${project.nombre}</td>
        <td>${project.prstNombre || "No definido"}</td>
        <td>${verificadoPor}</td>
        <td>${formatDateTime(project.fechaVerificacion || project.fechaCreacion)}</td>
        <td><span class="badge ${getBadgeClass(project.estado)}">${project.estado}</span></td>
        <td>
            ${
              loggedUser.tipoCoordinador?.toLowerCase() === "operativo"
                ? `<button class="btn btn-sm btn-primary revisar-verificacion" data-id="${project.id}">
                <i class="bi bi-check-circle"></i> Revisar
              </button>`
                : ""
            }
            <button class="btn btn-sm btn-info ver-proyecto" data-id="${project.id}">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-secondary ver-historial" data-id="${project.id}">
              <i class="bi bi-clock-history"></i>
            </button>
          </td>
        `
      } else if (type === "finalizados") {
        row.innerHTML = `
        <td>${project.id}</td>
        <td>${project.nombre}</td>
        <td>${project.prstNombre || "No definido"}</td>
        <td>${formatDateTime(project.fechaFinalizacion || project.fechaCreacion)}</td>
        <td><span class="badge ${getBadgeClass(project.estado)}">${project.estado}</span></td>
        <td>
          <button class="btn btn-sm btn-info ver-proyecto" data-id="${project.id}">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-secondary ver-historial" data-id="${project.id}">
            <i class="bi bi-clock-history"></i>
          </button>
        </td>
      `
      }

      table.appendChild(row)
    })
  }

  // Función para cargar notificaciones
  function loadNotifications() {
    const notifications = Storage.getNotificationsByUser(loggedUser.id)
    const notificationCount = document.getElementById("notificationCount")
    const notificationsList = document.getElementById("notificationsList")

    // Contar notificaciones no leídas
    const noLeidas = notifications.filter((n) => !n.leido).length
    notificationCount.textContent = noLeidas

    // Si no hay notificaciones, mostrar mensaje
    if (notifications.length === 0) {
      notificationsList.innerHTML = `
        <div class="notification-empty">
          <i class="bi bi-bell-slash"></i>
          <p>No tienes notificaciones</p>
        </div>
      `
      return
    }

    // Ordenar notificaciones por fecha (más recientes primero)
    notifications.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))

    // Generar HTML para las notificaciones
    let html = ""
    notifications.forEach((notif) => {
      const fecha = new Date(notif.fechaCreacion)
      const fechaFormateada = fecha.toLocaleDateString() + " " + fecha.toLocaleTimeString()

      let icono = "bi-bell"
      let titulo = "Notificación"

      // Determinar icono y título según el tipo
      switch (notif.tipo) {
        case "proyecto_asignado":
          icono = "bi-folder-check"
          titulo = "Proyecto Asignado"
          break
        case "proyecto_verificado":
          icono = "bi-clipboard-check"
          titulo = "Proyecto Verificado"
          break
        case "proyecto_rechazado":
          icono = "bi-x-circle"
          titulo = "Proyecto Rechazado"
          break
        case "inicio_sesion":
          icono = "bi-box-arrow-in-right"
          titulo = "Inicio de Sesión"
          break
        default:
          icono = "bi-bell"
      }

      html += `
        <div class="notification-item ${notif.leido ? "" : "unread"}" data-id="${notif.id}">
          <div class="d-flex align-items-center">
            <div class="me-2">
              <i class="bi ${icono}"></i>
            </div>
            <div class="flex-grow-1">
              <div class="notification-title">${titulo}</div>
              <div class="notification-message">${notif.mensaje}</div>
              <div class="notification-time">${fechaFormateada}</div>
            </div>
            ${!notif.leido ? '<div class="ms-2"><span class="badge bg-primary">Nueva</span></div>' : ""}
          </div>
        </div>
      `
    })

    notificationsList.innerHTML = html

    // Añadir event listeners para marcar como leídas al hacer clic
    document.querySelectorAll(".notification-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.dataset.id
        Storage.markNotificationAsRead(id)
        item.classList.remove("unread")
        item.querySelector(".badge")?.remove()

        // Actualizar contador
        const noLeidasActualizadas = Storage.getUnreadNotificationsCount(loggedUser.id)
        notificationCount.textContent = noLeidasActualizadas
      })
    })
  }

  // Add this function to setup filter event listeners
  function setupFilterEventListeners() {
    // Por Asignar tab filters
    document.getElementById("filterNombreAsignar").addEventListener("input", () => {
      filterProjects("tablaProyectosPorAsignar")
    })
    document.getElementById("filterPRSTAsignar").addEventListener("input", () => {
      filterProjects("tablaProyectosPorAsignar")
    })
    document.getElementById("filterFechaAsignar").addEventListener("change", () => {
      filterProjects("tablaProyectosPorAsignar")
    })
    document.getElementById("filterEstadoAsignar").addEventListener("change", () => {
      filterProjects("tablaProyectosPorAsignar")
    })

    // En Gestión tab filters
    document.getElementById("filterNombreGestion").addEventListener("input", () => {
      filterProjects("tablaProyectosEnGestion")
    })
    document.getElementById("filterPRSTGestion").addEventListener("input", () => {
      filterProjects("tablaProyectosEnGestion")
    })
    document.getElementById("filterFechaGestion").addEventListener("change", () => {
      filterProjects("tablaProyectosEnGestion")
    })
    document.getElementById("filterEstadoGestion").addEventListener("change", () => {
      filterProjects("tablaProyectosEnGestion")
    })

    // Verificados tab filters
    document.getElementById("filterNombreVerificados").addEventListener("input", () => {
      filterProjects("tablaProyectosVerificados")
    })
    document.getElementById("filterPRSTVerificados").addEventListener("input", () => {
      filterProjects("tablaProyectosVerificados")
    })
    document.getElementById("filterFechaVerificados").addEventListener("change", () => {
      filterProjects("tablaProyectosVerificados")
    })
    document.getElementById("filterEstadoVerificados").addEventListener("change", () => {
      filterProjects("tablaProyectosVerificados")
    })

    // Finalizados tab filters
    document.getElementById("filterNombreFinalizados").addEventListener("input", () => {
      filterProjects("tablaProyectosFinalizados")
    })
    document.getElementById("filterPRSTFinalizados").addEventListener("input", () => {
      filterProjects("tablaProyectosFinalizados")
    })
    document.getElementById("filterFechaFinalizados").addEventListener("change", () => {
      filterProjects("tablaProyectosFinalizados")
    })
    document.getElementById("filterEstadoFinalizados").addEventListener("change", () => {
      filterProjects("tablaProyectosFinalizados")
    })
  }

  // Add this function to filter projects
  function filterProjects(tableId) {
    const table = document.getElementById(tableId)
    if (!table) return

    const rows = table.querySelectorAll("tr")
    if (rows.length <= 1) return // Only header row or no rows

    // Get filter values based on table ID
    let suffix = ""
    if (tableId === "tablaProyectosPorAsignar") suffix = "Asignar"
    else if (tableId === "tablaProyectosEnGestion") suffix = "Gestion"
    else if (tableId === "tablaProyectosVerificados") suffix = "Verificados"
    else if (tableId === "tablaProyectosFinalizados") suffix = "Finalizados"

    const nombreFilter = document.getElementById(`filterNombre${suffix}`).value.toLowerCase()
    const prstFilter = document.getElementById(`filterPRST${suffix}`).value.toLowerCase()
    const fechaFilter = document.getElementById(`filterFecha${suffix}`).value
    const estadoFilter = document.getElementById(`filterEstado${suffix}`).value

    // Loop through all rows except header
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const cells = row.querySelectorAll("td")
      if (cells.length < 3) continue

      // Get cell values (adjust indices based on table structure)
      const nombre = cells[1].textContent.toLowerCase()
      const prst = cells[2].textContent.toLowerCase()

      // Date and status indices vary by table
      let fechaIndex = 5
      let estadoIndex = 6

      if (tableId === "tablaProyectosPorAsignar") {
        fechaIndex = 5
        estadoIndex = 6
      } else if (tableId === "tablaProyectosEnGestion") {
        fechaIndex = 6
        estadoIndex = 7
      } else if (tableId === "tablaProyectosVerificados") {
        fechaIndex = 4
        estadoIndex = 5
      } else if (tableId === "tablaProyectosFinalizados") {
        fechaIndex = 3
        estadoIndex = 4
      }

      const fecha = cells[fechaIndex] ? cells[fechaIndex].textContent : ""
      const estadoElement = cells[estadoIndex] ? cells[estadoIndex].querySelector(".badge") : null
      const estado = estadoElement ? estadoElement.textContent : ""

      // Check if row matches all filters
      const matchesNombre = !nombreFilter || nombre.includes(nombreFilter)
      const matchesPRST = !prstFilter || prst.includes(prstFilter)
      const matchesFecha = !fechaFilter || fecha.includes(fechaFilter)
      const matchesEstado = !estadoFilter || estado.includes(estadoFilter)

      // Show/hide row based on filter matches
      if (matchesNombre && matchesPRST && matchesFecha && matchesEstado) {
        row.style.display = ""
      } else {
        row.style.display = "none"
      }
    }
  }

  // Add this function to populate date filters
  function populateDateFilters() {
    const allProjects = Storage.getProjects()

    // Extract unique dates
    const dates = new Set()
    allProjects.forEach((project) => {
      if (project.fechaCreacion) {
        const date = new Date(project.fechaCreacion).toLocaleDateString()
        dates.add(date)
      }
      if (project.fechaEnvio) {
        const date = new Date(project.fechaEnvio).toLocaleDateString()
        dates.add(date)
      }
      if (project.fechaAprobacion) {
        const date = new Date(project.fechaAprobacion).toLocaleDateString()
        dates.add(date)
      }
      if (project.fechaAsignacion) {
        const date = new Date(project.fechaAsignacion).toLocaleDateString()
        dates.add(date)
      }
      if (project.fechaVerificacion) {
        const date = new Date(project.fechaVerificacion).toLocaleDateString()
        dates.add(date)
      }
      if (project.fechaFinalizacion) {
        const date = new Date(project.fechaFinalizacion).toLocaleDateString()
        dates.add(date)
      }
    })

    // Sort dates
    const sortedDates = Array.from(dates).sort((a, b) => new Date(b) - new Date(a))

    // Populate dropdowns
    const dateSelects = [
      document.getElementById("filterFechaAsignar"),
      document.getElementById("filterFechaGestion"),
      document.getElementById("filterFechaVerificados"),
      document.getElementById("filterFechaFinalizados"),
    ]

    dateSelects.forEach((select) => {
      if (select) {
        // Keep the first option
        const firstOption = select.options[0]
        select.innerHTML = ""
        select.appendChild(firstOption)

        // Add date options
        sortedDates.forEach((date) => {
          const option = document.createElement("option")
          option.value = date
          option.textContent = date
          select.appendChild(option)
        })
      }
    })
  }

  // Función para configurar los event listeners
  function setupEventListeners() {
    // Marcar todas las notificaciones como leídas
    document.getElementById("markAllAsRead").addEventListener("click", () => {
      Storage.markAllNotificationsAsRead(loggedUser.id)
      loadNotifications()
    })

    // Cerrar sesión
    document.getElementById("cerrarSesion").addEventListener("click", () => {
      Storage.logout()
      window.location.href = "login.html"
    })

    // Ver perfil
    document.getElementById("navPerfil").addEventListener("click", () => {
      document.querySelector(".tab-content").style.display = "none"
      document.getElementById("seccionPerfil").style.display = "block"
    })

    // Volver desde perfil
    document.getElementById("btnVolverDesdePerfil").addEventListener("click", () => {
      document.getElementById("seccionPerfil").style.display = "none"
      document.querySelector(".tab-content").style.display = "block"
    })

    // Cambiar contraseña
    document.getElementById("formCambiarPassword").addEventListener("submit", (e) => {
      e.preventDefault()
      cambiarPassword()
    })

    // Buscar proyectos
    document.getElementById("btnBuscarAsignar").addEventListener("click", () => {
      buscarProyectos("tablaProyectosPorAsignar", "buscarProyectoAsignar")
    })

    document.getElementById("btnBuscarGestion").addEventListener("click", () => {
      buscarProyectos("tablaProyectosEnGestion", "buscarProyectoGestion")
    })

    document.getElementById("btnBuscarVerificado").addEventListener("click", () => {
      buscarProyectos("tablaProyectosVerificados", "buscarProyectoVerificado")
    })

    document.getElementById("btnBuscarFinalizado").addEventListener("click", () => {
      buscarProyectos("tablaProyectosFinalizados", "buscarProyectoFinalizado")
    })

    // Cambiar tipo de asignación
    document.getElementById("tipoAsignacion").addEventListener("change", function () {
      const tipoSeleccionado = this.value
      if (tipoSeleccionado === "analista") {
        document.getElementById("contenedorAnalistas").style.display = "block"
        document.getElementById("contenedorBrigadas").style.display = "none"
      } else {
        document.getElementById("contenedorAnalistas").style.display = "none"
        document.getElementById("contenedorBrigadas").style.display = "block"
      }
    })

    // Asignar proyecto
    document.addEventListener("click", (e) => {
      if (e.target.closest(".asignar-proyecto")) {
        const projectId = e.target.closest(".asignar-proyecto").dataset.id
        abrirModalAsignarProyecto(projectId)
      }
    })

    // Revisar verificación
    document.addEventListener("click", (e) => {
      if (e.target.closest(".revisar-verificacion")) {
        const projectId = e.target.closest(".revisar-verificacion").dataset.id
        abrirModalRevisarVerificacion(projectId)
      }
    })

    // Ver proyecto
    document.addEventListener("click", (e) => {
      if (e.target.closest(".ver-proyecto")) {
        const projectId = e.target.closest(".ver-proyecto").dataset.id
        abrirModalDetalleProyecto(projectId)
      }
    })

    // Ver historial
    document.addEventListener("click", (e) => {
      if (e.target.closest(".ver-historial")) {
        const projectId = e.target.closest(".ver-historial").dataset.id
        abrirModalHistorialProyecto(projectId)
      }
    })

    // Botón para ver historial desde el modal de detalles
    document.getElementById("btnVerHistorial").addEventListener("click", () => {
      if (currentProject) {
        abrirModalHistorialProyecto(currentProject.id)
      }
    })

    // Confirmar asignación
    document.getElementById("btnConfirmarAsignacion").addEventListener("click", () => {
      asignarProyecto()
    })

    // Confirmar verificación
    document.getElementById("btnConfirmarVerificacion").addEventListener("click", () => {
      procesarVerificacion()
    })

    // Añadir evento para recargar proyectos al hacer clic en la pestaña "Por Asignar"
    document.getElementById("porAsignar-tab").addEventListener("click", () => {
      loadProjects()
    })

    // Add filter event listeners
    setupFilterEventListeners()

    // Populate date filters
    populateDateFilters()
  }

  // Función para abrir el modal de asignar proyecto
  function abrirModalAsignarProyecto(projectId) {
    const project = Storage.getProjectById(projectId)
    if (!project) return

    currentProject = project

    // Llenar datos del proyecto
    document.getElementById("proyectoIdAsignar").value = project.id
    document.getElementById("asignarProyectoId").textContent = project.id
    document.getElementById("asignarProyectoNombre").textContent = project.nombre
    document.getElementById("asignarProyectoPRST").textContent =
      project.prstNombre || project.creadorNombre || "No definido"
    document.getElementById("asignarProyectoMunicipio").textContent = project.municipio || "No definido"
    document.getElementById("asignarProyectoDepartamento").textContent = project.departamento || "No definido"

    // Cargar analistas disponibles
    const analistas = Storage.getUsers().filter((user) => user.rol === "analista" && user.activo)
    const selectAnalistas = document.getElementById("analistaAsignado")
    selectAnalistas.innerHTML = '<option value="">Seleccione un analista</option>'

    analistas.forEach((analista) => {
      const option = document.createElement("option")
      option.value = analista.id
      option.textContent = `${analista.nombre} ${analista.apellido || ""} - ${analista.cargo || "Analista"}`
      selectAnalistas.appendChild(option)
    })

    // Cargar brigadas disponibles
    const brigadas = Storage.getUsers().filter((user) => user.rol === "brigada" && user.activo)
    const selectBrigadas = document.getElementById("brigadaAsignada")
    selectBrigadas.innerHTML = '<option value="">Seleccione una brigada</option>'

    brigadas.forEach((brigada) => {
      const option = document.createElement("option")
      option.value = brigada.id
      option.textContent = `${brigada.nombre} - ${brigada.departamento || "Sin departamento"}`
      selectBrigadas.appendChild(option)
    })

    // Mostrar contenedor de analistas por defecto
    document.getElementById("contenedorAnalistas").style.display = "block"
    document.getElementById("contenedorBrigadas").style.display = "none"
    document.getElementById("tipoAsignacion").value = "analista"

    // Limpiar comentarios
    document.getElementById("comentarioAsignacion").value = ""

    // Mostrar modal
    const modalAsignarProyectoEl = document.getElementById("modalAsignarProyecto")
    const modalAsignarProyecto = new bootstrap.Modal(modalAsignarProyectoEl)
    modalAsignarProyecto.show()
  }

  // Función para asignar proyecto
  // Mejorar la función asignarProyecto para asegurar que se guarde correctamente la información de asignación
  function asignarProyecto() {
    if (!currentProject) return

    const tipoAsignacion = document.getElementById("tipoAsignacion").value
    let asignadoId = null
    let asignadoNombre = ""

    if (tipoAsignacion === "analista") {
      asignadoId = document.getElementById("analistaAsignado").value
      if (!asignadoId) {
        mostrarMensaje("Error", "Debe seleccionar un analista para asignar el proyecto.")
        return
      }
      const analista = Storage.getUserById(asignadoId)
      asignadoNombre = `${analista.nombre} ${analista.apellido || ""}`
    } else {
      asignadoId = document.getElementById("brigadaAsignada").value
      if (!asignadoId) {
        mostrarMensaje("Error", "Debe seleccionar una brigada para asignar el proyecto.")
        return
      }
      const brigada = Storage.getUserById(asignadoId)
      asignadoNombre = brigada.nombre
    }

    const comentario = document.getElementById("comentarioAsignacion").value

    // Actualizar proyecto
    if (tipoAsignacion === "analista") {
      currentProject.estado = "En Gestion por Analista"
      currentProject.analistaId = asignadoId
      currentProject.analistaNombre = asignadoNombre
      currentProject.brigadaId = null
      currentProject.brigadaNombre = null
    } else {
      currentProject.estado = "En Gestion por Brigada"
      currentProject.brigadaId = asignadoId
      currentProject.brigadaNombre = asignadoNombre
      currentProject.analistaId = null
      currentProject.analistaNombre = null
    }

    currentProject.fechaAsignacion = new Date().toISOString()

    // Asegurarse de que el proyecto tenga la información del coordinador
    if (!currentProject.coordinadorId) {
      currentProject.coordinadorId = loggedUser.id
    }
    if (!currentProject.coordinadorNombre) {
      currentProject.coordinadorNombre = `${loggedUser.nombre} ${loggedUser.apellido || ""}`
    }

    // Agregar al historial
    if (!currentProject.historial) {
      currentProject.historial = []
    }

    currentProject.historial.push({
      estado: currentProject.estado,
      fecha: new Date().toISOString(),
      usuario: `${loggedUser.nombre} ${loggedUser.apellido || ""}`,
      rol: "Coordinador",
      comentario: `Proyecto asignado a ${asignadoNombre}${comentario ? `. Comentario: ${comentario}` : ""}`,
    })

    // Guardar proyecto
    Storage.saveProject(currentProject)

    // Notificar al asignado
    Storage.createNotification({
      usuarioId: asignadoId,
      tipo: "proyecto_asignado",
      mensaje: `Se te ha asignado el proyecto "${currentProject.nombre}" con ID ${currentProject.id}.`,
      fechaCreacion: new Date().toISOString(),
      leido: false,
    })

    // Cerrar modal
    const modalAsignarProyectoEl = document.getElementById("modalAsignarProyecto")
    const modalAsignarProyecto = bootstrap.Modal.getInstance(modalAsignarProyectoEl)
    modalAsignarProyecto.hide()

    // Mostrar mensaje de éxito
    mostrarMensaje("Éxito", `Proyecto asignado correctamente a ${asignadoNombre}.`)

    // Recargar proyectos
    loadProjects()
  }

  // Función para abrir el modal de revisar verificación
  function abrirModalRevisarVerificacion(projectId) {
    const project = Storage.getProjectById(projectId)
    if (!project) return

    currentProject = project

    // Llenar datos del proyecto
    document.getElementById("proyectoIdVerificar").value = project.id
    document.getElementById("verificarProyectoId").textContent = project.id
    document.getElementById("verificarProyectoNombre").textContent = project.nombre
    document.getElementById("verificarProyectoPRST").textContent =
      project.prstNombre || project.creadorNombre || "No definido"
    document.getElementById("verificarProyectoAsignado").textContent =
      project.analistaNombre || project.brigadaNombre || "No asignado"
    document.getElementById("verificarProyectoEstado").textContent = project.estado

    // Mostrar observaciones
    document.getElementById("verificarObservaciones").innerHTML =
      project.observacionesVerificacion || "No hay observaciones."

    // Cargar documentos verificados
    const tablaDocumentos = document.getElementById("tablaDocumentosVerificados")
    tablaDocumentos.innerHTML = ""

    if (project.documentosVerificados) {
      Object.entries(project.documentosVerificados).forEach(([doc, info]) => {
        const row = document.createElement("tr")
        row.innerHTML = `
          <td>${getDocumentName(doc)}</td>
          <td>
            <span class="badge ${info.aprobado ? "bg-success" : "bg-danger"}">
              ${info.aprobado ? "Aprobado" : "Rechazado"}
            </span>
          </td>
          <td>${info.observaciones || "Sin observaciones"}</td>
        `
        tablaDocumentos.appendChild(row)
      })
    } else {
      tablaDocumentos.innerHTML = `
        <tr>
          <td colspan="3" class="text-center">No hay documentos verificados</td>
        </tr>
      `
    }

    // Limpiar campos
    document.getElementById("decisionVerificacion").value = "aprobar"
    document.getElementById("comentarioVerificacion").value = ""

    // Mostrar modal
    const modalProcesarSolicitud = new bootstrap.Modal(document.getElementById("modalProcesarSolicitud"))
    modalProcesarSolicitud.show()
  }

  // Función para procesar verificación
  function procesarVerificacion() {
    if (!currentProject) return

    const decision = document.getElementById("decisionVerificacion").value
    const comentario = document.getElementById("comentarioVerificacion").value

    if (decision === "aprobar") {
      // Aprobar verificación
      currentProject.estado = "Verificado"
      currentProject.fechaVerificacionAprobada = new Date().toISOString()
    } else {
      // Rechazar verificación
      currentProject.estado = "Documentación Errada"
      currentProject.fechaVerificacionRechazada = new Date().toISOString()
    }

    // Agregar al historial
    if (!currentProject.historial) {
      currentProject.historial = []
    }

    currentProject.historial.push({
      estado: currentProject.estado,
      fecha: new Date().toISOString(),
      usuario: `${loggedUser.nombre} ${loggedUser.apellido || ""}`,
      rol: "Coordinador",
      comentario: `Verificación ${decision === "aprobar" ? "aprobada" : "rechazada"}${comentario ? `. Comentario: ${comentario}` : ""}`,
    })

    // Guardar comentario de coordinador
    currentProject.observacionesCoordinador = comentario

    // Guardar proyecto
    Storage.saveProject(currentProject)

    // Notificar al asignado
    const asignadoId = currentProject.analistaId || currentProject.brigadaId
    if (asignadoId) {
      Storage.createNotification({
        usuarioId: asignadoId,
        tipo: decision === "aprobar" ? "verificacion_aprobada" : "verificacion_rechazada",
        mensaje: `La verificación del proyecto "${currentProject.nombre}" ha sido ${decision === "aprobar" ? "aprobada" : "rechazada"}.`,
        fechaCreacion: new Date().toISOString(),
        leido: false,
      })
    }

    // Cerrar modal
    const modalProcesarSolicitud = bootstrap.Modal.getInstance(document.getElementById("modalProcesarSolicitud"))
    modalProcesarSolicitud.hide()

    // Mostrar mensaje de éxito
    mostrarMensaje("Éxito", `Verificación ${decision === "aprobar" ? "aprobada" : "rechazada"} correctamente.`)

    // Recargar proyectos
    loadProjects()
  }

  // Función para abrir el modal de detalle de proyecto
  function abrirModalDetalleProyecto(projectId) {
    const project = Storage.getProjectById(projectId)
    if (!project) return

    currentProject = project

    // Llenar datos del proyecto
    document.getElementById("detalleProyectoId").textContent = project.id
    document.getElementById("detalleProyectoNombre").textContent = project.nombre
    document.getElementById("detalleProyectoPRST").textContent =
      project.prstNombre || project.creadorNombre || "No definido"
    document.getElementById("detalleProyectoDireccionInicial").textContent = project.direccionInicial || "No definido"
    document.getElementById("detalleProyectoDireccionFinal").textContent = project.direccionFinal || "No definido"
    document.getElementById("detalleProyectoBarrios").textContent = project.barrios?.join(", ") || "No definido"
    document.getElementById("detalleProyectoMunicipio").textContent = project.municipio || "No definido"
    document.getElementById("detalleProyectoDepartamento").textContent = project.departamento || "No definido"
    document.getElementById("detalleProyectoNumeroPostes").textContent = project.numPostes || "No definido"
    document.getElementById("detalleProyectoFechaInicio").textContent = project.fechaInicio || "N/A"
    document.getElementById("detalleProyectoFechaFin").textContent = project.fechaFin || "N/A"
    document.getElementById("detalleProyectoPuntoConexion").textContent = project.puntoConexion || "N/A"

    // Mostrar estado del proyecto
    document.getElementById("detalleProyectoEstado").textContent = project.estado || "No definido"
    document.getElementById("detalleProyectoAsignado").textContent =
      project.analistaNombre || project.brigadaNombre || "No asignado"
    document.getElementById("detalleProyectoFechaAsignacion").textContent = project.fechaAsignacion
      ? formatDateTime(project.fechaAsignacion)
      : "N/A"

    // Mostrar observaciones de ejecutiva si existen
    if (project.observacionesEjecutiva) {
      document.getElementById("detalleProyectoObservaciones").innerHTML = project.observacionesEjecutiva.replace(
        /\n/g,
        "<br>",
      )
    } else {
      document.getElementById("detalleProyectoObservaciones").textContent = "No hay observaciones"
    }

    // Cargar documentos
    const tablaDocumentos = document.getElementById("tablaDocumentosDetalle")
    tablaDocumentos.innerHTML = ""

    if (project.documentos) {
      const documentos = [
        { key: "kmz", name: "Archivo KMZ" },
        { key: "dwg", name: "Plano DWG" },
        { key: "plano", name: "Plano PDF" },
        { key: "matricula", name: "Matrícula Profesional" },
        { key: "cc", name: "Cédula de Ciudadanía" },
        { key: "formulario", name: "Formulario de Caracterización" },
      ]

      documentos.forEach((doc) => {
        if (project.documentos[doc.key]) {
          const row = document.createElement("tr")

          // Determinar estado del documento
          let estadoDocumento = "Pendiente"
          let badgeClass = "bg-warning"

          if (project.documentosVerificados && project.documentosVerificados[doc.key]) {
            estadoDocumento = project.documentosVerificados[doc.key].aprobado ? "Aprobado" : "Rechazado"
            badgeClass = project.documentosVerificados[doc.key].aprobado ? "bg-success" : "bg-danger"
          }

          row.innerHTML = `
          <td>${doc.name}</td>
          <td><span class="badge ${badgeClass}">${estadoDocumento}</span></td>
          <td>
            <button class="btn btn-sm btn-primary">
              <i class="bi bi-download"></i> Descargar
            </button>
          </td>
        `
          tablaDocumentos.appendChild(row)
        }
      })
    }

    if (tablaDocumentos.innerHTML === "") {
      tablaDocumentos.innerHTML = `
      <tr>
        <td colspan="3" class="text-center">No hay documentos disponibles</td>
      </tr>
    `
    }

    // Mostrar modal
    const modalDetalleProyectoEl = document.getElementById("modalDetalleProyecto")
    const modalDetalleProyecto = new bootstrap.Modal(modalDetalleProyectoEl)
    modalDetalleProyecto.show()
  }

  // Función para abrir el modal de historial de proyecto
  function abrirModalHistorialProyecto(projectId) {
    const project = Storage.getProjectById(projectId)
    if (!project) return

    // Crear historial si no existe
    if (!project.historial) {
      project.historial = []

      // Agregar estado inicial
      project.historial.push({
        estado: "Nuevo",
        fecha: project.fechaCreacion,
        usuario: project.creadorNombre,
        rol: "PRST",
        comentario: "Proyecto creado",
      })

      // Agregar otros estados si existen fechas
      if (project.fechaEnvio) {
        project.historial.push({
          estado: "En Revision por Ejecutiva",
          fecha: project.fechaEnvio,
          usuario: project.creadorNombre,
          rol: "PRST",
          comentario: "Proyecto enviado a revisión",
        })
      }

      if (project.fechaAprobacion) {
        project.historial.push({
          estado: "En Asignación",
          fecha: project.fechaAprobacion,
          usuario: project.ejecutivaNombre || "Ejecutiva",
          rol: "Ejecutiva",
          comentario: "Proyecto aprobado y enviado a coordinación",
        })
      }

      if (project.fechaAsignacion) {
        project.historial.push({
          estado: project.analistaId ? "En Gestion por Analista" : "En Gestion por Brigada",
          fecha: project.fechaAsignacion,
          usuario: project.coordinadorNombre || "Coordinador",
          rol: "Coordinador",
          comentario: project.analistaId
            ? `Proyecto asignado al analista ${project.analistaNombre}`
            : `Proyecto asignado a la brigada ${project.brigadaNombre}`,
        })
      }

      // Guardar el historial
      Storage.saveProject(project)
    }

    // Ordenar historial por fecha (más recientes primero)
    const sortedHistory = [...project.historial].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    // Cargar historial en la tabla
    const tablaHistorial = document.getElementById("tablaHistorialProyecto")
    tablaHistorial.innerHTML = ""

    sortedHistory.forEach((item) => {
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${formatDateTime(item.fecha)}</td>
        <td><span class="badge ${getBadgeClass(item.estado)}">${item.estado}</span></td>
        <td>${item.usuario}</td>
        <td>${item.rol}</td>
        <td>${item.comentario}</td>
      `
      tablaHistorial.appendChild(row)
    })

    // Mostrar modal
    const modalHistorialProyectoEl = document.getElementById("modalHistorialProyecto")
    const modalHistorialProyecto = new bootstrap.Modal(modalHistorialProyectoEl)
    modalHistorialProyecto.show()
  }

  // Función para buscar proyectos
  function buscarProyectos(tablaId, inputId) {
    const searchText = document.getElementById(inputId).value.toLowerCase()
    const tabla = document.getElementById(tablaId)
    const filas = tabla.querySelectorAll("tr")

    filas.forEach((fila) => {
      if (fila.cells && fila.cells.length > 1) {
        // Ignorar filas de encabezado o mensajes
        const textoFila = Array.from(fila.cells)
          .map((cell) => cell.textContent.toLowerCase())
          .join(" ")

        if (textoFila.includes(searchText)) {
          fila.style.display = ""
        } else {
          fila.style.display = "none"
        }
      }
    })
  }

  // Función para cambiar contraseña
  function cambiarPassword() {
    const passwordActual = document.getElementById("passwordActual").value
    const passwordNueva = document.getElementById("passwordNueva").value
    const passwordConfirmar = document.getElementById("passwordConfirmar").value

    // Validar campos
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      mostrarMensaje("Error", "Por favor, complete todos los campos.")
      return
    }

    // Validar que las contraseñas coincidan
    if (passwordNueva !== passwordConfirmar) {
      mostrarMensaje("Error", "Las contraseñas nuevas no coinciden.")
      return
    }

    // Validar contraseña actual
    if (passwordActual !== loggedUser.password) {
      mostrarMensaje("Error", "La contraseña actual es incorrecta.")
      return
    }

    // Actualizar contraseña
    loggedUser.password = passwordNueva
    Storage.saveUser(loggedUser)
    Storage.setLoggedUser(loggedUser)

    // Mostrar mensaje de éxito
    mostrarMensaje("Éxito", "Contraseña actualizada correctamente.")

    // Limpiar formulario
    document.getElementById("formCambiarPassword").reset()
  }

  // Función para mostrar mensajes
  function mostrarMensaje(titulo, mensaje) {
    document.getElementById("tituloModalMensaje").textContent = titulo
    document.getElementById("textoModalMensaje").textContent = mensaje

    const modalMensajeEl = document.getElementById("modalMensaje")
    const modalMensaje = new bootstrap.Modal(modalMensajeEl)
    modalMensaje.show()
  }

  // Función para formatear fecha y hora
  function formatDateTime(dateString) {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Función para obtener clase de badge según estado
  function getBadgeClass(estado) {
    switch (estado) {
      case "Nuevo":
        return "bg-secondary"
      case "En Revision por Ejecutiva":
        return "bg-warning text-dark"
      case "En Asignación":
        return "bg-info text-dark"
      case "Asignado":
        return "bg-primary"
      case "En Revision de Verificacion":
        return "bg-info"
      case "Opcion Mejorar":
        return "bg-warning"
      case "Generacion de Informe":
        return "bg-light text-dark"
      case "Finalizado":
        return "bg-success"
      case "Documentación Errada":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  // Función para obtener nombre del documento
  function getDocumentName(key) {
    const documentNames = {
      kmz: "Archivo KMZ",
      dwg: "Plano DWG",
      plano: "Plano PDF",
      matricula: "Matrícula Profesional",
      cc: "Cédula de Ciudadanía",
      formulario: "Formulario de Caracterización",
    }

    return documentNames[key] || key
  }
})

// Inicializar Bootstrap tooltips y popovers
document.addEventListener("DOMContentLoaded", () => {
  // Tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

  // Popovers
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  var popoverList = popoverTriggerList.map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl))
})

