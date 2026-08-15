import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from "react-native";

import { AreaTactilMinima, Espaciado, Radios } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

import { ThemedText } from "../themed-text";
import { Icono, type NombreIcono } from "./icono";

/**
 * Botón de la app.
 *
 * Tres variantes, y la diferencia no es estética: comunican jerarquía. Una
 * pantalla tiene como mucho UN botón `primario` — es la acción que se
 * espera que el estudiante haga (docs/SistemaDiseno.md §6: máximo 3-4
 * acciones visibles por pantalla).
 */

export type VarianteBoton = "primario" | "secundario" | "texto";

export type BotonProps = Omit<PressableProps, "style" | "children"> & {
  titulo: string;
  variante?: VarianteBoton;
  icono?: NombreIcono;
  /** Muestra un indicador y bloquea el botón. */
  cargando?: boolean;
  deshabilitado?: boolean;
};

export function Boton({
  titulo,
  variante = "primario",
  icono,
  cargando = false,
  deshabilitado = false,
  ...rest
}: BotonProps) {
  const theme = useTheme();
  const inactivo = deshabilitado || cargando;

  // "Cargando" NO se pinta como "deshabilitado": el botón sigue siendo la
  // acción en curso, y apagarlo deja el indicador gris sobre gris, casi
  // invisible. Solo `deshabilitado` apaga los colores.
  const fondo = {
    primario: deshabilitado ? theme.borde : theme.primarioTexto,
    secundario: theme.primarioSuave,
    texto: "transparent",
  }[variante];

  const colorTexto: Parameters<typeof ThemedText>[0]["themeColor"] = deshabilitado
    ? "textoDeshabilitado"
    : variante === "primario"
      ? "sobrePrimario"
      : "primarioTexto";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      style={({ pressed }) => [
        estilos.base,
        { backgroundColor: fondo },
        variante === "texto" && estilos.sinRelleno,
        // Realimentación al tocar: sin esto el botón se siente muerto.
        pressed && !inactivo && estilos.presionado,
      ]}
      {...rest}
    >
      {cargando ? (
        <ActivityIndicator
          color={variante === "primario" ? theme.sobrePrimario : theme.primarioTexto}
        />
      ) : (
        <View style={estilos.contenido}>
          {icono ? <Icono nombre={icono} tamano="accion" color={colorTexto} /> : null}
          <ThemedText variante="cuerpo" themeColor={colorTexto}>
            {titulo}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: AreaTactilMinima,
    borderRadius: Radios.boton,
    paddingVertical: Espaciado.md,
    paddingHorizontal: Espaciado.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  sinRelleno: {
    paddingVertical: Espaciado.sm,
    paddingHorizontal: Espaciado.sm,
  },
  contenido: {
    flexDirection: "row",
    alignItems: "center",
    gap: Espaciado.sm,
  },
  presionado: {
    opacity: 0.85,
  },
});
