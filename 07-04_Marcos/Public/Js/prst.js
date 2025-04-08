// prst.js - Funcionalidades para el rol PRST

// Variables globales
let currentUser = null
const projectsData = []
const municipiosPorDepartamento = {
  Atlántico: [
    "Barranquilla",
    "Baranoa",
    "Campo de la Cruz",
    "Candelaria",
    "Galapa",
    "Juan de Acosta",
    "Luruaco",
    "Malambo",
    "Manati",
    "Palmar de varela",
    "Piojo",
    "Polonuevo",
    "Ponedera",
    "Puerto Colombia",
    "Repelon",
    "Sabanagrande",
    "Sabanalarga",
    "Santa Lucia",
    "Santo Tomas",
    "Soledad",
    "Suan",
    "Tubara",
    "Usiacuri",
  ],
  "La Guajira": [
    "Riohacha",
    "Albania",
    "Barrancas",
    "Dibulla",
    "Distraccion",
    "El Molino",
    "Fonseca",
    "Hatonuevo",
    "La Jagua del Pilar",
    "Maicao",
    "Manaure",
    "San Juan del Cesar",
    "Uribia",
    "Urumita",
    "Villanueva",
  ],
  Magdalena: [
    "Santa Marta",
    "Aracataca",
    "Cerro de San Antonio",
    "Chibolo",
    "Cienaga",
    "Concordia",
    "El Piñon",
    "El Reten",
    "Fundacion",
    "Pedraza",
    "Pivijay",
    "Plato",
    "Puebloviejo",
    "Remolino",
    "Salamina",
    "Sitionuevo",
    "Tenerife",
    "Zapayan",
    "Zona Bananera",
  ],
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado - Inicializando página PRST")

  // Inicializar el almacenamiento
  if (typeof Storage !== "undefined" && Storage.init) {
    Storage.init()
    console.log("Storage inicializado correctamente")
  } else {
    console.error("Error: Storage no está disponible o no tiene método init")
  }

  // Verificar si el usuario está logueado y tiene el rol correcto
  const loggedUser = Storage.getLoggedUser()
  console.log("Usuario logueado:", loggedUser)

  if (!loggedUser) {
    console.error("No hay usuario logueado, redirigiendo a login")
    window.location.href = "login.html"
    return
  } else if (loggedUser.rol !== "prst") {
    console.error(`Usuario con rol incorrecto: ${loggedUser.rol}, redirigiendo a dashboard`)
    window.location.href = "dashboard.html"
    return
  }

  // Guardar el usuario actual en la variable global
  currentUser = loggedUser
  console.log("Usuario PRST autenticado:", currentUser)

  // Inicializar componentes
  initializeComponents()

  // Cargar datos iniciales
  loadUserData()
  loadProjects()
  loadNotifications()

  // Manejar eventos
  setupEventListeners()
})

// Inicializar componentes de la interfaz
function initializeComponents() {
  console.log("Inicializando componentes de la interfaz")

  // Inicializar tooltips de Bootstrap
  if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))
    console.log("Tooltips inicializados")
  } else {
    console.warn("Bootstrap no está disponible o no tiene Tooltip")
  }

  // Inicializar popovers de Bootstrap
  if (typeof bootstrap !== "undefined" && bootstrap.Popover) {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    popoverTriggerList.map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl))
    console.log("Popovers inicializados")
  } else {
    console.warn("Bootstrap no está disponible o no tiene Popover")
  }

  // Inicializar selectores de fecha
  const dateInputs = document.querySelectorAll(".datepicker")
  dateInputs.forEach((input) => {
    input.type = "date"
  })
  console.log("Selectores de fecha inicializados")
}

// Modificar la función loadUserData para mostrar correctamente el nombre de PRST y nombre corto
function loadUserData() {
  console.log("Cargando datos del usuario")

  if (!currentUser) {
    console.error("No hay usuario actual para cargar datos")
    return
  }

  // Mostrar nombre del usuario en la barra de navegación
  const userNameElement = document.getElementById("user-name")
  if (userNameElement) {
    userNameElement.textContent = `${currentUser.nombre} ${currentUser.apellido || ""}`
  } else {
    console.warn("Elemento user-name no encontrado")
  }

  // Obtener el nombre corto del PRST
  const prstList = Storage.getPRSTList()
  const prstInfo = prstList.find(
    (p) =>
      p.nombreCompleto.toLowerCase() === (currentUser.nombrePRST || "").toLowerCase() ||
      p.nombreCorto.toLowerCase() === (currentUser.nombrePRST || "").toLowerCase(),
  )

  const nombreCompletoPRST = prstInfo ? prstInfo.nombreCompleto : currentUser.nombrePRST || "No especificado"
  const nombreCortoPRST = prstInfo ? prstInfo.nombreCorto : currentUser.nombrePRST || "No especificado"

  // Mostrar datos del usuario en la sección de perfil
  const profileElements = {
    "profile-name": `${currentUser.nombre} ${currentUser.apellido || ""}`,
    "profile-email": currentUser.correo || "",
    "profile-role": "PRST",
    "profile-prst-name": nombreCompletoPRST,
    "profile-prst-short": nombreCortoPRST,
    "profile-id": currentUser.cedula || "No especificado",
    "profile-mp": currentUser.matriculaProfesional || "No especificado",
    "profile-address": currentUser.direccion || "No especificado",
    "profile-neighborhood": currentUser.barrio || "No especificado",
    "profile-city": currentUser.ciudad || "No especificado",
    "profile-phone": currentUser.celular || "No especificado",
  }

  for (const [id, value] of Object.entries(profileElements)) {
    const element = document.getElementById(id)
    if (element) {
      element.textContent = value
    } else {
      console.warn(`Elemento ${id} no encontrado`)
    }
  }

  console.log("Datos del usuario cargados correctamente")
}

