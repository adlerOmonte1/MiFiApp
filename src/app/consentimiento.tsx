import { Redirect } from "expo-router";

import { PlaceholderPantalla } from "@/components/placeholder-pantalla";
import { guardaConsentimiento } from "@/navegacion/guardas";
import { useSesion } from "@/stores/sesion.store";

// 02 · Consentimiento informado — la compuerta (docs/Navegacion.md §2).
// Contenido real en A1.6 contra el borrador de docs/TextoConsentimiento.md,
// que todavía no está aprobado por el comité de ética.
export default function Consentimiento() {
  const { estado, usuario } = useSesion();
  const destino = guardaConsentimiento(estado, usuario);

  if (destino) return <Redirect href={destino} />;

  return <PlaceholderPantalla titulo="Consentimiento informado" sprint="A1.6" />;
}
