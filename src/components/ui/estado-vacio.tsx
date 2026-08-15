import { StyleSheet, View } from "react-native";

import { Espaciado } from "@/constants/theme";

import { ThemedText } from "../themed-text";
import { Boton } from "./boton";
import { Icono, type NombreIcono } from "./icono";

/**
 * Estado vacío.
 *
 * Toda pantalla que liste algo tiene que resolverlo (docs/EstrategiaPruebas.md §5).
 * No es decoración: el vacío del dashboard es la primera pantalla real que
 * ve un participante recién inscrito, y si no lo invita a registrar, no se
 * genera el dato que la tesis mide.
 *
 * Por eso `accion` existe: un estado vacío sin salida deja al usuario
 * mirando un mensaje sin saber qué hacer.
 */

export type EstadoVacioProps = {
  titulo: string;
  mensaje: string;
  icono?: NombreIcono;
  accion?: { titulo: string; onPress: () => void };
};

export function EstadoVacio({ titulo, mensaje, icono = "vacio", accion }: EstadoVacioProps) {
  return (
    <View style={estilos.centro}>
      <Icono nombre={icono} tamano="vacio" color="textoDeshabilitado" />

      <View style={estilos.textos}>
        <ThemedText variante="subtitulo" style={estilos.centrado}>
          {titulo}
        </ThemedText>
        <ThemedText variante="cuerpoSuave" themeColor="textoSecundario" style={estilos.centrado}>
          {mensaje}
        </ThemedText>
      </View>

      {accion ? <Boton titulo={accion.titulo} onPress={accion.onPress} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Espaciado.xl,
    gap: Espaciado.lg,
  },
  textos: {
    alignItems: "center",
    gap: Espaciado.xs,
  },
  centrado: {
    textAlign: "center",
  },
});
