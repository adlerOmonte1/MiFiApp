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

**Sobre la versión de Node — resuelto.** La guía original fijaba Node 20 LTS
por precaución. Verificado contra el `engines` real de React Native 0.86.2
(el que trae Expo SDK 57), el rango soportado es:

```
^20.19.4 || ^22.13.0 || ^24.3.0 || >= 25.0.0
```

O sea que **Node 24 es oficialmente soportado**, y no hay que bajar a 20. El
repo fija `24` en `.nvmrc`, que es la versión con la que se instaló y
verificó todo:

```bash
nvm use
```

El CI lee ese mismo archivo (`node-version-file: .nvmrc`), así que las dos
máquinas y GitHub Actions corren idéntica versión.

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

⚠️ **Ojo con dónde lo corrés** — acá es donde se cometió el error que
después hubo que deshacer (ver §10). El repo clonado ya se llama `MiFiApp`;
si entrás en él y corrés `create-expo-app MiFiApp`, terminás con
`MiFiApp/MiFiApp/`.

Andamiá **dentro** del repo ya clonado, con `.` como destino:

```bash
cd MiFiApp
npx create-expo-app@latest .
```

Las versiones actuales de `create-expo-app` andamian con **TypeScript y
expo-router** por defecto, que es justo lo que queremos (decisión #2 y
navegación basada en archivos para las 17 pantallas de `Wireframes.md`).

**Verificación del paso:**

```bash
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


Enganchá Prettier a ESLint agregando `eslint-config-prettier` **al final** de
`eslint.config.js` — lo único que hace es apagar reglas, así que si algo lo
precede vuelve a encenderlas:

```js
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = defineConfig([expoConfig, eslintConfigPrettier, { ignores: [...] }]);
```

> La primera corrida de `npm run format` toca ~23 archivos del template: el
> andamiaje de Expo usa comillas simples y el `.prettierrc.json` del backend
> fija `singleQuote: false`. Es esperado; hacelo en un commit aparte para que
> no se mezcle con cambios de lógica.

**TypeScript estricto** — en `tsconfig.json`, extendé la base de Expo y
activá las mismas garantías que el backend:

```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    // expo/tsconfig.base no fija "types". Al declararlo, TS deja de
    // auto-incluir node_modules/@types y usa SOLO esta lista: sin ella,
    // `describe`/`it`/`expect` no existen para el typecheck.
    // Los tipos de Expo no van acá: entran por expo-env.d.ts.
    "types": ["jest", "node"],
    // No vienen con "strict", y son las que atrapan bugs de datos de API.
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedSideEffectImports": true,
    "paths": { "@/*": ["./src/*"], "@/assets/*": ["./assets/*"] }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

Verificado: el andamiaje de `create-expo-app` compila limpio con las tres
opciones estrictas activadas, así que no hay deuda que pagar por ponerlas
desde el inicio.

**Scripts** — mismos nombres que el backend, para que el CI y la memoria
muscular sirvan en los dos repos:

```jsonc
"lint": "expo lint",
"lint:fix": "expo lint --fix",
"format": "prettier --write .",
"format:check": "prettier --check .",
"typecheck": "tsc --noEmit",
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"sync:contract": "node ./scripts/sync-contract.mjs"
```

---

## 6. Pruebas (Jest + Testing Library + MSW)

Es la decisión #3. El stack oficial de Expo son `jest-expo` y
`@testing-library/react-native`; MSW se suma para los dobles de la API.

```bash
npx expo install jest-expo jest @types/jest --dev
```

```bash
npx expo install @testing-library/react-native --dev
```

```bash
npm install -D msw
```

Este paso es, de lejos, el que más fricción tiene. Los cuatro problemas que
siguen se encontraron y resolvieron durante la instalación real; ninguno da
un mensaje de error que apunte a su causa.

### 6.1 `render` ahora es asíncrono

`@testing-library/react-native` **v14** cambió la API: `render` devuelve una
`Promise`. Es el cambio que acompaña a React 19, que eliminó
`react-test-renderer` (v14 usa el paquete `test-renderer` en su lugar).

```tsx
// ❌ Como aparece en casi toda la documentación y los tutoriales:
render(<ThemedText>Hola</ThemedText>);
expect(screen.getByText("Hola")).toBeOnTheScreen();
//     └─ falla con "`render` function has not been called"

// ✅ v14:
await render(<ThemedText>Hola</ThemedText>);
expect(screen.getByText("Hola")).toBeOnTheScreen();
```

Sin el `await`, `screen` nunca se puebla y el error habla de que `render` no
fue llamada —cuando sí lo fue—, así que no hay pista de que el problema sea
la Promise.

No instales `@testing-library/jest-native`: está deprecado y v14 ya trae los
matchers (`toBeOnTheScreen`, `toHaveStyle`, …) integrados.

