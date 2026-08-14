# Sistema de diseño de MiFi — v1

> Fuente de verdad en código: **`src/constants/theme.ts`**.
> Este documento explica el *porqué*; el archivo manda sobre los valores.
> Si los dos difieren, el código tiene razón y este documento está viejo.

---

## 0. Para qué existe este documento

MiFi es el **instrumento de medición de una tesis**, no un producto
comercial. Dos consecuencias que mandan sobre todo lo demás:

1. **La usabilidad es una variable medida** (test SUS en el piloto). Un
   flujo confuso no es deuda estética: es ruido en los datos de O₁/O₂.
2. **La experiencia tiene que ser la misma para todos los participantes.**
   Si dos personas ven la app distinta, sus puntajes SUS no son
   comparables.

`Wireframes.md` define *qué* elementos lleva cada una de las 17 pantallas,
con trazabilidad a HU/RF. **No define cómo se ven.** Este documento llena
ese hueco.

---

## 1. La regla que sostiene todo

> **Ningún componente ni pantalla escribe un color, un tamaño de fuente, un
> radio o una sombra literal. Todo sale de `theme.ts`.**

No es una recomendación: **está aplicada por ESLint** y el CI falla si se
rompe (`eslint.config.js`, regla `no-restricted-syntax`).

```
✗ backgroundColor: "#00A37A"      → error de lint
✗ fontSize: 24                     → error de lint
✓ backgroundColor: theme.primario
✓ <ThemedText variante="titulo">
```

**Por qué tanta insistencia:** sin esto, alguien apura un `#00A37A` en una
pantalla y, meses después, cambiar el verde de marca obliga a revisar las
17. Documentarlo no alcanza — la convención se erosiona sola. Tiene que
fallar en el CI.

---

## 2. Arquitectura del sistema (por qué está en tres niveles)

```
1. Paleta      valores crudos      ← ÚNICO lugar del proyecto con hex
2. Colors      tokens semánticos   ← nombran el ROL: "primario", no "verde"
3. Variantes   combinaciones listas ← TextoVariantes, Sombras, ColoresCategoria
```

Los componentes usan los niveles **2 y 3, nunca el 1**. Esa indirección es
inversión de dependencias aplicada al diseño: un botón depende de
`primario` (una abstracción), no de `#00A37A` (un detalle).

Y es lo que hace que cambiar la marca sea **una línea**:

```ts
// Cambiar el verde de toda la app:
const Paleta = { esmeralda: "#00A37A", ... }   // ← solo acá
```

### SOLID, aplicado al sistema de diseño

| Principio | Cómo se cumple |
|:--|:--|
| **S** | Cada grupo de tokens tiene una responsabilidad: `Colors` no sabe de tipografía, `Espaciado` no sabe de color. |
| **O** | Agregar una categoría es sumar una entrada a `ColoresCategoria`; agregar un estilo de texto es sumar a `TextoVariantes`. Ningún componente existente se toca. |
| **L** | Toda variante de `TextoVariantes` es intercambiable: `ThemedText` funciona con cualquiera sin condicionales. |
| **I** | Un componente pide `variante="monto"`, no un objeto de estilos entero. Recibe lo que necesita, nada más. |
| **D** | Los componentes dependen de `useTheme()`, nunca de `Colors` directo ni de un hex. El día que exista modo oscuro, cambia el hook y ninguna pantalla se entera. |

---

## 3. Color

### Paleta

| Rol | Token | Valor |
|:--|:--|:--|
| Marca | `primario` | `#00A37A` esmeralda |
| Marca, presionado | `primarioPresionado` | `#04835F` |
| Marca, fondo suave | `primarioSuave` | `#EAF6F1` |
| **Gasto hormiga / alertas** | `alerta` | `#F59E0B` ámbar |
| Alerta, fondo | `alertaSuave` | `#FEF3E2` |
| Categoría secundaria | `categoriaAzul` | `#6F7DA8` |
| Categoría secundaria | `categoriaMorada` | `#8B6FB0` |
| Error / descartar | `error` | `#B0564A` terracota |
| Fondo de pantalla | `fondo` | `#F6F8F7` |
| Tarjetas | `superficie` | `#FFFFFF` |
| Bordes | `borde` | `#E9EDEB` |
| Texto principal | `texto` | `#1D2320` |
| Texto secundario | `textoSecundario` | `#77827D` |

