# PANIK — Mi perro se está ahogando

Sistema de decisión táctica PANIK para atragantamiento y asfixia por
cuerpo extraño en perros. Misma arquitectura, navegación, componentes
y sistema visual del producto original "¿Mi perro comió algo?"
(panik-perro.vercel.app), con el contenido clínico reemplazado.

## Estructura del proyecto

```
client/
  index.html                  → entrypoint, fuentes (Playfair Display, Inter, JetBrains Mono)
  public/
    logo-panik.png            → logo PANIK (reemplaza si tienes una versión de mayor resolución)
  src/
    main.tsx                  → bootstrap de React
    App.tsx                   → monta <Home />
    index.css                 → Tailwind + estilos base (scrollbar, selección, focus)
    pages/
      Home.tsx                → TODA la app: gatekeeper, handbook (15 págs), modo interactivo
    data/
      handbook.ts              → contenido de las 15 páginas del manual
      directory.ts             → directorio de emergencias CENTRALIZADO (ver abajo)
    components/ui/
      button.tsx, card.tsx, input.tsx  → primitivos shadcn-style usados por Home.tsx
```

## Arquitectura conservada del original

- **Gatekeeper**: pantalla de acceso con código (`PANIK-2026`), persistido en
  `localStorage` bajo la clave `panik_authenticated`.
- **Modo Handbook** (revista editorial, 15 páginas, 8 tipos de página):
  `cover`, `editorial`, `data`, `semaphore`, `prevention`, `kit`, `scenario`
  (×5 escenarios), `semaphore_quick`, `directory`, `cta_page`, `closing`.
  Navegación: header sticky (logo + botón "GUÍA INTERACTIVA" + "BLOQUEAR"),
  footer con ANTERIOR/SIGUIENTE + dots de paginación clickeables.
- **Modo Interactivo** (triage de 5 pasos):
  1. ¿Respira ahora mismo? → si "No respira/inconsciente" → salto directo a ROJO
  2. ¿Qué tamaño es tu perro? (determina técnica de Heimlich)
  3. ¿Qué ves en este momento? (signo más grave)
  4. ¿Cuánto tiempo lleva así?
  5. ¿Tiene algo de esto también? (multi-select)
  Resultado: **ROJO = OBSTRUCCIÓN CRÍTICA**, **AMARILLO = OBSTRUCCIÓN PARCIAL**,
  **VERDE = EPISODIO RESUELTO** — cada uno con bloques "Qué hacer ahora",
  "Qué no hacer nunca" y guion dinámico para el veterinario.
  Incluye directorio de emergencia embebido y botón "Volver a empezar".

## Directorio de emergencias — localización centralizada

Edita **un solo archivo** para adaptar PANIK a otra ciudad o país:

`client/src/data/directory.ts`

```ts
export const EMERGENCY_DIRECTORY: DirectoryConfig = {
  region: "CDMX",          // se inserta automáticamente en títulos y botones
  contacts: [
    { name: "VetEmergencias (Lomas)", phone: "55 5540 0757", desc: "Atención crítica 24 horas." },
    // ... agrega, edita o elimina contactos aquí
  ]
};
```

Este archivo se importa tanto en `handbook.ts` (página 13, tipo `directory`)
como en `Home.tsx` (directorio embebido del modo interactivo) — no hay
duplicación de datos. El campo `phone` debe llevar el formato visible
(con espacios); el `href="tel:..."` se genera automáticamente removiendo
los espacios vía `toTelHref()`.

## Imágenes pendientes (placeholders)

El handbook referencia 7 imágenes de fondo que aún no están incluidas en
`client/public/`. Mientras no existan, esas secciones se renderizan sin
imagen (el layout asimétrico se ajusta automáticamente, sin romperse):

- `/dog-choking-closeup.png` — portada (página 1)
- `/panik_emergency_kit_choking.png` — kit de preparación (página 6)
- `/panik_scenario_bone.png` — Escenario 01: Hueso atorado
- `/panik_scenario_ball.png` — Escenario 02: Pelota/Juguete
- `/panik_scenario_stick.png` — Escenario 03: Palo astillado
- `/panik_scenario_sharp.png` — Escenario 04: Objeto punzante
- `/panik_scenario_leash.png` — Escenario 05: Correa/Collar
- `/panik_phone_emergency.png` — directorio (página 13)

Agrega los archivos con esos nombres exactos a `client/public/` para que
aparezcan automáticamente (mismo tratamiento visual grayscale/contraste
que el resto del sistema, vía clases Tailwind ya definidas).

## Desarrollo local

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Despliegue en Vercel

1. Sube este repo a GitHub.
2. Importa el repo en Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build` · Output directory: `dist`
   (ya configurado en `vite.config.ts`).
5. Deploy.

## Notas

- Código de acceso del gatekeeper: `PANIK-2026` (editable en `Home.tsx`,
  función `handleAccessSubmit`).
- Cero `border-radius` en toda la interfaz (`rounded-none`) — estética
  táctica/operativa intencional, igual que el original.
- Tipografías: Playfair Display (serif, títulos), Inter (sans, cuerpo),
  JetBrains Mono (numeración, teléfonos).
