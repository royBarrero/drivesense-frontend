# Guía de diseño — DriveSense (panel web)

Misma identidad visual que la app. **La fuente de verdad de los valores es [`drivesense-mobile/docs/diseno.md`](../../drivesense-mobile/docs/diseno.md)**; esta guía los traduce a **Tailwind CSS v4 + Shadcn/ui** (preset Nova) y añade lo propio del panel y de la landing.

- Unidades: 1 dp de la app = 1 px en la web. Se indican en px y en rem (1 rem = 16 px).
- Colores en **hex**, igual que en la guía móvil, para poder compararlos uno a uno. Tailwind v4 aplica igual los modificadores de opacidad (`bg-primary/80`, `border-encabezado-borde/50`).
- Marcas: **(derivado)** = calculado a partir de la paleta; **(propuesta)** = no viene del diseño original y hay que confirmarlo al verlo en pantalla.
- Regla: **ningún componente escribe colores, tamaños de fuente, radios ni sombras directamente** (nada de `bg-[#047857]` ni `text-[15px]`). Todo sale de las variables de `src/index.css` y de las clases que genera `@theme` (sección 9).

---

## 1. Colores

### 1.1 Modo claro (activo)

Cada token tiene una variable CSS propia de DriveSense (`--ds-*`). La columna **Shadcn** indica la variable de Shadcn que lo usa (sección 2); la columna **Clase** es la utilidad de Tailwind para los tokens que no tienen equivalente en Shadcn (sección 3).

| Token (app) | Hex | Variable | Shadcn | Clase propia | Uso |
|---|---|---|---|---|---|
| `fondo` | #EFEBE1 | `--ds-fondo` | `--background` | — | Fondo general |
| `superficie` | #FFFFFF | `--ds-superficie` | `--card`, `--popover` | — | Tarjetas, menús |
| `superficieAlt` | #F9F7F2 | `--ds-superficie-alt` | `--muted` | — | Fondo de campos, filas al pasar el ratón |
| `borde` | #E2DCCF | `--ds-borde` | `--border`, `--input` | — | Bordes de 1 px |
| `bordeFuerte` | #DFD8C7 | `--ds-borde-fuerte` | — | `border-borde-fuerte` | Divisores con más contraste |
| `textoPrincipal` | #1E252D | `--ds-texto-principal` | `--foreground` | — | Títulos y cuerpo |
| `textoSecundario` | #5F6B76 | `--ds-texto-secundario` | `--muted-foreground` | — | Etiquetas, descripciones |
| `textoTerciario` | #7B8893 | `--ds-texto-terciario` | — | `text-texto-terciario` | Texto de apoyo, ítems inactivos |
| `sobrePrimario` | #FFFFFF | `--ds-sobre-primario` | `--primary-foreground` | — | Texto sobre `botonPrimario` |
| `primario` | #10B981 | `--ds-primario` | `--chart-1` | `bg-primario` | Acento esmeralda: gráficas, indicadores. **No** para texto sobre blanco |
| `primarioOscuro` | #059669 | `--ds-primario-oscuro` | — | `text-primario-oscuro` | Acentos sobre fondos tintados |
| `secundario` | #0EA5E9 | `--ds-secundario` | `--chart-2` | `bg-secundario` | Acento cian |
| `confort` | #8B5CF6 | `--ds-confort` | `--chart-3` | `bg-confort` | Métricas de confort |
| `advertencia` | #F59E0B | `--ds-advertencia` | `--chart-4` | `bg-advertencia` | Advertencias |
| `peligro` | #EF4444 | `--ds-peligro` | `--chart-5` | `bg-peligro`, `border-peligro` | Eventos de riesgo, bordes de error |
| `botonPrimario` | #047857 | `--ds-boton-primario` | `--primary`, `--ring` | — | Botón principal sobre fondo claro |
| `botonPrimarioPresionado` | #065F46 | `--ds-boton-primario-presionado` | — | `bg-primario-presionado` | Botón principal al pasar el ratón / presionado **(propuesta, heredada de la app)** |
| `enlace` | #047857 | `--ds-enlace` | `--accent-foreground` | `text-enlace` | Enlaces de texto |
| `textoExito` | #047857 | `--ds-texto-exito` | — | `text-texto-exito` | Requisito cumplido, confirmaciones |
| `fondoBotonSecundario` | #E8E2D4 | `--ds-fondo-boton-secundario` | `--secondary` | — | Botón secundario, botón deshabilitado |
| `carril` | #E8E2D4 | `--ds-carril` | — | `bg-carril` | Carril de barras de progreso y del anillo |
| `bordePeligroSuave` | #F8C9C9 | `--ds-borde-peligro-suave` | — | `border-borde-peligro-suave` | Borde del aviso de error |
| `textoPeligro` | #B91C1C | `--ds-texto-peligro` | `--destructive` | — | Texto de error |

