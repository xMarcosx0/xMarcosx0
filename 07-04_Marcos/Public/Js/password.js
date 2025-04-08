document.addEventListener("DOMContentLoaded", () => {
  // Inicializar el almacenamiento
  if (typeof Storage !== "undefined") {
    Storage.init()
  }

  // Referencias a elementos del DOM
  const formStep1 = document.getElementById("formStep1")
  const formStep2 = document.getElementById("formStep2")
  const formStep3 = document.getElementById("formStep3")
  const formSuccess = document.getElementById("formSuccess")

  const step1 = document.getElementById("step1")
  const step2 = document.getElementById("step2")
  const step3 = document.getElementById("step3")

  const usuarioRecuperar = document.getElementById("usuarioRecuperar")
  const correoRecuperar = document.getElementById("correoRecuperar")
  const motivoRecuperar = document.getElementById("motivoRecuperar")

  const btnVerificarUsuario = document.getElementById("btnVerificarUsuario")
  const btnVolverStep1 = document.getElementById("btnVolverStep1")
  const btnVerificarCorreo = document.getElementById("btnVerificarCorreo")
  const btnVolverStep2 = document.getElementById("btnVolverStep2")
  const btnEnviarSolicitud = document.getElementById("btnEnviarSolicitud")
  const btnVolverLogin = document.getElementById("btnVolverLogin")

  // Variables para almacenar datos del usuario
  let usuarioVerificado = null

  // Función para mostrar mensajes
  function mostrarMensaje(titulo, mensaje) {
    const modalMensaje = new bootstrap.Modal(document.getElementById("modalMensaje"))
    document.getElementById("tituloModalMensaje").textContent = titulo
    document.getElementById("textoModalMensaje").textContent = mensaje
    modalMensaje.show()
  }

  // Función para cambiar entre pasos
  function mostrarPaso(paso) {
    formStep1.style.display = "none"
    formStep2.style.display = "none"
    formStep3.style.display = "none"
    formSuccess.style.display = "none"

    step1.classList.remove("active")
    step2.classList.remove("active")
    step3.classList.remove("active")

    if (paso === 1) {
      formStep1.style.display = "block"
      step1.classList.add("active")
    } else if (paso === 2) {
      formStep2.style.display = "block"
      step1.classList.add("active")
      step2.classList.add("active")
    } else if (paso === 3) {
      formStep3.style.display = "block"
      step1.classList.add("active")
      step2.classList.add("active")
      step3.classList.add("active")
    } else if (paso === 4) {
      formSuccess.style.display = "block"
      step1.classList.add("active")
      step2.classList.add("active")
      step3.classList.add("active")
    }
  }

  // Paso 1: Verificar usuario
  btnVerificarUsuario.addEventListener("click", () => {
    const nombreUsuario = usuarioRecuperar.value.trim()

    if (!nombreUsuario) {
      mostrarMensaje("Error", "Por favor, ingrese su nombre de usuario.")
      return
    }

    // Buscar usuario en el sistema
    const usuario = Storage.getUserByUsername(nombreUsuario)

    if (!usuario) {
      mostrarMensaje("Error", "El usuario ingresado no existe en el sistema.")
      return
    }

    // Guardar usuario verificado y avanzar al paso 2
    usuarioVerificado = usuario
    mostrarPaso(2)
  })

  // Volver al paso 1
  btnVolverStep1.addEventListener("click", () => {
    mostrarPaso(1)
  })

  // Paso 2: Verificar correo
  btnVerificarCorreo.addEventListener("click", () => {
    const correo = correoRecuperar.value.trim()

    if (!correo) {
      mostrarMensaje("Error", "Por favor, ingrese su correo electrónico.")
      return
    }

    // Verificar que el correo coincida con el del usuario
    if (usuarioVerificado.correo !== correo) {
      mostrarMensaje("Error", "El correo electrónico no coincide con el registrado para este usuario.")
      return
    }

    // Avanzar al paso 3
    mostrarPaso(3)
  })

  // Volver al paso 2
  btnVolverStep2.addEventListener("click", () => {
    mostrarPaso(2)
  })

  // Paso 3: Enviar solicitud
  btnEnviarSolicitud.addEventListener("click", () => {
    const motivo = motivoRecuperar.value.trim()

    if (!motivo) {
      mostrarMensaje("Error", "Por favor, ingrese el motivo de su solicitud.")
      return
    }

    // Crear solicitud de cambio de contraseña
    const solicitud = {
      nombreUsuario: usuarioVerificado.usuario,
      correoUsuario: usuarioVerificado.correo,
      motivo: motivo,
      fechaCreacion: new Date().toISOString(),
      estado: "pendiente",
    }

    // Guardar solicitud en el sistema
    Storage.addPasswordRequest(solicitud)

    // Mostrar mensaje de éxito y avanzar al paso final
    mostrarPaso(4)
  })

  // Volver a la página de login
  btnVolverLogin.addEventListener("click", () => {
    window.location.href = "./login.html"
  })

  // Iniciar en el paso 1
  mostrarPaso(1)
})

