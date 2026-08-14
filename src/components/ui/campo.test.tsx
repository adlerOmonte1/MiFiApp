import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { Colors } from "@/constants/theme";

import { Campo } from "./campo";

describe("Campo", () => {
  it("muestra el label y el texto de ayuda", async () => {
    await render(<Campo label="Contraseña" ayuda="Mínimo 8 caracteres" />);

    expect(screen.getByText("Contraseña")).toBeOnTheScreen();
    expect(screen.getByText("Mínimo 8 caracteres")).toBeOnTheScreen();
  });

  it("el error reemplaza a la ayuda y se anuncia a lectores de pantalla", async () => {
    await render(
      <Campo
        label="Contraseña"
        ayuda="Mínimo 8 caracteres"
        error="La contraseña necesita al menos 8 caracteres"
      />,
    );

    const error = screen.getByText("La contraseña necesita al menos 8 caracteres");
    expect(error).toBeOnTheScreen();
    expect(error).toHaveProp("accessibilityLiveRegion", "polite");
    // La ayuda se va: dos mensajes a la vez compiten por la atención.
    expect(screen.queryByText("Mínimo 8 caracteres")).toBeNull();
  });

  it("el label sigue visible después de escribir (no es un placeholder)", async () => {
    await render(<Campo label="Correo" placeholder="tucorreo@ejemplo.com" />);

    fireEvent.changeText(screen.getByLabelText("Correo"), "ana@ejemplo.edu.pe");

    expect(screen.getByText("Correo")).toBeOnTheScreen();
  });

  it("un campo secreto se puede mostrar y volver a ocultar", async () => {
    await render(<Campo label="Contraseña" esSecreto />);

    expect(screen.getByLabelText("Contraseña")).toHaveProp("secureTextEntry", true);

    // Ojo: en Testing Library v14 el re-render posterior a un fireEvent que
    // cambia estado es asíncrono. Sin waitFor, se lee el árbol viejo y la
    // prueba falla como si el componente estuviera roto.
    fireEvent.press(screen.getByLabelText("Mostrar contraseña"));
    await waitFor(() =>
      expect(screen.getByLabelText("Contraseña")).toHaveProp("secureTextEntry", false),
    );

    fireEvent.press(screen.getByLabelText("Ocultar contraseña"));
    await waitFor(() =>
      expect(screen.getByLabelText("Contraseña")).toHaveProp("secureTextEntry", true),
    );
  });

  it("en error, el borde toma el color de error del tema", async () => {
    await render(<Campo label="Correo" error="Ese correo no parece válido" />);

    // Se compara contra el token, no contra un hex suelto.
    expect(screen.getByLabelText("Correo").parent).toHaveStyle({
      borderColor: Colors.light.error,
    });
  });
});
