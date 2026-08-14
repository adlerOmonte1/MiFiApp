import { render, screen } from "@testing-library/react-native";

import { TextoVariantes } from "@/constants/theme";

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

  it("aplica la variante del sistema de diseño, no un tamaño suelto", async () => {
    await render(<ThemedText variante="monto">S/ 1.234</ThemedText>);

    // Se compara contra el token, no contra un número mágico: si mañana se
    // ajusta la escala tipográfica, esta prueba sigue siendo válida en vez
    // de romperse por un cambio de diseño legítimo.
    expect(screen.getByText("S/ 1.234")).toHaveStyle(TextoVariantes.monto);
  });

  it("mapea los nombres del andamiaje a variantes del sistema", async () => {
    await render(<ThemedText type="title">Título</ThemedText>);

    expect(screen.getByText("Título")).toHaveStyle(TextoVariantes.monto);
  });
});
