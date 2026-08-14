# Estado del proyecto — MiFiApp

> **Documento vivo.** Es lo primero que se lee al abrir una sesión nueva y
> lo último que se actualiza al cerrarla. Su trabajo es que una sesión con
> contexto cero pueda retomar sin releer todo el historial.
>
> Equivalente a `MiFiBackend/docs/ESTADO_PROYECTO.md`.
>
> **Última actualización:** 13 de agosto de 2026

---

## 1. Qué es este repo

Cliente móvil de MiFi (Expo SDK 57 + expo-router + TypeScript). Consume la
API de `MiFiBackend`. Es el instrumento con el que los participantes de la
tesis registran sus movimientos, así que **la usabilidad es una variable
medida**, no una preferencia estética.

---

## 2. Dónde estamos AHORA MISMO

**Fase 1 (Diseño) casi completa. Todavía no se escribió ninguna pantalla.**

Lo que existe es la base: el proyecto configurado y verificado, el sistema
de diseño implementado en código, y la documentación de cómo se va a
construir. `src/` sigue siendo el andamiaje de `create-expo-app` más el
cliente de API.

**Lo siguiente:** cerrar los pasos 1.5 (íconos) y 1.6 (micro-copys y
estados vacíos), y arrancar el sprint **A1 — Fundaciones y autenticación**
(`PlanTrabajoFrontend.md §3`).

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
| Jest + Testing Library + MSW | ✅ 6 pruebas pasando |
| Contrato OpenAPI → tipos generados | ✅ 1544 líneas |
| Paquete de diseño sincronizado | ✅ `npm run sync:upstream` |
| CI en GitHub Actions | ✅ verde |
| App corriendo en simulador iOS | ✅ |

Detalle y tropiezos: `GUIA_INSTALACION.MD`.

---

## 5. Fase 1 — Diseño: 🔄 EN CURSO

| Paso | Entregable | Estado |
|:--|:--|:--|
| 1.1 | `SistemaDiseno.md` + tokens en `theme.ts` | ✅ |
| 1.2 | `Navegacion.md` | ✅ |
| 1.3 | `EstrategiaPruebas.md` | ✅ |
| 1.4 | Este documento | ✅ |
| 1.5 | Set de íconos | ⏳ **bloquea A2** |
| 1.6 | Micro-copys y estados vacíos (flujos B y D) | ⏳ **bloquea A2** |

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

---

## 7. Convenciones ya decididas (no volver a preguntar)

- **Idioma:** dominio y comentarios en español; APIs del ecosistema en
  inglés. Archivos en kebab-case.
- **Pruebas junto al archivo** (`x.ts` + `x.test.ts`).
- **Commits:** tipo en inglés, descripción en español, referencia al RF/HU.
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
