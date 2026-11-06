# Design System Sterinova

Sistema visual para las vistas App Router de Sterinova. Los componentes están en
`src/components/ui/` y usan los tokens semánticos declarados en
`tailwind.config.ts`. Los nombres de las utilidades de color son estables aunque
se ajuste la paleta de marca.

## Tokens

### Colores

| Token | Valor base | Uso |
|---|---|---|
| `primary` | `#b83b14` | Acción principal y foco |
| `secondary` | `#0f6b70` | Acción secundaria e información |
| `success` | `#166534` | Éxito y estados aprobados |
| `warning` | `#854d0e` | Pendientes y advertencias |
| `error` | `#b91c1c` | Errores y acciones destructivas |
| `surface` | `#ffffff` | Campos, tarjetas y diálogos |
| `background` | `#f3f4f6` | Fondo neutro |

Las variantes con fondo claro (`success-light`, `warning-light`, `error-light` y
`secondary-light`) tienen colores de texto asociados para badges. Los textos
blancos sobre los colores sólidos de acción alcanzan al menos 4.5:1: primary
5.72:1, secondary 6.25:1 y error 6.47:1. En badges claros, las parejas de texto
y fondo tienen ratios de al menos 7.60:1. Son cálculos de tokens, no sustituyen
la medición de todos los estados renderizados ni una auditoría WCAG completa.

Los colores de marca existentes `sterinova.dark`, `sterinova.orange`,
`sterinova.teal` y `sterinova.light` se conservan para no afectar superficies
aún no migradas.

### Tipografía y forma

| Clase | Tamaño | Interlineado |
|---|---:|---:|
| `text-h1` | 2.25rem | 2.5rem |
| `text-h2` | 1.875rem | 2.25rem |
| `text-h3` | 1.5rem | 2rem |
| `text-h4` | 1.25rem | 1.75rem |
| `text-h5` | 1.125rem | 1.5rem |
| `text-h6` | 1rem | 1.5rem |
| `text-body` | 0.875rem | 1.5rem |
| `text-caption` | 0.75rem | 1rem |

Radios: `rounded-control` (8px), `rounded-card` (12px) y `rounded-dialog`
(16px). Los campos y botones usan una altura mínima uniforme de 44px o 40px,
respectivamente.

## Componentes

### `Button`

Props adicionales a `ButtonHTMLAttributes<HTMLButtonElement>`:

- `variant`: `primary` (predeterminado), `secondary`, `danger` o `ghost`.
- `size`: `sm`, `md` (predeterminado) o `lg`.
- `loading`: bloquea el control, muestra un indicador y anuncia estado.
- `loadingLabel`: contenido anunciado mientras carga (predeterminado: contenido
  del botón).

Incluye foco visible, y `disabled`/`aria-busy` asociados a la carga.
También acepta los atributos ARIA nativos de un botón, incluido `aria-label`
para acciones cuyo contenido sea solo un icono.

```tsx
<Button type="submit" loading={saving} loadingLabel="Guardando...">
  Guardar
</Button>
```

### `Input`

Props adicionales a `InputHTMLAttributes<HTMLInputElement>`:

- `label` (requerido): etiqueta visible asociada al campo.
- `hint`: texto de ayuda.
- `error`: error asociado con `aria-describedby` y `aria-invalid`.
- El texto de error se anuncia con `aria-live="polite"`.
- Admite las props nativas de `input`, como `id`, `name`, `type`, `value`,
  `required`, `disabled` y `onChange`.

```tsx
<Input
  id="email"
  name="email"
  label="Correo electrónico"
  type="email"
  hint="Usaremos este correo para el acceso."
  required
/>
```

### `Select`

Props adicionales a `SelectHTMLAttributes<HTMLSelectElement>`:

- `label` (requerido), `options` (requerido), `hint`, `error` y `placeholder`.
- `error` se asocia con `aria-describedby`, marca el campo inválido y se anuncia
  con `aria-live="polite"`.
- Cada opción tiene `value`, `label` y `disabled` opcional.
- Admite props nativas de `select`.

```tsx
<Select
  label="Estado"
  name="estado"
  options={[
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" },
  ]}
  placeholder="Selecciona un estado"
/>
```

### `Badge`

Props adicionales a `HTMLAttributes<HTMLSpanElement>`:

- `variant`: `success`, `warning`, `error`, `info` o `neutral` (predeterminado).
- El texto visible comunica el estado; no se depende únicamente del color.

```tsx
<Badge variant="success">Emitido</Badge>
```

### `Modal`

Props: `open`, `title`, `onClose`, `children` y `description` opcional.
Proporciona `role="dialog"`, `aria-modal`, etiqueta/descripción accesibles,
foco inicial, confinamiento de Tab/Shift+Tab, cierre con Escape y clic en el
fondo, bloqueo del scroll de fondo y devolución del foco al elemento previo.

```tsx
<Modal open={open} title="Nuevo cliente" onClose={closeModal}>
  <form>{/* Contenido del diálogo */}</form>
</Modal>
```

## Vistas piloto

- Login: `Input` para correo/contraseña y `Button` para envío y carga.
- Clientes: `Input` para el formulario, `Button` para acciones y `Modal` para
  creación/edición. El selector oculto de archivos Excel permanece nativo.
- Calidad: `Button` para actualizar/descargar y `Badge` para método, pendientes
  y estado emitido de certificados.
