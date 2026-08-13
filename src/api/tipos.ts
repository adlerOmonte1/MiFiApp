import type { components, paths } from "./schema";

/**
 * Atajos sobre los tipos generados desde openapi.yaml.
 *
 * No se escriben interfaces a mano para las entidades de la API: se derivan
 * del contrato. Si el backend renombra un campo, `npm run sync:contract`
 * regenera schema.d.ts y el typecheck acá falla en cada lugar que lo usaba.
 * Esa es toda la razón por la que el frontend es TypeScript (decisión #2).
 */

export type Esquemas = components["schemas"];

/** Cuerpo que espera un endpoint en su request. */
export type CuerpoPeticion<
  Ruta extends keyof paths,
  Metodo extends keyof paths[Ruta],
> = paths[Ruta][Metodo] extends { requestBody: { content: { "application/json": infer C } } }
  ? C
  : never;

/** Cuerpo que devuelve un endpoint en su respuesta 200/201. */
export type RespuestaOk<
  Ruta extends keyof paths,
  Metodo extends keyof paths[Ruta],
> = paths[Ruta][Metodo] extends {
  responses: infer R;
}
  ? R extends { 200: { content: { "application/json": infer C } } }
    ? C
    : R extends { 201: { content: { "application/json": infer C } } }
      ? C
      : never
  : never;
