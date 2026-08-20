document.addEventListener("DOMContentLoaded", () => {
  const sessionToken = "SESION-" + Math.random().toString(36).substring(2, 9);
  
  // URL que abrirá la cámara del celular (Ajustar con tu IP local o Dominio)
  const mobileUrl = `${window.location.origin}/registro-movil.html?token=${sessionToken}`;

  // Generar código QR
  new QRCode(document.getElementById("qrcode"), {
    text: mobileUrl,
    width: 200,
    height: 200
  });

  // Consultar periódicamente a json-server si el celular ya envió los datos
  const checkSessionInterval = setInterval(async () => {
    try {
      const res = await fetch(`http://localhost:3001/sesiones?token=${sessionToken}`);
      const data = await res.json();

      if (data.length > 0) {
        clearInterval(checkSessionInterval);
        const user = data[0];
        
        // Guardar la sesión localmente en la PC
        localStorage.setItem("zofranca_user", JSON.stringify(user));

        // Redirigir según el perfil seleccionado desde el teléfono
        alert(`¡Ingreso detectado! Bienvenido ${user.nombre}`);
        
        if (user.role === "solicitante") window.location.href = "solicitud.html";
        else if (user.role === "gerente") window.location.href = "gerencia.html";
        else if (user.role === "admin") window.location.href = "admin.html";
      }
    } catch (err) {
      console.error("Esperando validación móvil...", err);
    }
  }, 2000); // Revisa cada 2 segundos
});