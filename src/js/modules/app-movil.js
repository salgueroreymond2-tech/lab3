import Swal from 'sweetalert2';

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const mobileForm = document.getElementById("mobileForm");

  mobileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
      token: token,
      cedula: document.getElementById("cedula").value,
      nombre: document.getElementById("nombre").value,
      telefono: document.getElementById("telefono").value,
      role: document.getElementById("role").value,
      fechaIngreso: new Date().toISOString()
    };

    // Guardar sesión en json-server para que la PC la detecte
    try {
      const res = await fetch("http://localhost:3001/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      if (res.ok) {
        document.body.innerHTML = "<h2 style='text-align:center; padding: 2rem;'>¡Acceso confirmado! Puedes continuar en la pantalla de tu computadora.</h2>";
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'Error al conectar con el servidor. Intenta de nuevo.',
        confirmButtonColor: '#0056b3'
      });
    }
  });
});