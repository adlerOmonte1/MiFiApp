# Contenido de interfaz — textos, estados y validaciones

> Paso 1.6 del plan. Cierra el pendiente de refinamiento nº 4 de
> `Wireframes.md` ("estados vacíos y micro-copys").
>
> **Los textos de la interfaz son parte del instrumento de medición.** Un
> mensaje de error confuso baja el puntaje SUS igual que un botón que no
> funciona. Por eso se deciden acá, una vez, y no en cada pantalla.

---

## 1. Voz y tono

MiFi le habla a un **estudiante peruano** sobre su propia plata. Cuatro
reglas:

1. **Tuteo, cercano, sin ser infantil.** "Registra tu primer movimiento",
   no "Proceda a registrar su transacción".
2. **Nunca juzgar.** La app muestra gastos hormiga; el estudiante ya sabe
   que gastó de más. "Tus compras chicas suman S/ 87 este mes" ≫ "Estás
   gastando demasiado en cosas innecesarias".
3. **Los errores dicen qué hacer**, no solo qué pasó.
4. **Sin jerga técnica.** Nunca "token", "sesión expirada", "error 500",
   "sincronización fallida".

> **Decisión tomada:** los textos usan **tuteo** ("registra", "toca"),
> que es lo natural en Perú y el registro que esperan los participantes.

---

## 2. Reglas de formato (aplican en toda la app)

| Qué | Formato | Ejemplo |
|:--|:--|:--|
| Monto | `S/ ` + miles con punto + decimales con coma | `S/ 1.234,50` |
| Egreso | Con signo menos y color de texto normal | `− S/ 45,00` |
| Ingreso | Con signo más y color primario | `+ S/ 300,00` |
| Fecha corta | Día y mes abreviado | `13 ago` |
| Fecha con año | Solo si no es el año en curso | `13 ago 2025` |
| Hoy / ayer | Palabra, no fecha | `Hoy`, `Ayer` |
| Hora | 24 h | `14:30` |
| Porcentaje | Sin decimales | `38 %` |

**Un monto nunca se muestra sin `S/`.** El signo distingue ingreso de
egreso de un vistazo, que es lo que el estudiante viene a ver.

---

## 3. Flujo A — Entrada (sprint A1)

### 01 · Onboarding

- **Título:** `Tu plata, siempre clara`
- **Texto:** `Registra tus gastos en segundos y descubre a dónde se va tu
  dinero.`
- **Botón:** `Continuar`

### 02 · Consentimiento informado

- **Título:** `Antes de empezar`
- **Bloques:** `Qué guardamos` · `Para qué` · `Tu control`
- **Checkbox:** `Acepto participar en el estudio y el uso de mis datos
  anónimos`
- **Botón:** `Acepto y continúo` — deshabilitado hasta marcar el checkbox
- **Si intenta salir:** no hay salida. No existe "Ahora no" (RF-49, CA03).

> Se muestra la **fecha y hora** de aceptación al confirmar, porque queda
> registrada (RF-48). El estudiante tiene derecho a ver qué firmó y cuándo.

### 03 · Registro de cuenta

| Campo | Label | Placeholder | Ayuda |
|:--|:--|:--|:--|
| Nombre | `Nombre` | `¿Cómo te llamamos?` | — |
| Correo | `Correo` | `tucorreo@ejemplo.com` | — |
| Contraseña | `Contraseña` | — | `Mínimo 8 caracteres` (visible siempre, no solo al fallar) |

- **Botón:** `Crear cuenta` · **Enlace:** `¿Ya tienes cuenta? Inicia sesión`

**Validaciones** (en el cliente, antes de enviar):

| Caso | Mensaje | Origen |
|:--|:--|:--|
| Nombre vacío | `Ingresa tu nombre` | contrato: `nombre` requerido |
| Correo vacío | `Ingresa tu correo` | — |
| Correo mal formado | `Ese correo no parece válido` | — |
| Contraseña < 8 | `La contraseña necesita al menos 8 caracteres` | RF-03, CA03 |
| Correo ya registrado (409) | `Ese correo ya está registrado. ¿Quieres iniciar sesión?` | RF-02, CA02 |

### 04 · Inicio de sesión

- **Botón:** `Entrar` · **Enlace:** `¿No tienes cuenta? Crea una`
- ~~`¿Olvidaste tu contraseña?`~~ — oculto en v1, ver §8

