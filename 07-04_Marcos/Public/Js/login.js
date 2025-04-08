// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar el almacenamiento
  Storage.init()
  console.log("Storage inicializado en login.js")

  // Obtener referencias a elementos del formulario
  const loginForm = document.getElementById("loginForm")
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const errorMessage = document.getElementById("errorMessage")

  // Verificar si ya hay un usuario logueado
  const loggedUser = Storage.getLoggedUser()
  if (loggedUser) {
    redirectUserByRole(loggedUser)
    return
  }

  // Agregar evento de envío al formulario
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Obtener valores del formulario
      const email = document.getElementById("email").value
      const password = document.getElementById("password").value

      // Autenticar usuario
      const user = Storage.authenticateUser(email, password)

      if (user) {
        // Autenticación exitosa
        console.log("Usuario autenticado:", user)

        // Crear notificación de inicio de sesión
        Storage.createNotification({
          usuarioId: user.id,
          tipo: "inicio_sesion",
          mensaje: `Has iniciado sesión el ${new Date().toLocaleString()}`,
          fechaCreacion: new Date().toISOString(),
          leido: false,
        })

        // Redirigir según el rol
        redirectUserByRole(user)
      } else {
        // Mostrar mensaje de error
        alert("Correo o contraseña incorrectos. Por favor, intente nuevamente.")
      }
    })
  }

  // Función para mostrar mensajes de error
  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message
      errorMessage.style.display = "block"
    }
  }

  // Función para redirigir según el rol del usuario
  function redirectUserByRole(user) {
    switch (user.rol) {
      case "admin":
        window.location.href = "admin.html"
        break
      case "prst":
        window.location.href = "prst.html"
        break
      case "ejecutiva":
        window.location.href = "ejecutiva.html"
        break
      case "coordinador":
        window.location.href = "coordinador.html"
        break
      case "analista":
        window.location.href = "analista.html"
        break
      case "brigada":
        window.location.href = "brigada.html"
        break
      default:
        window.location.href = "index.html"
    }
  }

  // Botón de recuperación de contraseña
  const btnRecuperarPassword = document.getElementById("btnRecuperarPassword")
  if (btnRecuperarPassword) {
    btnRecuperarPassword.addEventListener("click", () => {
      window.location.href = "password.html"
    })
  }
})

// Función para depuración - mostrar todos los usuarios en la consola
function showAllUsers() {
  console.log("Todos los usuarios:", Storage.getUsers())
}

// Exponer la función para poder llamarla desde la consola
window.showAllUsers = showAllUsers