// Update the state mapping in loadProjects function to correctly display states
function loadProjects() {
  console.log("Cargando proyectos del usuario")

  if (!currentUser) {
    console.error("No hay usuario actual para cargar proyectos")
    return
  }

  try {
    const projects = Storage.getProjects().filter((project) => project.creadorId === currentUser.id)
    console.log(`Se encontraron ${projects.length} proyectos para el usuario`)

    const projectsTableBody = document.getElementById("projects-table-body")
    if (!projectsTableBody) {
      console.error("Elemento projects-table-body no encontrado")
      return
    }

    if (projects.length === 0) {
      projectsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">No hay proyectos creados. Crea tu primer proyecto haciendo clic en "Nuevo Proyecto".</td>
        </tr>
      `
      return
    }

    projectsTableBody.innerHTML = ""

    projects.forEach((project) => {
      // Map the state to a simplified version for PRST view
      let displayState = project.estado

      // Group states for PRST view
      if (
        [
          "En Asignación",
          "Asignado",
          "En Gestion por Analista",
          "En Gestion por Brigada",
          "Gestionado por Analista",
          "Gestionado por Analista con Observación",
          "Gestionado por Brigada",
          "Gestionado por Brigada con Observación",
          "En Revision de Verificacion",
          "Generacion de Informe",
        ].includes(project.estado)
      ) {
        displayState = "En Gestión"
      } else if (project.estado === "Documentación Errada") {
        displayState = "Documentación Errada"
      }

      // Determine class based on the state
      let statusClass = ""
      switch (displayState) {
        case "Documentación Errada":
          statusClass = "table-danger"
          break
        case "En Revisión por Ejecutiva":
          statusClass = "table-warning"
          break
        case "En Gestión":
          statusClass = "table-info"
          break
        case "Finalizado":
          statusClass = "table-success"
          break
        default:
          statusClass = ""
      }

      // Determine available actions based on the state
      let actions = `
        <button class="btn btn-sm btn-info view-project" data-id="${project.id}" title="Ver Detalles">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-info ver-historial" data-id="${project.id}" title="Ver Historial">
          <i class="fas fa-clock"></i>
        </button>
      `

      if (project.estado === "Nuevo" || project.estado === "Documentación Errada") {
        actions += `
          <button class="btn btn-sm btn-primary edit-project" data-id="${project.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-success send-project" data-id="${project.id}" title="Enviar a Revisión">
            <i class="fas fa-paper-plane"></i>
          </button>
        `
      }

      const row = document.createElement("tr")
      row.className = statusClass
      row.innerHTML = `
        <td>${project.id || "N/A"}</td>
        <td>${project.nombre || "Sin nombre"}</td>
        <td>${(project.municipio || "N/A") + ", " + (project.departamento || "N/A")}</td>
        <td>${project.fechaCreacion ? new Date(project.fechaCreacion).toLocaleDateString() : "N/A"}</td>
        <td>
          <span class="badge ${getBadgeClass(displayState)}">${displayState}</span>
        </td>
        <td>${actions}</td>
      `

      projectsTableBody.appendChild(row)
    })

    console.log("Proyectos cargados correctamente")
  } catch (error) {
    console.error("Error al cargar proyectos:", error)
    alert("Error al cargar los proyectos. Por favor, recargue la página.")
  }

  // After loading projects, populate date filters
  populateDateFilters()
}

// Configurar listeners de eventos
function setupEventListeners() {
  console.log("Configurando listeners de eventos")

  try {
    // Cerrar sesión
    const logoutButton = document.getElementById("logout-button")
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        console.log("Cerrando sesión")
        Storage.logout()
        window.location.href = "login.html"
      })
    } else {
      console.warn("Elemento logout-button no encontrado")
    }

    // Mostrar perfil
    const profileButton = document.getElementById("profile-button")
    if (profileButton) {
      profileButton.addEventListener("click", () => {
        console.log("Mostrando perfil")
        showView("profile-view")
      })
    } else {
      console.warn("Elemento profile-button no encontrado")
    }

    // Volver al panel principal desde perfil
    const backToMainButtonProfile = document.getElementById("back-to-main-button-profile")
    if (backToMainButtonProfile) {
      backToMainButtonProfile.addEventListener("click", () => {
        console.log("Volviendo al panel principal desde perfil")
        showView("main-view")
      })
    } else {
      console.warn("Elemento back-to-main-button-profile no encontrado")
    }

    // Volver al panel principal desde perfil (segundo botón)
    const backToMainButton2 = document.getElementById("back-to-main-button-2")
    if (backToMainButton2) {
      backToMainButton2.addEventListener("click", () => {
        console.log("Volviendo al panel principal desde perfil (botón 2)")
        showView("main-view")
      })
    } else {
      console.warn("Elemento back-to-main-button-2 no encontrado")
    }

    // Mostrar modal de nuevo proyecto
    const newProjectButton = document.getElementById("new-project-button")
    if (newProjectButton) {
      newProjectButton.addEventListener("click", () => {
        console.log("Mostrando formulario de nuevo proyecto")
        // Limpiar formulario
        const projectForm = document.getElementById("project-form")
        if (projectForm) {
          projectForm.reset()
        }

        document.getElementById("project-id").value = ""
        document.getElementById("project-form-title").textContent = "Nuevo Proyecto"

        const neighborhoodsList = document.getElementById("neighborhoods-list")
        if (neighborhoodsList) {
          neighborhoodsList.innerHTML = ""
        }

        const ejecutivaObservationsAlert = document.getElementById("ejecutiva-observations-alert")
        if (ejecutivaObservationsAlert) {
          ejecutivaObservationsAlert.classList.add("d-none")
        }

        // Mostrar vista de formulario
        showView("project-form-view")
      })
    } else {
      console.warn("Elemento new-project-button no encontrado")
    }

    // Volver al panel principal desde formulario
    const backToMainButton = document.getElementById("back-to-main-button")
    if (backToMainButton) {
      backToMainButton.addEventListener("click", () => {
        console.log("Volviendo al panel principal desde formulario")
        showView("main-view")
      })
    } else {
      console.warn("Elemento back-to-main-button no encontrado")
    }

    // Cancelar creación/edición de proyecto
    const cancelProjectButton = document.getElementById("cancel-project-button")
    if (cancelProjectButton) {
      cancelProjectButton.addEventListener("click", () => {
        console.log("Cancelando creación/edición de proyecto")
        showView("main-view")
      })
    } else {
      console.warn("Elemento cancel-project-button no encontrado")
    }

    // Agregar barrio
    const addNeighborhoodButton = document.getElementById("add-neighborhood-button")
    if (addNeighborhoodButton) {
      addNeighborhoodButton.addEventListener("click", () => {
        const neighborhoodInput = document.getElementById("project-neighborhood")
        if (neighborhoodInput) {
          const neighborhood = neighborhoodInput.value.trim()
          if (neighborhood) {
            console.log(`Agregando barrio: ${neighborhood}`)
            addNeighborhood(neighborhood)
            neighborhoodInput.value = ""
            neighborhoodInput.focus()
          } else {
            console.warn("Intento de agregar barrio vacío")
          }
        } else {
          console.warn("Elemento project-neighborhood no encontrado")
        }
      })
    } else {
      console.warn("Elemento add-neighborhood-button no encontrado")
    }

    // Guardar proyecto
    const projectForm = document.getElementById("project-form")
    if (projectForm) {
      projectForm.addEventListener("submit", (e) => {
        e.preventDefault()
        console.log("Formulario de proyecto enviado")

        // Validar que todos los campos obligatorios estén completos
        const requiredFields = [
          "project-name",
          "project-address-start",
          "project-address-end",
          "project-department",
          "project-municipality",
          "project-posts",
          "project-start-date",
          "project-end-date",
          "project-connection",
        ]

        let isValid = true
        requiredFields.forEach((fieldId) => {
          const field = document.getElementById(fieldId)
          if (field && !field.value) {
            field.classList.add("is-invalid")
            isValid = false
            console.warn(`Campo requerido vacío: ${fieldId}`)
          } else if (field) {
            field.classList.remove("is-invalid")
          } else {
            console.warn(`Campo requerido no encontrado: ${fieldId}`)
            isValid = false
          }
        })

        if (!isValid) {
          alert("Por favor, completa todos los campos obligatorios marcados con *")
          return
        }

        saveProject()
      })
    } else {
      console.warn("Elemento project-form no encontrado")
    }

    // Manejar cambio de departamento para actualizar municipios
    const departmentSelect = document.getElementById("project-department")
    if (departmentSelect) {
      departmentSelect.addEventListener("change", () => {
        console.log("Departamento cambiado, actualizando municipios")
        updateMunicipalityOptions()
      })
    } else {
      console.warn("Elemento project-department no encontrado")
    }

    // Cambiar contraseña
    const changePasswordButton = document.getElementById("change-password-button")
    if (changePasswordButton) {
      changePasswordButton.addEventListener("click", () => {
        console.log("Mostrando modal de cambio de contraseña")
        if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
          const changePasswordModal = new bootstrap.Modal(document.getElementById("change-password-modal"))
          changePasswordModal.show()
        } else {
          console.warn("Bootstrap no está disponible o no tiene Modal")
          alert("No se puede mostrar el modal de cambio de contraseña. Por favor, recargue la página.")
        }
      })
    } else {
      console.warn("Elemento change-password-button no encontrado")
    }

    // Guardar nueva contraseña
    const changePasswordForm = document.getElementById("change-password-form")
    if (changePasswordForm) {
      changePasswordForm.addEventListener("submit", (e) => {
        e.preventDefault()
        console.log("Formulario de cambio de contraseña enviado")
        changePassword()
      })
    } else {
      console.warn("Elemento change-password-form no encontrado")
    }

    // Notificaciones
    const notificationsButton = document.getElementById("notifications-button")
    if (notificationsButton) {
      notificationsButton.addEventListener("click", () => {
        console.log("Mostrando notificaciones")
        // Marcar notificaciones como leídas cuando se abren
        const notificationItems = document.querySelectorAll(".notification-item.unread")
        notificationItems.forEach((item) => {
          const notificationId = item.dataset.id
          if (notificationId) {
            console.log(`Marcando notificación como leída: ${notificationId}`)
            markNotificationAsRead(notificationId)
          }
        })
      })
    } else {
      console.warn("Elemento notifications-button no encontrado")
    }

    // Ver todas las notificaciones
    document.addEventListener("click", (e) => {
      if (e.target.id === "viewAllNotifications" || e.target.closest("#viewAllNotifications")) {
        console.log("Mostrando todas las notificaciones")
        if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
          const notificationsModal = new bootstrap.Modal(document.getElementById("notifications-modal"))
          notificationsModal.show()
          loadAllNotifications()
        } else {
          console.warn("Bootstrap no está disponible o no tiene Modal")
          alert("No se puede mostrar el modal de notificaciones. Por favor, recargue la página.")
        }
      }
    })

    // Marcar todas las notificaciones como leídas
    const markAllReadButton = document.getElementById("mark-all-read")
    if (markAllReadButton) {
      markAllReadButton.addEventListener("click", () => {
        console.log("Marcando todas las notificaciones como leídas")
        if (currentUser) {
          Storage.markAllNotificationsAsRead(currentUser.id)
          loadNotifications()
          loadAllNotifications()
        } else {
          console.warn("No hay usuario actual para marcar notificaciones como leídas")
        }
      })
    } else {
      console.warn("Elemento mark-all-read no encontrado")
    }

    // Ver detalles de proyecto
    document.addEventListener("click", (e) => {
      if (e.target.closest(".view-project")) {
        const projectId = e.target.closest(".view-project").dataset.id
        if (projectId) {
          console.log(`Viendo detalles del proyecto: ${projectId}`)
          viewProject(projectId)
        } else {
          console.warn("ID de proyecto no encontrado en el botón de ver detalles")
        }
      }
    })

    // Editar proyecto
    document.addEventListener("click", (e) => {
      if (e.target.closest(".edit-project")) {
        const projectId = e.target.closest(".edit-project").dataset.id
        if (projectId) {
          console.log(`Editando proyecto: ${projectId}`)
          editProject(projectId)
        } else {
          console.warn("ID de proyecto no encontrado en el botón de editar")
        }
      }
    })

    // Enviar proyecto a revisión
    document.addEventListener("click", (e) => {
      if (e.target.closest(".send-project")) {
        const projectId = e.target.closest(".send-project").dataset.id
        if (projectId) {
          console.log(`Enviando proyecto a revisión: ${projectId}`)
          sendProject(projectId)
        } else {
          console.warn("ID de proyecto no encontrado en el botón de enviar")
        }
      }
    })

    // Ver historial del proyecto
    document.addEventListener("click", (e) => {
      if (e.target.closest(".ver-historial")) {
        const projectId = e.target.closest(".ver-historial").dataset.id
        if (projectId) {
          console.log(`Viendo historial del proyecto: ${projectId}`)
          showProjectHistory(projectId)
        } else {
          console.warn("ID de proyecto no encontrado en el botón de ver historial")
        }
      }
    })

    // Validación de fechas
    const startDateInput = document.getElementById("project-start-date")
    const endDateInput = document.getElementById("project-end-date")
    const postsInput = document.getElementById("project-posts")

    if (startDateInput && endDateInput && postsInput) {
      // Validar al cambiar la fecha de inicio
      startDateInput.addEventListener("change", validateDates)

      // Validar al cambiar la fecha de fin
      endDateInput.addEventListener("change", validateDates)

      // Validar cuando cambia la cantidad de postes
      postsInput.addEventListener("input", validateDates)
    } else {
      console.warn("Algunos elementos de fecha o postes no encontrados")
    }

    console.log("Listeners de eventos configurados correctamente")
  } catch (error) {
    console.error("Error al configurar listeners de eventos:", error)
    alert("Error al configurar la página. Por favor, recargue la página.")
  }

  // Add filter event listeners
  setupFilterEventListeners()

  // Populate date filters
  populateDateFilters()
}

// Validar fechas
function validateDates() {
  console.log("Validando fechas")

  try {
    const startDateInput = document.getElementById("project-start-date")
    const endDateInput = document.getElementById("project-end-date")
    const postsInput = document.getElementById("project-posts")

    if (!startDateInput || !endDateInput || !postsInput) {
      console.warn("Elementos de fecha o postes no encontrados")
      return
    }

    if (!startDateInput.value) {
      console.log("Fecha de inicio no seleccionada, no se valida")
      return
    }

    const startDate = new Date(startDateInput.value)
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null
    const postsCount = Number.parseInt(postsInput.value, 10) || 0

    // Get current date and add 5 days
    const today = new Date()
    const minStartDate = new Date(today)
    minStartDate.setDate(today.getDate() + 5)

    // Validate that the start date is at least 5 days from today
    if (startDate < minStartDate) {
      console.warn("Fecha de inicio menor a 5 días desde hoy")
      alert("La fecha de inicio debe ser al menos 5 días después de la fecha actual")
      startDateInput.value = ""
      return
    }

    // Validate that the end date is not before the start date
    if (endDate && endDate < startDate) {
      console.warn("Fecha de fin anterior a fecha de inicio")
      alert("La fecha de finalización no puede ser anterior a la fecha de inicio")
      endDateInput.value = ""
      return
    }

    // Calculate the maximum allowed end date based on the start date
    if (endDate && postsCount > 0) {
      const maxEndDate = new Date(startDate)
      const maxDuration = postsCount <= 50 ? 30 : 45
      maxEndDate.setDate(startDate.getDate() + maxDuration - 1) // -1 because we count the start day

      // Validate that the construction period doesn't exceed the maximum allowed duration
      if (endDate > maxEndDate) {
        console.warn(`Duración excede el máximo permitido de ${maxDuration} días`)
        alert(
          `Para ${postsCount} postes, la duración máxima permitida es de ${maxDuration} días. La fecha de finalización no puede ser posterior a ${maxEndDate.toLocaleDateString()}.`,
        )
        endDateInput.value = ""
        return
      }
    }

    // Validate that the time between request date (today) and construction start date doesn't exceed 30 days
    const maxRequestToStartDays = 30
    const maxStartDate = new Date(today)
    maxStartDate.setDate(today.getDate() + maxRequestToStartDays)

    if (startDate > maxStartDate) {
      console.warn(`Fecha de inicio excede ${maxRequestToStartDays} días desde hoy`)
      alert(
        `La fecha de inicio no puede ser más de ${maxRequestToStartDays} días después de la fecha de solicitud (hoy).`,
      )
      startDateInput.value = ""
      return
    }

    console.log("Fechas validadas correctamente")
  } catch (error) {
    console.error("Error al validar fechas:", error)
    alert("Error al validar las fechas. Por favor, intente nuevamente.")
  }
}

// Función para actualizar las opciones de municipio según el departamento seleccionado
function updateMunicipalityOptions() {
  console.log("Actualizando opciones de municipio")

  try {
    const departmentSelect = document.getElementById("project-department")
    const municipalitySelect = document.getElementById("project-municipality")

    if (!departmentSelect || !municipalitySelect) {
      console.warn("Elementos de departamento o municipio no encontrados")
      return
    }

    const department = departmentSelect.value
    console.log(`Departamento seleccionado: ${department}`)

    municipalitySelect.innerHTML = '<option value="">Seleccione un municipio</option>'

    if (department && municipiosPorDepartamento[department]) {
      municipiosPorDepartamento[department].forEach((municipio) => {
        const option = document.createElement("option")
        option.value = municipio
        option.textContent = municipio
        municipalitySelect.appendChild(option)
      })
      console.log(`Se cargaron ${municipiosPorDepartamento[department].length} municipios`)
    } else {
      console.warn(`No se encontraron municipios para el departamento: ${department}`)
    }
  } catch (error) {
    console.error("Error al actualizar opciones de municipio:", error)
    alert("Error al cargar los municipios. Por favor, seleccione el departamento nuevamente.")
  }
}

// Obtener clase para el badge según el estado
function getBadgeClass(estado) {
  switch (estado) {
    case "Nuevo":
      return "bg-secondary"
    case "En Revisión por Ejecutiva":
      return "bg-warning text-dark"
    case "En Asignación":
      return "bg-info text-dark"
    case "Asignado":
      return "bg-primary"
    case "En Revisión de Verificación":
      return "bg-info"
    case "Opción Mejorar":
    case "Opcion Mejorar":
      return "bg-warning"
    case "Generación de Informe":
      return "bg-light text-dark"
    case "Finalizado":
      return "bg-success"
    case "Documentación Errada":
      return "bg-danger"
    default:
      return "bg-secondary"
  }
}

// Mostrar vista específica
function showView(viewId) {
  console.log(`Mostrando vista: ${viewId}`)

  try {
    // Ocultar todas las vistas
    const views = document.querySelectorAll(".view")
    views.forEach((view) => {
      view.classList.add("d-none")
    })

    // Mostrar la vista seleccionada
    const selectedView = document.getElementById(viewId)
    if (selectedView) {
      selectedView.classList.remove("d-none")
    } else {
      console.warn(`Vista no encontrada: ${viewId}`)
    }
  } catch (error) {
    console.error("Error al mostrar vista:", error)
    alert("Error al cambiar de vista. Por favor, recargue la página.")
  }
}

// Agregar barrio a la lista
function addNeighborhood(neighborhood) {
  console.log(`Agregando barrio: ${neighborhood}`)

  try {
    const neighborhoodsList = document.getElementById("neighborhoods-list")
    if (!neighborhoodsList) {
      console.warn("Elemento neighborhoods-list no encontrado")
      return
    }

    // Crear elemento de barrio
    const neighborhoodItem = document.createElement("div")
    neighborhoodItem.className = "neighborhood-item"
    neighborhoodItem.innerHTML = `
        <span>${neighborhood}</span>
        <button type="button" class="btn btn-sm btn-danger remove-neighborhood">
            <i class="fas fa-times"></i>
        </button>
    `

    // Agregar evento para eliminar barrio
    const removeButton = neighborhoodItem.querySelector(".remove-neighborhood")
    if (removeButton) {
      removeButton.addEventListener("click", () => {
        console.log(`Eliminando barrio: ${neighborhood}`)
        neighborhoodItem.remove()
      })
    }

    // Agregar a la lista
    neighborhoodsList.appendChild(neighborhoodItem)
  } catch (error) {
    console.error("Error al agregar barrio:", error)
    alert("Error al agregar el barrio. Por favor, intente nuevamente.")
  }
}

// Guardar proyecto
function saveProject() {
  console.log("Guardando proyecto")

  try {
    // Obtener datos del formulario
    const projectId = document.getElementById("project-id").value
    const nombre = document.getElementById("project-name").value
    const direccionInicial = document.getElementById("project-address-start").value
    const direccionFinal = document.getElementById("project-address-end").value
    const municipio = document.getElementById("project-municipality").value
    const departamento = document.getElementById("project-department").value
    const numPostes = document.getElementById("project-posts").value
    const fechaInicio = document.getElementById("project-start-date").value
    const fechaFin = document.getElementById("project-end-date").value
    const puntoConexion = document.getElementById("project-connection").value
    const observaciones = document.getElementById("project-observations").value

    // Validar campos obligatorios
    if (
      !nombre ||
      !direccionInicial ||
      !direccionFinal ||
      !municipio ||
      !departamento ||
      !numPostes ||
      !fechaInicio ||
      !fechaFin ||
      !puntoConexion
    ) {
      console.warn("Campos obligatorios incompletos")
      alert("Por favor complete todos los campos obligatorios")
      return
    }

    // Obtener barrios
    const neighborhoodItems = document.querySelectorAll("#neighborhoods-list .neighborhood-item")
    const barrios = Array.from(neighborhoodItems).map((item) => item.querySelector("span").textContent)
    console.log(`Barrios: ${barrios.join(", ")}`)

    // Obtener archivos (opcional)
    const kmzFile = document.getElementById("project-kmz").files[0]
    const dwgFile = document.getElementById("project-dwg").files[0]
    const matriculaFile = document.getElementById("project-matricula").files[0]
    const ccFile = document.getElementById("project-cc").files[0]
    const formularioFile = document.getElementById("project-formulario").files[0]

    // Crear objeto del proyecto
    const loggedUser = Storage.getLoggedUser()
    if (!loggedUser) {
      console.error("No hay usuario logueado")
      alert("Error: No hay usuario logueado. Por favor, inicie sesión nuevamente.")
      window.location.href = "login.html"
      return
    }

    const prstName = loggedUser.nombrePRST || loggedUser.nombre

    const project = {
      nombre,
      direccionInicial,
      direccionFinal,
      barrios,
      municipio,
      departamento,
      numPostes: Number.parseInt(numPostes),
      fechaInicio,
      fechaFin,
      puntoConexion,
      observaciones: observaciones || "",
      creadorId: loggedUser.id,
      creadorNombre: `${loggedUser.nombre} ${loggedUser.apellido || ""}`,
      prstNombre: prstName,
      estado: "Nuevo",
      documentos: {},
      fechaCreacion: new Date().toISOString(),
    }

    // Manejar archivos
    project.documentos = {
      kmz: kmzFile ? { nombre: kmzFile.name, tipo: kmzFile.type, tamaño: kmzFile.size } : null,
      dwg: dwgFile ? { nombre: dwgFile.name, tipo: dwgFile.type, tamaño: dwgFile.size } : null,
      matricula: matriculaFile
        ? { nombre: matriculaFile.name, tipo: matriculaFile.type, tamaño: matriculaFile.size }
        : null,
      cc: ccFile ? { nombre: ccFile.name, tipo: ccFile.type, tamaño: ccFile.size } : null,
      formulario: formularioFile
        ? { nombre: formularioFile.name, tipo: formularioFile.type, tamaño: formularioFile.size }
        : null,
    }

    // Si es edición, mantener el ID existente
    if (projectId) {
      project.id = projectId
      project.fechaActualizacion = new Date().toISOString()
      console.log(`Actualizando proyecto existente con ID: ${projectId}`)
    } else {
      console.log("Creando nuevo proyecto")
    }

    // Validar fechas
    const startDate = new Date(fechaInicio)
    const endDate = new Date(fechaFin)
    const today = new Date()

    // Validación de fecha mínima de inicio (5 días después de hoy)
    const minStartDate = new Date(today)
    minStartDate.setDate(today.getDate() + 5)

    if (startDate < minStartDate) {
      console.warn("Fecha de inicio menor a 5 días desde hoy")
      alert("La fecha de inicio debe ser al menos 5 días después de la fecha actual")
      return
    }

    // Validar que fin no sea antes de inicio
    if (endDate < startDate) {
      console.warn("Fecha de fin anterior a fecha de inicio")
      alert("La fecha de finalización no puede ser anterior a la fecha de inicio")
      return
    }

    // Validar duración máxima según número de postes
    const maxDuration = project.numPostes <= 50 ? 30 : 45
    const maxEndDate = new Date(startDate)
    maxEndDate.setDate(startDate.getDate() + maxDuration)

    if (endDate > maxEndDate) {
      console.warn(`Duración excede el máximo permitido de ${maxDuration} días`)
      alert(`Para ${project.numPostes} postes, la duración máxima es de ${maxDuration} días`)
      return
    }

    // Guardar proyecto
    console.log("Guardando proyecto en Storage")
    const savedProject = Storage.saveProject(project)

    if (!savedProject) {
      console.error("Error al guardar el proyecto en Storage")
      alert("Error al guardar el proyecto. Por favor, intente nuevamente.")
      return
    }

    // Mostrar éxito
    console.log(`Proyecto guardado exitosamente con ID: ${savedProject.id}`)
    alert(`Proyecto ${projectId ? "actualizado" : "creado"} con ID: ${savedProject.id}`)

    // Recargar y volver al listado
    loadProjects()
    showView("main-view")
  } catch (error) {
    console.error("Error al guardar proyecto:", error)
    alert("Error al guardar el proyecto: " + error.message)
  }
}

// Editar proyecto
function editProject(projectId) {
  console.log(`Editando proyecto: ${projectId}`)

  try {
    const project = Storage.getProjectById(projectId)
    if (!project) {
      console.error(`Proyecto no encontrado: ${projectId}`)
      alert("No se encontró el proyecto a editar")
      return
    }

    console.log("Datos del proyecto a editar:", project)

    // Llenar formulario con datos del proyecto
    document.getElementById("project-id").value = project.id
    document.getElementById("project-name").value = project.nombre
    document.getElementById("project-address-start").value = project.direccionInicial
    document.getElementById("project-address-end").value = project.direccionFinal
    document.getElementById("project-posts").value = project.numPostes
    document.getElementById("project-start-date").value = project.fechaInicio
    document.getElementById("project-end-date").value = project.fechaFin
    document.getElementById("project-connection").value = project.puntoConexion
    document.getElementById("project-observations").value = project.observaciones || ""

    // Manejar departamento y municipio
    const departmentSelect = document.getElementById("project-department")
    if (departmentSelect) {
      departmentSelect.value = project.departamento

      // Disparar evento change para cargar municipios
      const event = new Event("change")
      departmentSelect.dispatchEvent(event)

      // Esperar un breve momento para que se carguen los municipios
      setTimeout(() => {
        const municipalitySelect = document.getElementById("project-municipality")
        if (municipalitySelect) {
          municipalitySelect.value = project.municipio
        }
      }, 100)
    }

    // Limpiar y cargar barrios
    const neighborhoodsList = document.getElementById("neighborhoods-list")
    if (neighborhoodsList) {
      neighborhoodsList.innerHTML = ""
      if (project.barrios && project.barrios.length > 0) {
        project.barrios.forEach((barrio) => addNeighborhood(barrio))
      }
    }

    // Mostrar observaciones de ejecutiva si existen
    const ejecutivaObservationsAlert = document.getElementById("ejecutiva-observations-alert")
    if (ejecutivaObservationsAlert) {
      if (project.observacionesEjecutiva) {
        ejecutivaObservationsAlert.textContent = project.observacionesEjecutiva
        ejecutivaObservationsAlert.classList.remove("d-none")
      } else {
        ejecutivaObservationsAlert.classList.add("d-none")
      }
    }

    // Actualizar título del formulario
    document.getElementById("project-form-title").textContent = "Editar Proyecto"

    // Mostrar vista de formulario
    showView("project-form-view")
  } catch (error) {
    console.error("Error al editar proyecto:", error)
    alert("Error al cargar el proyecto para editar. Por favor, intente nuevamente.")
  }
}

// Ver detalles de proyecto
function viewProject(projectId) {
  console.log(`Viendo detalles del proyecto: ${projectId}`)

  try {
    const project = Storage.getProjectById(projectId)
    if (!project) {
      console.error(`Proyecto no encontrado: ${projectId}`)
      return
    }

    console.log("Datos del proyecto a ver:", project)

    // Llenar datos en el modal
    const detailElements = {
      "detail-project-id": project.id || "N/A",
      "detail-project-name": project.nombre || "Sin nombre",
      "detail-project-creator": project.creadorNombre || "Desconocido",
      "detail-project-status": project.estado || "Desconocido",
      "detail-project-creation-date": project.fechaCreacion
        ? new Date(project.fechaCreacion).toLocaleDateString()
        : "N/A",
      "detail-project-start-date": project.fechaInicio || "N/A",
      "detail-project-end-date": project.fechaFin || "N/A",
      "detail-project-address-start": project.direccionInicial || "N/A",
      "detail-project-address-end": project.direccionFinal || "N/A",
      "detail-project-neighborhoods":
        project.barrios && project.barrios.length > 0 ? project.barrios.join(", ") : "No especificado",
      "detail-project-municipality": project.municipio || "N/A",
      "detail-project-department": project.departamento || "N/A",
      "detail-project-posts": project.numPostes || "N/A",
      "detail-project-connection": project.puntoConexion || "N/A",
      "detail-project-observations": project.observaciones || "No hay observaciones",
    }

    for (const [id, value] of Object.entries(detailElements)) {
      const element = document.getElementById(id)
      if (element) {
        element.textContent = value
      } else {
        console.warn(`Elemento ${id} no encontrado`)
      }
    }

    // Enlaces a documentos
    const documentLinks = {
      "detail-kmz-link": project.documentos?.kmz,
      "detail-dwg-link": project.documentos?.dwg,
      "detail-matricula-link": project.documentos?.matricula,
      "detail-cc-link": project.documentos?.cc,
      "detail-formulario-link": project.documentos?.formulario,
    }

    for (const [id, doc] of Object.entries(documentLinks)) {
      const element = document.getElementById(id)
      if (element) {
        if (doc) {
          element.href = "#"
          element.textContent = doc.nombre || "Ver documento"
          element.onclick = () => {
            console.log(`Simulando descarga de documento: ${doc.nombre}`)
            alert(`Descargando archivo: ${doc.nombre}`)
            return false
          }
        } else {
          element.href = "#"
          element.textContent = "No disponible"
          element.onclick = () => {
            alert("Documento no disponible")
            return false
          }
        }
      } else {
        console.warn(`Elemento ${id} no encontrado`)
      }
    }

    // Mostrar observaciones si existen
    const ejecutivaObsContainer = document.getElementById("detail-ejecutiva-observations-container")
    if (ejecutivaObsContainer) {
      if (project.observacionesEjecutiva) {
        const obsElement = document.getElementById("detail-ejecutiva-observations")
        if (obsElement) {
          obsElement.textContent = project.observacionesEjecutiva
        }
        ejecutivaObsContainer.classList.remove("d-none")
      } else {
        ejecutivaObsContainer.classList.add("d-none")
      }
    }

    const analistaObsContainer = document.getElementById("detail-analista-observations-container")
    if (analistaObsContainer) {
      if (project.observacionesAnalista) {
        const obsElement = document.getElementById("detail-analista-observations")
        if (obsElement) {
          obsElement.textContent = project.observacionesAnalista
        }
        analistaObsContainer.classList.remove("d-none")
      } else {
        analistaObsContainer.classList.add("d-none")
      }
    }

    // Mostrar modal
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const projectDetailModal = new bootstrap.Modal(document.getElementById("project-detail-modal"))
      projectDetailModal.show()
    } else {
      console.warn("Bootstrap no está disponible o no tiene Modal")
      alert("No se puede mostrar el modal de detalles. Por favor, recargue la página.")
    }
  } catch (error) {
    console.error("Error al ver detalles del proyecto:", error)
    alert("Error al cargar los detalles del proyecto. Por favor, intente nuevamente.")
  }
}

// Enviar proyecto a revisión
function sendProject(projectId) {
  console.log(`Enviando proyecto a revisión: ${projectId}`)

  try {
    const project = Storage.getProjectById(projectId)
    if (!project) {
      console.error(`Proyecto no encontrado: ${projectId}`)
      return
    }

    // Check if project was previously rejected and requires file updates
    if (project.estado === "Documentación Errada" || project.observacionesEjecutiva) {
      // Check if any files were updated since rejection
      const kmzFile = document.getElementById("project-kmz").files[0]
      const dwgFile = document.getElementById("project-dwg").files[0]
      const matriculaFile = document.getElementById("project-matricula").files[0]
      const ccFile = document.getElementById("project-cc").files[0]
      const formularioFile = document.getElementById("project-formulario").files[0]

      if (!kmzFile && !dwgFile && !matriculaFile && !ccFile && !formularioFile) {
        alert(
          "Este proyecto fue rechazado anteriormente. Debe actualizar al menos uno de los archivos con observaciones antes de enviarlo nuevamente.",
        )
        return
      }
    }

    // Confirmar acción
    if (
      !confirm(
        "¿Estás seguro de enviar este proyecto a revisión? Una vez enviado, no podrás editarlo hasta que sea revisado.",
      )
    ) {
      console.log("Envío cancelado por el usuario")
      return
    }

    // Actualizar estado del proyecto
    project.estado = "En Revisión por Ejecutiva"
    project.fechaEnvio = new Date().toISOString()

    // Asignar a un usuario ejecutivo
    const ejecutivas = Storage.getUsers().filter((user) => user.rol === "ejecutiva" && user.activo)
    console.log(`Ejecutivas disponibles: ${ejecutivas.length}`)

    if (ejecutivas.length > 0) {
      // Asignar a una ejecutiva aleatoria (en un sistema real podría ser por carga de trabajo)
      const ejecutivaAsignada = ejecutivas[Math.floor(Math.random() * ejecutivas.length)]
      project.ejecutivaId = ejecutivaAsignada.id
      project.ejecutivaNombre = `${ejecutivaAsignada.nombre} ${ejecutivaAsignada.apellido || ""}`
      console.log(`Proyecto asignado a ejecutiva: ${project.ejecutivaNombre} (${project.ejecutivaId})`)

      // Crear historial si no existe
      if (!project.historial) {
        project.historial = []
      }

      // Agregar entrada al historial
      project.historial.push({
        estado: "En Revisión por Ejecutiva",
        fecha: new Date().toISOString(),
        usuario: `${currentUser.nombre} ${currentUser.apellido || ""}`,
        rol: "PRST",
        comentario: "Proyecto enviado a revisión",
      })

      // Guardar proyecto
      Storage.saveProject(project)
      console.log("Proyecto guardado con nuevo estado y asignación")

      // Crear notificación para el usuario PRST
      Storage.createNotification({
        usuarioId: currentUser.id,
        tipo: "proyecto_enviado",
        mensaje: `Has enviado el proyecto "${project.nombre}" con ID ${project.id} a revisión. Ha sido asignado a ${project.ejecutivaNombre}.`,
        fechaCreacion: new Date().toISOString(),
        leido: false,
      })

      // Crear notificación para la ejecutiva asignada
      Storage.createNotification({
        usuarioId: ejecutivaAsignada.id,
        tipo: "proyecto_asignado",
        mensaje: `Se te ha asignado un nuevo proyecto para revisar: "${project.nombre}" con ID ${project.id}.`,
        fechaCreacion: new Date().toISOString(),
        leido: false,
      })

      // Recargar proyectos y notificaciones
      loadProjects()
      loadNotifications()

      // Mostrar mensaje de éxito
      alert(`Proyecto enviado a revisión correctamente. Ha sido asignado a ${project.ejecutivaNombre}.`)
    } else {
      console.error("No hay ejecutivas disponibles")
      alert("No hay usuarios ejecutivos disponibles para asignar el proyecto. Por favor, contacte al administrador.")
    }
  } catch (error) {
    console.error("Error al enviar proyecto a revisión:", error)
    alert("Error al enviar el proyecto a revisión. Por favor, intente nuevamente.")
  }
}

// Cargar notificaciones del usuario
function loadNotifications() {
  console.log("Cargando notificaciones")

  try {
    if (!currentUser) {
      console.warn("No hay usuario actual para cargar notificaciones")
      return
    }

    const notifications = Storage.getNotificationsByUser(currentUser.id)
    console.log(`Notificaciones encontradas: ${notifications.length}`)

    // Actualizar contador de notificaciones
    const notificationCount = notifications.filter((n) => !n.leido).length
    const notificationBadge = document.getElementById("notification-badge")
    if (notificationBadge) {
      notificationBadge.textContent = notificationCount
      notificationBadge.classList.toggle("d-none", notificationCount === 0)
    } else {
      console.warn("Elemento notification-badge no encontrado")
    }

    // Actualizar lista de notificaciones en el dropdown
    const notificationsList = document.getElementById("notifications-list")
    if (notificationsList) {
      if (notifications.length === 0) {
        notificationsList.innerHTML = `
          <div class="dropdown-item text-center">No tienes notificaciones</div>
        `
      } else {
        notificationsList.innerHTML = ""

        // Mostrar las 5 notificaciones más recientes
        const recentNotifications = notifications
          .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
          .slice(0, 5)

        recentNotifications.forEach((notification) => {
          const item = document.createElement("div")
          item.className = `dropdown-item notification-item ${notification.leido ? "" : "unread"}`
          item.dataset.id = notification.id

          item.innerHTML = `
            <div class="d-flex align-items-center">
              <div class="notification-icon me-3">
                <i class="fas ${getNotificationIcon(notification.tipo)} text-primary"></i>
              </div>
              <div class="notification-content flex-grow-1">
                <div class="notification-text">${notification.mensaje}</div>
                <div class="notification-time text-muted small">${formatDate(notification.fechaCreacion)}</div>
              </div>
              ${notification.leido ? "" : '<div class="notification-badge"></div>'}
            </div>
          `

          notificationsList.appendChild(item)
        })

        // Agregar enlace para ver todas las notificaciones
        const viewAllLink = document.createElement("div")
        viewAllLink.className = "dropdown-item text-center text-primary"
        viewAllLink.textContent = "Ver todas las notificaciones"
        viewAllLink.id = "viewAllNotifications"
        viewAllLink.style.cursor = "pointer"
        notificationsList.appendChild(viewAllLink)
      }
    } else {
      console.warn("Elemento notifications-list no encontrado")
    }

    console.log("Notificaciones cargadas correctamente")
  } catch (error) {
    console.error("Error al cargar notificaciones:", error)
  }
}

// Obtener icono según el tipo de notificación
function getNotificationIcon(tipo) {
  switch (tipo) {
    case "proyecto_creado":
      return "fa-plus-circle"
    case "proyecto_actualizado":
      return "fa-edit"
    case "proyecto_enviado":
      return "fa-paper-plane"
    case "proyecto_revisado":
      return "fa-check-circle"
    case "proyecto_rechazado":
      return "fa-times-circle"
    case "proyecto_asignado":
      return "fa-user-check"
    case "proyecto_finalizado":
      return "fa-flag-checkered"
    default:
      return "fa-bell"
  }
}

// Formatear fecha para mostrar en notificaciones
function formatDate(dateString, includeTime = false) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (!includeTime) {
      if (diffSecs < 60) {
        return "Hace un momento"
      } else if (diffMins < 60) {
        return `Hace ${diffMins} ${diffMins === 1 ? "minuto" : "minutos"}`
      } else if (diffHours < 24) {
        return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`
      } else if (diffDays < 7) {
        return `Hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`
      } else {
        return date.toLocaleDateString()
      }
    } else {
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    }
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return "Fecha desconocida"
  }
}

