import { Colors } from "@/constants/theme";

/**
 * Única vía para leer colores del tema desde un componente.
 *
 * Devuelve siempre la paleta clara: v1 es solo modo claro, porque la app es
 * el instrumento de medición de la tesis y el test SUS exige que todos los
 * participantes vean lo mismo (ver docs/SistemaDiseno.md).
 *
 * Los componentes llaman a este hook en vez de indexar `Colors` — así, el
 * día que se agregue modo oscuro, se cambia esta función y ninguna pantalla
 * se entera.
 */
export function useTheme() {
  return Colors.light;
}
