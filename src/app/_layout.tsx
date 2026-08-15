import {
  JetBrainsMono_400Regular,
  useFonts as useFuentesMono,
} from "@expo-google-fonts/jetbrains-mono";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts as useFuentesNunito,
} from "@expo-google-fonts/nunito";
import { DefaultTheme, Slot, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Colors } from "@/constants/theme";
import { useSesion } from "@/stores/sesion.store";

SplashScreen.preventAutoHideAsync();

/**
 * Tema de navegación derivado de nuestros tokens.
 *
 * expo-router pinta los fondos de las pantallas y la barra por su cuenta;
 * si no se le pasan nuestros colores, aparecen destellos blancos del tema
 * por defecto al navegar. Se define fuera del componente para no recrearlo
 * en cada render.
 */
const TemaNavegacion = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primario,
    background: Colors.light.fondo,
    card: Colors.light.superficie,
    text: Colors.light.texto,
    border: Colors.light.borde,
  },
};

export default function LayoutRaiz() {
  // Cada peso de Nunito es una familia distinta, no un fontWeight: hay que
  // cargarlos todos los que use TextoVariantes o el texto cae al system font.
  const [nunitoLista] = useFuentesNunito({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });
  const [monoLista] = useFuentesMono({ JetBrainsMono_400Regular });

  const estado = useSesion((s) => s.estado);
  const restaurar = useSesion((s) => s.restaurar);

  // Una sola vez: lee el llavero y resuelve `desconocido` a `sin-sesion` o
  // `activa` (src/stores/sesion.store.ts).
  useEffect(() => {
    void restaurar();
  }, [restaurar]);

  // `desconocido` NO es `sin-sesion` (docs/Navegacion.md §5 "Estado de
  // arranque"): tratarlos igual haría que la app muestre el onboarding por
  // un instante y salte al dashboard apenas resuelve — se ve rota, y en un
  // test SUS un participante lo reporta como error. Mientras tanto se
  // mantiene el splash nativo: sin fuentes ni sesión resueltas no se monta
  // nada, así que `AnimatedSplashOverlay` (que es quien llama a
  // `SplashScreen.hideAsync()`) tampoco se monta todavía.
  if (!nunitoLista || !monoLista || estado === "desconocido") {
    return null;
  }

  return (
    <ThemeProvider value={TemaNavegacion}>
      <AnimatedSplashOverlay />
      <Slot />
    </ThemeProvider>
  );
}
