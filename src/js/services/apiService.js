/**
 * API Service Manager - ZoFranca CR
 * Módulo central para el consumo de datos estáticos y simulación de peticiones a db.json
 */

export async function fetchDbData() {
  try {
    const response = await fetch('/src/db.json');
    if (!response.ok) {
      // Fallback si db.json está en la raíz
      const rootRes = await fetch('/db.json');
      return await rootRes.json();
    }
    return await response.json();
  } catch (error) {
    console.warn("No se pudo cargar db.json dinámicamente. Usando estado en localStorage.", error);
    return null;
  }
}

export function getInitialSolicitudes() {
  const local = localStorage.getItem("procomer_solicitudes");
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error("Error al parsear procomer_solicitudes", e);
    }
  }
  return [];
}

export function getInitialAuditLogs() {
  const local = localStorage.getItem("procomer_logs");
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error("Error al parsear procomer_logs", e);
    }
  }
  return [];
}
