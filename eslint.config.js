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

  // ─────────────────────────────────────────────────────────────────
  // Sistema de diseño: los colores viven SOLO en src/constants/theme.ts
  //
  // Sin esta regla, la convención se erosiona sola: alguien apura un
  // "#00A37A" en una pantalla, y meses después cambiar el verde de marca
  // obliga a revisar las 17. Documentarlo no alcanza; hay que hacerlo
  // fallar en el CI. Ver docs/SistemaDiseno.md.
  // ─────────────────────────────────────────────────────────────────
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/constants/theme.ts", "src/**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/^#(?:[0-9a-fA-F]{3,4}){1,2}$/]",
          message:
            "No escribas colores literales. Usá los tokens del tema: " +
            "useTheme() para colores, o Colors/ColoresCategoria de " +
            "@/constants/theme. Si el color no existe todavía, agregalo " +
            "ahí — es la fuente única (ver docs/SistemaDiseno.md).",
        },
        {
          // OJO: sin filtro por `value`. Para un literal numérico, `value` es
          // un número y el matcher de esquery no lo convierte a string, así
          // que `[value=/^[0-9]+$/]` NUNCA coincide y la regla queda muerta.
          selector: "Property[key.name=/^(fontSize|lineHeight)$/] > Literal",
          message:
            "No fijes tamaños de texto a mano. Usá TextoVariantes de " +
            "@/constants/theme (ej. variante='monto'), para que la escala " +
            "tipográfica se cambie en un solo lugar.",
        },
      ],
    },
  },
]);
