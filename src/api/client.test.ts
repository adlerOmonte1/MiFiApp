import { http, HttpResponse } from "msw";

import { useSesion, type Usuario } from "@/stores/sesion.store";
import { server } from "@/test-utils/msw/server";

import { clienteApi } from "./client";
import { CODIGO_CONSENTIMIENTO, ErrorApi } from "./errores";

const API = "http://localhost:3000/api";
const TOKEN = "jwt-de-prueba";
const USUARIO: Usuario = {
  id: "00000000-0000-4000-8000-000000000001",
  nombre: "Ana Quispe",
  correo: "ana@ejemplo.edu.pe",
  consentimientoAceptado: true,
};

beforeEach(() => {
  useSesion.setState({ estado: "desconocido", token: null, usuario: null });
});

describe("clienteApi", () => {
  it("toma la URL base de EXPO_PUBLIC_API_URL", () => {
    expect(clienteApi.defaults.baseURL).toBe(API);
  });

  it("MSW intercepta una petición y devuelve el doble del contrato", async () => {
    const respuesta = await clienteApi.post("/auth/login", {
      correo: "estudiante@ejemplo.edu.pe",
      password: "secreta",
    });

    expect(respuesta.status).toBe(200);
    expect(respuesta.data.token).toBe("jwt-de-prueba");
  });
});

describe("interceptor de petición", () => {
  it("adjunta el token de la sesión activa", async () => {
    await useSesion.getState().iniciar(TOKEN, USUARIO);
    let recibido: string | null = null;

    server.use(
      http.get(`${API}/usuarios/me`, ({ request }) => {
        recibido = request.headers.get("Authorization");
        return HttpResponse.json(USUARIO);
      }),
    );

    await clienteApi.get("/usuarios/me");

    expect(recibido).toBe(`Bearer ${TOKEN}`);
  });

  it("sin sesión, no manda cabecera de autorización", async () => {
    let recibido: string | null = "no-ejecutado";

    server.use(
      http.get(`${API}/usuarios/me`, ({ request }) => {
        recibido = request.headers.get("Authorization");
        return HttpResponse.json(USUARIO);
      }),
    );

    await clienteApi.get("/usuarios/me");

    expect(recibido).toBeNull();
  });

  it("usa el token nuevo después de re-iniciar sesión, no el viejo", async () => {
    await useSesion.getState().iniciar("token-viejo", USUARIO);
    await useSesion.getState().iniciar("token-nuevo", USUARIO);
    let recibido: string | null = null;

    server.use(
      http.get(`${API}/usuarios/me`, ({ request }) => {
        recibido = request.headers.get("Authorization");
        return HttpResponse.json(USUARIO);
      }),
    );

    await clienteApi.get("/usuarios/me");

    // Falla si el token se capturara al crear el cliente en vez de leerlo
    // del store en cada petición.
    expect(recibido).toBe("Bearer token-nuevo");
  });
});

describe("interceptor de respuesta", () => {
  it("un 401 cierra la sesión", async () => {
    await useSesion.getState().iniciar(TOKEN, USUARIO);
    server.use(http.get(`${API}/usuarios/me`, () => new HttpResponse(null, { status: 401 })));

    await expect(clienteApi.get("/usuarios/me")).rejects.toMatchObject({
      tipo: "no-autenticado",
    });

    expect(useSesion.getState().estado).toBe("sin-sesion");
    expect(useSesion.getState().token).toBeNull();
  });

  it("un 403 CONSENTIMIENTO_REQUERIDO mantiene la sesión y marca el consentimiento", async () => {
    await useSesion.getState().iniciar(TOKEN, USUARIO);
    server.use(
      http.get(`${API}/transacciones`, () =>
        HttpResponse.json(
          { codigo: CODIGO_CONSENTIMIENTO, mensaje: "Falta consentimiento" },
          { status: 403 },
        ),
      ),
    );

    await expect(clienteApi.get("/transacciones")).rejects.toMatchObject({
      tipo: "consentimiento-requerido",
    });

    // La sesión NO se borra: hacerlo dejaría al usuario en un ciclo de
    // login del que no puede salir (A-16).
    expect(useSesion.getState().estado).toBe("activa");
    expect(useSesion.getState().token).toBe(TOKEN);
    expect(useSesion.getState().usuario?.consentimientoAceptado).toBe(false);
  });

  it("un 403 por otro motivo no toca la sesión", async () => {
    await useSesion.getState().iniciar(TOKEN, USUARIO);
    server.use(
      http.get(`${API}/errores/resumen`, () =>
        HttpResponse.json({ codigo: "SOLO_INVESTIGADOR" }, { status: 403 }),
      ),
    );

    await expect(clienteApi.get("/errores/resumen")).rejects.toMatchObject({ tipo: "prohibido" });

    expect(useSesion.getState().estado).toBe("activa");
    expect(useSesion.getState().usuario?.consentimientoAceptado).toBe(true);
  });

  it("hacia arriba viaja un ErrorApi, nunca un AxiosError", async () => {
    server.use(http.get(`${API}/transacciones`, () => new HttpResponse(null, { status: 500 })));

    const error = await clienteApi.get("/transacciones").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ErrorApi);
    expect((error as ErrorApi).tipo).toBe("servidor");
    // Con un mensaje listo para mostrar, no el crudo del servidor.
    expect((error as ErrorApi).mensajeUsuario).toBe(
      "Algo falló de nuestro lado. Prueba de nuevo en unos minutos.",
    );
  });
});