### 6.2 `moduleNameMapper` REEMPLAZA al del preset, no lo fusiona

El más traicionero. `jest-expo` define en su preset cinco mapeos, entre
ellos el alias `@/` y la resolución de `react-native`. Si declarás
`moduleNameMapper` en tu `jest.config.js`, **pisás los cinco**.

El síntoma no es un error de módulo no encontrado: `render()` empieza a
devolver un objeto vacío y las pruebas fallan por razones que no tienen
nada que ver. Hay que hacer spread explícito:

```js
const presetExpo = require("jest-expo/jest-preset.js");

moduleNameMapper: {
  "\\.css$": "<rootDir>/src/test-utils/css-mock.js",
  "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",
  ...presetExpo.moduleNameMapper,
}
```

El orden importa: gana la primera regla que coincide. La de CSS va primero
porque `@/global.css` también coincide con el `^@/(.*)$` del preset.

### 6.3 Los imports de CSS rompen Jest

`src/constants/theme.ts` del template hace `import '@/global.css'`. Metro lo
entiende; Jest lo evalúa como JavaScript y muere con
`SyntaxError: Unexpected token ':'`. Se neutraliza con un stub
(`src/test-utils/css-mock.js`) mapeado desde `moduleNameMapper`.

### 6.4 MSW: bloqueado por `react-native` y publicado como ESM

Dos problemas encadenados:

1. **`Cannot find module 'msw/node'`.** MSW declara `"react-native": null`
   en los exports de ese subpath, y el resolver de `jest-expo` usa esa
   condición. El bloqueo tiene sentido en una app real —`msw/node`
   intercepta el `http` de Node, que en un dispositivo no existe— pero las
   pruebas corren en Node. Se saltea apuntando al CommonJS directo, como en
   el bloque de arriba.

2. **`Cannot use import statement outside a module`.** MSW y su cadena de
   dependencias se publican como ESM puro. Hay que tocar *dos* cosas, y
   omitir cualquiera de ellas deja el mismo error:

   ```js
   // a) permitir que se transformen (van agregadas al patrón de Expo)
   transformIgnorePatterns: [
     "node_modules/(?!...|msw|@mswjs/.*|@open-draft/.*|rettime|until-async|" +
     "strict-event-emitter|outvariant|is-node-process|headers-polyfill|" +
     "tough-cookie|graphql|cookie|path-to-regexp|picocolors|statuses|type-fest)",
   ],

   // b) el transform de jest-expo es `\.[jt]sx?$` y NO cubre .mjs —
   //    varias de esas dependencias se publican solo como .mjs
   transform: {
     ...presetExpo.transform,
     "\\.[cm]js$": presetExpo.transform["\\.[jt]sx?$"],
   },
   ```

### 6.5 Watchman

Si `jest` se queda colgado ~60 s y escupe
`syncToNow: timed out waiting for cookie file`, apagá watchman con
`watchman: false`. No aporta nada fuera de `--watch`. Mismo criterio que el
backend.

### 6.6 Umbral de cobertura: todavía no

RNF-18 pide ≥70% sobre la lógica propia, y el backend lo tiene activo. Acá
queda **desactivado a propósito**, con el bloque comentado en
`jest.config.js`: hoy `src/` es solo andamiaje, así que el umbral haría
fallar todos los PRs por no cubrir hooks del template. Un umbral siempre en
rojo se ignora, y entonces no protege nada.

**Activarlo** en el sprint que introduzca los stores de Zustand y los
servicios de API.

**Verificación del paso:**

```bash
npm test
```

Con las dos pruebas de humo del repo (`src/api/client.test.ts` y
`src/components/themed-text.test.tsx`) tienen que pasar 5 pruebas. Cubren
justamente lo que se puede romper: transformación de RN, alias `@/`,
variables `EXPO_PUBLIC_`, montaje de un componente e interceptación HTTP.

---

## 7. Contrato de la API — tipos generados

Acá se cobra la decisión #2. `openapi.yaml` vive en `MiFiBackend/docs` y es
fuente de verdad única: este repo **no lo edita**, lo consume.

```bash
npm run sync:contract
```

El script (`scripts/sync-contract.mjs`) baja el YAML de la rama `main` del
backend, lo guarda en `contracts/openapi.yaml` y genera
`src/api/schema.d.ts` con `openapi-typescript`. A partir de ahí, si el
backend renombra un campo, `npm run typecheck` acá falla en cada lugar que
lo usaba. Esa es toda la red de seguridad.

