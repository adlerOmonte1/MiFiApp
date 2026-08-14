import { fireEvent, render, screen } from "@testing-library/react-native";

import { Boton } from "./boton";

describe("Boton", () => {
  it("muestra su título y responde al toque", async () => {
    const alTocar = jest.fn();
    await render(<Boton titulo="Crear cuenta" onPress={alTocar} />);

    fireEvent.press(screen.getByText("Crear cuenta"));

    expect(alTocar).toHaveBeenCalledTimes(1);
  });

  it("no responde al toque cuando está deshabilitado", async () => {
    const alTocar = jest.fn();
    await render(<Boton titulo="Guardar" onPress={alTocar} deshabilitado />);

    fireEvent.press(screen.getByText("Guardar"));

    expect(alTocar).not.toHaveBeenCalled();
  });

  it("mientras carga, oculta el título y bloquea el toque", async () => {
    const alTocar = jest.fn();
    await render(<Boton titulo="Entrar" onPress={alTocar} cargando />);

    // El título desaparece: el indicador ocupa su lugar.
    expect(screen.queryByText("Entrar")).toBeNull();

    const boton = screen.getByRole("button");
    fireEvent.press(boton);
    expect(alTocar).not.toHaveBeenCalled();
    expect(boton).toBeDisabled();
    expect(boton).toBeBusy();
  });
});
