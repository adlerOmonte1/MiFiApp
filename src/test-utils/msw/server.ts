import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/**
 * Servidor de MSW para las pruebas.
 *
 * Intercepta a nivel de red, no mockeando axios. La diferencia importa: las
 * pruebas ejercitan el cliente HTTP de verdad (interceptores, headers,
 * serialización, manejo de errores), y siguen valiendo si algún día se
 * cambia axios por fetch.
 */
export const server = setupServer(...handlers);
