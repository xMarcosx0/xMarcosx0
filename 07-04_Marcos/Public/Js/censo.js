document.addEventListener("DOMContentLoaded", () => {
  const cantidadPostes = document.getElementById("cantidadPostes")
  const postesContainer = document.getElementById("postesContainer")
  const censoForm = document.getElementById("censoForm")
  const modalConfirm = new bootstrap.Modal(document.getElementById("confirmModal"))
  const modalError = new bootstrap.Modal(document.getElementById("errorModal"))
  const errorMessage = document.getElementById("errorMessage")

  // Generar formularios dinámicos según la cantidad de PRST seleccionada
  cantidadPostes.addEventListener("change", () => {
    generarFormularios(Number.parseInt(cantidadPostes.value))
  })

  function generarFormularios(cantidad) {
    postesContainer.innerHTML = "" // Limpiar el contenedor antes de agregar nuevos formularios
    if (cantidad === 0) return // Si la cantidad es 0, no generar formularios

    for (let i = 1; i <= cantidad; i++) {
      const formPoste = document.createElement("div")
      formPoste.classList.add("postesContainer", "mb-4", "p-3", "border", "rounded")
      formPoste.innerHTML = `
                <h4>Cable Operador N°${i}</h4>
                <label>Altura:</label>
                <input type="number" class="form-control mb-2" placeholder="Altura" required>
                <label>Cables:</label>
                <input type="number" class="form-control mb-2" placeholder="Cables" required>
                <label>Caja de empalme:</label>
                <input type="number" class="form-control mb-2" placeholder="Caja de empalme" required>
                <label>Reserva:</label>
                <input type="number" class="form-control mb-2" placeholder="Reserva" required>
                <label>NAP:</label>
                <input type="number" class="form-control mb-2" placeholder="NAP" required>
                <label>SPT:</label>
                <input type="number" class="form-control mb-2" placeholder="SPT" required>
                <label>Bajante:</label>
                <input type="number" class="form-control mb-2" placeholder="Bajante" required>
            `
      postesContainer.appendChild(formPoste)
    }
  }

  // Validar archivos
  function validarArchivo(file) {
    const formatosPermitidos = ["image/png", "image/jpeg", "image/jpg"]
    return formatosPermitidos.includes(file.type)
  }

  // Manejar el envío del formulario
  censoForm.addEventListener("submit", (event) => {
    event.preventDefault() // Evita la recarga de la página

    // Validar campos obligatorios
    const selects = censoForm.querySelectorAll("select[required]")
    let isValid = true
    selects.forEach((select) => {
      if (select.value === "") {
        isValid = false
        select.classList.add("is-invalid")
      } else {
        select.classList.remove("is-invalid")
      }
    })

    if (!isValid) {
      errorMessage.textContent = "Por favor, completa todos los campos obligatorios."
      modalError.show()
      return
    }

    // Validar archivos subidos
    const fotoPlaca = document.getElementById("fotoPlaca").files[0]
    const fotoDetallada = document.getElementById("fotoDetallada").files[0]
    const fotoPanoramica = document.getElementById("fotoPanoramica").files[0]

    if (!validarArchivo(fotoPlaca)) {
      errorMessage.textContent =
        "El archivo de 'Foto de la Placa' no es válido. Solo se permiten imágenes en formato PNG, JPEG o JPG."
      modalError.show()
      return
    }

    if (!validarArchivo(fotoDetallada)) {
      errorMessage.textContent =
        "El archivo de 'Foto Detallada' no es válido. Solo se permiten imágenes en formato PNG, JPEG o JPG."
      modalError.show()
      return
    }

    if (!validarArchivo(fotoPanoramica)) {
      errorMessage.textContent =
        "El archivo de 'Foto Panorámica' no es válido. Solo se permiten imágenes en formato PNG, JPEG o JPG."
      modalError.show()
      return
    }

    // Mostrar el modal de confirmación
    const fechaSeleccionada = document.getElementById("fecha").value
    const fechaHoraExacta = new Date().toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    document.getElementById("fechaSeleccionada").textContent = fechaSeleccionada
    document.getElementById("fechaHoraExacta").textContent = fechaHoraExacta
    modalConfirm.show()

    // Después de cerrar el modal, limpiar el formulario y los campos dinámicos
    document.getElementById("confirmModal").addEventListener("hidden.bs.modal", () => {
      censoForm.reset() // Restablecer los campos principales
      postesContainer.innerHTML = "" // Limpiar los formularios dinámicos
    })
  })
})

