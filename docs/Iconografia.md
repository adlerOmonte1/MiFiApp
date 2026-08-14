# Iconografía — MiFiApp

> Paso 1.5 del plan. `Wireframes.md` usa placeholders geométricos y deja
> el set final como pendiente de refinamiento.

---

## 1. Qué pide el mockup

> *"Íconos: geométricos simples, rellenos, redondeados (placeholders a
> reemplazar por set final)."*

Tres requisitos: **geométricos**, **rellenos** (no de línea) y
**redondeados** (sin esquinas duras). Encaja con el resto del sistema:
radios altos, Nunito, sombras suaves.

---

## 2. Qué hay hoy en el proyecto

| Paquete | Estado | Sirve |
|:--|:--|:--|
| `expo-symbols` | ✅ instalado | **Solo iOS.** SF Symbols no existe en Android |
| `@expo/vector-icons` | ❌ **no instalado** | Sería el estándar multiplataforma |

El andamiaje usa `expo-symbols` y PNGs sueltos en
`assets/images/tabIcons/`. **Ninguna de las dos cosas sirve como set
final**: SF Symbols deja Android sin íconos, y los PNGs no escalan ni se
tiñen con el tema.

---

## 3. Recomendación: `@expo/vector-icons` con **Ionicons**

```bash
npx expo install @expo/vector-icons
```

**Por qué Ionicons:**

- **Cumple el mockup**: es el set redondeado por definición, y cada ícono
  tiene variante rellena (`home`) y de línea (`home-outline`).
- **Multiplataforma real**: el mismo ícono en iOS y Android. Importa para
  la tesis: si un participante con Android ve íconos distintos, no está
  evaluando la misma interfaz.
- **Cero fricción**: `@expo/vector-icons` es parte del ecosistema Expo, no
  una dependencia de terceros que haya que mantener.
- **Es una fuente, no imágenes**: escala sin pixelarse y se tiñe con
  `color` desde los tokens del tema.

**Alternativas descartadas:**

| Opción | Por qué no |
|:--|:--|
| `expo-symbols` (SF Symbols) | Solo iOS. Habría que mantener dos sets. |
| Lucide | Excelente set, pero es de **línea**; el mockup pide rellenos. |
| Material Icons | Menos redondeado; choca con la forma del sistema. |
| PNGs propios | No escalan, no se tiñen, y hay que dibujar ~30. |

> **Esto es una recomendación, no una decisión tomada.** Si preferís otro
> set, se cambia acá y en un solo componente (§5): ninguna pantalla nombra
> un ícono directamente.

---

## 4. Inventario de íconos

Sacado de las 17 pantallas de `Wireframes.md`. Nombres de Ionicons.

### Tab bar

| Uso | Relleno (activo) | Línea (inactivo) |
|:--|:--|:--|
| Inicio | `home` | `home-outline` |
| Movimientos | `swap-vertical` | `swap-vertical-outline` |
| **＋ central** | `add` | — (siempre relleno) |
| Metas | `flag` | `flag-outline` |
| Perfil | `person` | `person-outline` |

### Categorías de gasto

| Categoría | Ícono |
|:--|:--|
| Comida | `fast-food` |
| Pasaje / Transporte | `bus` |
| Estudio | `book` |
| Ocio | `game-controller` |
| Otros | `ellipsis-horizontal` |
| Categoría propia (RF-53) | `pricetag` (por defecto) |

### Acciones y estados

| Uso | Ícono |
|:--|:--|
| Escanear boleta | `camera` |
| Desde el correo | `mail` |
| Registro manual | `create` |
| Guardar / confirmar | `checkmark-circle` |
| Descartar | `close-circle` |
| Editar | `pencil` |
| Eliminar | `trash` |
| Gasto hormiga | `alert-circle` |
| Ingreso | `arrow-up-circle` |
| Egreso | `arrow-down-circle` |
| Volver | `chevron-back` |
| Ver más | `chevron-forward` |
| Buscar | `search` |
| Filtrar por mes | `calendar` |
| Configuración | `settings` |
| Cerrar sesión | `log-out` |
| Exportar datos | `download` |
| Consentimiento | `document-text` |
| Estado vacío genérico | `folder-open-outline` |

---

## 5. Cómo se usa (la regla)

**Ninguna pantalla importa `Ionicons` ni nombra un ícono directamente.**
Igual que con los colores: se pasa por un componente propio con un catálogo
de nombres semánticos.

```
src/components/ui/icono.tsx     ← el ÚNICO que importa Ionicons
                                   y traduce nombre semántico → nombre del set
```

Una pantalla pide `<Icono nombre="comida" />`, no
`<Ionicons name="fast-food" />`.

**Por qué:** cambiar de set de íconos pasa a ser editar un mapa en un
archivo, en vez de revisar las 17 pantallas. Es la misma inversión de
dependencias que aplica el sistema de diseño con los colores — y la razón
por la que ese cambio, si algún día ocurre, no cuesta un sprint.

### Tamaños

Del sistema de diseño, no sueltos:

| Uso | Tamaño |
|:--|:--|
| Íconos en línea de texto | 16 |
| Íconos de acción / lista | 24 |
| Íconos de categoría en tarjeta | 28 |
| Botón central del tab bar | 32 |
| Ilustración de estado vacío | 64 |

### Accesibilidad

- **Todo ícono sin texto visible al lado lleva `accessibilityLabel`.**
- Un ícono **nunca** es el único portador de significado: el gasto hormiga
  se marca con ícono **y** texto, no solo con el ámbar (daltonismo).
- El área táctil sigue siendo de 44pt aunque el ícono se vea de 24
  (`AreaTactilMinima`).

---

## 6. Pendiente

1. **Confirmar Ionicons** (o elegir otro set).
2. **Instalarlo** y construir `src/components/ui/icono.tsx` — va en el
   paso A1.1, junto con los componentes base.
3. **Ícono de la app y splash**: hoy son los de Expo
   (`assets/images/icon.png`, `splash-icon.png`). Falta el de MiFi. No
   bloquea desarrollo, pero **sí bloquea el piloto**: los participantes van
   a instalar la app en su teléfono y el ícono de Expo se ve a medio hacer.
4. **Retirar los PNGs** de `assets/images/tabIcons/` cuando el tab bar real
   reemplace al del andamiaje.
