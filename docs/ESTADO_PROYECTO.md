# Estado del proyecto — MiFiApp

> **Documento vivo.** Es lo primero que se lee al abrir una sesión nueva y
> lo último que se actualiza al cerrarla. Su trabajo es que una sesión con
> contexto cero pueda retomar sin releer todo el historial.
>
> Equivalente a `MiFiBackend/docs/ESTADO_PROYECTO.md`.
>
> **Última actualización:** 14 de agosto de 2026 (A1.4 terminado)

---

## 1. Qué es este repo

Cliente móvil de MiFi (Expo SDK 57 + expo-router + TypeScript). Consume la
API de `MiFiBackend`. Es el instrumento con el que los participantes de la
tesis registran sus movimientos, así que **la usabilidad es una variable
medida**, no una preferencia estética.

---

## 2. Dónde estamos AHORA MISMO

**Fases 0 y 1 completas. Sprint A1 en curso: 4 de 6 pasos.**

Ya existen los componentes base, el store de sesión, los interceptores y el
árbol de rutas con sus guards. **Todavía no hay contenido real en las
pantallas** — las 4 de A1.5/A1.6 son placeholders.

**A1 — Fundaciones y autenticación**, en curso. Los 5 endpoints que
necesita existen y están probados en el backend contra Supabase real.

| Paso | Estado |
|:--|:--|
| A1.1 Componentes base e íconos | ✅ verificado en simulador |
| A1.2 Store de sesión + llavero | ✅ verificado en simulador |
| A1.3 Interceptores de axios | ✅ verificado contra el backend real |
| A1.4 Rutas y guards | ✅ decisión probada con Jest; falta el recorrido visual |
| A1.5 Pantallas 03 y 04 | ⏳ **siguiente** |
| A1.6 Pantallas 01 y 02 | ⏳ |

64 pruebas pasando.

⚠️ **A1.4 quedó sin verificación visual, a propósito.** Las 7 reglas de
`Navegacion.md §5` están cubiertas con Jest sobre `src/navegacion/guardas.ts`
puro. Pero las 4 pantallas destino son placeholders — clickearlas ahora no
agregaría señal. El recorrido completo en el simulador (registro → login →
consentimiento → dashboard) se hace **una sola vez, al cerrar A1.6**, cuando
ya haya contenido real que ver. Si se cierra el sprint sin haberlo hecho,
esto queda pendiente explícito, no completado por omisión.

---

## 3. Cómo se trabaja acá

Skill `mifi-app-flujo-incremental` — es la misma metodología del backend:

- Pasos chicos, numerados, uno a la vez, cada uno comprobable.
- **Nada está "listo" porque compile:** las pantallas se ven en el
  simulador y las pruebas se corren de verdad.
- **Los comandos de git los corre el usuario, no el agente.** Decisión
  explícita del proyecto.
- Si algo no está en la documentación de diseño, no se inventa: se declara
  como supuesto (`// SUPUESTO:`) y se avisa.

---

## 4. Fase 0 — Setup: ✅ COMPLETA

Todo verificado y en `main` (y `staging`).

| Qué | Estado |
|:--|:--|
| Repo, ramas `main` y `staging` | ✅ |
| Proyecto Expo aplanado a la raíz | ✅ |
| Dependencias del stack | ✅ |
| ESLint + Prettier + TS estricto | ✅ |
| Jest + Testing Library + MSW | ✅ |
| Contrato OpenAPI → tipos generados | ✅ 1544 líneas |
| Paquete de diseño sincronizado | ✅ `npm run sync:upstream` |
| CI en GitHub Actions | ✅ verde |
| App corriendo en simulador iOS | ✅ |

Detalle y tropiezos: `GUIA_INSTALACION.MD`.

---

## 5. Fase 1 — Diseño: ✅ COMPLETA