// Marcar notificación como leída
function markNotificationAsRead(notificationId) {
  console.log(`Marcando notificación como leída: ${notificationId}`)

  try {
    Storage.markNotificationAsRead(notificationId)
    loadNotifications()
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error)
  }
}

// Cargar todas las notificaciones en el modal
function loadAllNotifications() {
  console.log("Cargando todas las notificaciones")

  try {
    if (!currentUser) {
      console.warn("No hay usuario actual para cargar notificaciones")
      return
    }

    const notifications = Storage.getNotificationsByUser(currentUser.id)
    console.log(`Total de notificaciones: ${notifications.length}`)

    const notificationsModalBody = document.getElementById("notifications-modal-body")
    if (notificationsModalBody) {
      if (notifications.length === 0) {
        notificationsModalBody.innerHTML = `
          <p class="text-center">No tienes notificaciones</p>
        `
      } else {
        notificationsModalBody.innerHTML = ""

        // Ordenar notificaciones por fecha (más recientes primero)
        const sortedNotifications = notifications.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))

        sortedNotifications.forEach((notification) => {
          const item = document.createElement("div")
          item.className = `notification-item ${notification.leido ? "" : "unread"}`
          item.dataset.id = notification.id

          item.innerHTML = `
            <div class="d-flex align-items-center mb-3 p-2 border-bottom">
              <div class="notification-icon me-3">
                <i class="fas ${getNotificationIcon(notification.tipo)} text-primary"></i>
              </div>
              <div class="notification-content flex-grow-1">
                <div class="notification-text">${notification.mensaje}</div>
                <div class="notification-time text-muted small">${formatDate(notification.fechaCreacion)}</div>
              </div>
              ${notification.leido ? "" : '<div class="notification-badge"></div>'}
            </div>
          `

          notificationsModalBody.appendChild(item)
        })
      }
    } else {
      console.warn("Elemento notifications-modal-body no encontrado")
    }

    console.log("Todas las notificaciones cargadas correctamente")
  } catch (error) {
    console.error("Error al cargar todas las notificaciones:", error)
  }
}

