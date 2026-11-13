# drivesense-frontend

Panel web B2B para **administradores de empresa** (flotas y aseguradoras). Los conductores no usan el panel: usan la app móvil. El contexto general del proyecto (módulos, HU, roles, multitenancy) está en `../CLAUDE.md`. **Todo lo visual se rige por [`docs/diseno.md`](docs/diseno.md).**

## Entorno

- React 19.3, Vite 8, TypeScript, Tailwind CSS v4 (plugin `@tailwindcss/vite`, sin `tailwind.config`), Shadcn/ui (primitivas Radix, preset **Nova** = `style: radix-nova`, íconos Lucide), ESLint. Todo el equipo usa **Node 24**.
- Alias `@` → `src` (en `vite.config.ts` y en `tsconfig.app.json`).
- El repo todavía no está inicializado en Git.
- Paquetes: `react-router` (8, `createBrowserRouter`), `react-hook-form` + `zod` 4 + `@hookform/resolvers`, fuentes con `@fontsource-variable`, `leaflet` + `react-leaflet` (mapa del modo pruebas, mosaicos de OpenStreetMap).
- **`cn` siempre desde `@/lib/utils`**, nunca desde el paquete `cn`: la versión local registra los tamaños de texto y las sombras propias del tema. Sin eso, `cn("text-cuerpo text-foreground")` elimina `text-cuerpo` (lo toma por un color). Al agregar un componente con `npx shadcn add`, cambiar su import de `cn`. Si se crea un token nuevo de `--text-*` o `--shadow-*`, añadirlo también en `src/lib/utils.ts`.
- ESLint: la regla `react-refresh/only-export-components` está desactivada solo en `src/components/ui/` (los componentes de Shadcn exportan sus variantes).

## Estado actual

- Implementado (HU-03): tema completo en `src/index.css`; landing con inicio de sesión del admin (`/`); registro de empresa (`/registro`); panel con menú lateral oscuro (`src/app/panel-layout.tsx`, rutas anidadas bajo `/panel`) e Inicio (`src/app/home-page.tsx`: saludo y "Próximamente"; con la cuenta de pruebas, además el modo pruebas).
- Rutas en `src/app/router.tsx`: `SoloSinSesion` (landing y registro redirigen a `/panel` si hay token guardado) y `RutaProtegida` (`/panel`).
- Sesión: token en `localStorage` (`src/lib/session.ts`). `SesionProvider` (`src/features/auth/session-provider.tsx`) lo valida con `GET /auth/yo`: 401 → borra el token; sin conexión → mensaje con "Reintentar" sin borrar el token. Acceso con `useSesion()` (`session-context.ts`).
- Cliente: `peticion()` y `ErrorApi` en `src/lib/api-client.ts` (URL de `VITE_API_URL`, ver `.env.example`).
- Formularios: react-hook-form en modo `onTouched` (errores al salir del campo) con esquemas zod en `features/auth/validation.ts`, que replican las reglas del backend. El formulario de registro tiene la misma forma que el cuerpo de la API, así que los `campo` de un 422 se asignan con `setError` tal cual.
- Componentes propios compartidos en `src/components/` (`Logo`, `AvisoError`, `CampoContrasenia`); los de Shadcn en `src/components/ui/` (`select.tsx` con el tema aplicado). Formatos de números y fechas en `src/lib/format.ts` (es-BO, NBSP entre número y unidad) y calificación del DriveScore con sus colores en `src/lib/score.ts`.
- Prueba en el navegador: backend en `127.0.0.1:8000` + `npx vite --port 5173 --strictPort`.
- Producción: `Dockerfile` multi-stage (build con Node 24, `VITE_API_URL` como build arg obligatorio; se sirve con Caddy según `deploy/Caddyfile`, con fallback de SPA y caché larga para `assets/`). La imagen la construye el `deploy/docker-compose.yml` del backend; ver su `docs/despliegue.md`.
- `npm run lint` también revisa `.kilo/worktrees/` si existe (copias de otra herramienta, con errores ajenos): para revisar solo el panel, `npx eslint . --ignore-pattern ".kilo/**"`.

## Modo pruebas (temporal)