// Inicializar el mapa
let map
let postes = JSON.parse(localStorage.getItem("postes")) || []

// Iconos personalizados
const iconoAzul = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Icono azul (PNG)
  iconSize: [32, 32], // Tamaño del icono
  iconAnchor: [16, 32], // Punto de anclaje
})

const iconoRojo = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Icono rojo (PNG)
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  className: "icono-rojo", // Clase CSS para cambiar el color a rojo
})

// Función para mostrar el mapa
function mostrarMapa() {
  if (!map) {
    map = L.map("map").setView([10.9639, -74.7964], 13) // Coordenadas de Barranquilla
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)
    document.getElementById("map").style.display = "block" // Mostrar el mapa
  }
  generarMapa()
}

// Función para guardar los datos del formulario
function guardarDatos() {
  const poste = {
    fecha: document.getElementById("fecha").value,
    brigada: document.getElementById("brigada").value,
    proyecto: document.getElementById("proyecto").value,
    numPoste: document.getElementById("numPoste").value,
    coordenada: document.getElementById("coordenada").value,
    elementoExistente: document.getElementById("elementoExistente").value,
    tipoPoste: document.getElementById("tipoPoste").value,
    material: document.getElementById("material").value,
    altura: document.getElementById("altura").value,
    observaciones: document.getElementById("observaciones").value,
  }
  postes.push(poste)
  localStorage.setItem("postes", JSON.stringify(postes))
  alert("Datos guardados correctamente.")
}

// Función para generar el mapa con los postes guardados
function generarMapa() {
  if (!map) return

  // Limpiar marcadores anteriores
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer)
    }
  })

  // Contar repeticiones de postes
  const contadorPostes = {}
  postes.forEach((poste) => {
    const id = poste.numPoste
    contadorPostes[id] = (contadorPostes[id] || 0) + 1
  })

  // Añadir marcadores
  postes.forEach((poste) => {
    const coordenadas = poste.coordenada.split(",")
    const lat = Number.parseFloat(coordenadas[0])
    const lon = Number.parseFloat(coordenadas[1])

    if (!isNaN(lat) && !isNaN(lon)) {
      const icono = contadorPostes[poste.numPoste] > 1 ? iconoRojo : iconoAzul
      L.marker([lat, lon], { icon: icono }).addTo(map).bindPopup(`Poste: ${poste.numPoste}`).openPopup()
    }
  })
}

