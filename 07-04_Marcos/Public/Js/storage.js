// storage.js - Manejo de almacenamiento local para la aplicación

const Storage = {
  // Claves para localStorage
  KEYS: {
    USERS: "air_e_users",
    LOGGED_USER: "air_e_logged_user",
    PROJECTS: "air_e_projects",
    NOTIFICATIONS: "air_e_notifications",
    CENSUS: "air_e_census",
    COUNTER: "air_e_counter",
    PRST_LIST: "air_e_prst_list",
  },

  // Lista de PRST con nombres completos y cortos
  PRST_LIST: [
    { nombreCompleto: "AIRTEK CARRIER SERVICES S.A.S.", nombreCorto: "AIRTEK CARRIER SERVICES" },
    { nombreCompleto: "ALIADOS EN COMUNICACION NET", nombreCorto: "TOTAL CONEXION" },
    { nombreCompleto: "HB TV NET S.A.S.", nombreCorto: "TVNET" },
    { nombreCompleto: "HOGARNET COMUNICACIONES S.A.S.", nombreCorto: "HOGARNET" },
    { nombreCompleto: "INTELEXA DE COLOMBIA S.A.S", nombreCorto: "INTELEXA DE COLOMBIA" },
    { nombreCompleto: "INTER REDES DEL MAGDALENA S.A.S", nombreCorto: "INTER REDES DEL MAGDALENA" },
    { nombreCompleto: "INTERNEXT COLOMBIA S.A.S", nombreCorto: "INTERNEXT" },
    { nombreCompleto: "INTERTEL SATELITAL S.A.S", nombreCorto: "INTERTEL SATELITAL" },
    { nombreCompleto: "MACITEL S.A.S", nombreCorto: "MACITEL" },
    { nombreCompleto: "MEDIA COMMERCE PARTNERS S.A.S.", nombreCorto: "MEDIA COMMERCE" },
    { nombreCompleto: "MEGATEL DE COLOMBIA S.A.S", nombreCorto: "MEGATEL" },
    { nombreCompleto: "NOVACLICK S.A.S", nombreCorto: "NOVACLICK" },
    { nombreCompleto: "PROMOTORA DE TELEVISION, INTERNET Y COMUNICACIONES S.A.S.", nombreCorto: "PROMO VISIÓN" },
    { nombreCompleto: "R&R TELECOMUNICACIONES S.A.S", nombreCorto: "R&R TELECOMUNICACIONES" },
    { nombreCompleto: "RAPILINK S.A.S", nombreCorto: "RAPILINK" },
    {
      nombreCompleto: "REDES TELECOMUNICACIONES DIGITALES DE COLOMBIA S.A.S.",
      nombreCorto: "REDES TELECOMUNICACIONES DIGITALES DE COLOMBIA",
    },
    { nombreCompleto: "SAVASA SOLUCIONES INTEGRALES S.A.S", nombreCorto: "SAVASA SOLUCIONES INTEGRALES" },
    { nombreCompleto: "WAYIRANET S.A.S", nombreCorto: "WAYIRANET" },
    { nombreCompleto: "WIPLUS COMUNICACIONES DE COLOMBIA S.A.S", nombreCorto: "WIPLUS COMUNICACIONES DE COLOMBIA" },
    { nombreCompleto: "TUNORTETV TELECOMUNICACIONES S.A.S.", nombreCorto: "TUNORTETV TELECOMUNICACIONES" },
    { nombreCompleto: "INTERCONEXIONES TECNOLOGICAS DEL CARIBE SAS (INTERCON)", nombreCorto: "INTERCON" },
    { nombreCompleto: "UNE EPM TELECOMUNICACIONES S.A.", nombreCorto: "TIGO" },
    { nombreCompleto: "QUEST TELECOM COLOMBIA S.A.S", nombreCorto: "QUEST TELECOM" },
    { nombreCompleto: "BITEL DE COLOMBIA SAS", nombreCorto: "DIGITAL COAST" },
    { nombreCompleto: "DIGITAL COAST S.A.S", nombreCorto: "MEGA TV" },
    { nombreCompleto: "JR REDES DEL CARIBE S.A.S.", nombreCorto: "JR REDES" },
    { nombreCompleto: "FENIX SOLUTION WIRELESS S.A.S.", nombreCorto: "FENIX" },
    { nombreCompleto: "APC LINK S.A.S.", nombreCorto: "APC LINK" },
    { nombreCompleto: "AULAS DIGITALES DE COLOMBIA S.A.S.", nombreCorto: "AUDICOL" },
    { nombreCompleto: "CABLE EXPRESS DE COLOMBIA LTDA", nombreCorto: "CABLE EXPRESS" },
    { nombreCompleto: "CABLE HOGAR.NET S.A.S.", nombreCorto: "CABLE HOGAR.NET" },
    { nombreCompleto: "INVERSIONES ACOSTA VERGARA", nombreCorto: "INVERSIONES ACOSTA VERGARA" },
    { nombreCompleto: "JALU SOLUCIONES S.A.S", nombreCorto: "JALU SOLUCIONES" },
    { nombreCompleto: "SOLUCIONES DANTEL S.A.S", nombreCorto: "SOLUCIONES DANTEL" },
    { nombreCompleto: "SOLUCIONES DE INGENIERIA E-VOLT TECK S.A.S", nombreCorto: "E-VOLT TECK" },
    { nombreCompleto: "SOLUCIONES ESTRATEGICAS DE TELECOMUNICACIONES S.A.S", nombreCorto: "SEGITEL" },
    { nombreCompleto: "SPACE COMUNICACIONES S.A.S.", nombreCorto: "SPACE COMUNICACIONES" },
    { nombreCompleto: "TV COMUNICACIONES JL S.A.S", nombreCorto: "TV COMUNICACIONES JL" },
    { nombreCompleto: "TV LINE S.A.S", nombreCorto: "TV LINE" },
    { nombreCompleto: "TV ZONA BANANERA S.A.S", nombreCorto: "TV ZONA BANANERA" },
    { nombreCompleto: "VENTELCO S.A.S", nombreCorto: "VENTELCO" },
    { nombreCompleto: "AZTECA COMUNICACIONES COLOMBIA S.A.S", nombreCorto: "AZTECA" },
    { nombreCompleto: "CABLE GUAJIRA LTDA", nombreCorto: "CABLE GUAJIRA" },
    { nombreCompleto: "COOPERATIVA MULTIACTIVA DE SERVICIOS INTEGRALES COOSUMA", nombreCorto: "COOSUMA" },
    { nombreCompleto: "LIWA S.A.S.", nombreCorto: "LIWA" },
    { nombreCompleto: "PARTNERS TELECOM COLOMBIA S.A.S.", nombreCorto: "WOM" },
    { nombreCompleto: "SP SISTEMAS PALACIOS LTDA.", nombreCorto: "SP SISTEMAS PALACIOS" },
    { nombreCompleto: "WORLD CONNECTIONS S.A.S", nombreCorto: "WORLD CONNECTIONS" },
    { nombreCompleto: "SUPERCABLE TELECOMUNICACIONES S.A.S.", nombreCorto: "SUPERCABLE TELECOMUNICACIONES" },
    { nombreCompleto: "LIBERTY NETWORKS DE COLOMBIA S.A.S.", nombreCorto: "C&W NETWORK" },
    { nombreCompleto: "INVERSIONES RODRIGUEZ MEJIA S.A.S.", nombreCorto: "INVERSIONES RODRIGUEZ MEJIA" },
    { nombreCompleto: "CARIBE INTERCOMUNICACIONES S.A.S.", nombreCorto: "CARIBE INTERCOMUNICACIONES" },
    { nombreCompleto: "CARIBETECH S.A.S", nombreCorto: "CARIBETECH" },
    { nombreCompleto: "DATA LAN S.A.S.", nombreCorto: "DATA LAN" },
    { nombreCompleto: "DIALNET DE COLOMBIA S.A. E.S.P.", nombreCorto: "DIALNET" },
    { nombreCompleto: "EME INGENIERIA S.A.", nombreCorto: "EME INGENIERIA" },
    { nombreCompleto: "EMPRESA DE TELECOMUNICACIONES DE LA COSTA COSTATEL S.A E.S.P", nombreCorto: "COSTATEL" },
    { nombreCompleto: "INTERCAR.NET S.A.S", nombreCorto: "INTERCAR.NET" },
    { nombreCompleto: "INTERCARIBE TV S.A.S.", nombreCorto: "CABLE EXITO" },
    { nombreCompleto: "INTERMAIC.NET 1 SAS", nombreCorto: "INTERMAIC.NET" },
    {
      nombreCompleto: "INTERNET Y TELECOMUNICACIONES DE COLOMBIA S.A.S",
      nombreCorto: "INTERNET Y TELECOMUNICACIONES DE COLOMBIA",
    },
    { nombreCompleto: "STARCOM CARIBE S.A.S", nombreCorto: "STARCOM CARIBE" },
    { nombreCompleto: "TELECOMUNICACIONES ZONA BANANERA S.A.S", nombreCorto: "TELECOMUNICACIONES ZONA BANANERA" },
    { nombreCompleto: "ETB - EMPRESA DE TELECOMUNICACIONES DE BOGOTA SA ESP", nombreCorto: "ETB" },
    { nombreCompleto: "CIRION TECHNOLOGIES COLOMBIA S.A.S", nombreCorto: "CIRION TECHNOLOGIES COLOMBIA" },
    { nombreCompleto: "COMUNICACION CELULAR COMCEL S.A", nombreCorto: "CLARO" },
    { nombreCompleto: "COMUNET TELECOMUNICACIONES S.A.S.", nombreCorto: "COMUNET TELECOMUNICACIONES" },
    {
      nombreCompleto: "COMUNICACIONES TERRESTRES DE COLOMBIA S.A.S.",
      nombreCorto: "COMUNICACIONES TERRESTRES DE COLOMBIA",
    },
    { nombreCompleto: "DIGITVNET S.A.S", nombreCorto: "DIGITVNET" },
    { nombreCompleto: "DRACO NET S.A.S", nombreCorto: "DRACO NET" },
    { nombreCompleto: "ECONEXION S.A.S", nombreCorto: "ECONEXION" },
    { nombreCompleto: "ELECNORTE S.A", nombreCorto: "ELECNORTE" },
    { nombreCompleto: "JHOSDY TELECOMUNICACIONES S.A.S", nombreCorto: "JHOSDY TELECOMUNICACIONES" },
    { nombreCompleto: "LOGISTICA EN TELECOMUNICACIONES S.A.S", nombreCorto: "LOGISTICA EN TELECOMUNICACIONES" },
    { nombreCompleto: "SOLUNET DIGITAL S.A.S.", nombreCorto: "SOLUNET DIGITAL" },
    { nombreCompleto: "ITELKOM S.A.S.", nombreCorto: "ITELKOM" },
    { nombreCompleto: "ATP FIBER COLOMBIA S.A.S", nombreCorto: "ATP FIBER" },
    { nombreCompleto: "CONETTA S.A.S", nombreCorto: "CONETTA" },
    { nombreCompleto: "GLOBAL TIC SAS", nombreCorto: "GLOBAL TIC" },
    {
      nombreCompleto: "TECOLRADIO TECNOLOGIA COLOMBIANA DE RADIO COMUNICACIONES S.A.S.",
      nombreCorto: "TECOLRADIO",
    },
    { nombreCompleto: "INTSOFTV S.A.S", nombreCorto: "INTSOFTV" },
    { nombreCompleto: "AJFIBER.NET SAS", nombreCorto: "AJFIBER.NET" },
    { nombreCompleto: "GIGAREDTELECOMUNICACIONES S.A.S", nombreCorto: "GIGARED" },
    { nombreCompleto: "CYV NETWORKS S.A.S", nombreCorto: "CYV NETWORKS" },
    { nombreCompleto: "AWATA WIRELESS S.A.S.", nombreCorto: "AWATA" },
    { nombreCompleto: "TPE COMUNICACIONES COLOMBIA S.A.S.", nombreCorto: "TPE COMUNICACIONES" },
    {
      nombreCompleto: "CONSTRUCCIÓN, GESTIÓN, VELOCIDAD Y ESTRATEGIAS DE TELECOMUNICACIONES SAS",
      nombreCorto: "CGVE",
    },
    { nombreCompleto: "ALCALDIA MUNICIPAL DE MAICAO", nombreCorto: "ALCALDIA MUNICIPAL DE MAICAO" },
    { nombreCompleto: "ALCALDIA DE SANTA MARTA", nombreCorto: "ALCALDIA DE SANTA MARTA" },
    { nombreCompleto: "FIBRAZO S.A.S.", nombreCorto: "FIBRAZO" },
    { nombreCompleto: "UFINET COLOMBIA S.A.", nombreCorto: "UFINET" },
    { nombreCompleto: "INTERNEXA S.A", nombreCorto: "INTERNEXA" },
    { nombreCompleto: "MOVISTAR", nombreCorto: "MOVISTAR" },
  ],

  // Inicializar el almacenamiento
  init: function () {
    // Limpiar localStorage para asegurar que se creen los usuarios correctamente
    // (Solo para desarrollo, quitar en producción)
    // localStorage.clear()

    // Guardar la lista de PRST
    localStorage.setItem(this.KEYS.PRST_LIST, JSON.stringify(this.PRST_LIST))

    // Verificar si ya existen datos
    if (!localStorage.getItem(this.KEYS.USERS)) {
      // Crear usuarios por defecto
      const defaultUsers = [
        {
          id: "1",
          nombre: "Jorge",
          apellido: "Ditta",
          usuario: "jditta",
          correo: "jditta@aire.com",
          password: "admin123",
          rol: "admin",
          activo: true,
        },
        {
          id: "2",
          nombre: "Juan",
          apellido: "Pérez",
          usuario: "jperez",
          correo: "jperez@aire.com",
          password: "prst123",
          rol: "prst",
          nombrePRST: "Claro",
          cedula: "1234567890",
          matriculaProfesional: "MP-12345",
          direccion: "Calle 123 #45-67",
          barrio: "Centro",
          ciudad: "Barranquilla",
          celular: "3001234567",
          activo: true,
        },
        {
          id: "3",
          nombre: "Ester",
          apellido: "Pacheco",
          usuario: "epacheco",
          correo: "epacheco@aire.com",
          password: "prst123",
          rol: "prst",
          nombrePRST: "cable expres",
          cedula: "0987654321",
          matriculaProfesional: "MP-12345",
          direccion: "Carrera 321 #67-45",
          barrio: "Centro",
          ciudad: "Barranquilla",
          celular: "3002234567",
          activo: true,
        },
        {
          id: "4",
          nombre: "Maria Isabel",
          apellido: "Jimenez Beleño",
          usuario: "mjimenez",
          correo: "mjimenez@aire.com",
          password: "ejecutiva123",
          rol: "ejecutiva",
          responsablePRST: [
            "AIRTEK CARRIER SERVICES",
            "TOTAL CONEXION",
            "TVNET",
            "HOGARNET",
            "INTELEXA DE COLOMBIA",
            "INTER REDES DEL MAGDALENA",
            "INTERNEXT",
            "INTERTEL SATELITAL",
            "MACITEL",
            "MEDIA COMMERCE",
            "MEGATEL",
            "NOVACLICK",
            "PROMO VISIÓN",
            "R&R TELECOMUNICACIONES",
            "RAPILINK",
            "REDES TELECOMUNICACIONES DIGITALES DE COLOMBIA",
            "SAVASA SOLUCIONES INTEGRALES",
            "WAYIRANET",
            "WIPLUS COMUNICACIONES DE COLOMBIA",
            "TUNORTETV TELECOMUNICACIONES",
            "INTERCON",
            "TIGO",
            "QUEST TELECOM",
            "DIGITAL COAST",
            "MEGA TV",
            "JR REDES",
            "FENIX",
          ],
          activo: true,
        },
        {
          id: "5",
          nombre: "Maria Jose",
          apellido: "Blanco Ochoa",
          usuario: "mblanco",
          correo: "mblanco@aire.com",
          password: "ejecutiva123",
          rol: "ejecutiva",
          responsablePRST: [
            "APC LINK",
            "AUDICOL",
            "CABLE EXPRESS",
            "CABLE HOGAR.NET",
            "INVERSIONES ACOSTA VERGARA",
            "JALU SOLUCIONES",
            "SOLUCIONES DANTEL",
            "E-VOLT TECK",
            "SEGITEL",
            "SPACE COMUNICACIONES",
            "TV COMUNICACIONES JL",
            "TV LINE",
            "TV ZONA BANANERA",
            "VENTELCO",
            "AZTECA",
            "CABLE GUAJIRA",
            "COOSUMA",
            "LIWA",
            "WOM",
            "SP SISTEMAS PALACIOS",
            "WORLD CONNECTIONS",
            "SUPERCABLE TELECOMUNICACIONES",
            "C&W NETWORK",
            "INVERSIONES RODRIGUEZ MEJIA",
          ],
          activo: true,
        },
        {
          id: "6",
          nombre: "Claudia Patricia",
          apellido: "Villegas Duque",
          usuario: "cvillegas",
          correo: "cvillegas@aire.com",
          password: "ejecutiva123",
          rol: "ejecutiva",
          responsablePRST: [
            "CARIBE INTERCOMUNICACIONES",
            "CARIBETECH",
            "DATA LAN",
            "DIALNET",
            "EME INGENIERIA",
            "COSTATEL",
            "INTERCAR.NET",
            "CABLE EXITO",
            "INTERMAIC.NET",
            "INTERNET Y TELECOMUNICACIONES DE COLOMBIA",
            "STARCOM CARIBE",
            "TELECOMUNICACIONES ZONA BANANERA",
            "ETB",
          ],
          activo: true,
        },
        {
          id: "7",
          nombre: "Sheylla",
          apellido: "Medina Garcia",
          usuario: "smedina",
          correo: "smedina@aire.com",
          password: "ejecutiva123",
          rol: "ejecutiva",
          responsablePRST: [
            "CIRION TECHNOLOGIES COLOMBIA",
            "CLARO",
            "COMUNET TELECOMUNICACIONES",
            "COMUNICACIONES TERRESTRES DE COLOMBIA",
            "DIGITVNET",
            "DRACO NET",
            "ECONEXION",
            "ELECNORTE",
            "JHOSDY TELECOMUNICACIONES",
            "LOGISTICA EN TELECOMUNICACIONES",
            "SOLUNET DIGITAL",
            "ITELKOM",
            "ATP FIBER",
            "CONETTA",
            "GLOBAL TIC",
            "TECOLRADIO",
            "INTSOFTV",
            "AJFIBER.NET",
            "GIGARED",
            "CYV NETWORKS",
            "AWATA",
            "TPE COMUNICACIONES",
            "CGVE",
            "ALCALDIA MUNICIPAL DE MAICAO",
            "ALCALDIA DE SANTA MARTA",
            "FIBRAZO",
            "UFINET",
            "INTERNEXA",
            "MOVISTAR",
          ],
          activo: true,
        },
        {
          id: "8",
          nombre: "Herbert Ale",
          apellido: "Petano Baleta",
          usuario: "hpetano",
          correo: "hpetano@aire.com",
          password: "coordinador123",
          rol: "coordinador",
          tipoCoordinador: "administrativo",
          activo: true,
        },
        {
          id: "9",
          nombre: "Wadith Alejandro",
          apellido: "Castillo Ramirez",
          usuario: "wcastillo",
          correo: "wcastillo@aire.com",
          password: "coordinador123",
          rol: "coordinador",
          tipoCoordinador: "operativo",
          activo: true,
        },
        {
          id: "10",
          nombre: "Eric",
          apellido: "ejemplo",
          usuario: "eejemplo",
          correo: "eejemplo@aire.com",
          password: "coordinador123",
          rol: "coordinador",
          tipoCoordinador: "censo",
          activo: true,
        },
        {
          id: "11",
          nombre: "Marcos",
          apellido: "Márquez",
          usuario: "mmarquez",
          correo: "mmarquez@aire.com",
          password: "analista123",
          rol: "analista",
          activo: true,
        },
        {
          id: "12",
          nombre: "Esteban",
          apellido: "Gomez",
          usuario: "egomez",
          correo: "egomez@aire.com",
          password: "analista1234",
          rol: "analista",
          activo: true,
        },
        {
          id: "13",
          nombre: "Richard",
          apellido: "de Lima Guette",
          usuario: "rlima",
          correo: "rlima@aire.com",
          password: "brigada123",
          rol: "brigada",
          departamento: "Atlantico",
          activo: true,
        },
        {
          id: "14",
          nombre: "Carlos Andrés",
          apellido: "Ospina",
          usuario: "cospina",
          correo: "cospina@aire.com",
          password: "brigada123",
          rol: "brigada",
          departamento: "Magdalena",
          activo: true,
        },
        {
          id: "15",
          nombre: "Senén",
          apellido: "Alcides",
          usuario: "salcides",
          correo: "salcides@aire.com",
          password: "brigada123",
          rol: "brigada",
          departamento: "Magdalena",
          activo: true,
        },
        {
          id: "16",
          nombre: "Yair Nicolas",
          apellido: "Redondo Epiayu",
          usuario: "yredondo",
          correo: "yredondo@aire.com",
          password: "brigada123",
          rol: "brigada",
          departamento: "La Guajira",
          activo: true,
        },
      ]

      localStorage.setItem(this.KEYS.USERS, JSON.stringify(defaultUsers))
    }

    if (!localStorage.getItem(this.KEYS.PROJECTS)) {
      localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify([]))
    }

    if (!localStorage.getItem(this.KEYS.NOTIFICATIONS)) {
      localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify([]))
    }

    if (!localStorage.getItem(this.KEYS.CENSUS)) {
      localStorage.setItem(this.KEYS.CENSUS, JSON.stringify([]))
    }

    if (!localStorage.getItem(this.KEYS.COUNTER)) {
      localStorage.setItem(
        this.KEYS.COUNTER,
        JSON.stringify({
          projects: 1000,
          notifications: 1000,
          census: 1000,
          users: 10,
        }),
      )
    }

    // Imprimir usuarios para depuración
    console.log("Usuarios inicializados:", this.getUsers())
  },

  // Obtener todos los usuarios
  getUsers: function () {
    return JSON.parse(localStorage.getItem(this.KEYS.USERS) || "[]")
  },

  // Obtener usuario por ID
  getUserById: function (id) {
    const users = this.getUsers()
    return users.find((user) => user.id === id)
  },

  // Obtener usuario por correo
  getUserByEmail: function (email) {
    const users = this.getUsers()
    return users.find((user) => user.correo === email)
  },

  // Guardar usuario
  saveUser: function (user) {
    const users = this.getUsers()
    // Si no tiene ID, es un nuevo usuario
    if (!user.id) {
      const counter = this.getCounter()
      user.id = (++counter.users).toString()
      this.saveCounter(counter)
      users.push(user)
    } else {
      // Actualizar usuario existente
      const index = users.findIndex((u) => u.id === user.id)
      if (index !== -1) {
        users[index] = user
      } else {
        users.push(user)
      }
    }
    localStorage.setItem(this.KEYS.USERS, JSON.stringify(users))
    return user
  },

  // Eliminar usuario
  deleteUser: function (id) {
    const users = this.getUsers()
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
      users.splice(index, 1)
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(users))
      return true
    }

    return false
  },

  // Autenticar usuario
  authenticateUser: function (email, password) {
    const users = this.getUsers()
    const user = users.find((u) => u.correo === email && u.password === password && u.activo)

    if (user) {
      this.setLoggedUser(user)
      return user
    }

    return null
  },

  // Establecer usuario logueado
  setLoggedUser: function (user) {
    localStorage.setItem(this.KEYS.LOGGED_USER, JSON.stringify(user))
  },

  // Obtener usuario logueado
  getLoggedUser: function () {
    return JSON.parse(localStorage.getItem(this.KEYS.LOGGED_USER))
  },

  // Cerrar sesión
  logout: function () {
    localStorage.removeItem(this.KEYS.LOGGED_USER)
  },

  // Obtener todos los proyectos
  getProjects: function () {
    return JSON.parse(localStorage.getItem(this.KEYS.PROJECTS) || "[]")
  },

  // Obtener proyecto por ID
  getProjectById: function (id) {
    const projects = this.getProjects()
    return projects.find((project) => project.id === id)
  },

  // Obtener lista de PRST
  getPRSTList: function () {
    return JSON.parse(localStorage.getItem(this.KEYS.PRST_LIST) || "[]")
  },

  // Obtener nombre corto de PRST por nombre completo
  getPRSTShortName: function (fullName) {
    const prstList = this.getPRSTList()
    const prst = prstList.find((p) => p.nombreCompleto === fullName)
    return prst ? prst.nombreCorto : fullName
  },

  // Guardar proyecto
  // Dentro del objeto Storage, modificar el método saveProject:
  // Modificar el método saveProject para usar el nuevo ID
  saveProject: function (project) {
    const projects = this.getProjects()

    try {
      // Si es nuevo proyecto, generar ID
      if (!project.id) {
        project.id = this.generateProjectId(project.prstNombre)
        project.fechaCreacion = new Date().toISOString()
        project.estado = "Nuevo"
        projects.push(project)
      } else {
        // Actualizar proyecto existente
        const index = projects.findIndex((p) => p.id === project.id)
        if (index !== -1) {
          project.fechaCreacion = projects[index].fechaCreacion // Mantener fecha original
          project.fechaActualizacion = new Date().toISOString()
          projects[index] = project
        } else {
          projects.push(project)
        }
      }

      localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(projects))
      return project
    } catch (error) {
      console.error("Error saving project:", error)
      throw error
    }
  },

  // Modificar el método generateProjectId para usar el formato "Nombre Corto de PRST"_CONTINUIDAD
  generateProjectId: function (prstName) {
    const prstShortName = this.getPRSTShortName(prstName)
    const projects = this.getProjects()

    // Encontrar máxima continuidad para este PRST
    let maxContinuidad = 0
    const prefix = prstShortName + "_"

    projects.forEach((project) => {
      if (project.id && project.id.startsWith(prefix)) {
        const continuidad = Number.parseInt(project.id.replace(prefix, ""))
        if (!isNaN(continuidad) && continuidad > maxContinuidad) {
          maxContinuidad = continuidad
        }
      }
    })

    return `${prefix}${maxContinuidad + 1}`
  },

  // Simplificar la función getPRSTShortName para obtener el nombre corto
  getPRSTShortName: function (fullName) {
    const prstList = this.getPRSTList()
    const found = prstList.find(
      (p) =>
        p.nombreCompleto.toLowerCase() === fullName.toLowerCase() ||
        p.nombreCorto.toLowerCase() === fullName.toLowerCase(),
    )
    return found ? found.nombreCorto.replace(/\s+/g, "_") : fullName.replace(/\s+/g, "_")
  },

  // Eliminar proyecto
  deleteProject: function (id) {
    const projects = this.getProjects()
    const index = projects.findIndex((project) => project.id === id)

    if (index !== -1) {
      projects.splice(index, 1)
      localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(projects))
      return true
    }

    return false
  },

  // Obtener todas las notificaciones
  getNotifications: function () {
    return JSON.parse(localStorage.getItem(this.KEYS.NOTIFICATIONS) || "[]")
  },

  // Obtener notificaciones por usuario
  getNotificationsByUser: function (userId) {
    const notifications = this.getNotifications()
    return notifications.filter((notification) => notification.usuarioId === userId)
  },

  // Crear notificación
  createNotification: function (notification) {
    const notifications = this.getNotifications()

    // Si no tiene ID, es una nueva notificación
    if (!notification.id) {
      const counter = this.getCounter()
      notification.id = (++counter.notifications).toString()
      this.saveCounter(counter)
    }

    notifications.push(notification)
    localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifications))
    return notification
  },

  // Marcar notificación como leída
  markNotificationAsRead: function (id) {
    const notifications = this.getNotifications()
    const index = notifications.findIndex((notification) => notification.id === id)

    if (index !== -1) {
      notifications[index].leido = true
      localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifications))
      return true
    }

    return false
  },

  // Marcar todas las notificaciones de un usuario como leídas
  markAllNotificationsAsRead: function (userId) {
    const notifications = this.getNotifications()
    let updated = false

    notifications.forEach((notification) => {
      if (notification.usuarioId === userId && !notification.leido) {
        notification.leido = true
        updated = true
      }
    })

    if (updated) {
      localStorage.setItem(this.KEYS.NOTIFICATIONS, JSON.stringify(notifications))
    }

    return updated
  },

  // Obtener contador
  getCounter: function () {
    return JSON.parse(
      localStorage.getItem(this.KEYS.COUNTER) || '{"projects":1000,"notifications":1000,"census":1000,"users":10}',
    )
  },

  // Guardar contador
  saveCounter: function (counter) {
    localStorage.setItem(this.KEYS.COUNTER, JSON.stringify(counter))
  },

  // Añadir o mejorar la función getProjectsByUserId para asegurar que se obtengan correctamente los proyectos asignados
  getProjectsByUserId: function (userId) {
    const projects = this.getProjects()
    return projects.filter((project) => {
      // Verificar si el proyecto está asignado al usuario (como analista o brigada)
      return project.analistaId === userId || project.brigadaId === userId
    })
  },

  // Añadir o mejorar la función getActiveProjectsByUserId para filtrar solo proyectos activos
  getActiveProjectsByUserId: function (userId) {
    const projects = this.getProjectsByUserId(userId)
    return projects.filter((project) => {
      // Filtrar proyectos que no estén completados o inactivos
      return project.estado !== "completado" && project.estado !== "Finalizado" && project.estado !== "inactivo"
    })
  },

  // Mejorar la función getStatusDisplayName para mostrar nombres más amigables
  getStatusDisplayName: (estado) => {
    const statusMap = {
      Nuevo: "Nuevo",
      "En Revision por Ejecutiva": "En Revisión",
      "En Revisión por Ejecutiva": "En Revisión",
      "Documentación Errada": "Requiere Correcciones",
      "En Asignación": "Asignado",
      Asignado: "En Proceso",
      "En Gestion por Analista": "En Proceso",
      "En Gestion por Brigada": "En Proceso",
      "En Revision de Verificacion": "En Verificación",
      Verificado: "Verificado",
      Finalizado: "Finalizado",
      completado: "Completado",
      inactivo: "Inactivo",
      activo: "Activo",
    }

    return statusMap[estado] || estado
  },

  // Mejorar la función getProjectProgress para calcular correctamente el progreso
  getProjectProgress: function (projectId) {
    const project = this.getProjectById(projectId)
    if (!project) {
      return { porcentaje: 0, estado: "no_iniciado" }
    }

    // Contar postes totales
    let postesTotales = 0
    if (project.kmlData && project.kmlData.puntos) {
      postesTotales = project.kmlData.puntos.filter((p) => {
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
    } else if (project.numPostes) {
      // Si no hay datos KML pero hay número de postes definido
      postesTotales = Number.parseInt(project.numPostes)
    }

    // Si no hay postes, no hay progreso que calcular
    if (postesTotales === 0) {
      return { porcentaje: 0, estado: "no_iniciado" }
    }

    // Contar postes censados
    const censos = this.getCensusByProject(projectId)
    const postesCensados = new Set(censos.map((c) => c.numPoste)).size

    // Calcular porcentaje
    const porcentaje = Math.round((postesCensados / postesTotales) * 100)

    // Determinar estado
    let estado = "no_iniciado"
    if (porcentaje === 100) {
      estado = "finalizado"
    } else if (porcentaje > 0) {
      estado = "en_proceso"
    }

    return { porcentaje, estado }
  },

  // Obtener censos por proyecto
  getCensusByProject: function (projectId) {
    const allCensus = JSON.parse(localStorage.getItem(this.KEYS.CENSUS) || "[]")
    return allCensus.filter((census) => census.projectId === projectId)
  },

  // Añadir o mejorar la función getProjectsByCoordinadorId para asegurar que se obtengan correctamente los proyectos asignados
  getProjectsByCoordinadorId: function (coordinadorId) {
    const projects = this.getProjects()
    console.log("Buscando proyectos para coordinador ID:", coordinadorId)

    // Si es Wadith (ID 9), mostrar todos los proyectos en estado "En Asignación"
    if (coordinadorId === "9" || coordinadorId === 9) {
      const enAsignacionProjects = projects.filter((project) => project.estado === "En Asignación")
      console.log("Proyectos en asignación para Wadith:", enAsignacionProjects)
      return enAsignacionProjects
    }

    const filteredProjects = projects.filter((project) => {
      // Verificar si el proyecto está asignado al coordinador
      const isAssigned = project.coordinadorId === coordinadorId
      if (isAssigned) {
        console.log("Proyecto asignado encontrado:", project)
      }
      return isAssigned
    })

    console.log("Proyectos filtrados para coordinador:", filteredProjects)
    return filteredProjects
  },

  // Añadir o mejorar la función getProjectsBySector para filtrar proyectos por sector
  getProjectsBySector: function (sector) {
    if (!sector || sector === "Todos") {
      return this.getProjects()
    }

    const projects = this.getProjects()
    return projects.filter((project) => {
      return project.sector === sector || project.departamento === sector
    })
  },

  // Añadir o mejorar la función getUserByUsername para buscar usuarios por nombre de usuario
  getUserByUsername: function (username) {
    const users = this.getUsers()
    return users.find((user) => user.usuario === username)
  },

  // Añadir o mejorar la función para obtener solicitudes de cambio de contraseña
  getPasswordRequests: () => {
    // Si no existe la clave en localStorage, crear un array vacío
    if (!localStorage.getItem("air_e_password_requests")) {
      localStorage.setItem("air_e_password_requests", JSON.stringify([]))
    }

    return JSON.parse(localStorage.getItem("air_e_password_requests") || "[]")
  },

  // Añadir o mejorar la función para actualizar solicitudes de cambio de contraseña
  updatePasswordRequest: function (id, estado, nuevaPassword) {
    const solicitudes = this.getPasswordRequests()
    const index = solicitudes.findIndex((s) => s.id === id)

    if (index === -1) {
      return false
    }

    solicitudes[index].estado = estado

    if (estado === "aprobada" && nuevaPassword) {
      // Actualizar contraseña del usuario
      const usuario = this.getUserByUsername(solicitudes[index].nombreUsuario)
      if (usuario) {
        usuario.password = nuevaPassword
        this.saveUser(usuario)
      }
    }

    localStorage.setItem("air_e_password_requests", JSON.stringify(solicitudes))
    return true
  },

  // Añadir o mejorar la función para obtener el número de notificaciones no leídas
  getUnreadNotificationsCount: function (userId) {
    const notifications = this.getNotificationsByUser(userId)
    return notifications.filter((n) => !n.leido).length
  },

  // Añadir o mejorar la función para añadir notificaciones
  addNotification: function (notification) {
    return this.createNotification(notification)
  },
}

// Asegurarse de que el Storage se inicialice cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar el almacenamiento
  Storage.init()
  console.log("Storage inicializado correctamente")
})

// Función para forzar la inicialización del Storage (útil para debugging)
function forceInitStorage() {
  Storage.init()
  console.log("Storage inicializado manualmente")
  return "Storage inicializado correctamente. Usuarios: " + JSON.stringify(Storage.getUsers())
}

// Exponer la función para poder llamarla desde la consola
window.forceInitStorage = forceInitStorage