Herramienta para ver los viajes reales de los testers antes del despliegue. **No es parte del producto: se retira cuando exista el panel empresarial.** Todo está en `src/features/pruebas/` y usa los endpoints `/pruebas/*` del backend (ver su CLAUDE.md).
- Acceso: `AccesoPruebasProvider` (en `/panel`, `router.tsx`) consulta `GET /pruebas/acceso` una vez; `useAccesoPruebas()` da `null` (comprobando), `true` o `false` (403/404 u otro error). `RutaPruebas` manda a `/panel` sin acceso. Solo la cuenta configurada en `PRUEBAS_CORREO` del backend lo tiene; en el menú se muestra como "Superadmin".
- Inicio: `SeccionPruebasInicio` (KPIs, banner y últimos 4 viajes) con un selector de periodo (Hoy, 7 días, 30 días, Todo = medianoche local de hace 0/6/29 días, `period.ts`).
- `/panel/pruebas` (`pages/trips-page.tsx`): pestañas Viajes / Testers, KPIs, filtros en la URL (`vista`, `periodo`, `tester`, `eventos`, `pagina`), tabla paginada (20 por página) y "Exportar CSV" (`descargarCsv`, fetch con Bearer porque `peticion` espera JSON).
- `/panel/pruebas/viajes/:id` (`pages/trip-detail-page.tsx`, carga diferida con `lazy` porque trae Leaflet): métricas, mapa (`MapaViaje`; los colores van como clases en los trazos SVG), eventos con Correcto / Falso (actualización optimista, se revierte si falla; pulsar la marca puesta la quita), desglose y eventos por tipo. "Volver a viajes" conserva los filtros (`state.volver`).
- Datos con `useConsulta(clave, fn)` (`use-query.ts`): recarga al cambiar la clave, conserva los datos anteriores mientras carga y un 401 cierra la sesión.
- `LIMITE_VELOCIDAD_KMH` (`constants.ts`) copia el límite fijo de la app: si cambia allá, cambiarlo aquí.
- **Para retirarlo:** borrar `src/features/pruebas/`; en `router.tsx` quitar `AccesoPruebasProvider` y las rutas `pruebas*`; en `panel-layout.tsx` el grupo "Herramientas" y el rol "Superadmin"; en `home-page.tsx` el selector y `SeccionPruebasInicio`; la sección 8.7 de `docs/diseno.md`; desinstalar `leaflet`, `react-leaflet` y `@types/leaflet` si nadie más los usa; y esta sección.

## API (drivesense-backend)

- URL base desde `VITE_API_URL` (por defecto `http://127.0.0.1:8000` en desarrollo) + `/api/v1`. JWT en el header `Authorization: Bearer <token>`.
- El CORS del backend permite **solo** `http://localhost:5173`. Si ese puerto está ocupado, Vite arranca en el 5174 y las peticiones fallan por CORS: hay que liberar el puerto o añadir el origen a `CORS_ORIGENES` en el `.env` del backend.
- Endpoints de la HU-03:
  - `POST /auth/empresa/registro`: cuerpo `{empresa: {nombre, tipo, email_contacto, telefono}, administrador: {nombre, email, telefono, contrasenia}}`. Responde 201 con `{access_token, token_type, usuario}`.
  - `POST /auth/empresa/login`: solo administradores. Un conductor recibe 403 "Esta cuenta es de conductor. Ingresa desde la app móvil".
  - `GET /auth/yo`: para el admin incluye `empresa: {id, nombre, tipo}`.
- Formato de errores:
  - 422: `{"detail": "Datos inválidos", "errores": [{"campo": "...", "mensaje": "..."}]}`. Los campos anidados llegan como `empresa.telefono` o `administrador.email`: se asignan al campo del formulario por su ruta completa.
  - 401, 403, 409: `{"detail": "mensaje en español"}`. Mostrar `detail` tal cual, sin inventar mensajes.
- El token dura 7 días y no hay refresh ni logout en el backend: cerrar sesión = borrar el token. Un 401 en un endpoint protegido significa sesión inválida o expirada.

## Estructura

```
src/
├── app/                → configuración general (rutas, proveedores)
├── components/         → componentes propios compartidos (Logo, AvisoError…)
├── components/ui/      → componentes de Shadcn (no editarlos salvo para aplicar el tema)
├── lib/                → utilidades compartidas (cliente HTTP, manejo de sesión)
└── features/<modulo>/  → páginas, componentes, llamadas a la API y tipos del módulo
```

- Módulos en español sin tildes: `auth`, `conductores`, `flotas`, `reportes`, `suscripciones` (y `pruebas`, temporal). **Crear cada módulo solo cuando se implemente su primera historia.**
- **Nombres:** archivos y carpetas en inglés y kebab-case, como Shadcn (`login-page.tsx`, `api-client.ts`). Componentes, variables, funciones y tipos en español (`LoginPagina`, `iniciarSesion`, `UsuarioAdmin`). Textos de la interfaz en español.

## Reglas

- **Nunca** colores, tamaños ni radios escritos directamente en los componentes (`bg-[#…]`, `text-[15px]`): todo sale de las variables CSS y de las clases de Tailwind definidas en `docs/diseno.md`. Un valor nuevo se agrega primero a la guía y luego a `src/index.css`.
- Solo modo claro por ahora, con las variables preparadas para el oscuro (`docs/diseno.md`, sección 9).
- Avanzar paso a paso: implementar solo lo que se pida, sin adelantar funcionalidades.
