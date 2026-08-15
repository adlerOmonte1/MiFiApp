import { Redirect, Slot } from "expo-router";

import { guardaZonaPublica } from "@/navegacion/guardas";
import { useSesion } from "@/stores/sesion.store";

/**
 * Zona pública (docs/Navegacion.md §2): onboarding, registro, login.
 *
 * La decisión de a dónde ir vive en `guardaZonaPublica`, probada aparte —
 * este componente es deliberadamente demasiado simple para tener bug
 * propio.
 */
export default function LayoutPublico() {
  const { estado, usuario } = useSesion();
  const destino = guardaZonaPublica(estado, usuario);

  if (destino) return <Redirect href={destino} />;

  return <Slot />;
}
