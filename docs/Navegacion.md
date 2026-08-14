# Mapa de navegación — MiFiApp

> Traduce las **17 pantallas** de `docs/upstream/Wireframes.md` al árbol de
> rutas de expo-router, y fija las reglas de acceso.
>
> Se decide una vez acá, o se paga en cada pantalla.

---

## 1. Por qué este documento existe

`Wireframes.md` lista pantallas agrupadas en flujos A–E, pero **no dice**:

- qué pantalla es una pestaña y cuál es una pantalla apilada;
- qué pasa si un usuario sin sesión abre un enlace profundo a una pantalla
  privada;
- **dónde se aplica la compuerta de consentimiento** (RF-47 a RF-49).

Ese último punto es el que más importa: el consentimiento no es un aviso
que se muestra una vez, es una **condición de acceso** a toda la parte
financiera de la app. Si se resuelve pantalla por pantalla, en algún
momento se olvida en una y el dato queda recolectado sin autorización — un
problema ético en una investigación con personas, no solo un bug.

---

## 2. Las tres zonas de la app

```
┌─ pública ──────────── sin sesión ─────────────────────────┐
│ 01 Onboarding · 03 Registro · 04 Login                     │
└────────────────────────────────────────────────────────────┘
                          ↓ token válido
┌─ compuerta ──────── con sesión, sin consentimiento ───────┐
│ 02 Consentimiento  ← ÚNICA pantalla accesible acá          │
└────────────────────────────────────────────────────────────┘
                          ↓ consentimientoAceptado = true
┌─ privada ────── con sesión Y consentimiento ──────────────┐
│ las 13 pantallas restantes                                 │
└────────────────────────────────────────────────────────────┘
```

**La regla:** la compuerta se aplica **una sola vez**, en el layout de la
zona privada. Ninguna pantalla individual comprueba sesión ni
consentimiento. Es el mismo principio que el middleware de auth del
backend: si cada controller validara por su cuenta, tarde o temprano uno se
olvida.

---

## 3. Árbol de rutas

```
src/app/
├── _layout.tsx                   raíz: fuentes, providers, redirección inicial
│
├── (publico)/
│   ├── _layout.tsx               si YA hay sesión → redirige a la app
│   ├── onboarding.tsx            01  Onboarding
│   ├── registro.tsx              03  Registro de cuenta          AUT-01
│   └── login.tsx                 04  Inicio de sesión            AUT-02
│
├── consentimiento.tsx            02  Consentimiento informado    CON-01
│                                     (fuera de grupos: es la compuerta)
│
└── (privado)/
    ├── _layout.tsx               GUARD: sesión + consentimiento
    │
    ├── (tabs)/
    │   ├── _layout.tsx           tab bar 4 + botón central
    │   ├── index.tsx             05  Dashboard          tab 1   DSH-01
    │   ├── movimientos.tsx       07  Movimientos        tab 2   TRX-01/02
    │   ├── metas.tsx             12  Metas de ahorro    tab 3   AHO-01/02
    │   └── perfil.tsx            17  Perfil             tab 4
    │
    ├── registrar/
    │   ├── index.tsx             05b Elegir cómo registrar  (hoja modal)
    │   ├── manual.tsx            06  Registro manual         TRX-01
    │   ├── escanear.tsx          08  Cámara                  OCR-01
    │   └── confirmar-boleta.tsx  09  Confirmar OCR           OCR-01/CNF-01
    │
    ├── sugerencias.tsx           10  Cola por confirmar      CNF-01
    ├── conectar-correo.tsx       11  Conectar Gmail          GML-01
    ├── metas/nueva.tsx           13  Crear meta              AHO-01
    ├── categorias.tsx            14  Resumen por categoría   CAT-01
    ├── gastos-hormiga.tsx        15  Gastos hormiga          CAT-02
    └── encuesta-sus.tsx          16  Encuesta SUS            USA-01
```

**Las 17 están cubiertas.** (05b cuenta aparte de 05; total 18 archivos de
pantalla para 17 entradas del wireframe.)

### Por qué `consentimiento.tsx` queda fuera de los grupos

Si viviera dentro de `(privado)`, su propio guard la bloquearía: el usuario
no tiene consentimiento todavía, que es justamente lo que va a dar. Y si
viviera en `(publico)`, sería accesible sin sesión, y el consentimiento
tiene que quedar **atado a un usuario identificable** para ser auditable
(RF-48). Es un estado intermedio y necesita su propio lugar.

