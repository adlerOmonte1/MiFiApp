# Texto de consentimiento informado — v0.1-borrador

> ## ⚠️ BORRADOR NO APROBADO
>
> **Este texto no ha sido revisado ni aprobado por el comité de ética.**
> Lo redactó un asistente de IA a partir de lo que exigen CON-01, RF-47 a
> RF-49 y la Ley N.º 29733, para **desbloquear el desarrollo** de la
> pantalla 02.
>
> **No usar en el piloto.** Antes de que un participante real lo lea, tiene
> que revisarlo el investigador con su asesor y, si corresponde, el comité
> de ética. Al reemplazarlo, subir la versión (§Versionado).
>
> **Versión actual:** `v0.1-borrador`

---

## 1. Cómo se usa este documento

El texto de abajo es lo que muestra la **pantalla 02 — Consentimiento
informado**, organizado en los tres bloques que pide `Wireframes.md`.

La app envía la **versión** del texto aceptado al backend
(`POST /consentimiento`, campo `versionTexto`), que la guarda junto con la
fecha (RF-48). Eso es lo que permite demostrar después **qué texto exacto**
aceptó cada participante.

### Versionado

| Versión | Fecha | Estado | Qué cambió |
|:--|:--|:--|:--|
| `v0.1-borrador` | 13 ago 2026 | ⚠️ Sin aprobar | Redacción inicial para desbloquear A1.6 |

**Regla:** cualquier cambio en el texto —por menor que parezca— exige una
versión nueva. Si dos participantes aceptaron textos distintos bajo la misma
versión, el registro de RF-48 deja de servir como evidencia.

La constante vive en un solo lugar del código, junto al texto, para que no
se puedan desincronizar.

---

## 2. Encabezado

**Título:** Antes de empezar

**Entrada:** MiFi es parte de una investigación de tesis sobre hábitos
financieros en estudiantes. Antes de usar la aplicación, es importante que
sepas qué información se guarda y para qué.

---

## 3. Bloque «Qué guardamos»

Mientras uses MiFi se registra:

- **Tus movimientos de dinero**: los montos, las categorías y las fechas de
  los ingresos y gastos que anotes.
- **Tus metas de ahorro**: el monto que te propusiste y cuánto llevas.
- **Cómo usas la app**: con qué frecuencia registras movimientos. Este dato
  es el que mide si la aplicación ayuda o no.
- **Tu correo y tu nombre**, para identificar tu cuenta.

Si decides conectar tu correo (es opcional y puedes no hacerlo), la
aplicación lee **únicamente** los avisos de movimientos que te manda tu
banco, y de ellos solo toma el monto, el comercio y la fecha. **No accede a
tus correos personales, ni a tus contactos, ni a tus archivos.**

---

## 4. Bloque «Para qué»

Tus datos se usan para dos cosas:

1. **Para vos**: que puedas ver en qué se te va el dinero y cuánto ahorras.
2. **Para la investigación**: se analizan **de forma anonimizada y
   agrupada** —junto con los de los demás participantes— para medir si una
   aplicación como esta mejora los hábitos de ahorro.

En los resultados de la tesis **nunca aparece tu nombre, tu correo ni
ningún dato que permita identificarte**. Se publican promedios y
tendencias del grupo, nunca casos individuales.

Tus datos **no se venden, no se comparten con terceros y no se usan con
fines comerciales ni publicitarios**.

---

## 5. Bloque «Tu control»

Conforme a la **Ley N.º 29733 de Protección de Datos Personales**, tienes
derecho a:

- **Saber** qué datos tuyos están guardados y pedir una copia.
- **Corregir** cualquier dato que esté equivocado.
- **Eliminar** tu cuenta y todos tus datos cuando quieras.
- **Retirarte del estudio** en cualquier momento, sin dar explicaciones y
  sin ninguna consecuencia para vos.
- **Desconectar tu correo** cuando quieras, desde tu perfil.

Participar es **voluntario**. Si decides no participar o retirarte después,
no pierdes nada ni hay consecuencia alguna.

Para ejercer cualquiera de estos derechos, escribe a:
**{correo de contacto del investigador}** ← *completar antes del piloto*

---

## 6. Aceptación

**Checkbox:** Acepto participar en el estudio y el uso de mis datos
anónimos

**Botón:** Acepto y continúo

Al aceptar se guarda la **fecha, la hora y la versión** de este texto
(RF-48). Puedes consultar cuándo aceptaste desde tu perfil, en cualquier
momento.

---

## 7. Lo que falta antes del piloto

1. **Revisión del investigador y su asesor.**
2. **Aprobación del comité de ética**, si corresponde en tu institución.
3. **Correo de contacto real** en §5 — hoy es un marcador.
4. **Decidir si hace falta consentimiento de un tercero** (por ejemplo,
   apoderado) en caso de participantes menores de edad. La documentación no
   dice la franja etaria del estudio.
5. **Subir la versión a `v1.0`** cuando el texto quede aprobado, y dejar
   registro acá de qué cambió.

> **Nota sobre el punto 4:** si algún participante puede ser menor de edad,
> esto no es un detalle de formulario — cambia el procedimiento de
> consentimiento completo y es lo primero que suele observar un comité de
> ética.