### Decisiones de color

- **El texto nunca es negro puro.** `#1D2320` a pantalla completa cansa
  menos la vista y se ve menos duro.
- **El ámbar es exclusivo del gasto hormiga y las alertas.** Es el
  indicador central de la tesis (RF-38, D-15): si se usa el ámbar de
  adorno en otro lado, pierde su significado.
- **El error es terracota, no rojo puro.** La app le muestra a un
  estudiante sus errores de gasto; un rojo de alarma lo hace sentir
  juzgado. Terracota comunica sin agredir.
- **Verde = dinero disponible y acciones positivas.** No usar el primario
  para acciones destructivas.

### Contraste (WCAG AA) — medido, no estimado

Se calcularon los ratios reales de la paleta del mockup. **Cuatro pares no
llegaban al 4,5:1 que pide WCAG AA para texto normal:**

| Par | Ratio original | Ajuste | Ratio final |
|:--|:--|:--|:--|
| Blanco sobre `#00A37A` | 3,22 ❌ | usar `#04835F` con texto | 4,75 ✅ |
| `#00A37A` como texto sobre blanco | 3,22 ❌ | `primarioTexto` `#04835F` | 4,75 ✅ |
| `#F59E0B` como texto sobre blanco | **2,15** ❌ | `alertaTexto` `#B45309` | 5,02 ✅ |
| `textoSecundario` `#77827D` | 3,98 ❌ | oscurecido a `#67726D` | 4,99 ✅ |

**Lo que cambió y lo que no.** La identidad visual del mockup se conserva:
el verde brillante `#00A37A` sigue siendo el color de marca en **fondos de
botón, botón central, logo e íconos grandes**, que es donde se ve. Lo que
se agregó son tokens paralelos para **texto**, donde el contraste manda:

- `primario` → superficies · `primarioTexto` → texto e íconos chicos
- `alerta` → fondos, bordes e íconos · `alertaTexto` → texto

El ámbar `#F59E0B` **nunca va como texto sobre blanco** (2,15:1 es
prácticamente ilegible). Como fondo con texto tinta encima da 14,57:1, así
que la forma correcta de mostrar una alerta de gasto hormiga es una píldora
`alertaSuave` con texto oscuro, no texto ámbar suelto.

`textoDeshabilitado` (2,69:1) queda como está: WCAG exime a los controles
deshabilitados, y subirle el contraste haría que no se lean como inactivos.

### Modo oscuro: NO en v1

`app.json` está fijo en `userInterfaceStyle: "light"`.

**Motivo:** con el test SUS de por medio, todos los participantes tienen
que ver lo mismo. Si uno usa la app en oscuro y otro en claro, no están
evaluando la misma interfaz.

La estructura quedó preparada (`Colors.light` en vez de tokens aplanados,
y todos los componentes leen por `useTheme()`), así que agregar el modo
oscuro más adelante es definir `Colors.dark` y cambiar el hook — **cero
cambios en pantallas**.

---

## 4. Tipografía

**Nunito** (Google Fonts) para todo; **JetBrains Mono** para timestamps y
labels técnicos.

⚠️ **Con fuentes cargadas, cada peso es una familia distinta.**
`fontWeight: "900"` sobre `Nunito_400Regular` **no** la engorda en Android.
Por eso las variantes traen `fontFamily` y nunca se toca `fontWeight`.
Todos los pesos usados se cargan en `src/app/_layout.tsx`.

| Variante | Uso | Familia / tamaño |
|:--|:--|:--|
| `monto` | **El monto de la pantalla** | Black 40 |
| `montoSecundario` | Montos en listas y tarjetas | ExtraBold 26 |
| `titulo` | Título de pantalla | ExtraBold 24 |
| `subtitulo` | Encabezado de sección | Bold 18 |
| `cuerpo` | Texto general | SemiBold 16 |
| `etiqueta` | Labels, metadatos | SemiBold 14 |
| `micro` | Texto auxiliar | SemiBold 12 |
| `mono` | Timestamps, datos técnicos | JetBrains Mono 12 |

