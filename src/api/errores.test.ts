import { AxiosError, AxiosHeaders } from "axios";

import { CODIGO_CONSENTIMIENTO, ErrorApi, traducirError, type TipoError } from "./errores";

/** Arma un AxiosError con respuesta, como el que produce una petición real. */
function respuestaCon(estado: number, cuerpo?: unknown): AxiosError {
  const error = new AxiosError("fallo");
  error.response = {
    status: estado,
    statusText: "",
    data: cuerpo,
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe("traducirError", () => {
  it.each<[number, TipoError]>([
    [400, "validacion"],
    [401, "no-autenticado"],
    [404, "no-encontrado"],
    [409, "conflicto"],
    [423, "bloqueado"],
    [500, "servidor"],
    [503, "servidor"],
    [418, "desconocido"],
  ])("un %i se traduce a '%s'", (estado, esperado) => {
    expect(traducirError(respuestaCon(estado)).tipo).toBe(esperado);
  });

  it("distingue el 403 de consentimiento del 403 común", () => {
    const consentimiento = traducirError(
      respuestaCon(403, { codigo: CODIGO_CONSENTIMIENTO, mensaje: "Falta aceptar" }),
    );
    const prohibido = traducirError(respuestaCon(403, { codigo: "SOLO_INVESTIGADOR" }));

    // Es la distinción de la que depende todo el flujo de consentimiento.
    expect(consentimiento.tipo).toBe("consentimiento-requerido");
    expect(prohibido.tipo).toBe("prohibido");
  });

  it("un 403 sin código en el cuerpo se trata como prohibido", () => {
    expect(traducirError(respuestaCon(403)).tipo).toBe("prohibido");
  });

  it("sin respuesta del servidor, es falta de conexión", () => {
    // Es el caso de "no llegó nunca": sin internet, DNS caído, timeout.
    expect(traducirError(new AxiosError("Network Error")).tipo).toBe("sin-conexion");
  });

  it("algo que no es un error de axios no revienta", () => {
    expect(traducirError(new Error("cualquier cosa")).tipo).toBe("desconocido");
    expect(traducirError("un string suelto").tipo).toBe("desconocido");
  });

  it("un ErrorApi que ya pasó por acá no se vuelve a traducir", () => {
    const original = new ErrorApi("bloqueado", 423);

    expect(traducirError(original)).toBe(original);
  });

  it("el 404 no dice 'no tienes permiso'", () => {
    // El backend responde 404 también cuando el recurso es de otro usuario
    // (D-05, anti-IDOR). Si la UI dijera "sin permiso", revelaría que el
    // recurso existe y anularía la protección del servidor.
    const mensaje = traducirError(respuestaCon(404)).mensajeUsuario;

    expect(mensaje).toBe("No encontramos lo que buscabas.");
    expect(mensaje).not.toMatch(/permiso|acceso|autoriza/i);
  });

  it("nunca expone el mensaje crudo del servidor", () => {
    const error = traducirError(
      respuestaCon(500, { mensaje: "PrismaClientKnownRequestError en tabla usuarios" }),
    );

    // Puede traer detalle técnico que no le sirve al estudiante y que
    // además puede filtrar información del sistema.
    expect(error.mensajeUsuario).not.toContain("Prisma");
  });
});
