---
name: mifi-app-nueva-pantalla
description: Procedimiento paso a paso para agregar una pantalla o funcionalidad al frontend de MiFi, desde el wireframe y la HU hasta las pruebas y la verificación en el simulador, garantizando trazabilidad HU/RF y que el contrato de la API esté sincronizado. Úsalo cuando la tarea sea "implementá la pantalla X", "agregá la ruta Y", "conectá esta vista con el endpoint Z" o "hacé el formulario de W".
metadata:
  version: "1.0.0"
  proyecto: MiFi
  repo: MiFiApp
---

# Agregar una pantalla a MiFiApp

Orden fijo. Cada paso produce algo verificable; no se saltan pasos ni se
escriben dos a la vez.

## 0. Antes de tocar código: confirmar que se puede construir

- [ ] Buscá la pantalla en `docs/upstream/Wireframes.md` (nº y flujo A–E).
      Anotá sus **elementos clave** y los códigos HU/RF de la última
      columna.
- [ ] Leé la HU en `docs/upstream/HistoriasUsuario.md` — de ahí salen los
      **criterios de aceptación**, que son las pruebas que vas a escribir.
- [ ] Leé cada RF en `docs/upstream/RequerimientosFuncionales.md`.
- [ ] Si es un caso crítico, leé su flujo alterno y de excepción en
      `docs/upstream/EspecificacionesCasosUsoCriticos.md`. **Los caminos de
      error son parte de la pantalla**, no un extra.
- [ ] **Confirmá que el endpoint existe de verdad**: buscalo en
      `src/api/schema.d.ts` y verificá su estado en
      `docs/upstream/ESTADO_PROYECTO.md`. Si el backend no lo tiene
      implementado, decilo antes de empezar — se puede construir la UI
      contra MSW, pero eso se acuerda explícitamente, no se descubre al
      final.

Si algo de esto no está documentado, **pará y preguntá**. Ver
`mifi-app-contexto-diseno §Lo que la documentación NO dice`.

## 1. El servicio (`src/services/`)

Un archivo por recurso (`transacciones.service.ts`). Tipado **desde el
contrato**, nunca con interfaces escritas a mano:

```ts
import type { CuerpoPeticion, RespuestaOk } from "@/api/tipos";
```

Acá muere todo lo que sea HTTP: rutas, códigos de estado, forma de la
respuesta. Hacia arriba salen objetos de dominio y errores tipados.

## 2. El hook (`src/hooks/`)

`useQuery` para leer, `useMutation` para escribir. Acá van las
`queryKey`, la invalidación tras una mutación y los estados de carga/error.
Una pantalla no debería tener que pensar en caché.

## 3. La pantalla (`src/app/`)

El archivo **es** la ruta (expo-router). **La ruta exacta y su zona
(pública / compuerta / privada) están decididas en `docs/Navegacion.md`**:
no inventes una ruta nueva ni agregues comprobaciones de sesión en la
pantalla — los guards viven en el layout de la zona, una sola vez.

Solo composición: llama al hook, reparte props a componentes. Si aparece un
`axios` o un `fetch` acá, algo se saltó una capa.

Colores, tipografía y espaciados salen de `docs/SistemaDiseno.md` (y ESLint
rechaza los literales).

Los tres estados son obligatorios, no opcionales:

- **Cargando** — nunca una pantalla en blanco.
- **Error** — mensaje accionable, con reintento.
- **Vacío** — los estados vacíos son un pendiente reconocido de
  `Wireframes.md`; proponé el micro-copy y marcalo como supuesto.

## 4. Los componentes (`src/components/`)

Solo si el elemento se reusa o la pantalla se volvió ilegible. No abstraigas
por adelantado. Un componente recibe props y no conoce servicios ni rutas.

`testID` en todo lo interactivo; `accessibilityLabel` donde el texto visible
no alcance.

## 5. Las pruebas (mismo commit)

Colocadas junto al archivo. Como mínimo, por cada pantalla:

- [ ] Renderiza los elementos clave que exige el wireframe.
- [ ] El camino feliz del criterio de aceptación de la HU.
- [ ] **Al menos un camino de error** del RF (validación, 401, 404, red).
- [ ] Estado vacío, si la pantalla lista algo.

Recordá: **`await render(...)`** — en Testing Library v14 es asíncrono.
Los dobles de la API van en `src/test-utils/msw/handlers.ts`, tipados
contra el contrato; una prueba puntual sobrescribe con `server.use(...)`.

## 6. Verificación práctica (no negociable)

```bash
npm run lint && npm run format:check && npm run typecheck && npm run test:coverage
```

Y además, **ver la pantalla corriendo**:

```bash
npx expo start --ios
```

Una pantalla no está lista porque los tests pasan. Está lista cuando se la
vio funcionar. Si tocaste el `.env`, reiniciá Metro: las variables
`EXPO_PUBLIC_` se leen al arrancar.

## 7. Cierre

- [ ] ¿El código referencia su HU/RF de origen en comentarios?
- [ ] ¿Algún supuesto que no estaba en la documentación quedó marcado con
      `// SUPUESTO:` **y** avisado al usuario?
- [ ] Cargá `mifi-app-checklist-pr` antes del commit final.
- [ ] Dale al usuario los comandos de git exactos, agrupados por tipo de
      cambio. **El usuario los corre, no vos.**
