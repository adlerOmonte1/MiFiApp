import { server } from "@/test-utils/msw/server";

// Setup compartido de todas las pruebas.
//
// @testing-library/react-native >=12.4 ya trae los matchers integrados
// (toBeOnTheScreen, toHaveTextContent, ...), así que no hace falta importar
// "@testing-library/jest-native": está deprecado y sobra.

// expo-secure-store toca el llavero del sistema, que no existe en el entorno
// de Jest. Se mockea acá (y no en cada prueba) porque lo usa el store de
// sesión, que a su vez lo usa media app.
jest.mock("expo-secure-store", () => {
  const almacen = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (clave: string) => almacen.get(clave) ?? null),
    setItemAsync: jest.fn(async (clave: string, valor: string) => {
      almacen.set(clave, valor);
    }),
    deleteItemAsync: jest.fn(async (clave: string) => {
      almacen.delete(clave);
    }),
    __almacen: almacen,
  };
});

// MSW intercepta las peticiones HTTP de todas las pruebas.
//
// onUnhandledRequest: "error" es deliberado: una petición sin handler falla
// la prueba en vez de salir a la red de verdad. Sin esto, una prueba mal
// escrita puede pegarle al backend local del desarrollador, pasar en su
// máquina y fallar en CI.
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  // Descarta los handlers que una prueba haya agregado con server.use(),
  // para que no se filtren a la siguiente.
  server.resetHandlers();

  // Vacía el llavero simulado. `clearAllMocks` borra el registro de
  // llamadas pero NO el Map de arriba: sin esto, un token guardado por una
  // prueba sigue ahí en la siguiente y las pruebas pasan por el orden en
  // que corren, no por lo que hacen.
  (jest.requireMock("expo-secure-store") as { __almacen: Map<string, string> }).__almacen.clear();

  jest.clearAllMocks();
});

afterAll(() => {
  server.close();
});
