// Analista.js - Funcionalidades para el rol de Analista
import { auth, db, storage } from "./Firebase.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js"
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js"

// Variables globales
let currentUser = null
let projectsData = []

// Inicialización cuando el DOM está completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // Verificar autenticación
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user
      checkUserRole()
      setupUI()
      loadAssignedProjects()
    } else {
      // Redirigir al login si no hay usuario autenticado
      window.location.href = "login.html"
    }
  })

  // Configurar listeners para botones y eventos
  document.getElementById("logoutBtn").addEventListener("click", logout)
})

// Verificar que el usuario tenga el rol de Analista
async function checkUserRole() {
  try {
    const userRef = doc(db, "usuarios", currentUser.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      if (userData.rol !== "Analista") {
        // Redirigir según el rol
        redirectByRole(userData.rol)
      }
    } else {
      console.error("No se encontró información del usuario")
      logout()
    }
  } catch (error) {
    console.error("Error al verificar el rol:", error)
    alert("Error al verificar permisos. Por favor, intente nuevamente.")
  }
}

// Redirigir según el rol del usuario
function redirectByRole(role) {
  switch (role) {
    case "PRST":
      window.location.href = "prst.html"
      break
    case "Ejecutiva":
      window.location.href = "ejecutiva.html"
      break
    case "Coordinador":
      window.location.href = "coordinador.html"
      break
    case "Brigada":
      window.location.href = "brigada-censo.html"
      break
    default:
      window.location.href = "login.html"
  }
}

// Configurar la interfaz de usuario
function setupUI() {
  // Mostrar nombre del usuario
  const userNameElement = document.getElementById("userName")
  if (userNameElement && currentUser.displayName) {
    userNameElement.textContent = currentUser.displayName
  }

  // Configurar filtros y buscador
  setupFilters()
  setupSearchBar()
}

// Configurar filtros de proyectos
function setupFilters() {
  const filterSelect = document.getElementById("projectFilter")
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      filterProjects(filterSelect.value)
    })
  }
}

// Configurar barra de búsqueda
function setupSearchBar() {
  const searchInput = document.getElementById("searchProject")
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase()
      searchProjects(searchTerm)
    })
  }
}

// Cargar proyectos asignados al analista
async function loadAssignedProjects() {
  try {
    const projectsContainer = document.getElementById("projectsList")
    projectsContainer.innerHTML = '<p class="loading">Cargando proyectos...</p>'

    // Consultar proyectos asignados al analista actual
    const projectsQuery = query(
      collection(db, "proyectos"),
      where("analistaId", "==", currentUser.uid),
      where("estado", "==", "Asignado"),
    )

    const querySnapshot = await getDocs(projectsQuery)
    projectsData = []

    if (querySnapshot.empty) {
      projectsContainer.innerHTML = '<p class="no-projects">No tienes proyectos asignados actualmente.</p>'
      return
    }

    // Procesar los proyectos
    querySnapshot.forEach((doc) => {
      const project = {
        id: doc.id,
        ...doc.data(),
      }
      projectsData.push(project)
    })

    // Mostrar los proyectos
    displayProjects(projectsData)
  } catch (error) {
    console.error("Error al cargar proyectos:", error)
    document.getElementById("projectsList").innerHTML =
      '<p class="error">Error al cargar proyectos. Por favor, intente nuevamente.</p>'
  }
}

// Mostrar proyectos en la interfaz
function displayProjects(projects) {
  const projectsContainer = document.getElementById("projectsList")
  projectsContainer.innerHTML = ""

  projects.forEach((project) => {
    const projectCard = document.createElement("div")
    projectCard.className = "project-card"
    projectCard.innerHTML = `
            <h3>${project.nombre}</h3>
            <p><strong>Cliente:</strong> ${project.cliente}</p>
            <p><strong>Fecha de creación:</strong> ${new Date(project.fechaCreacion.seconds * 1000).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> ${project.estado}</p>
            <div class="project-actions">
                <button class="btn-view" data-id="${project.id}">Ver detalles</button>
                <button class="btn-verify" data-id="${project.id}">Verificar</button>
            </div>
        `

    projectsContainer.appendChild(projectCard)
  })

  // Agregar event listeners a los botones
  document.querySelectorAll(".btn-view").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const projectId = e.target.getAttribute("data-id")
      openProjectDetails(projectId)
    })
  })

  document.querySelectorAll(".btn-verify").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const projectId = e.target.getAttribute("data-id")
      openVerificationForm(projectId)
    })
  })
}

// Filtrar proyectos por estado
function filterProjects(filterValue) {
  if (filterValue === "all") {
    displayProjects(projectsData)
    return
  }

  const filteredProjects = projectsData.filter((project) => project.estado === filterValue)
  displayProjects(filteredProjects)
}

// Buscar proyectos por término
function searchProjects(searchTerm) {
  if (!searchTerm) {
    displayProjects(projectsData)
    return
  }

  const filteredProjects = projectsData.filter(
    (project) =>
      project.nombre.toLowerCase().includes(searchTerm) || project.cliente.toLowerCase().includes(searchTerm),
  )

  displayProjects(filteredProjects)
}

