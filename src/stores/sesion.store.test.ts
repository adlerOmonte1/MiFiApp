import * as SecureStore from "expo-secure-store";

import { tieneConsentimiento, useSesion, type Usuario } from "./sesion.store";

const USUARIO: Usuario = {
  id: "00000000-0000-4000-8000-000000000001",
  nombre: "Estudiante de Prueba",
  correo: "estudiante@ejemplo.edu.pe",
  consentimientoAceptado: false,
};

const TOKEN = "jwt-de-prueba";

// Zustand conserva el estado entre pruebas: se reinicia a mano.
beforeEach(() => {
  useSesion.setState({ estado: "desconocido", token: null, usuario: null });
});

describe("useSesion", () => {
  it("arranca en 'desconocido', que no es lo mismo que 'sin-sesion'", () => {
    // Es la distinción que evita que la app parpadee el login al abrirse.
    expect(useSesion.getState().estado).toBe("desconocido");
  });

  it("sin nada guardado, restaurar deja 'sin-sesion'", async () => {
    await useSesion.getState().restaurar();

    expect(useSesion.getState().estado).toBe("sin-sesion");
    expect(useSesion.getState().token).toBeNull();
  });

  it("iniciar guarda la sesión y el token va al llavero del sistema", async () => {
    await useSesion.getState().iniciar(TOKEN, USUARIO);

    expect(useSesion.getState().estado).toBe("activa");
    expect(useSesion.getState().usuario).toEqual(USUARIO);
    // RF-06: el JWT nunca en AsyncStorage, siempre en expo-secure-store.
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("mifi.token", TOKEN);
  });

  it("al reabrir la app, la sesión sobrevive", async () => {
    await useSesion.getState().iniciar(TOKEN, USUARIO);

    // Simula el arranque en frío: el store se reinicia, el llavero no.
    useSesion.setState({ estado: "desconocido", token: null, usuario: null });
    await useSesion.getState().restaurar();

    expect(useSesion.getState().estado).toBe("activa");
    expect(useSesion.getState().token).toBe(TOKEN);
    expect(useSesion.getState().usuario).toEqual(USUARIO);
  });

  it("cerrar borra la sesión del estado y del llavero", async () => {
    await useSesion.getState().iniciar(TOKEN, USUARIO);
    await useSesion.getState().cerrar();

    expect(useSesion.getState().estado).toBe("sin-sesion");
    expect(useSesion.getState().token).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("mifi.token");

    // Y no reaparece al restaurar.
    await useSesion.getState().restaurar();
    expect(useSesion.getState().estado).toBe("sin-sesion");
  });

  it("cerrar limpia el estado aunque el llavero falle", async () => {
    await useSesion.getState().iniciar(TOKEN, USUARIO);
    jest.mocked(SecureStore.deleteItemAsync).mockRejectedValueOnce(new Error("llavero caído"));

    // Dejar al usuario dentro de la app después de pedir cerrar sesión es
    // peor que dejar un token huérfano, que además el backend ya revocó.
    await expect(useSesion.getState().cerrar()).rejects.toThrow();
    expect(useSesion.getState().estado).toBe("sin-sesion");
    expect(useSesion.getState().token).toBeNull();
  });

  it("con datos corruptos en el llavero, no revienta: deja 'sin-sesion'", async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(TOKEN);
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce("{ esto no es JSON");

    await useSesion.getState().restaurar();

    // Ante la duda, no hay sesión. Quedar en 'desconocido' colgaría la app
    // en el splash para siempre.
    expect(useSesion.getState().estado).toBe("sin-sesion");
  });

  it("actualizarUsuario persiste el cambio, ej. al aceptar el consentimiento", async () => {
    await useSesion.getState().iniciar(TOKEN, USUARIO);

    await useSesion.getState().actualizarUsuario({ ...USUARIO, consentimientoAceptado: true });

    expect(useSesion.getState().usuario?.consentimientoAceptado).toBe(true);

    // Y sobrevive al reinicio.
    useSesion.setState({ estado: "desconocido", token: null, usuario: null });
    await useSesion.getState().restaurar();
    expect(useSesion.getState().usuario?.consentimientoAceptado).toBe(true);
  });

  it("actualizarUsuario sin sesión no guarda nada", async () => {
    await useSesion.getState().actualizarUsuario(USUARIO);

    // Evita dejar un usuario en el llavero sin token que lo acompañe.
    expect(useSesion.getState().usuario).toBeNull();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});

describe("tieneConsentimiento", () => {
  it("es true solo cuando el backend lo confirma", () => {
    expect(tieneConsentimiento({ ...USUARIO, consentimientoAceptado: true })).toBe(true);
    expect(tieneConsentimiento({ ...USUARIO, consentimientoAceptado: false })).toBe(false);
    expect(tieneConsentimiento(null)).toBe(false);
  });

  it("un campo ausente NO habilita el acceso", () => {
    // El contrato declara consentimientoAceptado como opcional, así que
    // puede llegar undefined. "No lo sé" nunca puede significar "pasa":
    // RF-49 es un requisito ético del estudio.
    expect(tieneConsentimiento({ id: "x" })).toBe(false);
  });
});