> **`openapi-typescript` no va en `devDependencies`.** Su peer pide
> `typescript@^5.x` y este proyecto usa TS 6, así que `npm install` falla con
> `ERESOLVE`. Es un generador que corre a mano y escribe un `.d.ts`, no algo
> que la app importe: se ejecuta con `npx`, que resuelve su propio árbol
> aislado. No uses `--legacy-peer-deps` para forzarlo al árbol del proyecto.

⚠️ **Limitación real del contrato hoy:** `openapi.yaml` casi no declara
`required`, así que **todos los campos se generan opcionales**
(`token?: string`, `nombre?: string`). El typecheck sigue detectando campos
renombrados o inexistentes, pero no obliga a manejar los que el backend
siempre manda. Conviene agregar `required` en el backend; hasta entonces,
esperá `| undefined` en todos lados.

El CI corre `sync:contract` y falla si `schema.d.ts` quedó desactualizado,
así que una divergencia entre repos no puede pasar sin que alguien la vea.

---

## 8. Variables de entorno

```bash
cp .env.example .env
```

⚠️ **Lo más importante de este paso:** en Expo, toda variable con prefijo
`EXPO_PUBLIC_` se inyecta **en texto plano en el bundle compilado**.
Cualquiera que descargue el `.apk` puede leerla. Ahí van solo URLs y el
`client_id` de OAuth (público por diseño). `JWT_SECRET`, `ENCRYPTION_KEY` y
las credenciales de Google **nunca** salen de `MiFiBackend/.env`.

Dos detalles que hacen perder tiempo:

- Hay que leerlas como propiedad literal: `process.env.EXPO_PUBLIC_API_URL`.
  Con `process.env["EXPO_PUBLIC_API_URL"]` o desestructurando, el reemplazo
  en build no ocurre y el valor llega `undefined`.
- Se leen al arrancar el servidor de Expo. Después de tocar `.env` hay que
  reiniciarlo; no se recargan en caliente.

Para `EXPO_PUBLIC_API_URL`, según dónde pruebes:

| Destino | Valor |
|:--|:--|
| Simulador iOS / web | `http://localhost:3000/api` |
| Emulador Android | `http://10.0.2.2:3000/api` (alias del localhost del anfitrión) |
| Dispositivo con Expo Go | `http://<IP-LAN-de-tu-máquina>:3000/api` |

`.env` está en `.gitignore`. Expo permite commitearlo —solo inyecta
variables públicas— pero lo ignoramos igual: evita que un secreto puesto ahí
por error termine en un repo público. El archivo versionado es
`.env.example`.

---

## 9. Integración continua

`.github/workflows/ci.yml` replica el del backend: lint, formato, tipos y
pruebas con cobertura, cada uno escribiendo su ✅/❌ en el resumen de la
corrida. Agrega un paso que el backend no tiene: verificar que
`schema.d.ts` siga sincronizado con `openapi.yaml`.

Usa `node-version-file: .nvmrc`, así que CI y las dos máquinas de desarrollo
corren exactamente la misma versión de Node.

`EXPO_PUBLIC_API_URL` se define a nivel de workflow porque
`src/api/client.ts` lanza al importarse si falta, y las pruebas lo importan.

⚠️ **Hay que generar `expo-env.d.ts` en CI.** Es el mismo archivo del §5, y
acá muerde de nuevo: está en `.gitignore` y lo genera `expo start`, que en
CI no corre. Sin él, el typecheck falla con
`Cannot find module './animated-icon.module.css'` — y como los pasos
siguientes se saltean en cascada, a primera vista parece que reventó medio
workflow cuando en realidad falló una sola cosa.

```yaml
- name: Generar expo-env.d.ts
  run: printf '/// <reference types="expo/types" />\n' > expo-env.d.ts
```

`npx expo customize` **no** sirve para esto: solo acepta `babel.config.js`,
`metro.config.js`, `tsconfig.json`, `eslint.config.js` y algunos más. La
alternativa sería versionar el archivo, pero su contenido depende del SDK,
así que es preferible generarlo.

⚠️ **Con `typedRoutes` activo, hay un segundo archivo generado y también
ignorado: `.expo/types/router.d.ts`.** Trae las rutas válidas para `Href`
— aparece la primera vez que algo tipa contra `Href` (A1.4,
`src/navegacion/guardas.ts`). Mismo síntoma que `expo-env.d.ts`: falla en
CI, no en local, porque nadie corrió `expo start` ahí para generarlo.

La diferencia importante: **`expo export`, que sí corre hasta el final y
sale solo, NO lo genera** — se verificó a mano. Solo lo escribe el watcher
de `expo start`, así que hay que levantarlo un momento y matarlo:

