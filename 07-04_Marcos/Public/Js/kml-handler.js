// KML Handler - Utilidad para procesar archivos KML y KMZ
const KMLHandler = (() => {
  // Función para procesar un archivo KML o KMZ
  async function processFile(file) {
    if (file.name.toLowerCase().endsWith(".kmz")) {
      return await processKMZ(file)
    } else if (file.name.toLowerCase().endsWith(".kml")) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const kmlData = procesarKML(e.target.result)
            resolve(kmlData)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = (e) => reject(new Error("Error al leer el archivo KML"))
        reader.readAsText(file)
      })
    } else {
      throw new Error("Formato de archivo no soportado. Solo se aceptan archivos KML y KMZ.")
    }
  }

  // Función para procesar un archivo KMZ (ZIP que contiene un KML)
  async function processKMZ(file) {
    try {
      // Ensure JSZip is available
      if (typeof JSZip === "undefined") {
        throw new Error("JSZip library is required to process KMZ files. Please include it in your project.")
      }

      const zip = await JSZip.loadAsync(file)

      // Buscar el archivo KML dentro del ZIP
      let kmlFile = null
      let kmlContent = null

      // Primero buscar doc.kml (nombre estándar)
      if (zip.files["doc.kml"]) {
        kmlFile = zip.files["doc.kml"]
      } else {
        // Si no existe, buscar cualquier archivo .kml
        for (const filename in zip.files) {
          if (filename.toLowerCase().endsWith(".kml")) {
            kmlFile = zip.files[filename]
            break
          }
        }
      }

      if (!kmlFile) {
        throw new Error("No se encontró ningún archivo KML dentro del KMZ")
      }

      // Extraer el contenido del KML
      kmlContent = await kmlFile.async("text")

      // Procesar el KML
      return procesarKML(kmlContent)
    } catch (error) {
      console.error("Error al procesar archivo KMZ:", error)
      throw error
    }
  }

  // Función mejorada para procesar KML con mejor extracción de datos
  function procesarKML(kmlContent) {
    try {
      // Crear un parser de XML
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(kmlContent, "text/xml")

      // Verificar si hay errores en el XML
      const parserError = xmlDoc.querySelector("parsererror")
      if (parserError) {
        throw new Error("Error al parsear el XML: " + parserError.textContent)
      }

      // Extraer puntos (Placemarks)
      const puntos = []
      const placemarks = xmlDoc.querySelectorAll("Placemark")

      placemarks.forEach((placemark) => {
        const nombre = placemark.querySelector("name")?.textContent || ""
        const descripcion = placemark.querySelector("description")?.textContent || ""
        const styleUrl = placemark.querySelector("styleUrl")?.textContent || ""

        // Extraer información de estilo para identificar mejor los tipos de puntos
        const style = styleUrl ? styleUrl.replace("#", "") : ""

        // Extraer información de carpeta para mejor categorización
        let carpeta = ""
        let currentElement = placemark
        while (currentElement.parentElement) {
          if (currentElement.parentElement.tagName === "Folder") {
            const folderName = currentElement.parentElement.querySelector("name")?.textContent || ""
            if (folderName) {
              carpeta = folderName
              break
            }
          }
          currentElement = currentElement.parentElement
        }

        // Extraer datos extendidos si existen
        const extendedData = {}
        const dataElements = placemark.querySelectorAll("ExtendedData Data")
        dataElements.forEach((dataElement) => {
          const name = dataElement.getAttribute("name")
          const value = dataElement.querySelector("value")?.textContent || ""
          if (name) {
            extendedData[name] = value
          }
        })

        // Buscar coordenadas en Point
        const point = placemark.querySelector("Point")
        if (point) {
          const coordsText = point.querySelector("coordinates")?.textContent
          if (coordsText) {
            const coords = coordsText.trim().split(",")
            if (coords.length >= 2) {
              puntos.push({
                nombre: nombre,
                descripcion: descripcion,
                lng: Number.parseFloat(coords[0]),
                lat: Number.parseFloat(coords[1]),
                lon: Number.parseFloat(coords[0]), // Añadir también como 'lon' para compatibilidad
                alt: coords.length > 2 ? Number.parseFloat(coords[2]) : 0,
                carpeta: carpeta,
                style: style,
                extendedData: extendedData,
                tipo: determinarTipoPunto(nombre, descripcion, carpeta, style, extendedData),
              })
            }
          }
        }

        // Buscar coordenadas en LineString (para rutas)
        const lineString = placemark.querySelector("LineString")
        if (lineString) {
          const coordsText = lineString.querySelector("coordinates")?.textContent
          if (coordsText) {
            const coordsArray = coordsText.trim().split(/\s+/)
            const puntosRuta = coordsArray
              .map((coordStr) => {
                const coords = coordStr.split(",")
                if (coords.length >= 2) {
                  return {
                    lng: Number.parseFloat(coords[0]),
                    lat: Number.parseFloat(coords[1]),
                    lon: Number.parseFloat(coords[0]), // Añadir también como 'lon' para compatibilidad
                    alt: coords.length > 2 ? Number.parseFloat(coords[2]) : 0,
                  }
                }
                return null
              })
              .filter((p) => p !== null)

            if (puntosRuta.length > 0) {
              // Añadir la línea
              if (!this.lineas) this.lineas = []
              this.lineas.push({
                nombre: nombre,
                descripcion: descripcion,
                puntos: puntosRuta,
                carpeta: carpeta,
                style: style,
                extendedData: extendedData,
                tipo: "linea",
              })
            }
          }
        }

        // Buscar polígonos
        const polygon = placemark.querySelector("Polygon")
        if (polygon) {
          const outerBoundary = polygon.querySelector("outerBoundaryIs LinearRing coordinates")
          if (outerBoundary) {
            const coordsText = outerBoundary.textContent
            const coordsArray = coordsText.trim().split(/\s+/)
            const puntosPoligono = coordsArray
              .map((coordStr) => {
                const coords = coordStr.split(",")
                if (coords.length >= 2) {
                  return {
                    lng: Number.parseFloat(coords[0]),
                    lat: Number.parseFloat(coords[1]),
                    lon: Number.parseFloat(coords[0]),
                    alt: coords.length > 2 ? Number.parseFloat(coords[2]) : 0,
                  }
                }
                return null
              })
              .filter((p) => p !== null)

            if (puntosPoligono.length > 0) {
              // Añadir el polígono
              if (!this.poligonos) this.poligonos = []
              this.poligonos.push({
                nombre: nombre,
                descripcion: descripcion,
                puntos: puntosPoligono,
                carpeta: carpeta,
                style: style,
                extendedData: extendedData,
                tipo: "poligono",
              })
            }
          }
        }
      })

      // Extraer rutas (LineString) que no estén dentro de Placemarks
      const lineas = []
      const lineStrings = xmlDoc.querySelectorAll("LineString")

      lineStrings.forEach((lineString) => {
        const placemark = lineString.closest("Placemark")
        if (!placemark) return // Skip if already processed within a Placemark

        const nombre = placemark?.querySelector("name")?.textContent || ""
        const descripcion = placemark?.querySelector("description")?.textContent || ""
        const styleUrl = placemark?.querySelector("styleUrl")?.textContent || ""
        const style = styleUrl ? styleUrl.replace("#", "") : ""

        // Extract folder information
        let carpeta = ""
        let currentElement = placemark
        while (currentElement && currentElement.parentElement) {
          if (currentElement.parentElement.tagName === "Folder") {
            const folderName = currentElement.parentElement.querySelector("name")?.textContent || ""
            if (folderName) {
              carpeta = folderName
              break
            }
          }
          currentElement = currentElement.parentElement
        }

        const coordsText = lineString.querySelector("coordinates")?.textContent
        if (coordsText) {
          const coordsArray = coordsText.trim().split(/\s+/)
          const puntosRuta = coordsArray
            .map((coordStr) => {
              const coords = coordStr.split(",")
              if (coords.length >= 2) {
                return {
                  lng: Number.parseFloat(coords[0]),
                  lat: Number.parseFloat(coords[1]),
                  lon: Number.parseFloat(coords[0]),
                  alt: coords.length > 2 ? Number.parseFloat(coords[2]) : 0,
                }
              }
              return null
            })
            .filter((p) => p !== null)

          if (puntosRuta.length > 0) {
            lineas.push({
              nombre: nombre,
              descripcion: descripcion,
              puntos: puntosRuta,
              carpeta: carpeta,
              style: style,
              tipo: "linea",
            })
          }
        }
      })

      // Procesar estilos para mejor visualización
      const estilos = {}
      const styles = xmlDoc.querySelectorAll("Style")
      styles.forEach((style) => {
        const id = style.getAttribute("id")
        if (id) {
          const iconStyle = style.querySelector("IconStyle")
          const lineStyle = style.querySelector("LineStyle")
          const polyStyle = style.querySelector("PolyStyle")

          estilos[id] = {
            icon: iconStyle
              ? {
                  scale: iconStyle.querySelector("scale")?.textContent || "1.0",
                  href: iconStyle.querySelector("Icon href")?.textContent || "",
                }
              : null,
            line: lineStyle
              ? {
                  color: lineStyle.querySelector("color")?.textContent || "ffffffff",
                  width: lineStyle.querySelector("width")?.textContent || "1.0",
                }
              : null,
            poly: polyStyle
              ? {
                  color: polyStyle.querySelector("color")?.textContent || "ffffffff",
                  fill: polyStyle.querySelector("fill")?.textContent !== "0",
                  outline: polyStyle.querySelector("outline")?.textContent !== "0",
                }
              : null,
          }
        }
      })

      return {
        puntos: puntos,
        lineas: lineas,
        poligonos: this.poligonos || [],
        estilos: estilos,
      }
    } catch (error) {
      console.error("Error al procesar KML:", error)
      throw error
    }
  }

  // Función mejorada para determinar el tipo de punto
  function determinarTipoPunto(nombre, descripcion, carpeta, style, extendedData) {
    // Normalizar textos para búsqueda
    const nombreLower = (nombre || "").toLowerCase()
    const descripcionLower = (descripcion || "").toLowerCase()
    const carpetaLower = (carpeta || "").toLowerCase()

    // Verificar carpeta específica primero
    if (carpetaLower === "postes" || carpetaLower.includes("poste")) {
      return "poste"
    }

    // Patrones para identificar postes
    const patronesPoste = [
      /poste/i,
      /^p\d+$/i,
      /^poste\s*\d+$/i,
      /^\d+$/,
      /apoyo/i,
      /estructura/i,
      /torre/i,
      /columna/i,
      /soporte/i,
    ]

    // Verificar patrones en nombre y descripción
    for (const patron of patronesPoste) {
      if (patron.test(nombreLower) || patron.test(descripcionLower)) {
        return "poste"
      }
    }

    // Verificar datos extendidos
    if (extendedData) {
      const valores = Object.values(extendedData).map((v) => String(v).toLowerCase())
      for (const valor of valores) {
        for (const patron of patronesPoste) {
          if (patron.test(valor)) {
            return "poste"
          }
        }
      }
    }

    // Verificar si es un cliente
    if (
      nombreLower.includes("cliente") ||
      descripcionLower.includes("cliente") ||
      nombreLower.includes("client") ||
      descripcionLower.includes("client")
    ) {
      return "cliente"
    }

    // Verificar si es un nodo
    if (
      nombreLower.includes("nodo") ||
      descripcionLower.includes("node") ||
      nombreLower.includes("node") ||
      descripcionLower.includes("node")
    ) {
      return "nodo"
    }

    // Verificar si es un punto de referencia
    if (
      nombreLower.includes("referencia") ||
      descripcionLower.includes("referencia") ||
      nombreLower.includes("landmark") ||
      descripcionLower.includes("landmark")
    ) {
      return "referencia"
    }

    // Por defecto, considerar como punto genérico
    return "punto"
  }

  // Exponer las funciones públicas
  return {
    processFile: processFile,
    procesarKML: procesarKML,
    determinarTipoPunto: determinarTipoPunto,
  }
})()

// Si estamos en un entorno de Node.js, exportar el módulo
if (typeof module !== "undefined" && module.exports) {
  module.exports = KMLHandler
}

