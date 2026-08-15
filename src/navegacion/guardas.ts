import type { Href } from "expo-router";

import { tieneConsentimiento, type EstadoSesion, type Usuario } from "@/stores/sesion.store";

/**
 * Decisiones de acceso de las tres zonas de la app (docs/Navegacion.md §2 y
 * §5). Son funciones puras a propósito: nada de React ni de expo-router más
 * que el tipo `Href`.
 *
 * ═══ POR QUÉ SEPARADAS DE LOS LAYOUTS ═══
 *
 * `<Redirect>` y `<Slot>` de expo-router exigen el árbol de navegación
 * completo para montarse — ni `render()` de Testing Library los levanta
 * sueltos. Mezclar la decisión ("¿a dónde voy?") con el mecanismo de
 * navegación ("Redirect href=...") ataría toda esta lógica a un
 * `renderRouter` que resultó frágil en esta versión de Expo/Jest.
 *
 * Separando la decisión, se prueba exhaustivamente con Jest común — sin
 * simulador, sin montar rutas — y el layout que la usa queda en dos líneas,
 * demasiado simple para tener su propio bug.
 *
 * El tipo de retorno es `Href`, no `string`: con `typedRoutes` activo
 * (`app.json`), TypeScript rechaza una ruta mal escrita en compilación en
 * vez de descubrirla navegando a mano.
 *
 * Devuelven la ruta a la que redirigir, o `null` si la pantalla actual
 * puede quedarse donde está.
 */

export function guardaZonaPublica(estado: EstadoSesion, usuario: Usuario | null): Href | null {
  // Sin sesión (o todavía no se sabe), la zona pública es exactamente donde
  // tiene que estar el usuario: no se redirige.
  if (estado !== "activa") return null;

  return tieneConsentimiento(usuario) ? "/" : "/consentimiento";
}

export function guardaZonaPrivada(estado: EstadoSesion, usuario: Usuario | null): Href | null {
  // `desconocido` es responsabilidad del layout raíz (mantiene el splash y
  // no deja llegar acá). Si de todos modos llegara, no se redirige a
  // ciegas: ante la duda, no se actúa sobre información incompleta.
  if (estado === "desconocido") return null;
  if (estado === "sin-sesion") return "/onboarding";
  if (!tieneConsentimiento(usuario)) return "/consentimiento";

  return null;
}

/**
 * `/consentimiento` no vive en ninguna de las dos zonas (es la compuerta):
 * necesita sesión para ser auditable (RF-48) pero el usuario, por
 * definición, todavía no la tiene aceptada.
 */
export function guardaConsentimiento(estado: EstadoSesion, usuario: Usuario | null): Href | null {
  if (estado === "desconocido") return null;
  if (estado !== "activa") return "/onboarding";
  if (tieneConsentimiento(usuario)) return "/";

  return null;
}
