import axios from "axios";

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
