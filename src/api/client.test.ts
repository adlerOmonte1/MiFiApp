import { http, HttpResponse } from "msw";

import { server } from "@/test-utils/msw/server";

import { clienteApi } from "./client";

// Prueba de humo del andamiaje: verifica que jest-expo transforma el código
// de Expo/RN, que las variables EXPO_PUBLIC_ llegan a las pruebas, y que MSW
// intercepta peticiones reales del cliente HTTP. Si esto falla, el problema
// está en la configuración de Jest, no en la app.
describe("clienteApi", () => {
  it("toma la URL base de EXPO_PUBLIC_API_URL", () => {
    expect(clienteApi.defaults.baseURL).toBe("http://localhost:3000/api");
  });

  it("MSW intercepta una petición y devuelve el doble del contrato", async () => {
    const respuesta = await clienteApi.post("/auth/login", {
      correo: "estudiante@ejemplo.edu.pe",
      password: "secreta",
    });

    expect(respuesta.status).toBe(200);
    expect(respuesta.data.token).toBe("jwt-de-prueba");
  });

  it("una prueba puede sobrescribir el handler para simular un error", async () => {
    server.use(
      http.post("http://localhost:3000/api/auth/login", () =>
        HttpResponse.json({ mensaje: "Credenciales inválidas" }, { status: 401 }),
      ),
    );

    await expect(
      clienteApi.post("/auth/login", { correo: "x@y.pe", password: "mala" }),
    ).rejects.toMatchObject({ response: { status: 401 } });
  });
});
