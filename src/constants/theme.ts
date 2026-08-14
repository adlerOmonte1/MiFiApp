/**
 * Sistema de diseño de MiFi — fuente única de verdad.
 *
 * Ver `docs/SistemaDiseno.md` para el porqué de cada decisión.
 *
 * ═══ LA REGLA QUE SOSTIENE TODO ═══
 * Ningún componente ni pantalla escribe un color, un tamaño de fuente, un
 * radio o una sombra literal. Todo sale de acá. Así, cambiar el verde de
 * marca es editar UNA línea, no 17 pantallas.
 *
 * La estructura tiene tres niveles, y el orden importa:
 *
 *   1. Paleta    — valores crudos. EL ÚNICO LUGAR DEL PROYECTO CON HEX.
 *   2. Colors    — tokens semánticos: nombran el ROL, no el color.
 *   3. Variantes — combinaciones listas (texto, superficies).
 *
 * Los componentes usan el nivel 2 y 3, nunca el 1. Esa indirección es lo
 * que permite cambiar la marca sin tocar componentes (inversión de
 * dependencias: el componente depende de "primario", no de "#00A37A").
 */

import "@/global.css";

import { Platform, type TextStyle, type ViewStyle } from "react-native";

// ═══════════════════════════════════════════════════════════════════
// 1. PALETA — valores crudos. No usar directamente en componentes.
// ═══════════════════════════════════════════════════════════════════

const Paleta = {
  esmeralda: "#00A37A",
  esmeraldaOscuro: "#04835F",
  esmeraldaSuave: "#EAF6F1",

  ambar: "#F59E0B",
  ambarSuave: "#FEF3E2",
  /**
   * Ámbar oscurecido, SOLO para texto. El #F59E0B sobre blanco da 2,15:1
   * de contraste — ilegible para mucha gente y muy lejos del 4,5:1 que
   * pide WCAG AA. Este da 5,02:1. Ver docs/SistemaDiseno.md §Contraste.
   */
  ambarTexto: "#B45309",

  azulGris: "#6F7DA8",
  azulGrisSuave: "#EEF1F7",

  morado: "#8B6FB0",
  moradoSuave: "#F3EEF8",

  terracota: "#B0564A",

  blanco: "#FFFFFF",
  grisFondo: "#F6F8F7",
  grisBorde: "#E9EDEB",

  // Nunca negro puro: a pantalla completa cansa la vista y se ve duro.
  tinta: "#1D2320",
  /**
   * El mockup traía #77827D, que da 3,98:1 sobre blanco y no llega al
   * 4,5:1 de WCAG AA. Oscurecido a #67726D da 4,99:1. El cambio de tono es
   * casi imperceptible y este color se usa en casi todas las pantallas.
   */
  grisTexto: "#67726D",
  grisTextoSuave: "#8B948F",
  grisTextoTenue: "#97A09B",
} as const;

// ═══════════════════════════════════════════════════════════════════
// 2. TOKENS SEMÁNTICOS — lo que usan los componentes.
// ═══════════════════════════════════════════════════════════════════

/**
 * v1 es SOLO modo claro (decisión del proyecto): la app es el instrumento
 * de medición de la tesis y un test SUS exige que todos los participantes
 * vean lo mismo. Si un participante la usa en oscuro y otro en claro, la
 * experiencia medida no es comparable.
 *
 * La forma `Colors.light` se conserva —en vez de aplanar— justamente para
 * poder agregar `Colors.dark` más adelante sin tocar una sola pantalla.
 */
