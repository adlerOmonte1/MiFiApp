import Ionicons from "@expo/vector-icons/Ionicons";

import { type ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/**
 * Íconos de la app. Es el ÚNICO archivo que importa el set de íconos.
 *
 * Una pantalla pide `<Icono nombre="comida" />`, nunca
 * `<Ionicons name="fast-food" />`. Misma razón que los colores: cambiar de
 * set es editar el catálogo de acá, no revisar las 17 pantallas.
 *
 * Catálogo completo en docs/Iconografia.md §4.
 */

/** Nombre semántico → nombre en Ionicons. Agregar un ícono es sumar acá. */
const CATALOGO = {
  // Navegación (tab bar)
  inicio: "home",
  inicioInactivo: "home-outline",
  movimientos: "swap-vertical",
  movimientosInactivo: "swap-vertical-outline",
  metas: "flag",
  metasInactivo: "flag-outline",
  perfil: "person",
  perfilInactivo: "person-outline",
  agregar: "add",

  // Categorías de gasto
  comida: "fast-food",
  pasaje: "bus",
  estudio: "book",
  ocio: "game-controller",
  otros: "ellipsis-horizontal",
  categoria: "pricetag",

  // Acciones
  escanear: "camera",
  correo: "mail",
  manual: "create",
  guardar: "checkmark-circle",
  descartar: "close-circle",
  editar: "pencil",
  eliminar: "trash",
  buscar: "search",
  calendario: "calendar",
  configuracion: "settings",
  cerrarSesion: "log-out",
  exportar: "download",
  consentimiento: "document-text",

  // Estados y datos
  hormiga: "alert-circle",
  ingreso: "arrow-up-circle",
  egreso: "arrow-down-circle",
  vacio: "folder-open-outline",
  ver: "eye",
  ocultar: "eye-off",

  // Direccionales
  atras: "chevron-back",
  siguiente: "chevron-forward",
  desplegar: "chevron-down",
} as const;

export type NombreIcono = keyof typeof CATALOGO;

/** Tamaños del sistema (docs/Iconografia.md §5). */
const TAMANOS = {
  enLinea: 16,
  accion: 24,
  categoria: 28,
  central: 32,
  vacio: 64,
} as const;

export type TamanoIcono = keyof typeof TAMANOS;

export type IconoProps = {
  nombre: NombreIcono;
  tamano?: TamanoIcono;
  /** Token del tema. Por defecto, el color de texto principal. */
  color?: ThemeColor;
  /**
   * Obligatorio si el ícono NO va acompañado de texto visible: un ícono
   * solo es invisible para un lector de pantalla sin esto.
   */
  accessibilityLabel?: string;
};

export function Icono({ nombre, tamano = "accion", color, accessibilityLabel }: IconoProps) {
  const theme = useTheme();

  return (
    <Ionicons
      name={CATALOGO[nombre]}
      size={TAMANOS[tamano]}
      color={color ? theme[color] : theme.texto}
      accessibilityLabel={accessibilityLabel}
      // Sin label, es decorativo: se oculta al lector de pantalla en vez de
      // que lea el nombre del glifo.
      accessibilityElementsHidden={!accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? "yes" : "no-hide-descendants"}
    />
  );
}