| Caso | Mensaje | Origen |
|:--|:--|:--|
| Credenciales incorrectas (401) | `Correo o contraseña incorrectos` | AUT-02 **CA02** |
| Cuenta bloqueada (423) | `Demasiados intentos. Espera unos minutos antes de volver a probar.` | RF-07 |
| Sin conexión | `No pudimos conectarnos. Revisa tu internet y toca Reintentar.` | — |

⚠️ **El mensaje de credenciales es genérico a propósito** (CA02): nunca
decir "el correo no existe" ni "la contraseña es incorrecta". Revelar cuál
de los dos falló le confirma a un atacante qué correos están registrados.

⚠️ **El 423 sí muestra un mensaje distinto — decisión consciente.** La
auditoría OWASP del backend registró que responder 423 revela que la cuenta
existe (hallazgo nº 1, Issue abierto). Se eligió igual mostrar un mensaje
propio, porque un usuario legítimamente bloqueado que ve "correo o
contraseña incorrectos" reintenta sin entender y se frustra — y esa
frustración termina en el puntaje SUS. **El arreglo real es del backend**
(no distinguir el estado, o aplicar rate limiting uniforme); la UI no puede
tapar una fuga que ya está en la respuesta HTTP.

> **`¿Olvidaste tu contraseña?` se oculta en v1** (§8). No hay RF de
> recuperación ni ruta en el contrato, y un enlace que no lleva a ningún
> lado es exactamente lo que castiga el SUS.

---

## 4. Flujo B — Núcleo (sprint A2)

### 05 · Dashboard

- **Saludo:** `Hola, {nombre}` · **Toggle:** `Mes` / `Semana`
- **Monto principal:** con etiqueta `Disponible este mes`
- **Tarjetas:** `Ingresos` · `Egresos` · `Ahorro` · `% Hormiga`
- **Lista:** `Últimos movimientos` + enlace `Ver todo`

**Estado vacío** (usuario nuevo — la primera pantalla real que ve):

> **Título:** `Todavía no hay movimientos`
> **Texto:** `Registra tu primer gasto o ingreso y vas a ver aquí el resumen
> de tu mes.`
> **Botón:** `Registrar movimiento`

Es el estado vacío más importante de la app: es lo que ve un participante
recién inscrito. Si no lo invita a registrar, no genera el dato que la
tesis mide.

### 05b · Elegir cómo registrar

- **Título:** `¿Cómo quieres registrarlo?`
- **Opciones:** `Manual` (`Escribe el monto`) · `Escanear boleta` (`La
  cámara lee el monto`) · `Desde mi correo` (`{n} por confirmar`)

### 06 · Registrar transacción manual

- **Selector:** `Egreso` / `Ingreso` · **Botón:** `Guardar`
- **Categorías:** `Comida` · `Pasaje` · `Estudio` · `Ocio` · `···Más`

| Caso | Mensaje |
|:--|:--|
| Monto vacío o cero | `Ingresa un monto mayor a cero` |
| Sin categoría | `Elige una categoría` |
| Fecha futura | `No puedes registrar un movimiento con fecha futura` |
| Falla al guardar | `No pudimos guardar el movimiento. Toca Reintentar.` |

**Confirmación al guardar:** `Movimiento guardado` (breve, no bloqueante).

### 07 · Movimientos

- **Buscador:** `Buscar movimiento`
- **Agrupación:** por día, con subtotal
- **Origen de cada ítem:** `Manual` · `Boleta` · `Correo`

**Vacíos:**
- Sin movimientos: `Aquí van a aparecer tus movimientos` / `Registra el
  primero para empezar.`
- Sin resultados de búsqueda: `Sin resultados para "{búsqueda}"` / `Prueba
  con otra palabra o cambia el mes.`

**Eliminar** (TRX-02) pide confirmación: `¿Eliminar este movimiento?` /
`Esta acción no se puede deshacer.` → `Eliminar` / `Cancelar`.

---

## 5. Flujo D — Ahorro y análisis (sprints A3 y A4)

### 12 · Metas de ahorro

- **Resumen:** `% ahorrado en total` · **Sin fecha:** `Sin fecha límite` (D-14)
- **Vacío:** `Todavía no tienes metas` / `Pon un objetivo y mira cómo vas
  avanzando.` → `Crear meta`

### 13 · Crear meta

- **Campos:** `¿Cuánto quieres ahorrar?` · `¿Para qué es?` ·
  `Fecha límite (opcional)` con atajos `3 meses` / `5 meses` / `1 año`
- **Proyección:** `Ahorrando S/ {x} por semana llegas el {fecha}`
- **Errores:** `Ingresa un monto mayor a cero` · `Pon un nombre a tu meta`
  · `La fecha límite tiene que ser futura` (RF-31)