---

## 4. Tab bar

Cuatro secciones y un botón central flotante (66pt, verde, sombra teñida —
`BotonCentral` y `Sombras.botonCentral` en el tema):

| Tab | Ruta | Pantalla |
|:--|:--|:--|
| Inicio | `/` | 05 Dashboard |
| Movimientos | `/movimientos` | 07 |
| **＋ central** | `/registrar` | 05b (abre hoja modal) |
| Metas | `/metas` | 12 |
| Perfil | `/perfil` | 17 |

El botón central **no es una pestaña**: no tiene estado seleccionado, abre
una hoja modal sobre la pantalla actual. Registrar un movimiento es la
acción más frecuente de la app (es el dato que alimenta el indicador
"N.º de registros/semana" de la tesis), así que tiene el lugar más
alcanzable con el pulgar.

Pantallas como 14 (categorías), 15 (gastos hormiga) y 16 (encuesta) **no
tienen pestaña propia**: se llega a ellas desde el dashboard o el perfil.
Es deliberado — el wireframe pide máximo 3–4 acciones visibles por
pantalla, y cinco pestañas ya se sienten un tablero de control.

---

## 5. Reglas de acceso (implementadas una sola vez)

| Situación | Resultado |
|:--|:--|
| Sin sesión, abre ruta privada | → `/onboarding` |
| Sin sesión, abre ruta pública | queda donde está |
| Con sesión, sin consentimiento, **cualquier** ruta privada | → `/consentimiento` |
| Con sesión, sin consentimiento, abre `/login` o `/registro` | → `/consentimiento` |
| Con sesión y consentimiento, abre `/login` | → `/` (dashboard) |
| Token vencido o revocado (401) | limpiar sesión → `/login` |

**El 401 se maneja en el interceptor de axios, no en cada pantalla.** El
token dura 7 días (RF-06) y el logout lo revoca del lado del servidor
(D-03), así que un token puede volverse inválido mientras la app está
abierta. Un 401 nunca se ignora en silencio.

### Estado de arranque

Al abrir la app hay un instante en que **todavía no se sabe** si hay
sesión: leer el token de `expo-secure-store` es asíncrono. Ese estado es
`desconocido` y **no** es lo mismo que "sin sesión".

Si se tratan igual, la app parpadea el login por un instante y después
salta al dashboard — se ve roto y, peor, en un test SUS un participante lo
reporta como error. Durante `desconocido` se mantiene el splash.

---

## 6. Convenciones

- **Rutas en español, en minúsculas y con guion medio**
  (`/gastos-hormiga`, `/conectar-correo`). Coherente con el idioma de
  dominio del proyecto.
- **`typedRoutes` está activo** (`app.json`), así que las rutas se
  verifican en compilación: un enlace a una ruta inexistente no compila.
- **Los grupos `(publico)` y `(privado)` no aparecen en la URL**: sirven
  para colgar layouts con guards, no para la jerarquía visible.
- **Volver atrás nunca debe devolver a una pantalla ya inválida**: después
  de iniciar sesión, el botón atrás no puede volver al login. Se usa
  `router.replace`, no `router.push`, en toda transición de autenticación.

---

## 7. Enlaces profundos (deep links)

El esquema es `mifiapp://` (`app.json`). Hay uno **obligatorio**:

- `mifiapp://gmail/callback` — retorno del OAuth de Gmail (GML-01,
  RF-23). Sin esto, el flujo de `expo-auth-session` no puede volver a la
  app.

Todo enlace profundo entra por las mismas reglas de acceso del §5: un
enlace a una pantalla privada sin sesión redirige, no la abre.

---

## 8. Pendientes

1. **Íconos del tab bar** — el mockup usa placeholders geométricos.
2. **Transiciones**: decidir cuáles son modales (hoja) y cuáles apiladas.
   Provisional: `registrar/*` y `metas/nueva` como hoja modal; el resto
   apiladas.
3. **Comportamiento del botón atrás de Android** en la cámara (08) y en la
   encuesta (16), donde salir a mitad puede perder trabajo.
4. **Persistencia de la encuesta SUS** (16): si el estudiante sale en la
   pregunta 6 de 10, ¿se guarda el progreso? Afecta la tasa de respuesta,
   que es un dato de la tesis.
