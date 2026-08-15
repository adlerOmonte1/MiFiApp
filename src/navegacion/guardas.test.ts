import type { Usuario } from "@/stores/sesion.store";

import { guardaConsentimiento, guardaZonaPrivada, guardaZonaPublica } from "./guardas";

const SIN_CONSENTIMIENTO: Usuario = { id: "u1", consentimientoAceptado: false };
const CON_CONSENTIMIENTO: Usuario = { id: "u1", consentimientoAceptado: true };
// El contrato declara el campo opcional: puede llegar sin él.
const CAMPO_AUSENTE: Usuario = { id: "u1" };

describe("guardaZonaPublica", () => {
  // Tabla de docs/Navegacion.md §5, filas 1, 3 y 5.
  it("sin sesión, se queda en la zona pública", () => {
    expect(guardaZonaPublica("sin-sesion", null)).toBeNull();
  });

  it("estado desconocido, se queda (no se redirige a ciegas)", () => {
    expect(guardaZonaPublica("desconocido", null)).toBeNull();
  });

  it("con sesión y sin consentimiento, va al consentimiento", () => {
    expect(guardaZonaPublica("activa", SIN_CONSENTIMIENTO)).toBe("/consentimiento");
  });

  it("con sesión y consentimiento, va al dashboard", () => {
    expect(guardaZonaPublica("activa", CON_CONSENTIMIENTO)).toBe("/");
  });

  it("con sesión y el campo ausente, trata como sin consentimiento", () => {
    // undefined nunca puede significar "pasa" (RF-49 es un requisito ético).
    expect(guardaZonaPublica("activa", CAMPO_AUSENTE)).toBe("/consentimiento");
  });
});

describe("guardaZonaPrivada", () => {
  // Tabla §5, filas 2 y 3 (la privada nunca se queda quieta sin sesión).
  it("sin sesión, va al onboarding", () => {
    expect(guardaZonaPrivada("sin-sesion", null)).toBe("/onboarding");
  });

  it("con sesión y sin consentimiento, va al consentimiento", () => {
    expect(guardaZonaPrivada("activa", SIN_CONSENTIMIENTO)).toBe("/consentimiento");
  });

  it("con sesión y consentimiento, se queda en la zona privada", () => {
    expect(guardaZonaPrivada("activa", CON_CONSENTIMIENTO)).toBeNull();
  });

  it("estado desconocido, no redirige (responsabilidad del layout raíz)", () => {
    expect(guardaZonaPrivada("desconocido", null)).toBeNull();
  });
});

describe("guardaConsentimiento", () => {
  it("sin sesión, va al onboarding: no es auditable sin usuario (RF-48)", () => {
    expect(guardaConsentimiento("sin-sesion", null)).toBe("/onboarding");
  });

  it("con sesión y ya aceptado, no tiene nada que hacer acá: va al dashboard", () => {
    expect(guardaConsentimiento("activa", CON_CONSENTIMIENTO)).toBe("/");
  });

  it("con sesión y sin aceptar, se queda: es la pantalla correcta", () => {
    expect(guardaConsentimiento("activa", SIN_CONSENTIMIENTO)).toBeNull();
  });

  it("estado desconocido, no redirige", () => {
    expect(guardaConsentimiento("desconocido", null)).toBeNull();
  });
});
