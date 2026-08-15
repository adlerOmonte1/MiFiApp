import { fireEvent, render, screen } from "@testing-library/react-native";

import { EstadoVacio } from "./estado-vacio";

describe("EstadoVacio", () => {
  it("muestra título y mensaje", async () => {
    await render(
      <EstadoVacio
        titulo="Todavía no hay movimientos"
        mensaje="Registra tu primer gasto o ingreso."
      />,
    );

    expect(screen.getByText("Todavía no hay movimientos")).toBeOnTheScreen();
    expect(screen.getByText("Registra tu primer gasto o ingreso.")).toBeOnTheScreen();
  });

  it("ofrece una salida cuando se le pasa una acción", async () => {
    const alTocar = jest.fn();
    await render(
      <EstadoVacio
        titulo="Todavía no tienes metas"
        mensaje="Pon un objetivo."
        accion={{ titulo: "Crear meta", onPress: alTocar }}
      />,
    );

    fireEvent.press(screen.getByText("Crear meta"));

    expect(alTocar).toHaveBeenCalledTimes(1);
  });

  it("sin acción, no dibuja ningún botón", async () => {
    await render(<EstadoVacio titulo="Sin gastos este periodo" mensaje="Cuando registres." />);

    expect(screen.queryByRole("button")).toBeNull();
  });
});