```yaml
- name: Generar tipos de rutas (typedRoutes)
  run: |
    npx expo start --web > /tmp/expo-start.log 2>&1 &
    PID=$!
    for i in $(seq 1 60); do
      [ -f .expo/types/router.d.ts ] && break
      sleep 2
    done
    kill "$PID" 2>/dev/null || true
    pkill -f "expo start" 2>/dev/null || true
    if [ ! -f .expo/types/router.d.ts ]; then
      echo "::error::No se generaron los tipos de rutas en 120s"
      cat /tmp/expo-start.log
      exit 1
    fi
```

En la práctica tarda unos segundos, no los 120s del límite — el sondeo cada
2s corta apenas aparece el archivo. El `--web` es a propósito: es la
plataforma más liviana para esto, no hace falta ni el simulador ni un
emulador.

---

## 10. Estructura del repositorio

⚠️ **El error que cometimos:** el paso 3 dice correr
`npx create-expo-app@latest MiFiApp` "desde la carpeta que contiene el repo
clonado". Si lo corrés **dentro** del repo ya clonado (que se llama
`MiFiApp`), quedan dos niveles: `MiFiApp/MiFiApp/`, y la raíz del repo
contiene solo esa carpeta.

Rompe los supuestos de GitHub Actions (habría que poner `working-directory`
en cada paso) y de EAS Build, que asumen raíz de repo = raíz del proyecto.

Si te pasa, aplanalo **antes de acumular historial**:

```bash
mv MiFiApp/* MiFiApp/.* . 2>/dev/null; rmdir MiFiApp; git add -A
```

Git lo registra como renames, así que el historial de cada archivo se
conserva y no hace falta `force-push`.

Estructura final:

```
MiFiApp/
├── .github/workflows/ci.yml
├── contracts/openapi.yaml        # bajado del backend, no se edita
├── docs/GUIA_INSTALACION.MD
├── scripts/sync-contract.mjs
├── src/
│   ├── api/                      # client.ts, schema.d.ts (generado), tipos.ts
│   ├── app/                      # rutas de expo-router
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   └── test-utils/               # css-mock.js, msw/
├── jest.config.js · jest.env.ts · jest.setup.ts
├── .env.example · .nvmrc · .prettierrc.json
└── eslint.config.js · tsconfig.json
```

---

## 11. Verificación final

Los cuatro comandos que corre el CI. Tienen que pasar los cuatro antes de
abrir cualquier PR:

```bash
npm run lint && npm run format:check && npm run typecheck && npm run test:coverage
```

Y que la app levante:

```bash
npx expo start
```

---

## 12. Puesta al día de la segunda máquina

El repo cambió de forma (paso 10), así que en la otra máquina **no alcanza
con `git pull`**: quedan huérfanos el `node_modules` y demás archivos no
versionados del directorio viejo, que git no borra.

```bash
git pull origin main
```

```bash
rm -rf MiFiApp
```

```bash
npm install
```

```bash
cp .env.example .env
```

`expo-env.d.ts` no está versionado: lo genera Expo al levantar el dev
server. Si necesitás el typecheck sin arrancarlo, creá el archivo a mano con
la línea del paso 5.

---

## 13. Estado y qué falta

Verificado en la instalación real (macOS, Node 24.13.1, Expo SDK 57):

| Paso | Estado |
|:--|:--|
| 2. Repo, ramas `main` y `staging` | ✅ |
| 3. Proyecto Expo (aplanado a la raíz) | ✅ |
| 4. Dependencias del stack | ✅ |
| 5. ESLint, Prettier, TS estricto, scripts | ✅ `lint`, `format:check` y `typecheck` limpios |
| 6. Jest + Testing Library + MSW | ✅ 5 pruebas de humo pasando |
| 7. Contrato y tipos generados | ✅ `sync:contract` genera 1544 líneas de tipos |
| 8. Variables de entorno | ✅ |
| 9. CI | ✅ corrida verde en `main` y `staging` (commit `e04d83b`) |

Pendientes, en orden:

1. **Agregar `required` al `openapi.yaml` del backend** (ver §7). Sin eso,
   la seguridad de tipos del cliente queda a medias.
2. **Protecciones de rama** en `main` y `staging`: exigir CI en verde antes
   de mergear. Sin esto, el flujo de ramas es una convención, no una
   garantía. Se configura en Settings → Branches del repo.
3. **Activar el umbral de cobertura** (§6.6) cuando existan los stores y
   servicios.
4. **Propagar las decisiones #1, #2 y #3 al ADR** en `MiFiBackend/docs`.
5. **Decidir la visibilidad de los repos.** El §2 dice "privado, igual que
   el backend", pero hoy `MiFiApp` y `MiFiBackend` son **públicos** (ambos
   responden a la API de GitHub sin autenticación). No hay secretos
   commiteados —se verificó que en el backend solo está `.env.example`, y
   que `.env` y `credentials.json` están ignorados—, así que no es una fuga;
   pero conviene que sea una decisión tomada y no un descuido.
