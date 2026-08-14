import axios from "axios";

import { useSesion } from "@/stores/sesion.store";

import { traducirError } from "./errores";

/**
 * Cliente HTTP contra MiFiBackend.
 *
 * La URL base sale de EXPO_PUBLIC_API_URL. Expo la reemplaza por su valor
 * en tiempo de build, y SOLO si se la lee como propiedad literal de
 * process.env: `process.env["EXPO_PUBLIC_API_URL"]` no funciona, ni
 * desestructurarla. Ver docs/GUIA_INSTALACION.MD §8.
 */
const urlBase = process.env.EXPO_PUBLIC_API_URL;

if (!urlBase) {
  // Falla ruidosamente en desarrollo: sin esto la app arranca y todas las
  // peticiones pegan contra rutas relativas, que en nativo no existen y dan
  // un "Network Error" sin causa aparente.
  throw new Error(
    "Falta EXPO_PUBLIC_API_URL. Copiá .env.example a .env y reiniciá el " +
      "servidor de Expo (las variables se leen al arrancar, no en caliente).",
  );
}

export const clienteApi = axios.create({
  baseURL: urlBase,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ─────────────────────────────────────────────────────────────────────
// Petición: adjuntar el token
// ─────────────────────────────────────────────────────────────────────

/**
 * El token se lee del store en CADA petición, no se captura al crear el
 * cliente: si se guardara una copia, seguiría mandando el token viejo
 * después de un login o un cierre de sesión.
 */
clienteApi.interceptors.request.use((config) => {
  const { token } = useSesion.getState();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─────────────────────────────────────────────────────────────────────
// Respuesta: traducir errores y reaccionar a los dos rechazos
// ─────────────────────────────────────────────────────────────────────

/**
 * ═══ ESTE INTERCEPTOR NO NAVEGA, Y ES A PROPÓSITO ═══
 *
 * Podría llamar a `router.replace("/login")` acá, pero eso ataría la capa
 * de red a la de navegación y dejaría dos lugares decidiendo a qué pantalla
 * va el usuario: este archivo y los guards.
 *
 * En vez de eso, el interceptor **solo cambia el estado de la sesión**. Los
 * guards de `src/app/(privado)/_layout.tsx` observan ese estado y navegan
 * (A1.4). Una sola fuente de verdad para la navegación, y este módulo se
 * puede probar sin montar un árbol de rutas.
 */
clienteApi.interceptors.response.use(
  (respuesta) => respuesta,
  async (error: unknown) => {
    const errorApi = traducirError(error);
    const sesion = useSesion.getState();

    if (errorApi.tipo === "no-autenticado") {
      // 401 = "no sé quién sos". El token venció o el logout lo revocó
      // (D-03), así que la sesión local ya no vale nada.
      await sesion.cerrar();
    }

    if (errorApi.tipo === "consentimiento-requerido" && sesion.usuario) {
      // 403 CONSENTIMIENTO_REQUERIDO = "sé quién sos, pero todavía no
      // aceptaste". La sesión sigue siendo válida: borrarla dejaría al
      // usuario en un ciclo de login que nunca lo deja entrar (A-16).
      //
      // Se corrige el usuario guardado, que evidentemente decía otra cosa,
      // y el guard lo manda al consentimiento.
      await sesion.actualizarUsuario({ ...sesion.usuario, consentimientoAceptado: false });
    }

    // Hacia arriba viaja el error de dominio, nunca el AxiosError.
    return Promise.reject(errorApi);
  },
);
