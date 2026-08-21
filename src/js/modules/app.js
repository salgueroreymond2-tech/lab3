/**
 * ZoFranca CR Management Platform - App Logic
 */

// Estado global reactivo
const State = {
  solicitudes: [],
  logs: []
};

// Umbrales simulados por sector (Ley 7210)
const UMBRALES_REGIMEN = {
  "Servicios BPO": { minInversion: 150000, minEmpleos: 15 },
  "Tecnología": { minInversion: 100000, minEmpleos: 8 },
  "Manufactura": { minInversion: 500000, minEmpleos: 30 }
};

document.addEventListener("DOMContentLoaded", () => {
  const userStr = localStorage.getItem("zofranca_user");
  if (!userStr) {
    window.location.href = "./login.html";
    return;
  }

  initStorage();
  bindEvents();
  initTabs();
  initRoleNavigation();
  setupLogout();
  renderApp();
});

// Inicialización de datos
function initStorage() {
  const localSolicitudes = localStorage.getItem("procomer_solicitudes");
  const localLogs = localStorage.getItem("procomer_logs");

  if (localSolicitudes && JSON.parse(localSolicitudes).length > 0) {
    State.solicitudes = JSON.parse(localSolicitudes);
  } else {
    // Solicitudes iniciales de demostración
    State.solicitudes = [
      {
        id: "SOL-1045",
        empresaNombre: "TechServices Latam S.A.",
        sector: "Servicios BPO",
        zonaFrancaId: "ZF-001",
        inversion: 1650000,
        empleos: 125,
        estado: "PENDIENTE_REVISION",
        timestamp: new Date().toISOString(),
        evaluacionIA: {
          cumpleUmbrales: true,
          score: 0.94,
          alertas: ["Verificar exención fiscal bajo ley 7210 art. 17."],
          recomendacion: "APROBACIÓN_SUGERIDA"
        }
      },
      {
        id: "SOL-1044",
        empresaNombre: "GlobalLogix CR S.A.",
        sector: "Manufactura",
        zonaFrancaId: "ZF-003",
        inversion: 400000,
        empleos: 25,
        estado: "PENDIENTE_REVISION",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        evaluacionIA: {
          cumpleUmbrales: false,
          score: 0.42,
          alertas: ["Inversión por debajo del umbral ($500,000)", "Empleos por debajo del mínimo sectorial (30)"],
          recomendacion: "REVISIÓN_MANUAL_REQUERIDA"
        }
      },
      {
        id: "SOL-1043",
        empresaNombre: "BioMed Devices Central",
        sector: "Manufactura",
        zonaFrancaId: "ZF-003",
        inversion: 5200000,
        empleos: 340,
        estado: "APROBADO",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        evaluacionIA: {
          cumpleUmbrales: true,
          score: 0.98,
          alertas: [],
          recomendacion: "APROBACIÓN_SUGERIDA"
        }
      }
    ];
  }

  if (localLogs && JSON.parse(localLogs).length > 0) {
    State.logs = JSON.parse(localLogs);
  } else {
    State.logs = [
      { id: "LOG-8801", timestamp: new Date().toLocaleTimeString(), accion: "PRECLASIFICACION_IA", entidadId: "SOL-1045", detalles: "Evaluación IA completada. Score: 94%" },
      { id: "LOG-8800", timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), accion: "SOLICITUD_RECIBIDA", entidadId: "SOL-1044", detalles: "Solicitud registrada desde el portal web" }
    ];
  }

  saveState();
}

function saveState() {
  localStorage.setItem("procomer_solicitudes", JSON.stringify(State.solicitudes));
  localStorage.setItem("procomer_logs", JSON.stringify(State.logs));
}

