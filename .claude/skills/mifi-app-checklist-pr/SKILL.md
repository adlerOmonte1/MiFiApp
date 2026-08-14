---
name: mifi-app-checklist-pr
description: Checklist previo a cerrar una tarea, hacer el commit final o abrir un Pull Request en MiFiApp — cubre el pipeline de calidad, capas y SOLID en el cliente, trazabilidad HU/RF, accesibilidad, manejo de secretos y sincronía del contrato con MiFiBackend. Úsalo antes de dar por terminada una funcionalidad, antes de un commit final, o cuando el usuario pida "revisá esto antes del PR" o "está listo para commitear".
metadata:
  version: "1.0.0"
  proyecto: MiFi
  repo: MiFiApp
---

# Checklist previo a commit/PR — MiFiApp

No sustituye a `/code-review` ni a `/security-review`: es el checklist de
las convenciones de este proyecto. Usalo además, no en lugar.

## 1. Pipeline de calidad (bloqueante)

```bash
npm run lint && npm run format:check && npm run typecheck && npm run test:coverage
```

Son exactamente los cuatro pasos del CI (`.github/workflows/ci.yml`): si
fallan acá, fallan en el PR.

**Ojo:** el pipeline corre contra **todo el directorio de trabajo**, no
contra lo que quedó en `git add`. Un archivo puede compilar en tu máquina y
romper en GitHub si te olvidaste de agregarlo. Antes del commit:

- [ ] `grep "^import"` de cada archivo nuevo — ¿todo lo que importa ya está
      commiteado o va en este mismo commit?
- [ ] ¿Hay algún `.d.ts` nuevo? No aparece en ningún `grep import` porque
      TypeScript lo toma solo. (En este repo ya mordió dos veces:
      `expo-env.d.ts`, que está en `.gitignore` y hay que generar en CI, y
      `src/api/schema.d.ts`.)
- [ ] Después de `git add`, corré `git status` y confirmá que lo verde es
      *exactamente* lo que pensás.

## 2. Capas (ver `mifi-app-arquitectura`)

- [ ] ¿Alguna pantalla de `src/app/` llama a un servicio o a `axios`
      directamente, en vez de pasar por un hook?
- [ ] ¿Algún componente de `src/components/` importa de `services/`,
      `stores/` o `app/`?
- [ ] ¿Quedó lógica HTTP (códigos de estado, forma de la respuesta) fuera
      de `src/services/`?
- [ ] ¿Guardaste en Zustand algo que es estado de servidor y debería estar
      en TanStack Query?

## 3. Trazabilidad y documentación

- [ ] ¿El código nuevo referencia su HU/RF/UC de origen?
- [ ] ¿Todo supuesto que no estaba en la documentación quedó marcado con
      `// SUPUESTO:` y avisado al usuario?
- [ ] Si el backend cambió el contrato, ¿corriste `npm run sync:contract` y
      commiteaste `src/api/schema.d.ts`? El CI falla si quedó desfasado.
- [ ] ¿`src/api/schema.d.ts` quedó sin editar a mano? Es generado.

## 4. Seguridad

- [ ] ¿El JWT se guarda en `expo-secure-store` y **no** en AsyncStorage, en
      un store plano ni en `EXPO_PUBLIC_`?
- [ ] ¿Alguna variable `EXPO_PUBLIC_` nueva contiene algo que no debería
      ser público? Se inyecta **en texto plano en el bundle**.
- [ ] ¿Quedó algún `console.log` con el token, credenciales o datos
      financieros del usuario?
- [ ] ¿El `.env` sigue fuera de git? (`git status` antes de commitear.)
- [ ] Un 404 del backend puede significar "es de otro usuario" (D-05):
      ¿la UI lo trata como "no existe", sin revelar la diferencia?

## 5. Pruebas

- [ ] ¿Hay al menos una prueba del componente/hook nuevo o modificado?
- [ ] ¿Cubre el camino feliz del criterio de aceptación de la HU **y** al
      menos un camino de error del RF?
- [ ] ¿Usaste `await render(...)`? (v14 es asíncrono.)
- [ ] Los handlers de MSW, ¿siguen tipados contra el contrato y devuelven
      lo mismo que el backend real?

## 6. Interfaz

- [ ] ¿La pantalla resuelve los **tres estados**: cargando, error y vacío?
- [ ] ¿Los elementos interactivos tienen `testID`, y
      `accessibilityLabel` donde el texto visible no alcanza?
- [ ] ¿Se vio la pantalla corriendo en el simulador? Que los tests pasen no
      es haberla visto.
- [ ] ¿Se probó en las dos plataformas si el cambio toca algo específico de
      plataforma (archivos `.web.tsx`, `Platform.select`)?

## 7. Commit / PR

- Convención del backend: tipo en inglés (`feat`, `fix`, `test`, `docs`,
  `chore`), descripción en español, referencia al RF/HU cuando aplique.
  Ejemplo: `feat(auth): RF-05 pantalla de inicio de sesión con manejo de bloqueo`.
- Commits separados por tipo de cambio: un fix no viaja dentro de una
  feature.
- **Los comandos de git los corre el usuario, no vos.** Dáselos exactos y
  agrupados por qué es cada cosa.