**Tintes tenues** **(derivado)**:

| Token | Hex | Variable | Shadcn | Clase propia | Uso |
|---|---|---|---|---|---|
| `tintePrimario` | #E7F8F2 | `--ds-tinte-primario` | `--accent` | `bg-tinte-primario` | Hover de menús, estado "Suave" |
| `tinteConfort` | #F3EFFE | `--ds-tinte-confort` | — | `bg-tinte-confort` | Estado "Progresiva" |
| `tintePeligro` | #FDECEC | `--ds-tinte-peligro` | — | `bg-tinte-peligro` | Aviso de error, riesgo alto |
| `tinteAdvertencia` | #FEF5E7 | `--ds-tinte-advertencia` | — | `bg-tinte-advertencia` | Riesgo medio |
| `tinteNavActivo` | #DBF4EC | `--ds-tinte-nav-activo` | `--sidebar-accent` | `bg-tinte-nav-activo` | Ítem activo del menú lateral |

**Encabezado oscuro** (landing y bloques oscuros; es oscuro **también en modo claro**, e igual en los dos modos):

| Token | Hex | Variable | Clase | Uso |
|---|---|---|---|---|
| `encabezadoFondo` | #1E252D | `--ds-encabezado-fondo` | `bg-encabezado-fondo` | Fondo del bloque |
| `encabezadoSuperficie` | #12171F | `--ds-encabezado-superficie` | `bg-encabezado-superficie`, `text-encabezado-superficie` | Caja del logo; texto del botón menta |
| `encabezadoBorde` | #2A3440 | `--ds-encabezado-borde` | `border-encabezado-borde` | Bordes, botón de contorno, círculos de la diana |
| `encabezadoAcento` | #34D399 | `--ds-encabezado-acento` | `bg-encabezado-acento`, `text-encabezado-acento` | Botón principal sobre oscuro, ruta y punto de la diana |
| `encabezadoTexto` | #F3F4F6 | `--ds-encabezado-texto` | `text-encabezado-texto` | Títulos |
| `encabezadoTextoSecundario` | #9CA3AF | `--ds-encabezado-texto-secundario` | `text-encabezado-texto-secundario` | Subtítulos |

**Degradados** (variables, no colores; se usan con `bg-(image:--ds-gradiente-score)`):

| Variable | Valor | Uso |
|---|---|---|
| `--ds-gradiente-score` | `linear-gradient(90deg, #10B981, #06B6D4)` | Anillo / barra de DriveScore |
| `--ds-gradiente-relleno-grafica` | `linear-gradient(180deg, rgb(16 185 129 / 0.15), rgb(16 185 129 / 0))` | Relleno bajo la curva semanal |

### 1.2 Modo oscuro (FUTURO — documentado, no activo)

Mismos valores que la sección 1.2 de la guía móvil: `fondo` #0A0E14, `superficie` #12171F, `superficieAlt` #161C26, `borde` #1F2937, `textoPrincipal` #F3F4F6, `textoSecundario`/`textoTerciario` #9CA3AF, `primario` #34D399, `secundario` #38BDF8; `confort`, `peligro` y `advertencia` #A78BFA, #F87171 y #FBBF24 **(propuesta)**. `botonPrimario`, tintes, `carril` y `textoPeligro` quedan por definir cuando se diseñe el modo oscuro.

