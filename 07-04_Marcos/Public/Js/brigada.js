document.addEventListener("DOMContentLoaded", () => {
  // Inicializar el almacenamiento
  Storage.init()

  // Verificar si hay un usuario logueado
  const loggedUser = Storage.getLoggedUser()
  if (!loggedUser) {
    window.location.href = "./login.html"
    return
  }

  // Variables globales
  let mapaProyectos = null
  let mapaCenso = null
  let proyectoActual = null
  let puntoSeleccionado = null
  let marcadores = []
  let marcadorSeleccionado = null

  // Elementos del DOM
  const navProyectos = document.getElementById("navProyectos")
  const navNuevoCenso = document.getElementById("navNuevoCenso")
  const navHistorial = document.getElementById("navHistorial")
  const navPerfil = document.getElementById("navPerfil")
  const cerrarSesion = document.getElementById("cerrarSesion")
  const seccionProyectos = document.getElementById("seccionProyectos")
  const seccionNuevoCenso = document.getElementById("seccionNuevoCenso")
  const seccionHistorial = document.getElementById("seccionHistorial")
  const seccionPerfil = document.getElementById("seccionPerfil")
  const listaProyectos = document.getElementById("listaProyectos")
  const sinProyectos = document.getElementById("sinProyectos")
  const formCenso = document.getElementById("formCenso")
  const btnFinalizarProyecto = document.getElementById("btnFinalizarProyecto")
  const btnActualizarPerfil = document.getElementById("btnActualizarPerfil")
  const mostrarCompletados = document.getElementById("mostrarCompletados")
  const markAllAsRead = document.getElementById("markAllAsRead")

  // Mostrar información del usuario
  document.getElementById("nombreUsuario").textContent = loggedUser.nombre
  document.getElementById("nombreBrigada").textContent = loggedUser.nombreBrigada
  document.getElementById("sectorUsuario").textContent = loggedUser.sector

  // Cargar notificaciones
  cargarNotificaciones()

  // Event listeners para navegación
  navProyectos.addEventListener("click", (e) => {
    e.preventDefault()
    mostrarSeccion(seccionProyectos)
    actualizarNavActivo(navProyectos)
    cargarProyectosAsignados()
  })

  navNuevoCenso.addEventListener("click", (e) => {
    e.preventDefault()
    if (proyectoActual) {
      mostrarSeccion(seccionNuevoCenso)
      actualizarNavActivo(navNuevoCenso)
      inicializarMapaCenso()
    } else {
      mostrarMensaje("Seleccione un proyecto", "Debe seleccionar un proyecto para realizar un censo.")
    }
  })

  navHistorial.addEventListener("click", (e) => {
    e.preventDefault()
    mostrarSeccion(seccionHistorial)
    actualizarNavActivo(navHistorial)
    cargarHistorialCensos()
  })

  navPerfil.addEventListener("click", (e) => {
    e.preventDefault()
    mostrarSeccion(seccionPerfil)
    actualizarNavActivo(navPerfil)
    cargarDatosPerfil()
  })

  cerrarSesion.addEventListener("click", (e) => {
    e.preventDefault()
    Storage.logout()
    window.location.href = "./login.html"
  })

  // Event listener para mostrar/ocultar proyectos completados
  mostrarCompletados.addEventListener("change", cargarProyectosAsignados)

  // Event listener para marcar todas las notificaciones como leídas
  markAllAsRead.addEventListener("click", marcarTodasLeidas)

  // Event listener para formulario de censo
  formCenso.addEventListener("submit", guardarCenso)

  // Event listener para finalizar proyecto
  btnFinalizarProyecto.addEventListener("click", mostrarModalFinalizarProyecto)

  // Event listener para actualizar perfil
  btnActualizarPerfil.addEventListener("click", actualizarPerfil)

  // Inicializar la página
  inicializarMapaProyectos()
  cargarProyectosAsignados()

  // Función para mostrar una sección y ocultar las demás
  function mostrarSeccion(seccion) {
    seccionProyectos.style.display = "none"
    seccionNuevoCenso.style.display = "none"
    seccionHistorial.style.display = "none"
    seccionPerfil.style.display = "none"
    seccion.style.display = "block"
  }

  // Función para actualizar la navegación activa
  function actualizarNavActivo(navActivo) {
    navProyectos.classList.remove("active")
    navNuevoCenso.classList.remove("active")
    navHistorial.classList.remove("active")
    navPerfil.classList.remove("active")
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
        case "proyecto_asignado":
          icono = "bi-folder-check"
          titulo = "Proyecto Asignado"
          break
        case "censo_creado":
          icono = "bi-clipboard-plus"
          titulo = "Censo Registrado"
          break
        case "inicio_sesion":
          icono = "bi-box-arrow-in-right"
          titulo = "Inicio de Sesión"
          break
        case "password_actualizada":
          icono = "bi-key"
          titulo = "Contraseña Actualizada"
          break
        case "password_rechazada":
          icono = "bi-key-fill"
          titulo = "Solicitud Rechazada"
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

  // Función para marcar todas las notificaciones como leídas
  function marcarTodasLeidas() {
    Storage.markAllNotificationsAsRead(loggedUser.id)
    cargarNotificaciones()
  }

  // Función para inicializar el mapa de proyectos
  function inicializarMapaProyectos() {
    if (!mapaProyectos) {
      mapaProyectos = L.map("mapaProyectos").setView([11.0041, -74.807], 13)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapaProyectos)
    } else {
      mapaProyectos.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapaProyectos.removeLayer(layer)
        }
      })
    }
  }

  // Función para cargar proyectos asignados
  function cargarProyectosAsignados() {
    // Obtener proyectos asignados al usuario
    let proyectos
    if (mostrarCompletados.checked) {
      proyectos = Storage.getProjectsByUserId(loggedUser.id)
    } else {
      proyectos = Storage.getActiveProjectsByUserId(loggedUser.id)
    }

    // Mostrar u ocultar mensaje de "sin proyectos"
    if (proyectos.length === 0) {
      sinProyectos.style.display = "block"
      listaProyectos.innerHTML = ""
      return
    } else {
      sinProyectos.style.display = "none"
    }

    // Inicializar mapa de proyectos
    inicializarMapaProyectos()

    // Generar HTML para los proyectos
    let html = ""
    proyectos.forEach((proyecto) => {
      // Obtener progreso del proyecto
      const progreso = Storage.getProjectProgress(proyecto.id)

      // Determinar clase según estado
      let estadoClase = "bg-success"
      if (proyecto.estado === "inactivo") {
        estadoClase = "bg-warning"
      } else if (proyecto.estado === "completado") {
        estadoClase = "bg-secondary"
      }

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

      // Determinar quién asignó el proyecto
      let asignadoPor = "Sistema"
      if (proyecto.coordinadorNombre) {
        asignadoPor = `Coordinador: ${proyecto.coordinadorNombre}`
      }

      html += `
    <div class="col-md-4 mb-4">
      <div class="card h-100 proyecto-card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0 proyecto-titulo">${proyecto.nombre}</h5>
          <span class="badge ${estadoClase} proyecto-estado">${Storage.getStatusDisplayName(proyecto.estado)}</span>
        </div>
        <div class="card-body">
          <p class="card-text"><strong>PRST:</strong> ${proyecto.prst || proyecto.prstNombre || "No especificado"}</p>
          <p class="card-text"><strong>Departamento:</strong> ${proyecto.departamento || "No asignado"}</p>
          <p class="card-text"><strong>Municipio:</strong> ${proyecto.municipio || "No asignado"}</p>
          <p class="card-text"><strong>Asignado por:</strong> ${asignadoPor}</p>
          <p class="card-text"><strong>Postes:</strong> ${postesCensados} de ${postesTotales}</p>
          <div class="progress mb-2">
            <div class="progress-bar bg-success" role="progressbar" style="width: ${progreso.porcentaje}%;" 
              aria-valuenow="${progreso.porcentaje}" aria-valuemin="0" aria-valuemax="100">${progreso.porcentaje}%</div>
          </div>
          <p class="card-text text-muted proyecto-fecha">
            Estado: 
            ${
              progreso.estado === "no_iniciado"
                ? "No iniciado"
                : progreso.estado === "en_proceso"
                  ? "En proceso"
                  : progreso.estado === "finalizado"
                    ? "Finalizado"
                    : "Desconocido"
            }
          </p>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary w-100" onclick="seleccionarProyecto('${proyecto.id}')" 
            ${proyecto.estado === "completado" ? "disabled" : ""}>
            <i class="bi bi-clipboard-plus"></i> Realizar Censo
          </button>
        </div>
      </div>
    </div>
  `

      // Añadir puntos al mapa
      if (proyecto.kmlData && proyecto.kmlData.puntos) {
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

            const marker = L.marker([punto.lat, lon], { icon: customIcon }).addTo(mapaProyectos)
            marker.bindPopup(`<b>${proyecto.nombre}</b><br>${punto.nombre || "Sin nombre"}`)
            bounds.push([punto.lat, lon])
          }
        })

        // Mostrar líneas si existen
        if (proyecto.kmlData.lineas && proyecto.kmlData.lineas.length > 0) {
          proyecto.kmlData.lineas.forEach((linea) => {
            if (linea.puntos && linea.puntos.length > 1) {
              const puntos = linea.puntos.map((p) => [p.lat, p.lon || p.lng])
              L.polyline(puntos, { color: "blue" }).addTo(mapaProyectos)
            }
          })
        }

        if (bounds.length > 0) {
          mapaProyectos.fitBounds(bounds)
        }
      }
    })

    listaProyectos.innerHTML = html
  }

  // Función para determinar si un punto es un poste (versión general)
  function determinarTipoPuntoGeneral(punto) {
    if (!punto) return false

    const nombre = (punto.nombre || "").toLowerCase()
    const descripcion = (punto.descripcion || "").toLowerCase()

    // Patrones comunes para postes
    const patronesPoste = [
      /poste/i, // Contiene la palabra "poste"
      /^p\d+$/i, // P seguido de números (P1, P2, etc.)
      /^poste\s*\d+$/i, // "Poste" seguido de números
      /^\d+$/, // Solo números
      /apoyo/i, // Contiene la palabra "apoyo"
      /estructura/i, // Contiene la palabra "estructura"
      /torre/i, // Contiene la palabra "torre"
      /columna/i, // Contiene la palabra "columna"
      /soporte/i, // Contiene la palabra "soporte"
    ]

    // Verificar si el nombre o descripción coincide con algún patrón
    for (const patron of patronesPoste) {
      if (patron.test(nombre) || patron.test(descripcion)) {
        return true
      }
    }

    // Verificar si tiene coordenadas (todos los postes deben tener coordenadas)
    if (!punto.lat || (!punto.lon && !punto.lng)) {
      return false
    }

    // Si no se pudo determinar con certeza, verificar si tiene alguna de estas palabras clave
    const palabrasClave = [
      "electricidad",
      "eléctrico",
      "energía",
      "distribución",
      "media tensión",
      "baja tensión",
      "mt",
      "bt",
    ]

    for (const palabra of palabrasClave) {
      if (nombre.includes(palabra) || descripcion.includes(palabra)) {
        return true
      }
    }

    // Si no se pudo determinar, asumir que no es un poste
    return false
  }

  // Modificar la función cargarProyectosAsignados para mostrar la cantidad de postes
  function cargarProyectosAsignados2() {
    const proyectos = Storage.getProjectsAssignedToUser(loggedUser.id)
    const contenedorProyectos = document.getElementById("proyectosAsignados")

    if (proyectos.length === 0) {
      contenedorProyectos.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info">
            No tienes proyectos asignados actualmente.
          </div>
        </div>
      `
      return
    }

    let html = ""
    proyectos.forEach((proyecto) => {
      // Obtener progreso del proyecto
      const progreso = Storage.getProjectProgress(proyecto.id)

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

      // Contar postes censados
      const censos = Storage.getCensusByProject(proyecto.id)
      const postesCensados = new Set(censos.map((c) => c.numPoste)).size

      html += `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">${proyecto.nombre}</h5>
              <span class="badge ${proyecto.estado === "activo" ? "bg-success" : proyecto.estado === "inactivo" ? "bg-warning" : "bg-secondary"}">
                ${Storage.getStatusDisplayName(proyecto.estado)}
              </span>
            </div>
            <div class="card-body">
              <p class="card-text">${proyecto.descripcion || "Sin descripción"}</p>
              <p class="card-text"><strong>Departamento:</strong> ${proyecto.sector || "No especificado"}</p>
              <p class="card-text"><strong>PRST:</strong> ${proyecto.prst || "No especificado"}</p>
              <p class="card-text"><strong>Postes:</strong> ${postesCensados} de ${postesTotales}</p>
              <div class="progress mb-3">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${progreso.porcentaje}%;" 
                  aria-valuenow="${progreso.porcentaje}" aria-valuemin="0" aria-valuemax="100">${progreso.porcentaje}%</div>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary w-100" onclick="iniciarCenso('${proyecto.id}')">
                ${progreso.porcentaje > 0 ? "Continuar Censo" : "Iniciar Censo"}
              </button>
            </div>
          </div>
        </div>
      `
    })

    contenedorProyectos.innerHTML = html
  }

  // Función para seleccionar un proyecto
  window.seleccionarProyecto = (id) => {
    const proyecto = Storage.getProjectById(id)

    if (!proyecto) {
      mostrarMensaje("Error", "Proyecto no encontrado.")
      return
    }

    proyectoActual = proyecto

    // Actualizar título del proyecto
    document.getElementById("proyectoTitulo").textContent = proyecto.nombre
    document.getElementById("proyectoTituloNav").textContent = proyecto.nombre
    document.getElementById("proyectoCenso").value = proyecto.id

    // Actualizar progreso del proyecto
    actualizarProgresoProyecto()

    // Cambiar a la sección de censo
    mostrarSeccion(seccionNuevoCenso)
    actualizarNavActivo(navNuevoCenso)

    // Inicializar mapa de censo
    inicializarMapaCenso()
  }

  // Función para actualizar el progreso del proyecto
  function actualizarProgresoProyecto() {
    if (!proyectoActual) return

    // Contar postes totales y censados
    let postesTotales = 0
    if (proyectoActual.kmlData && proyectoActual.kmlData.puntos) {
      postesTotales = proyectoActual.kmlData.puntos.filter((p) => {
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

    const censos = Storage.getCensusByProject(proyectoActual.id)
    const postesCensados = new Set(censos.map((c) => c.numPoste)).size

    // Actualizar elementos del DOM
    document.getElementById("postesTotales").textContent = postesTotales
    document.getElementById("postesCensados").textContent = postesCensados

    const porcentaje = postesTotales > 0 ? Math.round((postesCensados / postesTotales) * 100) : 0
    const barraProgreso = document.getElementById("barraProgreso")
    barraProgreso.style.width = `${porcentaje}%`
    barraProgreso.textContent = `${porcentaje}%`
    barraProgreso.setAttribute("aria-valuenow", porcentaje)

    // Mostrar u ocultar botón de finalizar proyecto
    if (porcentaje === 100 && proyectoActual.estado !== "completado") {
      btnFinalizarProyecto.style.display = "block"
    } else {
      btnFinalizarProyecto.style.display = "none"
    }
  }

  // Función para inicializar el mapa de censo
  function inicializarMapaCenso() {
    if (!proyectoActual) return

    if (!mapaCenso) {
      mapaCenso = L.map("mapa").setView([11.0041, -74.807], 13)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapaCenso)
    } else {
      mapaCenso.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapaCenso.removeLayer(layer)
        }
      })
    }

    // Limpiar marcadores
    marcadores = []
    marcadorSeleccionado = null

    // Obtener censos existentes para este proyecto
    const censos = Storage.getCensusByProject(proyectoActual.id)
    const postesCensados = new Set(censos.map((c) => c.numPoste))

    // Añadir puntos al mapa
    if (proyectoActual.kmlData && proyectoActual.kmlData.puntos) {
      const bounds = []

      proyectoActual.kmlData.puntos.forEach((punto) => {
        if (punto.lat && (punto.lon || punto.lng)) {
          // Asegurar que tenemos lon (algunos puntos pueden tener lng en lugar de lon)
          const lon = punto.lon || punto.lng

          // Check if it's in the "POSTES" folder
          const isInPostesFolder = punto.carpeta && punto.carpeta.toLowerCase() === "postes"

          // Determinar si es un poste
          const esPoste = determinarTipoPunto(punto)

          // Only add post markers, or those in the POSTES folder
          if (esPoste || isInPostesFolder) {
            // Extraer número de poste
            let numPoste = punto.nombre || ""
            if (/^\d+$/.test(numPoste)) {
              numPoste = numPoste
            } else if (/^p\d+$/i.test(numPoste)) {
              numPoste = numPoste.substring(1)
            } else if (/^poste\s*\d+$/i.test(numPoste)) {
              numPoste = numPoste.match(/\d+/)[0]
            }

            // Determinar color del marcador según si está censado o no
            const estaCensado = postesCensados.has(numPoste)
            const iconUrl = estaCensado
              ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
              : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"

            const customIcon = L.icon({
              iconUrl: iconUrl,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
              shadowSize: [41, 41],
              shadowAnchor: [12, 41],
            })

            const marker = L.marker([punto.lat, lon], { icon: customIcon }).addTo(mapaCenso)

            // Configurar el popup según si está censado o no
            if (estaCensado) {
              marker.bindPopup(`<b>${punto.nombre || "Sin nombre"}</b><br>Este poste ya ha sido censado.`)
              marker.on("click", () => mostrarModalPosteCensado(punto))
            } else {
              marker.bindPopup(`<b>${punto.nombre || "Sin nombre"}</b><br>${punto.descripcion || "Sin descripción"}`)
              marker.on("click", () => seleccionarPunto(punto, marker))
            }

            // Guardar referencia al marcador
            marcadores.push({
              punto: punto,
              marker: marker,
              censado: estaCensado,
            })

            bounds.push([punto.lat, lon])
          }
        }
      })

      // Mostrar líneas si existen (ruta del proyecto)
      if (proyectoActual.kmlData.lineas && proyectoActual.kmlData.lineas.length > 0) {
        proyectoActual.kmlData.lineas.forEach((linea) => {
          if (linea.puntos && linea.puntos.length > 1) {
            const puntos = linea.puntos.map((p) => [p.lat, p.lon || p.lng])
            L.polyline(puntos, { color: "blue", weight: 3, opacity: 0.7 }).addTo(mapaCenso)
          }
        })
      }

      if (bounds.length > 0) {
        mapaCenso.fitBounds(bounds)
      }
    }

    // Disable form inputs until a post is selected
    const formInputs = document.querySelectorAll(
      "#formCenso input:not([readonly]), #formCenso select, #formCenso textarea",
    )
    formInputs.forEach((input) => {
      input.disabled = true
    })

    document.querySelectorAll(".elemento-existente").forEach((checkbox) => {
      checkbox.disabled = true
    })

    // Add a message to the form
    const formMessage = document.createElement("div")
    formMessage.id = "formMessage"
    formMessage.className = "alert alert-info"
    formMessage.innerHTML =
      "<i class='bi bi-info-circle'></i> Seleccione un poste en el mapa para habilitar el formulario."

    const formCenso = document.getElementById("formCenso")
    if (formCenso && !document.getElementById("formMessage")) {
      formCenso.prepend(formMessage)
    }

    // Limpiar formulario
    limpiarFormularioCenso()
  }

  // Función mejorada para determinar si un punto es un poste
  function determinarTipoPunto(punto) {
    if (!punto) return false

    // First check if it's in the "POSTES" folder
    if (punto.carpeta && punto.carpeta.toLowerCase() === "postes") {
      return true
    }

    const nombre = (punto.nombre || "").toLowerCase()
    const descripcion = (punto.descripcion || "").toLowerCase()

    // Patrones comunes para postes
    const patronesPoste = [
      /poste/i, // Contiene la palabra "poste"
      /^p\d+$/i, // P seguido de números (P1, P2, etc.)
      /^poste\s*\d+$/i, // "Poste" seguido de números
      /^\d+$/, // Solo números
      /apoyo/i, // Contiene la palabra "apoyo"
      /estructura/i, // Contiene la palabra "estructura"
      /torre/i, // Contiene la palabra "torre"
      /columna/i, // Contiene la palabra "columna"
      /soporte/i, // Contiene la palabra "soporte"
    ]

    // Verificar si el nombre o descripción coincide con algún patrón
    for (const patron of patronesPoste) {
      if (patron.test(nombre) || patron.test(descripcion)) {
        return true
      }
    }

    // Verificar si tiene coordenadas (todos los postes deben tener coordenadas)
    if (!punto.lat || (!punto.lon && !punto.lng)) {
      return false
    }

    // Verificar si ya existe un censo para este punto
    const censos = Storage.getCensusByProject(proyectoActual.id)
    const censosExistentes = censos.filter(
      (c) => c.coordenada === `${punto.lat}, ${punto.lon}` || c.numPoste === punto.nombre,
    )

    // Si ya existe un censo, es muy probable que sea un poste
    if (censosExistentes.length > 0) {
      return true
    }

    // Si no se pudo determinar con certeza, verificar si tiene alguna de estas palabras clave
    const palabrasClave = [
      "electricidad",
      "eléctrico",
      "energía",
      "distribución",
      "media tensión",
      "baja tensión",
      "mt",
      "bt",
    ]

    for (const palabra of palabrasClave) {
      if (nombre.includes(palabra) || descripcion.includes(palabra)) {
        return true
      }
    }

    // Filter out client points - don't read the client on the map
    if (
      nombre.toLowerCase().includes("cliente") ||
      descripcion.toLowerCase().includes("cliente") ||
      nombre.toLowerCase().includes("client") ||
      descripcion.toLowerCase().includes("client")
    ) {
      return false
    }

    // Si no se pudo determinar, asumir que no es un poste
    return false
  }

  // Función para seleccionar un punto en el mapa
  function seleccionarPunto(punto, marker) {
    // Restaurar el marcador anterior si existe
    if (marcadorSeleccionado) {
      marcadorSeleccionado.setIcon(
        L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          shadowSize: [41, 41],
          shadowAnchor: [12, 41],
        }),
      )
    }

    // Cambiar el icono del marcador seleccionado a azul
    marker.setIcon(
      L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        shadowSize: [41, 41],
        shadowAnchor: [12, 41],
      }),
    )

    // Guardar referencia al marcador seleccionado
    marcadorSeleccionado = marker

    // Guardar punto seleccionado
    puntoSeleccionado = punto

    // Mostrar modal de confirmación
    document.getElementById("nombrePosteSeleccionado").textContent = punto.nombre || "seleccionado"
    const modalConfirmacionPoste = new bootstrap.Modal(document.getElementById("modalConfirmacionPoste"))
    modalConfirmacionPoste.show()

    // Configurar botón de confirmación
    document.getElementById("btnConfirmarPoste").onclick = () => {
      modalConfirmacionPoste.hide()
      prepararFormularioCenso(punto)
    }
  }

  // Modificar la función prepararFormularioCenso para eliminar el campo PRST solicitante
  function prepararFormularioCenso(punto) {
    // Disable the form initially
    const formInputs = document.querySelectorAll("#formCenso input, #formCenso select, #formCenso textarea")
    formInputs.forEach((input) => {
      input.disabled = false
    })

    // Establecer fecha actual
    const fechaInput = document.getElementById("fecha")
    const hoy = new Date().toISOString().split("T")[0]
    fechaInput.value = hoy

    // Establecer número de poste y coordenadas
    document.getElementById("numPoste").value = punto.nombre || ""
    document.getElementById("coordenada").value = `${punto.lat}, ${punto.lon}`

    // Check if there's already census data for this post
    const censos = Storage.getCensusByProject(proyectoActual.id)
    const censoPrevio = censos.find((c) => c.numPoste === punto.nombre)

    if (censoPrevio) {
      // Fill the form with previous data
      document.getElementById("tipoPoste").value = censoPrevio.tipoPoste || ""
      document.getElementById("material").value = censoPrevio.material || ""
      document.getElementById("altura").value = censoPrevio.altura || ""
      document.getElementById("cantidadPostes").value = censoPrevio.cantidadPRST || ""
      document.getElementById("observaciones").value = censoPrevio.observaciones || ""

      // Check the elements that existed before
      if (censoPrevio.elementosExistentes && censoPrevio.elementosExistentes.length > 0) {
        document.querySelectorAll(".elemento-existente").forEach((checkbox) => {
          checkbox.checked = censoPrevio.elementosExistentes.includes(checkbox.value)
        })
      }

      // Regenerate PRST forms
      if (censoPrevio.cantidadPRST > 0) {
        generarFormulariosPostes()

        // Fill the PRST data if available
        if (censoPrevio.prsts && censoPrevio.prsts.length > 0) {
          for (let i = 0; i < censoPrevio.prsts.length && i < censoPrevio.cantidadPRST; i++) {
            const prst = censoPrevio.prsts[i]
            if (document.getElementById(`nombrePRST${i + 1}`)) {
              document.getElementById(`nombrePRST${i + 1}`).value = prst.nombre || ""
              document.getElementById(`cajasNAP${i + 1}`).value = prst.cajasNAP || ""
              document.getElementById(`reservas${i + 1}`).value = prst.reservas || ""
              document.getElementById(`cajasEmpalme${i + 1}`).value = prst.cajasEmpalme || ""
              document.getElementById(`spt${i + 1}`).value = prst.spt || ""
              document.getElementById(`bajante${i + 1}`).value = prst.bajante || ""
            }
          }
        }
      }
    } else {
      // Clear the form for a new census
      document.getElementById("tipoPoste").value = ""
      document.getElementById("material").value = ""
      document.getElementById("altura").value = ""
      document.getElementById("cantidadPostes").value = ""
      document.getElementById("observaciones").value = ""

      // Uncheck all elements
      document.querySelectorAll(".elemento-existente").forEach((checkbox) => {
        checkbox.checked = false
      })

      // Clear PRST container
      document.getElementById("postesContainer").innerHTML = ""
    }

    // Desplazarse al formulario
    formCenso.scrollIntoView({ behavior: "smooth" })
  }

  // Modificar la función generarFormulariosPostes para cambiar la estructura y campos

  // Modificar la función guardarCenso para actualizar el mapa inmediatamente
  function guardarCenso(e) {
    e.preventDefault()

    if (!proyectoActual || !puntoSeleccionado) {
      mostrarMensaje("Error", "Debe seleccionar un poste para realizar el censo.")
      return
    }

    // Validar formulario
    if (!formCenso.checkValidity()) {
      formCenso.reportValidity()
      return
    }

    // Obtener elementos existentes seleccionados
    const elementosExistentes = []
    document.querySelectorAll(".elemento-existente:checked").forEach((checkbox) => {
      elementosExistentes.push(checkbox.value)
    })

    // Obtener información de PRST
    const prsts = []
    const cantidad = Number.parseInt(document.getElementById("cantidadPostes").value)

    if (!isNaN(cantidad) && cantidad > 0) {
      for (let i = 1; i <= cantidad; i++) {
        prsts.push({
          nombre: document.getElementById(`nombrePRST${i}`).value,
          cajasNAP: document.getElementById(`cajasNAP${i}`).value,
          reservas: document.getElementById(`reservas${i}`).value,
          cajasEmpalme: document.getElementById(`cajasEmpalme${i}`).value,
          spt: document.getElementById(`spt${i}`).value,
          bajante: document.getElementById(`bajante${i}`).value,
          cables: document.getElementById(`cables${i}`).value,
        })
      }
    }

    // Crear objeto de censo
    const censo = {
      proyectoId: proyectoActual.id,
      usuarioId: loggedUser.id,
      fecha: document.getElementById("fecha").value,
      numPoste: document.getElementById("numPoste").value,
      coordenada: document.getElementById("coordenada").value,
      tipoPoste: document.getElementById("tipoPoste").value,
      material: document.getElementById("material").value,
      altura: document.getElementById("altura").value,
      elementosExistentes: elementosExistentes,
      cantidadPRST: cantidad,
      prsts: prsts,
      observaciones: document.getElementById("observaciones").value,
    }

    // Procesar fotos (en un entorno real se subirían a un servidor)
    const fotoPanoramica = document.getElementById("fotoPanoramica").files[0]
    const fotoDetallada = document.getElementById("fotoDetallada").files[0]
    const fotoPlaca = document.getElementById("fotoPlaca").files[0]

    if (fotoPanoramica) {
      censo.fotoPanoramica = fotoPanoramica.name
    }

    if (fotoDetallada) {
      censo.fotoDetallada = fotoDetallada.name
    }

    if (fotoPlaca) {
      censo.fotoPlaca = fotoPlaca.name
    }

    // Guardar censo
    Storage.saveCensus(censo)

    // Actualizar mapa inmediatamente
    if (marcadorSeleccionado) {
      // Cambiar el icono a verde para indicar que está censado
      marcadorSeleccionado.setIcon(
        L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          shadowSize: [41, 41],
          shadowAnchor: [12, 41],
        }),
      )

      // Actualizar el popup
      marcadorSeleccionado.bindPopup(`<b>${censo.numPoste}</b><br>Este poste ya ha sido censado.`)

      // Actualizar la referencia en el array de marcadores
      const marcadorIndex = marcadores.findIndex((m) => m.marker === marcadorSeleccionado)
      if (marcadorIndex !== -1) {
        marcadores[marcadorIndex].censado = true
      }
    }

    // Actualizar progreso del proyecto
    actualizarProgresoProyecto()

    // Limpiar formulario
    limpiarFormularioCenso()

    // Mostrar mensaje
    mostrarMensaje("Éxito", "Censo guardado correctamente.")

    // No reinicializar el mapa completo para evitar recarga
    // Solo actualizar lo necesario

    // Mostrar fecha en el resumen
    document.getElementById("fechaResumen").textContent = new Date(censo.fecha).toLocaleDateString()

    // Mostrar modal de resumen
    const modalResumen = new bootstrap.Modal(document.getElementById("modalResumen"))
    modalResumen.show()

    // Llenar datos del resumen
    document.getElementById("numPosteResumen").textContent = censo.numPoste
    document.getElementById("alturaResumen").textContent = censo.altura + " metros"
    document.getElementById("materialResumen").textContent = censo.material
    document.getElementById("observacionesResumen").textContent = censo.observaciones || "No especificada"

    // Reiniciar la selección de puntos y el formulario
    puntoSeleccionado = null
    marcadorSeleccionado = null
  }

  // Función para mostrar modal de finalizar proyecto
  function mostrarModalFinalizarProyecto() {
    if (!proyectoActual) return

    document.getElementById("nombreProyectoFinalizar").textContent = proyectoActual.nombre

    const modalFinalizarProyecto = new bootstrap.Modal(document.getElementById("modalFinalizarProyecto"))
    modalFinalizarProyecto.show()

    // Configurar botón de confirmación
    document.getElementById("btnConfirmarFinalizarProyecto").onclick = finalizarProyecto
  }

  // Función para finalizar proyecto
  function finalizarProyecto() {
    if (!proyectoActual) return

    // Actualizar estado del proyecto
    proyectoActual.estado = "completado"

    // Guardar proyecto
    Storage.saveProject(proyectoActual)

    // Cerrar modal
    const modalFinalizarProyecto = bootstrap.Modal.getInstance(document.getElementById("modalFinalizarProyecto"))
    modalFinalizarProyecto.hide()

    // Mostrar mensaje
    mostrarMensaje("Éxito", "Proyecto finalizado correctamente.")

    // Volver a la sección de proyectos
    mostrarSeccion(seccionProyectos)
    actualizarNavActivo(navProyectos)
    cargarProyectosAsignados()
  }

  // Función para cargar historial de censos
  function cargarHistorialCensos() {
    const censos = Storage.getCensusByUser(loggedUser.id)
    const tablaCensos = document.getElementById("tablaCensos")

    // Ordenar censos por fecha (más recientes primero)
    censos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    // Generar HTML para la tabla
    let html = ""
    censos.forEach((censo) => {
      const proyecto = Storage.getProjectById(censo.proyectoId)

      if (!proyecto) return

      // Obtener progreso del proyecto
      const progreso = Storage.getProjectProgress(proyecto.id)
      let estadoTexto = "No iniciado"
      let estadoClase = "bg-secondary"

      if (progreso.estado === "en_proceso") {
        estadoTexto = "En proceso"
        estadoClase = "bg-primary"
      } else if (progreso.estado === "finalizado") {
        estadoTexto = "Finalizado"
        estadoClase = "bg-success"
      }

      html += `
      <tr>
        <td>${censo.id}</td>
        <td>${proyecto.nombre}</td>
        <td>${new Date(censo.fecha).toLocaleDateString()}</td>
        <td>${censo.numPoste}</td>
        <td>${censo.coordenada}</td>
        <td><span class="badge ${estadoClase}">${estadoTexto}</span></td>
        <td>
          <button class="btn btn-sm btn-info" onclick="verDetalleCenso('${censo.id}')">
            <i class="bi bi-eye"></i> Ver
          </button>
        </td>
      </tr>
    `
    })

    if (censos.length === 0) {
      html = `
      <tr>
        <td colspan="7" class="text-center">No hay censos registrados</td>
      </tr>
    `
    }

    tablaCensos.innerHTML = html
  }

  // Función para ver detalle de censo
  window.verDetalleCenso = (id) => {
    const censo = Storage.getCensus().find((c) => c.id === id)

    if (!censo) {
      mostrarMensaje("Error", "Censo no encontrado.")
      return
    }

    const proyecto = Storage.getProjectById(censo.proyectoId)

    if (!proyecto) {
      mostrarMensaje("Error", "Proyecto no encontrado.")
      return
    }

    // Generar HTML para el detalle
    let html = `
      <div class="row">
        <div class="col-md-6">
          <h6>Información General</h6>
          <table class="table table-sm">
            <tr>
              <th>ID:</th>
              <td>${censo.id}</td>
            </tr>
            <tr>
              <th>Proyecto:</th>
              <td>${proyecto.nombre}</td>
            </tr>
            <tr>
              <th>Fecha:</th>
              <td>${new Date(censo.fecha).toLocaleDateString()}</td>
            </tr>
            <tr>
              <th>Número de Poste:</th>
              <td>${censo.numPoste}</td>
            </tr>
            <tr>
              <th>Coordenadas:</th>
              <td>${censo.coordenada}</td>
            </tr>
          </table>
        </div>
        <div class="col-md-6">
          <h6>Características del Poste</h6>
          <table class="table table-sm">
            <tr>
              <th>Tipo de Poste:</th>
              <td>${censo.tipoPoste}</td>
            </tr>
            <tr>
              <th>Material:</th>
              <td>${censo.material}</td>
            </tr>
            <tr>
              <th>Altura:</th>
              <td>${censo.altura}</td>
            </tr>
            <tr>
              <th>Elementos Existentes:</th>
              <td>${censo.elementosExistentes ? censo.elementosExistentes.join(", ") : "N/A"}</td>
            </tr>
            <tr>
              <th>Observaciones:</th>
              <td>${censo.observaciones || "N/A"}</td>
            </tr>
          </table>
        </div>
      </div>
    `

    // Añadir información de PRST si existe
    if (censo.prsts && censo.prsts.length > 0) {
      html += `
        <div class="row mt-3">
          <div class="col-md-12">
            <h6>Información de PRST</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Cantidad de Cables</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
      `

      censo.prsts.forEach((prst, index) => {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td>${prst.nombre}</td>
            <td>${prst.tipo}</td>
            <td>${prst.cantidadCables}</td>
            <td>${prst.observaciones || "N/A"}</td>
          </tr>
        `
      })

      html += `
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `
    }

    // Añadir fotos si existen
    if (censo.fotoPanoramica || censo.fotoDetallada || censo.fotoPlaca) {
      html += `
        <div class="row mt-3">
          <div class="col-md-12">
            <h6>Fotos</h6>
            <div class="row">
      `

      if (censo.fotoPanoramica) {
        html += `
          <div class="col-md-4 mb-2">
            <div class="card">
              <div class="card-header">Foto Panorámica</div>
              <div class="card-body text-center">
                <p class="text-muted">${censo.fotoPanoramica}</p>
              </div>
            </div>
          </div>
        `
      }

      if (censo.fotoDetallada) {
        html += `
          <div class="col-md-4 mb-2">
            <div class="card">
              <div class="card-header">Foto Detallada</div>
              <div class="card-body text-center">
                <p class="text-muted">${censo.fotoDetallada}</p>
              </div>
            </div>
          </div>
        `
      }

      if (censo.fotoPlaca) {
        html += `
          <div class="col-md-4 mb-2">
            <div class="card">
              <div class="card-header">Foto de la Placa</div>
              <div class="card-body text-center">
                <p class="text-muted">${censo.fotoPlaca}</p>
              </div>
            </div>
          </div>
        `
      }

      html += `
            </div>
          </div>
        </div>
      `
    }

    // Mostrar detalle en el modal
    document.getElementById("detallesCensoContenido").innerHTML = html

    const modalDetalleCenso = new bootstrap.Modal(document.getElementById("modalDetalleCenso"))
    modalDetalleCenso.show()
  }

  // Función para cargar datos del perfil
  function cargarDatosPerfil() {
    document.getElementById("perfilNombre").textContent = loggedUser.nombre
    document.getElementById("perfilUsuario").textContent = loggedUser.usuario
    document.getElementById("perfilCorreo").textContent = loggedUser.correo
    document.getElementById("perfilRol").textContent =
      loggedUser.rol === "admin" ? "Administrador" : loggedUser.rol === "brigada" ? "Brigada" : "Trabajador"
    document.getElementById("perfilBrigada").textContent = loggedUser.nombreBrigada

    // Mostrar departamento si es brigada
    const perfilDepartamentoContainer = document.getElementById("perfilDepartamento")
    if (loggedUser.rol === "brigada" && loggedUser.departamento) {
      perfilDepartamentoContainer.style.display = "block"
      document.getElementById("perfilDepartamento").textContent = "Departamento: " + loggedUser.departamento
    } else if (loggedUser.rol === "brigada" && loggedUser.sector) {
      // Compatibilidad con datos antiguos que usan "sector" en lugar de "departamento"
      perfilDepartamentoContainer.style.display = "block"
      document.getElementById("perfilDepartamento").textContent = "Departamento: " + loggedUser.sector
    } else {
      perfilDepartamentoContainer.style.display = "none"
    }
  }

  // Función para actualizar perfil
  function actualizarPerfil() {
    const password = document.getElementById("perfilPassword").value
    const confirmarPassword = document.getElementById("perfilConfirmarPassword").value

    // Validar contraseñas
    if (!password) {
      mostrarMensaje("Error", "Debe ingresar una contraseña.")
      return
    }

    if (password !== confirmarPassword) {
      mostrarMensaje("Error", "Las contraseñas no coinciden.")
      return
    }

    // Actualizar contraseña
    loggedUser.password = password

    // Guardar usuario
    Storage.saveUser(loggedUser)

    // Actualizar usuario en sesión
    Storage.setLoggedUser(loggedUser)

    // Mostrar mensaje
    mostrarMensaje("Éxito", "Contraseña actualizada correctamente.")

    // Limpiar campos
    document.getElementById("perfilPassword").value = ""
    document.getElementById("perfilConfirmarPassword").value = ""
  }

  // Función para mostrar mensajes
  function mostrarMensaje(titulo, mensaje) {
    document.getElementById("tituloModalMensaje").textContent = titulo
    document.getElementById("textoModalMensaje").textContent = mensaje

    const modalMensaje = new bootstrap.Modal(document.getElementById("modalMensaje"))
    modalMensaje.show()
  }

  // Modificar la función mostrarMensajeBienvenida para incluir Nombre, Brigada y Sector
  function mostrarMensajeBienvenida() {
    const hora = new Date().getHours()
    let saludo = "¡Buen día!"

    if (hora < 12) {
      saludo = "¡Buenos días!"
    } else if (hora < 18) {
      saludo = "¡Buenas tardes!"
    } else {
      saludo = "¡Buenas noches!"
    }

    const rolInfo =
      loggedUser.rol === "admin" ? "Administrador" : loggedUser.rol === "brigada" ? "Brigada" : "Trabajador"
    const sectorInfo = loggedUser.sector ? `, ${loggedUser.sector}` : ""

    Swal.fire({
      title: saludo,
      text: `Bienvenido/a ${loggedUser.nombre} - ${loggedUser.nombreBrigada} (${rolInfo}${sectorInfo})`,
      icon: "success",
      confirmButtonText: "Gracias",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    }).then(() => {
      // Continuar con la carga normal de la página
    })
  }

  // Modificar la función mostrarMapaCenso para colorear los postes según su estado
  function mostrarMapaCenso(proyecto) {
    if (!mapaCenso) {
      mapaCenso = L.map("mapaCenso").setView([11.0041, -74.807], 13)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapaCenso)
    } else {
      mapaCenso.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapaCenso.removeLayer(layer)
        }
      })
    }

    // Obtener censos existentes para este proyecto
    const censos = Storage.getCensusByProject(proyecto.id)
    const postesCensados = new Set(censos.map((c) => c.numPoste))

    // Obtener el poste actual si estamos editando
    const posteActual = document.getElementById("numPoste").value

    if (proyecto.kmlData && proyecto.kmlData.puntos && proyecto.kmlData.puntos.length > 0) {
      const bounds = []
      const markers = {}

      proyecto.kmlData.puntos.forEach((punto) => {
        if (punto.lat && punto.lon) {
          const nombre = punto.nombre || "Sin nombre"
          const descripcion = punto.descripcion || "Sin descripción"

          // Determinar si es un poste
          const esPoste =
            nombre.toLowerCase().includes("poste") ||
            descripcion.toLowerCase().includes("poste") ||
            /^p\d+$/i.test(nombre) ||
            /^poste\s*\d+$/i.test(nombre) ||
            /^\d+$/.test(nombre)

          if (esPoste) {
            // Extraer número de poste
            let numPoste = nombre
            if (/^\d+$/.test(nombre)) {
              numPoste = nombre
            } else if (/^p\d+$/i.test()) {
              numPoste = nombre.substring(1)
            } else if (/^poste\s*\d+$/i.test(nombre)) {
              numPoste = nombre.match(/\d+/)[0]
            }

            // Determinar color del marcador
            let iconColor = "red" // Por defecto, poste sin censar (rojo)

            if (postesCensados.has(numPoste)) {
              iconColor = "green" // Poste censado (verde)
            }

            if (numPoste === posteActual) {
              iconColor = "blue" // Poste actual (azul)
            }

            // Crear icono personalizado
            const markerIcon = L.divIcon({
              className: "custom-div-icon",
              html: `<div style="background-color: ${iconColor}; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [15, 15],
              iconAnchor: [7, 7],
            })

            const marker = L.marker([punto.lat, punto.lon], { icon: markerIcon }).addTo(mapaCenso)
            marker.bindPopup(`<b>Poste ${numPoste}</b><br>${descripcion}`)

            // Guardar referencia al marcador
            markers[numPoste] = marker

            // Añadir evento de clic al marcador
            marker.on("click", () => {
              seleccionarPoste(numPoste, proyecto.id)
            })

            bounds.push([punto.lat, punto.lon])
          } else {
            // Si no es un poste, mostrar como marcador normal
            const marker = L.marker([punto.lat, punto.lon]).addTo(mapaCenso)
            marker.bindPopup(`<b>${nombre}</b><br>${descripcion}`)
            bounds.push([punto.lat, punto.lon])
          }
        }
      })

      // Mostrar líneas si existen
      if (proyecto.kmlData.lineas && proyecto.kmlData.lineas.length > 0) {
        proyecto.kmlData.lineas.forEach((linea) => {
          if (linea.puntos && linea.puntos.length > 1) {
            const puntos = linea.puntos.map((p) => [p.lat, p.lon])
            L.polyline(puntos, { color: "blue" }).addTo(mapaCenso)
          }
        })
      }

      if (bounds.length > 0) {
        mapaCenso.fitBounds(bounds)
      }

      // Guardar referencia a los marcadores
      window.marcadoresPostes = markers
    }
  }

  // Función para seleccionar un poste en el mapa del censo
  window.seleccionarPoste = (numPoste, proyectoId) => {
    // Obtener el proyecto
    const proyecto = Storage.getProjectById(proyectoId)

    if (!proyecto) {
      mostrarMensaje("Error", "Proyecto no encontrado.")
      return
    }

    // Obtener el punto del poste
    const punto = proyecto.kmlData.puntos.find((p) => {
      const nombre = p.nombre || "Sin nombre"
      if (/^\d+$/.test(nombre)) {
        return nombre === numPoste
      } else if (/^p\d+$/i.test(nombre)) {
        return nombre.substring(1) === numPoste
      } else if (/^poste\s*\d+$/i.test(nombre)) {
        return nombre.match(/\d+/)[0] === numPoste
      }
      return false
    })

    if (!punto) {
      mostrarMensaje("Error", "Poste no encontrado en el proyecto.")
      return
    }

    // Seleccionar el punto
    seleccionarPunto(punto, window.marcadoresPostes[numPoste])
  }
})

// Agregar lógica para los checkboxes de Elementos Existentes
document.addEventListener("DOMContentLoaded", () => {
  // Obtener todos los checkboxes de elementos existentes
  const elementosExistentes = document.querySelectorAll(".elemento-existente")
  const elementoNA = document.getElementById("elementoNA")

  if (elementoNA) {
    elementoNA.addEventListener("change", function () {
      if (this.checked) {
        // If N/A is selected, uncheck and disable other checkboxes
        elementosExistentes.forEach((checkbox) => {
          if (checkbox !== elementoNA) {
            checkbox.checked = false
            checkbox.disabled = true
          }
        })
      } else {
        // If N/A is unchecked, enable other checkboxes
        elementosExistentes.forEach((checkbox) => {
          if (checkbox !== elementoNA) {
            checkbox.disabled = false
          }
        })
      }
    })
  }

  // Add event listeners for other checkboxes
  elementosExistentes.forEach((checkbox) => {
    if (checkbox !== elementoNA && checkbox) {
      checkbox.addEventListener("change", function () {
        if (this.checked && elementoNA) {
          // If any other checkbox is checked, uncheck and disable N/A
          elementoNA.checked = false
          elementoNA.disabled = true
        } else {
          // Check if any other checkbox is still selected
          const anySelected = Array.from(elementosExistentes).some((cb) => cb !== elementoNA && cb.checked)

          // If no other checkbox is selected, enable N/A
          if (!anySelected && elementoNA) {
            elementoNA.disabled = false
          }
        }
      })
    }
  })
})

// Función para mostrar modal cuando se hace clic en un poste ya censado
function mostrarModalPosteCensado(punto) {
  // Crear modal para mostrar que el poste ya está censado
  const modalHtml = `
    <div class="modal fade" id="modalPosteCensado" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">Poste Censado</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>El poste <strong>${punto.nombre || "seleccionado"}</strong> ya ha sido censado.</p>
            <p>Si desea ver los detalles del censo, puede consultarlo en la sección de Historial.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `

  // Añadir el modal al DOM si no existe
  if (!document.getElementById("modalPosteCensado")) {
    const modalContainer = document.createElement("div")
    modalContainer.innerHTML = modalHtml
    document.body.appendChild(modalContainer.firstElementChild)
  }

  // Mostrar el modal
  const modalPosteCensado = new bootstrap.Modal(document.getElementById("modalPosteCensado"))
  modalPosteCensado.show()
}

function limpiarFormularioCenso() {
  document.getElementById("formCenso").reset()

  // Clear PRST container
  document.getElementById("postesContainer").innerHTML = ""

  // Enable all form inputs
  const formInputs = document.querySelectorAll("#formCenso input, #formCenso select, #formCenso textarea")
  formInputs.forEach((input) => {
    input.disabled = false
  })

  // Enable all checkboxes
  document.querySelectorAll(".elemento-existente").forEach((checkbox) => {
    checkbox.disabled = false
  })

  // Uncheck all checkboxes
  document.querySelectorAll(".elemento-existente").forEach((checkbox) => {
    checkbox.checked = false
  })

  // Remove form message
  const formMessage = document.getElementById("formMessage")
  if (formMessage) {
    formMessage.remove()
  }

  // Restore default marker
  if (marcadorSeleccionado) {
    marcadorSeleccionado.setIcon(
      L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        shadowSize: [41, 41],
        shadowAnchor: [12, 41],
      }),
    )
    marcadorSeleccionado = null
  }
}

// Mostrar mensaje de bienvenida al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarMensajeBienvenida()
})

// Modificar la función generarFormulariosPostes para incluir los campos solicitados
window.generarFormulariosPostes = () => {
  const cantidad = Number.parseInt(document.getElementById("cantidadPostes").value)
  const container = document.getElementById("postesContainer")

  // Limpiar contenedor
  container.innerHTML = ""

  if (isNaN(cantidad) || cantidad <= 0) {
    return
  }

  // Crear título
  const titulo = document.createElement("h5")
  titulo.textContent = "INFORMACIÓN DEL PRST"
  titulo.className = "mb-3 mt-4"
  container.appendChild(titulo)

  // Crear formularios
  for (let i = 1; i <= cantidad; i++) {
    const formGroup = document.createElement("div")
    formGroup.className = "card mb-3"
    formGroup.innerHTML = `
      <div class="card-header bg-light">
        <h6 class="mb-0">PRST #${i}</h6>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-12 mb-3">
            <label for="nombrePRST${i}" class="form-label">Nombre del PRST</label>
            <input type="text" id="nombrePRST${i}" class="form-control" list="prstOptions" placeholder="Escriba para buscar..." required>
            <datalist id="prstOptions">
              <option value="AIRE">
              <option value="AIRTEK CARRIER SERVICES">
              <option value="MUNICIPAL DE MAICAO">
              <option value="TOTAL CONEXION">
              <option value="APC LINK">
              <option value="AUDICOL">
              <option value="AWATA WIRELESS">
              <option value="AZTECA">
              <option value="MEGATEL">
              <option value="CABLE EXPRESS">
              <option value="CABLE GUAJIRA LTDA">
              <option value="CABLE HOGAR.NET">
              <option value="CAFETEL COMMUNICATIONS GROUP">
              <option value="CARIBE INTERCOMUNICACIONES">
              <option value="CARIBETECH">
              <option value="CIRION TECHNOLOGIES COLOMBIA">
              <option value="MOVISTAR">
              <option value="COMUNET TELECOMUNICACIONES">
              <option value="CLARO">
              <option value="CLARO-S">
              <option value="COMUNICACIONES TERRESTRES DE COLOMBIA">
              <option value="CONETTA">
              <option value="CGVE">
              <option value="DATA LAN">
              <option value="Dialnet">
              <option value="DIGITAL COAST">
              <option value="DIGITVNET">
              <option value="DRACO NET">
              <option value="ECONEXION">
              <option value="ELECNORTE SAS ESP">
              <option value="EME INGENIERIA S.A.">
              <option value="ETB">
              <option value="COSTATEL">
              <option value="ENERGIZANDO - INGENIERÍA Y CONSTRUCCIÓN">
              <option value="FIBER FAST">
              <option value="FIBERCOMM">
              <option value="FIBERLINK COMUNICACIONES">
              <option value="FIBRAXO">
              <option value="ELECNORTE">
              <option value="GTD">
              <option value="GUAJIRANET ISP">
              <option value="TVNET">
              <option value="IMB INGENIERIA EN REDES">
              <option value="INTEGRA MULTISOLUTIONS">
              <option value="INTELEXA DE COLOMBIA">
              <option value="INTER REDES DEL MAGDALENA">
              <option value="INTERCABLE">
              <option value="INTERCAR.NET">
              <option value="CABLE EXITO">
              <option value="ISA">
              <option value="INTERCONEXIONES TECNOLOGICAS DEL CARIBE SAS (INTERCON)">
              <option value="INTERCOSTA">
              <option value="INTERNET Y TELECOMUNICACIONES DE COLOMBIA">
              <option value="INTERNEXA">
              <option value="INTERNEXT">
              <option value="INTERTEL SATELITAL">
              <option value="INVERSIONES ACOSTA VERGARA">
              <option value="INVERSIONES RODRIGUEZ MEJIA">
              <option value="IST INGENIERIA Y SOLUCIONES TECNOLOGICAS">
              <option value="POLICIA NACIONAL">
              <option value="ITELKOM">
              <option value="JALU SOLUCIONES">
              <option value="JHOSDY TELECOMUNICACIONES">
              <option value="C&W Network">
              <option value="LOGISTICA EN TELECOMUNICACIONES">
              <option value="MACITEL">
              <option value="MAOTECH TELECOMUNICACIONES">
              <option value="MEDIA COMMERCE">
              <option value="MEGA TV">
              <option value="NOVACLICK">
              <option value="O2 ONLINE">
              <option value="ONNET">
              <option value="WOM">
              <option value="PLUSNET">
              <option value="PRODATEL">
              <option value="PROMO VISIÓN">
              <option value="QUEST TELECOM">
              <option value="R&R TELECOMUNICACIONES">
              <option value="RAPILINK">
              <option value="REDES TELECOMUNICACIONES DIGITALES DE COLOMBIA">
              <option value="SAVASA SOLUCIONES INTEGRALES">
              <option value="DATASET">
              <option value="SERVICIOS INTEGRALES PERSONALIZADOS">
              <option value="SERVICOM J&E">
              <option value="SERVISOLUCIONES JM">
              <option value="SIN IDENTIFICAR">
              <option value="SMK DUO CONEXCION">
              <option value="SOLUCIONES DANTEL">
              <option value="E-VOLT TECK">
              <option value="SEGITEL">
              <option value="SOLUNET DIGITAL">
              <option value="SPACE COMUNICACIONES">
              <option value="STARCOM CARIBE">
              <option value="SUPERCABLE TELECOMUNICACIONES">
              <option value="TELECOMUNICACIONES ZONA BANANERA">
              <option value="TIRIAN TELECOMUNICACIONES">
              <option value="TOP LINK">
              <option value="TUNORTETV TELECOMUNICACIONES">
              <option value="TV COMUNICACIONES JL">
              <option value="TV LINE">
              <option value="TV ZONA BANANERA">
              <option value="UFINET">
              <option value="TIGO">
              <option value="VENTELCO">
              <option value="VYC NETWORKS">
              <option value="WAYIRANET">
              <option value="WIPA">
            </datalist>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="cajasNAP${i}" class="form-label">Cajas NAP</label>
              <input type="number" id="cajasNAP${i}" class="form-control" min="0" required>
            </div>
            <div class="mb-3">
              <label for="reservas${i}" class="form-label">Reservas</label>
              <input type="number" id="reservas${i}" class="form-control" min="0" required>
            </div>
            <div class="mb-3">
              <label for="cables${i}" class="form-label">Cables</label>
              <input type="number" id="cables${i}" class="form-control" min="0" required>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label for="cajasEmpalme${i}" class="form-label">Cajas de Empalme</label>
              <input type="number" id="cajasEmpalme${i}" class="form-control" min="0" required>
            </div>
            <div class="mb-3">
              <label for="spt${i}" class="form-label">SPT</label>
              <input type="number" id="spt${i}" class="form-control" min="0" required>
            </div>
            <div class="mb-3">
              <label for="bajante${i}" class="form-label">Bajante</label>
              <input type="number" id="bajante${i}" class="form-control" min="0" required>
            </div>
          </div>
        </div>
      </div>
    `

    container.appendChild(formGroup)
  }
}

// Add this function to setup filter event listeners
function setupFilterEventListeners() {
  // Filter for projects table
  document.getElementById("filterNombre").addEventListener("input", () => {
    filterProjects("listaProyectos")
  })
  document.getElementById("filterFecha").addEventListener("change", () => {
    filterProjects("listaProyectos")
  })
  document.getElementById("filterEstado").addEventListener("change", () => {
    filterProjects("listaProyectos")
  })
}

// Add this function to filter projects
function filterProjects(containerId) {
  const container = document.getElementById(containerId)
  if (!container) return

  const projectCards = container.querySelectorAll(".proyecto-card")
  if (projectCards.length === 0) return

  // Get filter values
  const nombreFilter = document.getElementById("filterNombre").value.toLowerCase()
  const fechaFilter = document.getElementById("filterFecha").value
  const estadoFilter = document.getElementById("filterEstado").value

  // Loop through all project cards
  projectCards.forEach((card) => {
    // Get card values
    const nombre = card.querySelector(".proyecto-titulo").textContent.toLowerCase()
    const fecha = card.querySelector(".proyecto-fecha").textContent
    const estadoElement = card.querySelector(".proyecto-estado")
    const estado = estadoElement ? estadoElement.textContent : ""

    // Check if card matches all filters
    const matchesNombre = !nombreFilter || nombre.includes(nombreFilter)
    const matchesFecha = !fechaFilter || fecha.includes(fechaFilter)
    const matchesEstado = !estadoFilter || estado.includes(estadoFilter)

    // Show/hide card based on filter matches
    if (matchesNombre && matchesFecha && matchesEstado) {
      card.style.display = ""
    } else {
      card.style.display = "none"
    }
  })
}

// Add this function to populate date filters
function populateDateFilters() {
  const loggedUser = Storage.getLoggedUser()
  if (!loggedUser) return

  const allProjects = Storage.getProjects().filter(
    (project) =>
      project.brigadaId === loggedUser.id || (loggedUser.brigadaId && project.brigadaId === loggedUser.brigadaId),
  )

  // Extract unique dates
  const dates = new Set()
  allProjects.forEach((project) => {
    if (project.fechaCreacion) {
      const date = new Date(project.fechaCreacion).toLocaleDateString()
      dates.add(date)
    }
    if (project.fechaAsignacion) {
      const date = new Date(project.fechaAsignacion).toLocaleDateString()
      dates.add(date)
    }
  })

  // Sort dates
  const sortedDates = Array.from(dates).sort((a, b) => new Date(b) - new Date(a))

  // Populate dropdown
  const dateSelect = document.getElementById("filterFecha")
  if (dateSelect) {
    // Keep the first option
    const firstOption = dateSelect.options[0]
    dateSelect.innerHTML = ""
    dateSelect.appendChild(firstOption)

    // Add date options
    sortedDates.forEach((date) => {
      const option = document.createElement("option")
      option.value = date
      option.textContent = date
      dateSelect.appendChild(option)
    })
  }
}

// Update the setupEventListeners function to include filter setup
function setupEventListeners() {
  // Existing event listeners...

  // Add filter event listeners
  setupFilterEventListeners()

  // Populate date filters
  populateDateFilters()
}

// Update the loadProjects function to call populateDateFilters
function loadProjects() {
  // Existing code...

  // After loading projects, populate date filters
  populateDateFilters()
}