// Control de Visibilidad de Pestañas y Permisos por Rol (localStorage.getItem('zofranca_user'))
function initRoleNavigation() {
  const userStr = localStorage.getItem("zofranca_user");
  let role = "solicitante";

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      role = user.role || "solicitante";
    } catch (e) {
      console.error("Error al leer zofranca_user:", e);
    }
  }

  const tabSolicitud = document.getElementById("tab-solicitud");
  const tabDashboard = document.getElementById("tab-dashboard");
  const tabCumplimiento = document.getElementById("tab-cumplimiento");
  const tabAlertas = document.getElementById("tab-alertas");

  if (role === "solicitante") {
    // Empresa Solicitante: Solo debe ver 'Formulario de Solicitud'
    if (tabSolicitud) {
      tabSolicitud.classList.remove("hidden");
      tabSolicitud.style.display = "inline-flex";
    }
    if (tabDashboard) {
      tabDashboard.classList.add("hidden");
      tabDashboard.style.display = "none";
    }
    if (tabCumplimiento) {
      tabCumplimiento.classList.add("hidden");
      tabCumplimiento.style.display = "none";
    }
    if (tabAlertas) {
      tabAlertas.classList.add("hidden");
      tabAlertas.style.display = "none";
    }

    if (tabSolicitud) tabSolicitud.click();

  } else if (role === "admin" || role === "gerente") {
    // Visibilidad Global (Lectura): Tanto Analista (admin) como Gerente (gerente) ven todos los módulos de consulta/reportes
    if (tabSolicitud) {
      tabSolicitud.classList.remove("hidden");
      tabSolicitud.style.display = "inline-flex";
    }
    if (tabDashboard) {
      tabDashboard.classList.remove("hidden");
      tabDashboard.style.display = "inline-flex";
    }
    if (tabCumplimiento) {
      tabCumplimiento.classList.remove("hidden");
      tabCumplimiento.style.display = "inline-flex";
    }
    if (tabAlertas) {
      tabAlertas.classList.remove("hidden");
      tabAlertas.style.display = "inline-flex";
    }

    if (role === "gerente" && tabCumplimiento) {
      tabCumplimiento.click();
    } else if (tabDashboard) {
      tabDashboard.click();
    }
  }
}

// Configuración del Botón '🔴 Cerrar Sesión'
function setupLogout() {
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("zofranca_user");
      // Redirige al login en src/page/login.html
      window.location.href = "./login.html";
    });
  }
}

// Control de pestañas (Navegación entre Stitch Screens)
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetId = tab.getAttribute("data-target");
      const views = document.querySelectorAll(".view-section");
      views.forEach(v => {
        if (v.id === targetId) {
          v.classList.remove("hidden");
        } else {
          v.classList.add("hidden");
        }
      });
    });
  });
}

function bindEvents() {
  const form = document.getElementById("solicitudForm");
  if (form) {
    form.addEventListener("submit", handleSolicitudSubmit);
  }
}

// Envío de Solicitud (Formulario)
async function handleSolicitudSubmit(event) {
  event.preventDefault();
  const form = event.target;
  
  if (!form.checkValidity()) {
    alert("Por favor complete todos los campos requeridos.");
    return;
  }

  setLoadingState(true);

  const newRequestData = {
    id: `SOL-${Math.floor(1000 + Math.random() * 9000)}`,
    empresaNombre: document.getElementById("empresaNombre").value,
    sector: document.getElementById("sector").value,
    zonaFrancaId: document.getElementById("zonaFranca").value,
    inversion: parseFloat(document.getElementById("inversion").value),
    empleos: parseInt(document.getElementById("empleos").value, 10),
    estado: "PENDIENTE_REVISION",
    timestamp: new Date().toISOString()
  };

  try {
    const evaluacionIA = await simularPreclasificacionIA(newRequestData);
    newRequestData.evaluacionIA = evaluacionIA;

    State.solicitudes.unshift(newRequestData);
    registrarAuditoria("SOLICITUD_CREADA_IA", newRequestData.id, `Evaluación IA completada. Score: ${(evaluacionIA.score * 100).toFixed(0)}%`);

    saveState();
    form.reset();
    renderApp();

    // Cambiar al Dashboard si está visible para el rol
    const tabDash = document.getElementById("tab-dashboard");
    if (tabDash && !tabDash.classList.contains("hidden")) {
      tabDash.click();
    } else {
      alert("¡Solicitud enviada con éxito! Su proyecto ha sido ingresado para evaluación.");
    }
  } catch (error) {
    console.error("Error al procesar solicitud:", error);
  } finally {
    setLoadingState(false);
  }
}

function simularPreclasificacionIA(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const umbral = UMBRALES_REGIMEN[data.sector] || { minInversion: 100000, minEmpleos: 10 };
      const cumpleInversion = data.inversion >= umbral.minInversion;
      const cumpleEmpleos = data.empleos >= umbral.minEmpleos;
      
      const alertas = [];
      if (!cumpleInversion) alertas.push(`Inversión por debajo del umbral mínimo ($${umbral.minInversion.toLocaleString()})`);
      if (!cumpleEmpleos) alertas.push(`Empleos directos por debajo del mínimo sectorial (${umbral.minEmpleos})`);

      resolve({
        cumpleUmbrales: cumpleInversion && cumpleEmpleos,
        score: cumpleInversion && cumpleEmpleos ? 0.96 : 0.42,
        alertas: alertas,
        recomendacion: cumpleInversion && cumpleEmpleos ? "APROBACIÓN_SUGERIDA" : "REVISIÓN_MANUAL_REQUERIDA"
      });
    }, 1000);
  });
}

