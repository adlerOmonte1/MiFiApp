import { Text, type TextProps } from "react-native";

import { TextoVariantes, type ThemeColor, type VarianteTexto } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/**
 * Texto de la app. Es la única forma de escribir texto en MiFiApp.
 *
 * Un componente pide una VARIANTE semántica (`variante="monto"`), nunca un
 * tamaño ni un peso. Así, ajustar la escala tipográfica es editar
 * `TextoVariantes` en el tema y las 17 pantallas se acomodan solas.
 *
 * Ojo con los pesos: con fuentes cargadas, cada peso de Nunito es una
 * familia distinta. `fontWeight` no engorda el texto — por eso las
 * variantes traen `fontFamily` y acá no se toca el peso.
 *
 * `type` es el nombre del andamiaje de Expo; se mantiene mapeado para no
 * romper los componentes del template. En código nuevo usá `variante`.
 */

/** Traducción de los nombres del andamiaje a las variantes del sistema. */
const VARIANTE_POR_TIPO = {
  default: "cuerpo",
  title: "monto",
  subtitle: "titulo",
  small: "etiqueta",
  smallBold: "etiquetaFuerte",
  link: "etiqueta",
  linkPrimary: "etiqueta",
  code: "mono",
} as const satisfies Record<string, VarianteTexto>;

export type TipoTextoLegado = keyof typeof VARIANTE_POR_TIPO;

export type ThemedTextProps = TextProps & {
  /** Variante del sistema de diseño. Preferí esta a `type`. */
  variante?: VarianteTexto;
  /** @deprecated Nombre del andamiaje de Expo. Usá `variante`. */
  type?: TipoTextoLegado;
  /** Token de color del tema. Por defecto, el texto principal. */
  themeColor?: ThemeColor;
};

export function ThemedText({ style, variante, type, themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  const varianteFinal: VarianteTexto = variante ?? (type ? VARIANTE_POR_TIPO[type] : "cuerpo");

  // Los links llevan el color de marca aunque no se pida themeColor: es la
  // señal de "esto se toca" en toda la app. Se usa `primarioTexto` (el verde
  // oscuro) y no `primario`, porque es texto sobre fondo claro y el verde
  // brillante no llega al contraste de WCAG AA.
  const esLink = type === "link" || type === "linkPrimary";
  const color = themeColor ? theme[themeColor] : esLink ? theme.primarioTexto : theme.texto;

  return <Text style={[{ color }, TextoVariantes[varianteFinal], style]} {...rest} />;
}