**El monto es siempre el elemento más grande de su pantalla.** Es el dato
que el estudiante viene a ver; la jerarquía visual debe decirlo sin que
tenga que buscarlo.

Se usa así — nunca un tamaño suelto:

```tsx
<ThemedText variante="monto">S/ 1.234,50</ThemedText>
```

---

## 5. Forma, espaciado y sombras

**Radios altos** (`Radios`): tarjetas 24 (grandes 30), botones 20, iconos
14, píldoras 999. Es lo que da la sensación amable y poco bancaria.

**Espaciado** (`Espaciado`): escala de 4pt, de `xs` (4) a `xxxl` (48).
Generoso: el aire es lo que hace que una pantalla financiera no abrume.

**Sombras** (`Sombras`): suaves, sin gradientes recargados. Se definen
para iOS y Android juntas — usar solo `elevation` deja iOS plano, y solo
`shadow*` deja Android plano. El botón central lleva sombra **teñida de
verde** (`botonCentral`).

---

## 6. Reglas de usabilidad (no son opcionales)

Estas salen de que la usabilidad se mide, y de los RNF:

1. **Máximo 3–4 acciones visibles por pantalla.** Si hacen falta más, la
   pantalla está haciendo demasiado y hay que dividirla.
2. **Área táctil mínima de 44pt** (`AreaTactilMinima`). Por debajo, la
   gente falla el toque. Vale aunque el ícono se vea más chico.
3. **Toda pantalla resuelve tres estados: cargando, error y vacío.** Una
   pantalla en blanco mientras carga se lee como "la app se colgó".
4. **Los errores dicen qué hacer**, no solo qué pasó. "No pudimos guardar,
   revisá tu conexión y tocá Reintentar" ≫ "Error 500".
5. **Un monto nunca se muestra sin su signo y moneda** (`S/`). El signo
   distingue ingreso de egreso de un vistazo.
6. **`accessibilityLabel` en todo lo interactivo** cuyo texto visible no
   alcance, y `testID` en todo lo que una prueba deba encontrar.

---

## 7. Cómo cambiar el sistema (la parte práctica)

| Quiero… | Toco |
|:--|:--|
| Cambiar el verde de marca | `Paleta.esmeralda` en `theme.ts` — **una línea** |
| Agregar un color de categoría | Una entrada en `ColoresCategoria` |
| Ajustar la escala de texto | `TextoVariantes` |
| Agregar un estilo de texto | Una entrada en `TextoVariantes` |
| Cambiar el espaciado general | `Espaciado` |
| Agregar modo oscuro | `Colors.dark` + `useTheme()` |

En ningún caso hay que abrir una pantalla. Ese es el objetivo del diseño.

---

## 8. Estado y pendientes

**Implementado y verificado en simulador iOS:** tokens, Nunito y JetBrains
Mono cargando, `ThemedText` con variantes, tema de navegación, modo claro
fijo, y la regla de ESLint que impide colores y tamaños sueltos.

**Pendiente**, en orden:

1. **Íconos.** El mockup usa placeholders geométricos. Falta elegir el set
   final (`expo-symbols` en iOS + un set libre para Android, o uno solo
   multiplataforma).
2. **Componentes base**: `Boton`, `Campo`, `Tarjeta`, `Chip`, `EstadoVacio`.
   Hoy solo existen `ThemedText` y `ThemedView`. Conviene construirlos
   junto con la primera pantalla real, no antes: inventarlos sin un caso
   de uso lleva a APIs que no se usan.
3. **Tab bar de 4 secciones + botón central de 66pt.** Los tokens están
   (`BotonCentral`, `Sombras.botonCentral`); falta el componente, que va
   con el mapa de navegación.
4. **`textoTenue` `#8B948F` (3,12:1) sigue sin pasar AA.** Se dejó como
   está porque hoy no lo usa nadie; hay que decidir su tono la primera vez
   que se necesite, o eliminarlo del sistema si `textoSecundario` alcanza.
5. **Los 4 pendientes de `Wireframes.md`** que son de frontend: estados de
   error del OCR, estados vacíos, micro-copys de gasto hormiga, y el
   prototipo navegable para el SUS.
