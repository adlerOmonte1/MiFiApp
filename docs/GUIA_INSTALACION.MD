# Guía de instalación — MiFiApp (frontend)

> Repositorio del cliente móvil de MiFi. Complementa —no reemplaza— a
> `docs/GuiaEntornoDesarrollo.md` del repo `MiFiBackend`, que sigue siendo la
> referencia para instalar Node, Android Studio, Xcode y Expo Go en las
> máquinas. Esta guía cubre **solo la creación y configuración del repo del
> frontend**.

---

## 0. Decisiones de esta guía (y por qué se apartan del diseño original)

`GuiaEntornoDesarrollo.md` se escribió en Fase 1, antes de construir el
backend. Tres puntos cambian a la luz de lo que ya se construyó. Quedan
registrados acá para trazabilidad; conviene propagarlos al ADR del proyecto.

| # | Decisión original | Decisión ahora | Motivo |
|:--|:--|:--|:--|
| 1 | "Un solo repositorio en Git" (§11) | **Dos repos: `MiFiBackend` y `MiFiApp`** | Decisión del usuario, por mantenibilidad. Ciclos de vida, CI y despliegue independientes. |
| 2 | "JavaScript (TypeScript opcional recomendado)" (§1) | **TypeScript estricto, obligatorio** | El backend es TS estricto con 233 pruebas; el contrato `openapi.yaml` permite **generar los tipos del cliente**, así que el frontend detecta en compilación cualquier desalineación con la API. Renunciar a eso sería perder la red de seguridad principal. |
| 3 | Sin stack de pruebas definido para la app | **Jest + Testing Library + MSW** | La metodología del proyecto exige pasos verificables. Sin pruebas no hay forma de sostenerla en el frontend. |

> **Regla que se mantiene:** el paquete de diseño (`HistoriasUsuario.md`,
> `RequerimientosFuncionales.md`, `Wireframes.md`, `openapi.yaml`, ADR) sigue
> viviendo en `MiFiBackend/docs/` como **fuente de verdad única**. El
> frontend no lo duplica: lo consulta y sincroniza solo el contrato
> (paso 7).

---

## 1. Prerrequisitos

Ya cubiertos por `GuiaEntornoDesarrollo.md` (§2 a §5). Verificá que respondan:

```bash
node -v
npm -v
git --version
```

⚠️ **Sobre la versión de Node:** la guía original fija **Node 20 LTS**, pero
la máquina de desarrollo actual corre **Node 24**. Expo declara un rango de
versiones soportadas que no siempre incluye la más reciente. Antes de
empezar, confirmá el rango que pide el Expo SDK actual y, si hace falta,
fijá la versión con nvm:

```bash
nvm install 20
nvm use 20
```

Y dejá la versión escrita en un archivo `.nvmrc` en la raíz del repo, para
que ambas máquinas usen la misma.

---

## 2. Crear el repositorio

En GitHub, creá el repo **`MiFiApp`** (privado, igual que el backend), y
localmente:

```bash
cd ~/Desktop/AppMovil
git clone https://github.com/adlerOmonte1/MiFiApp.git
```

Mantené el mismo flujo de ramas del backend: `feature/*` → PR → `staging` →
PR → `main`. Creá la rama `staging` desde el inicio para no repetir el
desajuste que hubo en el backend.

---

## 3. Crear el proyecto Expo

Desde la carpeta que contiene el repo clonado:

```bash
npx create-expo-app@latest MiFiApp
```

Las versiones actuales de `create-expo-app` andamian con **TypeScript y
expo-router** por defecto, que es justo lo que queremos (decisión #2 y
navegación basada en archivos para las 17 pantallas de `Wireframes.md`).

**Verificación del paso:**

```bash
cd MiFiApp
npx expo start
```

- `a` → emulador Android · `i` → simulador iOS (solo Mac) · QR → Expo Go
- Si la app de ejemplo carga en al menos un destino, el paso está OK.

---

## 4. Dependencias del stack decidido

Son las que ya fija `GuiaEntornoDesarrollo.md §1`. Usá `npx expo install`
(no `npm install`): resuelve la versión compatible con tu Expo SDK.

```bash
npx expo install zustand axios @tanstack/react-query
```

```bash
npx expo install expo-secure-store
```

```bash
npx expo install expo-camera expo-image-picker expo-auth-session
```

Notas:

- **`expo-secure-store`** no está en la guía original, pero hace falta: el
  JWT del backend (RF-06, vigencia 7 días) **no puede guardarse en
  AsyncStorage**, que es texto plano. Va en el llavero del sistema.
- **`expo-camera` / `expo-image-picker` / `expo-auth-session`** son para OCR
  (Sprint 5) y Gmail (Sprint 6). Instalalas ahora para no rehacer la
  configuración nativa después, aunque no las uses todavía.

---

## 5. Calidad de código (equivalente al backend)

El backend corre `lint`, `format:check`, `typecheck`, `test:coverage` y
`build` en cada commit. El frontend replica el mismo criterio.

```bash
npx expo lint
```

Eso configura ESLint con la config oficial de Expo.

> ⚠️ **La primera corrida falla siempre.** Instala `eslint` y
> `eslint-config-expo`, escribe `eslint.config.js`, y acto seguido revienta
> con `Error: Cannot find module 'eslint'`. No es un fallo de instalación: el
> proceso de Node ya tenía fijado su caché de resolución de módulos desde
> antes de que existiera `node_modules/eslint`. **Volvé a correr el mismo
> comando** y anda. No borres `node_modules` ni reinstales nada.

**Errores reales que quedan tras la primera corrida limpia** (ambos vienen
del andamiaje de `create-expo-app`, no de código nuestro):

1. `src/hooks/use-color-scheme.web.ts` — la regla
   `react-hooks/set-state-in-effect` marca el `setState` dentro del
   `useEffect` que detecta la hidratación. Reemplazá ese patrón por
   `useSyncExternalStore`, que es la forma canónica de leer un valor que
   difiere entre servidor y cliente:

   ```ts
   const subscribe = () => () => {};
   const getSnapshot = () => true;
   const getServerSnapshot = () => false;

   export function useColorScheme() {
     const hasHydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
     const colorScheme = useRNColorScheme();
     return hasHydrated ? colorScheme : 'light';
   }
   ```

2. `npx tsc --noEmit` falla con `Cannot find module './animated-icon.module.css'`
   y `'@/global.css'`. Falta `expo-env.d.ts`, que es quien trae las
   declaraciones de tipos de los imports CSS. Lo genera Expo al levantar el
   dev server (`npx expo start`) y está en `.gitignore`, así que **cada
   máquina lo genera sola**. Si necesitás desbloquear el typecheck sin
   levantar el server, creá el archivo a mano con una sola línea:

   ```ts
   /// <reference types="expo/types" />
   ```

Después agregá Prettier, igual que en el backend:

```bash
npm install -D prettier eslint-config-prettier
```

Copiá el `.prettierrc` del repo `MiFiBackend` para que ambos proyectos
formateen idéntico.

**TypeScript estricto** — en `tsconfig.json`, extendé la base de Expo y
activá las mismas garantías que el backend:

```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {