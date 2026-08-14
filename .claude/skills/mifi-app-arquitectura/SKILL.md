---
name: mifi-app-arquitectura
description: Arquitectura en capas del frontend de MiFi (Expo SDK 57 + expo-router + TypeScript + Zustand + TanStack Query), estructura de carpetas y aplicación de SOLID en un cliente móvil. Úsalo al escribir o revisar pantallas, componentes, hooks, stores o servicios de API, y siempre que la pregunta sea "en qué carpeta va esto", "cómo conecto esta pantalla con la API", "dónde guardo este estado" o cualquier código nuevo de MiFiApp.
metadata:
  version: "1.0.0"
  proyecto: MiFi
  repo: MiFiApp
---

# Arquitectura de MiFiApp

Cuatro capas, con las dependencias apuntando siempre hacia adentro. Es la
misma idea que el backend (`mifi-arquitectura-solid`), traducida a un
cliente móvil:

```
src/app/         Rutas de expo-router — COMPOSICIÓN, sin lógica de negocio
   └─ src/hooks/      Estado de servidor (TanStack Query) y lógica de pantalla
        └─ src/services/   Un módulo por recurso: traduce dominio <-> HTTP
             └─ src/api/        Cliente axios + tipos generados del contrato
src/components/  UI pura y reutilizable — NO conoce servicios ni rutas
src/stores/      Estado global de cliente (Zustand): sesión, preferencias
```

## Estructura de carpetas

```
src/
  api/            client.ts (axios), schema.d.ts (GENERADO), tipos.ts
  app/            rutas de expo-router; el archivo ES la ruta
  components/     UI reutilizable
    ui/           primitivos (botón, campo, tarjeta)
  constants/      theme.ts
  hooks/          use-*.ts — un hook por caso de uso de pantalla
  services/       *.service.ts — un archivo por recurso de la API
  stores/         *.store.ts — Zustand
  test-utils/     css-mock.js, msw/ (server.ts, handlers.ts)
```

## Reglas de dependencia (las que importan)

1. **`src/app/` no llama a `services/` ni a `axios` directamente.** Una
   pantalla usa un hook. Si una pantalla importa un `.service`, está
   mezclando capas.
2. **`src/components/` no importa de `services/`, `stores/` ni `app/`.**
   Un componente recibe datos y callbacks por props. Así se puede probar
   sin montar la app entera y se reusa entre pantallas.
3. **Solo `src/services/` conoce la forma HTTP.** Los códigos de estado, el
   `data.data`, los headers: eso muere ahí. Hacia arriba viajan objetos de
   dominio y errores tipados, nunca un `AxiosError` crudo.
4. **`src/api/schema.d.ts` es generado. NUNCA se edita a mano.** Si un tipo
   está mal, se arregla el `openapi.yaml` del backend y se corre
   `npm run sync:contract`.

## Estado: cuál usar para qué

Es la decisión que más se equivoca. La regla corta:

| Tipo de estado | Herramienta | Ejemplos |
|:--|:--|:--|
| **De servidor** (vive en el backend, se cachea) | **TanStack Query** | transacciones, metas, dashboard, categorías |
| **De cliente** (solo existe en el dispositivo) | **Zustand** | sesión/JWT, preferencias, borrador de formulario |
| **De un componente** | `useState` | si un acordeón está abierto |

No guardes en Zustand lo que viene del backend: se desincroniza y hay que
inventar la invalidación que Query ya trae resuelta.

## SOLID, aplicado a este cliente

| Principio | Cómo se ve acá |
|:--|:--|
| **S — Responsabilidad única** | Una pantalla compone; un hook orquesta; un servicio habla HTTP; un componente pinta. Si un archivo hace `axios.post` **y** renderiza, hay dos responsabilidades. |
| **O — Abierto/cerrado** | Agregar un método de registro de transacción (manual, OCR, correo — TRX-01/OCR-01/GML-02) debería ser un módulo nuevo, no un `if` más en el componente existente. |
| **L — Sustitución de Liskov** | Los handlers de MSW deben responder lo mismo que el backend real. Un doble que "funciona distinto" hace pasar pruebas que mienten. |
| **I — Segregación de interfaces** | Props chicas y específicas. Pasar el objeto `Usuario` entero a un componente que solo muestra el nombre lo ata a un tipo que no necesita. |
| **D — Inversión de dependencias** | Los componentes dependen de props y hooks, nunca de `axios` ni de `expo-secure-store` directamente. Eso es lo que permite probarlos sin red ni llavero. |

## Convenciones de este repo

- **Nombres de archivo en kebab-case** (`themed-text.tsx`,
  `use-color-scheme.ts`) — es lo que ya usa el andamiaje; respetalo.
- **Pruebas colocadas junto al archivo**: `client.ts` + `client.test.ts`.
- **Alias `@/`** apunta a `src/`. Usalo en vez de `../../..`.
- **Español para el dominio** (`transaccion`, `metaAhorro`,
  `calcularProgreso`), inglés para las APIs del ecosistema.
- **`testID` en todo elemento interactivo** que una prueba deba encontrar,
  y `accessibilityLabel` donde el texto visible no alcance — RNF de
  accesibilidad, y además es lo que hace las pruebas legibles.

## Seguridad en el cliente

- **JWT en `expo-secure-store`**, nunca en AsyncStorage ni en un store
  plano. Dura 7 días (RF-06).
- El interceptor de axios adjunta el token; si vuelve **401**, se limpia la
  sesión y se navega al login. Un 401 nunca se ignora en silencio.
- **404 = "no existe"** para la UI. El backend responde 404 también cuando
  el recurso es de otro usuario (D-05, anti-IDOR): no lo trates como error
  raro ni muestres "no tenés permiso".
- Esconder un botón **no es** control de acceso; es usabilidad. La
  autorización la hace el backend, siempre.

## Antes de escribir código

Cargá `mifi-app-contexto-diseno` para saber qué HU/RF origina lo que vas a
construir, y `mifi-app-nueva-pantalla` si estás agregando una pantalla.