// Cambiar contraseña
function changePassword() {
  console.log("Cambiando contraseña")

  try {
    const currentPassword = document.getElementById("current-password").value
    const newPassword = document.getElementById("new-password").value
    const confirmPassword = document.getElementById("confirm-password").value

    // Validar campos
    if (!currentPassword || !newPassword || !confirmPassword) {
      console.warn("Campos de contraseña incompletos")
      alert("Por favor, completa todos los campos")
      return
    }

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      console.warn("Las contraseñas no coinciden")
      alert("Las contraseñas no coinciden")
      return
    }

    // Validar contraseña actual
    if (!currentUser) {
      console.error("No hay usuario actual para cambiar contraseña")
      alert("Error: No hay usuario logueado. Por favor, inicie sesión nuevamente.")
      window.location.href = "login.html"
      return
    }

    if (currentPassword !== currentUser.password) {
      console.warn("Contraseña actual incorrecta")
      alert("La contraseña actual es incorrecta")
      return
    }

    // Actualizar contraseña
    currentUser.password = newPassword
    Storage.saveUser(currentUser)
    Storage.setLoggedUser(currentUser)
    console.log("Contraseña actualizada correctamente")

    // Cerrar modal
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const passwordModal = bootstrap.Modal.getInstance(document.getElementById("change-password-modal"))
      if (passwordModal) {
        passwordModal.hide()
      }
    }

    // Mostrar mensaje de éxito
    alert("Contraseña cambiada correctamente")
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    alert("Error al cambiar la contraseña. Por favor, intente nuevamente.")
  }
}

