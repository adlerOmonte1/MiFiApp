import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import type { Esquemas } from "@/api/tipos";

export type Usuario = Esquemas["Usuario"];

/**
 * Sesión del estudiante (RF-06, D-01, D-03).
 *
 * ═══ POR QUÉ HAY TRES ESTADOS Y NO UN BOOLEANO ═══
 *
 * Leer el token del llavero es asíncrono, así que al arrancar la app hay un
 * instante en el que TODAVÍA NO SE SABE si hay sesión. Eso es `desconocido`
 * y no es lo mismo que `sin-sesion`.
 *
 * Si se tratan igual, la app manda al login por un instante y después salta
 * al dashboard: se ve rota, y en un test SUS un participante lo reporta
 * como error. Durante `desconocido` se mantiene el splash
 * (docs/Navegacion.md §5).
 *
 * El JWT vive en `expo-secure-store` —el llavero del sistema— y nunca en
 * AsyncStorage: dura 7 días y AsyncStorage es texto plano.
 */

export type EstadoSesion = "desconocido" | "sin-sesion" | "activa";

const CLAVE_TOKEN = "mifi.token";
const CLAVE_USUARIO = "mifi.usuario";

export type SesionStore = {
  estado: EstadoSesion;
  token: string | null;
  usuario: Usuario | null;

  /** Lee el llavero al arrancar. Resuelve `desconocido`. */
  restaurar: () => Promise<void>;
  /** Tras un registro o login exitoso. */
  iniciar: (token: string, usuario: Usuario) => Promise<void>;
  /** Cierra sesión localmente. Revocar en el servidor es aparte (RF-08). */
  cerrar: () => Promise<void>;
  /** Refresca el usuario guardado, ej. al aceptar el consentimiento. */
  actualizarUsuario: (usuario: Usuario) => Promise<void>;
};

export const useSesion = create<SesionStore>()((set, get) => ({
  estado: "desconocido",
  token: null,
  usuario: null,

  restaurar: async () => {
    try {
      const [token, usuarioCrudo] = await Promise.all([
        SecureStore.getItemAsync(CLAVE_TOKEN),
        SecureStore.getItemAsync(CLAVE_USUARIO),
      ]);

      if (!token || !usuarioCrudo) {
        set({ estado: "sin-sesion", token: null, usuario: null });
        return;
      }

      set({ estado: "activa", token, usuario: JSON.parse(usuarioCrudo) as Usuario });
    } catch {
      // El llavero puede fallar (dispositivo bloqueado, datos corruptos) y
      // JSON.parse puede reventar. Ante la duda, NO hay sesión: es el
      // resultado seguro. Dejar `desconocido` colgaría la app en el splash.
      set({ estado: "sin-sesion", token: null, usuario: null });
    }
  },

  iniciar: async (token, usuario) => {
    await Promise.all([
      SecureStore.setItemAsync(CLAVE_TOKEN, token),
      SecureStore.setItemAsync(CLAVE_USUARIO, JSON.stringify(usuario)),
    ]);
    set({ estado: "activa", token, usuario });
  },

  cerrar: async () => {
    // El estado se limpia SIEMPRE, aunque borrar del llavero falle: dejar al
    // usuario dentro de la app tras pedir cerrar sesión es peor que dejar un
    // token huérfano en el llavero, que además el backend ya revocó.
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(CLAVE_TOKEN),
        SecureStore.deleteItemAsync(CLAVE_USUARIO),
      ]);
    } finally {
      set({ estado: "sin-sesion", token: null, usuario: null });
    }
  },

  actualizarUsuario: async (usuario) => {
    // Sin sesión no hay nada que actualizar: evita dejar un usuario
    // guardado sin token que lo acompañe.
    if (get().estado !== "activa") return;

    await SecureStore.setItemAsync(CLAVE_USUARIO, JSON.stringify(usuario));
    set({ usuario });
  },
}));

/**
 * ¿El usuario aceptó el consentimiento? (RF-47 a RF-49)
 *
 * La comparación es `=== true` a propósito: el contrato declara
 * `consentimientoAceptado` como opcional, así que puede llegar `undefined`.
 * Un `undefined` significa "no lo sé", y ante la duda **no** se habilita el
 * acceso a la parte financiera — es un requisito ético, no una preferencia.
 */
export function tieneConsentimiento(usuario: Usuario | null): boolean {
  return usuario?.consentimientoAceptado === true;
}
