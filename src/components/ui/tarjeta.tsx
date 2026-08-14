import { StyleSheet, View, type ViewProps } from "react-native";

import { Espaciado, Radios, Sombras } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

/**
 * Superficie elevada. Es el contenedor por defecto de la app: agrupa
 * información sobre el fondo gris de la pantalla.
 */

export type TarjetaProps = ViewProps & {
  /** `grande` usa el radio de 30 (docs/SistemaDiseno.md §5). */
  tamano?: "normal" | "grande";
  /** Sin sombra, para tarjetas dentro de otra superficie. */
  plana?: boolean;
};

export function Tarjeta({ tamano = "normal", plana = false, style, ...rest }: TarjetaProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        estilos.base,
        { backgroundColor: theme.superficie },
        tamano === "grande" && estilos.grande,
        !plana && Sombras.tarjeta,
        style,
      ]}
      {...rest}
    />
  );
}

const estilos = StyleSheet.create({
  base: {
    borderRadius: Radios.tarjeta,
    padding: Espaciado.lg,
    gap: Espaciado.md,
  },
  grande: {
    borderRadius: Radios.tarjetaGrande,
    padding: Espaciado.xl,
  },
});
