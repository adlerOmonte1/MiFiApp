import { Redirect, Slot } from "expo-router";

import { guardaZonaPrivada } from "@/navegacion/guardas";
import { useSesion } from "@/stores/sesion.store";

/**
 * Zona privada (docs/Navegacion.md §2): todo lo que exige sesión Y
 * consentimiento. El guard se aplica UNA sola vez acá — ninguna pantalla
 * de adentro vuelve a comprobar sesión ni consentimiento (§1: si cada
 * pantalla validara, tarde o temprano una se olvida).
 */
export default function LayoutPrivado() {
  const { estado, usuario } = useSesion();
  const destino = guardaZonaPrivada(estado, usuario);

  if (destino) return <Redirect href={destino} />;

  return <Slot />;
}
