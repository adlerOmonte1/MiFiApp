# Estrategia de pruebas — MiFiApp

> El backend tiene 233 pruebas y un umbral de cobertura del 70% sobre
> dominio y aplicación. Este documento fija el equivalente en el cliente,
> que **no es el mismo criterio**: en un frontend, cubrir el 70% de las
> líneas no dice casi nada sobre si la app funciona.

---

## 1. Qué se prueba y qué no

| Capa | Se prueba | Cómo |
|:--|:--|:--|
| `src/services/` | **Sí, siempre** | Contra MSW: rutas, forma del payload, mapeo de errores |
| `src/stores/` | **Sí, siempre** | Unitaria pura, sin renderizar |
| `src/hooks/` | **Sí** | `renderHook` + MSW |
| `src/components/` | Los que tienen lógica | Testing Library |
| `src/app/` (pantallas) | Los criterios de aceptación de la HU | Testing Library |
| `src/api/schema.d.ts` | **No** — es generado | Lo valida el typecheck |
| Estilos y layout | **No** | Verificación visual en simulador |

**Qué NO se prueba, explícitamente:** que un color sea el correcto, que un
margen sea de 16pt, o snapshots de árboles de componentes. Los snapshots en
un frontend con diseño en evolución generan ruido —se actualizan sin
mirarlos— y dan una sensación falsa de cobertura.

---

## 2. La pirámide, en este proyecto

```
        ╱ Verificación visual en simulador ╲     ← manual, cada paso
       ╱   Pruebas de pantalla (criterios   ╲    ← pocas, las que importan
      ╱      de aceptación de la HU)         ╲
     ╱  Hooks y componentes con lógica        ╲  ← medio
    ╱     Servicios y stores                   ╲ ← la base, siempre
   ╱────────────────────────────────────────────╲
```

La verificación en simulador **es parte de la estrategia**, no un extra.
Una pantalla puede tener todas sus pruebas en verde y estar rota: texto
cortado, un botón fuera de la pantalla, la fuente que no cargó. Ningún test
de Testing Library ve eso porque no hay layout real.

---

## 3. Cobertura: por qué el umbral está apagado (hoy)

`jest.config.js` tiene `coverageThreshold` **comentado a propósito**.

Hoy `src/` es andamiaje de `create-expo-app`. Un umbral que falla desde el
primer PR se ignora, y un umbral ignorado no protege nada.

**Se activa en A1**, cuando existan `src/stores/` y `src/services/` — que
es donde vive la lógica que RNF-18 realmente cubre:

```js
coverageThreshold: {
  "./src/stores/**":   { branches: 70, functions: 70, lines: 70, statements: 70 },
  "./src/services/**": { branches: 70, functions: 70, lines: 70, statements: 70 },
}
```

**`src/app/**` queda excluido a propósito.** Son rutas de composición; su
valor se verifica con pruebas de criterio de aceptación, no con un piso de
líneas cubiertas.

---

## 4. MSW: los dobles no pueden mentir

Los handlers viven en `src/test-utils/msw/handlers.ts` y están **tipados
contra el contrato** (`RespuestaOk<...>`). Si el backend cambia la forma de
una respuesta, los dobles **dejan de compilar**.

Eso ataca el problema clásico de los mocks: pruebas en verde contra una API
que ya no existe.

Tres reglas:

1. **`onUnhandledRequest: "error"`.** Una petición sin handler falla la
   prueba. Sin esto, una prueba mal escrita le pega al backend local del
   desarrollador, pasa en su máquina y falla en CI.
2. **`server.resetHandlers()` después de cada prueba**, para que un
   `server.use()` no se filtre a la siguiente.
3. **Un doble responde lo que responde el backend real.** Un handler que
   devuelve `200` donde el backend devuelve `404` hace pasar una prueba que
   miente (sustitución de Liskov aplicada a los dobles).

---

## 5. Qué prueba cada pantalla, como mínimo

De `mifi-app-nueva-pantalla`, y no es negociable:

- [ ] Renderiza los **elementos clave** que exige el wireframe.
- [ ] El **camino feliz** del criterio de aceptación de la HU.
- [ ] **Al menos un camino de error** del RF (validación, 401, 404, red).
- [ ] El **estado vacío**, si la pantalla lista algo.

### Pruebas que este proyecto exige por su naturaleza

| Qué | Por qué |
|:--|:--|
| Un 401 limpia la sesión y lleva al login | El token dura 7 días y se revoca en logout (D-03) |
| Sin consentimiento no se accede a nada financiero | RF-47/49 — es un requisito ético, no una funcionalidad |
| La marca automática de gasto hormiga **no** se puede editar | D-15 — alimenta el indicador de la tesis |
| Un 404 se muestra como "no existe" | D-05 anti-IDOR: no revelar que el recurso es de otro |
| El JWT nunca sale de `expo-secure-store` | RF-06 |

---

## 6. Reglas de escritura

- **`await render(...)`** — Testing Library v14 es asíncrono. Sin el
  `await`, `screen` queda vacío y el error no dice por qué.
- **Consultas por rol o texto visible**, no por `testID`, siempre que se
  pueda: prueban lo que el usuario ve. `testID` es el último recurso.
- **Nombres de prueba en español**, describiendo comportamiento, no
  implementación: *"muestra el saldo del periodo"* ≫ *"llama a
  useTransacciones"*.
- **Pruebas junto al archivo**: `x.ts` + `x.test.ts`.
- **Comparar contra tokens, no contra valores mágicos**:
  `toHaveStyle(TextoVariantes.monto)` en vez de `fontSize: 40`. Así un
  cambio de diseño legítimo no rompe la prueba.

---

## 7. Un fix no está probado hasta que la prueba lo detecta

Regla heredada del backend, donde ya salvó dos veces
(`ConsentimientoController`, `calcularRangoPeriodo`):

> Al corregir un bug, se **reintroduce el bug a propósito** y se confirma
> que la prueba nueva falla. Si no falla, la prueba no está probando lo que
> se cree.

---

## 8. Lo que el CI corre

```bash
npm run lint && npm run format:check && npm run typecheck && npm run test:coverage
```

Más dos pasos propios: generar `expo-env.d.ts` (no está versionado) y
verificar que `schema.d.ts` siga sincronizado con el contrato del backend.

**El CI no corre el simulador.** La verificación visual es humana y queda
registrada en `ESTADO_PROYECTO.md`.

---

## 9. Pendiente

- **Pruebas E2E** (Maestro o Detox): no se adoptan todavía. Se reevalúa
  después de A2, cuando exista un flujo completo que valga la pena
  automatizar de punta a punta.
- **Pruebas de accesibilidad automatizadas**: hoy el contraste se verificó
  a mano (`SistemaDiseno.md §Contraste`). Conviene automatizarlo en F3.
