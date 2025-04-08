document.addEventListener("DOMContentLoaded", () => {
  // Inicializar el almacenamiento
  Storage.init()

  // Verificar si hay un usuario logueado y si es administrador
  const loggedUser = Storage.getLoggedUser()
  if (!loggedUser) {
    window.location.href = "./login.html"
    return
  } else if (loggedUser.rol !== "admin") {
    window.location.href = "./dashboard.html"
    return
  }

  // Mostrar nombre del administrador
  document.getElementById("nombreAdmin").textContent = loggedUser.nombre

  // Cargar notificaciones
  cargarNotificaciones()

  // Elementos de navegación
  const navUsuarios = document.getElementById("navUsuarios")
  const navProyectos = document.getElementById("navProyectos")
  const navAsignaciones = document.getElementById("navAsignaciones")
  const navSolicitudes = document.getElementById("navSolicitudes")
  const cerrarSesion = document.getElementById("cerrarSesion")

  // Secciones
  const seccionUsuarios = document.getElementById("seccionUsuarios")
  const seccionProyectos = document.getElementById("seccionProyectos")
  const seccionAsignaciones = document.getElementById("seccionAsignaciones")
  const seccionSolicitudes = document.getElementById("seccionSolicitudes")

  // Botones
  const btnNuevoUsuario = document.getElementById("btnNuevoUsuario")
  const btnNuevoProyecto = document.getElementById("btnNuevoProyecto")
  const btnGuardarUsuario = document.getElementById("btnGuardarUsuario")
  const btnGuardarProyecto = document.getElementById("btnGuardarProyecto")
  const btnGuardarAsignaciones = document.getElementById("btnGuardarAsignaciones")
  const markAllAsRead = document.getElementById("markAllAsRead")

  // Filtros
  const filtroRolUsuario = document.getElementById("filtroRolUsuario")
  const filtroSectorUsuario = document.getElementById("filtroSectorUsuario")
  const buscarUsuario = document.getElementById("buscarUsuario")
  const filtroEstadoProyecto = document.getElementById("filtroEstadoProyecto")
  const filtroSectorProyecto = document.getElementById("filtroSectorProyecto")
  const filtroPRST = document.getElementById("filtroPRST")
  const buscarProyecto = document.getElementById("buscarProyecto")
  const filtroEstadoSolicitud = document.getElementById("filtroEstadoSolicitud")
  const buscarSolicitud = document.getElementById("buscarSolicitud")

  // Asignaciones
  const sectorAsignacion = document.getElementById("sectorAsignacion")
  const buscarProyectoAsignacion = document.getElementById("buscarProyectoAsignacion")
  const buscarUsuarioDisponible = document.getElementById("buscarUsuarioDisponible")

  // Variables globales
  let proyectoSeleccionado = null
  let usuariosAsignados = []
  let mapaPreview = null
  let mapaDetalle = null
  let proyectosFiltrados = []

  // Declaración de variables Bootstrap, L, JSZip y KMLHandler
  const bootstrap = window.bootstrap
  const L = window.L
  const JSZip = window.JSZip
  const KMLHandler = window.KMLHandler

  // Función para mostrar mensajes
  function mostrarMensaje(title, text, icon = "success") {
    document.getElementById("tituloModalMensaje").textContent = title
    document.getElementById("textoModalMensaje").textContent = text

    const modalMensaje = new bootstrap.Modal(document.getElementById("modalMensaje"))
    modalMensaje.show()
  }

  // Event listeners para navegación
  navUsuarios.addEventListener("click", (e) => {
    e.preventDefault()
    mostrarSeccion(seccionUsuarios)
    actualizarNavActivo(navUsuarios)
    cargarUsuarios()
  })

  navProyectos.addEventListener("click", (e) => {
    e.preventDefault()
    mostrarSeccion(seccionProyectos)
    actualizarNavActivo(navProyectos)
    cargarProyectos()
  })

  navAsignaciones.addEventListener("click", (e) => {
    e.preventDefault()
    mostrarSeccion(seccionAsignaciones)
    actualizarNavActivo(navAsignaciones)
    cargarProyectosPorSector()
  })

  navSolicitudes.addEventListener("click", (e) => {
    e.preventDefault()
    mostrarSeccion(seccionSolicitudes)
    actualizarNavActivo(navSolicitudes)
    cargarSolicitudes()
  })

  cerrarSesion.addEventListener("click", (e) => {
    e.preventDefault()
    Storage.logout()
    window.location.href = "./login.html"
  })

  // Event listeners para botones
  btnNuevoUsuario.addEventListener("click", abrirModalNuevoUsuario)
  btnNuevoProyecto.addEventListener("click", abrirModalNuevoProyecto)
  btnGuardarUsuario.addEventListener("click", guardarUsuario)
  btnGuardarProyecto.addEventListener("click", guardarProyecto)
  btnGuardarAsignaciones.addEventListener("click", guardarAsignaciones)
  markAllAsRead.addEventListener("click", marcarTodasLeidas)

  // Event listeners para filtros
  filtroRolUsuario.addEventListener("change", cargarUsuarios)
  filtroSectorUsuario.addEventListener("change", cargarUsuarios)
  buscarUsuario.addEventListener("input", cargarUsuarios)
  filtroEstadoProyecto.addEventListener("change", cargarProyectos)
  filtroSectorProyecto.addEventListener("change", cargarProyectos)
  buscarProyecto.addEventListener("input", cargarProyectos)
  filtroEstadoSolicitud.addEventListener("change", cargarSolicitudes)
  buscarSolicitud.addEventListener("input", cargarSolicitudes)

  // Event listeners para asignaciones
  sectorAsignacion.addEventListener("change", cargarProyectosPorSector)
  buscarUsuarioDisponible.addEventListener("input", filtrarUsuariosDisponibles)

  // Añadir event listener para la búsqueda de proyectos
  if (buscarProyectoAsignacion) {
    buscarProyectoAsignacion.addEventListener("input", function () {
      mostrarProyectosFiltrados(this.value)
    })
  }

  // Agregar esta función al inicio del DOMContentLoaded:
  function actualizarOpcionesDepartamentos() {
    // Lista de selectores que contienen opciones de sector/departamento
    const selectoresDepartamento = [
      "sector",
      "filtroSectorUsuario",
      "sectorProyecto",
      "filtroSectorProyecto",
      "sectorAsignacion",
    ]

    // Nuevos departamentos
    const departamentos = [
      { value: "", text: "Seleccione..." },
      { value: "Guajira", text: "Guajira" },
      { value: "Atlantico", text: "Atlántico" },
      { value: "Magdalena", text: "Magdalena" },
    ]

    // Añadir "Todos" solo para filtros, no para asignación
    const departamentosConTodos = [...departamentos, { value: "Todos", text: "Todos" }]

    // Actualizar cada selector
    selectoresDepartamento.forEach((id) => {
      const select = document.getElementById(id)
      if (select) {
        // Guardar el valor seleccionado actualmente
        const valorActual = select.value

        // Limpiar opciones actuales
        select.innerHTML = ""

        // Determinar qué lista de departamentos usar
        const listaAUsar = id === "sectorAsignacion" ? departamentos : departamentosConTodos

        // Agregar nuevas opciones
        listaAUsar.forEach((dep) => {
          const option = document.createElement("option")
          option.value = dep.value
          option.textContent = dep.text
          select.appendChild(option)
        })

        // Intentar restaurar el valor seleccionado si existe en las nuevas opciones
        if (listaAUsar.some((d) => d.value === valorActual)) {
          select.value = valorActual
        }
      }
    })
  }

  // Inicializar la página
  cargarUsuarios()

  // Llamar a esta función después de inicializar la página
  // Agregar después de cargarUsuarios() en la inicialización:
  actualizarOpcionesDepartamentos()

  // Función para mostrar una sección y ocultar las demás
  function mostrarSeccion(seccion) {
    seccionUsuarios.style.display = "none"
    seccionProyectos.style.display = "none"
    seccionAsignaciones.style.display = "none"
    seccionSolicitudes.style.display = "none"
    seccion.style.display = "block"
  }

  // Función para actualizar la navegación activa
  function actualizarNavActivo(navActivo) {
    navUsuarios.classList.remove("active")
    navProyectos.classList.remove("active")
    navAsignaciones.classList.remove("active")
    navSolicitudes.classList.remove("active")
    navActivo.classList.add("active")
  }

  // Función para cargar notificaciones
  function cargarNotificaciones() {
    const notificaciones = Storage.getNotificationsByUser(loggedUser.id)
    const notificationCount = document.getElementById("notificationCount")
    const notificationsList = document.getElementById("notificationsList")

    // Contar notificaciones no leídas
    const noLeidas = notificaciones.filter((n) => !n.leido).length
    notificationCount.textContent = noLeidas

    // Si no hay notificaciones, mostrar mensaje
    if (notificaciones.length === 0) {
      notificationsList.innerHTML = `
        <div class="notification-empty">
          <i class="bi bi-bell-slash"></i>
          <p>No tienes notificaciones</p>
        </div>
      `
      return
    }

    // Ordenar notificaciones por fecha (más recientes primero)
    notificaciones.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))

    // Generar HTML para las notificaciones
    let html = ""
    notificaciones.forEach((notif) => {
      const fecha = new Date(notif.fechaCreacion)
      const fechaFormateada = fecha.toLocaleDateString() + " " + fecha.toLocaleTimeString()

      let icono = "bi-bell"
      let titulo = "Notificación"

      // Determinar icono y título según el tipo
      switch (notif.tipo) {
        case "proyecto_creado":
          icono = "bi-folder-plus"
          titulo = "Nuevo Proyecto"
          break
        case "proyecto_actualizado":
          icono = "bi-folder-check"
          titulo = "Proyecto Actualizado"
          break
        case "proyecto_asignado":
          icono = "bi-person-check"
          titulo = "Asignación de Proyecto"
          break
        case "censo_creado":
          icono = "bi-clipboard-plus"
          titulo = "Nuevo Censo"
          break
        case "solicitud_password":
          icono = "bi-key"
          titulo = "Solicitud de Contraseña"
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

        // Si es una notificación de solicitud de contraseña, abrir la sección de solicitudes
        const notif = notificaciones.find((n) => n.id === id)
        if (notif && notif.tipo === "solicitud_password") {
          mostrarSeccion(seccionSolicitudes)
          actualizarNavActivo(navSolicitudes)
          cargarSolicitudes()
        }
      })
    })
  }

  // Función para marcar todas las notificaciones como leídas
  function marcarTodasLeidas() {
    Storage.markAllNotificationsAsRead(loggedUser.id)
    cargarNotificaciones()
  }

  // Función para cargar usuarios
  function cargarUsuarios() {
    const usuarios = Storage.getUsers()
    const tablaUsuarios = document.getElementById("tablaUsuarios")

    // Aplicar filtros
    const rolFiltro = filtroRolUsuario.value
    const sectorFiltro = filtroSectorUsuario.value
    const busqueda = buscarUsuario.value.toLowerCase()

    const usuariosFiltrados = usuarios.filter((usuario) => {
      const cumpleRol = !rolFiltro || usuario.rol === rolFiltro
      const cumpleSector = !sectorFiltro || usuario.sector === sectorFiltro
      const cumpleBusqueda =
        !busqueda ||
        (usuario.nombre && usuario.nombre.toLowerCase().includes(busqueda)) ||
        (usuario.apellido && usuario.apellido.toLowerCase().includes(busqueda)) ||
        (usuario.usuario && usuario.usuario.toLowerCase().includes(busqueda)) ||
        (usuario.correo && usuario.correo.toLowerCase().includes(busqueda))

      return cumpleRol && cumpleSector && cumpleBusqueda
    })

    // Generar HTML para la tabla
    let html = ""
    usuariosFiltrados.forEach((usuario) => {
      // Determinar el texto del rol y clase del badge
      let rolTexto = ""
      let rolBadgeClass = ""

      switch (usuario.rol) {
        case "admin":
          rolTexto = "Administrador"
          rolBadgeClass = "bg-danger"
          break
        case "prst":
          rolTexto = "PRST"
          rolBadgeClass = "bg-primary"
          break
        case "ejecutiva":
          rolTexto = "Ejecutiva"
          rolBadgeClass = "bg-info"
          break
        case "coordinador":
          rolTexto = "Coordinador"
          rolBadgeClass = "bg-warning"
          break
        case "analista":
          rolTexto = "Analista"
          rolBadgeClass = "bg-secondary"
          break
        case "brigada":
          rolTexto = "Brigada"
          rolBadgeClass = "bg-success"
          break
        case "trabajador":
          rolTexto = "Trabajador"
          rolBadgeClass = "bg-dark"
          break
        default:
          rolTexto = usuario.rol
          rolBadgeClass = "bg-light text-dark"
      }

      html += `
        <tr>
          <td>${usuario.id}</td>
          <td>${usuario.nombre} ${usuario.apellido || ""}</td>
          <td>${usuario.usuario}</td>
          <td>${usuario.correo}</td>
          <td>
            <span class="badge ${rolBadgeClass}">
              ${rolTexto}
            </span>
          </td>
          <td>${usuario.nombreBrigada || usuario.nombrePRST || "N/A"}</td>
          <td>${usuario.sector || "N/A"}</td>
          <td>
            <button class="btn btn-sm btn-primary me-1" onclick="editarUsuario('${usuario.id}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="eliminarUsuario('${usuario.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `
    })

    if (usuariosFiltrados.length === 0) {
      html = `
        <tr>
          <td colspan="8" class="text-center">No se encontraron usuarios</td>
        </tr>
      `
    }

    tablaUsuarios.innerHTML = html
  }

  // Función para abrir modal de nuevo usuario
  function abrirModalNuevoUsuario() {
    document.getElementById("tituloModalUsuario").textContent = "Nuevo Usuario"
    document.getElementById("formUsuario").reset()
    document.getElementById("usuarioId").value = ""

    const modalUsuario = new bootstrap.Modal(document.getElementById("modalUsuario"))
    modalUsuario.show()
  }

  // Función para guardar usuario
  function guardarUsuario() {
    const form = document.getElementById("formUsuario")

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const usuarioId = document.getElementById("usuarioId").value
    const usuario = {
      id: usuarioId || null,
      nombre: document.getElementById("nombre").value,
      apellido: document.getElementById("apellido").value || "",
      nombreBrigada: document.getElementById("nombreBrigada").value || "",
      cargo: document.getElementById("cargo").value || "",
      correo: document.getElementById("correo").value,
      usuario: document.getElementById("usuario").value,
      password: document.getElementById("password").value,
      rol: document.getElementById("rol").value,
      sector: document.getElementById("sector").value || "",
      activo: true,
    }

    // Campos específicos por rol
    if (usuario.rol === "prst") {
      usuario.nombrePRST = document.getElementById("nombrePRST").value || ""
      usuario.cedula = document.getElementById("cedula").value || ""
      usuario.matriculaProfesional = document.getElementById("matriculaProfesional").value || ""
    } else if (usuario.rol === "coordinador") {
      usuario.tipoCoordinador = document.getElementById("tipoCoordinador").value || ""
    }

    // Verificar si ya existe un usuario con ese nombre de usuario o correo
    const usuarios = Storage.getUsers()
    const usuarioExistente = usuarios.find((u) => u.usuario === usuario.usuario && (!usuarioId || u.id !== usuarioId))
    const correoExistente = usuarios.find((u) => u.correo === usuario.correo && (!usuarioId || u.id !== usuarioId))

    if (usuarioExistente) {
      mostrarMensaje("Error", "Ya existe un usuario con ese nombre de usuario.")
      return
    }

    if (correoExistente) {
      mostrarMensaje("Error", "Ya existe un usuario con ese correo electrónico.")
      return
    }

    // Guardar usuario
    Storage.saveUser(usuario)

    // Cerrar modal
    const modalUsuario = bootstrap.Modal.getInstance(document.getElementById("modalUsuario"))
    modalUsuario.hide()

    // Recargar tabla
    cargarUsuarios()

    // Mostrar mensaje
    mostrarMensaje("Éxito", `Usuario ${usuarioId ? "actualizado" : "creado"} correctamente.`)
  }

  // Función para cargar proyectos
  function cargarProyectos() {
    const proyectos = Storage.getProjects()
    const tablaProyectos = document.getElementById("tablaProyectos")

    // Cambiar el encabezado de la tabla de "Sector" a "Departamento"
    const encabezadosSector = document.querySelectorAll("th")
    encabezadosSector.forEach((th) => {
      if (th.textContent.includes("Sector")) {
        th.textContent = "Departamento"
      }
    })

    // Aplicar filtros
    const estadoFiltro = filtroEstadoProyecto.value
    const sectorFiltro = filtroSectorProyecto.value
    const busqueda = buscarProyecto.value.toLowerCase()

    const proyectosFiltrados = proyectos.filter((proyecto) => {
      const cumpleEstado = !estadoFiltro || proyecto.estado === estadoFiltro
      const cumpleSector = !sectorFiltro || proyecto.sector === sectorFiltro
      const cumpleBusqueda =
        !busqueda ||
        proyecto.nombre.toLowerCase().includes(busqueda) ||
        (proyecto.descripcion && proyecto.descripcion.toLowerCase().includes(busqueda))

      return cumpleEstado && cumpleSector && cumpleBusqueda
    })

    // Generar HTML para la tabla
    let html = ""
    proyectosFiltrados.forEach((proyecto) => {
      // Obtener progreso del proyecto
      const progreso = Storage.getProjectProgress(proyecto.id)

      // Contar usuarios asignados
      const usuariosAsignadosCount = proyecto.usuariosAsignados ? proyecto.usuariosAsignados.length : 0

      // Contar postes totales
      let postesTotales = 0
      if (proyecto.kmlData && proyecto.kmlData.puntos) {
        postesTotales = proyecto.kmlData.puntos.filter((p) => {
          const nombre = (p.nombre || "").toLowerCase()
          const descripcion = (p.descripcion || "").toLowerCase()
          return (
            nombre.includes("poste") ||
            descripcion.includes("poste") ||
            /^p\d+$/i.test(nombre) ||
            /^poste\s*\d+$/i.test(nombre) ||
            /^\d+$/.test(nombre)
          )
        }).length
      }

      html += `
      <tr>
        <td>${proyecto.id}</td>
        <td>${proyecto.nombre}</td>
        <td>${proyecto.prst || proyecto.prstNombre || "N/A"}</td>
        <td>${proyecto.creadorNombre || "N/A"}</td>
        <td>${proyecto.municipio || "N/A"}</td>
        <td>${proyecto.departamento || proyecto.sector || "N/A"}</td>
        <td>${new Date(proyecto.fechaCreacion).toLocaleDateString()}</td>
        <td>
          <span class="badge ${proyecto.estado === "activo" ? "bg-success" : proyecto.estado === "inactivo" ? "bg-warning" : "bg-secondary"}">
            ${Storage.getStatusDisplayName(proyecto.estado)}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-info me-1" onclick="verDetalleProyecto('${proyecto.id}')">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-primary me-1" onclick="editarProyecto('${proyecto.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarProyecto('${proyecto.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `
    })

    if (proyectosFiltrados.length === 0) {
      html = `
      <tr>
        <td colspan="9" class="text-center">No se encontraron proyectos</td>
      </tr>
    `
    }

    tablaProyectos.innerHTML = html
  }

  // Función para abrir modal de nuevo proyecto
  function abrirModalNuevoProyecto() {
    document.getElementById("tituloModalProyecto").textContent = "Nuevo Proyecto"
    document.getElementById("formProyecto").reset()
    document.getElementById("proyectoId").value = ""
    document.getElementById("archivoKMLInfo").textContent =
      "Seleccione un archivo KML o KMZ con los puntos del proyecto."

    // Establecer el estado como "activo"
    document.getElementById("estado").value = "activo"
    document.getElementById("estadoHidden").value = "activo"

    // Deshabilitar el campo de nombre del proyecto
    document.getElementById("nombreProyecto").disabled = true
    document.getElementById("nombreProyecto").placeholder = "Se usará el nombre del archivo KML/KMZ"

    // Inicializar mapa de vista previa
    if (!mapaPreview) {
      mapaPreview = L.map("mapaPreview").setView([11.0041, -74.807], 13)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapaPreview)
    } else {
      mapaPreview.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapaPreview.removeLayer(layer)
        }
      })
    }

    const modalProyecto = new bootstrap.Modal(document.getElementById("modalProyecto"))
    modalProyecto.show()

    // Actualizar mapa después de que se muestre el modal
    setTimeout(() => {
      mapaPreview.invalidateSize()
    }, 300)
  }

  // Reemplazar la función guardarProyecto with this version mejorada
  function guardarProyecto() {
    const form = document.getElementById("formProyecto")

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const proyectoId = document.getElementById("proyectoId").value
    const proyecto = {
      id: proyectoId || null,
      nombre: document.getElementById("nombreProyecto").value,
      descripcion: document.getElementById("descripcion").value || "",
      sector: document.getElementById("sectorProyecto").value,
      estado: document.getElementById("estadoHidden").value || "activo", // Usar el valor oculto
      prst: document.getElementById("prstSolicitante").value || "", // Agregar el PRST solicitante
      usuariosAsignados: [],
    }

    // Si es un proyecto existente, mantener los datos del KML y usuarios asignados
    if (proyectoId) {
      const proyectoExistente = Storage.getProjectById(proyectoId)
      if (proyectoExistente) {
        proyecto.kmlData = proyectoExistente.kmlData
        proyecto.usuariosAsignados = proyectoExistente.usuariosAsignados || []
        // Mantener el nombre original del proyecto
        proyecto.nombre = proyectoExistente.nombre
      }
    }

    // Procesar archivo KML/KMZ si se seleccionó uno
    const archivoKML = document.getElementById("archivoKML").files[0]

    if (archivoKML) {
      if (archivoKML.name.toLowerCase().endsWith(".kmz")) {
        // Para archivos KMZ, usar KMLHandler
        KMLHandler.processFile(archivoKML)
          .then((kmlData) => {
            // Si es un proyecto nuevo, usar el nombre del archivo KMZ como nombre del proyecto
            if (!proyectoId) {
              const nombreArchivo = archivoKML.name.replace(/\.kmz$/i, "")
              proyecto.nombre = nombreArchivo
              document.getElementById("nombreProyecto").value = nombreArchivo
            }

            // Adaptar el formato de datos si es necesario
            const datosAdaptados = {
              puntos: kmlData.puntos.map((p) => ({
                nombre: p.nombre,
                descripcion: p.descripcion,
                lat: p.lat,
                lon: p.lng || p.lon,
              })),
              lineas: kmlData.rutas || [],
            }

            proyecto.kmlData = datosAdaptados

            // Guardar proyecto
            Storage.saveProject(proyecto)

            // Cerrar modal
            const modalProyecto = bootstrap.Modal.getInstance(document.getElementById("modalProyecto"))
            modalProyecto.hide()

            // Recargar tabla
            cargarProyectos()

            // Mostrar mensaje
            mostrarMensaje("Éxito", `Proyecto ${proyectoId ? "actualizado" : "creado"} correctamente.`)

            // Notificar a usuarios asignados si hay nuevos
            if (proyecto.usuariosAsignados && proyecto.usuariosAsignados.length > 0) {
              notificarUsuariosAsignados(proyecto)
            }
          })
          .catch((error) => {
            mostrarMensaje("Error", "Error al procesar el archivo KMZ: " + error.message)
          })
      } else {
        // Para archivos KML, usar el método anterior
        const reader = new FileReader()
        reader.onload = (e) => {
          const contenido = e.target.result

          try {
            // Si es un proyecto nuevo, usar el nombre del archivo KML como nombre del proyecto
            if (!proyectoId) {
              const nombreArchivo = archivoKML.name.replace(/\.kml$/i, "")
              proyecto.nombre = nombreArchivo
              document.getElementById("nombreProyecto").value = nombreArchivo
            }

            // Procesar KML directamente
            const kmlData = KMLHandler.procesarKML(contenido)
            proyecto.kmlData = kmlData

            // Guardar proyecto
            Storage.saveProject(proyecto)

            // Cerrar modal
            const modalProyecto = bootstrap.Modal.getInstance(document.getElementById("modalProyecto"))
            modalProyecto.hide()

            // Recargar tabla
            cargarProyectos()

            // Mostrar mensaje
            mostrarMensaje("Éxito", `Proyecto ${proyectoId ? "actualizado" : "creado"} correctamente.`)

            // Notificar a usuarios asignados si hay nuevos
            if (proyecto.usuariosAsignados && proyecto.usuariosAsignados.length > 0) {
              notificarUsuariosAsignados(proyecto)
            }
          } catch (error) {
            mostrarMensaje("Error", "Error al procesar el archivo KML: " + error.message)
          }
        }

        reader.readAsText(archivoKML)
      }
    } else {
      // Guardar proyecto sin KML
      Storage.saveProject(proyecto)

      // Cerrar modal
      const modalProyecto = bootstrap.Modal.getInstance(document.getElementById("modalProyecto"))
      modalProyecto.hide()

      // Recargar tabla
      cargarProyectos()

      // Mostrar mensaje
      mostrarMensaje("Éxito", `Proyecto ${proyectoId ? "actualizado" : "creado"} correctamente.`)

      // Notificar a usuarios asignados si hay nuevos
      if (proyecto.usuariosAsignados && proyecto.usuariosAsignados.length > 0) {
        notificarUsuariosAsignados(proyecto)
      }
    }
  }

  // Función para cargar proyectos por sector
  function cargarProyectosPorSector() {
    const sector = sectorAsignacion.value
    proyectosFiltrados = sector === "Todos" ? Storage.getProjects() : Storage.getProjectsBySector(sector)

    // Limpiar listas
    const listaProyectos = document.getElementById("listaProyectosAsignacion")
    const listaUsuariosDisponibles = document.getElementById("listaUsuariosDisponibles")
    const listaUsuariosAsignados = document.getElementById("listaUsuariosAsignados")

    if (listaProyectos) listaProyectos.innerHTML = ""
    if (listaUsuariosDisponibles) listaUsuariosDisponibles.innerHTML = ""
    if (listaUsuariosAsignados) listaUsuariosAsignados.innerHTML = ""

    // Mostrar proyectos en la lista
    mostrarProyectosFiltrados("")

    // Resetear proyecto seleccionado
    proyectoSeleccionado = null
    usuariosAsignados = []
  }

  // Función para mostrar proyectos filtrados por texto de búsqueda
  function mostrarProyectosFiltrados(textoBusqueda) {
    const listaProyectos = document.getElementById("listaProyectosAsignacion")
    if (!listaProyectos) return

    listaProyectos.innerHTML = ""

    // Filtrar proyectos por texto de búsqueda
    const proyectosMostrados = proyectosFiltrados.filter((proyecto) =>
      proyecto.nombre.toLowerCase().includes(textoBusqueda.toLowerCase()),
    )

    if (proyectosMostrados.length === 0) {
      const item = document.createElement("div")
      item.className = "list-group-item text-center text-muted"
      item.textContent = "No se encontraron proyectos"
      listaProyectos.appendChild(item)
      return
    }

    // Mostrar proyectos filtrados
    proyectosMostrados.forEach((proyecto) => {
      const item = document.createElement("button")
      item.type = "button"
      item.className = "list-group-item list-group-item-action"
      item.textContent = proyecto.nombre
      item.dataset.id = proyecto.id
      item.addEventListener("click", () => {
        seleccionarProyectoPorId(proyecto.id)
        document.getElementById("buscarProyectoAsignacion").value = proyecto.nombre
      })
      listaProyectos.appendChild(item)
    })
  }

  // Función para seleccionar un proyecto por su ID
  function seleccionarProyectoPorId(proyectoId) {
    const proyecto = Storage.getProjectById(proyectoId)

    if (!proyecto) {
      mostrarMensaje("Error", "Proyecto no encontrado.")
      return
    }

    proyectoSeleccionado = proyecto
    usuariosAsignados = proyecto.usuariosAsignados || []

    // Cargar usuarios disponibles y asignados
    cargarUsuariosDisponiblesYAsignados()
  }

  // Función para cargar usuarios disponibles y asignados
  function cargarUsuariosDisponiblesYAsignados() {
    if (!proyectoSeleccionado) return

    const usuarios = Storage.getUsers()
    const listaUsuariosDisponibles = document.getElementById("listaUsuariosDisponibles")
    const listaUsuariosAsignados = document.getElementById("listaUsuariosAsignados")

    // Filtrar usuarios por rol (solo brigada y trabajador) y por departamento del proyecto
    const usuariosFiltrados = usuarios.filter(
      (usuario) =>
        (usuario.rol === "brigada" || usuario.rol === "trabajador") &&
        (usuario.sector === proyectoSeleccionado.sector || usuario.sector === "Todos"),
    )

    // Limpiar listas
    listaUsuariosDisponibles.innerHTML = ""
    listaUsuariosAsignados.innerHTML = ""

    // Separar usuarios disponibles y asignados
    const usuariosDisponibles = usuariosFiltrados.filter((usuario) => !usuariosAsignados.includes(usuario.id))
    const usuariosAsignadosObj = usuariosFiltrados.filter((usuario) => usuariosAsignados.includes(usuario.id))

    // Generar HTML para usuarios disponibles
    usuariosDisponibles.forEach((usuario) => {
      const item = document.createElement("button")
      item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center"
      item.innerHTML = `
        <div>
          <strong>${usuario.nombre}</strong>
          <br>
          <small>${usuario.nombreBrigada} - ${usuario.rol === "brigada" ? "Brigada" : "Trabajador"}</small>
        </div>
        <i class="bi bi-plus-circle text-primary"></i>
      `
      item.addEventListener("click", () => asignarUsuario(usuario.id))
      listaUsuariosDisponibles.appendChild(item)
    })

    // Generar HTML para usuarios asignados
    usuariosAsignadosObj.forEach((usuario) => {
      const item = document.createElement("button")
      item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center"
      item.innerHTML = `
        <div>
          <strong>${usuario.nombre}</strong>
          <br>
          <small>${usuario.nombreBrigada} - ${usuario.rol === "brigada" ? "Brigada" : "Trabajador"}</small>
        </div>
        <i class="bi bi-dash-circle text-danger"></i>
      `
      item.addEventListener("click", () => desasignarUsuario(usuario.id))
      listaUsuariosAsignados.appendChild(item)
    })

    // Mostrar mensaje si no hay usuarios disponibles
    if (usuariosDisponibles.length === 0) {
      const item = document.createElement("div")
      item.className = "list-group-item text-center text-muted"
      item.textContent = "No hay usuarios disponibles para este departamento"
      listaUsuariosDisponibles.appendChild(item)
    }

    // Mostrar mensaje si no hay usuarios asignados
    if (usuariosAsignadosObj.length === 0) {
      const item = document.createElement("div")
      item.className = "list-group-item text-center text-muted"
      item.textContent = "No hay usuarios asignados a este proyecto"
      listaUsuariosAsignados.appendChild(item)
    }
  }

  // Función para filtrar usuarios disponibles
  function filtrarUsuariosDisponibles() {
    const busqueda = buscarUsuarioDisponible.value.toLowerCase()
    const items = document.querySelectorAll("#listaUsuariosDisponibles button.list-group-item-action")

    items.forEach((item) => {
      const texto = item.textContent.toLowerCase()
      if (texto.includes(busqueda)) {
        item.style.display = "flex"
      } else {
        item.style.display = "none"
      }
    })
  }

  // Función para asignar usuario
  function asignarUsuario(userId) {
    if (!proyectoSeleccionado) return

    // Añadir usuario a la lista de asignados
    if (!usuariosAsignados.includes(userId)) {
      usuariosAsignados.push(userId)
    }

    // Recargar listas
    cargarUsuariosDisponiblesYAsignados()
  }

  // Función para desasignar usuario
  function desasignarUsuario(userId) {
    if (!proyectoSeleccionado) return

    // Quitar usuario de la lista de asignados
    usuariosAsignados = usuariosAsignados.filter((id) => id !== userId)

    // Recargar listas
    cargarUsuariosDisponiblesYAsignados()
  }

  // Función para guardar asignaciones
  function guardarAsignaciones() {
    if (!proyectoSeleccionado) {
      mostrarMensaje("Error", "Debe seleccionar un proyecto.")
      return
    }

    // Actualizar proyecto
    proyectoSeleccionado.usuariosAsignados = usuariosAsignados

    // Guardar proyecto
    Storage.saveProject(proyectoSeleccionado)

    // Mostrar mensaje
    mostrarMensaje("Éxito", "Asignaciones guardadas correctamente.")
  }

  // Función para cargar solicitudes de cambio de contraseña
  function cargarSolicitudes() {
    const solicitudes = Storage.getPasswordRequests()
    const listaSolicitudes = document.getElementById("listaSolicitudes")
    const sinSolicitudes = document.getElementById("sinSolicitudes")

    // Aplicar filtros
    const estadoFiltro = filtroEstadoSolicitud.value
    const busqueda = buscarSolicitud.value.toLowerCase()

    // Solo mostrar solicitudes pendientes a menos que se especifique un filtro
    const solicitudesFiltradas = solicitudes.filter((solicitud) => {
      // Si no hay filtro de estado, mostrar solo pendientes
      const cumpleEstado = estadoFiltro ? solicitud.estado === estadoFiltro : solicitud.estado === "pendiente"

      // Obtener usuario para la búsqueda
      const usuario = Storage.getUserByUsername(solicitud.nombreUsuario)

      const cumpleBusqueda =
        !busqueda ||
        solicitud.nombreUsuario.toLowerCase().includes(busqueda) ||
        solicitud.correoUsuario.toLowerCase().includes(busqueda) ||
        (usuario && usuario.nombre.toLowerCase().includes(busqueda))

      return cumpleEstado && cumpleBusqueda
    })

    // Ordenar por fecha (más recientes primero)
    solicitudesFiltradas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))

    // Mostrar u ocultar mensaje de "sin solicitudes"
    if (solicitudesFiltradas.length === 0) {
      sinSolicitudes.style.display = "block"
      listaSolicitudes.innerHTML = ""
      return
    } else {
      sinSolicitudes.style.display = "none"
    }

    // Generar HTML para las solicitudes
    let html = ""
    solicitudesFiltradas.forEach((solicitud) => {
      const usuario = Storage.getUserByUsername(solicitud.nombreUsuario)
      const fecha = new Date(solicitud.fechaCreacion)
      const fechaFormateada = fecha.toLocaleDateString() + " " + fecha.toLocaleTimeString()

      let estadoClase = "pending"
      let estadoTexto = "Pendiente"
      let estadoBadge = "bg-warning"

      if (solicitud.estado === "aprobada") {
        estadoClase = "approved"
        estadoTexto = "Aprobada"
        estadoBadge = "bg-success"
      } else if (solicitud.estado === "rechazada") {
        estadoClase = "rejected"
        estadoTexto = "Rechazada"
        estadoBadge = "bg-danger"
      }

      html += `
      <div class="card password-request-card ${estadoClase}">
        <div class="password-request-header">
          <h6 class="mb-0">Solicitud de ${usuario ? usuario.nombre : solicitud.nombreUsuario}</h6>
          <span class="badge ${estadoBadge}">${estadoTexto}</span>
        </div>
        <div class="password-request-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Usuario:</strong> ${solicitud.nombreUsuario}</p>
              <p><strong>Correo:</strong> ${solicitud.correoUsuario}</p>
              <p><strong>Fecha:</strong> ${fechaFormateada}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Motivo:</strong></p>
              <p class="text-muted">${solicitud.motivo || "No especificado"}</p>
            </div>
          </div>
        </div>
    `

      // Solo mostrar botones de acción para solicitudes pendientes
      if (solicitud.estado === "pendiente") {
        html += `
        <div class="password-request-footer">
          <button class="btn btn-danger" onclick="rechazarSolicitudFuncion('${solicitud.id}')">
            <i class="bi bi-x-circle"></i> Rechazar
          </button>
          <button class="btn btn-success" onclick="procesarSolicitud('${solicitud.id}')">
            <i class="bi bi-check-circle"></i> Procesar
          </button>
        </div>
      `
      }

      html += `</div>`
    })

    listaSolicitudes.innerHTML = html
  }

  // Función para notificar a usuarios asignados
  function notificarUsuariosAsignados(proyecto) {
    if (!proyecto.usuariosAsignados || proyecto.usuariosAsignados.length === 0) return

    const admin = Storage.getLoggedUser()

    proyecto.usuariosAsignados.forEach((userId) => {
      const notificacion = {
        usuarioId: userId,
        tipo: "proyecto_asignado",
        mensaje: `El administrador ${admin.nombre} te ha asignado al proyecto "${proyecto.nombre}"`,
        fechaCreacion: new Date().toISOString(),
        leido: false,
      }

      Storage.addNotification(notificacion)
    })
  }

  // Función para procesar solicitud
  function procesarSolicitud(id) {
    const solicitud = Storage.getPasswordRequests().find((s) => s.id === id)

    if (!solicitud) {
      mostrarMensaje("Error", "Solicitud no encontrada.")
      return
    }

    // Obtener usuario
    const usuario = Storage.getUserByUsername(solicitud.nombreUsuario)

    if (!usuario) {
      mostrarMensaje("Error", "Usuario no encontrado.")
      return
    }

    // Llenar datos en el modal
    document.getElementById("solicitudId").value = solicitud.id
    document.getElementById("solicitudUsuario").textContent = solicitud.nombreUsuario
    document.getElementById("solicitudCorreo").textContent = solicitud.correoUsuario
    document.getElementById("solicitudFecha").textContent = new Date(solicitud.fechaCreacion).toLocaleString()
    document.getElementById("solicitudMotivo").textContent = solicitud.motivo || "No especificado"

    // Limpiar campos de contraseña
    document.getElementById("nuevaPassword").value = ""
    document.getElementById("confirmarNuevaPassword").value = ""

    // Mostrar modal
    const modalProcesarSolicitud = new bootstrap.Modal(document.getElementById("modalProcesarSolicitud"))
    modalProcesarSolicitud.show()

    // Configurar botones
    document.getElementById("btnAprobarSolicitud").onclick = aprobarSolicitud
    document.getElementById("btnRechazarSolicitud").onclick = () => {
      rechazarSolicitudFuncion(solicitud.id)
      modalProcesarSolicitud.hide()
    }
  }

  // Función para aprobar solicitud
  function aprobarSolicitud() {
    const solicitudId = document.getElementById("solicitudId").value
    const nuevaPassword = document.getElementById("nuevaPassword").value
    const confirmarNuevaPassword = document.getElementById("confirmarNuevaPassword").value

    // Validar contraseñas
    if (!nuevaPassword) {
      mostrarMensaje("Error", "Debe ingresar una nueva contraseña.")
      return
    }

    if (nuevaPassword !== confirmarNuevaPassword) {
      mostrarMensaje("Error", "Las contraseñas no coinciden.")
      return
    }

    // Actualizar solicitud
    const resultado = Storage.updatePasswordRequest(solicitudId, "aprobada", nuevaPassword)

    if (resultado) {
      // Cerrar modal
      const modalProcesarSolicitud = bootstrap.Modal.getInstance(document.getElementById("modalProcesarSolicitud"))
      modalProcesarSolicitud.hide()

      // Recargar solicitudes
      cargarSolicitudes()

      // Mostrar mensaje
      mostrarMensaje("Éxito", "Solicitud aprobada correctamente.")
    } else {
      mostrarMensaje("Error", "Error al procesar la solicitud.")
    }
  }

  // Función para rechazar solicitud
  function rechazarSolicitudFuncion(id) {
    if (confirm("¿Está seguro de que desea rechazar esta solicitud?")) {
      const resultado = Storage.updatePasswordRequest(id, "rechazada")

      if (resultado) {
        // Recargar solicitudes
        cargarSolicitudes()

        // Mostrar mensaje
        mostrarMensaje("Éxito", "Solicitud rechazada correctamente.")
      } else {
        mostrarMensaje("Error", "Error al procesar la solicitud.")
      }
    }
  }

  // Función para ver detalle de proyecto
  window.verDetalleProyecto = (id) => {
    const proyecto = Storage.getProjectById(id)

    if (!proyecto) {
      mostrarMensaje("Error", "Proyecto no encontrado.")
      return
    }

    // Llenar datos del proyecto
    document.getElementById("detalleProyectoId").textContent = proyecto.id
    document.getElementById("detalleProyectoNombre").textContent = proyecto.nombre
    document.getElementById("detalleProyectoDescripcion").textContent = proyecto.descripcion || "N/A"
    document.getElementById("detalleProyectoSector").textContent = proyecto.sector || "N/A"
    document.getElementById("detalleProyectoPRST").textContent = proyecto.prst || "N/A"
    document.getElementById("detalleProyectoEstado").textContent = Storage.getStatusDisplayName(proyecto.estado)

    // Obtener progreso del proyecto
    const progreso = Storage.getProjectProgress(proyecto.id)
    document.getElementById("detalleProyectoProgreso").style.width = `${progreso.porcentaje}%`
    document.getElementById("detalleProyectoProgreso").textContent = `${progreso.porcentaje}%`
    document.getElementById("detalleProyectoProgreso").setAttribute("aria-valuenow", progreso.porcentaje)

    // Contar postes totales y censados
    let postesTotales = 0
    if (proyecto.kmlData && proyecto.kmlData.puntos) {
      postesTotales = proyecto.kmlData.puntos.filter((p) => {
        const nombre = (p.nombre || "").toLowerCase()
        const descripcion = (p.descripcion || "").toLowerCase()
        return (
          nombre.includes("poste") ||
          descripcion.includes("poste") ||
          /^p\d+$/i.test(nombre) ||
          /^poste\s*\d+$/i.test(nombre) ||
          /^\d+$/.test(nombre)
        )
      }).length
    }

    const censos = Storage.getCensusByProject(proyecto.id)
    const postesCensados = new Set(censos.map((c) => c.numPoste)).size

    document.getElementById("detalleProyectoPostesTotales").textContent = postesTotales
    document.getElementById("detalleProyectoPostesCensados").textContent = postesCensados

    // Mostrar usuarios asignados
    const detalleProyectoUsuarios = document.getElementById("detalleProyectoUsuarios")
    let htmlUsuarios = ""

    if (proyecto.usuariosAsignados && proyecto.usuariosAsignados.length > 0) {
      htmlUsuarios = "<div class='row'>"
      proyecto.usuariosAsignados.forEach((userId) => {
        const usuario = Storage.getUserById(userId)
        if (usuario) {
          htmlUsuarios += `
        <div class="col-md-4 mb-2">
          <div class="card">
            <div class="card-body p-2">
              <h6 class="mb-1">${usuario.nombre}</h6>
              <small>${usuario.rol === "brigada" ? "Brigada" : "Trabajador"}</small>
            </div>
          </div>
        </div>
      `
        }
      })
      htmlUsuarios += "</div>"
    } else {
      htmlUsuarios = "<p class='text-muted'>No hay usuarios asignados a este proyecto.</p>"
    }

    detalleProyectoUsuarios.innerHTML = htmlUsuarios

    // Inicializar mapa
    if (!mapaDetalle) {
      mapaDetalle = L.map("detalleProyectoMapa").setView([11.0041, -74.807], 13)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapaDetalle)
    } else {
      mapaDetalle.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapaDetalle.removeLayer(layer)
        }
      })
    }

    // Mostrar puntos en el mapa
    if (proyecto.kmlData && proyecto.kmlData.puntos && proyecto.kmlData.puntos.length > 0) {
      const bounds = []

      proyecto.kmlData.puntos.forEach((punto) => {
        if (punto.lat && (punto.lon || punto.lng)) {
          // Asegurar que tenemos lon (algunos puntos pueden tener lng en lugar de lon)
          const lon = punto.lon || punto.lng

          // Determinar si es un poste
          const esPoste = determinarTipoPuntoGeneral(punto)

          // Determinar color del marcador según si está censado o no
          let iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" // Marcador normal

          if (esPoste) {
            // Extraer número de poste
            let numPoste = punto.nombre || ""
            if (/^\d+$/.test(numPoste)) {
              numPoste = numPoste
            } else if (/^p\d+$/i.test(numPoste)) {
              numPoste = numPoste.substring(1)
            } else if (/^poste\s*\d+$/i.test(numPoste)) {
              numPoste = numPoste.match(/\d+/)[0]
            }

            // Verificar si está censado
            const estaCensado = censos.some((c) => c.numPoste === numPoste)

            iconUrl = estaCensado
              ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
              : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
          }

          const customIcon = L.icon({
            iconUrl: iconUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            shadowSize: [41, 41],
            shadowAnchor: [12, 41],
          })

          const marker = L.marker([punto.lat, lon], { icon: customIcon }).addTo(mapaDetalle)
          marker.bindPopup(`<b>${punto.nombre || "Sin nombre"}</b><br>${punto.descripcion || "Sin descripción"}`)
          bounds.push([punto.lat, lon])
        }
      })

      // Mostrar líneas si existen
      if (proyecto.kmlData.lineas && proyecto.kmlData.lineas.length > 0) {
        proyecto.kmlData.lineas.forEach((linea) => {
          if (linea.puntos && linea.puntos.length > 1) {
            const puntos = linea.puntos.map((p) => [p.lat, p.lon || p.lng])
            L.polyline(puntos, { color: "blue" }).addTo(mapaDetalle)
          }
        })
      }

      if (bounds.length > 0) {
        mapaDetalle.fitBounds(bounds)
      }
    }

    const modalDetalleProyecto = new bootstrap.Modal(document.getElementById("modalDetalleProyecto"))
    modalDetalleProyecto.show()

    // Actualizar mapa después de que se muestre el modal
    setTimeout(() => {
      mapaDetalle.invalidateSize()
    }, 300)
  }

  // Función para editar proyecto
  window.editarProyecto = (id) => {
    const proyecto = Storage.getProjectById(id)

    if (!proyecto) {
      mostrarMensaje("Error", "Proyecto no encontrado.")
      return
    }

    document.getElementById("tituloModalProyecto").textContent = "Editar Proyecto"
    document.getElementById("proyectoId").value = proyecto.id
    document.getElementById("nombreProyecto").value = proyecto.nombre
    document.getElementById("descripcion").value = proyecto.descripcion || ""
    document.getElementById("sectorProyecto").value = proyecto.sector || ""
    document.getElementById("estado").value = proyecto.estado
    document.getElementById("estadoHidden").value = proyecto.estado
    document.getElementById("prstSolicitante").value = proyecto.prst || "" // Establecer el PRST solicitante
    document.getElementById("archivoKMLInfo").textContent = proyecto.kmlData
      ? "El proyecto ya tiene un archivo KML/KMZ. Seleccione uno nuevo solo si desea reemplazarlo."
      : "Seleccione un archivo KML o KMZ con los puntos del proyecto."

    // Habilitar el campo de nombre del proyecto para edición
    document.getElementById("nombreProyecto").disabled = false

    // Inicializar mapa de vista previa
    if (!mapaPreview) {
      mapaPreview = L.map("mapaPreview").setView([11.0041, -74.807], 13)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapaPreview)
    } else {
      mapaPreview.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapaPreview.removeLayer(layer)
        }
      })
    }

    // Mostrar puntos en el mapa
    if (proyecto.kmlData && proyecto.kmlData.puntos && proyecto.kmlData.puntos.length > 0) {
      const bounds = []

      proyecto.kmlData.puntos.forEach((punto) => {
        if (punto.lat && punto.lon) {
          const marker = L.marker([punto.lat, punto.lon]).addTo(mapaPreview)
          marker.bindPopup(`<b>${punto.nombre || "Sin nombre"}</b><br>${punto.descripcion || "Sin descripción"}`)
          bounds.push([punto.lat, punto.lon])
        }
      })

      // Mostrar líneas si existen
      if (proyecto.kmlData.lineas && proyecto.kmlData.lineas.length > 0) {
        proyecto.kmlData.lineas.forEach((linea) => {
          if (linea.puntos && linea.puntos.length > 1) {
            const puntos = linea.puntos.map((p) => [p.lat, p.lon])
            L.polyline(puntos, { color: "blue" }).addTo(mapaPreview)
          }
        })
      }

      if (bounds.length > 0) {
        mapaPreview.fitBounds(bounds)
      }
    }

    const modalProyecto = new bootstrap.Modal(document.getElementById("modalProyecto"))
    modalProyecto.show()

    // Actualizar mapa después de que se muestre el modal
    setTimeout(() => {
      mapaPreview.invalidateSize()
    }, 300)
  }

  // Función para eliminar proyecto
  window.eliminarProyecto = (id) => {
    if (confirm("¿Está seguro de que desea eliminar este proyecto?")) {
      Storage.deleteProject(id)
      cargarProyectos()
      mostrarMensaje("Éxito", "Proyecto eliminado correctamente.")
    }
  }

  // Función para editar usuario
  window.editarUsuario = (id) => {
    const usuario = Storage.getUserById(id)

    if (!usuario) {
      mostrarMensaje("Error", "Usuario no encontrado.")
      return
    }

    document.getElementById("tituloModalUsuario").textContent = "Editar Usuario"
    document.getElementById("usuarioId").value = usuario.id
    document.getElementById("nombre").value = usuario.nombre
    document.getElementById("apellido").value = usuario.apellido || ""
    document.getElementById("nombreBrigada").value = usuario.nombreBrigada || ""
    document.getElementById("cargo").value = usuario.cargo || ""
    document.getElementById("correo").value = usuario.correo
    document.getElementById("usuario").value = usuario.usuario
    document.getElementById("password").value = usuario.password
    document.getElementById("rol").value = usuario.rol
    document.getElementById("sector").value = usuario.sector || ""

    // Mostrar campos específicos por rol
    if (usuario.rol === "prst") {
      document.getElementById("nombrePRST").value = usuario.nombrePRST || ""
      document.getElementById("cedula").value = usuario.cedula || ""
      document.getElementById("matriculaProfesional").value = usuario.matriculaProfesional || ""
    } else if (usuario.rol === "coordinador") {
      document.getElementById("tipoCoordinador").value = usuario.tipoCoordinador || ""
    }

    const modalUsuario = new bootstrap.Modal(document.getElementById("modalUsuario"))
    modalUsuario.show()
  }

  document.getElementById("rol").addEventListener("change", function () {
    const rol = this.value
    const camposPRST = document.getElementById("camposPRST")
    const camposCoordinador = document.getElementById("camposCoordinador")

    // Ocultar todos los campos específicos primero
    camposPRST.style.display = "none"
    camposCoordinador.style.display = "none"

    // Mostrar los campos correspondientes al rol seleccionado
    if (rol === "prst") {
      camposPRST.style.display = "block"
    } else if (rol === "coordinador") {
      camposCoordinador.style.display = "block"
    }
  })

  // Función para eliminar usuario
  window.eliminarUsuario = (id) => {
    if (confirm("¿Está seguro de que desea eliminar este usuario?")) {
      Storage.deleteUser(id)
      cargarUsuarios()
      mostrarMensaje("Éxito", "Usuario eliminado correctamente.")
    }
  }

  // Función auxiliar para determinar si un punto es un poste (generalizada)
  function determinarTipoPuntoGeneral(punto) {
    const nombre = (punto.nombre || "").toLowerCase()
    const descripcion = (punto.descripcion || "").toLowerCase()
    return (
      nombre.includes("poste") ||
      descripcion.includes("poste") ||
      /^p\d+$/i.test(nombre) ||
      /^poste\s*\d+$/i.test(nombre) ||
      /^\d+$/.test(nombre)
    )
  }

  // Add event listener for role select to show/hide sector field
  const rolSelect = document.getElementById("rol")
  const sectorField = document.getElementById("sector").closest(".mb-3")

  if (rolSelect && sectorField) {
    rolSelect.addEventListener("change", function () {
      if (this.value === "brigada") {
        sectorField.style.display = "block"
      } else {
        sectorField.style.display = "none"
        // Reset sector value for non-brigada roles
        document.getElementById("sector").value = ""
      }
    })

    // Initial check when the modal opens
    document.getElementById("btnNuevoUsuario").addEventListener("click", () => {
      setTimeout(() => {
        const currentRole = rolSelect.value
        if (currentRole === "brigada") {
          sectorField.style.display = "block"
        } else {
          sectorField.style.display = "none"
        }
      }, 300)
    })
  }

  // Fix the accept and reject buttons in password requests section
  window.rechazarSolicitudFuncion = (id) => {
    if (confirm("¿Está seguro de que desea rechazar esta solicitud?")) {
      const resultado = Storage.updatePasswordRequest(id, "rechazada")

      if (resultado) {
        // Recargar solicitudes
        cargarSolicitudes()

        // Mostrar mensaje
        mostrarMensaje("Éxito", "Solicitud rechazada correctamente.")
      } else {
        mostrarMensaje("Error", "Error al procesar la solicitud.")
      }
    }
  }

  // Fix filter functionality in admin panel
  // Enhance the filter for password requests
  document.getElementById("filtroEstadoSolicitud").addEventListener("change", cargarSolicitudes)
  document.getElementById("buscarSolicitud").addEventListener("input", cargarSolicitudes)

  // Enhanced function to load password requests with filtering
})

