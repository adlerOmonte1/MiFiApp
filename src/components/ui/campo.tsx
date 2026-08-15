import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { AreaTactilMinima, Espaciado, Radios, TextoVariantes } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

import { ThemedText } from "../themed-text";
import { Icono } from "./icono";

/**
 * Campo de formulario.
 *
 * El label es SIEMPRE visible, nunca solo un placeholder: el placeholder
 * desaparece al escribir y deja al usuario sin saber qué estaba llenando
 * (docs/ContenidoUI.md §7).
 */

export type CampoProps = Omit<TextInputProps, "style" | "secureTextEntry"> & {
  label: string;
  /** Texto de ayuda permanente, ej. "Mínimo 8 caracteres" (RF-03). */
  ayuda?: string;
  /** Mensaje de error. Su presencia pone el campo en estado de error. */
  error?: string;
  /** Campo de contraseña, con botón para mostrar u ocultar. */
  esSecreto?: boolean;
};

export function Campo({ label, ayuda, error, esSecreto = false, ...rest }: CampoProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [enfocado, setEnfocado] = useState(false);

  const colorBorde = error ? theme.error : enfocado ? theme.primarioTexto : theme.borde;

  return (
    <View style={estilos.grupo}>
      <ThemedText variante="etiqueta" themeColor="textoSecundario">
        {label}
      </ThemedText>

      <View style={[estilos.caja, { borderColor: colorBorde, backgroundColor: theme.superficie }]}>
        <TextInput
          style={[estilos.entrada, { color: theme.texto }]}
          placeholderTextColor={theme.textoDeshabilitado}
          secureTextEntry={esSecreto && !visible}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          accessibilityLabel={label}
          // Anuncia el error a los lectores de pantalla; sin esto el error
          // solo existe para quien puede verlo en rojo.
          accessibilityHint={error ?? ayuda}
          {...rest}
        />

        {esSecreto ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            // La etiqueta va en el botón, no en el ícono: lo que se toca y
            // lo que anuncia el lector de pantalla tienen que ser el mismo
            // elemento. El ícono queda decorativo.
            accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            hitSlop={Espaciado.md}
            style={estilos.ojo}
          >
            <Icono nombre={visible ? "ocultar" : "ver"} tamano="accion" color="textoSecundario" />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <ThemedText variante="micro" themeColor="error" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : ayuda ? (
        <ThemedText variante="micro" themeColor="textoSecundario">
          {ayuda}
        </ThemedText>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: {
    gap: Espaciado.xs,
  },
  caja: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: AreaTactilMinima,
    borderWidth: 1,
    borderRadius: Radios.boton,
    paddingHorizontal: Espaciado.lg,
  },
  entrada: {
    flex: 1,
    paddingVertical: Espaciado.md,
    ...TextoVariantes.cuerpo,
  },
  ojo: {
    paddingLeft: Espaciado.sm,
  },
});
