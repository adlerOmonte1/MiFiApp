import { render, screen } from "@testing-library/react-native";

import { ThemedText } from "./themed-text";

// Prueba de humo del renderizado: verifica que jest-expo puede montar un
// componente real de React Native (con StyleSheet, useTheme y el alias "@/")
// y que los matchers de Testing Library están disponibles.
//
// ⚠️ En @testing-library/react-native v14, `render` devuelve una Promise:
// hay que await-earla. Sin el await, `screen` queda vacío y las consultas
// fallan con "`render` function has not been called", que no dice nada sobre
// la causa real. Ver docs/GUIA_INSTALACION.MD §6.
describe("ThemedText", () => {
  it("renderiza su contenido", async () => {
    await render(<ThemedText>Hola MiFi</ThemedText>);

    expect(screen.getByText("Hola MiFi")).toBeOnTheScreen();
  });

  it("aplica el tamaño del tipo pedido", async () => {
    await render(<ThemedText type="title">Título</ThemedText>);

    expect(screen.getByText("Título")).toHaveStyle({ fontSize: 48 });
  });
});
