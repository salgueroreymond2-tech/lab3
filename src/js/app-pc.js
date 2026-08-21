import Swal from 'sweetalert2';

document.addEventListener("DOMContentLoaded", () => {
  const sessionToken = "SESION-" + Math.random().toString(36).substring(2, 9);
  
  // Elementos UI
  const tabCredenciales = document.getElementById("tabCredenciales");
  const tabQR = document.getElementById("tabQR");
  const panelCredenciales = document.getElementById("panelCredenciales");
  const panelQR = document.getElementById("panelQR");
  const formCredenciales = document.getElementById("formLoginCredenciales");
  const btnDemoAnalista = document.getElementById("btnDemoAnalista");
  const btnDemoEmpresa = document.getElementById("btnDemoEmpresa");
  const linkSimularMovil = document.getElementById("linkSimularMovil");

  // 1. Control de Pestañas (Credenciales vs QR)
  if (tabCredenciales && tabQR) {
    tabCredenciales.addEventListener("click", () => {
      tabCredenciales.classList.add("active");
      tabQR.classList.remove("active");
      panelCredenciales.classList.remove("hidden");
      panelQR.classList.add("hidden");
    });

    tabQR.addEventListener("click", () => {
      tabQR.classList.add("active");
      tabCredenciales.classList.remove("active");
      panelQR.classList.remove("hidden");
      panelCredenciales.classList.add("hidden");
    });
  }

  // 2. Ingreso Directo por Formulario de Credenciales
  if (formCredenciales) {
    const USUARIOS_VALIDOS = {
      "analista@procomer.com": { pass: "1234", role: "admin" },
      "empresa@zonafranca.cr": { pass: "5678", role: "solicitante" },
      "gerencia@zonafranca.cr": { pass: "9123", role: "gerente" }
    };

    formCredenciales.addEventListener("submit", (e) => {
      e.preventDefault();
      const usuario = document.getElementById("usuario").value.trim();
      const password = document.getElementById("password").value.trim();

      // 1. Buscar en cuentas por defecto (base de datos simulada)
      const cuentaEstatica = USUARIOS_VALIDOS[usuario];

      // 2. Buscar en empresas registradas en localStorage
      const empresasRegistradas = JSON.parse(localStorage.getItem("empresas_registradas") || "[]");
      const cuentaDinamica = empresasRegistradas.find(
        emp => emp.correo.toLowerCase() === usuario.toLowerCase() && emp.password === password
      );

      let roleEncontrado = null;

      if (cuentaEstatica && cuentaEstatica.pass === password) {
        roleEncontrado = cuentaEstatica.role;
      } else if (cuentaDinamica) {
        roleEncontrado = cuentaDinamica.role || "solicitante";
      }

      if (roleEncontrado) {
        localStorage.setItem("zofranca_user", JSON.stringify({
          usuario: usuario,
          role: roleEncontrado
        }));
        window.location.href = "./src/page/index.html";
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Credenciales Incorrectas',
          text: 'Por favor, verifica tu correo y contraseña.',
          confirmButtonColor: '#0056b3'
        });
      }
    });
  }

  // 3. Botones de Acceso Rápido Demo
  if (btnDemoAnalista) {
    btnDemoAnalista.addEventListener("click", () => {
      localStorage.setItem("zofranca_user", JSON.stringify({
        usuario: "analista@procomer.com",
        role: "admin",
        nombre: "Analista PROCOMER",
        fecha: new Date().toISOString()
      }));
      window.location.href = "src/page/index.html";
    });
  }

  if (btnDemoEmpresa) {
    btnDemoEmpresa.addEventListener("click", () => {
      localStorage.setItem("zofranca_user", JSON.stringify({
        usuario: "empresa@techcorp.cr",
        role: "solicitante",
        nombre: "TechCorp CR S.A.",
        fecha: new Date().toISOString()
      }));
      window.location.href = "src/page/index.html";
    });
  }

  // 4. Configurar Código QR Móvil
  const qrElement = document.getElementById("qrcode");
  if (qrElement) {
    const mobileUrl = `${window.location.origin}/src/page/registro-movil.html?token=${sessionToken}`;
    
    if (linkSimularMovil) {
      linkSimularMovil.href = mobileUrl;
    }

    new QRCode(qrElement, {
      text: mobileUrl,
      width: 190,
      height: 190
    });
  }

  // 5. Polling para detección de escaneo QR desde el servidor simulado
  const checkSessionInterval = setInterval(async () => {
    try {
      const res = await fetch(`http://localhost:3001/sesiones?token=${sessionToken}`);
      const data = await res.json();

      if (data.length > 0) {
        clearInterval(checkSessionInterval);
        const user = data[0];
        localStorage.setItem("zofranca_user", JSON.stringify(user));
        Swal.fire({
          icon: 'success',
          title: '¡Autenticación Móvil Confirmada!',
          text: `Bienvenido ${user.nombre}`,
          confirmButtonColor: '#0056b3'
        }).then(() => {
          window.location.href = "src/page/index.html";
        });
      }
    } catch (err) {
      // Servidor mock opcional
    }
  }, 2500);
});