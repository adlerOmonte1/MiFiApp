---
name: mifi-app-flujo-incremental
description: Metodología de trabajo del frontend de MiFi (MiFiApp) — "vibe coding supervisado", código generado por IA pero validado en cada paso contra pruebas reales, la app corriendo en simulador y los documentos de diseño. Úsala en CUALQUIER sesión de desarrollo de MiFiApp, desde el primer mensaje — define cómo se trabaja, no qué se construye (para eso están mifi-app-contexto-diseno, mifi-app-arquitectura, mifi-app-nueva-pantalla, mifi-app-checklist-pr). Se activa siempre que el usuario pida seguir desarrollando, retomar el proyecto, o pregunte "en qué paso estamos".
metadata:
  version: "1.0.0"
  proyecto: MiFi
  repo: MiFiApp
---

# Metodología de MiFiApp — vibe coding supervisado

Es la misma metodología de `mifi-flujo-incremental` en MiFiBackend,
adaptada a lo que cambia en un cliente móvil. Si trabajás en los dos repos,
las reglas de fondo son idénticas.

## Lo primero, en cualquier sesión nueva

1. Leé **`docs/ESTADO_PROYECTO.md`** de este repo — en qué paso quedamos.
   Si no existe todavía, creálo al cerrar la primera sesión de desarrollo.
2. Leé **`docs/upstream/ESTADO_PROYECTO.md`** — el estado del backend. Dice
   qué endpoints están realmente implementados. No sirve construir una
   pantalla contra un endpoint que todavía no existe.
3. Corré `git status` y `git log --oneline -8` — confirmá que el repo
   coincide con lo que dicen esos documentos. Si no coincide, avisá antes
   de seguir.
4. Cargá `mifi-app-contexto-diseno` para saber qué documento consultar.

## Qué significa "supervisado" acá

Cada afirmación se **demuestra**, no se asume. Lo que cambia respecto al
backend es *contra qué* se demuestra:

| Backend | Frontend |
|:--|:--|
| Tests + Supabase real | Tests + **la app corriendo en el simulador** |
| `curl` contra el endpoint | MSW para el caso de prueba, y una corrida real contra el backend local antes de cerrar la funcionalidad |

- Una pantalla no está "lista" hasta que se **vio funcionando** en el
  simulador, no porque compile y los tests pasen.
- Un fix de un bug no está probado hasta que se reintrodujo el bug a
  propósito y se confirmó que el test lo detecta.
- Si algo no está en los documentos de diseño, no se inventa: se declara
  como supuesto explícito (comentario + aviso al usuario) o se pregunta.
  Esto pega fuerte en frontend, donde `Wireframes.md` define *qué*
  elementos van en cada pantalla pero **no** cómo se ven. Ver
  `mifi-app-contexto-diseno §Lo que la documentación NO dice`.

## El ritmo: pasos chicos, comprobables, uno a la vez

1. **Revisar dependencias antes de escribir** — qué HU/RF exige esto, qué
   componentes/hooks/tipos ya existen para reusar. No asumir: `grep`/leer.
2. **Escribir el código**, con comentarios que referencien el RF/HU/UC/D-
   de origen. Nunca código sin trazabilidad.
3. **Escribir las pruebas en el mismo commit**, colocadas junto al archivo
   (`Componente.tsx` + `Componente.test.tsx`).
4. **Correr el pipeline**: `npm run lint && npm run format:check &&
   npm run typecheck && npm run test:coverage`. Son los cuatro del CI.
5. **Verificación visual**: levantar la app y ver la pantalla. Un
   screenshot del simulador vale más que "debería renderizar bien".
6. **Chequear dependencias del commit** — `grep "^import"` de cada archivo
   nuevo: ¿todo lo que usa ya está commiteado o va en el mismo commit?
   Ojo con los `.d.ts` y con `src/api/schema.d.ts`, que nadie importa
   explícitamente pero TypeScript necesita.
7. **Dar los comandos de git exactos**, agrupados por qué es cada cosa
   (fix separado de feature separado de docs). **El usuario corre los
   comandos, no vos** — decisión explícita del proyecto, para que el
   usuario controle su propio historial.
8. Si aparece un bug o un hueco real (no hipotético), se corrige ahí mismo
   con transparencia, en su propio commit separado.

## Trampas propias de este stack (ya costaron tiempo)

Están documentadas en detalle en `docs/GUIA_INSTALACION.MD §6`. Las que
más reaparecen al escribir pruebas:

- **`render` de Testing Library v14 es asíncrono.** Sin `await`, `screen`
  queda vacío y el error dice "`render` function has not been called".
- **Declarar `moduleNameMapper` en `jest.config.js` REEMPLAZA el del
  preset**, no lo fusiona. Hay que hacer spread de
  `presetExpo.moduleNameMapper`.
- **Las variables `EXPO_PUBLIC_` se leen al arrancar Metro.** Después de
  tocar `.env` hay que reiniciar; no hay recarga en caliente.
- **`npx expo start --clear`** cuando algo raro persiste entre ramas.

## Seguridad en el cliente, siempre presente

- El **JWT va en `expo-secure-store`** (llavero del sistema), nunca en
  AsyncStorage ni en estado plano — es texto plano y el token dura 7 días.
- **Nada sensible en `EXPO_PUBLIC_`**: se inyecta en texto plano en el
  bundle. Cualquiera que baje el `.apk` lo lee.
- El cliente **no decide autorización**: esconder un botón no es
  seguridad. El backend valida propiedad del recurso (D-05, anti-IDOR). La
  UI oculta lo que no corresponde por usabilidad, no por control de acceso.
- Nunca loguear el token ni datos financieros del usuario en consola,
  tampoco en desarrollo.

## Actualizar `docs/ESTADO_PROYECTO.md`

Antes de cerrar una sesión larga o al migrar a un chat nuevo: en qué paso
se quedó, decisiones nuevas, deuda técnica encontrada. Es lo que permite
retomar con contexto cero.
