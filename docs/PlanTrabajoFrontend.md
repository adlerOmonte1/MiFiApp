# Plan de trabajo — MiFiApp (frontend)

> Continúa `MiFiBackend/PlanTrabajo.md` en el cliente móvil. Mismas fases
> ISO/IEC 12207, mismo criterio de "terminado": **cada sprint entrega
> funcionalidad probada, no a medias.**

---

## 0. Regla de dependencia con el backend

**No se construye una pantalla contra un endpoint que no existe.**

Antes de abrir un sprint, se verifica en `docs/upstream/ESTADO_PROYECTO.md`
que los endpoints estén implementados y probados. Si no lo están, hay dos
opciones y se eligen **explícitamente**, nunca por accidente:

- **Esperar** al backend (preferido: evita rehacer).
- **Construir contra MSW** con los dobles tipados del contrato, aceptando
  que habrá una segunda pasada de integración. Se anota como deuda en
  `ESTADO_PROYECTO.md`.

Estado del backend al escribir esto: **Sprints 1, 2 y 3 completos**
(Autenticación, Transacciones, Ahorro).

---

## 1. Estado de las fases

| Fase | Contenido | Estado |
|:--|:--|:--|
| **F0 — Setup** | Repo, Expo, calidad, pruebas, CI, contrato | ✅ Completa |
| **F1 — Diseño** | Sistema de diseño, navegación, estrategia de pruebas | 🔄 En curso |
| **F2 — Desarrollo** | Sprints A1–A6 | ⏳ Pendiente |
| **F3 — QA** | ISO 25010, accesibilidad, SUS piloto | ⏳ Pendiente |
| **F4 — Despliegue** | Build EAS, distribución a participantes | ⏳ Pendiente |

Los sprints del frontend se numeran **A1…A6** (A de *app*) para no
confundirlos con los S1…S6 del backend.

---

## 2. Fase 1 — Diseño (antes de escribir pantallas)

| Paso | Entregable | Estado |
|:--|:--|:--|
| 1.1 | `docs/SistemaDiseno.md` + tokens en `theme.ts` | ✅ |
| 1.2 | `docs/Navegacion.md` — 17 pantallas → rutas y guards | ✅ |
| 1.3 | `docs/EstrategiaPruebas.md` | ✅ |
| 1.4 | `docs/ESTADO_PROYECTO.md` (documento vivo) | ✅ |
| 1.5 | Set de íconos elegido | ⏳ |
| 1.6 | Micro-copys y estados vacíos de los flujos B y D | ⏳ |

**1.5 y 1.6 no bloquean A1**, pero sí bloquean A2 en adelante: la pantalla
06 (registro manual) ya necesita íconos de categoría y textos de error.

---

## 3. Fase 2 — Sprints de desarrollo

El orden **espeja el del backend** (`PlanTrabajo.md §FASE 3`): primero todo
lo crítico, después los aceleradores.

### A1 — Fundaciones y autenticación

**Pantallas:** 01 Onboarding · 02 Consentimiento · 03 Registro · 04 Login
**HU:** AUT-01, AUT-02, CON-01 · **RF:** 01–08, 47–49

| Paso | Entregable |
|:--|:--|
| A1.1 | Componentes base: `Boton`, `Campo`, `Tarjeta`, `EstadoVacio` |
| A1.2 | `sesion.store.ts` (Zustand) + JWT en `expo-secure-store` |
| A1.3 | Interceptores de axios: adjuntar token, manejar 401 |
| A1.4 | Árbol de rutas y **guards** de `docs/Navegacion.md` |
| A1.5 | Pantallas 03 y 04 conectadas a `/auth/registro` y `/auth/login` |
| A1.6 | Pantallas 01 y 02; consentimiento contra `/consentimiento` |

**DoD:** un usuario nuevo se registra, acepta el consentimiento y llega al
dashboard vacío; cierra y reabre la app y **sigue con sesión**; un token
vencido lo devuelve al login. Pruebas del store, de los guards y de las dos
pantallas de formulario. Verificado en simulador contra el backend local.

> A1 es el sprint más pesado y el menos vistoso: casi todo es
> infraestructura que ninguna pantalla posterior vuelve a pagar. No
> conviene recortarlo para "avanzar más rápido".

### A2 — Núcleo: transacciones y dashboard

**Pantallas:** 05 Dashboard · 05b Elegir cómo registrar · 06 Registro
manual · 07 Movimientos
**HU:** TRX-01, TRX-02, DSH-01 · **RF:** 09–15, 40, 41

| Paso | Entregable |
|:--|:--|
| A2.1 | `transacciones.service.ts` + hooks de Query |
| A2.2 | Tab bar de 4 secciones + botón central |
| A2.3 | Pantalla 06 (registro manual) — el flujo más usado de la app |
| A2.4 | Pantalla 07 (lista, agrupada por día, con filtros) |
| A2.5 | Editar y eliminar (TRX-02) |
| A2.6 | Pantalla 05 (dashboard) con las tarjetas del periodo |