// Resolución por Analista Humano
window.resolverSolicitud = function(solicitudId, nuevoEstado) {
  const item = State.solicitudes.find(s => s.id === solicitudId);
  if (!item) return;

  item.estado = nuevoEstado;
  item.resolucionHumana = {
    fecha: new Date().toISOString(),
    analista: "Analista_PROCOMER_01"
  };

  registrarAuditoria(
    `DECISION_HUMANA_${nuevoEstado}`, 
    solicitudId, 
    `Analista resolvió estado a ${nuevoEstado}`
  );

  saveState();
  renderApp();
};

// Helper para obtener el usuario actual
function getCurrentUserRole() {
  const userStr = localStorage.getItem("zofranca_user");
  if (!userStr) return "solicitante";
  try {
    const user = JSON.parse(userStr);
    return user.role || "solicitante";
  } catch (e) {
    return "solicitante";
  }
}

// Modal Detalle IA
window.abrirModalIA = function(solicitudId) {
  const item = State.solicitudes.find(s => s.id === solicitudId);
  if (!item) return;

  const currentRole = getCurrentUserRole();

  document.getElementById("modalTitle").textContent = `🤖 Análisis IA — ${item.empresaNombre} (${item.id})`;
  document.getElementById("modalScore").textContent = `${(item.evaluacionIA.score * 100).toFixed(0)}%`;
  
  const badgeRec = document.getElementById("modalRecomendacion");
  badgeRec.textContent = item.evaluacionIA.recomendacion.replace(/_/g, ' ');
  badgeRec.className = item.evaluacionIA.cumpleUmbrales ? "badge badge-approved" : "badge badge-alert";

  const textAlertas = document.getElementById("modalAlertas");
  if (textAlertas) {
    // El analista puede editar observaciones técnicas; gerente solo lectura o edición de autorización
    if (currentRole === "admin") {
      textAlertas.removeAttribute("readonly");
    } else {
      textAlertas.setAttribute("readonly", "true");
    }
    textAlertas.value = item.evaluacionIA.observaciones 
      || (item.evaluacionIA.alertas && item.evaluacionIA.alertas.length > 0 
          ? item.evaluacionIA.alertas.join("\n") 
          : "Sin alertas críticas. El proyecto cumple con todos los requisitos de la Ley 7210.");
  }

  const guardarObservaciones = () => {
    const textoActual = textAlertas ? textAlertas.value.trim() : "";
    item.evaluacionIA.observaciones = textoActual;
    item.evaluacionIA.alertas = textoActual ? textoActual.split("\n").filter(l => l.trim() !== "") : [];
    saveState();
    registrarAuditoria("OBSERVACIONES_ACTUALIZADAS", item.id, `Notas guardadas por ${currentRole === "admin" ? "Analista" : "Gerente"}.`);
    renderApp();
  };

  const btnGuardar = document.getElementById("btnModalGuardar");
  if (btnGuardar) {
    // Botón de guardar observaciones visible para Analista (admin)
    if (currentRole === "admin") {
      btnGuardar.style.display = "inline-block";
      btnGuardar.onclick = function() {
        guardarObservaciones();
        alert("¡Observaciones técnicas del analista guardadas con éxito!");
      };
    } else {
      btnGuardar.style.display = "none";
    }
  }

  const btnAprobar = document.getElementById("btnModalAprobar");
  if (btnAprobar) {
    // Autorización final (Aprobar en última instancia / firmar): Gerente
    if (currentRole === "gerente") {
      btnAprobar.style.display = "inline-block";
      btnAprobar.onclick = function() {
        guardarObservaciones();
        resolverSolicitud(item.id, "APROBADO");
        cerrarModalIA();
      };
    } else {
      btnAprobar.style.display = "none";
    }
  }

  const btnRechazar = document.getElementById("btnModalRechazar");
  if (btnRechazar) {
    // Rechazo final / Desautorización: Gerente
    if (currentRole === "gerente") {
      btnRechazar.style.display = "inline-block";
      btnRechazar.onclick = function() {
        guardarObservaciones();
        resolverSolicitud(item.id, "RECHAZADO");
        cerrarModalIA();
      };
    } else {
      btnRechazar.style.display = "none";
    }
  }

  document.getElementById("modalAnalisisIA").classList.remove("hidden");
};

window.cerrarModalIA = function() {
  document.getElementById("modalAnalisisIA").classList.add("hidden");
};

