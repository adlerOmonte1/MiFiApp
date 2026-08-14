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
import { DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { Colors } from "@/constants/theme";

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

export default function TabLayout() {
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

  // Sin esto, la app renderiza con la fuente del sistema y "salta" a Nunito
  // al terminar la carga. El splash sigue visible mientras tanto.
  if (!nunitoLista || !monoLista) {
    return null;
  }

  return (
    <ThemeProvider value={TemaNavegacion}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
