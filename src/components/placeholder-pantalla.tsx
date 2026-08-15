import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Espaciado } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

import { ThemedText } from "./themed-text";

/**
 * Marcador temporal para una ruta cuyo contenido real todavía no se
 * construyó. Existe SOLO mientras el árbol de rutas de A1.4 va por delante
 * del contenido de A1.5/A1.6 — se reemplaza pantalla por pantalla y este
 * componente termina sin usos.
 */
export function PlaceholderPantalla({ titulo, sprint }: { titulo: string; sprint: string }) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[estilos.contenedor, { backgroundColor: theme.fondo }]}>
      <ThemedText variante="titulo">{titulo}</ThemedText>
      <ThemedText variante="cuerpoSuave" themeColor="textoSecundario">
        Contenido real pendiente — {sprint}
      </ThemedText>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: "center", justifyContent: "center", gap: Espaciado.sm },
});
