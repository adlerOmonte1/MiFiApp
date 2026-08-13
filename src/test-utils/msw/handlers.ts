import { http, HttpResponse } from "msw";

import type { RespuestaOk } from "@/api/tipos";

const API = process.env.EXPO_PUBLIC_API_URL;

/**
 * Handlers por defecto de MSW: el "camino feliz" de la API.
 *
 * Están tipados contra el contrato (RespuestaOk<...>), así que si el backend
 * cambia la forma de una respuesta en openapi.yaml, estos dobles dejan de
 * compilar. Es lo que evita el problema clásico de los mocks: que las
 * pruebas sigan en verde contra una API que ya no existe.
 *
 * Cada prueba puede sobrescribir lo que necesite con server.use(...).
 */

const login: RespuestaOk<"/auth/login", "post"> = {
  token: "jwt-de-prueba",
  usuario: {
    id: "00000000-0000-4000-8000-000000000001",
    nombre: "Estudiante de Prueba",
    correo: "estudiante@ejemplo.edu.pe",
  },
};

export const handlers = [http.post(`${API}/auth/login`, () => HttpResponse.json(login))];
