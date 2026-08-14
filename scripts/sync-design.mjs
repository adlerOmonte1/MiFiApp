#!/usr/bin/env node
/**
 * Sincroniza el paquete de diseño desde MiFiBackend.
 *
 * El §0 de docs/GUIA_INSTALACION.MD fija que la documentación de diseño vive
 * en MiFiBackend/docs como fuente de verdad ÚNICA. Este script no la
 * duplica en el sentido problemático: la baja a docs/upstream/ marcada como
 * copia de solo lectura, para que las skills y el desarrollo la tengan a
 * mano sin depender de que los dos repos estén clonados lado a lado.
 *
 * ⚠️ NO EDITAR nada dentro de docs/upstream/: se sobrescribe en cada
 * corrida. Si algo está mal ahí, se corrige en MiFiBackend y se vuelve a
 * sincronizar.
 *
 * Los archivos quedan versionados a propósito, para que la otra máquina y
 * CI los tengan sin ejecutar nada.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = join(RAIZ, "docs", "upstream");

const BASE =
  process.env.MIFI_DOCS_BASE ??
  "https://raw.githubusercontent.com/adlerOmonte1/MiFIBackend/main/docs";

/**
 * Solo los documentos que el frontend realmente consulta. No se bajan
 * DiagramaEntidadRelacion ni DiagramaClases: describen la persistencia del
 * backend, y del lado del cliente los tipos salen del contrato OpenAPI
 * (npm run sync:contract), no del modelo de datos.
 */
const DOCUMENTOS = [
  "Wireframes.md",
  "HistoriasUsuario.md",
  "RequerimientosFuncionales.md",
  "RequerimientosNoFuncionales.md",
  "EspecificacionesCasosUsoCriticos.md",
  "DiagramaSecuencias.md",
  "DiagramaCasosUso.md",
  "DiagramaComponentes.md",
  "README.md",
  "ESTADO_PROYECTO.md",
];

const AVISO = (nombre) =>
  `<!--\n  COPIA DE SOLO LECTURA — NO EDITAR.\n\n` +
  `  Fuente de verdad: MiFiBackend/docs/${nombre}\n` +
  `  Regenerar con: npm run sync:design\n` +
  `  Sincronizado: ${new Date().toISOString()}\n-->\n\n`;

mkdirSync(DESTINO, { recursive: true });

let fallos = 0;

for (const nombre of DOCUMENTOS) {
  const url = `${BASE}/${nombre}`;
  try {
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      console.error(`  ✖ ${nombre} — HTTP ${respuesta.status}`);
      fallos++;
      continue;
    }
    const texto = await respuesta.text();
    writeFileSync(join(DESTINO, nombre), AVISO(nombre) + texto);
    console.log(`  ✓ ${nombre} (${texto.length.toLocaleString("es")} bytes)`);
  } catch (error) {
    console.error(`  ✖ ${nombre} — ${error.message}`);
    fallos++;
  }
}

if (fallos > 0) {
  console.error(
    `\n✖ ${fallos} documento(s) no se pudieron bajar.\n` +
      `  Si MiFIBackend pasó a privado, apuntá MIFI_DOCS_BASE a una copia local.`,
  );
  process.exit(1);
}

console.log(`\n✓ ${DOCUMENTOS.length} documentos en docs/upstream/ (solo lectura)`);