// Mostrar historial del proyecto
function showProjectHistory(projectId) {
  console.log(`Mostrando historial del proyecto: ${projectId}`)

  try {
    const project = Storage.getProjectById(projectId)
    if (!project) {
      console.error(`Proyecto no encontrado: ${projectId}`)
      return
    }

    // Crear historial si no existe
    if (!project.historial) {
      console.log("Creando historial para el proyecto")
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

      if (project.fechaRechazo) {
        project.historial.push({
          estado: "Documentación Errada",
          fecha: project.fechaRechazo,
          usuario: project.ejecutivaNombre || "Ejecutiva",
          rol: "Ejecutiva",
          comentario: "Proyecto rechazado por documentación incorrecta",
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
    console.log(`Entradas en el historial: ${sortedHistory.length}`)

    // Crear modal para mostrar historial
    const modalHtml = `
      <div class="modal fade" id="historialModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">Historial del Proyecto: ${project.nombre}</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Fecha y Hora</th>
                      <th>Estado</th>
                      <th>Creador</th>
                      <th>Rol</th>
                      <th>Comentario</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sortedHistory
                      .map(
                        (item) => `
                      <tr>
                        <td>${formatDate(item.fecha, true)}</td>
                        <td><span class="badge ${getBadgeClass(item.estado)}">${item.estado}</span></td>
                        <td>${item.usuario}</td>
                        <td>${item.rol}</td>
                        <td>${item.comentario}</td>
                      </tr>
                    `,
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `

    // Eliminar modal anterior si existe
    const oldModal = document.getElementById("historialModal")
    if (oldModal) {
      oldModal.remove()
    }

    // Agregar modal al DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Mostrar modal
    if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
      const historialModal = new bootstrap.Modal(document.getElementById("historialModal"))
      historialModal.show()
    } else {
      console.warn("Bootstrap no está disponible o no tiene Modal")
      alert("No se puede mostrar el modal de historial. Por favor, recargue la página.")
    }
  } catch (error) {
    console.error("Error al mostrar historial del proyecto:", error)
    alert("Error al cargar el historial del proyecto. Por favor, intente nuevamente.")
  }
}

// Inicializar bootstrap global para evitar errores
const bootstrap = window.bootstrap

// Add this function to setup filter event listeners
function setupFilterEventListeners() {
  // Apply filters button
  document.getElementById("applyFilters").addEventListener("click", () => {
    filterProjects()
  })
}

// Add this function to filter projects
function filterProjects() {
  const table = document.getElementById("projects-table-body")
  if (!table) return

  const rows = table.querySelectorAll("tr")
  if (rows.length === 0) return

  // Get filter values
  const nombreFilter = document.getElementById("filterNombre").value.toLowerCase()
  const fechaFilter = document.getElementById("filterFecha").value
  const estadoFilter = document.getElementById("filterEstado").value

  // Loop through all rows
  rows.forEach((row) => {
    // Skip message rows (those with colspan)
    if (row.querySelector("td[colspan]")) return

    const cells = row.querySelectorAll("td")
    if (cells.length < 5) return

    // Get cell values
    const nombre = cells[1].textContent.toLowerCase()
    const fecha = cells[3].textContent
    const estadoElement = cells[4].querySelector(".badge")
    const estado = estadoElement ? estadoElement.textContent : ""

    // Check if row matches all filters
    const matchesNombre = !nombreFilter || nombre.includes(nombreFilter)
    const matchesFecha = !fechaFilter || fecha.includes(fechaFilter)
    const matchesEstado = !estadoFilter || estado.includes(estadoFilter)

    // Show/hide row based on filter matches
    if (matchesNombre && matchesFecha && matchesEstado) {
      row.style.display = ""
    } else {
      row.style.display = "none"
    }
  })
}

// Add this function to populate date filters
function populateDateFilters() {
  if (!currentUser) return

  const allProjects = Storage.getProjects().filter((project) => project.creadorId === currentUser.id)

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

