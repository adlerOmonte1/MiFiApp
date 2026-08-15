import axios from "axios";

import type { Esquemas } from "./tipos";

/**
 * Errores de la API, traducidos a dominio.
 *
 * Nada por encima de `src/api/` debe ver un `AxiosError`: un hook o una
 * pantalla no tienen por qué saber qué es un código HTTP. Acá se traduce
 * una vez y hacia arriba viaja un `ErrorApi` con un `tipo` sobre el que se
 * puede hacer `switch`.
 */

export type TipoError =
  | "sin-conexion"
  | "no-autenticado" // 401 — el token no sirve
  | "consentimiento-requerido" // 403 CONSENTIMIENTO_REQUERIDO
  | "prohibido" // 403 por cualquier otro motivo
  | "no-encontrado" // 404 — incluye "es de otro usuario" (D-05)
  | "validacion" // 400
  | "conflicto" // 409
  | "bloqueado" // 423 — cuenta bloqueada (RF-07)
  | "servidor" // 5xx
  | "desconocido";

/** Código que el backend usa para exigir el consentimiento (RF-49). */
export const CODIGO_CONSENTIMIENTO = "CONSENTIMIENTO_REQUERIDO";

/**
 * Mensajes por defecto, de docs/ContenidoUI.md §6.
 *
 * Están acá para que ninguna petición pueda terminar mostrando el texto
 * crudo del servidor: puede traer detalle técnico que no le sirve al
 * estudiante y que además puede filtrar información.
 *
 * Una pantalla puede mostrar algo más específico según el caso (por
 * ejemplo, el 409 del registro es "Ese correo ya está registrado"), pero
 * nunca menos claro que esto.
 */
const MENSAJES: Record<TipoError, string> = {
  "sin-conexion": "Sin conexión. Revisa tu internet.",
  "no-autenticado": "Tu sesión terminó. Inicia sesión de nuevo.",
  "consentimiento-requerido": "Necesitas aceptar el consentimiento para continuar.",
  prohibido: "No tienes acceso a esto.",
  // Nunca "no tienes permiso": el backend responde 404 también cuando el
  // recurso es de otro usuario (D-05, anti-IDOR) justamente para no revelar
  // que existe. Decir lo otro anularía esa protección.
  "no-encontrado": "No encontramos lo que buscabas.",
  validacion: "Revisa los datos e inténtalo de nuevo.",
  conflicto: "Ese dato ya está registrado.",
  bloqueado: "Demasiados intentos. Espera unos minutos antes de volver a probar.",
  servidor: "Algo falló de nuestro lado. Prueba de nuevo en unos minutos.",
  desconocido: "Algo no salió como esperábamos. Inténtalo de nuevo.",
};

export class ErrorApi extends Error {
  readonly tipo: TipoError;
  readonly estado: number | undefined;
  readonly codigo: string | undefined;
  /** Texto listo para mostrar. Nunca es el mensaje crudo del servidor. */
  readonly mensajeUsuario: string;

  constructor(tipo: TipoError, estado?: number, codigo?: string) {
    super(`${tipo}${estado ? ` (HTTP ${estado})` : ""}`);
    this.name = "ErrorApi";
    this.tipo = tipo;
    this.estado = estado;
    this.codigo = codigo;
    this.mensajeUsuario = MENSAJES[tipo];
  }
}

/** Traduce cualquier cosa que lance axios a un `ErrorApi`. */
export function traducirError(error: unknown): ErrorApi {
  if (error instanceof ErrorApi) return error;

  if (!axios.isAxiosError(error)) {
    return new ErrorApi("desconocido");
  }

  // Sin respuesta = nunca llegó al servidor: sin internet, DNS, timeout.
  if (!error.response) {
    return new ErrorApi("sin-conexion");
  }

  const estado = error.response.status;
  const cuerpo = error.response.data as Esquemas["ErrorResponse"] | undefined;
  const codigo = cuerpo?.codigo;

  if (estado === 403) {
    // La distinción que sostiene el flujo de consentimiento: un 403 con
    // este código NO es "no tienes permiso", es "todavía no aceptaste".
    return new ErrorApi(
      codigo === CODIGO_CONSENTIMIENTO ? "consentimiento-requerido" : "prohibido",
      estado,
      codigo,
    );
  }

  const porEstado: Record<number, TipoError> = {
    400: "validacion",
    401: "no-autenticado",
    404: "no-encontrado",
    409: "conflicto",
    423: "bloqueado",
  };

  const tipo = porEstado[estado] ?? (estado >= 500 ? "servidor" : "desconocido");
  return new ErrorApi(tipo, estado, codigo);
}
