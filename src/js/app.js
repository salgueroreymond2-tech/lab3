/**
 * Plataforma PROCOMER - Módulo Frontend Escalar
 */

// Estado global reactivo simulado
const State = {
  solicitudes: [],
  logs: []
};

// Umbrales simulados por sector para el motor de IA
const UMBRALES_REGIMEN = {
  "Servicios BPO": { minInversion: 150000, minEmpleos: 15 },
  "Tecnología": { minInversion: 100000, minEmpleos: 8 },
  "Manufactura": { minInversion: 500000, minEmpleos: 30 }
};

document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  bindEvents();
  renderApp();
});

// Inicialización de la capa de almacenamiento simulada
function initStorage() {
  const localSolicitudes = localStorage.getItem("procomer_solicitudes");
  const localLogs = localStorage.getItem("procomer_logs");

  State.solicitudes = localSolicitudes ? JSON.parse(localSolicitudes) : [];
  State.logs = localLogs ? JSON.parse(localLogs) : [];
}

function saveState() {
  localStorage.setItem("procomer_solicitudes", JSON.stringify(State.solicitudes));
  localStorage.setItem("procomer_logs", JSON.stringify(State.logs));
}

// Vinculación de eventos de la interfaz
function bindEvents() {
  const form = document.getElementById("solicitudForm");
  form.addEventListener("submit", handleSolicitudSubmit);
}

/**
 * PROCESAMIENTO ASÍNCRONO DE SOLICITUDES
 * No bloquea la interfaz de usuario durante la simulación de análisis.
 */
async function handleSolicitudSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btnSubmit = document.getElementById("btnSubmit");
  
  if (!form.checkValidity()) {
    alert("Por favor complete todos los campos requeridos.");
    return;
  }

  setLoadingState(true);

  // Extraer valores del formulario
  const newRequestData = {
    id: `SOL-${Date.now().toString().slice(-4)}`,
    empresaNombre: document.getElementById("empresaNombre").value,
    sector: document.getElementById("sector").value,
    zonaFrancaId: document.getElementById("zonaFranca").value,
    inversion: parseFloat(document.getElementById("inversion").value),
    empleos: parseInt(document.getElementById("empleos").value, 10),
    estado: "PENDIENTE_REVISION",
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Simulación de procesamiento asíncrono en segundo plano (Web Worker / Async Task)
    const evaluacionIA = await simularPreclasificacionIA(newRequestData);
    newRequestData.evaluacionIA = evaluacionIA;

    // 2. Persistencia y registro de trazabilidad
    State.solicitudes.unshift(newRequestData);
    registrarAuditoria("SOLICITUD_CREADA_IA", newRequestData.id, `Evaluación IA completada. Confianza: ${evaluacionIA.score}`);

    saveState();
    form.reset();
    renderApp();

  } catch (error) {
    console.error("Error al procesar solicitud:", error);
  } finally {
    setLoadingState(false);
  }
}

/**
 * MOTOR SIMULADO DE IA / INFERENCIA EN SEGUNDO PLANO
 */
function simularPreclasificacionIA(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const umbral = UMBRALES_REGIMEN[data.sector] || { minInversion: 100000, minEmpleos: 10 };
      const cumpleInversion = data.inversion >= umbral.minInversion;
      const cumpleEmpleos = data.empleos >= umbral.minEmpleos;
      
      const alertas = [];
      if (!cumpleInversion) alertas.push(`Inversion por debajo del umbral ($${umbral.minInversion})`);
      if (!cumpleEmpleos) alertas.push(`Empleos por debajo del mínimo sectorial (${umbral.minEmpleos})`);

      resolve({
        cumpleUmbrales: cumpleInversion && cumpleEmpleos,
        score: cumpleInversion && cumpleEmpleos ? 0.96 : 0.42,
        alertas: alertas,
        recomendacion: cumpleInversion && cumpleEmpleos ? "APROBACIÓN_SUGERIDA" : "REVISIÓN_MANUAL_REQUERIDA"
      });
    }, 1200); // Retardo de 1.2s para simular procesamiento asíncrono
  });
}

/**
 * DECISIÓN DEL ANALISTA HUMANO (Human-in-the-Loop)
 */
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
    `El analista cambió el estado a ${nuevoEstado}`
  );

  saveState();
  renderApp();
};

// Registro inmutable de trazabilidad (Log de auditoría)
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

// Renderizado dinamico UI
function renderApp() {
  renderTable();
  renderAuditLogs();
}

function renderTable() {
  const tbody = document.getElementById("solicitudesTableBody");
  const pendingCount = document.getElementById("pendingCount");
  
  tbody.innerHTML = "";
  
  const pendientes = State.solicitudes.filter(s => s.estado === "PENDIENTE_REVISION").length;
  pendingCount.textContent = `${pendientes} PENDIENTES`;

  if (State.solicitudes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-muted);">No hay solicitudes registradas</td></tr>`;
    return;
  }

  State.solicitudes.forEach(sol => {
    const tr = document.createElement("tr");
    
    // Configuración del badge de IA
    const iaBadgeClass = sol.evaluacionIA.cumpleUmbrales ? "badge-approved" : "badge-alert";
    const iaTexto = sol.evaluacionIA.cumpleUmbrales ? "CUMPLE UMBRALES" : `ALERTA (${sol.evaluacionIA.alertas.length})`;

    // Generar botones de acción para el analista humano
    let accionesHtml = `<span class="badge badge-system">${sol.estado}</span>`;
    if (sol.estado === "PENDIENTE_REVISION") {
      accionesHtml = `
        <button class="btn btn-success btn-sm" onclick="resolverSolicitud('${sol.id}', 'APROBADO')">Aprobar</button>
        <button class="btn btn-danger btn-sm" onclick="resolverSolicitud('${sol.id}', 'RECHAZADO')">Rechazar</button>
      `;
    }

    tr.innerHTML = `
      <td><strong>${sol.id}</strong></td>
      <td>${escapeHtml(sol.empresaNombre)}</td>
      <td>${sol.sector}</td>
      <td>$${sol.inversion.toLocaleString()} / ${sol.empleos} emp</td>
      <td>
        <span class="badge ${iaBadgeClass}" title="${sol.evaluacionIA.alertas.join('; ')}">
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
  logList.innerHTML = "";
  
  State.logs.slice(0, 10).forEach(log => {
    const li = document.createElement("li");
    li.textContent = `[${log.timestamp}] [${log.accion}] Ref: ${log.entidadId} - ${log.detalles}`;
    logList.appendChild(li);
  });
}

function setLoadingState(loading) {
  const btnSubmit = document.getElementById("btnSubmit");
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