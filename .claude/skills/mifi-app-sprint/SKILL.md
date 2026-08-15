---
name: mifi-app-sprint
description: Procedimiento para abrir, ejecutar y cerrar un sprint del frontend de MiFi (A1 a A7) — verificar que el backend tenga los endpoints, dividir en pasos numerados y comprobables, y cerrar con la definición de terminado y el estado actualizado. Úsalo cuando el usuario diga "arranquemos el sprint X", "seguimos con A2", "en qué paso estamos", "cerremos este sprint" o pida planificar el trabajo de una funcionalidad completa.
metadata:
  version: "1.0.0"
  proyecto: MiFi
  repo: MiFiApp
---

# Ejecutar un sprint en MiFiApp

Los sprints y sus entregables están en `docs/PlanTrabajoFrontend.md §3`.
Esta skill es **cómo se ejecutan**, no qué contienen.

## 1. Abrir un sprint — antes de escribir una línea

- [ ] Leé `docs/ESTADO_PROYECTO.md` §2: ¿es realmente el sprint que sigue?
- [ ] Leé la sección del sprint en `docs/PlanTrabajoFrontend.md`: pantallas,
      HU, RF y pasos.
- [ ] **Verificá que el backend tenga los endpoints.** Buscalos en
      `src/api/schema.d.ts` y confirmá su estado en
      `docs/upstream/ESTADO_PROYECTO.md`.

      Si no están implementados, **pará y planteá la decisión** (§0 del
      plan): esperar al backend, o construir contra MSW aceptando una
      segunda pasada de integración. Es del usuario, no tuya. Nunca se
      descubre al final del sprint.

- [ ] Leé las HU involucradas: sus **criterios de aceptación son las
      pruebas** que vas a escribir. Si una HU no tiene criterios claros,
      preguntá antes de empezar.
- [ ] Revisá si el sprint depende de un paso pendiente de Fase 1
      (íconos, micro-copys). A2 en adelante los necesita.
- [ ] Confirmá `git status` limpio y rama nueva `feature/aN-<nombre>`.

**Salida de este paso:** una lista de pasos numerados (A2.1, A2.2…) con lo
que entrega cada uno, acordada con el usuario **antes** de codificar.

## 2. Ejecutar — un paso por vez

Para cada paso, el ciclo de `mifi-app-flujo-incremental`:

1. Revisar dependencias (qué existe ya para reusar).
2. Escribir el código, con trazabilidad al RF/HU.
3. Escribir las pruebas **en el mismo commit**.
4. Correr el pipeline completo.
5. **Ver el resultado en el simulador.**
6. Chequear que el commit lleve todo lo que necesita.
7. Dar los comandos de git al usuario.

**Nunca dos pasos a la vez.** Si un paso se está volviendo enorme,
partilo — que un paso no se pueda verificar solo es señal de que son dos.

### Si aparece algo fuera de alcance

- **Un bug real:** se corrige ahí mismo, en un commit separado, y se avisa.
- **Una mejora o un hueco no bloqueante:** se anota en la deuda técnica de
  `ESTADO_PROYECTO.md §8`. No se arregla en el medio del sprint.
- **Una decisión de producto no documentada:** se plantea al usuario. No se
  inventa.

## 3. Cerrar el sprint

No está cerrado hasta que **todos** sus pasos cumplen la DoD de
`PlanTrabajoFrontend.md §5`:

- [ ] Pipeline en verde (`lint`, `format:check`, `typecheck`,
      `test:coverage`).
- [ ] Cada pantalla resuelve **cargando, error y vacío**.
- [ ] Camino feliz **y** al menos un camino de error, por pantalla.
- [ ] Todo se **vio funcionando en el simulador**.
- [ ] Trazabilidad RF/HU en el código.
- [ ] Supuestos marcados y avisados.
- [ ] CI verde en la rama.

Y además, lo específico del sprint:

- [ ] **¿Se cumple el DoD de tesis?** Varios sprints declaran que el
      sistema debe *producir un indicador* (A2: "N.º de registros por
      semana"; A3: "monto ahorrado"; A4: "% de gastos hormiga").
      Verificalo de verdad: registrá datos y confirmá que el indicador sale.
      Es el motivo por el que existe la app.
- [ ] Actualizar `docs/ESTADO_PROYECTO.md`: §2 (dónde estamos), §6
      (decisiones nuevas), §8 (deuda nueva).
- [ ] Dar los comandos para el PR hacia `staging`.

## 4. Cosas que ya se sabe que muerden

- **A1 es el sprint más pesado y el menos vistoso.** Es casi toda
  infraestructura (sesión, guards, interceptores, componentes base) que
  ningún sprint posterior vuelve a pagar. No recortarlo para "avanzar".
- **A4 es el sprint delicado.** D-15 define dos marcas de gasto hormiga: la
  automática (RF-38, inmutable, alimenta el indicador de la tesis) y la del
  estudiante (RF-55, opcional). **Si la UI las mezcla, se contamina la
  variable medida.** Necesita una prueba dedicada.
- **Checkpoint tras A4:** ahí está todo lo crítico. A5 (OCR) y A6 (Gmail)
  son aceleradores recortables si el cronograma aprieta. Decisión del
  usuario, y conviene plantearla explícitamente al terminar A4.
- **A7 (encuesta SUS) se lista al final pero no es opcional:** es el
  instrumento que mide la usabilidad de la tesis.