---

## 2. Mapeo a las variables de Shadcn

Shadcn solo lee sus propias variables (`--background`, `--primary`…). En `:root` se les asigna un token de DriveSense con `var(--ds-*)`, así hay una sola fuente de cada color.

| Variable Shadcn | Token | Valor | Nota |
|---|---|---|---|
| `--background` | `fondo` | #EFEBE1 | |
| `--foreground` | `textoPrincipal` | #1E252D | |
| `--card` / `--card-foreground` | `superficie` / `textoPrincipal` | #FFFFFF / #1E252D | |
| `--popover` / `--popover-foreground` | `superficie` / `textoPrincipal` | #FFFFFF / #1E252D | |
| `--primary` / `--primary-foreground` | `botonPrimario` / `sobrePrimario` | #047857 / #FFFFFF | #10B981 con texto blanco no tiene contraste suficiente |
| `--secondary` / `--secondary-foreground` | `fondoBotonSecundario` / `textoPrincipal` | #E8E2D4 / #1E252D | |
| `--muted` / `--muted-foreground` | `superficieAlt` / `textoSecundario` | #F9F7F2 / #5F6B76 | |
| `--accent` / `--accent-foreground` | `tintePrimario` / `enlace` | #E7F8F2 / #047857 | Hover y foco de menús y listas **(propuesta)** |
| `--destructive` | `textoPeligro` | #B91C1C | Shadcn lo usa como **color de texto**; #EF4444 sobre blanco no llega a AA **(propuesta)** |
| `--border` | `borde` | #E2DCCF | |
| `--input` | `borde` | #E2DCCF | |
| `--ring` | `botonPrimario` | #047857 | Anillo de foco |
| `--chart-1` … `--chart-5` | `primario`, `secundario`, `confort`, `advertencia`, `peligro` | | Orden **(propuesta)** |
| `--radius` | `radioCampo` | 1rem (16 px) | La escala completa se define aparte (sección 5.2) |
| `--sidebar` / `--sidebar-foreground` | `superficie` / `textoPrincipal` | | **(propuesta)** |
| `--sidebar-primary` / `--sidebar-primary-foreground` | `botonPrimario` / `sobrePrimario` | | |
| `--sidebar-accent` / `--sidebar-accent-foreground` | `tinteNavActivo` / `enlace` | #DBF4EC / #047857 | Ítem activo. En la app el texto era #059669, pero en web el menú lleva texto pequeño y #059669 no llega a AA sobre ese tinte **(propuesta)** |
| `--sidebar-border` / `--sidebar-ring` | `borde` / `botonPrimario` | | |

