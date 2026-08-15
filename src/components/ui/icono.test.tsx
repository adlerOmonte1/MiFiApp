import { render, screen } from "@testing-library/react-native";

import { Icono } from "./icono";

describe("Icono", () => {
  it("con etiqueta, es accesible para lectores de pantalla", async () => {
    await render(<Icono nombre="comida" accessibilityLabel="Categoría comida" />);

    expect(screen.getByLabelText("Categoría comida")).toBeOnTheScreen();
  });

  it("sin etiqueta, queda oculto: es decorativo", async () => {
    // Un ícono sin label acompaña a un texto visible. Si el lector de
    // pantalla lo anunciara, repetiría la información.
    await render(<Icono nombre="guardar" />);

    expect(screen.root).toHaveProp("importantForAccessibility", "no-hide-descendants");
  });
});
