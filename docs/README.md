# Documentación de MiFiApp

Índice de la documentación del **frontend**. El paquete de diseño del
sistema (historias, requerimientos, wireframes, contrato) vive en
`MiFiBackend/docs` y se sincroniza acá a `docs/upstream/`.

---

## Por dónde empezar

| Si querés… | Leé |
|:--|:--|
| **Saber en qué paso estamos** | [`ESTADO_PROYECTO.md`](ESTADO_PROYECTO.md) ← siempre primero |
| Instalar el proyecto o entender un error del stack | [`GUIA_INSTALACION.MD`](GUIA_INSTALACION.MD) |
| Saber qué se construye y en qué orden | [`PlanTrabajoFrontend.md`](PlanTrabajoFrontend.md) |
| Construir una pantalla: colores, tipografía, forma | [`SistemaDiseno.md`](SistemaDiseno.md) |
| Saber dónde va una ruta y quién puede acceder | [`Navegacion.md`](Navegacion.md) |
| Escribir un texto, un error o un estado vacío | [`ContenidoUI.md`](ContenidoUI.md) |
| Poner un ícono | [`Iconografia.md`](Iconografia.md) |
| Escribir pruebas | [`EstrategiaPruebas.md`](EstrategiaPruebas.md) |

---

## Documentación propia (este repo)

| Documento | Qué responde |
|:--|:--|
| [`ESTADO_PROYECTO.md`](ESTADO_PROYECTO.md) | **Documento vivo.** En qué paso quedamos, decisiones A-01…A-11, deuda técnica |
| [`PlanTrabajoFrontend.md`](PlanTrabajoFrontend.md) | Fases, sprints A1–A7, entregables por paso, DoD, riesgos |
| [`SistemaDiseno.md`](SistemaDiseno.md) | Paleta, tipografía, forma, contraste WCAG, reglas de usabilidad |
| [`Navegacion.md`](Navegacion.md) | Las 17 pantallas → rutas, guards de sesión y consentimiento, tab bar |
| [`ContenidoUI.md`](ContenidoUI.md) | Textos exactos, estados vacíos, validaciones y mensajes de error |
| [`Iconografia.md`](Iconografia.md) | Set de íconos, inventario por pantalla, regla de uso |
| [`TextoConsentimiento.md`](TextoConsentimiento.md) | ⚠️ **Borrador sin aprobar.** El texto que firma el participante y su versión |
| [`EstrategiaPruebas.md`](EstrategiaPruebas.md) | Qué se prueba, qué no, cobertura, reglas de MSW |
| [`GUIA_INSTALACION.MD`](GUIA_INSTALACION.MD) | Instalación paso a paso y los tropiezos reales del stack |

## Paquete de diseño (`docs/upstream/`)

**Copia de solo lectura.** Se regenera con `npm run sync:design`; editarla
no sirve de nada. La fuente de verdad es `MiFiBackend/docs`.

| Documento | Para qué se usa acá |
|:--|:--|
| `Wireframes.md` | **El más consultado.** Elementos de cada una de las 17 pantallas |
| `HistoriasUsuario.md` | Criterios de aceptación = las pruebas a escribir |
| `RequerimientosFuncionales.md` | El detalle de cada RF-XX |
| `RequerimientosNoFuncionales.md` | Rendimiento, accesibilidad, cobertura |
| `EspecificacionesCasosUsoCriticos.md` | Flujos alterno y de excepción |
| `DiagramaSecuencias.md` | Orden de las llamadas en un flujo |
| `DiagramaCasosUso.md` | Qué actor puede hacer qué |
| `DiagramaComponentes.md` | Cómo se conectan los componentes técnicos |
| `README.md` | **§6 = registro ADR** (D-01 a D-15) |
| `ESTADO_PROYECTO.md` | Estado del **backend**: qué endpoints existen de verdad |

El contrato se sincroniza aparte: `contracts/openapi.yaml` y los tipos
generados en `src/api/schema.d.ts`.

```bash
npm run sync:upstream   # contrato + paquete de diseño
```

---

## Skills

En `.claude/skills/`. Se cargan solas según la tarea; también se pueden
invocar por nombre.

| Skill | Cuándo |
|:--|:--|
| `mifi-app-flujo-incremental` | Toda sesión, desde el primer mensaje |
| `mifi-app-contexto-diseno` | Antes de implementar: qué documento consultar |
| `mifi-app-arquitectura` | Al escribir código: capas, carpetas, estado |
| `mifi-app-nueva-pantalla` | "Implementá la pantalla X" |
| `mifi-app-sprint` | Abrir, ejecutar y cerrar un sprint |
| `mifi-app-checklist-pr` | Antes del commit final |

---

## Reglas que atraviesan todo

1. **No se inventa.** Lo que no esté documentado se declara como supuesto
   (`// SUPUESTO:`) y se avisa. Nunca en silencio.
2. **Trazabilidad.** Todo código señala su RF/HU/UC de origen.
3. **Nada está listo porque compile.** Las pruebas se corren y las
   pantallas se ven en el simulador.
4. **Los comandos de git los corre el usuario.**
5. **La usabilidad es una variable medida**, no una preferencia.
