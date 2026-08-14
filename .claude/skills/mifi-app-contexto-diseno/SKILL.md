---
name: mifi-app-contexto-diseno
description: Índice y reglas de uso del paquete de diseño de MiFi desde el frontend (Wireframes, Historias de Usuario, Requerimientos Funcionales y No Funcionales, Casos de Uso, Diagrama de Secuencias, contrato OpenAPI, registro ADR). Úsalo ANTES de implementar, diseñar o explicar cualquier pantalla o funcionalidad de MiFiApp, para saber qué documento consultar y no inventar pantallas, campos, endpoints ni reglas de negocio. Se activa con tareas como "implementá la pantalla X", "conectá esto con la API", "qué campos tiene el formulario Y", "cómo funciona el flujo de Z", o cualquier trabajo dentro del repositorio MiFiApp.
metadata:
  version: "1.0.0"
  proyecto: MiFi
  repo: MiFiApp
---

# Contexto de diseño de MiFi — desde el frontend

MiFi es una app de gestión financiera personal para estudiantes,
**instrumento de una investigación de tesis** (no un producto comercial).
El software existe para producir los datos que miden los indicadores de la
matriz de operacionalización (pretest O₁ / postest O₂).

Esto tiene una consecuencia directa en el frontend: la **usabilidad es una
variable medida**, no un lujo. Hay un test SUS en el piloto. Un flujo
confuso no es deuda estética, es ruido en los datos de la tesis.

## Regla de oro

**No inventes** pantallas, campos, endpoints ni reglas de negocio que no
estén documentados. Si algo falta, declaralo como pendiente y preguntá.

## Dónde están los documentos

La fuente de verdad vive en **MiFiBackend/docs** (decisión del §0 de
`docs/GUIA_INSTALACION.MD`). Este repo tiene una **copia de solo lectura**:

```bash
npm run sync:upstream    # contrato + documentos de diseño
```

- `docs/upstream/*.md` — copia de solo lectura. **NUNCA editar**: se
  sobrescribe. Si algo está mal, se corrige en MiFiBackend.
- `contracts/openapi.yaml` + `src/api/schema.d.ts` — el contrato y sus
  tipos generados.
- `docs/*.md` (fuera de `upstream/`) — documentación propia del frontend.

## Qué documento consultar según la tarea

| Tarea | Documento |
|:--|:--|
| **Retomar el proyecto, saber en qué paso quedamos** | `docs/ESTADO_PROYECTO.md` (este repo) — leer primero |
| **Saber qué endpoints existen de verdad** | `docs/upstream/ESTADO_PROYECTO.md` (backend) |
| **Construir una pantalla: qué elementos lleva** | `docs/upstream/Wireframes.md` — las 17 pantallas, agrupadas en flujos A–E |
| Entender el "qué" desde el usuario, criterios de aceptación | `docs/upstream/HistoriasUsuario.md` |
| Implementar una funcionalidad concreta | `docs/upstream/RequerimientosFuncionales.md` (buscá el RF-XX) |
| Rendimiento, accesibilidad, usabilidad, cobertura | `docs/upstream/RequerimientosNoFuncionales.md` |
| Flujos alterno y de excepción de un caso crítico | `docs/upstream/EspecificacionesCasosUsoCriticos.md` |
| Orden de las llamadas en un flujo | `docs/upstream/DiagramaSecuencias.md` |
| Qué actor puede hacer qué | `docs/upstream/DiagramaCasosUso.md` |
| Cómo se conectan los componentes técnicos | `docs/upstream/DiagramaComponentes.md` |
| **Consumir un endpoint: forma exacta de request/response** | `src/api/schema.d.ts` (generado del contrato) y `contracts/openapi.yaml` |
| El "por qué" de una decisión (ADR D-01 a D-15) | `docs/upstream/README.md §6` |
| Instalación, configuración, tropiezos del stack | `docs/GUIA_INSTALACION.MD` (este repo) |

## Decisiones ADR que más pegan en el cliente

- **D-01/D-03**: autenticación propia con JWT + `jti`. El logout revoca de
  verdad contra el servidor; no alcanza con borrar el token local.
- **D-05**: anti-IDOR — el backend responde **404** (no 403) ante un
  recurso ajeno. La UI debe tratar el 404 como "no existe", sin insinuar
  que el recurso existe pero es de otro.
- **D-08 / D-15**: doble marca de gasto hormiga — automática por umbral
  (RF-38, inmutable, alimenta el indicador de la tesis) y criterio propio
  del estudiante (RF-55, opcional). **Son dos cosas distintas y la UI no
  debe mezclarlas**: la automática no se puede editar.
- **D-13/D-14**: categorías propias del usuario; meta de ahorro con fecha
  límite opcional.
- **RF-47 a RF-49**: sin consentimiento aceptado no se puede usar la parte
  financiera. Es una compuerta de navegación, no un aviso.

## Lo que la documentación NO dice (y hay que resolver explícitamente)

`Wireframes.md` es una tabla de **elementos clave** por pantalla con
trazabilidad a HU/RF. Define *qué* va en cada pantalla, **no cómo se ve**:
no hay paleta, tipografía, espaciados, ni estados visuales.

Su propia sección "Pendientes de refinamiento" reconoce 5 huecos, todos de
frontend:

1. Taxonomía final de categorías predefinidas.
2. Estados de error del OCR (monto ilegible, boleta borrosa, duplicado).
3. Reglas de detección por correo y ventana de deduplicación.
4. **Estados vacíos y micro-copys** de alerta de gastos hormiga.
5. Prototipo navegable de los flujos críticos para el test SUS.

Cuando una tarea toque uno de estos puntos: **no lo inventes en silencio**.
Proponé una opción concreta, explicá el porqué, marcala como supuesto en el
código (`// SUPUESTO: …, no definido en Wireframes.md`) y avisá al usuario
para que quede registrado.

## Trazabilidad obligatoria

Todo lo que implementes debe poder señalar su origen: un RF, una HU o un
UC. Si el motivo de una línea no es obvio, comentalo con su código de
origen (ej. `// RF-38 gasto hormiga`).

## Idioma

Nombres de dominio (componentes de negocio, campos, variables, funciones de
dominio) y comentarios: **en español**, coherente con el backend
(`Usuario`, `Transaccion`, `MetaAhorro`). Las APIs de React/Expo y las
convenciones propias del ecosistema siguen su forma habitual en inglés
(`useEffect`, `onPress`, `testID`).
