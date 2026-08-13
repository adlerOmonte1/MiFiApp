// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
// Apaga las reglas de ESLint que chocan con Prettier. Va SIEMPRE al final:
// lo único que hace es desactivar reglas, así que si algo lo precede vuelve
// a encenderlas. Mismo criterio que MiFiBackend.
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    ignores: ["dist/*", "coverage/*", "src/api/schema.d.ts"],
  },
]);