| Paso | Entregable | Estado |
|:--|:--|:--|
| 1.1 | `SistemaDiseno.md` + tokens en `theme.ts` | ✅ |
| 1.2 | `Navegacion.md` | ✅ |
| 1.3 | `EstrategiaPruebas.md` | ✅ |
| 1.4 | Este documento | ✅ |
| 1.5 | `Iconografia.md` — set, inventario y regla de uso | ✅ |
| 1.6 | `ContenidoUI.md` — textos, estados y validaciones | ✅ |
| — | `TextoConsentimiento.md` | ⚠️ borrador sin aprobar |

**Fase 1 cerrada.** Las decisiones que quedaban se tomaron al abrir A1
(A-12 a A-16 en §6).

---

## 6. Decisiones tomadas en este repo

Las del paquete de diseño (D-01 a D-15) viven en
`docs/upstream/README.md §6`. Estas son **propias del frontend**:

| # | Decisión | Motivo |
|:--|:--|:--|
| **A-01** | Dos repos separados | Ciclos de vida y CI independientes |
| **A-02** | TypeScript estricto, con `noUncheckedIndexedAccess` y `exactOptionalPropertyTypes` | El contrato permite generar los tipos: renunciar sería perder la red de seguridad principal |
| **A-03** | Jest + Testing Library + MSW | Sin pruebas no se sostiene la metodología |
| **A-04** | Proyecto en la raíz del repo | GitHub Actions y EAS asumen raíz de repo = raíz del proyecto |
| **A-05** | Paquete de diseño sincronizado a `docs/upstream/`, solo lectura | Fuente de verdad única sin depender de tener los dos repos clonados |
| **A-06** | `openapi-typescript` se ejecuta con `npx`, no es dependencia | Su peer pide TS 5 y el proyecto usa TS 6 |
| **A-07** | **Solo modo claro** en v1 | El test SUS exige que todos los participantes vean lo mismo |
| **A-08** | Colores y tamaños prohibidos fuera de `theme.ts`, **aplicado por ESLint** | Documentarlo no alcanza: la convención se erosiona sola |
| **A-09** | Tokens de texto separados de los de superficie (`primarioTexto`, `alertaTexto`) | 4 pares del mockup no llegaban a WCAG AA; conserva la identidad visual |
| **A-10** | Umbral de cobertura apagado hasta A1 | Un umbral siempre en rojo se ignora |
| **A-11** | Guards de sesión y consentimiento en **un solo layout** | Si cada pantalla valida, alguna se olvida — y es un requisito ético |
| **A-12** | **Tuteo** en todos los textos de interfaz | Registro natural en Perú; los participantes son peruanos |
| **A-13** | `¿Olvidaste tu contraseña?` **oculto en v1** | No hay RF ni endpoint; un enlace muerto castiga el SUS |
| **A-14** | La pantalla 03 lleva campo **Nombre** | El contrato lo exige y el dashboard lo usa en el saludo. Corregir `Wireframes.md` en el backend |
| **A-15** | El **423** del login muestra mensaje propio | Se prioriza que el usuario bloqueado entienda por qué no entra. La fuga que revela es del backend y se arregla ahí |
| **A-16** | El **403 `CONSENTIMIENTO_REQUERIDO`** no borra la sesión | Tratarlo como 401 dejaría al usuario en un ciclo de login del que no sale |
| **A-17** | La sesión guarda **token + usuario** en el llavero, no solo el token | Permite decidir la ruta al arrancar sin una llamada de red. A1.3 agregará el refresco contra `/usuarios/me` |
| **A-18** | Ante cualquier fallo del llavero, el resultado es **sin sesión** | Quedar en `desconocido` colgaría la app en el splash; dejar pasar sería peor |
| **A-19** | El interceptor **no navega**: solo cambia el estado de la sesión | Atar la red a la navegación dejaría dos lugares decidiendo a qué pantalla va el usuario. Los guards observan el estado y navegan |
| **A-20** | Ningún `AxiosError` sale de `src/api/` | Hacia arriba viaja un `ErrorApi` con un `tipo` sobre el que se puede hacer `switch`; una pantalla no tiene por qué saber qué es un código HTTP |
| **A-21** | `expo-router/testing-library` (`renderRouter`) **descartado**; las decisiones de guard son funciones puras probadas aparte | Frágil en esta versión (ESM sin transformar, redirects que no se resuelven a tiempo); `EstrategiaPruebas.md` tiene el detalle |
| **A-22** | El árbol de rutas usa placeholders en las 4 pantallas de A1.5/A1.6 | Permite construir y probar los guards ya, sin bloquear en contenido que no existe todavía |