export const Colors = {
  light: {
    // — Marca
    //
    // Dos verdes con roles distintos, y la diferencia importa:
    //   `primario`      → SUPERFICIES (fondo de botón, botón central, logo,
    //                     íconos grandes). Es el verde del mockup.
    //   `primarioTexto` → TEXTO e íconos chicos sobre fondo claro, y fondo
    //                     de botón cuando encima va texto normal.
    //
    // Motivo: #00A37A sobre blanco (y blanco sobre #00A37A) da 3,22:1, por
    // debajo del 4,5:1 de WCAG AA. #04835F da 4,75:1. Usar el brillante en
    // superficies grandes conserva la identidad del mockup sin sacrificar
    // legibilidad. Ver docs/SistemaDiseno.md §Contraste.
    primario: Paleta.esmeralda,
    primarioTexto: Paleta.esmeraldaOscuro,
    primarioPresionado: Paleta.esmeraldaOscuro,
    primarioSuave: Paleta.esmeraldaSuave,
    sobrePrimario: Paleta.blanco,

    // — Alertas y gasto hormiga (RF-38, D-15)
    //   `alerta` para fondos, bordes e íconos; `alertaTexto` para texto.
    alerta: Paleta.ambar,
    alertaTexto: Paleta.ambarTexto,
    alertaSuave: Paleta.ambarSuave,

    // — Categorías secundarias
    categoriaAzul: Paleta.azulGris,
    categoriaAzulSuave: Paleta.azulGrisSuave,
    categoriaMorada: Paleta.morado,
    categoriaMoradaSuave: Paleta.moradoSuave,

    // — Estados
    error: Paleta.terracota,
    exito: Paleta.esmeralda,

    // — Superficies
    fondo: Paleta.grisFondo,
    superficie: Paleta.blanco,
    superficieElevada: Paleta.blanco,
    borde: Paleta.grisBorde,

    // — Texto
    texto: Paleta.tinta,
    textoSecundario: Paleta.grisTexto,
    textoTenue: Paleta.grisTextoSuave,
    textoDeshabilitado: Paleta.grisTextoTenue,

    // — Alias del andamiaje de Expo. NO usar en código nuevo:
    //   existen para que los componentes del template sigan compilando.
    text: Paleta.tinta,
    background: Paleta.grisFondo,
    backgroundElement: Paleta.blanco,
    backgroundSelected: Paleta.esmeraldaSuave,
    textSecondary: Paleta.grisTexto,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

/**
 * Colores de categoría, en orden de asignación.
 *
 * Abierto/cerrado: agregar una categoría es sumar una entrada acá; ningún
 * componente que pinte categorías necesita cambiar.
 */
export const ColoresCategoria = [
  { fondo: Colors.light.primarioSuave, principal: Colors.light.primario },
  { fondo: Colors.light.categoriaAzulSuave, principal: Colors.light.categoriaAzul },
  { fondo: Colors.light.categoriaMoradaSuave, principal: Colors.light.categoriaMorada },
  { fondo: Colors.light.alertaSuave, principal: Colors.light.alerta },
] as const;

// ═══════════════════════════════════════════════════════════════════
// 3. TIPOGRAFÍA
// ═══════════════════════════════════════════════════════════════════

/**
 * Nombres tal como los exporta @expo-google-fonts. En React Native el peso
 * NO se controla con fontWeight cuando se usan fuentes cargadas: cada peso
 * es una familia distinta. Poner `fontWeight: "900"` sobre Nunito_400Regular
 * no la engorda en Android — por eso las variantes de abajo nombran la
 * familia exacta y no usan fontWeight.
 */
export const Fuentes = {
  regular: "Nunito_400Regular",
  semiBold: "Nunito_600SemiBold",
  bold: "Nunito_700Bold",
  extraBold: "Nunito_800ExtraBold",
  black: "Nunito_900Black",
  mono: "JetBrainsMono_400Regular",
} as const;

/**
 * Variantes de texto. Un componente pide `variante="monto"`, no un tamaño.
 *
 * El monto es siempre el elemento más grande de su pantalla: es el dato que
 * el estudiante viene a ver, y la jerarquía visual debe decirlo sin que
 * tenga que buscarlo.
 */
export const TextoVariantes = {
  monto: { fontFamily: Fuentes.black, fontSize: 40, lineHeight: 48 },
  montoSecundario: { fontFamily: Fuentes.extraBold, fontSize: 26, lineHeight: 32 },
  titulo: { fontFamily: Fuentes.extraBold, fontSize: 24, lineHeight: 30 },
  subtitulo: { fontFamily: Fuentes.bold, fontSize: 18, lineHeight: 24 },
  cuerpo: { fontFamily: Fuentes.semiBold, fontSize: 16, lineHeight: 24 },
  cuerpoSuave: { fontFamily: Fuentes.regular, fontSize: 16, lineHeight: 24 },
  etiqueta: { fontFamily: Fuentes.semiBold, fontSize: 14, lineHeight: 20 },
  etiquetaFuerte: { fontFamily: Fuentes.bold, fontSize: 14, lineHeight: 20 },
  micro: { fontFamily: Fuentes.semiBold, fontSize: 12, lineHeight: 16 },
  mono: { fontFamily: Fuentes.mono, fontSize: 12, lineHeight: 16 },
} as const satisfies Record<string, TextStyle>;

export type VarianteTexto = keyof typeof TextoVariantes;

// ═══════════════════════════════════════════════════════════════════
// 4. FORMA Y ESPACIADO
// ═══════════════════════════════════════════════════════════════════

/** Escala de 4pt. Nombres por tamaño, no por uso, para que no mientan. */
export const Espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radios = {
  icono: 14,
  boton: 20,
  tarjeta: 24,
  tarjetaGrande: 30,
  /** Píldoras y chips: alto/2 es frágil, un número grande siempre redondea. */
  pildora: 999,
} as const;

/**
 * Sombras suaves. iOS y Android usan APIs distintas, así que se definen
 * juntas: usar solo `elevation` deja iOS plano, y solo `shadow*` deja
 * Android plano.
 */
export const Sombras = {
  tarjeta: {
    shadowColor: Paleta.tinta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  elevada: {
    shadowColor: Paleta.tinta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  /** Sombra teñida del botón central del tab bar. */
  botonCentral: {
    shadowColor: Paleta.esmeralda,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
} as const satisfies Record<string, ViewStyle>;

/**
 * Área mínima táctil. 44pt es el mínimo de las guías de accesibilidad de
 * iOS y Android; por debajo, la gente falla el toque.
 */
export const AreaTactilMinima = 44;

/** Botón central flotante del tab bar. */
export const BotonCentral = 66;

// — Compatibilidad con el andamiaje de Expo. No usar en código nuevo.
export const Fonts = {
  sans: Fuentes.regular,
  serif: Fuentes.regular,
  rounded: Fuentes.regular,
  mono: Fuentes.mono,
};

export const Spacing = {
  half: 2,
  one: Espaciado.xs,
  two: Espaciado.sm,
  three: Espaciado.lg,
  four: Espaciado.xl,
  five: Espaciado.xxl,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