// Función para exportar los postes como KML
function exportarKML() {
  let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>`

  postes.forEach((poste) => {
    const coordenadas = poste.coordenada.split(",")
    const lat = Number.parseFloat(coordenadas[0])
    const lon = Number.parseFloat(coordenadas[1])

    if (!isNaN(lat) && !isNaN(lon)) {
      kmlContent += `
    <Placemark>
      <name>Poste ${poste.numPoste}</name>
      <description>
        <![CDATA[
          <p><strong>Brigada:</strong> ${poste.brigada}</p>
          <p><strong>Proyecto:</strong> ${poste.proyecto}</p>
          <p><strong>Coordenada:</strong> ${poste.coordenada}</p>
        ]]>
      </description>
      <Point>
        <coordinates>${lon},${lat},0</coordinates>
      </Point>
    </Placemark>`
    }
  })

  kmlContent += `
  </Document>
</kml>`

  // Crear un archivo KML
  const kmlBlob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" })
  const url = URL.createObjectURL(kmlBlob)

  // Crear un enlace de descarga
  const a = document.createElement("a")
  a.href = url
  a.download = "postes.kml"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  // Borrar el localStorage después de exportar
  localStorage.removeItem("postes")
  postes = []
  alert("KML exportado y datos borrados. Puedes empezar un nuevo proyecto.")
}

// Evento para guardar datos al enviar el formulario
document.getElementById("censoForm").addEventListener("submit", (event) => {
  event.preventDefault()
  guardarDatos()
})

let proyectoActual
let mapaCenso
let loggedUser
let imagenesSeleccionadas = []
let actualizarVistaPrevia

// Modificar la función iniciarCenso para incluir fecha automática
function iniciarCenso(proyectoId) {
  const proyecto = Storage.getProjectById(proyectoId)

  if (!proyecto) {
    mostrarMensaje("Error", "Proyecto no encontrado.")
    return
  }

  proyectoActual = proyecto

  // Mostrar sección de censo
  document.getElementById("seccionDashboard").style.display = "none"
  document.getElementById("seccionCenso").style.display = "block"

  // Actualizar título
  document.getElementById("tituloCenso").textContent = `Censo: ${proyecto.nombre}`

  // Limpiar formulario
  document.getElementById("formCenso").reset()

  // Establecer fecha actual automáticamente (oculta)
  const fechaActual = new Date().toISOString().split("T")[0]
  document.getElementById("fecha").value = fechaActual

  // Ocultar el campo de fecha en el formulario
  document.getElementById("fechaContainer").style.display = "none"

  // Mostrar mapa
  mostrarMapaCenso(proyecto)

  // Actualizar mapa después de que se muestre la sección
  setTimeout(() => {
    if (mapaCenso) {
      mapaCenso.invalidateSize()
    }
  }, 300)
}

// Modificar la función guardarCenso para que la descripción no sea obligatoria
function guardarCenso() {
  const form = document.getElementById("formCenso")

  // Quitar required del campo de descripción
  document.getElementById("descripcion").removeAttribute("required")

  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  const censo = {
    id: null,
    proyectoId: proyectoActual.id,
    usuarioId: loggedUser.id,
    numPoste: document.getElementById("numPoste").value,
    fecha: document.getElementById("fecha").value,
    altura: document.getElementById("altura").value,
    material: document.getElementById("material").value,
    estado: document.getElementById("estadoPoste").value,
    descripcion: document.getElementById("descripcion").value || "",
    imagenes: imagenesSeleccionadas,
  }

  // Guardar censo
  Storage.saveCensus(censo)

  // Mostrar mensaje
  mostrarMensaje("Éxito", "Censo guardado correctamente.")

  // Limpiar formulario
  document.getElementById("formCenso").reset()
  imagenesSeleccionadas = []
  actualizarVistaPrevia()

  // Actualizar mapa para reflejar el nuevo estado del poste
  mostrarMapaCenso(proyectoActual)

  // Mostrar fecha en el resumen
  document.getElementById("fechaResumen").textContent = new Date(censo.fecha).toLocaleDateString()

  // Mostrar modal de resumen
  const modalResumen = new bootstrap.Modal(document.getElementById("modalResumen"))
  modalResumen.show()

  // Llenar datos del resumen
  document.getElementById("numPosteResumen").textContent = censo.numPoste
  document.getElementById("alturaResumen").textContent = censo.altura + " metros"
  document.getElementById("materialResumen").textContent = censo.material
  document.getElementById("estadoPosteResumen").textContent = censo.estado
  document.getElementById("descripcionResumen").textContent = censo.descripcion || "No especificada"

  // Mostrar imágenes en el resumen
  const imagenesResumen = document.getElementById("imagenesResumen")
  imagenesResumen.innerHTML = ""

  if (censo.imagenes && censo.imagenes.length > 0) {
    censo.imagenes.forEach((imagen) => {
      const img = document.createElement("img")
      img.src = imagen
      img.className = "img-thumbnail me-2 mb-2"
      img.style.maxHeight = "100px"
      imagenesResumen.appendChild(img)
    })
  } else {
    imagenesResumen.innerHTML = "<p>No se adjuntaron imágenes</p>"
  }
}