// Abrir detalles del proyecto
function openProjectDetails(projectId) {
  const project = projectsData.find((p) => p.id === projectId)
  if (!project) return

  const modal = document.getElementById("projectDetailsModal")
  const modalContent = document.getElementById("projectDetailsContent")

  modalContent.innerHTML = `
        <h2>${project.nombre}</h2>
        <p><strong>Cliente:</strong> ${project.cliente}</p>
        <p><strong>Descripción:</strong> ${project.descripcion || "No disponible"}</p>
        <p><strong>Fecha de creación:</strong> ${new Date(project.fechaCreacion.seconds * 1000).toLocaleDateString()}</p>
        <p><strong>Estado:</strong> ${project.estado}</p>
        <p><strong>Ubicación:</strong> ${project.ubicacion || "No especificada"}</p>
        
        <h3>Documentos</h3>
        <div id="projectDocuments">
            ${project.documentos ? renderDocumentsList(project.documentos) : "No hay documentos disponibles"}
        </div>
        
        <div class="modal-actions">
            <button id="closeDetailsBtn" class="btn-secondary">Cerrar</button>
        </div>
    `

  modal.style.display = "block"

  // Configurar cierre del modal
  document.getElementById("closeDetailsBtn").addEventListener("click", () => {
    modal.style.display = "none"
  })

  // Cerrar modal al hacer clic fuera del contenido
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none"
    }
  })
}

// Renderizar lista de documentos
function renderDocumentsList(documentos) {
  let html = '<ul class="documents-list">'

  Object.entries(documentos).forEach(([key, url]) => {
    html += `
            <li>
                <span>${key}</span>
                <a href="${url}" target="_blank" class="btn-view-doc">Ver documento</a>
            </li>
        `
  })

  html += "</ul>"
  return html
}

// Abrir formulario de verificación
function openVerificationForm(projectId) {
  const project = projectsData.find((p) => p.id === projectId)
  if (!project) return

  const modal = document.getElementById("verificationModal")
  const modalContent = document.getElementById("verificationContent")

  modalContent.innerHTML = `
        <h2>Verificación de Proyecto: ${project.nombre}</h2>
        
        <div class="form-group">
            <label for="verificationStatus">Estado de verificación:</label>
            <select id="verificationStatus" required>
                <option value="">Seleccione un estado</option>
                <option value="Verificado">Verificado - Cumple requisitos</option>
                <option value="Mejorar">Opción Mejorar - Requiere ajustes</option>
                <option value="Rechazado">Rechazado - No viable</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="verificationComments">Comentarios:</label>
            <textarea id="verificationComments" rows="4" placeholder="Ingrese sus observaciones sobre el proyecto"></textarea>
        </div>
        
        <div class="form-group">
            <label for="verificationFile">Informe de verificación (opcional):</label>
            <input type="file" id="verificationFile" accept=".pdf,.doc,.docx">
        </div>
        
        <div class="modal-actions">
            <button id="submitVerificationBtn" class="btn-primary" data-id="${projectId}">Enviar verificación</button>
            <button id="closeVerificationBtn" class="btn-secondary">Cancelar</button>
        </div>
    `

  modal.style.display = "block"

  // Configurar cierre del modal
  document.getElementById("closeVerificationBtn").addEventListener("click", () => {
    modal.style.display = "none"
  })

  // Configurar envío del formulario
  document.getElementById("submitVerificationBtn").addEventListener("click", async (e) => {
    const projectId = e.target.getAttribute("data-id")
    await submitVerification(projectId)
  })

  // Cerrar modal al hacer clic fuera del contenido
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none"
    }
  })
}

// Enviar verificación del proyecto
async function submitVerification(projectId) {
  const statusSelect = document.getElementById("verificationStatus")
  const comments = document.getElementById("verificationComments").value
  const fileInput = document.getElementById("verificationFile")

  // Validar campos
  if (!statusSelect.value) {
    alert("Por favor, seleccione un estado de verificación.")
    return
  }

  try {
    // Mostrar indicador de carga
    document.getElementById("submitVerificationBtn").disabled = true
    document.getElementById("submitVerificationBtn").textContent = "Enviando..."

    // Preparar datos de verificación
    const verificationData = {
      estado: "En Revisión de Verificación",
      verificacion: {
        estado: statusSelect.value,
        comentarios: comments,
        fecha: new Date(),
        analistaId: currentUser.uid,
        analistaNombre: currentUser.displayName || currentUser.email,
      },
    }

    // Subir archivo si existe
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0]
      const storageRef = ref(storage, `proyectos/${projectId}/verificacion_${Date.now()}_${file.name}`)

      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      verificationData.verificacion.informeURL = downloadURL
      verificationData.verificacion.informeNombre = file.name
    }

    // Actualizar proyecto en Firestore
    const projectRef = doc(db, "proyectos", projectId)
    await updateDoc(projectRef, verificationData)

    // Cerrar modal y actualizar lista
    document.getElementById("verificationModal").style.display = "none"
    alert("Verificación enviada correctamente.")

    // Recargar proyectos
    loadAssignedProjects()
  } catch (error) {
    console.error("Error al enviar verificación:", error)
    alert("Error al enviar la verificación. Por favor, intente nuevamente.")
  } finally {
    // Restaurar botón
    document.getElementById("submitVerificationBtn").disabled = false
    document.getElementById("submitVerificationBtn").textContent = "Enviar verificación"
  }
}

// Cerrar sesión
function logout() {
  auth
    .signOut()
    .then(() => {
      window.location.href = "login.html"
    })
    .catch((error) => {
      console.error("Error al cerrar sesión:", error)
    })
}

// Exportar funciones para uso en HTML
window.logout = logout