**Tokens que no tienen equivalente en Shadcn** y quedan como propios de DriveSense: `primario` (#10B981), `primarioOscuro`, `secundario`, `confort`, `advertencia`, `peligro`, `botonPrimarioPresionado`, `enlace`, `textoExito`, `textoTerciario`, `bordeFuerte`, `carril`, `bordePeligroSuave`, los tintes, todo el encabezado oscuro, degradados y sombras.

---

## 3. Tokens propios en Tailwind

En `@theme inline` se exponen como colores de Tailwind, con nombres en español y kebab-case. Así funcionan con cualquier utilidad (`bg-`, `text-`, `border-`, `ring-`, `fill-`, `stroke-`) y con opacidad:

```css
@theme inline {
  --color-primario: var(--ds-primario);
  --color-encabezado-fondo: var(--ds-encabezado-fondo);
  --color-texto-exito: var(--ds-texto-exito);
  /* … uno por cada token de la columna "Clase propia" */
}
```

`inline` hace que la clase apunte a la variable: cuando exista `.dark`, basta con cambiar la variable `--ds-*` y todas las clases se actualizan sin tocar los componentes.

---

## 4. Tipografía

### 4.1 Fuentes (incluidas en el proyecto, sin CDN)

```
npm install @fontsource-variable/plus-jakarta-sans @fontsource-variable/space-grotesk
npm uninstall @fontsource-variable/geist
```

```css
@import "@fontsource-variable/plus-jakarta-sans";
@import "@fontsource-variable/space-grotesk";

@theme inline {
  --font-sans: "Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif;
  --font-heading: var(--font-sans);
  --font-numeros: "Space Grotesk Variable", ui-sans-serif, system-ui, sans-serif;
}
```

- **Plus Jakarta Sans** (`font-sans`, por defecto en `html`): toda la interfaz.
- **Space Grotesk** (`font-numeros`): DriveSense, puntajes, métricas, cifras de tablas y KPIs.
- En la web, la fuente variable aplica bien todos los pesos (400–700). No hace falta generar archivos estáticos como en Flutter.
- En tablas y columnas de números: `font-numeros tabular-nums` para que las cifras queden alineadas **(propuesta)**.

### 4.2 Escala

Cada token se define en `@theme` con su tamaño, interlineado, peso y espaciado de letras. Tailwind v4 genera una sola clase que aplica los cuatro (`text-titulo`):

```css
@theme {
  --text-titulo: 1.5rem;
  --text-titulo--line-height: 1.2;
  --text-titulo--font-weight: 700;
  /* … */
}
```

| Clase | Fuente | Tamaño | Peso | Interlineado / otros | Uso |
|---|---|---|---|---|---|
| `text-telemetria-xl` | `font-numeros` | 64 px / 4rem | 700 | 1.0 | Número protagonista (DriveScore grande) |
| `text-telemetria` | `font-numeros` | 56 px / 3.5rem | 700 | 1.0 | Números grandes |
| `text-puntaje` | `font-numeros` | 28 px / 1.75rem | 700 | 1.1 | Puntajes en tarjetas, KPIs |
| `text-numero-metrica` | `font-numeros` | 18 px / 1.125rem | 500 | — | Métricas pequeñas |
| `text-titulo-landing` | sans | 56 px / 3.5rem | 700 | 1.1 | Título del encabezado de la landing **(propuesta)** |
| `text-subtitulo-landing` | sans | 18 px / 1.125rem | 400 | 1.6 | Subtítulo de la landing **(propuesta)** |
| `text-titulo-hero` | sans | 32 px / 2rem | 700 | 1.15 | Títulos de login/registro del panel |
| `text-titulo` | sans | 24 px / 1.5rem | 700 | 1.2 | H1 de cada página del panel |
| `text-titulo-tarjeta` | sans | 22 px / 1.375rem | 700 | 1.25 | Título de tarjeta de formulario |
| `text-marca` | sans | 20 px / 1.25rem | 700 | — | "DriveSense" junto al logo |
| `text-subtitulo-grande` | sans | 18 px / 1.125rem | 600 | 1.3 | Encabezado de tarjeta grande |
| `text-subtitulo` | sans | 16 px / 1rem | 600 | 1.3 | Encabezado de tarjeta |
| `text-boton` | sans | 16 px / 1rem | 600 | — | Botones grandes (landing, formularios) |
| `text-cuerpo` | sans | 14 px / 0.875rem | 400 | 1.5 | Texto general, celdas de tabla |
| `text-cuerpo-pequeno` | sans | 13 px / 0.8125rem | 400 | 1.5 | Texto de apoyo |
| `text-etiqueta-campo` | sans | 13 px / 0.8125rem | 600 | — | Etiqueta encima de un campo |
| `text-ayuda` | sans | 12 px / 0.75rem | 400 | 1.4 | Ayudas y mensajes de error bajo los campos |
| `text-etiqueta-grande` | sans | 12 px / 0.75rem | 500 | `letter-spacing: 0.05em` + `uppercase` | Etiquetas de sección |
| `text-etiqueta` | sans | 11 px / 0.6875rem | 500 | `letter-spacing: 0.05em` + `uppercase` | Etiquetas de métricas, cabeceras de tabla |

- En la web las mayúsculas de las etiquetas se ponen con la clase `uppercase`; el texto se escribe normal.
- El color no forma parte del token: se añade según el contexto (`text-foreground`, `text-muted-foreground`…).

---

## 5. Espaciado, radios y sombras

### 5.1 Espaciado
La escala de 4 px de Tailwind es la misma que la de la app: se usan las clases estándar.

| App | px | Tailwind |
|---|---|---|
| `xxs` | 4 | `1` |
| `xs` | 8 | `2` |
| `s` | 12 | `3` |
| `m` | 16 | `4` |
| `l` | 20 | `5` |
| `xl` | 24 | `6` |
| `xxl` | 32 | `8` |
| — | 64 | `16` (margen lateral de escritorio, sección 8.5) |

### 5.2 Radios
La plantilla de Shadcn calcula la escala a partir de `--radius` con `calc()`, lo que no da los valores de la app (24, 28). Se redefine con **valores exactos**:

| Clase | px | Token (app) | Uso |
|---|---|---|---|
| `rounded-sm` | 8 | — | Elementos pequeños (distintivos, casillas) **(propuesta)** |
| `rounded-md` | 12 | `radioCajaIcono` | Caja de ícono, menús |
| `rounded-lg` | 16 | `radioCampo` / `radioMicro` (= `--radius`) | Campos, aviso de error, micro-tarjetas |
| `rounded-xl` | 24 | `radioTarjeta` | Tarjetas |
| `rounded-2xl` | 28 | `radioTarjetaDestacada` | Tarjeta de formulario de login/registro |
| `rounded-3xl` | 32 | `radioEncabezado` | Encabezado oscuro de login/registro |
| `rounded-4xl` | 40 | — | Esquinas inferiores del encabezado de la landing |
| `rounded-full` | — | `radioPildora` | Botones, chips, barras de progreso |

### 5.3 Sombras
En CSS se usan los valores originales de Stitch, **sin** la conversión de desenfoque que necesitaba Flutter.

| Variable / clase | Valor | Uso |
|---|---|---|
| `--shadow-tarjeta` / `shadow-tarjeta` | `0 4px 20px rgb(0 0 0 / 0.06)` | Tarjetas (siempre con borde de 1 px) |
| `--shadow-boton-primario` / `shadow-boton-primario` | `0 6px 20px rgb(16 185 129 / 0.2)` | Botón principal sobre fondo claro (desplazamiento **propuesta**, heredado de la app) |
| `--shadow-resplandor` / `shadow-resplandor` | `0 0 15px 2px rgb(52 211 153 / 0.4)` | Punto de la diana sobre fondo oscuro **(derivado)** |

---

## 6. Componentes base (tema en `src/components/ui/`)

Los componentes de Shadcn se editan **solo para aplicar este tema**. Las páginas los usan sin estilos propios.

### 6.1 Botones (`button.tsx`)

| Variante | Fondo | Texto | Borde / otros | Uso |
|---|---|---|---|---|
| `default` | `bg-primary` (#047857) | `text-primary-foreground` | `rounded-full`, `shadow-boton-primario`; hover `bg-primario-presionado` | Acción principal sobre fondo claro |
| `secondary` | `bg-secondary` (#E8E2D4) | `text-secondary-foreground` | `rounded-full` | Acción secundaria |
| `outline` | `bg-card` | `text-foreground` | `border-border`, `rounded-full`; hover `bg-muted` | Acción secundaria sobre tarjetas |
| `ghost` | transparente | `text-foreground` | hover `bg-muted` | Acciones de tabla o menú |
| `link` | — | `text-enlace` | `font-semibold`, subrayado al pasar el ratón | Enlaces ("Crear cuenta") |
| `destructive` | `bg-destructive/10` | `text-destructive` | | Desactivar conductor, etc. |
| **`sobreOscuro`** (nueva) | `bg-encabezado-acento` (#34D399) | `text-encabezado-superficie` (#12171F) | `rounded-full`; hover `bg-encabezado-acento/90` **(propuesta)** | Botón principal sobre fondo oscuro |
| **`contornoOscuro`** (nueva) | transparente | `text-encabezado-texto` (#F3F4F6) | `border-encabezado-borde` (#2A3440), `rounded-full`; hover `bg-encabezado-borde/40` **(propuesta)** | Botón secundario sobre fondo oscuro |

- **Deshabilitado:** fondo `secondary` y texto `muted-foreground`, igual que en la app, en lugar del `opacity-50` de la plantilla.
- **Cargando:** indicador circular (`Loader2` de Lucide con `animate-spin`, 20 px) en lugar del texto, y el botón mantiene el color activo.

**Alturas** **(propuesta)** (tamaños de la variante `size`):

| Tamaño | Alto | Padding | Texto | Uso |
|---|---|---|---|---|
| `sm` | 36 px (`h-9`) | `px-4` | `text-cuerpo` 600 | Acciones de tabla |
| `default` | 44 px (`h-11`) | `px-6` | `text-cuerpo` 600 | Panel |
| `lg` | 48 px (`h-12`) | `px-6 py-3.5` | `text-boton` | Landing |
| `formulario` | 54 px (`h-13.5`) | `px-6` | `text-boton` | Login y registro de empresa (igual que la app) |

Ícono dentro del botón: 20 px (`size-5`) con separación de 8 px (`gap-2`).

### 6.2 Formularios
- **Campo** (`input.tsx`): etiqueta arriba con `text-etiqueta-campo text-foreground` y 8 px de separación. Campo de 52 px (`h-13`), `bg-muted`, `border-input`, `rounded-lg`, `px-4`, `text-cuerpo`. Foco: `border-ring` con `ring-ring/50`.
- **Error de campo:** `aria-invalid` → `border-peligro`, y el mensaje de la API debajo con `text-ayuda text-destructive`. Los errores 422 anidados (`empresa.telefono`, `administrador.email`) se asignan al campo por su ruta completa.
- **Aviso de error** (arriba del formulario): `bg-tinte-peligro`, `border border-borde-peligro-suave`, `rounded-lg`, `p-3`, ícono `CircleAlert` de 20 px y mensaje `text-cuerpo-pequeno text-destructive`.

### 6.3 Tarjetas
| Tipo | Especificación |
|---|---|
| Tarjeta | `bg-card rounded-xl border border-border shadow-tarjeta p-5` |
| Tarjeta de formulario (login y registro) | `rounded-2xl`, padding de 24 × 20 (`py-6 px-5`) |
| Tarjeta de KPI **(propuesta)** | Tarjeta con `text-etiqueta uppercase text-muted-foreground` arriba y el valor en `text-puntaje font-numeros` |

### 6.4 Tablas del panel **(propuesta)**
- Cabecera: `text-etiqueta uppercase text-muted-foreground`, fondo `bg-muted`.
- Filas de 52 px, `border-b border-border`, hover `bg-muted`. Texto `text-cuerpo`.
- Columnas numéricas (DriveScore, eventos, km): `font-numeros tabular-nums`, alineadas a la derecha.

### 6.5 Indicadores
- **Nivel de riesgo o puntaje** **(propuesta)**: distintivo `rounded-full px-2.5 py-0.5 text-etiqueta`:

| Valor | Fondo | Texto |
|---|---|---|
| ≥ 90 | `bg-tinte-primario` | `text-texto-exito` |
| 70–89 | `bg-tinte-advertencia` | `text-foreground` |
| < 70 | `bg-tinte-peligro` | `text-destructive` |

- **Barra de progreso:** 8 px (`h-2`), `rounded-full`, carril `bg-carril`. La barra usa `bg-primario` (≥ 90 %), `bg-advertencia` (70–89 %) o `bg-peligro` (< 70 %); son los mismos umbrales de la app.
- **Anillo de DriveScore:** SVG con trazo de 12 px, `stroke-linecap: round`, carril `stroke-carril` y degradado `--ds-gradiente-score`.

---

## 7. Íconos
Lucide (`lucide-react`). Tamaños: 16 px (`size-4`) en tablas y listas, 20 px (`size-5`) en botones y avisos, 24 px (`size-6`) en el menú lateral. El color siempre sale de las clases del tema (`text-muted-foreground`, `text-enlace`…).

---

## 8. Elementos del panel y de la landing

### 8.1 Encabezado oscuro de la landing
- Fondo `bg-encabezado-fondo` (#1E252D), esquinas inferiores `rounded-b-4xl` (40 px).
- Título `text-titulo-landing text-encabezado-texto` (#F3F4F6); subtítulo `text-subtitulo-landing text-encabezado-texto-secundario` (#9CA3AF).
- Bordes y divisores dentro del bloque: `border-encabezado-borde` (#2A3440).
- Logo: caja de 44 × 44, `rounded-[14px]` → token `--radius-logo: 14px` (clase `rounded-logo`), `bg-encabezado-superficie`, borde `encabezado-borde` y velocímetro en trazo `stroke-encabezado-acento`. A su lado, `text-marca text-encabezado-texto`.

### 8.1.1 Medidas de la landing y del registro (implementadas)

| Elemento | Valor | Clase |
|---|---|---|
| Bloque oscuro de la landing | 640 de alto mínimo en escritorio | `lg:min-h-160` |
| Bloque oscuro del registro | ≈ 320 (barra + título + 112 de espacio para la tarjeta) | `pb-28` |
| Barra de navegación | 88 de alto, borde inferior `encabezado-borde` | `h-22` |
| Tarjeta de acceso | 420 de ancho, sobresale 32 del bloque, radio 28, `shadow-tarjeta-elevada` | `lg:w-105 lg:-mb-8` |
| Tarjeta de registro | 880 de ancho máximo, sube 80 sobre el bloque | `max-w-220 -mt-20` |
| Cápsula "Sin hardware adicional" | Fondo `encabezado-acento` al 12 %, texto `encabezado-acento` | `bg-encabezado-acento/12` |
| Caja de ícono de las micro-tarjetas | 40 × 40 (en la app es 36) | `size-10` |
| Título de la landing | 56 en escritorio; 34 en móvil y tablet | `text-titulo-landing-movil lg:text-titulo-landing` |
| `--shadow-tarjeta-elevada` | `0 24px 60px rgb(18 23 31 / 0.22)` **(propuesta)** | `shadow-tarjeta-elevada` |
| `--drop-shadow-resplandor` | `0 0 8px rgb(52 211 153 / 0.6)` **(derivado)** | `drop-shadow-resplandor` (punto de la diana) |

- **Móvil (< 1024):** una columna. La tarjeta de acceso va debajo del titular, a ancho completo y sin superposición. La barra muestra la caja del logo (el nombre desde 640), el botón principal y un menú con los enlaces. La diana se reduce a los círculos, bajo la barra y a la derecha.
- **Escritorio (≥ 1024):** diseño completo, con la ruta de la diana cruzando el bloque por debajo de los botones.

### 8.2 Botones según el fondo
| Fondo | Principal | Secundario |
|---|---|---|
| Oscuro (#1E252D) | `sobreOscuro`: menta #34D399 con texto #12171F | `contornoOscuro`: borde #2A3440, texto #F3F4F6 |
| Claro | `default`: #047857 con texto blanco | `secondary` u `outline` |

### 8.3 Diana de fuerzas G (ilustración)
Componente SVG de React. Los colores salen de las variables CSS (`stroke="var(--ds-encabezado-borde)"` o las clases `stroke-*` / `fill-*`), nunca en hex.

- **Círculos concéntricos:** 3, con trazo de 1 px en `encabezado-borde` (#2A3440); el del medio punteado (`stroke-dasharray="4 5"`). Radios de la app: 26 / 50 / 74. En la landing se escalan ×2 (52 / 100 / 148) **(propuesta)**.
- **Ejes cruzados:** líneas de 1 px en `encabezado-borde`, un poco más largas que el círculo exterior.
- **Ruta:** curva `path` con trazo de 2 px en `encabezado-acento` (#34D399), `stroke-dasharray="6 7"` y `stroke-linecap="round"`. Cruza el bloque y pasa por el centro de los círculos.
- **Punto:** círculo de radio 5 en `encabezado-acento`, con resplandor (`filter: drop-shadow(0 0 8px rgb(52 211 153 / 0.6))` o `feGaussianBlur` debajo) **(derivado)**.
- Es decorativa: lleva `aria-hidden="true"`.

### 8.4 Login y registro de empresa
Mismo patrón que la app (guía móvil, sección 4.2): encabezado oscuro con `rounded-b-3xl` y la tarjeta de formulario (`rounded-2xl`) superpuesta 56 px. En escritorio, la tarjeta tiene un ancho máximo de 480 px y va centrada **(propuesta)**.

### 8.5 Anchos y márgenes
| Elemento | Valor |
|---|---|
| Contenido máximo | 1440 px → `--container-contenido: 90rem` (clase `max-w-contenido`), centrado con `mx-auto` |
| Margen lateral en escritorio | 64 px (`px-16`) |
| Portátil de 1280 px | Mismo margen: el contenido queda en 1152 px y todo debe verse completo, sin scroll horizontal |
| Menos de 1024 px | Margen de 24 px (`px-6`) **(propuesta)**. El panel está pensado para escritorio |
| Menú lateral del panel | 256 px (`w-64`), fondo `bg-sidebar`, borde derecho `border-sidebar-border` **(propuesta)** |

---

## 9. Implementación en `src/index.css`

Esqueleto de referencia para cuando se aplique el tema. Reemplaza la paleta neutral y Geist de la plantilla:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/plus-jakarta-sans";
@import "@fontsource-variable/space-grotesk";

@custom-variant dark (&:is(.dark *));

:root {
  /* 1. Tokens de DriveSense (fuente única de cada valor) */
  --ds-fondo: #EFEBE1;
  --ds-superficie: #FFFFFF;
  --ds-boton-primario: #047857;
  --ds-encabezado-fondo: #1E252D;
  /* … todos los de la sección 1.1 */

  /* 2. Variables de Shadcn → tokens (sección 2) */
  --background: var(--ds-fondo);
  --card: var(--ds-superficie);
  --primary: var(--ds-boton-primario);
  --ring: var(--ds-boton-primario);
  --radius: 1rem;
  /* … */
}

.dark {
  /* Solo se redefinen los --ds-* (sección 1.2). Las variables de Shadcn y las
     clases propias los siguen solas. Los --ds-encabezado-* no cambian. */
}

@theme inline {
  /* Colores de Shadcn (los que ya trae la plantilla) + tokens propios (sección 3) */
  --color-primario: var(--ds-primario);
  --color-encabezado-fondo: var(--ds-encabezado-fondo);

  /* Fuentes (sección 4.1) */
  --font-sans: "Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif;
  --font-heading: var(--font-sans);
  --font-numeros: "Space Grotesk Variable", ui-sans-serif, system-ui, sans-serif;

  /* Radios exactos (sección 5.2), en lugar de los calc() de la plantilla */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: var(--radius);
  --radius-xl: 1.5rem;
  --radius-2xl: 1.75rem;
  --radius-3xl: 2rem;
  --radius-4xl: 2.5rem;
  --radius-logo: 0.875rem;
}

@theme {
  /* Escala tipográfica (sección 4.2), sombras (5.3) y anchos (8.5) */
  --text-titulo: 1.5rem;
  --text-titulo--line-height: 1.2;
  --text-titulo--font-weight: 700;
  --shadow-tarjeta: 0 4px 20px rgb(0 0 0 / 0.06);
  --container-contenido: 90rem;
}
```

- `index.html`: `lang="es"` y título "DriveSense".
- **Modo oscuro:** la clase `dark` en `<html>` activa el bloque `.dark`. Los componentes no se tocan, porque solo usan variables y clases del tema.
