#!/usr/bin/env node
/**
 * Sincroniza el contrato de la API y regenera los tipos del cliente.
 *
 * `openapi.yaml` vive en MiFiBackend/docs y es la fuente de verdad única
 * (ver docs/GUIA_INSTALACION.MD §0). Este repo no lo edita: lo baja y
 * genera `src/api/schema.d.ts` a partir de él. Si el backend cambia un
 * campo, `npm run typecheck` acá lo detecta en compilación.
 *
 * openapi-typescript NO está en devDependencies a propósito: su peer pide
 * typescript@^5.x y este proyecto usa TS 6, así que npm se niega a
 * instalarlo. Es un generador que corre a mano y escribe un .d.ts, no algo
 * que la app importe en runtime — se ejecuta con npx, que resuelve su
 * propio árbol aislado y no contamina el nuestro.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

const URL_CONTRATO =
  process.env.MIFI_CONTRACT_URL ??
  "https://raw.githubusercontent.com/adlerOmonte1/MiFIBackend/main/docs/openapi.yaml";

const DESTINO_YAML = join(RAIZ, "contracts", "openapi.yaml");
const DESTINO_TIPOS = join(RAIZ, "src", "api", "schema.d.ts");

console.log(`→ Bajando contrato de ${URL_CONTRATO}`);

const respuesta = await fetch(URL_CONTRATO);
if (!respuesta.ok) {
  console.error(
    `✖ No se pudo bajar el contrato (HTTP ${respuesta.status}).\n` +
      `  Si MiFIBackend pasó a privado, exportá un token y reintentá, o\n` +
      `  apuntá MIFI_CONTRACT_URL a una copia local.`,
  );
  process.exit(1);
}

const yaml = await respuesta.text();
mkdirSync(dirname(DESTINO_YAML), { recursive: true });
writeFileSync(DESTINO_YAML, yaml);
console.log(`✓ Contrato guardado en contracts/openapi.yaml (${yaml.length} bytes)`);

console.log("→ Generando tipos con openapi-typescript…");
mkdirSync(dirname(DESTINO_TIPOS), { recursive: true });
execFileSync("npx", ["--yes", "openapi-typescript@7", DESTINO_YAML, "-o", DESTINO_TIPOS], {
  stdio: "inherit",
  cwd: RAIZ,
});

console.log("✓ Tipos generados en src/api/schema.d.ts");
console.log("  Revisá el diff: si cambió algo, el backend cambió el contrato.");