### 14 · Categorías

- **Vacío:** `Sin gastos este periodo` / `Cuando registres egresos, vas a
  ver aquí en qué se te va la plata.`

### 15 · Gastos hormiga ⚠️

La pantalla más delicada del proyecto (D-15). **Dos marcas distintas que
la UI no puede mezclar:**

| Marca | Texto | Editable |
|:--|:--|:--|
| Automática (RF-38) | `Detectado por monto` | **No** |
| Del estudiante (RF-55) | `Tú lo marcaste` | Sí |

- **Título del dato:** `{n} % de tus egresos fueron compras chicas`
- **Equivalencia:** `Es como {x} semanas de tu meta` — motivacional, no
  culposa
- **CTA:** `Ponerle un límite semanal`
- **Si el estudiante intenta editar la automática:**
  `Esta marca es automática: se aplica a todo gasto menor a S/ {umbral}.
  Puedes agregar tu propia marca aparte.`
- **Vacío:** `No detectamos compras chicas este periodo` / `Se marcan
  automáticamente los gastos menores a S/ {umbral}.`

---

## 6. Mensajes del sistema (toda la app)

| Situación | Mensaje | Acción |
|:--|:--|:--|
| Sin conexión | `Sin conexión. Revisa tu internet.` | `Reintentar` |
| Servidor caído (5xx) | `Algo falló de nuestro lado. Prueba de nuevo en unos minutos.` | `Reintentar` |
| Sesión vencida (401) | `Tu sesión terminó. Inicia sesión de nuevo.` | va a login |
| Recurso inexistente (404) | `No encontramos lo que buscabas.` | volver |
| Carga | Esqueleto de la pantalla, **no** un spinner a pantalla completa | — |

⚠️ **El 404 dice "no encontramos", nunca "no tienes permiso".** El backend
responde 404 también cuando el recurso es de otro usuario (D-05, anti-IDOR)
justamente para no revelar que existe. Si la UI dijera "sin permiso",
anularía esa protección.

⚠️ **Nunca mostrar el mensaje crudo del servidor.** Se mapea a estos
textos. Un `ErrorResponse` puede traer detalle técnico que no le sirve al
estudiante y puede filtrar información.

---

## 7. Accesibilidad de los textos

- Todo campo tiene **label visible**, no solo placeholder: el placeholder
  desaparece al escribir y deja al usuario sin referencia.
- Los mensajes de error se anuncian a lectores de pantalla
  (`accessibilityLiveRegion`), no solo se pintan en rojo.
- **El color nunca es el único portador de significado**: ingreso/egreso
  llevan signo `+`/`−` además del color, para daltonismo.
- Los íconos sin texto llevan `accessibilityLabel`.

---

## 8. Decisiones tomadas antes de A1

| # | Decisión | Resolución |
|:--|:--|:--|
| 1 | Voseo o tuteo | **Tuteo.** Es el registro natural en Perú. Aplicado en todo este documento. |
| 2 | `¿Olvidaste tu contraseña?` | **Se oculta en v1.** No hay RF ni endpoint; un enlace que no lleva a ningún lado es exactamente lo que castiga el SUS. Se reevalúa si el backend agrega recuperación. |
| 3 | Campo `nombre` en el registro | **Se agrega.** El contrato lo exige (`nombre` requerido en `/auth/registro`) y el dashboard lo usa en el saludo. Corregir `Wireframes.md` en el backend. |
| 4 | Mensaje del 423 en login | **Mensaje propio**, aun sabiendo que mantiene visible la fuga del backend. Ver la advertencia en §3. |
| 5 | Tras el registro, ¿dashboard o consentimiento? | **Consentimiento.** Lo resuelve el contrato, no la interpretación: el `201` de `/auth/registro` dice que el acceso financiero queda bloqueado hasta aceptar (RF-49). |

### ⚠️ Corrección pendiente en el paquete de diseño (backend)

**AUT-01 CA01** dice que tras registrarse *"el sistema crea la cuenta y lo
redirige al **dashboard principal**"*, lo que contradice a **RF-47**,
**RF-49** y al propio contrato OpenAPI. El criterio de aceptación se
redactó sin considerar CON-01 y **hay que corregirlo en
`HistoriasUsuario.md` del backend** — el frontend ya sigue lo correcto.

El texto del consentimiento está en
[`TextoConsentimiento.md`](TextoConsentimiento.md) — **borrador sin
aprobar**.