**DoD:** registrar, editar y eliminar un movimiento; el dashboard refleja
el cambio sin recargar a mano. **Verificación de tesis:** el sistema
produce el indicador *"N.º de registros por semana"*.

### A3 — Ahorro

**Pantallas:** 12 Metas · 13 Crear meta · **HU:** AHO-01, AHO-02 ·
**RF:** 30–35

**DoD:** crear una meta con y **sin** fecha límite (D-14), ver progreso.
Produce *"monto ahorrado"* y *"% de cumplimiento"*.

### A4 — Categorización y gastos hormiga

**Pantallas:** 14 Categorías · 15 Gastos hormiga · **HU:** CAT-01, CAT-02 ·
**RF:** 36–39, 53–55

⚠️ **El punto delicado del proyecto.** D-15 define **doble marca** de gasto
hormiga: la automática por umbral (RF-38) es **inmutable** y alimenta el
indicador de la tesis; la del estudiante (RF-55) es opcional y **no la
sobrescribe**. La UI tiene que mostrarlas como cosas distintas. Si se
mezclan, se contamina la variable medida.

**DoD:** categorías propias (RF-53/54); pantalla 15 con las dos marcas
diferenciadas. Produce *"N.º de gastos categorizados"* y *"% de gastos
hormiga"*.

> **Checkpoint tras A4** — igual que el backend: acá está todo lo crítico.
> Si el cronograma aprieta, se congelan A5/A6 y se pasa a QA. La tesis ya
> es viable.

### A5 — OCR (acelerador, recortable)

**Pantallas:** 08 Cámara · 09 Confirmar boleta · 10 Cola de sugerencias ·
**HU:** OCR-01, CNF-01 · **RF:** 16–22

Requiere permisos de cámara y los estados de error del OCR (pendiente 1.6).
**Nada se guarda sin confirmación del usuario** (CNF-01).

### A6 — Gmail (acelerador, recortable)

**Pantallas:** 11 Conectar correo · (10 reutilizada) · **HU:** GML-01,
GML-02 · **RF:** 23–25

OAuth con `expo-auth-session` **usando PKCE**: el `client_secret` no puede
vivir en el cliente. Deep link `mifiapp://gmail/callback`.

### A7 — Estudio y perfil

**Pantallas:** 16 Encuesta SUS · 17 Perfil · **HU:** USA-01 ·
**RF:** 42–44, 08, 25

No es opcional: la encuesta SUS **es el instrumento de medición de
usabilidad de la tesis**. Va después de A4 en prioridad real, aunque se
liste al final.

---

## 4. Fase 3 — QA

| Verificación | Cómo | Alimenta |
|:--|:--|:--|
| Cobertura ≥70% en lógica propia | `test:coverage` con umbral activado | RNF-18 |
| Accesibilidad | Contraste WCAG AA, área táctil 44pt, lectores de pantalla | RNF |
| Rendimiento | Tiempo de arranque y de respuesta percibida | RNF |
| Usabilidad | **SUS piloto** con usuarios reales | Indicador de tesis |
| Compatibilidad | Android e iOS, pantallas chicas | ISO 25010 |

---

## 5. Definición de "terminado" (aplica a todo paso)

Un paso no está terminado hasta que:

- [ ] `lint`, `format:check`, `typecheck`, `test:coverage` pasan;
- [ ] hay pruebas del camino feliz **y** de al menos un camino de error;
- [ ] la pantalla resuelve **cargando, error y vacío**;
- [ ] se **vio funcionando en el simulador** (no alcanza con que compile);
- [ ] el código referencia su HU/RF de origen;
- [ ] todo supuesto no documentado está marcado `// SUPUESTO:` y avisado;
- [ ] `docs/ESTADO_PROYECTO.md` quedó actualizado;
- [ ] el CI está verde.

---

## 6. Riesgos identificados

| Riesgo | Impacto | Mitigación |
|:--|:--|:--|
| El contrato casi no declara `required` | Los tipos generados son todos opcionales: la red de seguridad queda a medias | Agregar `required` en el `openapi.yaml` del backend |
| Mezclar las dos marcas de gasto hormiga (D-15) | **Contamina la variable medida de la tesis** | UI explícitamente separada; prueba dedicada en A4 |
| Micro-copys y estados vacíos sin definir | Bloquea A2 en adelante | Paso 1.6 antes de A2 |
| A5/A6 consumen el cronograma | Se llega sin tiempo al piloto | Checkpoint tras A4: son recortables |
| Sin protecciones de rama | El flujo de PR es convención, no garantía | Configurar en GitHub |