---

## 7. Convenciones ya decididas (no volver a preguntar)

- **Idioma:** dominio y comentarios en español; APIs del ecosistema en
  inglés. Archivos en kebab-case.
- **Pruebas junto al archivo** (`x.ts` + `x.test.ts`).
- **Commits:** tipo en inglés, descripción en español, referencia al RF/HU.
  **Breves: 1 o 2 líneas como máximo.** El detalle va en la documentación,
  no en el mensaje del commit.
- **Ramas:** `feature/*` → PR → `staging` → `main`.
- **Estado:** TanStack Query para lo que vive en el backend; Zustand para
  lo que solo existe en el dispositivo.
- **Alias `@/`** en vez de rutas relativas largas.

---

## 8. Deuda técnica conocida

| # | Qué | Impacto | Dónde |
|:--|:--|:--|:--|
| 1 | El `openapi.yaml` casi no declara `required`: todos los tipos salen opcionales | **Alto** — la seguridad de tipos queda a medias | Se arregla en el backend |
| 2 | Sin protecciones de rama en GitHub | Medio — el flujo de PR es convención, no garantía | Settings → Branches |
| 3 | `textoTenue` `#8B948F` no pasa WCAG AA (3,12:1) | Bajo — hoy no se usa | `SistemaDiseno.md §8` |
| 4 | Sin pruebas E2E | Bajo por ahora | Reevaluar tras A2 |
| 5 | Ambos repos son **públicos** (la guía asumía privados) | A confirmar | No hay secretos commiteados |
| 6 | Warning de lint en `client.ts` (`import/no-named-as-default-member`, axios) | Cosmético | — |
| 7 | **AUT-01 CA01 contradice RF-47/CON-01**: uno manda al dashboard tras el registro, el otro exige consentimiento antes de habilitar nada | **Alto** — son requisitos éticos del estudio | Corregir en `HistoriasUsuario.md` del backend; ver `ContenidoUI.md §8` |
| 8 | Ícono y splash siguen siendo los de Expo | Medio — **bloquea el piloto**, no el desarrollo | `Iconografia.md §6` |
| 9 | **El texto de consentimiento es un borrador sin aprobar** | **Alto — bloquea el piloto.** Es evidencia para el comité de ética (Ley 29733) | `TextoConsentimiento.md` |
| 10 | No está definido si puede haber participantes **menores de edad** | **Alto** — cambiaría el procedimiento de consentimiento completo | `TextoConsentimiento.md §7` |
| 11 | Enumeración de usuarios vía 423 (Issue nº1 del backend, abierto) | Medio — la UI lo expone por decisión A-15 | Se arregla en el backend |

---

## 9. Cómo levantar todo

```bash
nvm use && npm install && cp .env.example .env
```

```bash
npx expo start --ios
```

```bash
npm run lint && npm run format:check && npm run typecheck && npm run test:coverage
```

Para Android hace falta `ANDROID_HOME` en el `~/.zshrc` (ver
`GUIA_INSTALACION.MD`), y `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api`.

---

## 10. Al cerrar cada sesión

Actualizar en este documento: en qué paso se quedó (§2), qué decisiones
nuevas se tomaron (§6) y qué deuda técnica apareció (§8).
