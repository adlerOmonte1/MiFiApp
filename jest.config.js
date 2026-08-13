const presetExpo = require("jest-expo/jest-preset.js");

/** @type {import('jest').Config} */
module.exports = {
  // Preset oficial de Expo: configura el transformer de Babel, los mocks de
  // los módulos nativos y las plataformas (ios/android/web) de una sola vez.
  preset: "jest-expo",

  // Watchman se cuelga 60s y cae por timeout ("syncToNow: timed out waiting
  // for cookie file") antes de reintentar con el crawler de Node. No aporta
  // nada fuera de --watch, así que se apaga. Mismo criterio que MiFiBackend.
  watchman: false,

  // El código de Expo y React Native se publica en ESM sin transpilar, así
  // que Jest no puede requerirlo tal cual. Esta lista es la excepción a
  // "no transformar node_modules": lo de adentro SÍ se transforma.
  // Tomada de https://docs.expo.dev/develop/unit-testing/ (variante npm).
  // MSW y su cadena de dependencias se publican como ESM puro, así que van
  // agregadas a la excepción: sin esto Jest las carga sin transformar y
  // falla con "Cannot use import statement outside a module".
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|msw|@mswjs/.*|@open-draft/.*|@bundled-es-modules/.*|@inquirer/.*|rettime|until-async|strict-event-emitter|outvariant|is-node-process|headers-polyfill|tough-cookie|graphql|cookie|path-to-regexp|picocolors|statuses|type-fest|yargs)",
  ],

  // OJO: definir `moduleNameMapper` acá NO se fusiona con el del preset, lo
  // REEMPLAZA entero. jest-expo trae ahí el alias "@/" y el mapeo de
  // react-native; pisarlos rompe la resolución de módulos de forma silenciosa
  // (render() devuelve un objeto vacío en vez de fallar). Por eso se hace
  // spread explícito del preset.
  moduleNameMapper: {
    // Va PRIMERO: gana la primera regla que coincide, y "@/global.css"
    // también coincide con el "^@/(.*)$" del preset, que lo resolvería al
    // .css real y Jest lo intentaría evaluar como JavaScript.
    "\\.css$": "<rootDir>/src/test-utils/css-mock.js",

    // MSW declara `"react-native": null` en los exports de "msw/node", y el
    // resolver de jest-expo usa justamente esa condición: el resultado es
    // "Cannot find module 'msw/node'". El bloqueo tiene sentido en una app
    // real (msw/node intercepta http de Node, que en un dispositivo no
    // existe), pero las pruebas corren en Node, así que acá sí sirve.
    // Se apunta al archivo CommonJS directamente para saltear la condición.
    "^msw/node$": "<rootDir>/node_modules/msw/lib/node/index.js",

    ...presetExpo.moduleNameMapper,
  },

  // El transform de jest-expo es `\.[jt]sx?$`, que NO cubre .mjs/.cjs. Varias
  // dependencias de MSW (rettime, until-async…) se publican solo como .mjs, y
  // sin esto Jest las carga crudas y falla con "Cannot use import statement
  // outside a module" — aunque estén permitidas en transformIgnorePatterns.
  // Se reusa exactamente el mismo babel-jest configurado por el preset.
  transform: {
    ...presetExpo.transform,
    "\\.[cm]js$": presetExpo.transform["\\.[jt]sx?$"],
  },

  setupFiles: ["<rootDir>/jest.env.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/api/schema.d.ts",
    "!src/app/**",
    "!src/test-utils/**",
  ],

  coverageDirectory: "coverage",
  passWithNoTests: true,

  // Espejo de RNF-18 (MiFiBackend/docs/RequerimientosNoFuncionales.md): 70%
  // sobre la lógica propia. Queda DESACTIVADO a propósito hasta que exista
  // esa lógica.
  //
  // Por qué: hoy `src/` es solo el andamiaje de create-expo-app. Activarlo
  // ahora hace fallar el CI en todos los PRs por no cubrir hooks del
  // template (use-color-scheme.web.ts ni siquiera corre fuera de web), y un
  // umbral que se ignora porque siempre está en rojo no protege nada.
  //
  // ACTIVARLO en el sprint que introduzca los stores de Zustand y los
  // servicios de API — ahí empieza la lógica que RNF-18 realmente cubre.
  // Descomentar y ajustar las rutas a las que existan en ese momento:
  //
  // coverageThreshold: {
  //   "./src/stores/**": { branches: 70, functions: 70, lines: 70, statements: 70 },
  //   "./src/services/**": { branches: 70, functions: 70, lines: 70, statements: 70 },
  // },
};