function registrarAuditoria(accion, entidadId, detalles) {
  const logEntry = {
    id: `LOG-${Math.floor(Math.random() * 9000 + 1000)}`,
    timestamp: new Date().toLocaleTimeString(),
    accion,
    entidadId,
    detalles
  };
  State.logs.unshift(logEntry);
}

// Renderizado Dinámico
function renderApp() {
  renderTable();
  renderAuditLogs();
}

function renderTable() {
  const tbody = document.getElementById("solicitudesTableBody");
  const pendingCount = document.getElementById("pendingCount");
  const kpiTotal = document.getElementById("kpiTotal");
  
  if (!tbody) return;
  tbody.innerHTML = "";

  const currentRole = getCurrentUserRole();
  
  const pendientes = State.solicitudes.filter(s => s.estado === "PENDIENTE_REVISION").length;
  if (pendingCount) pendingCount.textContent = `${pendientes} PENDIENTES`;
  if (kpiTotal) kpiTotal.textContent = State.solicitudes.length;

  if (State.solicitudes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No hay solicitudes registradas</td></tr>`;
    return;
  }

  State.solicitudes.forEach(sol => {
    const tr = document.createElement("tr");
    
    const iaBadgeClass = sol.evaluacionIA.cumpleUmbrales ? "badge-approved" : "badge-alert";
    const iaTexto = sol.evaluacionIA.cumpleUmbrales ? "CUMPLE UMBRALES" : `ALERTA (${sol.evaluacionIA.alertas.length})`;

    let estadoBadgeClass = "badge-system";
    if (sol.estado === "APROBADO") estadoBadgeClass = "badge-approved";
    if (sol.estado === "RECHAZADO") estadoBadgeClass = "badge-rejected";

    let accionesHtml = `<span class="badge ${estadoBadgeClass}">${sol.estado}</span> `;
    
    // Botón de ver detalles disponible para lectura de ambos
    accionesHtml += `<button class="btn btn-secondary btn-sm" onclick="abrirModalIA('${sol.id}')">Ver Detalle</button> `;

    // Acciones de resolución en última instancia (Aprobar/Rechazar) reservadas al Gerente
    if (currentRole === "gerente") {
      if (sol.estado === "PENDIENTE_REVISION") {
        accionesHtml += `
          <button class="btn btn-success btn-sm" onclick="resolverSolicitud('${sol.id}', 'APROBADO')">Autorizar / Aprobar</button>
          <button class="btn btn-danger btn-sm" onclick="resolverSolicitud('${sol.id}', 'RECHAZADO')">Rechazar</button>
        `;
      } else if (sol.estado === "APROBADO") {
        accionesHtml += `
          <button class="btn btn-danger btn-sm" onclick="resolverSolicitud('${sol.id}', 'RECHAZADO')" title="Revocar autorización">Revocar Aprobación</button>
        `;
      } else {
        accionesHtml += `
          <button class="btn btn-success btn-sm" onclick="resolverSolicitud('${sol.id}', 'APROBADO')" title="Reconsiderar y autorizar">Reconsiderar Autorización</button>
        `;
      }
    } else if (currentRole === "admin") {
      // Para el Analista (admin): permite emitir/editar dictamen técnico
      accionesHtml += `<span class="badge badge-system" style="font-size:0.75rem;">Dictamen Técnico</span>`;
    }

    tr.innerHTML = `
      <td><strong>${sol.id}</strong></td>
      <td>${escapeHtml(sol.empresaNombre)}</td>
      <td>${sol.sector}</td>
      <td>$${sol.inversion.toLocaleString()} / ${sol.empleos} emp</td>
      <td>
        <span class="badge ${iaBadgeClass}">
          ${iaTexto}
        </span>
      </td>
      <td>${accionesHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAuditLogs() {
  const logList = document.getElementById("auditLogList");
  if (!logList) return;
  logList.innerHTML = "";
  
  State.logs.slice(0, 10).forEach(log => {
    const li = document.createElement("li");
    li.textContent = `[${log.timestamp}] [${log.accion}] Ref: ${log.entidadId} — ${log.detalles}`;
    logList.appendChild(li);
  });
}

function setLoadingState(loading) {
  const btnSubmit = document.getElementById("btnSubmit");
  if (!btnSubmit) return;
  const spinner = btnSubmit.querySelector(".spinner");
  const btnText = btnSubmit.querySelector(".btn-text");

  btnSubmit.disabled = loading;
  if (loading) {
    spinner.classList.remove("hidden");
    btnText.textContent = "Procesando con IA...";
  } else {
    spinner.classList.add("hidden");
    btnText.textContent = "Enviar a Revisión Asíncrona";
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}